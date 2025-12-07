import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ReportData } from "../types";
import * as XLSX from "xlsx";

const SYSTEM_INSTRUCTION = `
You are a senior marketing data analyst.
Your goal is to generate a structured JSON report for a client presentation based on the provided Dashboard Screenshots and CSV/JSON/Excel Data files.

**Input Data Sources:**
1. **Images/PDFs**: Screenshots of Google Analytics 4, Firework management screens, and previous reports. Visual charts and tables.
2. **CSV/JSON/Excel/Text**: Raw data files containing precise user counts, segments (e.g., "25% Viewers", "Non-viewers"), and conversion events.

**Task:**
Analyze all inputs and extract/calculate the data required for the following JSON schema.
Prioritize structured data (CSV/JSON/Excel) for exact numbers (especially for Engagement and Conversion comparisons). Use images for trends, rankings, and visual insights.

**Slides to Populate:**
1. **slide_4_summary**: A monthly summary table. Typically includes "Uploads", "Views", "Avg Watch Time", "Clicks", "CTR".
2. **slide_5_page_ranking**: Top 5 Page URLs by views.
3. **slide_7_video_ranking**: Top Videos by title and views.
4. **slide_10_engagement**: Compare "Video Viewers" vs "Non-Viewers".
   - Metrics: Avg Session Duration, PV per User, Return Rate (Sessions/User), PV per Session.
   - Calculate the *Multiplier* (e.g., Viewers are 2.9x Non-Viewers).
   - Use the CSV/JSON data if available to calculate accurate multipliers.
5. **slide_11_conversion**: Compare "CVR" (Conversion Rate) between Viewers and Non-Viewers.
   - Calculate CVR = (Conversion Users / Total Users) * 100.
   - Calculate Multiplier.

**Insight Generation:**
For each section, provide a professional Japanese "Insight" (考察) summarizing the key finding (e.g., "Viewers have 9.1x higher CVR", "Short videos on the recruitment page are driving clicks").
`;

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    slide_4_summary: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        insight: { type: Type.STRING },
        headers: { type: Type.ARRAY, items: { type: Type.STRING } }, // Month names
        metrics: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              values: { type: Type.ARRAY, items: { type: Type.NUMBER } } // Or string if formatting needed
            }
          }
        },
      },
      required: ["title", "insight", "headers", "metrics"]
    },
    slide_5_page_ranking: {
      type: Type.OBJECT,
      properties: {
        insight: { type: Type.STRING },
        ranking: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              rank: { type: Type.NUMBER },
              url: { type: Type.STRING },
              views: { type: Type.NUMBER },
            }
          }
        }
      },
      required: ["insight", "ranking"]
    },
    slide_7_video_ranking: {
      type: Type.OBJECT,
      properties: {
        insight: { type: Type.STRING },
        ranking: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              rank: { type: Type.NUMBER },
              title: { type: Type.STRING },
              views: { type: Type.NUMBER },
            }
          }
        }
      },
      required: ["insight", "ranking"]
    },
    slide_10_engagement: {
      type: Type.OBJECT,
      properties: {
        insight: { type: Type.STRING },
        metrics: {
          type: Type.OBJECT,
          properties: {
            avg_session_duration_multiplier: { type: Type.STRING },
            pv_per_user_multiplier: { type: Type.STRING },
            return_rate_multiplier: { type: Type.STRING },
            session_pv_multiplier: { type: Type.STRING },
          }
        },
        table_rows: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    metric_name: { type: Type.STRING },
                    viewer_value: { type: Type.STRING },
                    non_viewer_value: { type: Type.STRING },
                    multiplier: { type: Type.STRING }
                }
            }
        }
      },
      required: ["insight", "metrics", "table_rows"]
    },
    slide_11_conversion: {
      type: Type.OBJECT,
      properties: {
        insight: { type: Type.STRING },
        viewer_cvr: { type: Type.STRING },
        non_viewer_cvr: { type: Type.STRING },
        multiplier: { type: Type.STRING },
        table_data: {
            type: Type.OBJECT,
            properties: {
                total_users_viewer: { type: Type.NUMBER },
                total_users_non_viewer: { type: Type.NUMBER },
                cv_users_viewer: { type: Type.NUMBER },
                cv_users_non_viewer: { type: Type.NUMBER },
            }
        }
      },
      required: ["insight", "viewer_cvr", "non_viewer_cvr", "multiplier", "table_data"]
    }
  },
  required: ["slide_4_summary", "slide_5_page_ranking", "slide_7_video_ranking", "slide_10_engagement", "slide_11_conversion"]
};

// Helper function to pause execution
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzeImages = async (
  files: File[],
  customerName: string,
  apiKey: string
): Promise<ReportData> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please provide a valid Google AI Studio API Key.");
  }

  // Ensure key is clean
  const cleanKey = apiKey.trim();
  const ai = new GoogleGenAI({ apiKey: cleanKey });
  
  const contentParts: any[] = [];

  // Process files
  for (const file of files) {
    if (file.type.startsWith('image/')) {
        const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const res = reader.result as string;
                resolve(res.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
        contentParts.push({
            inlineData: {
                data: base64Data,
                mimeType: file.type
            }
        });
    } else if (file.type === 'text/csv' || file.name.endsWith('.csv') || file.type === 'text/plain') {
        const textData = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsText(file);
        });
        contentParts.push({
            text: `[CSV Data: ${file.name}]\n${textData}`
        });
    } else if (file.type === 'application/json' || file.name.endsWith('.json')) {
        const textData = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsText(file);
        });
        contentParts.push({
            text: `[JSON Data: ${file.name}]\n${textData}`
        });
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const res = reader.result as string;
                resolve(res.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
        contentParts.push({
            inlineData: {
                data: base64Data,
                mimeType: 'application/pdf'
            }
        });
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.type.includes('spreadsheet') || file.type.includes('excel')) {
        // Handle Excel files
        const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
        
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        let excelTextData = "";
        
        // Read first 3 sheets to avoid token explosion if workbook is huge
        const sheetsToRead = workbook.SheetNames.slice(0, 3);
        
        sheetsToRead.forEach(sheetName => {
            const sheet = workbook.Sheets[sheetName];
            const csv = XLSX.utils.sheet_to_csv(sheet);
            excelTextData += `--- Sheet: ${sheetName} ---\n${csv}\n\n`;
        });

        contentParts.push({
            text: `[Excel Data: ${file.name}]\n${excelTextData}`
        });
    }
  }

  const prompt = `
    Analyze the provided images, PDFs, CSV, Excel, and JSON data for customer: "${customerName}".
    Generate the JSON report adhering to the schema.
    Ensure all insights are in Japanese.
    For Slide 10 and 11, strictly calculate multipliers based on the structured data (CSV/Excel/JSON) if provided.
  `;

  contentParts.push({ text: prompt });

  // Retry logic for 429 errors
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: {
          parts: contentParts,
        },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.1,
        },
      });

      if (response.text) {
        return JSON.parse(response.text) as ReportData;
      } else {
          throw new Error("No text response from Gemini");
      }

    } catch (error: any) {
      console.error(`Gemini Analysis Error (Attempt ${attempt + 1}):`, error);
      
      const errorMessage = error.message || error.toString();
      
      // Check for 429 Resource Exhausted
      if (errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("Quota exceeded")) {
        attempt++;
        if (attempt < maxRetries) {
          const waitTime = 5000 * attempt; // Wait 5s, then 10s, etc.
          console.log(`Quota exceeded. Retrying in ${waitTime}ms...`);
          await sleep(waitTime);
          continue;
        }
      }
      
      // If it's not a 429 or retries exhausted, throw the error
      throw error;
    }
  }
  
  throw new Error("Failed to analyze data after multiple retries due to quota limits.");
};