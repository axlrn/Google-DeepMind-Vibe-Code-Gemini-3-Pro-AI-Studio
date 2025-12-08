
import React from 'react';
import { VibeIDResponse } from '../types';
import { translations, Language } from '../services/i18n';

interface ProfileCardProps {
  data: VibeIDResponse;
  imagePreview: string | null;
  lang: Language;
}

// Helper for Country Translation
const translateCountry = (country: string | null | undefined, lang: Language): string => {
  if (!country) return "";
  
  const normalized = country.toLowerCase().trim();
  
  // Dictionary of known mock countries
  const map: Record<string, Record<Language, string>> = {
    "brasil": { en: "Brazil", pt: "Brasil", es: "Brasil", fr: "Brésil" },
    "brazil": { en: "Brazil", pt: "Brasil", es: "Brasil", fr: "Brésil" },
    "eua": { en: "USA", pt: "EUA", es: "EE. UU.", fr: "États-Unis" },
    "usa": { en: "USA", pt: "EUA", es: "EE. UU.", fr: "États-Unis" },
    "estados unidos": { en: "USA", pt: "EUA", es: "EE. UU.", fr: "États-Unis" },
    "frança": { en: "France", pt: "França", es: "Francia", fr: "France" },
    "france": { en: "France", pt: "França", es: "Francia", fr: "France" },
    "portugal": { en: "Portugal", pt: "Portugal", es: "Portugal", fr: "Portugal" }
  };

  // Check for exact match or simple substring inclusion (e.g. "Brasil (Origem)")
  const key = Object.keys(map).find(k => normalized.includes(k));
  
  if (key) {
    return map[key][lang];
  }
  
  return country; // Fallback to original if not found
};

const ProfileCard: React.FC<ProfileCardProps> = ({ data, imagePreview, lang }) => {
  const t = translations[lang];
  const isSuccess = data.status_validacao === 'SUCESSO';
  const isPending = data.status_validacao === 'PENDENTE_CONSENTIMENTO';
  
  let borderColor = 'border-slate-600';
  let shadowColor = 'shadow-none';
  
  if (isSuccess) {
    borderColor = 'border-brand-500';
    shadowColor = 'shadow-[0_0_20px_rgba(20,184,166,0.3)]';
  } else if (!isPending) {
    borderColor = 'border-red-500';
  }

  // Circular Progress Logic
  const score = data.final_confidence_score || 0;
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  let progressColor = 'text-red-500';
  if (score > 80) progressColor = 'text-brand-500';
  else if (score > 60) progressColor = 'text-yellow-500';

  // Helper to translate values (Status/Occupation)
  const getTranslatedValue = (type: 'status' | 'occupation', value: string | undefined | null) => {
    if (!value || value === 'N/A') return t.val_na;
    
    if (type === 'status') {
      if (value.toUpperCase() === 'REGULAR') return t.status_regular;
      return value;
    }
    
    if (type === 'occupation') {
      if (value === 'Desconhecida' || value === 'Unknown') return t.val_unknown;
      return value;
    }
    
    return value;
  };

  return (
    <div className={`bg-slate-800 rounded-xl border-2 ${borderColor} ${shadowColor} p-6 max-w-2xl w-full mx-auto transition-all duration-500`}>
      
      {/* Task 3: Validated Identity Highlight Card */}
      {data.validated_name && (
        <div className="mb-8 bg-gradient-to-br from-slate-900 to-slate-900/50 rounded-xl border border-brand-500/30 p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <div className="flex items-center gap-2 mb-6">
             <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></div>
             <h3 className="text-brand-400 font-bold uppercase tracking-widest text-xs">{t.valIdentity}</h3>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex-1">
               <p className="text-3xl md:text-4xl text-white font-bold tracking-tight leading-none mb-3">{data.validated_name}</p>
               
               <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                  <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{translateCountry(data.validated_country, lang)}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span className="font-mono text-brand-300 truncate max-w-[200px]">{data.validated_email}</span>
                  </div>
               </div>
            </div>
            
            {/* Circular Confidence Indicator */}
            <div className="flex flex-col items-center justify-center bg-slate-800/80 rounded-xl p-4 border border-slate-700 shadow-lg backdrop-blur-sm">
               <div className="relative w-16 h-16 mb-2">
                 <svg className="w-full h-full transform -rotate-90">
                   <circle
                     cx="50%"
                     cy="50%"
                     r={radius}
                     stroke="currentColor"
                     strokeWidth="6"
                     fill="transparent"
                     className="text-slate-700"
                   />
                   <circle
                     cx="50%"
                     cy="50%"
                     r={radius}
                     stroke="currentColor"
                     strokeWidth="6"
                     fill="transparent"
                     strokeDasharray={circumference}
                     strokeDashoffset={strokeDashoffset}
                     className={`${progressColor} transition-all duration-1000 ease-out`}
                     strokeLinecap="round"
                   />
                 </svg>
                 <div className="absolute inset-0 flex items-center justify-center">
                   <span className={`text-lg font-bold ${progressColor}`}>{score}%</span>
                 </div>
               </div>
               <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider text-center max-w-[80px] leading-tight">{t.confScore}</span>
            </div>
          </div>
          
          {/* Reasoning Blockquote */}
          <div className="mt-6 relative">
             <div className="absolute -left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-500 to-transparent rounded-full opacity-50"></div>
             <blockquote className="pl-4 py-1">
               <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wider block mb-1">{t.aiReasoning}</span>
               <p className="text-sm text-slate-300 italic leading-relaxed">
                 "{data.reasoning_explanation}"
               </p>
             </blockquote>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column: Image & Status */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-slate-700 shadow-xl bg-slate-900 group">
            {imagePreview ? (
              <img src={imagePreview} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs text-center p-2">{t.noImg}</div>
            )}
            
            {/* Status Badge Overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm p-1 text-center">
                 <div className={`w-2 h-2 rounded-full mx-auto ${isSuccess ? 'bg-brand-500' : 'bg-red-500'}`}></div>
            </div>
          </div>
          
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-center border ${
            isSuccess ? 'bg-brand-500/10 text-brand-400 border-brand-500/20' : 
            isPending ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
            'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            {data.status_validacao.replace('_', ' ')}
          </div>
        </div>

        {/* Right Column: Other Data (Legacy/Summary) */}
        <div className="flex-1 space-y-4">
          
          <div className="grid grid-cols-2 gap-4 text-sm">
             <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
               <p className="text-slate-500 text-xs uppercase mb-1">{t.statFiscal}</p>
               <span className={`text-xs font-bold ${data.info_checagem_simulada?.status_fiscal === 'REGULAR' ? 'text-green-400' : 'text-yellow-400'}`}>
                  {getTranslatedValue('status', data.info_checagem_simulada?.status_fiscal)}
               </span>
             </div>
             <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
               <p className="text-slate-500 text-xs uppercase mb-1">{t.statOccupation}</p>
               <span className="text-slate-200 text-xs truncate block">
                 {getTranslatedValue('occupation', data.info_checagem_simulada?.ocupacao)}
               </span>
             </div>
          </div>

          <div className="bg-slate-700/30 p-4 rounded-lg border-l-4 border-slate-600 italic text-slate-400 text-sm">
            <span className="not-italic font-bold text-slate-500 block mb-1 text-xs uppercase">{t.summary}:</span>
            "{data.resumo_perfil}"
          </div>
          
          {data.razao_falha && (
             <div className="text-red-400 text-xs bg-red-900/20 p-2 rounded border border-red-900/50 flex gap-2 items-center">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
               </svg>
               {t.errorLabel}: {data.razao_falha}
             </div>
          )}
        </div>
      </div>

      {/* Task 2.2 Table Visualization */}
      {data.tabela_fontes && data.tabela_fontes.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-700 animate-fade-in-up">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t.digitalFootprint}
          </h3>
          <div className="overflow-x-auto rounded-lg border border-slate-700 shadow-inner">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-slate-400 uppercase font-mono">
                <tr>
                  <th className="px-4 py-3">{t.tblPlatform}</th>
                  <th className="px-4 py-3">{t.tblEmail}</th>
                  <th className="px-4 py-3">{t.tblLocality}</th>
                  <th className="px-4 py-3 text-right">{t.tblConfidence}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700 bg-slate-900/40">
                {data.tabela_fontes.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-white border-l-2 border-transparent hover:border-brand-500">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-200">{item.plataforma}</span>
                        <a href={`https://${item.url_perfil}`} target="_blank" rel="noreferrer" className="text-brand-500/60 hover:text-brand-400 truncate max-w-[120px] text-[10px] mt-0.5">
                          {item.url_perfil}
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono">{item.email_encontrado || "-"}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {item.pais_encontrado ? (
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                          {translateCountry(item.pais_encontrado, lang)}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-brand-400 border border-brand-500/20">
                        {item.grau_correspondencia}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
