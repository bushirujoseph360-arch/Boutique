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
  Star,
  LogIn,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { auth, db, loginWithGoogle, logout } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface Product {
  id: string;
  title: string;
  category: string;
  price: string;
  image: string;
  shopifyUrl: string;
}

interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  storyTitle: string;
  storyText: string;
  aboutTitle: string;
  aboutText: string;
  whatsappNumber: string;
  instagramUrl: string;
  apkUrl: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  heroTitle: "La Pureté des Lignes, Le Prestige du Raphia",
  heroSubtitle: "Depuis Kinshasa",
  storyTitle: "Derrière chaque Création, une Âme Voyageuse",
  storyText: "Née de la passion pour le textile brut et les silhouettes architecturales, NAHE n'est pas seulement une boutique, c'est un sanctuaire où l'histoire se tisse.",
  aboutTitle: "Le Geste Précis Au Cœur de Kinshasa",
  aboutText: "Depuis sa fondation, la Maison NAHE s'est donné pour mission de préserver l'héritage textile de la République Démocratique du Congo tout en y insufflant une modernité audacieuse.",
  whatsappNumber: "+243 810 700 670",
  instagramUrl: "https://instagram.com/__nahe___",
  apkUrl: ""
};

const HOURS = [
  { day: 'Lundi', time: '8H00 - 18H00' },
  { day: 'Mardi', time: '8H00 - 18H00' },
  { day: 'Mercredi', time: '8H00 - 18H00' },
  { day: 'Jeudi', time: '8H00 - 18H00' },
  { day: 'Vendredi', time: '8H00 - 18H00' },
  { day: 'Samedi', time: '10H00 - 16H00' },
  { day: 'Dimanche', time: 'Fermé' },
];

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [collections, setCollections] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [isManagementMode, setIsManagementMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(true);

  const isAdmin = user?.email === 'bushirujoseph360@gmail.com' && user?.emailVerified;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    // Auth Listener
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    // Test Connection
    const testConnection = async () => {
      try {
        const { getDocFromServer } = await import('firebase/firestore');
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    // Firestore Products Listener
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribeProducts = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setCollections(productsData);
      setIsProductsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'products');
      setIsProductsLoading(false);
    });

    // Firestore Settings Listener
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'main'), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data() as SiteSettings);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/main');
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribeAuth();
      unsubscribeProducts();
      unsubscribeSettings();
    };
  }, []);

  const addProduct = async () => {
    if (!isAdmin) return;
    try {
      await addDoc(collection(db, 'products'), {
        title: "Nouvelle Création",
        category: "Catégorie",
        price: "Prix",
        image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=1000",
        shopifyUrl: "#",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'products');
    }
  };

  const updateProduct = async (id: string, field: string, value: string) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'products', id), {
        [field]: value,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const updateSettings = async (field: keyof SiteSettings, value: string) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'settings', 'main'), {
        [field]: value
      });
    } catch (error) {
      // If document doesn't exist, try to set it
      try {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'settings', 'main'), {
          ...settings,
          [field]: value
        });
      } catch (innerError) {
        handleFirestoreError(innerError, OperationType.UPDATE, 'settings/main');
      }
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-serif relative selection:bg-gold/30">
      {/* Traditional Pattern Background Overlay */}
      <div className="fixed inset-0 pattern-kuba opacity-[0.03] pointer-events-none z-0"></div>

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
        <div className="w-full md:w-1/3 text-center flex flex-col items-center group">
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.2, rotate: 180 }}>
              <Scissors className="w-4 h-4 text-gold mb-1" />
            </motion.div>
            <span className="text-xl md:text-2xl font-bold tracking-[0.4em] uppercase text-ink">NAHE</span>
          </div>
          <div className="text-[8px] md:text-[9px] uppercase tracking-[0.6em] opacity-40 -mt-1 font-sans font-bold group-hover:text-terracotta transition-colors">Haute Couture Traditionnelle</div>
        </div>

        {/* Right Nav (Desktop) */}
        <nav className="hidden md:flex gap-8 text-[10px] uppercase tracking-[0.25em] font-sans font-bold w-1/3 justify-end items-center">
          <a href="https://nahe-couture.myshopify.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors flex items-center gap-1.5 px-3 py-1 bg-[#95bf47]/10 rounded-full border border-[#95bf47]/20">
            <span className="w-1.5 h-1.5 bg-[#95bf47] rounded-full animate-pulse"></span>
            Boutique
          </a>
          <a href="#contact" className="hover:text-gold transition-colors">Contact</a>
          
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[8px] opacity-40 lowercase">{user.email}</span>
                <button onClick={logout} className="text-terracotta hover:text-ink flex items-center gap-1">
                  <LogOut className="w-3 h-3" />
                  Quitter
                </button>
              </div>
              {user.photoURL && <img src={user.photoURL} alt="User" className="w-6 h-6 rounded-full border border-ink/10" />}
            </div>
          ) : (
            <button 
              onClick={loginWithGoogle}
              className="px-4 py-1.5 border border-ink bg-ink text-white hover:bg-terracotta hover:border-terracotta transition-all shadow-sm flex items-center gap-2"
            >
              <LogIn className="w-3 h-3" />
              Connexion
            </button>
          )}
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
            <div className="absolute inset-0 pattern-kuba opacity-[0.05] pointer-events-none"></div>
            <button 
              className="absolute top-8 right-8 text-ink"
              onClick={() => setIsMenuOpen(false)}
            >
              <X className="w-8 h-8" />
            </button>
            <div className="flex flex-col items-center space-y-8 text-center relative z-10 w-full px-6">
              <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-bold">Menu Principal</span>
              <a href="#home" onClick={() => setIsMenuOpen(false)} className="text-3xl hover:italic transition-all">Accueil</a>
              <a href="#collections" onClick={() => setIsMenuOpen(false)} className="text-3xl hover:italic transition-all">Collections</a>
              <a href="#about" onClick={() => setIsMenuOpen(false)} className="text-3xl hover:italic transition-all">L'Atelier</a>
              <a href="#contact" onClick={() => setIsMenuOpen(false)} className="text-3xl text-terracotta italic">Contact</a>
              
              <div className="pt-8 border-t border-ink/5 w-full">
                {user ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3">
                      {user.photoURL && <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full" />}
                      <span className="text-[10px] font-sans font-bold opacity-60 uppercase tracking-widest">{user.displayName || user.email}</span>
                    </div>
                    <button 
                      onClick={() => { logout(); setIsMenuOpen(false); }}
                      className="px-8 py-3 bg-paper border border-terracotta text-terracotta text-[10px] uppercase tracking-widest font-sans font-bold hover:bg-terracotta hover:text-white transition-all w-full"
                    >
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => { loginWithGoogle(); setIsMenuOpen(false); }}
                    className="px-8 py-3 bg-ink text-white text-[10px] uppercase tracking-widest font-sans font-bold hover:bg-terracotta transition-all w-full flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Connexion Google
                  </button>
                )}
              </div>
            </div>
            
            <div className="absolute bottom-12 border-t border-ink/10 pt-8 w-2/3 text-center">
              <p className="text-[10px] tracking-[0.2em] uppercase font-sans font-bold opacity-40">Kinshasa • RDC</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-20 md:pt-24 flex flex-col gap-16 md:gap-24 relative z-10">
        
        {/* Balanced Asymmetry Hero */}
        <section id="home" className="px-6 md:px-16 flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-120px)] min-h-[600px] gap-8">
          {/* Main Large Column */}
          <div className="w-full lg:w-3/5 bg-soft-bg relative flex items-center justify-center overflow-hidden border border-ink/5 group">
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000" 
                alt="Nahe Couture" 
                className="w-full h-full object-cover opacity-15 mix-blend-multiply group-hover:scale-110 transition-transform duration-[3s]"
              />
            </div>
            {/* Kuba Decorative Stripe */}
            <div className="absolute top-0 left-10 w-1 h-full bg-ink/5 md:block hidden"></div>
            
            <div className="relative z-10 text-center px-8 md:px-20 py-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              >
                <div className="flex flex-col items-center mb-6">
                  <Star className="w-4 h-4 text-terracotta fill-terracotta/20 mb-4" />
                  {isManagementMode ? (
                    <input 
                      type="text" 
                      value={settings.heroSubtitle} 
                      onChange={(e) => updateSettings('heroSubtitle', e.target.value)}
                      className="text-center bg-transparent border-b border-ink/20 text-[10px] uppercase tracking-[0.4em] font-sans font-extrabold text-ink opacity-60 focus:outline-none focus:border-terracotta mb-2"
                    />
                  ) : (
                    <span className="block text-[10px] uppercase tracking-[0.4em] font-sans font-extrabold text-ink opacity-60">{settings.heroSubtitle}</span>
                  )}
                </div>
                
                {isManagementMode ? (
                  <textarea 
                    value={settings.heroTitle} 
                    onChange={(e) => updateSettings('heroTitle', e.target.value)}
                    className="w-full text-center bg-transparent border-b border-ink/20 text-4xl md:text-6xl italic font-light text-ink focus:outline-none focus:border-terracotta mb-8 h-32 resize-none"
                  />
                ) : (
                  <h1 className="text-4xl md:text-6xl leading-[1.1] mb-8 italic font-light text-ink whitespace-pre-line">
                    {settings.heroTitle}
                  </h1>
                )}
                <div className="flex justify-center items-center gap-6 mt-4">
                  <div className="h-px w-8 md:w-16 bg-ink/20"></div>
                  <div className="flex flex-col items-center gap-4">
                    <a href="#collections" className="text-[10px] uppercase tracking-[0.3em] font-sans font-bold hover:text-terracotta transition-colors">Découvrir l'Âme</a>
                    
                    {/* APK Download Link */}
                    {settings.apkUrl && !isManagementMode && (
                      <a 
                        href={settings.apkUrl} 
                        className="text-[9px] px-4 py-2 bg-ink text-white uppercase tracking-[0.2em] font-sans font-bold hover:bg-terracotta transition-all rounded-full flex items-center gap-2"
                      >
                        <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14v-4H8l4-4 4 4h-3v4h-2z"/>
                        </svg>
                        Télécharger l'APK
                      </a>
                    )}

                    {isManagementMode && (
                      <div className="flex flex-col items-center gap-2">
                        <label className="text-[8px] uppercase tracking-widest opacity-40">Lien de l'APK (Android)</label>
                        <input 
                          type="text" 
                          value={settings.apkUrl} 
                          onChange={(e) => updateSettings('apkUrl', e.target.value)}
                          className="bg-transparent border border-ink/10 text-[9px] p-2 focus:outline-none focus:border-terracotta w-48 font-mono"
                          placeholder="https://...apk"
                        />
                      </div>
                    )}
                  </div>
                  <div className="h-px w-8 md:w-16 bg-ink/20"></div>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Secondary Columns Grouped */}
          <div className="w-full lg:w-2/5 flex flex-col gap-8">
            <div className="flex-1 bg-muted-bg p-10 flex flex-col justify-between border border-ink/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 pattern-kuba opacity-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=1000" 
                alt="Details" 
                className="absolute inset-0 w-full h-full object-cover opacity-10 grayscale group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-12">
                  <span className="text-[9px] uppercase tracking-[0.3em] font-sans font-bold text-terracotta">Tradition • 24</span>
                  <div className="w-6 h-6 border border-ink/20 flex items-center justify-center rounded-full">
                    <div className="w-1 h-1 bg-ink rounded-full"></div>
                  </div>
                </div>
                <h2 className="text-3xl mb-4 italic font-light">Minimalisme Ancestral</h2>
                <p className="text-xs font-sans font-medium text-ink/60 leading-relaxed max-w-[280px]">
                  L'élégance de l'héritage congolais sublimée par le raffinement des coupes architecturales et des matières brutes.
                </p>
              </div>
              <div className="relative z-10 pt-10">
                 <button className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold border-b border-ink/30 pb-1 hover:border-terracotta hover:text-terracotta transition-all">Consulter l'archive</button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Grid Section */}
        <section id="collections" className="px-6 md:px-16 container mx-auto relative">
          {/* Decorative Corner */}
          <div className="absolute top-0 left-0 w-20 h-20 border-l border-t border-terracotta/20 pointer-events-none hidden lg:block"></div>
          
          <div className="flex items-center justify-between border-b border-ink/5 pb-10 mb-12">
            <h2 className="text-[10px] uppercase tracking-[0.4em] font-sans font-extrabold text-ink flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-terracotta rotate-45"></span>
              La Boutique Nahe
            </h2>
            <div className="h-px flex-1 mx-10 bg-ink/5 hidden md:block"></div>
            <div className="flex items-center gap-4">
              {isAdmin && (
                <>
                  <button 
                    onClick={() => setIsManagementMode(!isManagementMode)}
                    className={`text-[9px] uppercase tracking-widest font-bold px-4 py-2 border transition-all ${isManagementMode ? 'bg-terracotta text-white border-terracotta font-sans' : 'border-ink/20 text-ink hover:border-terracotta font-sans'}`}
                  >
                    {isManagementMode ? 'Finir la Gestion' : 'Mode Gestion'}
                  </button>
                  {isManagementMode && (
                    <button 
                      onClick={addProduct}
                      className="text-[9px] uppercase tracking-widest font-bold px-4 py-2 bg-ink text-white hover:bg-terracotta transition-colors font-sans"
                    >
                      Ajouter Article
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {isProductsLoading ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-4">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full"
                />
                <p className="text-[10px] uppercase tracking-widest font-sans font-bold opacity-40">Chargement de la collection...</p>
              </div>
            ) : collections.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <p className="text-xl italic font-light opacity-60">La collection est en cours de préparation...</p>
                {isAdmin && (
                  <button 
                    onClick={addProduct}
                    className="mt-6 px-8 py-3 bg-ink text-white text-[10px] uppercase tracking-widest font-sans font-bold hover:bg-terracotta transition-all"
                  >
                    Ajouter le premier article
                  </button>
                )}
              </div>
            ) : collections.map((item) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="group cursor-pointer flex flex-col relative"
              >
                <div className="aspect-[4/5] bg-soft-bg mb-6 relative overflow-hidden flex items-center justify-center border border-ink/5">
                  <motion.img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover origin-center"
                    whileHover={{ scale: 1.15, rotate: 1, y: -5 }}
                    transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1] }}
                  />
                  <div className="absolute top-4 right-4 bg-paper/90 px-3 py-1.5 text-[8px] font-sans font-bold tracking-widest uppercase border border-ink/5 text-terracotta">Artisanat Pur</div>
                  
                  {isManagementMode && (
                    <div className="absolute inset-0 bg-ink/90 backdrop-blur-md p-6 flex flex-col gap-4 justify-center z-20">
                      <div className="space-y-1">
                        <label className="text-[8px] uppercase tracking-widest text-white/50 font-bold">URL de l'image</label>
                        <input 
                          type="text" 
                          value={item.image} 
                          onChange={(e) => updateProduct(item.id, 'image', e.target.value)}
                          className="w-full bg-white/10 border border-white/20 text-[10px] p-2 text-white font-mono focus:outline-none focus:border-terracotta"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] uppercase tracking-widest text-white/50 font-bold">Lien Shopify</label>
                        <input 
                          type="text" 
                          value={item.shopifyUrl} 
                          onChange={(e) => updateProduct(item.id, 'shopifyUrl', e.target.value)}
                          className="w-full bg-white/10 border border-white/20 text-[10px] p-2 text-white font-mono focus:outline-none focus:border-terracotta"
                          placeholder="https://nahe-couture.myshopify.com/..."
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-center transition-transform duration-500 flex flex-col items-center flex-1">
                  {isManagementMode ? (
                    <div className="w-full space-y-2 mb-4 px-2">
                      <input 
                        type="text" 
                        value={item.title} 
                        onChange={(e) => updateProduct(item.id, 'title', e.target.value)}
                        className="w-full text-center bg-transparent border-b border-ink/10 text-sm font-bold uppercase tracking-widest p-1 focus:outline-none focus:border-terracotta font-serif text-ink"
                        placeholder="Titre de l'article"
                      />
                      <input 
                        type="text" 
                        value={item.category} 
                        onChange={(e) => updateProduct(item.id, 'category', e.target.value)}
                        className="w-full text-center bg-transparent border-b border-ink/10 text-[9px] uppercase tracking-widest font-bold opacity-40 p-1 focus:outline-none focus:border-terracotta font-sans text-ink"
                        placeholder="Catégorie"
                      />
                      <input 
                        type="text" 
                        value={item.price} 
                        onChange={(e) => updateProduct(item.id, 'price', e.target.value)}
                        className="w-full text-center bg-transparent border-b border-ink/10 text-[10px] font-sans p-1 focus:outline-none focus:border-terracotta text-ink"
                        placeholder="Prix / Sur mesure"
                      />
                      <button 
                        onClick={() => deleteProduct(item.id)}
                        className="w-full py-1.5 mt-2 text-[8px] border border-red-200 text-red-600 uppercase tracking-widest hover:bg-red-50 font-sans font-bold transition-colors"
                      >
                        Supprimer cet article
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-[9px] uppercase tracking-[0.2em] font-sans font-bold opacity-40 mb-2 block">{item.category}</span>
                      <h3 className="text-sm uppercase tracking-[0.25em] font-bold text-ink mb-1 group-hover:text-terracotta transition-colors">{item.title}</h3>
                      <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="h-[1px] w-4 bg-ink/10"></div>
                        <p className="text-[10px] font-sans font-medium text-ink/40 tracking-wider whitespace-nowrap">{item.price}</p>
                        <div className="h-[1px] w-4 bg-ink/10"></div>
                      </div>
                    </>
                  )}
                  
                  {/* Shopify Payment Button */}
                  <a 
                    href={item.shopifyUrl !== "#" ? item.shopifyUrl : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-auto px-6 py-3 text-white text-[9px] uppercase tracking-[0.3em] font-sans font-bold transition-all flex items-center justify-center gap-2 group/btn shadow-sm w-full ${item.shopifyUrl === "#" ? "bg-ink/20 cursor-not-allowed opacity-50" : "bg-[#95bf47] hover:bg-[#82a33e] active:scale-95"}`}
                    onClick={(e) => {
                      if (item.shopifyUrl === "#") e.preventDefault();
                    }}
                  >
                    <span className="flex items-center gap-2">
                       <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.145 7.429L10.373 1.2a2.915 2.915 0 014.122 0l6.228 6.229a1.09 1.09 0 010 1.543l-1.543 1.543a.545.545 0 01-.771 0l-4.63-4.629a1.091 1.091 0 00-1.543 0l-4.63 4.63a.546.546 0 01-.77 0L5.3 8.972a1.09 1.09 0 010-1.543zM21.05 11.23a.545.545 0 00-.771 0l-5.46 5.46a1.091 1.091 0 01-1.543 0l-2.315-2.315a.545.545 0 00-.77 0l-.772.772a.545.545 0 000 .771l3.086 3.086a1.092 1.092 0 001.544 0l6.241-6.242a.545.545 0 000-.771l-.24-.241z"/>
                      </svg>
                      {item.shopifyUrl === "#" ? "Lien requis" : "Paiement Shopify"}
                    </span>
                    <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          {!isManagementMode && (
            <div className="mt-20 flex justify-center">
              <a 
                href="https://nahe-couture.myshopify.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-12 py-5 border border-ink text-ink text-[10px] uppercase tracking-[0.4em] font-sans font-bold hover:bg-ink hover:text-white transition-all group"
              >
                Accéder à toute la boutique <span className="text-[#95bf47] font-sans">&bull;</span> Shopify
              </a>
            </div>
          )}
        </section>

        {/* Matières Nobles Section (NEW) */}
        <section className="px-6 md:px-16 container mx-auto py-24 border-y border-ink/5 overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
             <div className="w-full lg:w-1/3">
               <span className="text-[10px] uppercase tracking-[0.4em] font-sans font-extrabold text-terracotta mb-6 block">Philosophie Textile</span>
               <h3 className="text-3xl italic font-light mb-8">Le Dialogue entre la Terre et l'Aiguille</h3>
               <p className="text-sm font-sans font-medium text-ink/60 leading-relaxed uppercase tracking-widest">
                 Chaque fibre raconte une histoire de patience, de respect et de transmission.
               </p>
             </div>
             <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-paper border border-ink/5 relative overflow-hidden group">
                  <div className="absolute bottom-0 right-0 w-32 h-32 pattern-kuba opacity-5"></div>
                  <h4 className="text-xl italic mb-4 text-terracotta">Le Raphia Tissé</h4>
                  <p className="text-xs font-sans text-ink/60 leading-relaxed font-medium">Extraite du palmier-raphia, cette fibre est le socle de nos créations les plus prestigieuses. Sa rigidité noble permet des volumes sculpturaux uniques.</p>
                </div>
                <div className="p-8 bg-paper border border-ink/5 relative overflow-hidden group">
                  <div className="absolute bottom-0 right-0 w-32 h-32 pattern-kuba opacity-5"></div>
                  <h4 className="text-xl italic mb-4 text-terracotta">L'Écorce Battue</h4>
                  <p className="text-xs font-sans text-ink/60 leading-relaxed font-medium">Une technique ancestrale qui transforme l'écorce en un textile souple au toucher organique, utilisé pour nos pièces d'exception.</p>
                </div>
             </div>
          </div>
        </section>

        {/* Derrière la Création (Brand Story) */}
        <section id="story" className="px-6 md:px-16 container mx-auto">
          <div className="flex flex-col lg:flex-row-reverse gap-16 items-center">
            <div className="w-full lg:w-1/2">
               <div className="relative aspect-[16/9] overflow-hidden border border-ink/5 group">
                  <img 
                    src="https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=1200" 
                    alt="Atelier Story" 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-terracotta/10 mix-blend-overlay"></div>
               </div>
            </div>
            <div className="w-full lg:w-1/2 space-y-8">
               {isManagementMode ? (
                 <>
                   <input 
                     type="text" 
                     value={settings.storySubtitle} 
                     onChange={(e) => updateSettings('storySubtitle' as any, e.target.value)}
                     className="bg-transparent border-b border-ink/20 text-[10px] uppercase tracking-[0.4em] font-sans font-extrabold text-terracotta focus:outline-none w-full"
                   />
                   <textarea 
                     value={settings.storyTitle} 
                     onChange={(e) => updateSettings('storyTitle', e.target.value)}
                     className="w-full bg-transparent border-b border-ink/20 text-4xl italic font-light leading-tight focus:outline-none resize-none h-24"
                   />
                   <textarea 
                     value={settings.storyText} 
                     onChange={(e) => updateSettings('storyText', e.target.value)}
                     className="w-full bg-transparent border-b border-ink/20 text-sm font-sans text-ink/60 leading-relaxed font-medium focus:outline-none h-32"
                   />
                 </>
               ) : (
                 <>
                   <span className="text-[10px] uppercase tracking-[0.4em] font-sans font-extrabold text-terracotta">L'Esprit de la Maison</span>
                   <h2 className="text-4xl italic font-light leading-tight">{settings.storyTitle}</h2>
                   <p className="text-sm font-sans text-ink/60 leading-relaxed font-medium">
                     {settings.storyText}
                   </p>
                 </>
               )}
               <div className="pt-4">
                  <a href="#about" className="text-[10px] uppercase tracking-[0.3em] font-sans font-bold text-ink border-b border-terracotta pb-1 hover:text-terracotta transition-colors">Notre Histoire Complète</a>
               </div>
            </div>
          </div>
        </section>

        {/* L'Atelier (About) */}
        <section id="about" className="bg-soft-bg/30 py-24 px-6 md:px-16 border-b border-ink/5 relative">
          <div className="absolute inset-0 pattern-kuba opacity-[0.02] pointer-events-none"></div>
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-20 items-center relative z-10">
            <div className="w-full lg:w-1/2 flex flex-col gap-10">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-[1px] bg-terracotta/40"></div>
                 {isManagementMode ? (
                   <input 
                     type="text" 
                     value={settings.aboutSubtitle} 
                     onChange={(e) => updateSettings('aboutSubtitle' as any, e.target.value)}
                     className="bg-transparent border-b border-ink/20 text-[10px] uppercase tracking-[0.4em] font-sans font-extrabold text-terracotta focus:outline-none"
                   />
                 ) : (
                   <span className="text-[10px] uppercase tracking-[0.4em] font-sans font-extrabold text-terracotta">L'Héritage Artisanal</span>
                 )}
              </div>
              
              {isManagementMode ? (
                <textarea 
                  value={settings.aboutTitle} 
                  onChange={(e) => updateSettings('aboutTitle', e.target.value)}
                  className="w-full bg-transparent border-b border-ink/20 text-4xl md:text-5xl italic font-light text-ink leading-tight focus:outline-none h-32 resize-none"
                />
              ) : (
                <h2 className="text-4xl md:text-5xl italic font-light text-ink leading-tight whitespace-pre-line">
                  {settings.aboutTitle}
                </h2>
              )}

              <div className="space-y-8 text-sm md:text-base font-sans text-ink/60 leading-relaxed font-medium">
                {isManagementMode ? (
                  <textarea 
                    value={settings.aboutText} 
                    onChange={(e) => updateSettings('aboutText', e.target.value)}
                    className="w-full bg-transparent border border-ink/10 text-sm p-4 h-64 focus:outline-none rounded-sm"
                  />
                ) : (
                  <p className="whitespace-pre-line">
                    {settings.aboutText}
                  </p>
                )}
              </div>
              <div className="flex gap-16 pt-6">
                <div className="group">
                  <div className="text-2xl md:text-3xl italic mb-1 group-hover:text-terracotta transition-colors">10+</div>
                  <p className="text-[9px] uppercase tracking-[0.2em] font-sans font-bold opacity-40">Années d'Expertise</p>
                </div>
                <div className="group">
                  <div className="text-2xl md:text-3xl italic mb-1 group-hover:text-terracotta transition-colors">100%</div>
                  <p className="text-[9px] uppercase tracking-[0.2em] font-sans font-bold opacity-40">Fait Main</p>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
              <div className="aspect-[4/5] w-full max-w-[400px] border-l-4 border-terracotta/20 p-4 bg-paper shadow-sm relative">
                <div className="absolute -top-4 -right-4 w-24 h-24 pattern-kuba opacity-10"></div>
                <div className="w-full h-full overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000">
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
            <div className="lg:col-span-5 bg-paper border border-ink/5 p-12 relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-full h-2 bg-terracotta/10"></div>
              <h3 className="text-xl uppercase tracking-[0.3em] font-bold text-ink mb-10 border-b border-ink/5 pb-6">Heures d'Atelier</h3>
              <div className="space-y-6 font-sans">
                {HOURS.map((h) => (
                  <div key={h.day} className="flex justify-between items-center text-[11px] uppercase tracking-widest font-bold">
                    <span className="text-ink/60">{h.day}</span>
                    <span className={h.time === 'Fermé' ? 'text-red-800' : 'text-ink text-texture'}>{h.time}</span>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-texture">
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase tracking-[0.3em] font-sans font-extrabold text-terracotta">Lieu</h4>
                  <p className="text-sm italic text-ink/70">Kinshasa, République Démocratique du Congo</p>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase tracking-[0.3em] font-sans font-extrabold text-terracotta">Appel</h4>
                  <p className="text-sm font-sans font-bold tracking-widest">+243 810 700 670</p>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase tracking-[0.3em] font-sans font-extrabold text-terracotta">Social</h4>
                  <p className="text-sm font-sans font-bold tracking-widest uppercase">@__NAHE___</p>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase tracking-[0.3em] font-sans font-extrabold text-terracotta">Connexion</h4>
                  <div className="flex gap-4">
                    <motion.div whileHover={{ color: '#8B4513' }} className="cursor-pointer transition-colors"><Instagram className="w-4 h-4" /></motion.div>
                    <motion.div whileHover={{ color: '#8B4513' }} className="cursor-pointer transition-colors"><Phone className="w-4 h-4" /></motion.div>
                    <motion.div whileHover={{ color: '#8B4513' }} className="cursor-pointer transition-colors"><MapPin className="w-4 h-4" /></motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Minimalist */}
      <footer className="h-24 md:h-32 px-6 md:px-16 border-t border-ink/5 flex flex-col md:flex-row items-center justify-between bg-paper relative z-10">
        <div className="absolute inset-0 pattern-kuba opacity-[0.02] pointer-events-none"></div>
        <div className="hidden md:flex gap-10 text-[9px] uppercase tracking-[0.25em] font-sans font-bold opacity-40">
          <a href="#" className="hover:text-terracotta hover:opacity-100 transition-all">Instagram</a>
          <a href="#" className="hover:text-terracotta hover:opacity-100 transition-all">Journal</a>
          <a href="#" className="hover:text-terracotta hover:opacity-100 transition-all">L'Héritage</a>
        </div>
        
        <div className="text-[9px] uppercase tracking-[0.3em] font-sans font-extrabold text-ink/40 text-center md:text-left my-4 md:my-0">
          © 2024 NAHE HAUTE COUTURE — TOUS DROITS RÉSERVÉS
        </div>

        <div className="flex items-center gap-6">
          <span className="text-[9px] uppercase tracking-[0.25em] font-sans font-bold opacity-40">Suivez-nous</span>
          <div className="w-12 md:w-24 h-[1px] bg-ink/10"></div>
          <a 
            href="https://instagram.com/__nahe___" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 group"
          >
            <motion.div 
              whileHover={{ scale: 1.1, color: '#8B4513' }}
              className="w-10 h-10 flex items-center justify-center border border-ink/10 rounded-full cursor-pointer hover:border-terracotta bg-white shadow-sm transition-colors text-ink"
            >
               <Instagram className="w-4 h-4" />
            </motion.div>
            <span className="text-[9px] uppercase tracking-widest font-sans font-bold opacity-0 group-hover:opacity-40 transition-opacity hidden md:block">@__NAHE___</span>
          </a>
          <div className="w-8 md:w-16 h-[1px] bg-ink/10"></div>
          <motion.div 
            whileHover={{ rotate: 180, scale: 1.2 }}
            className="w-10 h-10 flex items-center justify-center border border-ink/10 rounded-full cursor-pointer hover:border-terracotta group shadow-sm bg-white"
          >
             <Star className="w-4 h-4 text-terracotta group-hover:fill-terracotta transition-all" />
          </motion.div>
        </div>
      </footer>

      {/* Decorative Structural Elements */}
      <div className="fixed bottom-10 left-10 z-[101] hidden xl:block pointer-events-none">
        <div className="text-[8px] uppercase tracking-[0.5em] font-sans font-bold text-ink/20 transform rotate-90 origin-left">
          Artisanat Ancestral &bull; Congo
        </div>
      </div>
    </div>
  );
}
