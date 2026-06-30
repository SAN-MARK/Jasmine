import { useState, useEffect, useRef, FormEvent } from 'react';
import { 
  BOOKS_DATA, 
  JOURNAL_ENTRIES, 
  INITIAL_CORRESPONDENCE 
} from './data';
import { 
  Book, 
  JournalEntry, 
  CorrespondenceMessage 
} from './types';
import BookReader from './components/BookReader';
import CorrespondenceBoard from './components/CorrespondenceBoard';
import AmbientSoundboard from './components/AmbientSoundboard';
import BookPurchase from './components/BookPurchase';
import { 
  Menu, 
  X, 
  Feather, 
  Coffee, 
  Compass, 
  BookOpen, 
  Mail, 
  User, 
  CheckCircle, 
  Send, 
  ChevronRight, 
  Sparkles, 
  Info,
  Calendar,
  Lock,
  Heart
} from 'lucide-react';

// Safety Masking Utility as requested in safety guidelines
function maskIdentityParameters(text: string): string {
  // Aadhaar Regex: 12-digit card numbers (e.g., 1234 5678 9012, 1234-5678-9012, or 123456789012)
  const aadhaarRegex = /\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/g;
  // PAN Card Regex: 5 letters, 4 numbers, 1 letter
  const panRegex = /\b[A-Z]{5}\d{4}[A-Z]\b/gi;
  // Generic identification number
  const genericIdRegex = /(?:id|passport|ssn|aadhar|aadhaar)\s*[:#\-]?\s*([a-zA-Z0-9\-\s]{6,20})/gi;

  let masked = text.replace(aadhaarRegex, '[Aadhaar Redacted]');
  masked = masked.replace(panRegex, '[PAN Redacted]');
  return masked;
}

const COFFEE_QUOTES = [
  "Tending the warm hearth of quiet thoughts...",
  "Sipping deep solitude, one steam wave at a time.",
  "A blank page is just a silence waiting for your voice.",
  "The kettle sings to the morning mist. Listen closely.",
  "There are infinite stories inside a cup of warm chamomile.",
  "Let your heart slow down to the beat of falling leaves.",
  "In solitude, the ink flows like clear spring water.",
  "A fresh brew, a clean journal, and the world is temporarily at peace."
];

export default function App() {
  // State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [journalOpen, setJournalOpen] = useState(false);
  const [activeJournalEntry, setActiveJournalEntry] = useState<JournalEntry | null>(null);
  
  // Correspondence state
  const [messages, setMessages] = useState<CorrespondenceMessage[]>([]);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formStory, setFormStory] = useState('');
  const [formPrivate, setFormPrivate] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  // Interactive Coffee Mug state
  const [coffeeClicks, setCoffeeClicks] = useState(0);
  const [currentQuote, setCurrentQuote] = useState(COFFEE_QUOTES[0]);
  const [isBrewing, setIsBrewing] = useState(false);
  const [steamParticles, setSteamParticles] = useState<{ id: number; left: number; delay: number }[]>([]);

  // Load correspondence from localStorage or fallback to default
  useEffect(() => {
    const saved = localStorage.getItem('cozy_sanctuary_letters');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        initializeDefaultMessages();
      }
    } else {
      initializeDefaultMessages();
    }
  }, []);

  const initializeDefaultMessages = () => {
    const defaults: CorrespondenceMessage[] = INITIAL_CORRESPONDENCE.map((m, idx) => ({
      id: `default-${idx}`,
      timestamp: m.timestamp,
      name: m.name,
      email: m.email,
      story: m.story,
      isPrivate: m.isPrivate
    }));
    setMessages(defaults);
    localStorage.setItem('cozy_sanctuary_letters', JSON.stringify(defaults));
  };

  // Handle Coffee Mug interaction
  const handleCoffeeClick = () => {
    if (isBrewing) return;
    setIsBrewing(true);
    setCoffeeClicks(prev => prev + 1);
    
    // Cycle random cozy quote
    const nextQuote = COFFEE_QUOTES[(coffeeClicks + 1) % COFFEE_QUOTES.length];
    setCurrentQuote(nextQuote);

    // Trigger steam particles
    const newParticles = [
      { id: Date.now() + 1, left: 15 + Math.random() * 20, delay: 0 },
      { id: Date.now() + 2, left: 35 + Math.random() * 25, delay: 0.6 },
      { id: Date.now() + 3, left: 25 + Math.random() * 20, delay: 1.2 }
    ];
    setSteamParticles(newParticles);

    // Reset brewing state after animation
    setTimeout(() => {
      setIsBrewing(false);
      setSteamParticles([]);
    }, 3200);
  };

  // Handle Submission
  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmissionError('');

    if (!formName.trim() || !formEmail.trim() || !formStory.trim()) {
      setSubmissionError('Please fill in all requested fields of the correspondence form.');
      return;
    }

    // Explicitly apply Identity masking to Name, Email, and Story
    const maskedName = maskIdentityParameters(formName.trim());
    const maskedEmail = maskIdentityParameters(formEmail.trim());
    const maskedStory = maskIdentityParameters(formStory.trim());

    const newMessage: CorrespondenceMessage = {
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      name: maskedName,
      email: maskedEmail,
      story: maskedStory,
      isPrivate: formPrivate
    };

    const updated = [newMessage, ...messages];
    setMessages(updated);
    localStorage.setItem('cozy_sanctuary_letters', JSON.stringify(updated));

    // Optional Sheet.best sync as requested in constraints
    const SHEET_BEST_URL = (import.meta as any).env.VITE_SHEET_BEST_URL || localStorage.getItem('VITE_SHEET_BEST_URL') || '';
    if (SHEET_BEST_URL) {
      try {
        await fetch(SHEET_BEST_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Timestamp: newMessage.timestamp,
            Name: newMessage.name,
            Email: newMessage.email,
            Phone: '[Not Provided - Portfolio Feed]',
            ItemCategory: 'Correspondence Letter',
            ItemDescription: newMessage.story,
            LossLocation: 'Cosmic Sanctuary Web',
            FoundDate: new Date().toLocaleDateString(),
            StorageHub: newMessage.isPrivate ? 'Private Mailbox' : 'Public Ledger',
            Status: 'Received',
            ImageReference: 'none'
          })
        });
      } catch (err) {
        console.warn('Sheet.best backup deferred:', err);
      }
    }

    // Reset Form
    setFormName('');
    setFormEmail('');
    setFormStory('');
    setFormPrivate(false);
    setFormSubmitted(true);

    // Dismiss confirmation after delay
    setTimeout(() => {
      setFormSubmitted(false);
    }, 6000);
  };

  const handleDeleteMessage = (id: string) => {
    const updated = messages.filter(m => m.id !== id);
    setMessages(updated);
    localStorage.setItem('cozy_sanctuary_letters', JSON.stringify(updated));
  };

  // Drawer click helpers
  const handleDrawerLink = (targetId: string) => {
    setDrawerOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#ece9e4] flex items-center justify-center p-0 md:p-6 select-none relative overflow-x-hidden antialiased">
      {/* Paper Grain Overlay across entire app */}
      <div className="paper-grain"></div>

      {/* Main viewport restricted to 480px, centered on desktop */}
      <div className="w-full max-w-[480px] bg-background min-h-screen md:min-h-[85vh] md:my-4 flex flex-col relative shadow-2xl border-x border-outline-variant/30 overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-outline-variant/30 px-5 py-4 flex items-center justify-between">
          <button 
            onClick={() => setDrawerOpen(true)}
            className="p-1 -ml-1 rounded-full hover:bg-stone-200/50 transition-colors text-primary active:scale-95 cursor-pointer"
            aria-label="Open Archive Index"
          >
            <Menu size={20} />
          </button>
          
          <h1 className="font-serif text-lg font-bold text-primary tracking-tight">
            Jasmine Patra
          </h1>

          <button 
            onClick={() => setJournalOpen(true)}
            className="p-1 -mr-1 rounded-full hover:bg-stone-200/50 transition-colors text-primary active:scale-95 cursor-pointer"
            aria-label="View Journal Essays"
            title="Open Sanctuary Journal"
          >
            <span className="material-symbols-outlined text-xl inline-block leading-none">history_edu</span>
          </button>
        </header>

        {/* NAVIGATION DRAWER */}
        <div className={`absolute inset-0 bg-stone-900/40 backdrop-blur-xs z-50 transition-opacity duration-300 ${
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}>
          <nav className={`absolute inset-y-0 left-0 bg-[#f5f3ef] w-72 max-w-[80%] border-r border-outline-variant/30 p-6 flex flex-col justify-between transition-transform duration-300 transform ${
            drawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/20">
                <span className="font-serif font-bold text-primary text-lg">Sanctuary Index</span>
                <button 
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 rounded-full hover:bg-stone-200/50 text-on-surface-variant cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2">
                <button 
                  onClick={() => handleDrawerLink('hero')}
                  className="w-full text-left font-sans text-xs font-semibold uppercase tracking-widest text-on-surface-variant hover:text-primary hover:bg-stone-200/40 px-4 py-3 rounded transition-colors flex items-center gap-3 cursor-pointer"
                >
                  <Compass size={16} className="text-secondary" />
                  The Sanctuary
                </button>

                <button 
                  onClick={() => handleDrawerLink('about')}
                  className="w-full text-left font-sans text-xs font-semibold uppercase tracking-widest text-on-surface-variant hover:text-primary hover:bg-stone-200/40 px-4 py-3 rounded transition-colors flex items-center gap-3 cursor-pointer"
                >
                  <Feather size={16} className="text-secondary" />
                  The Muse (Bio)
                </button>

                <button 
                  onClick={() => handleDrawerLink('portfolio')}
                  className="w-full text-left font-sans text-xs font-semibold uppercase tracking-widest text-on-surface-variant hover:text-primary hover:bg-stone-200/40 px-4 py-3 rounded transition-colors flex items-center gap-3 cursor-pointer"
                >
                  <BookOpen size={16} className="text-secondary" />
                  The Bookshelf
                </button>

                <button 
                  onClick={() => handleDrawerLink('contact')}
                  className="w-full text-left font-sans text-xs font-semibold uppercase tracking-widest text-on-surface-variant hover:text-primary hover:bg-stone-200/40 px-4 py-3 rounded transition-colors flex items-center gap-3 cursor-pointer"
                >
                  <Mail size={16} className="text-secondary" />
                  Correspondence
                </button>
              </div>

              {/* Auxiliary Quick Links */}
              <div className="mt-8 pt-6 border-t border-outline-variant/20 space-y-3">
                <h4 className="text-[10px] font-label-sm tracking-widest text-on-surface-variant/50 uppercase">Sanctuary Libraries</h4>
                <button 
                  onClick={() => { setDrawerOpen(false); setJournalOpen(true); }}
                  className="w-full text-left text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Journal Archive</span>
                  <ChevronRight size={12} />
                </button>
                <a 
                  href="#soundboard" 
                  onClick={() => setDrawerOpen(false)}
                  className="w-full text-left text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Ambient Soundboard</span>
                  <ChevronRight size={12} />
                </a>
              </div>
            </div>

            <div className="text-[10px] text-on-surface-variant/50 leading-relaxed pt-6 border-t border-outline-variant/15">
              <p className="font-serif italic font-semibold text-primary">Jasmine Patra</p>
              <p>Crafted in the Creative Sanctuary</p>
              <p className="mt-1">© 2026</p>
            </div>
          </nav>
        </div>

        {/* SCROLLABLE MAIN CONTENT BODY */}
        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
          
          {/* 1. HERO SECTION */}
          <section id="hero" className="relative px-6 py-16 flex flex-col items-center justify-center text-center overflow-hidden border-b border-outline-variant/10">
            <div className="relative z-10 max-w-sm mx-auto space-y-6">
              
              <h2 className="font-serif text-[28px] leading-tight font-bold text-on-surface">
                WELCOME TO MY LITTLE CORNER OF <span className="italic text-primary underline decoration-tertiary-fixed-dim/70 decoration-2 underline-offset-4">CURIOSITY</span>
              </h2>
              
              <p className="font-sans text-sm md:text-base leading-relaxed text-on-surface-variant">
                I’m Jasmine Patra—a writer, dreamer, and storyteller crafting digital sanctuaries through words.
              </p>

              {/* Cozy Coffee Interaction Card */}
              <div className="pt-6 relative">
                <button 
                  onClick={handleCoffeeClick}
                  className={`w-20 h-20 mx-auto rounded-full bg-surface-container shadow-inner border border-outline-variant/20 flex items-center justify-center relative active:scale-95 transition-all cursor-pointer group ${
                    isBrewing ? 'animate-pulse ring-1 ring-primary-container' : 'hover:border-primary/40'
                  }`}
                  aria-label="Brew deep thoughts"
                >
                  <Coffee size={28} className={`transition-colors ${isBrewing ? 'text-secondary' : 'text-primary group-hover:text-secondary'}`} />
                  
                  {/* Dynamic Steam Particles */}
                  {isBrewing && steamParticles.map((part) => (
                    <div 
                      key={part.id}
                      className="steam-particle"
                      style={{ 
                        left: `${part.left}px`,
                        animationDelay: `${part.delay}s`
                      }}
                    />
                  ))}
                </button>
                
                <div className="absolute -bottom-2 w-28 left-1/2 -translate-x-1/2 h-1 bg-on-surface/5 blur-md rounded-full"></div>
              </div>

              {/* Dynamic Quote beneath Coffee Mug */}
              <div className="pt-4 px-4 min-h-[48px] flex items-center justify-center">
                <p className="text-xs italic font-serif text-primary/80 transition-all duration-500 ease-in-out text-center">
                  "{currentQuote}"
                </p>
              </div>

            </div>
          </section>

          {/* 2. THE MUSE (ABOUT & BIOGRAPHY) */}
          <section id="about" className="py-16 px-6 bg-[#f5f3ef] border-b border-outline-variant/20">
            <div className="max-w-sm mx-auto space-y-6">
              
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-tertiary/20"></div>
                <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-tertiary">
                  The Muse
                </span>
                <div className="h-px flex-1 bg-tertiary/20"></div>
              </div>

              {/* Dropped Capital Paragraph */}
              <p className="font-sans text-sm leading-relaxed text-on-surface-variant">
                <span className="font-serif text-3xl font-bold text-primary mr-1.5 float-left leading-[0.8]">
                  M
                </span>
                y journey as an author began with a simple belief: that every soul has a story that deserves a soft place to land. Through my creative explorations, I've sought to bridge the gap between human vulnerability and digital expression.
              </p>

              <p className="font-sans text-sm leading-relaxed text-on-surface-variant">
                Beyond the written word, I am deeply committed to social impact, collaborating with organizations like <span className="text-primary font-semibold">Marpu</span> and <span className="text-primary font-semibold">InAmigos Foundations</span> to foster community and growth through creative education.
              </p>

              {/* Cozy Blockquote card */}
              <div className="bg-surface-container p-6 border border-outline-variant/30 rounded-lg relative overflow-hidden">
                <div className="absolute top-1 right-2 opacity-5">
                  <span className="material-symbols-outlined text-5xl">format_quote</span>
                </div>
                <p className="italic font-serif text-sm md:text-base text-on-surface mb-3 leading-relaxed">
                  "Writing is not just a profession; it is a way of seeing the world in shades of wonder."
                </p>
                <p className="signature-font text-base text-primary font-bold">
                  — Jasmine Patra
                </p>
              </div>

            </div>
          </section>

          {/* 3. THE BOOKSHELF */}
          <section id="portfolio" className="py-16 px-6">
            <div className="max-w-sm mx-auto space-y-6">
              
              <div>
                <h3 className="font-serif text-xl font-bold text-on-surface mb-1">
                  The Bookshelf
                </h3>
                <div className="w-12 h-1 bg-tertiary-container rounded-full mb-3"></div>
                <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                  A curated collection of narratives and digital manuscripts. Click any volume below to open and read.
                </p>
              </div>

              {/* Book Spine Cards */}
              <div className="space-y-6">
                {BOOKS_DATA.map((book) => {
                  let badgeColor = "text-primary";
                  let cardBg = "bg-surface-container-highest";
                  
                  if (book.category === 'CONTENT') {
                    badgeColor = "text-secondary";
                    cardBg = "bg-surface-container";
                  } else if (book.category === 'JOURNAL') {
                    badgeColor = "text-tertiary";
                    cardBg = "bg-surface-container-low";
                  }

                  return (
                    <div 
                      key={book.id}
                      onClick={() => setActiveBook(book)}
                      className={`book-spine group relative border border-outline-variant/30 p-6 flex flex-col h-72 rounded-lg cursor-pointer overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${cardBg}`}
                    >
                      {/* Highlight Hover Layer */}
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        {book.iconName === 'auto_stories' && <span className="material-symbols-outlined text-primary text-xl font-bold">auto_stories</span>}
                        {book.iconName === 'edit_square' && <span className="material-symbols-outlined text-secondary text-xl font-bold">edit_square</span>}
                        {book.iconName === 'ink_pen' && <span className="material-symbols-outlined text-tertiary text-xl font-bold">ink_pen</span>}
                        
                        <span className={`text-[9px] font-label-sm uppercase font-bold tracking-widest ${badgeColor}`}>
                          {book.category}
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-lg text-on-surface mb-2 leading-tight group-hover:text-primary transition-colors">
                        {book.title}
                      </h4>
                      
                      <p className="font-sans text-xs text-on-surface-variant leading-relaxed line-clamp-3 mb-4">
                        {book.snippet}
                      </p>

                      <div className="flex items-center gap-1.5 mt-auto text-xs font-semibold text-primary group-hover:underline">
                        <span>{book.linkText}</span>
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Home-integrated BookPurchase Component */}
              <div className="pt-4">
                <BookPurchase />
              </div>

            </div>
          </section>

          {/* 4. PROCEDURAL AMBIENT SOUNDBOARD COMPONENT */}
          <section className="py-8 px-6 bg-[#f5f3ef]/50 border-t border-b border-outline-variant/10">
            <div className="max-w-sm mx-auto">
              <AmbientSoundboard />
            </div>
          </section>

          {/* 5. CORRESPONDENCE (GET IN TOUCH & COMPANIONS BOARD) */}
          <section id="contact" className="py-16 px-6 bg-surface-dim relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-primary/5 rounded-full blur-2xl"></div>
            
            <div className="max-w-sm mx-auto space-y-8 relative z-10">
              
              <div className="text-center space-y-2">
                <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-primary block">
                  Get in touch
                </span>
                <h3 className="font-serif text-2xl font-bold text-on-surface">
                  Correspondence
                </h3>
                <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                  Whether you have a story to share, a collaborative spark, or simply want to say hello, my mailbox is always open.
                </p>
              </div>

              {/* Dynamic Correspondence Board (Feed) */}
              <CorrespondenceBoard 
                messages={messages} 
                onDeleteMessage={handleDeleteMessage} 
              />

              {/* Form Card */}
              <form 
                onSubmit={handleFormSubmit}
                className="space-y-5 text-left bg-background p-6 border border-outline-variant/30 shadow-sm rounded-lg"
              >
                <h4 className="font-serif text-sm font-bold text-on-surface border-b border-outline-variant/15 pb-2 flex items-center gap-1.5">
                  <Feather size={14} className="text-[#7D8E7D]" />
                  Send your Letter
                </h4>

                {submissionError && (
                  <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded leading-relaxed font-sans">
                    {submissionError}
                  </div>
                )}

                {formSubmitted && (
                  <div className="p-3 text-xs text-[#3b4b3c] bg-[#f7fff3] border border-[#d5e7d4] rounded leading-relaxed font-sans flex items-start gap-1.5">
                    <CheckCircle size={14} className="text-[#506051] shrink-0 mt-0.5" />
                    <div>
                      <strong>Letter Sent!</strong> Your story has been safe-redacted and placed in the Sanctuary letterbox.
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-label-sm uppercase font-bold tracking-wider text-on-surface-variant block">
                    Name
                  </label>
                  <input 
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-surface-container-low border-b border-outline-variant focus:border-primary focus:outline-none px-2 py-2 text-xs font-sans transition-colors rounded-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-label-sm uppercase font-bold tracking-wider text-on-surface-variant block">
                    Email
                  </label>
                  <input 
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-surface-container-low border-b border-outline-variant focus:border-primary focus:outline-none px-2 py-2 text-xs font-sans transition-colors rounded-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-label-sm uppercase font-bold tracking-wider text-on-surface-variant block">
                    Your Story
                  </label>
                  <textarea 
                    value={formStory}
                    onChange={(e) => setFormStory(e.target.value)}
                    placeholder="What's on your mind? (Note: 12-digit IDs will be automatically masked for safety)"
                    rows={4}
                    className="w-full bg-surface-container-low border-b border-outline-variant focus:border-primary focus:outline-none px-2 py-2 text-xs font-sans transition-colors resize-none rounded-sm"
                  />
                </div>

                {/* Private switch */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="private-check"
                    checked={formPrivate}
                    onChange={(e) => setFormPrivate(e.target.checked)}
                    className="rounded border-outline-variant text-primary focus:ring-primary w-3.5 h-3.5"
                  />
                  <label htmlFor="private-check" className="text-[11px] font-sans text-on-surface-variant/80 cursor-pointer">
                    Keep this letter private (Only visible under "All Post")
                  </label>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/95 text-on-primary py-3 rounded-sm text-xs font-label-sm font-bold uppercase tracking-widest transition-all active:scale-[0.98] border border-primary-container cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send size={12} />
                  Send Message
                </button>
              </form>

            </div>
          </section>

        </main>

        {/* COMPREHENSIVE JOURNAL ARCHIVE DIALOG */}
        {journalOpen && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-[440px] bg-[#fdfbf7] border border-outline-variant/30 rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
              
              {/* Journal Header */}
              <div className="px-5 py-4 border-b border-outline-variant/20 flex items-center justify-between bg-[#f5f3ef]">
                <div className="flex items-center gap-2">
                  <Feather size={16} className="text-primary" />
                  <h3 className="font-serif text-base font-bold text-on-surface">
                    Sanctuary Journal Archive
                  </h3>
                </div>
                <button 
                  onClick={() => {
                    setJournalOpen(false);
                    setActiveJournalEntry(null);
                  }}
                  className="p-1.5 rounded-full hover:bg-stone-200/50 transition-colors text-on-surface-variant cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Journal Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {activeJournalEntry ? (
                  // Active Essay Reading mode
                  <div className="space-y-4 fade-in-up">
                    <button
                      onClick={() => setActiveJournalEntry(null)}
                      className="text-xs font-label-sm text-primary uppercase hover:underline flex items-center gap-1 mb-2 cursor-pointer"
                    >
                      ← Back to Archive
                    </button>
                    
                    <div className="space-y-2">
                      <span className="text-[9px] font-semibold text-secondary uppercase bg-secondary-container/20 px-2 py-0.5 rounded tracking-widest">
                        {activeJournalEntry.category}
                      </span>
                      <h4 className="font-serif font-bold text-lg text-on-surface leading-tight">
                        {activeJournalEntry.title}
                      </h4>
                      <div className="flex items-center gap-3 text-[10px] text-on-surface-variant/60 font-sans">
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {activeJournalEntry.date}
                        </span>
                        <span>•</span>
                        <span>{activeJournalEntry.readTime}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-outline-variant/15 text-xs md:text-sm font-serif leading-relaxed text-stone-800 whitespace-pre-line space-y-4">
                      {activeJournalEntry.content}
                    </div>

                    <div className="pt-6 border-t border-outline-variant/15 flex items-center justify-between text-[11px] text-stone-500 font-serif italic">
                      <span>Reflections by Jasmine Patra</span>
                      <span className="signature-font text-sm text-primary">J. Patra</span>
                    </div>
                  </div>
                ) : (
                  // List of essays
                  <div className="space-y-4">
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Welcome, companion. Here is the catalog of long-form thoughts written down inside the quiet rooms of the sanctuary:
                    </p>
                    
                    <div className="space-y-4">
                      {JOURNAL_ENTRIES.map((entry) => (
                        <div 
                          key={entry.id}
                          onClick={() => setActiveJournalEntry(entry)}
                          className="p-4 rounded-lg bg-[#f5f3ef]/60 border border-outline-variant/20 hover:border-primary/40 transition-all cursor-pointer group"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] font-semibold text-primary uppercase tracking-widest">
                              {entry.category}
                            </span>
                            <span className="text-[10px] text-on-surface-variant/55 font-sans">
                              {entry.date}
                            </span>
                          </div>
                          
                          <h4 className="font-serif font-bold text-sm text-on-surface group-hover:text-primary transition-colors leading-tight mb-2">
                            {entry.title}
                          </h4>
                          
                          <p className="text-[11px] text-on-surface-variant leading-relaxed line-clamp-2 mb-3">
                            {entry.snippet}
                          </p>
                          
                          <div className="text-[10px] font-semibold text-primary uppercase flex items-center gap-0.5 justify-end group-hover:underline">
                            <span>Read Essay</span>
                            <ChevronRight size={10} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Journal Footer */}
              <div className="px-5 py-3 bg-[#f5f3ef] border-t border-outline-variant/20 flex justify-between items-center text-[9px] text-on-surface-variant/60 font-sans">
                <span>INTENTIONAL READING</span>
                <span>{JOURNAL_ENTRIES.length} ARTICLES IN ARCHIVE</span>
              </div>
            </div>
          </div>
        )}

        {/* BOOK READER OVERLAY */}
        {activeBook && (
          <BookReader 
            book={activeBook} 
            onClose={() => setActiveBook(null)} 
          />
        )}

        {/* FOOTER */}
        <footer className="bg-surface-container border-t border-tertiary/10 p-6 text-center space-y-4">
          <h4 className="font-serif font-bold text-base text-primary">Jasmine Patra</h4>
          
          <div className="flex items-center justify-center space-x-6">
            <button 
              onClick={() => setJournalOpen(true)}
              className="text-[10px] font-label-sm uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              Journal
            </button>
            <button 
              onClick={() => handleDrawerLink('portfolio')}
              className="text-[10px] font-label-sm uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              Archive
            </button>
            <button 
              onClick={() => handleDrawerLink('contact')}
              className="text-[10px] font-label-sm uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              Inquiries
            </button>
          </div>

          <p className="text-[9px] font-label-sm uppercase tracking-wider text-secondary">
            © 2026 Jasmine Patra. Crafted in the Sanctuary.
          </p>
        </footer>

      </div>
    </div>
  );
}
