/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  Instagram, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Menu, 
  X,
  Scissors,
  Star
} from 'lucide-react';

const HOURS = [
  { day: 'Lundi', time: '8H00 - 18H00' },
  { day: 'Mardi', time: '8H00 - 18H00' },
  { day: 'Mercredi', time: '8H00 - 18H00' },
  { day: 'Jeudi', time: '8H00 - 18H00' },
  { day: 'Vendredi', time: '8H00 - 18H00' },
  { day: 'Samedi', time: '10H00 - 16H00' },
  { day: 'Dimanche', time: 'Fermé' },
];

const COLLECTIONS = [
  {
    id: 1,
    title: "Célébration",
    category: "Robes de Soirée",
    price: "Sur mesure",
    image: "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&q=80&w=1000",
  },
  {
    id: 2,
    title: "Savoir-Faire",
    category: "Tailleur Masculin",
    price: "Sur mesure",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=1000",
  },
  {
    id: 3,
    title: "Héritage",
    category: "Tenues Traditionnelles",
    price: "Sur mesure",
    image: "https://images.unsplash.com/photo-1572804013307-a75939c603fc?auto=format&fit=crop&q=80&w=1000",
  },
];

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-paper text-ink font-serif relative selection:bg-gold/30">
      {/* Structural Border Overlay (Visible on large screens) */}
      <div className="fixed inset-4 md:inset-8 border border-ink/5 pointer-events-none z-[100] hidden lg:block"></div>

      {/* Symmetric Header */}
      <header 
        className={`fixed w-full z-50 transition-all duration-700 px-6 md:px-16 flex items-center justify-between border-b border-ink/5 ${
          scrolled ? 'bg-paper/95 backdrop-blur-sm h-16 shadow-sm' : 'bg-paper h-20 md:h-24'
        }`}
      >
        {/* Left Nav (Desktop) */}
        <nav className="hidden md:flex gap-10 text-[10px] uppercase tracking-[0.25em] font-sans font-bold w-1/3">
          <a href="#collections" className="hover:text-gold transition-colors">Collections</a>
          <a href="#about" className="hover:text-gold transition-colors">L'Atelier</a>
        </nav>
        
        {/* Logo Middle */}
        <div className="w-full md:w-1/3 text-center flex flex-col items-center">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-gold mb-1" />
            <span className="text-xl md:text-2xl font-bold tracking-[0.4em] uppercase text-ink">NAHE</span>
          </div>
          <div className="text-[8px] md:text-[9px] uppercase tracking-[0.6em] opacity-40 -mt-1 font-sans font-bold">Haute Couture Traditionnelle</div>
        </div>

        {/* Right Nav (Desktop) */}
        <nav className="hidden md:flex gap-10 text-[10px] uppercase tracking-[0.25em] font-sans font-bold w-1/3 justify-end items-center">
          <a href="#contact" className="hover:text-gold transition-colors">Contact</a>
          <a href="#contact" className="px-5 py-2 border border-ink bg-ink text-white hover:bg-gold hover:border-gold transition-all">S'abonner</a>
        </nav>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-ink"
          onClick={() => setIsMenuOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-paper flex flex-col items-center justify-center p-12 overflow-hidden"
          >
            <button 
              className="absolute top-8 right-8 text-ink"
              onClick={() => setIsMenuOpen(false)}
            >
              <X className="w-8 h-8" />
            </button>
            <div className="flex flex-col items-center space-y-10 text-center">
              <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-bold">Menu Principal</span>
              <a href="#home" onClick={() => setIsMenuOpen(false)} className="text-4xl hover:italic transition-all">Accueil</a>
              <a href="#collections" onClick={() => setIsMenuOpen(false)} className="text-4xl hover:italic transition-all">Collections</a>
              <a href="#about" onClick={() => setIsMenuOpen(false)} className="text-4xl hover:italic transition-all">L'Atelier</a>
              <a href="#contact" onClick={() => setIsMenuOpen(false)} className="text-4xl text-gold italic">Contact</a>
            </div>
            
            <div className="absolute bottom-12 border-t border-ink/10 pt-8 w-2/3 text-center">
              <p className="text-[10px] tracking-[0.2em] uppercase font-sans font-bold opacity-40">Kinshasa • RDC</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-20 md:pt-24 flex flex-col gap-16 md:gap-24">
        
        {/* Balanced Asymmetry Hero */}
        <section id="home" className="px-6 md:px-16 flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-120px)] min-h-[600px] gap-8">
          {/* Main Large Column */}
          <div className="w-full lg:w-3/5 bg-soft-bg relative flex items-center justify-center overflow-hidden border border-ink/5">
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000" 
                alt="Nahe Couture" 
                className="w-full h-full object-cover opacity-15 mix-blend-multiply"
              />
            </div>
            <div className="relative z-10 text-center px-8 md:px-20 py-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              >
                <span className="block text-[10px] uppercase tracking-[0.4em] mb-6 font-sans font-extrabold text-gold">Nouvelle Collection</span>
                <h1 className="text-4xl md:text-6xl leading-[1.1] mb-8 italic font-light text-ink">
                  La Pureté des Lignes,<br />
                  Le Prestige du Raphia
                </h1>
                <div className="flex justify-center items-center gap-6">
                  <div className="h-px w-8 md:w-16 bg-ink/20"></div>
                  <a href="#collections" className="text-[10px] uppercase tracking-[0.3em] font-sans font-bold hover:text-gold transition-colors">Découvrir</a>
                  <div className="h-px w-8 md:w-16 bg-ink/20"></div>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Secondary Columns Grouped */}
          <div className="w-full lg:w-2/5 flex flex-col gap-8">
            <div className="flex-1 bg-muted-bg p-10 flex flex-col justify-between border border-ink/5 relative overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=1000" 
                alt="Details" 
                className="absolute inset-0 w-full h-full object-cover opacity-10 grayscale group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-12">
                  <span className="text-[9px] uppercase tracking-[0.3em] font-sans font-bold opacity-40">Inspiration • 24</span>
                  <Star className="w-3 h-3 text-gold" />
                </div>
                <h2 className="text-3xl mb-4 italic font-light">Minimalisme Traditionnel</h2>
                <p className="text-xs font-sans font-medium text-ink/60 leading-relaxed max-w-[280px]">
                  L'élégance de l'héritage congolais sublimée par le raffinement des coupes architecturales.
                </p>
              </div>
              <div className="relative z-10 pt-10">
                 <button className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold border-b border-ink/30 pb-1 hover:border-gold hover:text-gold transition-all">Consulter l'archive</button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Grid Section */}
        <section id="collections" className="px-6 md:px-16 container mx-auto">
          <div className="flex items-center justify-between border-b border-ink/5 pb-10 mb-12">
            <h2 className="text-[10px] uppercase tracking-[0.4em] font-sans font-extrabold text-ink">Nos Pièces Emblématiques</h2>
            <div className="h-px flex-1 mx-10 bg-ink/5 hidden md:block"></div>
            <a href="#" className="hidden lg:block text-[10px] uppercase tracking-[0.25em] font-sans font-bold hover:text-gold">Voir Tout</a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {COLLECTIONS.map((item) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="group cursor-pointer flex flex-col"
              >
                <div className="aspect-[4/5] bg-soft-bg mb-6 relative overflow-hidden flex items-center justify-center border border-ink/5">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 bg-paper/90 px-3 py-1.5 text-[8px] font-sans font-bold tracking-widest uppercase border border-ink/5">Sur Mesure</div>
                </div>
                <div className="text-center group-hover:translate-y-[-4px] transition-transform duration-500">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-sans font-bold opacity-40 mb-2 block">{item.category}</span>
                  <h3 className="text-sm uppercase tracking-[0.25em] font-bold text-ink mb-1 group-hover:text-gold transition-colors">{item.title}</h3>
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-[1px] w-4 bg-ink/10"></div>
                    <p className="text-[10px] font-sans font-medium text-ink/40 tracking-wider">Demander Devis</p>
                    <div className="h-[1px] w-4 bg-ink/10"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* L'Atelier (About) */}
        <section id="about" className="bg-soft-bg/30 py-24 px-6 md:px-16 border-y border-ink/5">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
            <div className="w-full lg:w-1/2 flex flex-col gap-10">
              <span className="text-[10px] uppercase tracking-[0.4em] font-sans font-extrabold text-gold underline underline-offset-8 decoration-1">L'Héritage Nahe</span>
              <h2 className="text-4xl md:text-5xl italic font-light text-ink leading-tight">
                Le Savoir-Faire <br />
                Au Cœur de Kinshasa
              </h2>
              <div className="space-y-8 text-sm md:text-base font-sans text-ink/60 leading-relaxed font-medium">
                <p>
                  Depuis sa fondation, la Maison NAHE s'est donné pour mission de préserver l'héritage textile de la République Démocratique du Congo tout en y insufflant une modernité audacieuse.
                </p>
                <p>
                  Chaque pièce qui sort de nos ateliers est le fruit d'un travail architectural minutieux. Nous sélectionnons les fibres les plus nobles et collaborons avec des artisans locaux pour garantir une authenticité sans compromis.
                </p>
              </div>
              <div className="flex gap-16 pt-6">
                <div>
                  <div className="text-2xl md:text-3xl italic mb-1">10+</div>
                  <p className="text-[9px] uppercase tracking-[0.2em] font-sans font-bold opacity-40">Années d'Expertise</p>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl italic mb-1">100%</div>
                  <p className="text-[9px] uppercase tracking-[0.2em] font-sans font-bold opacity-40">Fait Main</p>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
              <div className="aspect-[4/5] w-full max-w-[400px] border border-ink/5 p-4 bg-paper shadow-sm">
                <div className="w-full h-full overflow-hidden grayscale">
                  <img 
                    src="https://images.unsplash.com/photo-1574015974293-817f0ebebb74?auto=format&fit=crop&q=80&w=1200" 
                    alt="Atelier Crafts" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Strip */}
        <section id="contact" className="px-6 md:px-16 container mx-auto pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Hours */}
            <div className="lg:col-span-5 bg-paper border border-ink/5 p-12">
              <h3 className="text-xl uppercase tracking-[0.3em] font-bold text-ink mb-10 border-b border-ink/5 pb-6">Heures d'Atelier</h3>
              <div className="space-y-6 font-sans">
                {HOURS.map((h) => (
                  <div key={h.day} className="flex justify-between items-center text-[11px] uppercase tracking-widest font-bold">
                    <span className="text-ink/60">{h.day}</span>
                    <span className={h.time === 'Fermé' ? 'text-red-800' : 'text-ink'}>{h.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Details */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-16">
              <div>
                <h3 className="text-3xl italic font-light text-ink mb-6">Contactez la Maison</h3>
                <p className="text-xs font-sans font-semibold text-ink/50 tracking-widest leading-relaxed uppercase">
                  Pour vos commandes sur mesure et vos essayages privés au cœur de Kinshasa.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase tracking-[0.3em] font-sans font-extrabold text-gold">Adresse</h4>
                  <p className="text-sm italic text-ink/70">Kinshasa, République Démocratique du Congo</p>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase tracking-[0.3em] font-sans font-extrabold text-gold">Téléphone</h4>
                  <p className="text-sm font-sans font-bold tracking-widest">+243 810 700 670</p>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase tracking-[0.3em] font-sans font-extrabold text-gold">Instagram</h4>
                  <p className="text-sm font-sans font-bold tracking-widest">@NAHE_OFFICIEL</p>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase tracking-[0.3em] font-sans font-extrabold text-gold">Suivi</h4>
                  <div className="flex gap-4">
                    <Instagram className="w-4 h-4 text-ink hover:text-gold cursor-pointer" />
                    <Phone className="w-4 h-4 text-ink hover:text-gold cursor-pointer" />
                    <MapPin className="w-4 h-4 text-ink hover:text-gold cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Minimalist */}
      <footer className="h-24 md:h-32 px-6 md:px-16 border-t border-ink/5 flex flex-col md:flex-row items-center justify-between bg-paper relative z-10">
        <div className="hidden md:flex gap-10 text-[9px] uppercase tracking-[0.25em] font-sans font-bold opacity-40">
          <a href="#" className="hover:text-gold hover:opacity-100 transition-all">Instagram</a>
          <a href="#" className="hover:text-gold hover:opacity-100 transition-all">Journal</a>
          <a href="#" className="hover:text-gold hover:opacity-100 transition-all">Atelier</a>
        </div>
        
        <div className="text-[9px] uppercase tracking-[0.3em] font-sans font-extrabold text-ink/40 text-center md:text-left my-4 md:my-0">
          © 2024 NAHE HAUTE COUTURE — TOUS DROITS RÉSERVÉS
        </div>

        <div className="flex items-center gap-6">
          <span className="text-[9px] uppercase tracking-[0.25em] font-sans font-bold opacity-40">Newsletter</span>
          <div className="w-24 md:w-40 h-[1px] bg-ink/10"></div>
          <motion.div 
            whileHover={{ rotate: 180 }}
            className="w-8 h-8 flex items-center justify-center border border-ink/10 rounded-full cursor-pointer hover:border-gold"
          >
             <Star className="w-3 h-3 text-gold" />
          </motion.div>
        </div>
      </footer>

      {/* Decorative Structural Elements */}
      <div className="fixed bottom-10 left-10 z-[101] hidden xl:block pointer-events-none">
        <div className="text-[8px] uppercase tracking-[0.5em] font-sans font-bold text-ink/20 transform rotate-90 origin-left">
          Artisanat d'Excellence
        </div>
      </div>
    </div>
  );
}
