import { useState } from 'react';
import { Linkedin, ArrowUpRight } from 'lucide-react';

export default function ConnectCollaborate() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="bg-surface-container-low/80 border border-outline-variant/35 p-5 rounded-lg space-y-3 shadow-xs transition-all duration-300"
      id="connect-collaborate"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded bg-primary/10 text-primary">
          <Linkedin size={18} />
        </div>
        <div className="space-y-1 text-left">
          <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-on-surface">
            Connect & Collaborate
          </h4>
          <p className="text-[11px] font-sans text-on-surface-variant/80 leading-relaxed">
            Let’s connect over stories and professional endeavors. Find my professional journey here.
          </p>
        </div>
      </div>

      <a
        href="https://www.linkedin.com/in/jasmine-patra-397411393/"
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-full py-2 px-3 rounded-sm text-[11px] font-label-sm uppercase tracking-widest font-bold border border-[#7D8E7D] text-[#7D8E7D] hover:bg-[#7D8E7D] hover:text-white transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <span>LinkedIn Profile</span>
        <ArrowUpRight size={12} className={`transition-transform duration-300 ${isHovered ? 'translate-x-0.5 -translate-y-0.5' : ''}`} />
      </a>
    </div>
  );
}
