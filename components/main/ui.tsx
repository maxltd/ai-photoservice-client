import { ChevronRight, Star } from 'lucide-react';
import { useState } from 'react';

export const SectionTitle = ({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) => (
  <div className="text-center mb-12">
    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{children}</h2>
    {subtitle && <p className="text-zinc-400 text-lg max-w-2xl mx-auto">{subtitle}</p>}
  </div>
);

export const GradientButton = ({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <button onClick={onClick} className={`bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 ${className}`}>
    {children}
  </button>
);

export const StyleCard = ({ image, title, subtitle, badge, badgeColor = 'bg-purple-600' }: any) => (
  <div className="group relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-all duration-300 hover:scale-105 cursor-pointer">
    <div className="aspect-4/5 overflow-hidden">
      <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
    </div>
    {badge && <span className={`absolute top-3 left-3 ${badgeColor} text-white text-xs font-semibold px-3 py-1 rounded-full`}>{badge}</span>}
    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 p-5">
      <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
      {subtitle && <p className="text-zinc-400 text-sm mb-3">{subtitle}</p>}
      <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full transition-colors">Попробовать</button>
    </div>
  </div>
);

export const IdeaCard = ({ image, title, count, isHit }: any) => (
  <div className="group relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-all duration-300 min-w-50 cursor-pointer">
    <div className="aspect-3/4 overflow-hidden">
      <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
    </div>
    {isHit && <span className="absolute top-3 left-3 bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Хит</span>}
    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 p-4">
      <h3 className="text-white font-medium text-sm mb-1">{title}</h3>
      {count && <p className="text-zinc-500 text-xs mb-2">{count} фото</p>}
      <button className="bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors">Создать</button>
    </div>
  </div>
);

export const TestimonialCard = ({ name, nickname, text }: any) => (
  <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">{name.charAt(0)}</div>
      <div><p className="text-white font-medium text-sm">{name}</p><p className="text-zinc-500 text-xs">{nickname}</p></div>
    </div>
    <div className="flex gap-1">{[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-green-500 text-green-500" />)}</div>
    <p className="text-zinc-300 text-sm leading-relaxed">{text}</p>
  </div>
);

export const FAQItem = ({ question, answer }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-zinc-800 py-4">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full text-left group">
        <span className="text-white font-medium group-hover:text-zinc-300 transition-colors">{question}</span>
        <ChevronRight className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && answer && <div className="mt-3 text-zinc-400 text-sm leading-relaxed">{answer}</div>}
    </div>
  );
};