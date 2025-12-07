import React from 'react';
import { ReportData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportPreviewProps {
  data: ReportData;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({ data }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Slide 4 Summary */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-2 border-l-4 border-black pl-3">{data.slide_4_summary.title}</h3>
        <p className="text-sm text-slate-600 mb-6 bg-slate-50 p-3 rounded">{data.slide_4_summary.insight}</p>
        
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-white uppercase bg-black">
                    <tr>
                        <th className="px-6 py-3">Item</th>
                        {data.slide_4_summary.headers.map((h, i) => <th key={i} className="px-6 py-3">{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {data.slide_4_summary.metrics.map((row, idx) => (
                        <tr key={idx} className="bg-white border-b hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-900">{row.label}</td>
                            {row.values.map((val, vIdx) => (
                                <td key={vIdx} className="px-6 py-4">{val}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* Slide 10 Engagement */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
         <h3 className="text-lg font-bold text-slate-800 mb-2 border-l-4 border-black pl-3">エンゲージメント (Engagement)</h3>
         <p className="text-sm text-slate-600 mb-6 bg-slate-50 p-3 rounded">{data.slide_10_engagement.insight}</p>
         
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-red-50 rounded-lg border border-red-100 text-center">
                <p className="text-xs text-red-600 font-bold uppercase">Duration</p>
                <p className="text-2xl font-black text-red-600">{data.slide_10_engagement.metrics.avg_session_duration_multiplier}x</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-100 text-center">
                <p className="text-xs text-red-600 font-bold uppercase">PV/User</p>
                <p className="text-2xl font-black text-red-600">{data.slide_10_engagement.metrics.pv_per_user_multiplier}x</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-100 text-center">
                <p className="text-xs text-red-600 font-bold uppercase">Return Rate</p>
                <p className="text-2xl font-black text-red-600">{data.slide_10_engagement.metrics.return_rate_multiplier}x</p>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-white uppercase bg-slate-800">
                    <tr>
                        <th className="px-6 py-3">Metric</th>
                        <th className="px-6 py-3">Viewer</th>
                        <th className="px-6 py-3">Non-Viewer</th>
                        <th className="px-6 py-3">Diff</th>
                    </tr>
                </thead>
                <tbody>
                    {data.slide_10_engagement.table_rows.map((row, i) => (
                        <tr key={i} className="border-b">
                            <td className="px-6 py-3 font-bold">{row.metric_name}</td>
                            <td className="px-6 py-3">{row.viewer_value}</td>
                            <td className="px-6 py-3">{row.non_viewer_value}</td>
                            <td className="px-6 py-3 text-red-600 font-bold">{row.multiplier}x</td>
                        </tr>
                    ))}
                </tbody>
            </table>
         </div>
      </div>

       {/* Slide 11 Conversion */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-2 border-l-4 border-black pl-3">コンバージョン (CV)</h3>
        <p className="text-sm text-slate-600 mb-6 bg-slate-50 p-3 rounded">{data.slide_11_conversion.insight}</p>
        
        <div className="flex items-center justify-center p-8 bg-slate-50 rounded-xl mb-6">
            <div className="text-center">
                <p className="text-slate-500 font-medium mb-1">CVR Improvement</p>
                <p className="text-6xl font-black text-red-600 tracking-tighter">{data.slide_11_conversion.multiplier}<span className="text-3xl ml-1">x</span></p>
                <div className="flex gap-8 mt-4 text-sm">
                    <div>
                        <span className="block text-slate-400">Viewer CVR</span>
                        <span className="font-bold text-slate-800">{data.slide_11_conversion.viewer_cvr}</span>
                    </div>
                    <div>
                        <span className="block text-slate-400">Non-Viewer CVR</span>
                        <span className="font-bold text-slate-800">{data.slide_11_conversion.non_viewer_cvr}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};