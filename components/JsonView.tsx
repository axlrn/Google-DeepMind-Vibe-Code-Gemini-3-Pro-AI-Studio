import React from 'react';

interface JsonViewProps {
  data: any;
}

const JsonView: React.FC<JsonViewProps> = ({ data }) => {
  return (
    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 font-mono text-xs md:text-sm overflow-x-auto shadow-inner">
      <div className="flex items-center justify-between mb-2">
         <span className="text-slate-400 font-bold uppercase tracking-wider">System Output.json</span>
         <div className="flex gap-1.5">
           <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
           <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div>
           <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
         </div>
      </div>
      <pre className="text-emerald-400">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default JsonView;