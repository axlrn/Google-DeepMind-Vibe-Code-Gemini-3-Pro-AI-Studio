
import React, { useState, useRef } from 'react';
import { analyzeIdentity } from './services/geminiService';
import { AnalysisState } from './types';
import ProfileCard from './components/ProfileCard';
import AppDescription from './components/AppDescription';
import { translations, Language } from './services/i18n';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [consent, setConsent] = useState<boolean>(false);
  const [lang, setLang] = useState<Language>('en');
  const [state, setState] = useState<AnalysisState>({
    isLoading: false,
    error: null,
    result: null,
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
      // Reset result on new file
      setState(prev => ({ ...prev, result: null, error: null }));
    }
  };

  const handleProcess = async () => {
    if (!file) return;

    setState({ isLoading: true, error: null, result: null });

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const mimeType = file.type;

        try {
          const result = await analyzeIdentity(base64String, mimeType, consent, lang);
          setState({ isLoading: false, error: null, result });
        } catch (err: any) {
          setState({ isLoading: false, error: err.message || "Failed to analyze", result: null });
        }
      };
      reader.onerror = () => {
         setState({ isLoading: false, error: "Error reading file", result: null });
      }

    } catch (error: any) {
      setState({ isLoading: false, error: error.message, result: null });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-brand-500/30 selection:text-brand-200">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-blue-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              {t.appTitle}<span className="text-brand-400">ID</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Language Selector Component */}
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-2 py-1.5 border border-slate-700/50 focus-within:border-brand-500/50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as Language)}
                className="bg-transparent text-slate-300 text-xs font-medium outline-none cursor-pointer appearance-none hover:text-white"
              >
                <option value="en" className="bg-slate-800">English</option>
                <option value="pt" className="bg-slate-800">Português</option>
                <option value="es" className="bg-slate-800">Español</option>
                <option value="fr" className="bg-slate-800">Français</option>
              </select>
            </div>

            <div className="text-xs font-mono text-slate-500 hidden md:flex items-center gap-2 border-l border-slate-800 pl-4">
               <span>{t.systemStatus}</span>
               <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
               </span>
               <span className="text-brand-400 font-bold">{t.online}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 space-y-12">
        
        {/* Intro */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-500">
            {t.heroTitle}
          </h2>
          <p className="text-slate-400 text-lg">
            {t.heroDesc}
          </p>

          <AppDescription lang={lang} />
        </section>

        {/* Input Area */}
        <section className="grid md:grid-cols-2 gap-8 items-start">
          
          <div className="space-y-6">
            {/* Upload Box */}
            <div 
              className={`relative group border-2 border-dashed rounded-2xl p-8 transition-all duration-300 text-center cursor-pointer 
                ${imagePreview ? 'border-brand-500/50 bg-slate-900/50' : 'border-slate-700 hover:border-brand-400 hover:bg-slate-800/50'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/png, image/jpeg, image/webp"
              />
              
              {imagePreview ? (
                <div className="relative overflow-hidden rounded-lg shadow-2xl">
                   <img src={imagePreview} alt="Preview" className="w-full object-contain max-h-64" />
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-slate-900/80 text-white px-4 py-2 rounded-full text-sm font-medium">{t.uploadChange}</span>
                   </div>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center gap-4 text-slate-500 group-hover:text-brand-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-lg text-slate-300">{t.uploadClick}</p>
                    <p className="text-sm">{t.uploadFormats}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg space-y-5">
              
              {/* Consent */}
              <label className="flex items-start gap-3 cursor-pointer group pt-2">
                <div className="relative flex items-center mt-0.5">
                  <input 
                    type="checkbox" 
                    checked={consent} 
                    onChange={e => setConsent(e.target.checked)}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-600 bg-slate-800 transition-all checked:border-brand-500 checked:bg-brand-500"
                  />
                  <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                   <span className="block text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                     {t.consentTitle}
                   </span>
                   <p className="text-xs text-slate-500 mt-1">
                     {t.consentText}
                   </p>
                </div>
              </label>

              {/* Disclaimer PoC moved here */}
               <div className="text-[10px] text-slate-500 leading-relaxed bg-slate-950/30 p-3 rounded border border-slate-800/50">
                  {t.disclaimer_poc}{' '}
                  <a 
                    href="https://github.com/axlrn/Google-DeepMind-Vibe-Code-Gemini-3-Pro-AI-Studio/tree/main/images"
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-500/80 hover:text-brand-400 underline decoration-brand-500/30 transition-colors ml-1"
                  >
                    GitHub Dataset
                  </a>
               </div>

              <button
                onClick={handleProcess}
                disabled={!file || state.isLoading}
                className={`w-full py-3.5 rounded-lg font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-lg
                  ${!file || state.isLoading
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-brand-500/25 hover:shadow-brand-500/40 active:scale-[0.98]'
                  }
                `}
              >
                {state.isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t.btnProcessing}
                  </span>
                ) : t.btnRun}
              </button>
            </div>
          </div>

          {/* Result Area */}
          <div className="space-y-6">
            
            {state.error && (
              <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-xl flex items-start gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
                 <div>
                   <h3 className="font-bold">{t.errorTitle}</h3>
                   <p className="text-sm opacity-80">{state.error}</p>
                 </div>
              </div>
            )}

            {!state.result && !state.isLoading && !state.error && (
              <div className="h-full min-h-[300px] border-2 border-dashed border-slate-800 rounded-2xl flex items-center justify-center text-slate-600 bg-slate-900/20">
                <div className="text-center">
                  <p className="mb-2 text-xl font-mono">{t.waitingTitle}</p>
                  <p className="text-sm max-w-xs mx-auto">{t.waitingDesc}</p>
                </div>
              </div>
            )}

            {state.result && (
              <div className="animate-fade-in-up space-y-6">
                <ProfileCard data={state.result} imagePreview={imagePreview} lang={lang} />
                {/* JSON View Removed per request */}
              </div>
            )}
          </div>

        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-slate-600 text-sm">
        <p className="mb-4">{t.footer}</p>
      </footer>

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default App;
