
import React from 'react';
import { GeneratedImage } from '../types';

interface HistoryGalleryProps {
  images: GeneratedImage[];
  onSelect: (url: string) => void;
}

const HistoryGallery: React.FC<HistoryGalleryProps> = ({ images, onSelect }) => {
  if (images.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold font-space text-white mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9l-2-2H5a2 2 0 01-2 2v1M5 19V11" />
        </svg>
        Your Universe
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img) => (
          <button
            key={img.id}
            onClick={() => onSelect(img.url)}
            className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-800 hover:border-blue-500 transition-all bg-slate-900 shadow-xl"
          >
            <img
              src={img.url}
              alt={img.prompt}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
              <p className="text-[10px] text-white truncate line-clamp-1">{img.prompt}</p>
            </div>
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-blue-600/80 text-[10px] text-white backdrop-blur">
              {img.resolution}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HistoryGallery;
