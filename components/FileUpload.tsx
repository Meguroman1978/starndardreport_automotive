import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon, FileText, FileJson, FileSpreadsheet } from 'lucide-react';

interface FileUploadProps {
  files: File[];
  setFiles: (files: File[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ files, setFiles }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const getFileIcon = (file: File) => {
    if (file.type.includes('image')) {
      return <ImageIcon className="w-5 h-5 text-indigo-500" />;
    }
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      return <FileJson className="w-5 h-5 text-amber-500" />;
    }
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.type.includes('spreadsheet') || file.type.includes('excel')) {
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    }
    return <FileText className="w-5 h-5 text-emerald-500" />;
  };

  const getFileBg = (file: File) => {
    if (file.type.includes('image')) return 'bg-indigo-50';
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) return 'bg-red-50';
    if (file.type === 'application/json' || file.name.endsWith('.json')) return 'bg-amber-50';
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.type.includes('spreadsheet') || file.type.includes('excel')) return 'bg-emerald-50';
    return 'bg-emerald-50';
  };

  return (
    <div className="w-full">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors bg-white"
      >
        <Upload className="w-10 h-10 text-slate-400 mb-3" />
        <p className="text-slate-600 font-medium">Click to upload files</p>
        <p className="text-slate-400 text-sm mt-1">Supports Images, CSV, PDF, JSON, Excel</p>
        <input 
          type="file" 
          multiple 
          accept="image/*,.csv,.txt,.pdf,.json,.xlsx,.xls" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          {files.map((file, idx) => (
            <div key={idx} className="relative group border border-slate-200 rounded-lg p-2 bg-white shadow-sm flex items-center gap-3">
              <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${getFileBg(file)}`}>
                {getFileIcon(file)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <button 
                onClick={() => removeFile(idx)}
                className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};