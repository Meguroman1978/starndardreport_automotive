import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { ReportPreview } from './components/ReportPreview';
import { analyzeImages } from './services/geminiService';
import { generatePPTX } from './services/pptxService';
import { AppState, ReportData } from './types';
import { Loader2, FileOutput, Wand2, RefreshCw, Key, ShieldCheck } from 'lucide-react';

export default function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // API Key State
  const [apiKey, setApiKey] = useState<string>('');
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
        setApiKey(storedKey);
    }
  }, []);

  const handleSaveKey = (key: string) => {
      const trimmedKey = key.trim();
      setApiKey(trimmedKey);
      localStorage.setItem('gemini_api_key', trimmedKey);
      setShowKeyInput(false);
      setError(null); // Clear previous errors
  };

  const handleClearKey = () => {
      setApiKey('');
      localStorage.removeItem('gemini_api_key');
      setShowKeyInput(true);
  };

  const handleAnalyze = async () => {
    if (!apiKey) {
        setError("API Key is required to proceed.");
        setShowKeyInput(true);
        return;
    }
    if (files.length === 0 || !customerName.trim()) {
        setError("Please enter a customer name and upload files.");
        return;
    }
    setError(null);
    setState(AppState.ANALYZING);

    try {
      const data = await analyzeImages(files, customerName, apiKey);
      setReportData(data);
      setState(AppState.REVIEW);
    } catch (e: any) {
      console.error(e);
      const errorMessage = e.message || e.toString();
      setError(`Failed to analyze: ${errorMessage}`);
      
      // If unauthorized or bad request, likely a key issue
      if (errorMessage.includes("400") || errorMessage.includes("401") || errorMessage.includes("403") || errorMessage.includes("API key")) {
          setShowKeyInput(true); // Re-open input for user to fix
      }
      setState(AppState.IDLE);
    }
  };

  const handleDownload = () => {
    if (reportData && customerName) {
      generatePPTX(reportData, customerName);
    }
  };

  const handleReset = () => {
      setFiles([]);
      setCustomerName('');
      setReportData(null);
      setState(AppState.IDLE);
      setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
                <Wand2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-xl text-slate-800 tracking-tight">ReportGen AI</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {apiKey && (
                <button 
                    onClick={() => setShowKeyInput(!showKeyInput)}
                    className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 px-3 py-2 rounded hover:bg-slate-100 transition-colors"
                    title="Settings"
                >
                    <Key className="w-4 h-4" />
                </button>
            )}
            
            {state !== AppState.IDLE && (
                <button 
                    onClick={handleReset}
                    className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 px-3 py-2 rounded hover:bg-slate-100 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" /> Start Over
                </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Error Message */}
        {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex flex-col gap-1 animate-pulse">
                <div className="flex items-center gap-2 font-bold">
                    <span>Error Occurred</span>
                </div>
                <div className="text-sm break-all">{error}</div>
            </div>
        )}

        {/* API Key Input Section (Shows if no key or requested) */}
        {(!apiKey || showKeyInput) && (
            <div className="max-w-2xl mx-auto mb-8 animate-fade-in">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-50 rounded-full">
                            <ShieldCheck className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Configure API Key</h3>
                            <p className="text-sm text-slate-500">Your key is stored locally in your browser.</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Google AI Studio API Key</label>
                            <input 
                                type="password" 
                                placeholder="AIzaSy..."
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                defaultValue={apiKey}
                                onChange={(e) => setApiKey(e.target.value)} // Temporary local update for UX
                                onBlur={(e) => handleSaveKey(e.target.value)} // Save on blur
                            />
                            <p className="text-xs text-slate-400 mt-2">
                                Get your key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Google AI Studio</a>.
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            {apiKey && (
                                <button 
                                    onClick={handleClearKey}
                                    className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    Clear Key
                                </button>
                            )}
                            <button 
                                onClick={() => handleSaveKey(apiKey)}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                            >
                                Save & Continue
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Step 1: Input & Upload (Only visible if key is set and not editing it) */}
        {state === AppState.IDLE && apiKey && !showKeyInput && (
          <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
            <div className="text-center space-y-2 mb-10">
                <h2 className="text-3xl font-bold text-slate-900">Automate your Marketing Reports</h2>
                <p className="text-slate-500">Upload dashboard screenshots (GA4, Firework) and CSV data. <br/>Gemini will extract and format the data into a PowerPoint presentation.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Customer Name</label>
                    <input 
                        type="text" 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Acme Corp"
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Files (Images, PDF, Excel, CSV)</label>
                    <FileUpload files={files} setFiles={setFiles} />
                </div>

                <button 
                    onClick={handleAnalyze}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                    <Wand2 className="w-5 h-5" />
                    Analyze with Gemini
                </button>
            </div>
          </div>
        )}

        {/* Step 2: Loading */}
        {state === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
            <div className="relative">
                <div className="absolute inset-0 bg-indigo-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <Loader2 className="w-16 h-16 text-indigo-600 animate-spin relative z-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Analyzing Data...</h2>
            <p className="text-slate-500 max-w-md text-center">Gemini is processing your screenshots and datasets to calculate insights and multipliers.</p>
          </div>
        )}

        {/* Step 3: Review & Download */}
        {state === AppState.REVIEW && reportData && (
          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Report Preview</h2>
                    <p className="text-slate-500">Review the extracted data below.</p>
                </div>
                <button 
                    onClick={handleDownload}
                    className="py-3 px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-lg shadow-green-200 transition-all flex items-center gap-2"
                >
                    <FileOutput className="w-5 h-5" />
                    Download .pptx
                </button>
             </div>

             <ReportPreview data={reportData} />
          </div>
        )}
      </main>
    </div>
  );
}