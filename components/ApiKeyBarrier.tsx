
import React from 'react';

interface ApiKeyBarrierProps {
  onKeySelected: () => void;
}

const ApiKeyBarrier: React.FC<ApiKeyBarrierProps> = ({ onKeySelected }) => {
  const handleOpenSelector = async () => {
    try {
      // @ts-ignore - window.aistudio is injected
      await window.aistudio.openSelectKey();
      onKeySelected();
    } catch (err) {
      console.error("Failed to open key selector", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-6">
        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto ring-1 ring-blue-500/20">
          <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-bold font-space text-white mb-2">Initialize Mission</h2>
          <p className="text-slate-400">
            To unlock the full potential of Space AI, including 2K and 4K cosmic rendering, you must select your AI Studio API key.
          </p>
        </div>
        <div className="space-y-4">
          <button
            onClick={handleOpenSelector}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group"
          >
            <span>Select API Key</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <p className="text-xs text-slate-500">
            Make sure your key is from a project with billing enabled.
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-blue-400 hover:underline ml-1">Learn more</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyBarrier;
