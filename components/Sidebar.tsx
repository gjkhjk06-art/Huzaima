
import React from 'react';
import { Resolution, AspectRatio } from '../types';

interface SidebarProps {
  resolution: Resolution;
  setResolution: (res: Resolution) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ resolution, setResolution, aspectRatio, setAspectRatio }) => {
  return (
    <div className="w-full lg:w-80 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 p-6 space-y-8 flex flex-col h-full overflow-y-auto">
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          Resolution
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {Object.values(Resolution).map((res) => (
            <button
              key={res}
              onClick={() => setResolution(res)}
              className={`px-4 py-3 rounded-xl border transition-all text-sm font-medium text-left flex justify-between items-center ${
                resolution === res
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <span>{res} Cosmic HQ</span>
              {resolution === res && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
            </button>
          ))}
        </div>
        {resolution !== Resolution.ONE_K && (
          <p className="mt-2 text-[10px] text-blue-400 italic">Gemini 3 Pro Engine Activated</p>
        )}
      </div>

      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Aspect Ratio
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(AspectRatio).map((ratio) => (
            <button
              key={ratio}
              onClick={() => setAspectRatio(ratio)}
              className={`px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
                aspectRatio === ratio
                  ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-slate-800 space-y-4">
        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
          <p className="text-xs text-slate-400 font-medium mb-2">Space Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-400 font-mono">Orbit Stable</span>
          </div>
        </div>
        
        <div className="px-1 flex flex-col items-center">
          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-space tracking-widest uppercase">
            <span>Made by</span>
            <span className="text-blue-400 font-bold hover:text-blue-300 transition-colors cursor-default">Huzaima</span>
          </div>
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-slate-800 to-transparent mt-2" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
