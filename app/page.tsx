'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

// Couleurs du thème
const E = '#0D9E7E';
const ED = '#0A7B62';

// Traductions
const translations = {
  fr: {
    brand: 'CovoCam',
    tagline: 'Covoiturage Cameroun',
    login: 'Se connecter',
    register: "S'inscrire gratuitement",
    heroTitle: 'Voyagez ensemble,',
    heroTitleHighlight: 'économisez plus',
    heroDesc: 'Trouvez un trajet entre Yaoundé, Douala et toutes les villes du Cameroun. Simple, sûr et abordable.',
    searchPlaceholder: 'Où souhaitez-vous aller ?',
    departure: 'Départ',
    arrival: 'Arrivée',
    searchBtn: 'Rechercher un trajet',
    stats: {
      travelers: 'Voyageurs',
      drivers: 'Conducteurs',
      trips: 'Trajets effectués'
    },
    featuresTitle: 'Pourquoi choisir CovoCam ?',
    featuresDesc: 'La solution de covoiturage pensée pour les Camerounais',
    features: [
      { title: 'Prix imbattables', desc: 'Partagez les frais de route entre Yaoundé et Douala dès 2 500 FCFA.' },
      { title: 'Sécurité garantie', desc: 'Tous nos conducteurs sont évalués par la communauté après chaque trajet.' },
      { title: 'Communication directe', desc: 'Échangez avec votre conducteur ou passager via notre messagerie intégrée.' },
      { title: 'Système de notation', desc: 'Après chaque trajet, notez et soyez noté pour renforcer la confiance.' },
      { title: '10 régions couvertes', desc: 'De Maroua à Kribi, CovoCam couvre toutes les grandes villes du Cameroun.' },
      { title: 'Mobile Money', desc: 'Payez facilement via MTN MoMo ou Orange Money. (Bientôt disponible)' }
    ],
    ctaTitle: 'Prêt à voyager autrement ?',
    ctaDesc: 'Rejoignez des milliers de Camerounais qui voyagent malin avec CovoCam',
    ctaRegister: 'Créer un compte gratuit',
    ctaLogin: 'Se connecter',
    footer: '© 2025 CovoCam — Covoiturage au Cameroun · Projet académique CDAEN',
    availableTrips: 'trajets disponibles aujourd\'hui'
  },
  en: {
    brand: 'CovoCam',
    tagline: 'Cameroon Ridesharing',
    login: 'Sign in',
    register: 'Sign up free',
    heroTitle: 'Travel together,',
    heroTitleHighlight: 'save more',
    heroDesc: 'Find a ride between Yaoundé, Douala and all cities in Cameroon. Simple, safe and affordable.',
    searchPlaceholder: 'Where do you want to go?',
    departure: 'Departure',
    arrival: 'Arrival',
    searchBtn: 'Find a ride',
    stats: {
      travelers: 'Travelers',
      drivers: 'Drivers',
      trips: 'Trips completed'
    },
    featuresTitle: 'Why choose CovoCam?',
    featuresDesc: 'The ridesharing solution designed for Cameroonians',
    features: [
      { title: 'Unbeatable prices', desc: 'Share road costs between Yaoundé and Douala from 2,500 FCFA.' },
      { title: 'Guaranteed safety', desc: 'All our drivers are rated by the community after each trip.' },
      { title: 'Direct communication', desc: 'Chat with your driver or passenger via our integrated messaging.' },
      { title: 'Rating system', desc: 'After each trip, rate and be rated to build trust.' },
      { title: '10 regions covered', desc: 'From Maroua to Kribi, CovoCam covers all major cities in Cameroon.' },
      { title: 'Mobile Money', desc: 'Pay easily via MTN MoMo or Orange Money. (Coming soon)' }
    ],
    ctaTitle: 'Ready to travel differently?',
    ctaDesc: 'Join thousands of Cameroonians who travel smart with CovoCam',
    ctaRegister: 'Create a free account',
    ctaLogin: 'Sign in',
    footer: '© 2025 CovoCam — Ridesharing in Cameroon · Academic Project CDAEN',
    availableTrips: 'rides available today'
  }
};

// Icônes SVG
const Icons = {
  Logo: ({ color = 'white' }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M5 11L6.5 6.5C6.8 5.6 7.6 5 8.6 5H15.4C16.4 5 17.2 5.6 17.5 6.5L19 11" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <rect x="2" y="11" width="20" height="7" rx="2" stroke={color} strokeWidth="2" fill={`${color}33`}/>
      <circle cx="7" cy="18" r="2" stroke={color} strokeWidth="2" fill={`${color}66`}/>
      <circle cx="17" cy="18" r="2" stroke={color} strokeWidth="2" fill={`${color}66`}/>
    </svg>
  ),
  Car: ({ color = E }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 10L4.5 5.5C4.8 4.6 5.6 4 6.6 4H17.4C18.4 4 19.2 4.6 19.5 5.5L21 10" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <rect x="1" y="10" width="22" height="8" rx="2" stroke={color} strokeWidth="2" fill={`${color}22`}/>
      <circle cx="6" cy="18" r="2.5" stroke={color} strokeWidth="2" fill={`${color}44`}/>
      <circle cx="18" cy="18" r="2.5" stroke={color} strokeWidth="2" fill={`${color}44`}/>
    </svg>
  ),
  Users: ({ color = '#6B7280' }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2"/>
      <path d="M16 7C17.6569 7 19 5.65685 19 4C19 2.34315 17.6569 1 16 1" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M3 21V17C3 14.7909 4.79086 13 7 13H11C13.2091 13 15 14.7909 15 17V21" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M17 13C19.2091 13 21 14.7909 21 17V21" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Shield: ({ color = '#6B7280' }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L4 5V12C4 17.5 7.5 21.5 12 22C16.5 21.5 20 17.5 20 12V5L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 12L11 14L15 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Chat: ({ color = '#6B7280' }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M21 15C21 16.1046 20.1046 17 19 17H9L5 21V17H4C2.89543 17 2 16.1046 2 15V5C2 3.89543 2.89543 3 4 3H19C20.1046 3 21 3.89543 21 5V15Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Star: ({ color = '#6B7280' }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Globe: ({ color = '#6B7280' }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2"/>
      <path d="M3 12H21" stroke={color} strokeWidth="2"/>
      <path d="M12 3C14.5 6 15.5 9 15.5 12C15.5 15 14.5 18 12 21C9.5 18 8.5 15 8.5 12C8.5 9 9.5 6 12 3Z" stroke={color} strokeWidth="2"/>
    </svg>
  ),
  Mobile: ({ color = '#6B7280' }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="2" width="14" height="20" rx="3" stroke={color} strokeWidth="2"/>
      <line x1="12" y1="18" x2="12.01" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Moon: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Sun: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 2V4M12 20V22M4 12H2M22 12H20M6.5 6.5L5 5M18.5 18.5L20 20M6.5 17.5L5 19M18.5 5.5L20 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Language: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M2 12H22M12 2C14.5 4 15.5 8 15.5 12C15.5 16 14.5 20 12 22C9.5 18 8.5 16 8.5 12C8.5 8 9.5 4 12 2Z" stroke="currentColor" strokeWidth="2"/>
    </svg>
  )
};

// Statistiques aléatoires pour la démo
const getRandomTrips = () => Math.floor(Math.random() * 50 + 100);

export default function HomePage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [currentTrips] = useState(getRandomTrips());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const t = translations[lang];
  const cities = ['Yaoundé', 'Douala', 'Bafoussam', 'Bamenda', 'Garoua', 'Maroua', 'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Kribi'];

  const getStyles = (isDark: boolean) => {
    const bg = isDark ? '#0D0D0D' : '#FFFFFF';
    const text = isDark ? '#FFFFFF' : '#0D0D0D';
    const textSecondary = isDark ? '#9CA3AF' : '#6B7280';
    const border = isDark ? '#2A2A2A' : '#EBEBEB';
    const cardBg = isDark ? '#1A1A1A' : '#FFFFFF';
    const inputBg = isDark ? '#1A1A1A' : '#FFFFFF';
    const sectionBg = isDark ? '#141414' : '#F8FAFB';
    const topbarBg = isDark ? 'rgba(13,13,13,0.96)' : 'rgba(255,255,255,0.96)';
    const topbarBorder = isDark ? '#2A2A2A' : '#F0F0F0';

    return { bg, text, textSecondary, border, cardBg, inputBg, sectionBg, topbarBg, topbarBorder };
  };

  const styles = getStyles(darkMode);

  return (
    <div style={{
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: styles.bg,
      color: styles.text,
      minHeight: '100vh',
      transition: 'background 0.3s, color 0.3s'
    }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        
        .btn-primary { 
          background:${E};color:white;border:none;border-radius:50px;padding:14px 32px;font-size:15px;font-weight:700;cursor:pointer;transition:all .2s; 
        }
        .btn-primary:hover { 
          background:${ED};transform:translateY(-2px);box-shadow:0 8px 24px rgba(13,158,126,0.35); 
        }
        .btn-outline { 
          background:transparent;color:${E};border:2px solid ${E};border-radius:50px;padding:12px 28px;font-size:15px;font-weight:600;cursor:pointer;transition:all .2s; 
        }
        .btn-outline:hover { 
          background:${E};color:white;transform:translateY(-2px); 
        }
        .feature-card:hover { 
          transform:translateY(-4px);box-shadow:${darkMode ? '0 12px 32px rgba(0,0,0,0.4)' : '0 12px 32px rgba(0,0,0,0.1)'}; 
        }
        
        .hero-image-container {
          position: relative;
          width: 55%;
          overflow: hidden;
          height: 100vh;
        }
        .hero-image-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center 35%;
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          will-change: transform;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform: translateZ(0);
        }
        .hero-overlay-gradient {
          position: absolute;
          inset: 0;
          background: ${darkMode 
            ? 'linear-gradient(to right, rgba(0,0,0,0.5) 40%, transparent 100%)' 
            : 'linear-gradient(to right, transparent 50%, rgba(255,255,255,0.05) 100%)'};
        }

        @media (max-width: 768px) {
          .hero-section { flex-direction:column !important; height:auto !important; }
          .hero-image-container { 
            width:100% !important; 
            height:55vh !important; 
            min-height:380px !important;
            display:block !important;
          }
          .hero-image-bg {
            inset: 0 !important;
          }
          .hero-content { width:100% !important;padding:48px 24px !important; }
          .features-grid { grid-template-columns:1fr !important; }
          .nav-buttons { gap:8px !important; }
          .nav-buttons button { padding:8px 14px !important;font-size:12px !important; }
          header { padding:0 16px !important; }
          .feature-card { padding:20px !important; }
          .hero-stats { display:none !important; }
          .hero-badge { top:16px !important; left:16px !important; padding:6px 14px !important; font-size:11px !important; }
        }
        
        @media (max-width: 480px) {
          .hero-image-container { height:45vh !important; min-height:300px !important; }
          .hero-content h1 { font-size:28px !important; }
          section { padding:48px 16px !important; }
          footer { padding:24px 16px !important; }
          .hero-content { padding:32px 16px !important; }
        }
        
        @media (min-width: 769px) {
          .hero-image-container {
            height: 100vh !important;
          }
        }

        .dark .feature-card { border-color: #2A2A2A; }
        .dark .search-box { background: #1A1A1A; border-color: #2A2A2A; }
      `}</style>

      {/* ── TOPBAR ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? styles.topbarBg : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? `1px solid ${styles.topbarBorder}` : 'none',
        boxShadow: scrolled ? `0 2px 16px ${darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.06)'}` : 'none',
        transition: 'all .3s ease',
        padding: '0 48px',
        height: '68px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/covocam_logo.png" alt="CovoCam"
            style={{ width: '40px', height: '40px', borderRadius: '12px', objectFit: 'contain', display: 'block' }} />
          <div>
            <span style={{
              fontSize: '20px', fontWeight: '800',
              color: scrolled ? styles.text : (darkMode ? '#FFFFFF' : '#FFFFFF'),
              letterSpacing: '-0.4px'
            }}>
              {t.brand}<span style={{ color: E }}>Cam</span>
            </span>
            <br />
            <span style={{
              fontSize: '9px', color: E, fontWeight: '600',
              letterSpacing: '0.6px', textTransform: 'uppercase'
            }}>
              {t.tagline}
            </span>
          </div>
        </div>

        {/* Nav buttons */}
        <div className="nav-buttons" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Language selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              style={{
                background: 'transparent',
                border: `1.5px solid ${scrolled ? (darkMode ? '#4A4A4A' : '#E5E7EB') : 'rgba(255,255,255,0.3)'}`,
                borderRadius: '50px',
                padding: '8px 12px',
                cursor: 'pointer',
                color: scrolled ? styles.text : 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all .2s'
              }}
            >
              <Icons.Language />
              <span style={{ fontSize: '13px', fontWeight: '600' }}>{lang.toUpperCase()}</span>
            </button> 
            {isLangOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: darkMode ? '#1A1A1A' : 'white',
                border: `1px solid ${styles.border}`,
                borderRadius: '12px',
                padding: '8px',
                boxShadow: darkMode ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.15)',
                minWidth: '120px',
                zIndex: 100
              }}>
                {['fr', 'en'].map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLang(l as 'fr' | 'en'); setIsLangOpen(false); }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '8px',
                      background: lang === l ? E : 'transparent',
                      color: lang === l ? 'white' : styles.text,
                      cursor: 'pointer',
                      fontWeight: lang === l ? '600' : '400',
                      transition: 'all .2s'
                    }}
                  >
                    {l === 'fr' ? 'Français' : 'English'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: 'transparent',
              border: `1.5px solid ${scrolled ? (darkMode ? '#4A4A4A' : '#E5E7EB') : 'rgba(255,255,255,0.3)'}`,
              borderRadius: '50px',
              padding: '8px 12px',
              cursor: 'pointer',
              color: scrolled ? styles.text : 'white',
              display: 'flex',
              alignItems: 'center',
              transition: 'all .2s'
            }}
          >
            {darkMode ? <Icons.Sun /> : <Icons.Moon />}
          </button>

          <button
            className="btn-outline"
            onClick={() => router.push('/login')}
            style={{
              color: scrolled ? E : 'white',
              borderColor: scrolled ? E : 'white',
              padding: '10px 24px',
              fontSize: '14px',
              background: 'transparent'
            }}
          >
            {t.login}
          </button>
          <button
            className="btn-primary"
            onClick={() => router.push('/register')}
            style={{ padding: '10px 24px', fontSize: '14px' }}
          >
            {t.register}
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="hero-section" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        {/* Image gauche */}
        <div className="hero-image-container">
          <div 
            className="hero-image-bg"
            style={{
              backgroundImage: 'url(/yaounde-accueil.jpg)',
            }}
          />
          <div className="hero-overlay-gradient" />
          
          {/* Badge */}
          <div className="hero-badge" style={{
            position: 'absolute', top: '32px', left: '32px',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '50px', padding: '8px 18px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ADE80' }} />
            <span style={{ fontSize: '13px', color: 'white', fontWeight: '600' }}>
              +{currentTrips} {t.availableTrips}
            </span>
          </div>
        </div>

        {/* Contenu droite */}
        <div className="hero-content" style={{
          width: '45%', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '80px 64px',
          background: styles.bg,
          animation: 'fadeUp .6s ease both',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <div style={{ width: '32px', height: '2px', background: E, borderRadius: '2px' }} />
            <span style={{ fontSize: '13px', color: E, fontWeight: '600', letterSpacing: '0.5px' }}>
              <Icons.Globe color={E} /> {lang === 'fr' ? 'Fait pour le Cameroun' : 'Made for Cameroon'}
            </span>
          </div>

          <h1 style={{
            fontSize: '42px', fontWeight: '800', color: styles.text,
            lineHeight: '1.15', letterSpacing: '-1px', margin: '0 0 16px'
          }}>
            {t.heroTitle}<br />
            <span style={{ color: E }}>{t.heroTitleHighlight}</span>
          </h1>

          <p style={{
            fontSize: '16px', color: styles.textSecondary,
            lineHeight: '1.7', margin: '0 0 36px', maxWidth: '420px'
          }}>
            {t.heroDesc}
          </p>

          {/* Mini formulaire de recherche */}
          <div style={{
            background: styles.sectionBg,
            borderRadius: '18px', padding: '20px',
            border: `1px solid ${styles.border}`,
            marginBottom: '28px'
          }}>
            <p style={{
              fontSize: '12px', fontWeight: '600',
              color: styles.textSecondary,
              marginBottom: '14px',
              textTransform: 'uppercase', letterSpacing: '0.5px'
            }}>
              {t.searchPlaceholder}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <select style={{
                padding: '12px 14px',
                border: `1.5px solid ${styles.border}`,
                borderRadius: '12px',
                fontSize: '14px',
                color: styles.text,
                background: styles.inputBg,
                outline: 'none'
              }}>
                <option value="">{t.departure}</option>
                {cities.map(v => (<option key={v} value={v}>{v}</option>))}
              </select>
              <select style={{
                padding: '12px 14px',
                border: `1.5px solid ${styles.border}`,
                borderRadius: '12px',
                fontSize: '14px',
                color: styles.text,
                background: styles.inputBg,
                outline: 'none'
              }}>
                <option value="">{t.arrival}</option>
                {cities.map(v => (<option key={v} value={v}>{v}</option>))}
              </select>
            </div>
            <button
              className="btn-primary"
              onClick={() => router.push('/login')}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '15px' }}
            >
              {t.searchBtn}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icons.Shield color={E} />
              <span style={{ fontSize: '12px', color: styles.textSecondary, fontWeight: '500' }}>
                {lang === 'fr' ? 'Paiement sécurisé' : 'Secure payment'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icons.Star color={E} />
              <span style={{ fontSize: '12px', color: styles.textSecondary, fontWeight: '500' }}>
                {lang === 'fr' ? 'Conducteurs vérifiés' : 'Verified drivers'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icons.Mobile color={E} />
              <span style={{ fontSize: '12px', color: styles.textSecondary, fontWeight: '500' }}>
                {lang === 'fr' ? 'Suivi en temps réel' : 'Real-time tracking'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{
        padding: '80px 48px',
        background: styles.sectionBg,
        transition: 'background 0.3s'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontSize: '32px', fontWeight: '800',
              color: styles.text,
              margin: '0 0 12px',
              letterSpacing: '-0.5px'
            }}>
              {t.featuresTitle}
            </h2>
            <p style={{ fontSize: '16px', color: styles.textSecondary }}>{t.featuresDesc}</p>
          </div>
          <div className="features-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: '24px'
          }}>
            {t.features.map((f, i) => {
              const icons = [
                <Icons.Car key={i} color={E} />,
                <Icons.Shield key={i} color="#2563EB" />,
                <Icons.Chat key={i} color="#D97706" />,
                <Icons.Star key={i} color="#7C3AED" />,
                <Icons.Globe key={i} color="#DC2626" />,
                <Icons.Mobile key={i} color="#0D9B7E" />
              ];
              const colors = ['#DCFCE7', '#DBEAFE', '#FEF3C7', '#F3E8FF', '#FEE2E2', '#CCFBF1'];
              return (
                <div
                  key={i}
                  className="feature-card"
                  style={{
                    background: styles.cardBg,
                    borderRadius: '18px',
                    padding: '28px',
                    border: `1px solid ${styles.border}`,
                    transition: 'all .25s',
                    cursor: 'default'
                  }}
                >
                  <div style={{
                    width: '52px', height: '52px',
                    borderRadius: '14px',
                    background: colors[i % colors.length],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                  }}>
                    {icons[i % icons.length]}
                  </div>
                  <h3 style={{
                    fontSize: '16px', fontWeight: '700',
                    color: styles.text,
                    margin: '0 0 8px'
                  }}>{f.title}</h3>
                  <p style={{
                    fontSize: '14px',
                    color: styles.textSecondary,
                    lineHeight: '1.6',
                    margin: 0
                  }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{
        padding: '80px 48px',
        background: `linear-gradient(135deg,${E},${ED})`,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '250px', height: '250px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)'
        }} />
        <div style={{
          position: 'absolute', bottom: '-40px', left: '10%',
          width: '180px', height: '180px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)'
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '34px', fontWeight: '800',
            color: 'white',
            margin: '0 0 16px',
            letterSpacing: '-0.5px'
          }}>
            {t.ctaTitle}
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.8)',
            margin: '0 0 36px'
          }}>
            {t.ctaDesc}
          </p>
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => router.push('/register')}
              style={{
                background: 'white', color: E,
                border: 'none',
                borderRadius: '50px',
                padding: '14px 36px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                transition: 'all .2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
              }}
            >
              {t.ctaRegister}
            </button>
            <button
              onClick={() => router.push('/login')}
              style={{
                background: 'transparent',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.6)',
                borderRadius: '50px',
                padding: '12px 32px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all .2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'white';
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {t.ctaLogin}
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background: darkMode ? '#0D0D0D' : '#0D0D0D',
        padding: '32px 48px',
        textAlign: 'center'
      }}>
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '12px'
          }}>
            <img src="/covocam_logo.png" alt="CovoCam"
              style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'contain' }} />
            <span style={{
              fontSize: '18px', fontWeight: '800',
              color: 'white'
            }}>
              {t.brand}<span style={{ color: E }}>Cam</span>
            </span>
          </div>
        <p style={{
          fontSize: '13px',
          color: '#6B7280',
          margin: 0
        }}>
          {t.footer}
        </p>
      </footer>
    </div>
  );
}