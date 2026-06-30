import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion } from 'motion/react';
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
import ConnectCollaborate from './components/ConnectCollaborate';
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
  Heart,
  Download,
  Award,
  FileText,
  Briefcase,
  GraduationCap,
  ExternalLink,
  MapPin
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
  const [isSending, setIsSending] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);

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
    setFormSubmitted(false);

    if (!formName.trim() || !formEmail.trim() || !formStory.trim()) {
      setSubmissionError('Please fill in all requested fields of the correspondence form.');
      return;
    }

    setIsSending(true);

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

    try {
      // Connect to the Sheet.best API with a POST request
      const response = await fetch('https://api.sheetbest.com/sheets/c93fb017-30ae-43d3-8754-f6f4b70e8a50', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "Timestamp": newMessage.timestamp,
          "Name": newMessage.name,
          "Email": newMessage.email,
          "Your Story": newMessage.story
        })
      });

      if (!response.ok) {
        throw new Error('API response was not successful');
      }

      // If successful, save locally as well
      const updated = [newMessage, ...messages];
      setMessages(updated);
      localStorage.setItem('cozy_sanctuary_letters', JSON.stringify(updated));

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

    } catch (err) {
      console.error('Sheet.best submission error:', err);
      setSubmissionError('Unable to transmit your letter to the sanctuary database. Please check your network connection and try again.');
    } finally {
      setIsSending(false);
    }
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
        <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-outline-variant/30 px-5 py-2 flex items-center justify-between">
          <button 
            onClick={() => setDrawerOpen(true)}
            className="w-11 h-11 -ml-2 rounded-full hover:bg-stone-200/50 transition-colors text-primary active:scale-95 cursor-pointer flex items-center justify-center"
            aria-label="Open Archive Index"
          >
            <Menu size={20} />
          </button>
          
          <h1 className="font-serif text-lg font-bold text-primary tracking-tight">
            Jasmine Patra
          </h1>

          <button 
            onClick={() => setJournalOpen(true)}
            className="w-11 h-11 -mr-2 rounded-full hover:bg-stone-200/50 transition-colors text-primary active:scale-95 cursor-pointer flex items-center justify-center"
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
          
          {/* SECTION 1: THE PHILOSOPHY (Full-Screen) */}
          <section id="philosophy" className="relative min-h-[calc(100vh-60px)] px-6 py-12 flex flex-col items-center justify-center text-center overflow-hidden border-b border-outline-variant/10 bg-[#282622] text-[#efede9]">
            {/* Ambient vignette background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.15),transparent_70%)] pointer-events-none"></div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="relative z-10 max-w-sm mx-auto space-y-6 flex flex-col items-center justify-center"
            >
              <div className="w-10 h-10 rounded-full border border-[#efede9]/20 flex items-center justify-center mb-1">
                <Compass size={18} className="text-secondary-fixed-dim" />
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl leading-tight font-bold text-[#f5f2eb] tracking-tight">
                Curiosity in <br/>Every Season
              </h2>
              <div className="w-8 h-0.5 bg-secondary-fixed-dim/40 rounded"></div>
              <p className="font-serif italic text-xs sm:text-sm text-[#d5d2cb] max-w-xs leading-relaxed">
                "Every season of life carries its own secret, its own story waiting to be written down in the quiet corners of our hearts."
              </p>
              
              {/* Scrolling Indicator */}
              <div 
                onClick={() => {
                  const element = document.getElementById('hero');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="pt-8 animate-bounce text-[#efede9]/50 hover:text-primary-fixed-dim cursor-pointer transition-colors"
              >
                <span className="text-[10px] tracking-widest uppercase font-sans font-semibold block mb-1">Enter Sanctuary</span>
                <span className="material-symbols-outlined text-sm">keyboard_double_arrow_down</span>
              </div>
            </motion.div>
          </section>

          {/* SECTION 2: PROFESSIONAL HERO */}
          <section id="hero" className="relative min-h-[calc(100vh-80px)] px-6 py-12 flex flex-col items-center justify-center text-center overflow-hidden border-b border-outline-variant/10">
            <div className="relative z-10 max-w-sm mx-auto space-y-6 flex flex-col items-center justify-center">
              
              <span className="text-[9px] font-sans font-bold tracking-widest text-[#7D8E7D] uppercase bg-[#7D8E7D]/10 px-3 py-1 rounded-full">
                Creative Portfolio
              </span>

              <h2 className="font-serif text-[26px] sm:text-[30px] leading-tight font-bold text-on-surface">
                Jasmine Patra | <br/>
                <span className="italic text-primary underline decoration-tertiary-fixed-dim/70 decoration-2 underline-offset-4">
                  Creative Writer & Published Author
                </span>
              </h2>
              
              <p className="font-sans text-xs sm:text-sm leading-relaxed text-on-surface-variant max-w-xs">
                Commerce student passionate about storytelling, content strategy, and community engagement.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-row items-center gap-3 w-full max-w-[280px] pt-2">
                <button 
                  onClick={() => setResumeOpen(true)}
                  className="flex-1 bg-primary hover:bg-primary/95 text-on-primary py-3 px-4 rounded-sm text-[10px] font-sans font-bold uppercase tracking-widest transition-all active:scale-[0.98] border border-primary-container shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download size={12} />
                  <span>Download Resume</span>
                </button>
                <button 
                  onClick={() => {
                    const el = document.getElementById('contact');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex-1 bg-surface-container hover:bg-surface-container-high text-primary py-3 px-4 rounded-sm text-[10px] font-sans font-bold uppercase tracking-widest transition-all active:scale-[0.98] border border-outline-variant/30 shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Mail size={12} />
                  <span>Contact Me</span>
                </button>
              </div>

              {/* Cozy Coffee Interaction Card (Retained) */}
              <div className="pt-8 relative">
                <button 
                  onClick={handleCoffeeClick}
                  className={`w-16 h-16 mx-auto rounded-full bg-surface-container shadow-inner border border-outline-variant/20 flex items-center justify-center relative active:scale-95 transition-all cursor-pointer group ${
                    isBrewing ? 'animate-pulse ring-1 ring-primary-container' : 'hover:border-primary/40'
                  }`}
                  aria-label="Brew deep thoughts"
                >
                  <Coffee size={24} className={`transition-colors ${isBrewing ? 'text-secondary' : 'text-primary group-hover:text-secondary'}`} />
                  
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
                <div className="absolute -bottom-2 w-24 left-1/2 -translate-x-1/2 h-1 bg-on-surface/5 blur-md rounded-full"></div>
              </div>

              {/* Dynamic Quote beneath Coffee Mug */}
              <div className="pt-2 px-4 min-h-[44px] flex items-center justify-center">
                <p className="text-[11px] italic font-serif text-primary/80 transition-all duration-500 ease-in-out text-center">
                  "{currentQuote}"
                </p>
              </div>

            </div>
          </section>

          {/* SECTION 2.5: ABOUT ME & THE JOURNEY (Professional & Intimate About) */}
          <section id="about" className="py-16 px-6 bg-[#f5f3ef] border-b border-outline-variant/20">
            <div className="max-w-sm mx-auto space-y-6">
              
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-tertiary/20"></div>
                <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-tertiary">
                  The Journey
                </span>
                <div className="h-px flex-1 bg-tertiary/20"></div>
              </div>

              {/* Split layout simulation with Portrait Frame and Narrative Story */}
              <div className="space-y-6">
                
                {/* Custom Crafted Portrait Illustration Frame */}
                <div className="relative p-3 bg-white border border-outline-variant/30 rounded shadow-md max-w-[210px] mx-auto transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="relative aspect-square w-full rounded-sm overflow-hidden bg-[#7D8E7D]/15 flex flex-col items-center justify-center border border-stone-200">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.4),transparent_80%)]"></div>
                    <span className="font-serif italic text-4xl font-bold text-primary tracking-tighter">JP</span>
                    <p className="text-[9px] uppercase font-sans tracking-widest font-bold text-primary mt-1">Jasmine Patra</p>
                    <div className="flex items-center justify-center gap-1 mt-2.5 text-secondary">
                      <Feather size={10} />
                      <span className="text-[8px] uppercase tracking-wider font-sans font-semibold">Author & Strategist</span>
                    </div>
                  </div>
                  <p className="text-[9px] text-stone-500 italic font-serif text-center mt-2.5">
                    "Lost in the world of words..."
                  </p>
                </div>

                {/* Cozy Narrative Introduction */}
                <div className="text-left space-y-4">
                  <p className="font-serif italic text-sm text-primary leading-relaxed text-center font-medium">
                    "I spend my mornings in commerce lectures and my evenings lost in the world of words."
                  </p>
                  
                  <div className="h-px bg-stone-300/45 w-16 mx-auto"></div>

                  <p className="font-sans text-xs sm:text-sm leading-relaxed text-on-surface-variant">
                    As a Commerce student and published author, I bridge the gap between creative storytelling and professional content strategy. With experience in NGO-led social impact and a track record of winning literary competitions, I specialize in crafting compelling narratives that resonate with diverse audiences.
                  </p>
                </div>

              </div>

              {/* Cozy Blockquote card */}
              <div className="bg-surface-container p-6 border border-outline-variant/30 rounded-lg relative overflow-hidden text-left">
                <div className="absolute top-1 right-2 opacity-5">
                  <span className="material-symbols-outlined text-5xl">format_quote</span>
                </div>
                <p className="italic font-serif text-xs md:text-sm text-on-surface mb-3 leading-relaxed">
                  "Writing is not just a profession; it is a way of seeing the world in shades of wonder."
                </p>
                <p className="signature-font text-xs text-primary font-bold">
                  — Jasmine Patra
                </p>
              </div>

            </div>
          </section>

          {/* SECTION 3: MY CREATIVE PILLARS (Clickable Categories) */}
          <section id="pillars" className="py-16 px-6 border-b border-outline-variant/15 bg-background">
            <div className="max-w-sm mx-auto space-y-6">
              
              <div className="text-center space-y-1.5">
                <h3 className="font-serif text-lg font-bold text-on-surface">My Creative Pillars</h3>
                <p className="text-xs text-on-surface-variant font-sans">Three pathways of work and dedication. Click a pillar to explore.</p>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                
                {/* 1. Author Pillar */}
                <div 
                  onClick={() => {
                    const el = document.getElementById('portfolio');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group cursor-pointer p-3.5 bg-surface-container-low border border-outline-variant/20 rounded-md hover:border-[#7D8E7D] hover:bg-[#7D8E7D]/5 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col items-center justify-between text-center min-h-[140px]"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <BookOpen size={14} />
                  </div>
                  <div className="space-y-1 mt-2 flex-1 flex flex-col justify-center">
                    <h4 className="font-serif font-bold text-xs text-on-surface">Author</h4>
                    <p className="text-[9px] text-on-surface-variant leading-tight">BriBooks storefront and published novels.</p>
                  </div>
                  <span className="text-[8px] font-sans uppercase tracking-widest text-[#7D8E7D] font-bold group-hover:underline mt-2">
                    Open Shop →
                  </span>
                </div>

                {/* 2. Writer Pillar */}
                <div 
                  onClick={() => {
                    const el = document.getElementById('experience');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group cursor-pointer p-3.5 bg-surface-container-low border border-outline-variant/20 rounded-md hover:border-[#7D8E7D] hover:bg-[#7D8E7D]/5 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col items-center justify-between text-center min-h-[140px]"
                >
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                    <Feather size={14} />
                  </div>
                  <div className="space-y-1 mt-2 flex-1 flex flex-col justify-center">
                    <h4 className="font-serif font-bold text-xs text-on-surface">Writer</h4>
                    <p className="text-[9px] text-on-surface-variant leading-tight">NGO chronicles and freelance stories.</p>
                  </div>
                  <span className="text-[8px] font-sans uppercase tracking-widest text-[#7D8E7D] font-bold group-hover:underline mt-2">
                    See Work →
                  </span>
                </div>

                {/* 3. Student Pillar */}
                <div 
                  onClick={() => setResumeOpen(true)}
                  className="group cursor-pointer p-3.5 bg-surface-container-low border border-outline-variant/20 rounded-md hover:border-[#7D8E7D] hover:bg-[#7D8E7D]/5 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col items-center justify-between text-center min-h-[140px]"
                >
                  <div className="w-8 h-8 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform">
                    <GraduationCap size={14} />
                  </div>
                  <div className="space-y-1 mt-2 flex-1 flex flex-col justify-center">
                    <h4 className="font-serif font-bold text-xs text-on-surface">Student</h4>
                    <p className="text-[9px] text-on-surface-variant leading-tight">Academic journey & professional resume.</p>
                  </div>
                  <span className="text-[8px] font-sans uppercase tracking-widest text-[#7D8E7D] font-bold group-hover:underline mt-2">
                    Resume CV →
                  </span>
                </div>

              </div>

            </div>
          </section>

          {/* SECTION 4: CASE STUDY EXPERIENCE */}
          <section id="experience" className="py-16 px-6 bg-[#fcfbfa] border-b border-outline-variant/15">
            <div className="max-w-sm mx-auto space-y-6">
              
              <div className="text-left space-y-1">
                <span className="text-[9px] font-sans font-bold tracking-widest text-primary uppercase">
                  Case Studies
                </span>
                <h3 className="font-serif text-lg font-bold text-on-surface">Experience & Impact</h3>
                <div className="w-8 h-0.5 bg-[#7D8E7D] rounded mt-1"></div>
              </div>

              {/* 2-Column Experience Grid (rendered cleanly as list/stack) */}
              <div className="space-y-4">
                
                {/* Case Study 1 */}
                <div className="p-4 bg-white border border-stone-200/80 rounded shadow-xs hover:shadow-sm transition-shadow text-left">
                  <div className="flex items-start gap-2.5 mb-2">
                    <div className="p-1.5 bg-[#7D8E7D]/10 rounded text-[#7D8E7D] mt-0.5">
                      <BookOpen size={12} />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-xs text-on-surface">Published Author</h4>
                      <p className="text-[10px] text-stone-500 font-sans">The Mask of Happiness</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed mb-3">
                    Wrote and published an emotional fiction novel dealing with vulnerability and mental well-being, reaching global readers.
                  </p>
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase font-sans tracking-widest font-bold text-primary">Core Skills:</p>
                    <ul className="text-[10px] text-stone-600 space-y-1 list-disc list-inside">
                      <li>Novel plot architecture & outlining</li>
                      <li>In-depth character development maps</li>
                      <li>Creative publishing and editing</li>
                      <li>Storytelling for emotional engagement</li>
                    </ul>
                  </div>
                </div>

                {/* Case Study 2 */}
                <div className="p-4 bg-white border border-stone-200/80 rounded shadow-xs hover:shadow-sm transition-shadow text-left">
                  <div className="flex items-start gap-2.5 mb-2">
                    <div className="p-1.5 bg-secondary/10 rounded text-secondary mt-0.5">
                      <Briefcase size={12} />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-xs text-on-surface">InAmigos Foundation</h4>
                      <p className="text-[10px] text-stone-500 font-sans">Content Writing Internship</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed mb-3">
                    Managed digital community content creation, drafting editorial blog articles, newsletters, and engaging stories to promote social goals.
                  </p>
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase font-sans tracking-widest font-bold text-secondary">Core Skills:</p>
                    <ul className="text-[10px] text-stone-600 space-y-1 list-disc list-inside">
                      <li>Strategic editorial copywriting</li>
                      <li>Audience persona mapping</li>
                      <li>Newsletter drafting & outreach</li>
                      <li>Campaign blog content calendars</li>
                    </ul>
                  </div>
                </div>

                {/* Case Study 3 */}
                <div className="p-4 bg-white border border-stone-200/80 rounded shadow-xs hover:shadow-sm transition-shadow text-left">
                  <div className="flex items-start gap-2.5 mb-2">
                    <div className="p-1.5 bg-tertiary/10 rounded text-tertiary mt-0.5">
                      <Compass size={12} />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-xs text-on-surface">Marpu Foundation</h4>
                      <p className="text-[10px] text-stone-500 font-sans">NGO Insights Advocate</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed mb-3">
                    Conducted field and online research of grassroots education initiatives, composing narrative summaries and reports.
                  </p>
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase font-sans tracking-widest font-bold text-tertiary">Core Skills:</p>
                    <ul className="text-[10px] text-stone-600 space-y-1 list-disc list-inside">
                      <li>Grassroots research methodologies</li>
                      <li>Advocacy & impact report summaries</li>
                      <li>NGO community campaign strategy</li>
                      <li>Transfiguring field reports to story narratives</li>
                    </ul>
                  </div>
                </div>

                {/* Case Study 4 */}
                <div className="p-4 bg-white border border-stone-200/80 rounded shadow-xs hover:shadow-sm transition-shadow text-left">
                  <div className="flex items-start gap-2.5 mb-2">
                    <div className="p-1.5 bg-primary/10 rounded text-primary mt-0.5">
                      <Sparkles size={12} />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-xs text-on-surface">Public Speaking</h4>
                      <p className="text-[10px] text-stone-500 font-sans">School Anchoring & Assemblies</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed mb-3">
                    Anchored assemblies, annual days, and national-level school functions with excellent stage control, scripting eloquence, and presence.
                  </p>
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase font-sans tracking-widest font-bold text-primary">Core Skills:</p>
                    <ul className="text-[10px] text-stone-600 space-y-1 list-disc list-inside">
                      <li>Public speaking & voice modulation</li>
                      <li>Live crowd anchoring & stage control</li>
                      <li>Scriptwriting & program flow scheduling</li>
                      <li>Eloquence & active presentation skills</li>
                    </ul>
                  </div>
                </div>

              </div>

            </div>
          </section>

          {/* SECTION 5: SKILLS GRID */}
          <section id="skills" className="py-16 px-6 bg-surface-container-low border-b border-outline-variant/15">
            <div className="max-w-sm mx-auto space-y-6">
              
              <div className="text-left space-y-1">
                <span className="text-[9px] font-sans font-bold tracking-widest text-primary uppercase">
                  Capabilities
                </span>
                <h3 className="font-serif text-lg font-bold text-on-surface">Skills Directory</h3>
                <div className="w-8 h-0.5 bg-[#7D8E7D] rounded mt-1"></div>
              </div>

              <div className="space-y-4 text-left">
                
                {/* 1. Writing & Content */}
                <div className="p-3.5 bg-white border border-stone-200 rounded">
                  <h4 className="font-serif font-bold text-xs text-on-surface mb-2.5 flex items-center gap-1.5">
                    <Feather size={12} className="text-primary" />
                    <span>Writing & Content</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {['Creative Storytelling', 'Content Strategy', 'SEO Copywriting', 'Editorial Planning', 'Ghostwriting', 'Manuscript Design'].map((s) => (
                      <span key={s} className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-xs font-sans">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 2. Design & Tools */}
                <div className="p-3.5 bg-white border border-stone-200 rounded">
                  <h4 className="font-serif font-bold text-xs text-on-surface mb-2.5 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-secondary" />
                    <span>Design & Tools</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {['Canva Pro', 'Notion Workspace', 'Google Suite', 'Markdown', 'Git/Vite Basics', 'Storyboards'].map((s) => (
                      <span key={s} className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-xs font-sans">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 3. Languages */}
                <div className="p-3.5 bg-white border border-stone-200 rounded">
                  <h4 className="font-serif font-bold text-xs text-on-surface mb-2.5 flex items-center gap-1.5">
                    <Compass size={12} className="text-tertiary" />
                    <span>Languages</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {['English (Fluent)', 'Hindi (Native)', 'Odia (Mother Tongue)'].map((s) => (
                      <span key={s} className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-xs font-sans font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </section>

          {/* SECTION 6: AWARDS GRID */}
          <section id="awards" className="py-16 px-6 bg-background border-b border-outline-variant/15">
            <div className="max-w-sm mx-auto space-y-6">
              
              <div className="text-center space-y-1">
                <span className="text-[9px] font-sans font-bold tracking-widest text-primary uppercase">
                  Honors
                </span>
                <h3 className="font-serif text-lg font-bold text-on-surface">Awards & Recognition</h3>
                <p className="text-[11px] text-on-surface-variant font-sans">Achievements in writing, debate, and independent publishing.</p>
              </div>

              {/* 3-Item Awards Grid */}
              <div className="grid grid-cols-1 gap-3.5 text-left">
                
                {/* Award 1 */}
                <div className="p-4 bg-white border border-stone-200 rounded shadow-xs relative overflow-hidden">
                  <div className="absolute right-3 top-3 opacity-15 text-primary">
                    <Award size={28} />
                  </div>
                  <span className="text-[8px] font-sans font-bold tracking-widest text-[#7D8E7D] uppercase">Writing</span>
                  <h4 className="font-serif font-bold text-xs text-on-surface mt-1">1st Prize Winner</h4>
                  <p className="text-[10px] text-stone-500 font-sans">National Literary Creative Writing Competition</p>
                  <p className="text-[11px] text-on-surface-variant mt-1.5 leading-relaxed">
                    Acknowledged at the state level for creative execution in emotional storytelling essays.
                  </p>
                </div>

                {/* Award 2 */}
                <div className="p-4 bg-white border border-stone-200 rounded shadow-xs relative overflow-hidden">
                  <div className="absolute right-3 top-3 opacity-15 text-secondary">
                    <Award size={28} />
                  </div>
                  <span className="text-[8px] font-sans font-bold tracking-widest text-[#7D8E7D] uppercase">Debate</span>
                  <h4 className="font-serif font-bold text-xs text-on-surface mt-1">Distinguished Speaker</h4>
                  <p className="text-[10px] text-stone-500 font-sans">Regional Literary and Debate Meets</p>
                  <p className="text-[11px] text-on-surface-variant mt-1.5 leading-relaxed">
                    Recognized for eloquent stage presence and strong argumentation in scholastic public panels.
                  </p>
                </div>

                {/* Award 3 */}
                <div className="p-4 bg-white border border-stone-200 rounded shadow-xs relative overflow-hidden">
                  <div className="absolute right-3 top-3 opacity-15 text-tertiary">
                    <Award size={28} />
                  </div>
                  <span className="text-[8px] font-sans font-bold tracking-widest text-[#7D8E7D] uppercase">Publishing</span>
                  <h4 className="font-serif font-bold text-xs text-on-surface mt-1">Young Published Author</h4>
                  <p className="text-[10px] text-stone-500 font-sans">BriBooks Emerging Writer Recognition</p>
                  <p className="text-[11px] text-on-surface-variant mt-1.5 leading-relaxed">
                    Celebrated for releasing the physical and digital novel "The Mask of Happiness" before the age of 21.
                  </p>
                </div>

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
                    disabled={isSending}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-surface-container-low border-b border-outline-variant focus:border-primary focus:outline-none px-2 py-2 text-xs font-sans transition-colors rounded-sm disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-label-sm uppercase font-bold tracking-wider text-on-surface-variant block">
                    Email
                  </label>
                  <input 
                    type="email"
                    disabled={isSending}
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-surface-container-low border-b border-outline-variant focus:border-primary focus:outline-none px-2 py-2 text-xs font-sans transition-colors rounded-sm disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-label-sm uppercase font-bold tracking-wider text-on-surface-variant block">
                    Your Story
                  </label>
                  <textarea 
                    disabled={isSending}
                    value={formStory}
                    onChange={(e) => setFormStory(e.target.value)}
                    placeholder="What's on your mind? (Note: 12-digit IDs will be automatically masked for safety)"
                    rows={4}
                    className="w-full bg-surface-container-low border-b border-outline-variant focus:border-primary focus:outline-none px-2 py-2 text-xs font-sans transition-colors resize-none rounded-sm disabled:opacity-50"
                  />
                </div>

                {/* Private switch */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    disabled={isSending}
                    id="private-check"
                    checked={formPrivate}
                    onChange={(e) => setFormPrivate(e.target.checked)}
                    className="rounded border-outline-variant text-primary focus:ring-primary w-3.5 h-3.5 disabled:opacity-50"
                  />
                  <label htmlFor="private-check" className="text-[11px] font-sans text-on-surface-variant/80 cursor-pointer">
                    Keep this letter private (Only visible under "All Post")
                  </label>
                </div>

                <button 
                  type="submit"
                  disabled={isSending}
                  className="w-full bg-primary hover:bg-primary/95 disabled:bg-primary/60 text-on-primary py-3 rounded-sm text-xs font-label-sm font-bold uppercase tracking-widest transition-all active:scale-[0.98] border border-primary-container cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Sending Letter...</span>
                    </>
                  ) : (
                    <>
                      <Send size={12} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>

              {/* Connect & Collaborate Social Section */}
              <ConnectCollaborate />

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

        {/* INTERACTIVE RESUME MODAL */}
        {resumeOpen && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-[450px] bg-[#fdfbf7] border border-outline-variant/30 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-outline-variant/20 flex items-center justify-between bg-[#f5f3ef] shrink-0">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-[#7D8E7D]" />
                  <h3 className="font-serif text-sm font-bold text-on-surface">
                    Jasmine Patra — Resume
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => window.print()}
                    className="p-1.5 rounded hover:bg-stone-200/50 transition-colors text-primary flex items-center gap-1 cursor-pointer text-[10px] font-sans font-bold uppercase tracking-wider"
                    title="Print CV"
                  >
                    <Download size={12} />
                    <span>Print</span>
                  </button>
                  <button 
                    onClick={() => setResumeOpen(false)}
                    className="p-1.5 rounded-full hover:bg-stone-200/50 transition-colors text-on-surface-variant cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Resume Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left font-sans select-text">
                
                {/* Header Information */}
                <div className="text-center space-y-2 border-b border-stone-200 pb-5">
                  <h2 className="font-serif text-2xl font-bold text-primary tracking-tight">Jasmine Patra</h2>
                  <p className="text-[11px] uppercase tracking-widest text-stone-500 font-bold font-sans">
                    Creative Writer & Content Strategist
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-stone-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Mail size={10} />
                      pitambarpatra093@gmail.com
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={10} />
                      Rourkela, Odisha
                    </span>
                  </div>
                </div>

                {/* About Brief */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-stone-400 font-sans border-b border-stone-100 pb-1">Professional Profile</h4>
                  <p className="text-xs text-stone-700 leading-relaxed font-sans">
                    A commerce student with a deeply creative soul. Bridging the gap between creative storytelling, audience persona mapping, and narrative strategy, I craft authentic stories that spark community engagement and digital impact.
                  </p>
                </div>

                {/* Experience */}
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-stone-400 font-sans border-b border-stone-100 pb-1">Experience</h4>
                  
                  {/* Item 1 */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between items-start font-medium">
                      <h5 className="font-serif font-bold text-on-surface">Published Novelist ("The Mask of Happiness")</h5>
                      <span className="text-[9px] text-stone-500 font-sans font-semibold">2023 - Present</span>
                    </div>
                    <p className="text-[10px] text-primary italic font-serif">BriBooks Publishing</p>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      Wrote and promoted an independent novel on human resilience and vulnerability, leading marketing drives and editorial critiques.
                    </p>
                  </div>

                  {/* Item 2 */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between items-start font-medium">
                      <h5 className="font-serif font-bold text-on-surface">Content Writer Intern</h5>
                      <span className="text-[9px] text-stone-500 font-sans font-semibold">Short-term</span>
                    </div>
                    <p className="text-[10px] text-secondary italic font-serif">InAmigos Foundation (NGO)</p>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      Designed and composed social impact copies, newsletter stories, and digital outreach assets supporting children and community welfare.
                    </p>
                  </div>

                  {/* Item 3 */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between items-start font-medium">
                      <h5 className="font-serif font-bold text-on-surface">NGO Research Collaborator</h5>
                      <span className="text-[9px] text-stone-500 font-sans font-semibold">Collaborative</span>
                    </div>
                    <p className="text-[10px] text-tertiary italic font-serif">Marpu Foundation</p>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      Conducted research on community education frameworks and composed visual storytelling storyboards for donor awareness.
                    </p>
                  </div>
                </div>

                {/* Education */}
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-stone-400 font-sans border-b border-stone-100 pb-1">Education</h4>
                  <div className="text-xs">
                    <div className="flex justify-between items-start font-medium">
                      <h5 className="font-serif font-bold text-on-surface">Bachelor of Commerce (B.Com Student)</h5>
                      <span className="text-[9px] text-stone-500 font-sans font-semibold">Ongoing</span>
                    </div>
                    <p className="text-stone-600 text-[11px]">Specialization in Business Studies and Financial Accounting, focusing on Content Strategy in Commercial Landscapes.</p>
                  </div>
                </div>

                {/* Core Strengths */}
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-stone-400 font-sans border-b border-stone-100 pb-1">Capabilities</h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['Creative Writing', 'Content Management', 'Audience Personas', 'Canva Pro', 'SEO Copywriting', 'Stage Anchoring', 'Notion', 'English (Fluent)'].map((sk) => (
                      <span key={sk} className="text-[9px] bg-stone-100 text-stone-600 border border-stone-200/60 px-2 py-0.5 rounded font-sans font-medium">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-5 py-3 bg-[#f5f3ef] border-t border-outline-variant/20 flex justify-between items-center text-[9px] text-on-surface-variant/60 font-sans shrink-0">
                <span>VERIFIED PROFESSIONAL REFRESH</span>
                <span>SECURE CLIENT PROFILE</span>
              </div>
            </motion.div>
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
