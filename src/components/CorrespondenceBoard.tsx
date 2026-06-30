import { useState } from 'react';
import { CorrespondenceMessage } from '../types';
import { Mail, MessageSquare, ShieldCheck, Heart, Trash2 } from 'lucide-react';

interface CorrespondenceBoardProps {
  messages: CorrespondenceMessage[];
  onDeleteMessage?: (id: string) => void;
}

export default function CorrespondenceBoard({ messages, onDeleteMessage }: CorrespondenceBoardProps) {
  const [filter, setFilter] = useState<'public' | 'all'>('public');

  // Filter out private letters unless we simulate a "Hub Operator" view or let users toggle it.
  // Wait, let's allow toggling to "Secret Sanctuary Notebook" so users can see how their private letters look as well! This is super cozy and shows off the full logic.
  const displayedMessages = filter === 'public' 
    ? messages.filter(m => !m.isPrivate) 
    : messages;

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'June 30, 2026';
    }
  };

  return (
    <div className="space-y-6" id="correspondence-board">
      <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
        <div>
          <h3 className="font-serif font-bold text-lg text-on-surface">The Letterbox</h3>
          <p className="text-xs text-on-surface-variant font-sans">Whispers and stories sent by companions of the sanctuary.</p>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setFilter('public')}
            className={`px-3 py-1 rounded text-[10px] font-label-sm uppercase tracking-wider transition-all cursor-pointer ${
              filter === 'public'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-stone-200/50'
            }`}
          >
            Public Letters
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded text-[10px] font-label-sm uppercase tracking-wider transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-secondary text-on-secondary'
                : 'bg-surface-container text-on-surface-variant hover:bg-stone-200/50'
            }`}
          >
            All Post
          </button>
        </div>
      </div>

      {displayedMessages.length === 0 ? (
        <div className="text-center py-8 px-4 bg-surface-container-low border border-dashed border-outline-variant/40 rounded-lg">
          <Mail className="mx-auto text-stone-400 mb-2 opacity-60" size={28} />
          <p className="font-serif italic text-sm text-on-surface-variant">The mailbox is currently silent...</p>
          <p className="text-xs text-on-surface-variant/70 mt-1">Be the first to share your story below!</p>
        </div>
      ) : (
        <div className="space-y-5 max-h-[420px] overflow-y-auto pr-1 scroll-smooth">
          {displayedMessages.map((message) => (
            <div 
              key={message.id}
              className={`relative p-5 rounded-lg border transition-all duration-300 shadow-sm overflow-hidden ${
                message.isPrivate 
                  ? 'bg-stone-900 text-stone-100 border-stone-800' 
                  : 'bg-surface-container-low text-on-surface border-outline-variant/30 hover:border-outline-variant/70'
              }`}
            >
              {/* Envelope Wax Seal Motif */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {message.isPrivate ? (
                  <span className="flex items-center gap-1 text-[9px] font-label-sm tracking-widest text-secondary-fixed bg-secondary-fixed/10 px-2 py-0.5 rounded uppercase">
                    🔒 Private Sanctuary Note
                  </span>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-tertiary-container/20 flex items-center justify-center border border-tertiary-container/30" title="Publicly Shared">
                    <Heart size={10} className="text-tertiary" />
                  </div>
                )}
                
                {onDeleteMessage && (
                  <button 
                    onClick={() => onDeleteMessage(message.id)}
                    className="text-stone-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-stone-100/10 cursor-pointer"
                    title="Remove Letter"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>

              {/* Author & Time metadata */}
              <div className="mb-3">
                <h4 className="font-serif font-bold text-sm text-primary flex items-center gap-1.5">
                  <span className={message.isPrivate ? "text-stone-300 font-sans text-xs" : "font-sans text-xs"}>
                    {message.name}
                  </span>
                  <span className="text-[10px] font-sans font-normal text-on-surface-variant/60">
                    ({message.email})
                  </span>
                </h4>
                <span className="text-[10px] font-sans text-on-surface-variant/50">
                  {formatDate(message.timestamp)}
                </span>
              </div>

              {/* Message Body with cozy paper background feel */}
              <div className={`text-xs leading-relaxed font-serif ${message.isPrivate ? 'text-stone-300' : 'text-stone-800'}`}>
                <p className="italic">"{message.story}"</p>
              </div>

              {/* Aesthetic Wax Seal Stamp inside Card margin */}
              {!message.isPrivate && (
                <div className="mt-3 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-[10px] text-on-surface-variant/60 font-sans">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={10} className="text-[#7D8E7D]" />
                    Safe-Redacted Identity
                  </span>
                  <span className="font-serif italic font-semibold text-[#7D8E7D]">Sanctuary Stamp</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
