
import React from 'react';
import { translations, Language } from '../services/i18n';

interface AppDescriptionProps {
  lang: Language;
}

const AppDescription: React.FC<AppDescriptionProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <div className="mt-8 mx-auto max-w-3xl bg-slate-900/40 rounded-xl border border-slate-800/60 p-5 text-left backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3 border-b border-slate-800/50 pb-2">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
         </svg>
         <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
           {t.context_and_goal_title}
         </h3>
      </div>
      
      <div className="space-y-4 text-xs md:text-sm text-slate-400 leading-relaxed font-mono">
        <p className="text-justify opacity-90">
          {t.mission_statement}
        </p>
        
        <div className="relative pl-4 border-l-2 border-brand-500/30">
           <p className="italic text-slate-500">
             {t.project_parallel}
           </p>
        </div>
      </div>
    </div>
  );
};

export default AppDescription;
