import { useState, useEffect, useCallback } from 'react';
import { CorrespondenceMessage } from '../types';
import { Mail, RefreshCw, AlertCircle, Heart, ShieldCheck, StickyNote } from 'lucide-react';

interface CorrespondenceBoardProps {
  messages: CorrespondenceMessage[];
  onDeleteMessage?: (id: string) => void;
}

interface SheetRow {
  Timestamp?: string;
  timestamp?: string;
  Name?: string;
  name?: string;
  Email?: string;
  email?: string;
  'Your Story'?: string;
  'your story'?: string;
  story?: string;
  Story?: string;
  'Private Submission'?: string | boolean;
  'private submission'?: string | boolean;
  isPrivate?: string | boolean;
  Private?: string | boolean;
}

export default function CorrespondenceBoard({ messages, onDeleteMessage }: CorrespondenceBoardProps) {
  const [sheetMessages, setSheetMessages] = useState<CorrespondenceMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Cached API GET retrieval
  const fetchSheetData = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await fetch('https://api.sheetbest.com/sheets/c93fb017-30ae-43d3-8754-f6f4b70e8a50');
      if (!response.ok) {
        throw new Error('Could not access Sheet.best database.');
      }
      
      const data: SheetRow[] = await response.json();
      
      // Filter out private submissions and map to standard message format
      const mapped: CorrespondenceMessage[] = data
        .filter((row) => {
          const isPriv = row['Private Submission'] ?? row['private submission'] ?? row.isPrivate ?? row.Private ?? false;
          return !(isPriv === true || String(isPriv).toLowerCase() === 'true' || String(isPriv) === '1');
        })
        .map((row, idx) => {
          const rawTimestamp = row.Timestamp ?? row.timestamp ?? new Date().toISOString();
          const rawName = row.Name ?? row.name ?? 'Sanctuary Companion';
          const rawStory = row['Your Story'] ?? row['your story'] ?? row.story ?? row.Story ?? '';
          
          return {
            id: `sheet-${idx}-${rawTimestamp}`,
            timestamp: rawTimestamp,
            name: rawName,
            // SECURITY: Ensure email is NEVER exposed or rendered to the public feed
            email: '[Email Protected for Privacy]',
            story: rawStory,
            isPrivate: false
          };
        });

      // Sort newest letters first
      mapped.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setSheetMessages(mapped);
    } catch (err) {
      console.warn('Sheet.best fetch deferred:', err);
      setFetchError('Using offline sanctuary backup.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSheetData();
  }, [fetchSheetData]);

  // Merge dynamic sheet messages with local storage state to ensure instant responsiveness on newly posted letters
  const combinedMessages = [...sheetMessages];
  
  // Append local messages that aren't already present in sheet list (to avoid duplicates before sheet sync completes)
  messages.forEach((localMsg) => {
    if (localMsg.isPrivate) return; // Skip private messages in combined public pool
    const alreadyExists = sheetMessages.some(
      (sheetMsg) => 
        sheetMsg.name.toLowerCase() === localMsg.name.toLowerCase() && 
        sheetMsg.story.substring(0, 30) === localMsg.story.substring(0, 30)
    );
    if (!alreadyExists) {
      combinedMessages.push({
        ...localMsg,
        email: '[Email Protected for Privacy]' // Redact local email as well
      });
    }
  });

  // Sort final display list
  combinedMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      if (isNaN(date.getTime())) return isoStr;
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return 'June 30, 2026';
    }
  };

  // List of soft vintage scrap paper colors to alternate
  const paperColors = [
    'bg-[#fdfbf3] border-[#eae4d3] shadow-[1px_2px_4px_rgba(0,0,0,0.04)]', // soft ivory warm
    'bg-[#faf8f0] border-[#e6e1d1] shadow-[2px_1px_5px_rgba(0,0,0,0.03)]', // parchment cream
    'bg-[#f6f4ea] border-[#e2dcc9] shadow-[1px_1px_4px_rgba(0,0,0,0.04)]', // antique linen
  ];

  return (
    <div className="space-y-6" id="correspondence-board">
      <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
        <div className="text-left">
          <h3 className="font-serif font-bold text-lg text-on-surface">The Companion Feed</h3>
          <p className="text-xs text-on-surface-variant font-sans">Real-time stories shared by visitors from the Google Sheet database.</p>
        </div>
        <button
          onClick={fetchSheetData}
          disabled={isLoading}
          className="p-1.5 rounded-full hover:bg-stone-200/50 transition-colors text-primary active:scale-95 cursor-pointer flex items-center justify-center"
          title="Refresh Feed"
          id="refresh-feed-button"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin text-primary/60' : 'text-primary'} />
        </button>
      </div>

      {fetchError && (
        <div className="flex items-center gap-2 p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-800 font-sans">
          <AlertCircle size={12} className="shrink-0" />
          <span>{fetchError} Showing offline backup of letters.</span>
        </div>
      )}

      {isLoading && sheetMessages.length === 0 ? (
        <div className="text-center py-12 bg-surface-container-low border border-dashed border-outline-variant/40 rounded-lg space-y-3">
          <div className="relative w-8 h-8 mx-auto flex items-center justify-center">
            <span className="absolute w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></span>
            <Mail className="text-primary/40" size={14} />
          </div>
          <p className="font-serif italic text-xs text-on-surface-variant">Unfolding the letters from the cloud...</p>
        </div>
      ) : combinedMessages.length === 0 ? (
        <div className="text-center py-10 px-4 bg-surface-container-low border border-dashed border-outline-variant/40 rounded-lg">
          <Mail className="mx-auto text-stone-400 mb-2 opacity-60" size={28} />
          <p className="font-serif italic text-sm text-on-surface-variant">The mailbox is currently silent...</p>
          <p className="text-xs text-on-surface-variant/70 mt-1">Be the first to leave a message in the Sanctuary!</p>
        </div>
      ) : (
        <div className="space-y-5 max-h-[440px] overflow-y-auto pr-1 scroll-smooth no-scrollbar">
          {combinedMessages.map((message, idx) => {
            const paperStyle = paperColors[idx % paperColors.length];
            return (
              <div 
                key={message.id}
                className={`relative p-5 rounded-sm border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${paperStyle}`}
                style={{ transform: `rotate(${(idx % 2 === 0 ? 0.4 : -0.4)}deg)` }}
              >
                {/* Washi Tape Graphic Element at Top */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-[#d9d5c5]/40 backdrop-blur-xs border-x border-dashed border-[#b8b4a2]/50 transform rotate-1 z-10"></div>

                {/* Wax Seal Decorator */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-red-800/10 flex items-center justify-center border border-red-800/20" title="Sanctuary Sealed">
                    <Heart size={8} className="text-red-800/70" />
                  </div>
                  
                  {onDeleteMessage && message.id.startsWith('default-') && (
                    <button 
                      onClick={() => onDeleteMessage(message.id)}
                      className="text-stone-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-stone-100/50 cursor-pointer"
                      title="Remove Backup Letter"
                    >
                      <span className="text-[10px]">×</span>
                    </button>
                  )}
                </div>

                {/* Writer Identity Details */}
                <div className="mb-2">
                  <h4 className="font-sans font-bold text-xs text-primary/90 flex items-center gap-1">
                    <StickyNote size={10} className="text-[#7D8E7D] opacity-70" />
                    <span>{message.name}</span>
                  </h4>
                  <div className="text-[9px] font-sans text-on-surface-variant/50 flex items-center gap-2 mt-0.5">
                    <span>{formatDate(message.timestamp)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-emerald-800/80">
                      <ShieldCheck size={9} />
                      <span>Encrypted Email</span>
                    </span>
                  </div>
                </div>

                {/* Cozy Vintage Story Script */}
                <div className="text-xs leading-relaxed font-serif text-stone-800 border-l-2 border-stone-300/40 pl-3 italic py-1">
                  "{message.story}"
                </div>

                {/* Subtle Scrap Card Stamp */}
                <div className="mt-3 pt-2.5 border-t border-dashed border-stone-300/60 flex items-center justify-between text-[8px] uppercase tracking-wider text-stone-500 font-sans">
                  <span>Leaflet #{idx + 1}</span>
                  <span className="italic font-serif font-bold text-[#7D8E7D]/80">Jasmine's Desk</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
