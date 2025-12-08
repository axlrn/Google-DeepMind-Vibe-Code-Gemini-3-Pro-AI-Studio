
import React from 'react';
import { VibeIDResponse } from '../types';
import { translations, Language } from '../services/i18n';

interface ProfileCardProps {
  data: VibeIDResponse;
  imagePreview: string | null;
  lang: Language;
}

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

  return (
    <div className={`bg-slate-800 rounded-xl border-2 ${borderColor} ${shadowColor} p-6 max-w-2xl w-full mx-auto transition-all duration-500`}>
      
      {/* Task 3: Validated Identity Highlight Card */}
      {data.validated_name && (
        <div className="mb-8 bg-gradient-to-br from-slate-900 to-slate-900/50 rounded-xl border border-brand-500/30 p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
             <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></div>
             <h3 className="text-brand-400 font-bold uppercase tracking-widest text-xs">{t.valIdentity}</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 relative z-10">
            <div>
               <p className="text-3xl text-white font-bold tracking-tight">{data.validated_name}</p>
               <div className="flex flex-col gap-1 mt-3 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>{data.validated_country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span className="font-mono text-brand-300">{data.validated_email}</span>
                  </div>
               </div>
            </div>
            
            <div className="flex flex-col justify-center bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
               <div className="flex items-end justify-between mb-2">
                  <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">{t.confScore}</span>
                  <span className="text-2xl font-mono font-bold text-brand-400">{data.final_confidence_score}%</span>
               </div>
               <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mb-3">
                   <div 
                     className={`h-full transition-all duration-1000 ${
                       (data.final_confidence_score || 0) > 80 ? 'bg-brand-500' : 
                       (data.final_confidence_score || 0) > 60 ? 'bg-yellow-500' : 'bg-red-500'
                     }`}
                     style={{ width: `${data.final_confidence_score || 0}%` }}
                   ></div>
               </div>
               <p className="text-xs text-slate-400 italic leading-relaxed">
                 "{data.reasoning_explanation}"
               </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column: Image & Status */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-slate-700 shadow-xl bg-slate-900">
            {imagePreview ? (
              <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">{t.noImg}</div>
            )}
          </div>
          
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
            isSuccess ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' : 
            isPending ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
            'bg-red-500/20 text-red-300 border border-red-500/30'
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
                  {data.info_checagem_simulada?.status_fiscal || "N/A"}
               </span>
             </div>
             <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
               <p className="text-slate-500 text-xs uppercase mb-1">{t.statOccupation}</p>
               <span className="text-slate-200 text-xs truncate block">
                 {data.info_checagem_simulada?.ocupacao || "N/A"}
               </span>
             </div>
          </div>

          <div className="bg-slate-700/30 p-4 rounded-lg border-l-4 border-slate-600 italic text-slate-400 text-sm">
            {t.summary}: "{data.resumo_perfil}"
          </div>
          
          {data.razao_falha && (
             <div className="text-red-400 text-xs bg-red-900/20 p-2 rounded border border-red-900/50">
               {t.errorLabel}: {data.razao_falha}
             </div>
          )}
        </div>
      </div>

      {/* Task 2.2 Table Visualization */}
      {data.tabela_fontes && data.tabela_fontes.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-700 animate-fade-in-up">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {t.digitalFootprint}
          </h3>
          <div className="overflow-x-auto rounded-lg border border-slate-700">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-slate-400 uppercase font-mono">
                <tr>
                  <th className="px-4 py-3">{t.tblPlatform}</th>
                  <th className="px-4 py-3">{t.tblEmail}</th>
                  <th className="px-4 py-3">{t.tblLocality}</th>
                  <th className="px-4 py-3">{t.tblConfidence}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700 bg-slate-900/40">
                {data.tabela_fontes.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">
                      <div className="flex flex-col">
                        <span>{item.plataforma}</span>
                        <a href={`https://${item.url_perfil}`} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-brand-400 truncate max-w-[150px] text-[10px]">
                          {item.url_perfil}
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono">{item.email_encontrado || "N/A"}</td>
                    <td className="px-4 py-3 text-slate-300">{item.pais_encontrado || "N/A"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-500/10 text-green-400 border border-green-500/20">
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
