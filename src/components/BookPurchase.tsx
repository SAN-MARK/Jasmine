import { useState, useRef } from 'react';
import { ShoppingBag, ArrowUpRight, Check } from 'lucide-react';

const BOOK_URL = 'https://www.bribooks.com/bookstore/the-mask-of-happiness-by-jasmine-patra/';

export default function BookPurchase() {
  const [isNavigating, setIsNavigating] = useState(false);
  const [hasVisited, setHasVisited] = useState(false);
  const anchorRef = useRef<HTMLAnchorElement>(null);

  const handlePurchaseClick = () => {
    setIsNavigating(true);
    setHasVisited(true);

    // Trigger programmatical secure link opening to bypass sandbox iframe blockers elegantly
    setTimeout(() => {
      if (anchorRef.current) {
        anchorRef.current.click();
      }
      setIsNavigating(false);
    }, 600);
  };

  return (
    <div className="bg-surface-container-high/60 border border-outline-variant/30 rounded-lg p-5 text-center space-y-4 shadow-sm" id="book-purchase">
      {/* Hidden secure anchor tag for robust target="_blank" rel="noopener noreferrer" inside iframes */}
      <a 
        ref={anchorRef}
        href={BOOK_URL}
        target="_blank" 
        rel="noopener noreferrer" 
        className="hidden"
      >
        Redirect
      </a>

      <div className="space-y-1.5">
        <span className="text-[9px] font-label-sm font-bold tracking-widest text-secondary uppercase bg-secondary-container/10 px-2.5 py-0.5 rounded-full inline-block">
          Support the Author
        </span>
        <h4 className="font-serif font-bold text-sm text-on-surface leading-tight">
          Purchase 'The Mask of Happiness'
        </h4>
        <p className="text-[11px] text-on-surface-variant font-sans leading-relaxed max-w-xs mx-auto">
          Get your own physical copy of my latest release through BriBooks Bookstore.
        </p>
      </div>

      <button
        onClick={handlePurchaseClick}
        disabled={isNavigating}
        className={`w-full py-3 px-4 rounded-sm text-xs font-label-sm uppercase tracking-widest font-bold border cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 ${
          isNavigating
            ? 'bg-secondary-container text-on-secondary-container border-secondary-container animate-pulse'
            : hasVisited
            ? 'bg-primary text-on-primary border-primary hover:bg-primary/90'
            : 'bg-secondary text-on-secondary border-secondary hover:bg-secondary/90 hover:shadow-md'
        }`}
      >
        {isNavigating ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-on-secondary-container border-t-transparent rounded-full animate-spin"></span>
            <span>Connecting...</span>
          </>
        ) : hasVisited ? (
          <>
            <Check size={14} />
            <span>Open Bookstore Again</span>
            <ArrowUpRight size={12} className="opacity-70" />
          </>
        ) : (
          <>
            <ShoppingBag size={14} />
            <span>Buy Physical Book</span>
            <ArrowUpRight size={12} className="opacity-70 animate-bounce" />
          </>
        )}
      </button>

      {hasVisited && !isNavigating && (
        <p className="text-[10px] text-primary italic font-serif leading-none">
          Thank you for wandering into my bookstore sanctuary!
        </p>
      )}
    </div>
  );
}
