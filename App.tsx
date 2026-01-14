
import React, { useState, useEffect, useRef } from 'react';
import { Resolution, AspectRatio, GeneratedImage, AppState } from './types';
import { GeminiService } from './services/geminiService';
import Sidebar from './components/Sidebar';
import HistoryGallery from './components/HistoryGallery';
import ApiKeyBarrier from './components/ApiKeyBarrier';

const LOADING_MESSAGES = [
  "Igniting propulsion systems...",
  "Calculating warp trajectory...",
  "Scanning sector for cosmic anomalies...",
  "Synthesizing starlight data...",
  "Materializing high-resolution photons...",
  "Calibrating orbital sensors...",
  "Downloading spectral map...",
  "Finalizing atmospheric rendering..."
];

const UPSCALE_MESSAGES = [
  "Enhancing cosmic resolution...",
  "De-noising deep space signals...",
  "Reconstructing stellar textures...",
  "Injecting 4K photon density...",
  "Polishing nebula gradients...",
  "Deep-learning spectral upscale...",
  "Finalizing 4K hyper-render..."
];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    hasApiKey: false,
    isLoading: false,
    error: null,
    history: [],
    promptHistory: [],
    selectedImage: null,
    currentResolution: Resolution.TWO_K,
    currentAspectRatio: AspectRatio.SQUARE,
  });

  const [prompt, setPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [showPromptHistory, setShowPromptHistory] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkApiKey();
    const savedPrompts = localStorage.getItem('space-ai-prompt-history');
    if (savedPrompts) {
      try {
        setState(prev => ({ ...prev, promptHistory: JSON.parse(savedPrompts) }));
      } catch (e) {
        console.error("Failed to parse prompt history", e);
      }
    }
  }, []);

  // Handle loading message cycling and progress simulation
  useEffect(() => {
    let messageInterval: number;
    let progressInterval: number;
    const messages = isUpscaling ? UPSCALE_MESSAGES : LOADING_MESSAGES;

    if (state.isLoading) {
      setSimulatedProgress(0);
      setLoadingStep(0);

      messageInterval = window.setInterval(() => {
        setLoadingStep(prev => (prev + 1) % messages.length);
      }, 3000);

      progressInterval = window.setInterval(() => {
        setSimulatedProgress(prev => {
          if (prev < 90) return prev + Math.random() * (isUpscaling ? 2 : 5);
          return prev;
        });
      }, 500);
    } else {
      setSimulatedProgress(0);
    }

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [state.isLoading, isUpscaling]);

  const checkApiKey = async () => {
    // @ts-ignore
    if (typeof window.aistudio !== 'undefined') {
      // @ts-ignore
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setState(prev => ({ ...prev, hasApiKey: hasKey }));
    } else {
      setState(prev => ({ ...prev, hasApiKey: !!process.env.API_KEY }));
    }
  };

  const updatePromptHistory = (newPrompt: string) => {
    setState(prev => {
      const filtered = prev.promptHistory.filter(p => p !== newPrompt);
      const updated = [newPrompt, ...filtered].slice(0, 20);
      localStorage.setItem('space-ai-prompt-history', JSON.stringify(updated));
      return { ...prev, promptHistory: updated };
    });
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsUpscaling(false);
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const url = await GeminiService.generateImage(prompt, {
        resolution: state.currentResolution,
        aspectRatio: state.currentAspectRatio
      });

      const newImg: GeneratedImage = {
        id: Date.now().toString(),
        url,
        prompt,
        timestamp: Date.now(),
        resolution: state.currentResolution
      };

      updatePromptHistory(prompt);
      setState(prev => ({
        ...prev,
        isLoading: false,
        selectedImage: url,
        history: [newImg, ...prev.history]
      }));
      setPrompt('');
      setIsEditing(false);
      setShowPromptHistory(false);
    } catch (err: any) {
      if (err.message === "API_KEY_RESET_REQUIRED") {
        setState(prev => ({ ...prev, isLoading: false, hasApiKey: false, error: "Authentication expired. Please re-select your key." }));
      } else {
        setState(prev => ({ ...prev, isLoading: false, error: err.message || "Failed to launch generation." }));
      }
    }
  };

  const handleEdit = async () => {
    if (!prompt.trim() || !state.selectedImage) return;
    setIsUpscaling(false);
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const editedUrl = await GeminiService.editImage(state.selectedImage, prompt);
      
      const newImg: GeneratedImage = {
        id: `edit-${Date.now()}`,
        url: editedUrl,
        prompt: `Edited: ${prompt}`,
        timestamp: Date.now(),
        resolution: state.currentResolution
      };

      updatePromptHistory(prompt);
      setState(prev => ({
        ...prev,
        isLoading: false,
        selectedImage: editedUrl,
        history: [newImg, ...prev.history]
      }));
      setPrompt('');
      setShowPromptHistory(false);
    } catch (err: any) {
       if (err.message === "API_KEY_RESET_REQUIRED") {
        setState(prev => ({ ...prev, isLoading: false, hasApiKey: false }));
      } else {
        setState(prev => ({ ...prev, isLoading: false, error: err.message || "Edit failed." }));
      }
    }
  };

  const handleUpscale = async () => {
    if (!state.selectedImage) return;
    setIsUpscaling(true);
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    // Find prompt in history or use fallback
    const originalImage = state.history.find(img => img.url === state.selectedImage);
    const originalPrompt = originalImage?.prompt || "Cosmic scene";

    try {
      const upscaledUrl = await GeminiService.upscaleImage(state.selectedImage, originalPrompt);
      
      const newImg: GeneratedImage = {
        id: `upscale-${Date.now()}`,
        url: upscaledUrl,
        prompt: `4K Upscale: ${originalPrompt}`,
        timestamp: Date.now(),
        resolution: Resolution.FOUR_K
      };

      setState(prev => ({
        ...prev,
        isLoading: false,
        selectedImage: upscaledUrl,
        currentResolution: Resolution.FOUR_K,
        history: [newImg, ...prev.history]
      }));
      setIsUpscaling(false);
    } catch (err: any) {
       if (err.message === "API_KEY_RESET_REQUIRED") {
        setState(prev => ({ ...prev, isLoading: false, hasApiKey: false }));
      } else {
        setState(prev => ({ ...prev, isLoading: false, error: err.message || "Upscaling failed." }));
      }
      setIsUpscaling(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setState(prev => ({ ...prev, selectedImage: reader.result as string }));
        setIsEditing(true);
        setIsUpscaling(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectPrompt = (p: string) => {
    setPrompt(p);
    setShowPromptHistory(false);
  };

  const messages = isUpscaling ? UPSCALE_MESSAGES : LOADING_MESSAGES;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col lg:flex-row cosmic-gradient">
      {!state.hasApiKey && (
        <ApiKeyBarrier onKeySelected={() => setState(prev => ({ ...prev, hasApiKey: true }))} />
      )}

      <Sidebar
        resolution={state.currentResolution}
        setResolution={(res) => setState(prev => ({ ...prev, currentResolution: res }))}
        aspectRatio={state.currentAspectRatio}
        setAspectRatio={(ratio) => setState(prev => ({ ...prev, currentAspectRatio: ratio }))}
      />

      <main className="flex-1 overflow-y-auto p-6 lg:p-12 relative">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-white/10 group rotate-12 hover:rotate-0 transition-transform cursor-pointer">
              <svg className="w-8 h-8 text-slate-950" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-black font-space tracking-tight text-white flex items-baseline gap-2">
                SPACE AI <span className="text-blue-500 text-sm font-mono tracking-widest uppercase opacity-50">v3.1</span>
              </h1>
              <p className="text-slate-400 text-sm font-medium">Cosmic image generation & intelligence</p>
            </div>
          </div>

          <div className="flex gap-3">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 transition-all text-sm font-bold flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Specimen
            </button>
            {state.selectedImage && (
              <button
                onClick={handleUpscale}
                disabled={state.isLoading}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                4K Upscale
              </button>
            )}
            {state.selectedImage && (
              <a
                href={state.selectedImage}
                download="space-ai-export.png"
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </a>
            )}
          </div>
        </header>

        <div className="max-w-6xl mx-auto space-y-12">
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center group">
            {state.selectedImage ? (
              <img
                src={state.selectedImage}
                alt="Generated Space View"
                className={`w-full h-full object-contain transition-opacity duration-700 ${state.isLoading ? 'opacity-30' : 'opacity-100'}`}
              />
            ) : (
              <div className="text-center space-y-4 max-w-sm px-6">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <svg className="w-10 h-10 text-slate-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                </div>
                <p className="text-slate-500 font-medium">Ready for ignition. Enter a prompt to begin your cosmic exploration.</p>
              </div>
            )}

            {/* Enhanced Loading Overlay */}
            {state.isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-xl z-10 transition-all p-8">
                <div className="relative w-32 h-32 mb-8">
                  <div className={`absolute inset-0 border-4 ${isUpscaling ? 'border-cyan-500/10' : 'border-blue-500/10'} rounded-full`} />
                  <div className={`absolute inset-0 border-4 border-t-${isUpscaling ? 'cyan' : 'blue'}-500 rounded-full animate-spin`} />
                  <div className={`absolute inset-2 border-2 ${isUpscaling ? 'border-r-blue-500' : 'border-r-purple-500'} rounded-full animate-spin [animation-duration:1.5s]`} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-xs font-mono font-bold ${isUpscaling ? 'text-cyan-400' : 'text-blue-400'}`}>{Math.round(simulatedProgress)}%</span>
                  </div>
                </div>
                
                <div className="text-center max-w-md w-full space-y-6">
                  <div>
                    <h4 className="text-2xl font-bold text-white font-space tracking-wide h-8 overflow-hidden">
                      <span className="block animate-in slide-in-from-bottom-2 duration-500">
                        {messages[loadingStep]}
                      </span>
                    </h4>
                    <p className={`${isUpscaling ? 'text-cyan-400' : 'text-blue-400'} text-xs font-mono mt-2 tracking-widest uppercase opacity-70`}>
                      Sector: {Math.floor(simulatedProgress * 1234)} • {isUpscaling ? 'Ultra 4K' : state.currentResolution} Render Mode
                    </p>
                  </div>

                  {/* Telemetry Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase tracking-tighter">
                      <span>Transmission Buffer</span>
                      <span>Syncing with Satellite</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                      <div 
                        className={`h-full bg-gradient-to-r ${isUpscaling ? 'from-cyan-600 via-blue-500 to-cyan-400' : 'from-blue-600 via-purple-500 to-blue-400'} transition-all duration-500 ease-out`}
                        style={{ width: `${simulatedProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Data Stream Simulation */}
                  <div className="grid grid-cols-4 gap-2 opacity-40">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-400 animate-[shimmer_2s_infinite]" style={{ animationDelay: `${i * 0.5}s` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {isEditing && !state.isLoading && (
              <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-purple-600/90 backdrop-blur text-white text-xs font-bold rounded-full shadow-lg border border-purple-400/30">
                <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                EDIT MODE
              </div>
            )}
          </div>

          <div className="sticky bottom-6 z-20">
            {showPromptHistory && state.promptHistory.length > 0 && (
              <div className="absolute bottom-full left-0 right-0 mb-4 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-4 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 max-h-64 overflow-y-auto">
                <div className="flex justify-between items-center mb-3 px-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recent Logs</h4>
                  <button 
                    onClick={() => setShowPromptHistory(false)}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-1">
                  {state.promptHistory.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectPrompt(p)}
                      className="w-full text-left px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-all truncate group flex items-center gap-3"
                    >
                      <svg className="w-4 h-4 text-slate-600 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 p-4 rounded-3xl shadow-3xl shadow-black/50">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (isEditing ? handleEdit() : handleGenerate())}
                    onFocus={() => setShowPromptHistory(true)}
                    placeholder={isEditing ? "Add a retro filter... Remove background... Transform to neon..." : "A galaxy made of glass shards floating in a neon sea..."}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-slate-500 transition-all font-medium"
                    disabled={state.isLoading}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <button 
                      onClick={() => setShowPromptHistory(!showPromptHistory)}
                      className={`transition-colors ${showPromptHistory ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {isEditing && (
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-4 rounded-2xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-all border border-slate-700"
                      disabled={state.isLoading}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={isEditing ? handleEdit : handleGenerate}
                    disabled={state.isLoading || !prompt.trim()}
                    className={`px-8 py-4 rounded-2xl text-white font-bold transition-all flex items-center gap-2 shadow-xl ${
                      isEditing 
                      ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/20' 
                      : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {state.isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {isEditing ? 'Transform' : 'Launch'}
                      </>
                    )}
                  </button>
                </div>
              </div>
              {state.error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {state.error}
                </div>
              )}
            </div>
          </div>

          <HistoryGallery
            images={state.history}
            onSelect={(url) => {
              setState(prev => ({ ...prev, selectedImage: url }));
              setIsEditing(true);
              setIsUpscaling(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>

        <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1] opacity-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full animate-pulse-slow"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 4}px`,
                height: `${Math.random() * 4}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 5}s`
              }}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default App;
