import PptxGenJS from "pptxgenjs";
import { ReportData } from "../types";

// Colors
const COLOR_BLACK = "000000";
const COLOR_WHITE = "FFFFFF";
const COLOR_RED = "FF0055"; // Firework-ish Red
const COLOR_GREY_BG = "F3F4F6";
const COLOR_BLUE_ACCENT = "3B82F6";

export const generatePPTX = (data: ReportData, customerName: string) => {
  const pres = new PptxGenJS();

  // Layout
  pres.layout = "LAYOUT_16x9";
  pres.author = "Marketing AI Tool";
  pres.company = customerName;
  pres.title = `${customerName} Marketing Report`;

  // --- Slide 1: Cover ---
  const slide1 = pres.addSlide();
  slide1.background = { color: COLOR_BLACK };
  
  // Logo Placeholder (Firework)
  slide1.addText("Firework", {
      x: 0.5, y: 0.5, fontSize: 24, color: COLOR_WHITE, bold: true, fontFace: "Arial"
  });

  slide1.addText(`${customerName} 御中`, {
    x: 1, y: 2.5, w: '80%', h: 1,
    fontSize: 32, bold: true, color: COLOR_WHITE, align: "left", fontFace: "Meiryo"
  });
  
  slide1.addText("定例ミーティングレポート", {
    x: 1, y: 3.5, w: '80%', h: 1,
    fontSize: 24, color: COLOR_WHITE, align: "left", fontFace: "Meiryo"
  });

  slide1.addText(new Date().toLocaleDateString("ja-JP"), {
    x: 1, y: 6.5, w: '30%', h: 0.5,
    fontSize: 18, color: COLOR_WHITE, align: "left", fontFace: "Meiryo"
  });

  // --- Helper for Content Slides ---
  const addContentSlide = (title: string, insight?: string) => {
      const slide = pres.addSlide();
      slide.background = { color: COLOR_WHITE };
      
      // Black Header Bar
      slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.8, fill: { color: COLOR_BLACK } });
      slide.addText(title, { x: 0.5, y: 0.1, w: '90%', h: 0.6, fontSize: 20, color: COLOR_WHITE, bold: true, fontFace: "Meiryo" });

      // Insight Box
      if (insight) {
          slide.addText(`● ${insight}`, {
              x: 0.5, y: 1.0, w: '90%', h: 0.8,
              fontSize: 14, color: COLOR_BLACK, fontFace: "Meiryo", valign: "top", bullet: true
          });
      }
      return slide;
  };

  // --- Slide 4: Summary (Table) ---
  const slide4 = addContentSlide(data.slide_4_summary.title || "視聴データサマリ", data.slide_4_summary.insight);

  const headerRow4 = [{ text: "項目", options: { fill: COLOR_BLACK, color: COLOR_WHITE, bold: true } }, ...data.slide_4_summary.headers.map(h => ({ text: h, options: { fill: COLOR_BLACK, color: COLOR_WHITE, bold: true } }))];
  const rows4: any[] = [headerRow4];

  data.slide_4_summary.metrics.forEach(metric => {
      const rowData = [{ text: metric.label, options: { fill: "F1F5F9", bold: true } }, ...metric.values.map(v => v.toString())];
      rows4.push(rowData);
  });

  slide4.addTable(rows4, {
      x: 0.5, y: 2.0, w: 9,
      border: { type: "solid", color: "E2E8F0" },
      fontSize: 12,
      rowH: 0.6,
      align: "center",
      valign: "middle",
      fontFace: "Meiryo"
  });

  // --- Slide 5: Page Ranking ---
  const slide5 = addContentSlide("ページ別 視聴回数", data.slide_5_page_ranking.insight);

  const rows5: any[] = [
      [
          { text: "Rank", options: { fill: COLOR_BLACK, color: COLOR_WHITE } }, 
          { text: "ページURL", options: { fill: COLOR_BLACK, color: COLOR_WHITE } }, 
          { text: "視聴数", options: { fill: COLOR_BLACK, color: COLOR_WHITE } }
      ]
  ];
  data.slide_5_page_ranking.ranking.forEach(item => {
      rows5.push([item.rank, item.url, item.views.toLocaleString()]);
  });

  slide5.addTable(rows5, {
    x: 0.5, y: 2.0, w: 9,
    border: { type: "solid", color: "CBD5E1" },
    fontSize: 11,
    rowH: 0.5,
    colW: [0.8, 6.2, 2],
    fontFace: "Meiryo"
  });

  // --- Slide 7: Video Ranking ---
  const slide7 = addContentSlide("動画別 視聴回数", data.slide_7_video_ranking.insight);

  const rows7: any[] = [
    [
        { text: "Rank", options: { fill: COLOR_BLACK, color: COLOR_WHITE } }, 
        { text: "動画タイトル", options: { fill: COLOR_BLACK, color: COLOR_WHITE } }, 
        { text: "視聴数", options: { fill: COLOR_BLACK, color: COLOR_WHITE } }
    ]
  ];
  data.slide_7_video_ranking.ranking.forEach(item => {
    rows7.push([item.rank, item.title, item.views.toLocaleString()]);
  });

  slide7.addTable(rows7, {
    x: 0.5, y: 2.0, w: 9,
    border: { type: "solid", color: "CBD5E1" },
    fontSize: 11,
    rowH: 0.5,
    colW: [0.8, 6.2, 2],
    fontFace: "Meiryo"
  });

  // --- Slide 10: Engagement ---
  const slide10 = addContentSlide("エンゲージメント数値比較", data.slide_10_engagement.insight);

  // Big Multipliers
  slide10.addText("平均セッション時間", { x: 1, y: 2.0, fontSize: 14, color: "475569", fontFace: "Meiryo" });
  slide10.addText(`${data.slide_10_engagement.metrics.avg_session_duration_multiplier}倍`, { x: 3, y: 1.8, fontSize: 32, bold: true, color: COLOR_RED, fontFace: "Meiryo" });

  slide10.addText("ユーザーあたりPV", { x: 1, y: 2.6, fontSize: 14, color: "475569", fontFace: "Meiryo" });
  slide10.addText(`${data.slide_10_engagement.metrics.pv_per_user_multiplier}倍`, { x: 3, y: 2.4, fontSize: 32, bold: true, color: COLOR_RED, fontFace: "Meiryo" });

  // Comparison Table
  const rows10: any[] = [
      [
          { text: "指標", options: { fill: COLOR_BLACK, color: COLOR_WHITE } },
          { text: "動画視聴者", options: { fill: COLOR_BLACK, color: COLOR_WHITE } },
          { text: "動画未視聴者", options: { fill: COLOR_BLACK, color: COLOR_WHITE } },
          { text: "倍率", options: { fill: COLOR_BLACK, color: COLOR_WHITE } }
      ]
  ];

  data.slide_10_engagement.table_rows.forEach(row => {
      rows10.push([
          row.metric_name,
          row.viewer_value,
          row.non_viewer_value,
          { text: row.multiplier + "倍", options: { color: COLOR_RED, bold: true } }
      ]);
  });

  slide10.addTable(rows10, {
      x: 0.5, y: 3.5, w: 9,
      border: { type: "solid", color: "CBD5E1" },
      fontSize: 12,
      align: "center",
      valign: "middle",
      fontFace: "Meiryo"
  });

  // --- Slide 11: Conversion ---
  const slide11 = addContentSlide("コンバージョン数値比較", data.slide_11_conversion.insight);

  // Big Multiplier Main
  slide11.addText("予約完了率 (CVR)", { x: 1, y: 2.0, fontSize: 18, bold: true, color: "000000", fontFace: "Meiryo" });
  slide11.addText(`${data.slide_11_conversion.multiplier}倍`, { x: 4, y: 1.8, fontSize: 48, bold: true, color: COLOR_RED, fontFace: "Meiryo" });

  // Detailed Table
  const rows11: any[] = [
      [
          { text: "ユーザーセグメント", options: { fill: COLOR_BLACK, color: COLOR_WHITE } },
          { text: "総ユーザー数", options: { fill: COLOR_BLACK, color: COLOR_WHITE } },
          { text: "予約ユーザー", options: { fill: COLOR_BLACK, color: COLOR_WHITE } },
          { text: "CVR", options: { fill: COLOR_BLACK, color: COLOR_WHITE } }
      ],
      [
          "動画視聴者",
          data.slide_11_conversion.table_data.total_users_viewer.toLocaleString(),
          data.slide_11_conversion.table_data.cv_users_viewer.toLocaleString(),
          data.slide_11_conversion.viewer_cvr
      ],
      [
          "動画未視聴者",
          data.slide_11_conversion.table_data.total_users_non_viewer.toLocaleString(),
          data.slide_11_conversion.table_data.cv_users_non_viewer.toLocaleString(),
          data.slide_11_conversion.non_viewer_cvr
      ]
  ];

  // Add highlight row for multiplier
  rows11.push([
      { text: "", options: { fill: COLOR_WHITE } },
      { text: "", options: { fill: COLOR_WHITE } },
      { text: "", options: { fill: COLOR_WHITE } },
      { text: `${data.slide_11_conversion.multiplier}倍`, options: { color: COLOR_RED, bold: true, border: { pt: 2, color: COLOR_RED } } }
  ]);

  slide11.addTable(rows11, {
      x: 0.5, y: 3.5, w: 9,
      border: { type: "solid", color: "CBD5E1" },
      fontSize: 14,
      align: "center",
      valign: "middle",
      fontFace: "Meiryo",
      rowH: 0.8
  });

  // Save
  pres.writeFile({ fileName: `${customerName}_Report.pptx` });
};
