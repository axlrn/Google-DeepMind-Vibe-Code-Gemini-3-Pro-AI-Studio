
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
        
        {/* PoC Strict Usage Alert */}
        <div className="bg-amber-900/10 border border-amber-500/20 rounded p-3 flex gap-3 items-start">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
           </svg>
           <p className="text-amber-200/90 text-xs leading-relaxed">
              {t.poc_usage_instruction.split('[GitHub Dataset]').map((part, index, array) => (
                <React.Fragment key={index}>
                  {part}
                  {index < array.length - 1 && (
                    <a 
                      href="https://github.com/axlrn/Google-DeepMind-Vibe-Code-Gemini-3-Pro-AI-Studio/tree/main/images"
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-400 hover:text-amber-300 underline decoration-amber-500/50 transition-colors font-bold mx-1"
                    >
                      GitHub Dataset
                    </a>
                  )}
                </React.Fragment>
              ))}
           </p>
        </div>

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
