import { useState } from 'react';
import { Book } from '../types';
import { X, ChevronLeft, ChevronRight, Type, Sparkles } from 'lucide-react';
import BookPurchase from './BookPurchase';

interface BookReaderProps {
  book: Book;
  onClose: () => void;
}

export default function BookReader({ book, onClose }: BookReaderProps) {
  const [readMode, setReadMode] = useState<'abstract' | 'pages'>('abstract');
  const [currentPage, setCurrentPage] = useState(0);
  const [paperTone, setPaperTone] = useState<'cream' | 'parchment' | 'charcoal'>('cream');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');

  const pages = book.pages || ["No pages available in this manuscript draft yet."];

  const paperClasses = {
    cream: 'bg-[#fcfaf6] text-[#423a31] border-stone-200/50',
    parchment: 'bg-[#f4ebd0] text-[#3d2f21] border-[#e7dac1]',
    charcoal: 'bg-[#2b2b29] text-[#e3deda] border-[#383836]',
  };

  const fontClasses = {
    sm: 'text-xs md:text-sm leading-relaxed',
    base: 'text-sm md:text-base leading-relaxed',
    lg: 'text-base md:text-lg leading-relaxed',
    xl: 'text-lg md:text-xl leading-relaxed',
  };

  const handleNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Container restricted to 480px width for consistency in mobile sandbox */}
      <div className="w-full max-w-[440px] bg-background border border-outline-variant/30 rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Reader Header */}
        <div className="px-5 py-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container">
          <div>
            <span className="text-[10px] font-label-sm uppercase tracking-wider text-primary font-bold">
              {book.category} COLLECTION
            </span>
            <h3 className="font-serif text-lg text-on-surface font-bold truncate max-w-[280px]">
              {book.title}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200/50 transition-colors text-on-surface-variant cursor-pointer"
            id="close-reader"
          >
            <X size={18} />
          </button>
        </div>

        {/* Reader Controls (only show in manuscript read mode) */}
        <div className="px-4 py-2 border-b border-outline-variant/10 bg-surface-container-low flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setReadMode('abstract');
                setCurrentPage(0);
              }}
              className={`px-3 py-1 rounded-sm font-label-sm uppercase text-[10px] tracking-wider transition-all cursor-pointer ${
                readMode === 'abstract'
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-stone-200/50'
              }`}
            >
              Abstract
            </button>
            <button
              onClick={() => setReadMode('pages')}
              className={`px-3 py-1 rounded-sm font-label-sm uppercase text-[10px] tracking-wider transition-all cursor-pointer ${
                readMode === 'pages'
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-stone-200/50'
              }`}
            >
              Read Manuscript
            </button>
          </div>

          {/* Reader Preferences */}
          {readMode === 'pages' && (
            <div className="flex items-center gap-2">
              {/* Paper Tone switcher */}
              <div className="flex gap-1">
                <button
                  onClick={() => setPaperTone('cream')}
                  title="Cream Paper"
                  className={`w-4 h-4 rounded-full bg-[#fcfaf6] border ${
                    paperTone === 'cream' ? 'ring-1 ring-primary border-primary' : 'border-stone-300'
                  }`}
                />
                <button
                  onClick={() => setPaperTone('parchment')}
                  title="Parchment Paper"
                  className={`w-4 h-4 rounded-full bg-[#f4ebd0] border ${
                    paperTone === 'parchment' ? 'ring-1 ring-primary border-primary' : 'border-stone-300'
                  }`}
                />
                <button
                  onClick={() => setPaperTone('charcoal')}
                  title="Dark Paper"
                  className={`w-4 h-4 rounded-full bg-[#2b2b29] border ${
                    paperTone === 'charcoal' ? 'ring-1 ring-primary border-primary' : 'border-stone-400'
                  }`}
                />
              </div>

              {/* Font Size button */}
              <button
                onClick={() => {
                  const sizes: ('sm' | 'base' | 'lg' | 'xl')[] = ['sm', 'base', 'lg', 'xl'];
                  const currentIndex = sizes.indexOf(fontSize);
                  const nextIndex = (currentIndex + 1) % sizes.length;
                  setFontSize(sizes[nextIndex]);
                }}
                className="p-1 rounded hover:bg-stone-200/50 transition-colors text-on-surface-variant flex items-center gap-0.5"
                title="Change Font Size"
              >
                <Type size={14} />
                <span className="uppercase text-[10px] font-bold">{fontSize}</span>
              </button>
            </div>
          )}
        </div>

        {/* Paper Surface Content Area */}
        <div className={`flex-1 overflow-y-auto p-6 md:p-8 font-serif transition-colors duration-300 ${
          readMode === 'pages' ? paperClasses[paperTone] : 'bg-[#fcfaf6] text-[#423a31]'
        }`}>
          {readMode === 'abstract' ? (
            <div className="space-y-5 fade-in-up">
              <div className="flex items-center gap-1.5 text-stone-500 text-xs font-sans uppercase tracking-widest mb-2">
                <Sparkles size={12} className="text-secondary" />
                <span>Synopsis & Inspiration</span>
              </div>
              <p className="leading-relaxed text-sm md:text-base italic font-serif text-stone-700">
                "{book.abstract}"
              </p>
              
              {book.id === 'mask-of-happiness' && (
                <div className="pt-2">
                  <BookPurchase />
                </div>
              )}

              <div className="pt-4 border-t border-stone-200/50">
                <button
                  onClick={() => setReadMode('pages')}
                  className="w-full bg-primary hover:bg-primary/90 text-on-primary py-3 px-4 text-xs font-label-sm uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Open Manuscript Draft</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-between min-h-[300px]">
              <div className={`flex-1 whitespace-pre-line font-serif ${fontClasses[fontSize]}`}>
                {pages[currentPage]}
              </div>

              {/* Page footer controls */}
              <div className="mt-8 pt-4 border-t border-stone-300/20 flex items-center justify-between text-xs font-sans text-stone-500">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className="flex items-center gap-1 hover:text-primary disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  Prev
                </button>
                <span className="font-label-sm uppercase tracking-widest text-[11px]">
                  PAGE {currentPage + 1} OF {pages.length}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === pages.length - 1}
                  className="flex items-center gap-1 hover:text-primary disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Micro-Branding footer */}
        <div className="px-5 py-3 bg-surface-container border-t border-outline-variant/20 flex justify-between items-center text-[10px] text-on-surface-variant/70 font-sans">
          <span>COZY SANCTUARY PRESS</span>
          <span>© 2026 JASMINE PATRA</span>
        </div>
      </div>
    </div>
  );
}
