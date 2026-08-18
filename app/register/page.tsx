'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Car, Users, Mail, Lock, User, Phone, AlertCircle, Check } from 'lucide-react';

const EMERALD = '#0D9E7E';
const EMERALD_DARK = '#0A7B62';
const EMERALD_LIGHT = '#E8F7F3';
const BLACK = '#0D0D0D';
const GRAY = '#6B7280';
const GRAY_LIGHT = '#9CA3AF';
const BORDER = '#E5E7EB';

// Traductions
const translations = {
  fr: {
    title: 'Rejoignez CovoCam aujourd\'hui',
    step1Title: 'Choisissez votre rôle',
    step1Desc: 'Êtes-vous conducteur ou passager ?',
    step2Title: 'Créez votre compte',
    step2Desc: 'Remplissez vos informations pour rejoindre CovoCam',
    brand: 'CovoCam',
    tagline: 'Covoiturage Cameroun',
    heroTitle: 'Rejoignez la communauté',
    heroHighlight: 'CovoCam',
    heroDesc: 'Des milliers de Camerounais voyagent déjà malin. À votre tour !',
    passenger: 'Passager',
    passengerDesc: 'Je cherche un trajet',
    driver: 'Conducteur',
    driverDesc: 'Je propose un trajet',
    changeRole: 'Changer de rôle',
    firstName: 'PRENOM',
    lastName: 'NOM',
    email: 'EMAIL',
    phone: 'TELEPHONE',
    password: 'MOT DE PASSE',
    confirmPassword: 'CONFIRMER',
    firstNamePlaceholder: 'Nicole',
    lastNamePlaceholder: 'Taffo',
    emailPlaceholder: 'votre@email.com',
    phonePlaceholder: '699000000',
    passwordPlaceholder: '••••••••',
    register: 'Créer mon compte',
    loading: 'Création en cours...',
    haveAccount: 'Déjà un compte ?',
    login: 'Se connecter',
    backHome: 'Retour à l\'accueil',
    error: 'Erreur lors de la création',
    success: 'Compte créé avec succès ! Redirection...',
    secure: 'Données sécurisées · Inscription gratuite',
    changeLater: 'Vous pourrez modifier ce choix plus tard',
    newHere: 'Nouveau ici ?',
  },
  en: {
    title: 'Join CovoCam today',
    step1Title: 'Choose your role',
    step1Desc: 'Are you a driver or a passenger?',
    step2Title: 'Create your account',
    step2Desc: 'Fill in your information to join CovoCam',
    brand: 'CovoCam',
    tagline: 'Cameroon Ridesharing',
    heroTitle: 'Join the',
    heroHighlight: 'CovoCam',
    heroDesc: 'Thousands of Cameroonians already travel smart. Your turn!',
    passenger: 'Passenger',
    passengerDesc: 'I\'m looking for a ride',
    driver: 'Driver',
    driverDesc: 'I offer a ride',
    changeRole: 'Change role',
    firstName: 'FIRST NAME',
    lastName: 'LAST NAME',
    email: 'EMAIL',
    phone: 'PHONE',
    password: 'PASSWORD',
    confirmPassword: 'CONFIRM',
    firstNamePlaceholder: 'Nicole',
    lastNamePlaceholder: 'Taffo',
    emailPlaceholder: 'your@email.com',
    phonePlaceholder: '699000000',
    passwordPlaceholder: '••••••••',
    register: 'Create my account',
    loading: 'Creating...',
    haveAccount: 'Already have an account?',
    login: 'Sign in',
    backHome: 'Back to home',
    error: 'Error during registration',
    success: 'Account created successfully! Redirecting...',
    secure: 'Secure data · Free registration',
    changeLater: 'You can change this choice later',
    newHere: 'New here?',
  }
};

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    confirmMotDePasse: '',
    telephone: '',
    typeUtilisateur: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const t = translations[lang];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role: string) => {
    setFormData({ ...formData, typeUtilisateur: role });
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.motDePasse !== formData.confirmMotDePasse) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.motDePasse.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          motDePasse: formData.motDePasse,
          telephone: formData.telephone,
          typeUtilisateur: formData.typeUtilisateur,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(t.success);
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(data.error || data.message || t.error);
      }
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Sélecteur de langue
  const LanguageSelector = () => (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsLangOpen(!isLangOpen)}
        style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '50px',
          padding: '6px 14px',
          cursor: 'pointer',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '12px',
          fontWeight: '600',
          transition: 'all .2s'
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
          <path d="M2 12H22M12 2C14.5 4 15.5 8 15.5 12C15.5 16 14.5 20 12 22C9.5 20 8.5 16 8.5 12C8.5 8 9.5 4 12 2Z" stroke="white" strokeWidth="2"/>
        </svg>
        <span>{lang.toUpperCase()}</span>
      </button>
      {isLangOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          background: 'white',
          border: `1px solid ${BORDER}`,
          borderRadius: '12px',
          padding: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
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
                background: lang === l ? EMERALD : 'transparent',
                color: lang === l ? 'white' : BLACK,
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
  );

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#FFFFFF',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .hero-section {
          position: relative;
          width: 100%;
          height: 55vh;
          min-height: 350px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .hero-image {
          position: absolute;
          inset: -30px;
          background-size: cover;
          background-position: center 35%;
          transform: scale(1.05);
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, 
            rgba(13,158,126,0.30) 0%,
            rgba(10,123,98,0.20) 50%,
            rgba(0,0,0,0.10) 80%,
            rgba(0,0,0,0.02) 100%
          );
        }

        .form-section {
          flex: 1;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 32px 24px 60px;
          background: #FFFFFF;
        }

        .form-wrapper {
          width: 100%;
          max-width: 440px;
          animation: fadeUp 0.5s ease both;
        }

        .form-input {
          width: 100%;
          padding: 12px 14px 12px 40px;
          border: 1.5px solid #E5E7EB;
          border-radius: 12px;
          font-size: 14px;
          color: #0D0D0D;
          background: #FAFAFA;
          outline: none;
          box-sizing: border-box;
          transition: border-color .2s, box-shadow .2s, background .2s;
          font-family: inherit;
        }
        .form-input:focus {
          border-color: ${EMERALD};
          background: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(13,158,126,0.08);
        }
        .form-input::placeholder {
          color: #9CA3AF;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 12px;
          display: flex;
          align-items: center;
          pointer-events: none;
          opacity: 0.5;
        }
        .eye-btn {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 4px;
          border-radius: 6px;
          transition: background .2s;
        }
        .eye-btn:hover {
          background: #F3F4F6;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, ${EMERALD}, ${EMERALD_DARK});
          border: none;
          border-radius: 12px;
          color: #FFF;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 16px rgba(13,158,126,0.25);
          transition: all .2s ease;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(13,158,126,0.3);
        }
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .role-card {
          border: 2px solid #E5E7EB;
          border-radius: 16px;
          padding: 32px 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
          text-align: center;
          position: relative;
          flex: 1;
        }
        .role-card:hover:not(.selected) {
          border-color: #D1D5DB;
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
        }
        .role-card.selected {
          border-color: ${EMERALD};
          background: ${EMERALD_LIGHT};
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(13,158,126,0.15);
        }
        .role-card .check-mark {
          position: absolute;
          top: 12px;
          right: 12px;
          opacity: 0;
          transform: scale(0.5);
          transition: all 0.3s ease;
        }
        .role-card.selected .check-mark {
          opacity: 1;
          transform: scale(1);
        }
        .role-card .icon-wrapper {
          display: inline-flex;
          padding: 16px;
          border-radius: 16px;
          background: ${EMERALD_LIGHT};
          transition: all 0.3s ease;
          margin-bottom: 12px;
        }
        .role-card.selected .icon-wrapper {
          background: white;
          box-shadow: 0 4px 12px rgba(13,158,126,0.2);
        }

        @media (min-width: 769px) {
          .register-container {
            display: flex;
            min-height: 100vh;
          }
          .hero-section {
            width: 50%;
            height: 100vh !important;
            min-height: 100vh !important;
            flex-shrink: 0;
          }
          .hero-image {
            inset: -40px !important;
          }
          .form-section {
            width: 50%;
            align-items: center !important;
            padding: 48px 64px !important;
          }
          .hero-content {
            padding: 40px 32px !important;
          }
        }

        @media (max-width: 768px) {
          .hero-section {
            height: 55vh;
            min-height: 380px;
          }
          .form-section {
            padding: 28px 20px 40px;
          }
          .hero-title {
            font-size: 28px !important;
          }
          .hero-subtitle {
            font-size: 14px !important;
          }
          .role-card {
            padding: 24px 16px !important;
          }
          .role-card .icon-wrapper {
            padding: 12px !important;
          }
        }

        @media (max-width: 480px) {
          .hero-section {
            height: 45vh;
            min-height: 300px;
          }
          .form-section {
            padding: 20px 16px 32px;
          }
          .hero-title {
            font-size: 22px !important;
          }
          .hero-subtitle {
            font-size: 13px !important;
          }
          .form-wrapper h2 {
            font-size: 24px !important;
          }
          .form-input {
            padding: 11px 14px 11px 38px !important;
            font-size: 14px !important;
          }
          .logo-text {
            font-size: 18px !important;
          }
          .role-card {
            padding: 20px 12px !important;
          }
          .role-card svg {
            width: 32px !important;
            height: 32px !important;
          }
          .form-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div className="register-container">
        {/* ─── SECTION HERO : IMAGE ─── */}
        <div className="hero-section">
          <div 
            className="hero-image"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=1400&q=80)',
            }}
          />
          <div className="hero-overlay" />

          {/* Logo en haut avec sélecteur de langue */}
          <div style={{
            position: 'absolute',
            top: '28px',
            left: '28px',
            right: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }}>
                <Car size={22} color="#FFF" strokeWidth={1.8} />
              </div>
              <div>
                <span className="logo-text" style={{
                  fontSize: '20px',
                  fontWeight: '800',
                  color: 'white',
                  letterSpacing: '-0.4px',
                  textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                }}>
                  {t.brand}<span style={{ color: '#0D9E7E' }}>Cam</span>
                </span>
                <br />
                <span style={{
                  fontSize: '9px',
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: '500',
                  letterSpacing: '0.3px',
                  textShadow: '0 1px 8px rgba(0,0,0,0.2)',
                }}>
                  {t.tagline}
                </span>
              </div>
            </div>

            <LanguageSelector />
          </div>

          {/* Contenu de l'image */}
          <div className="hero-content" style={{
            position: 'absolute',
            bottom: '40px',
            left: '28px',
            right: '28px',
            zIndex: 10,
          }}>
            <h1 className="hero-title" style={{
              fontSize: '32px',
              fontWeight: '800',
              color: 'white',
              margin: '0 0 8px',
              lineHeight: '1.15',
              letterSpacing: '-0.5px',
              textShadow: '0 2px 20px rgba(0,0,0,0.2)',
            }}>
              {t.heroTitle}<br />
              <span style={{ color: '#0D9E7E' }}>{t.heroHighlight}</span>
            </h1>
            <p className="hero-subtitle" style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.9)',
              margin: 0,
              lineHeight: '1.5',
              maxWidth: '420px',
              textShadow: '0 1px 12px rgba(0,0,0,0.15)',
            }}>
              {t.heroDesc}
            </p>
          </div>
        </div>

        {/* ─── SECTION FORMULAIRE ─── */}
        <div className="form-section">
          <div className="form-wrapper">
            {/* En-tête */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '800',
                color: BLACK,
                margin: '0 0 4px',
                letterSpacing: '-0.5px',
              }}>
                {step === 1 ? t.step1Title : t.step2Title}
              </h2>
              <p style={{
                fontSize: '14px',
                color: GRAY,
                margin: 0,
              }}>
                {step === 1 ? t.step1Desc : t.step2Desc}
              </p>
            </div>

            {/* Messages d'erreur/succès */}
            {error && (
              <div style={{
                background: '#FAFAFA',
                border: '1px solid #E5E7EB',
                borderRadius: 12,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                marginBottom: 20,
              }}>
                <AlertCircle size={18} color={GRAY} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ color: GRAY, fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{error}</span>
              </div>
            )}

            {success && (
              <div style={{
                background: '#F0FDF4',
                border: '1px solid #86EFAC',
                borderRadius: 12,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 20,
              }}>
                <Check size={18} color="#16A34A" />
                <span style={{ color: '#16A34A', fontSize: 13, fontWeight: 500 }}>{success}</span>
              </div>
            )}

            {/* ÉTAPE 1 : Choix du rôle */}
            {step === 1 && (
              <div style={{ animation: 'scaleIn 0.3s ease both' }}>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  flexDirection: 'row',
                }}>
                  {[
                    { 
                      val: 'passager', 
                      label: t.passenger, 
                      icon: <Users size={40} color={EMERALD} />, 
                      desc: t.passengerDesc,
                      bg: '#DBEAFE'
                    },
                    { 
                      val: 'conducteur', 
                      label: t.driver, 
                      icon: <Car size={40} color={EMERALD} />, 
                      desc: t.driverDesc,
                      bg: '#DCFCE7'
                    },
                  ].map((r) => (
                    <button
                      key={r.val}
                      type="button"
                      className={`role-card${formData.typeUtilisateur === r.val ? ' selected' : ''}`}
                      onClick={() => handleRoleSelect(r.val)}
                    >
                      <div className="check-mark">
                        <Check size={20} color={EMERALD} />
                      </div>
                      <div className="icon-wrapper" style={{ background: r.bg }}>
                        {r.icon}
                      </div>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: formData.typeUtilisateur === r.val ? EMERALD : BLACK,
                        marginBottom: '4px',
                      }}>
                        {r.label}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: GRAY,
                      }}>
                        {r.desc}
                      </div>
                    </button>
                  ))}
                </div>

                <p style={{
                  textAlign: 'center',
                  fontSize: '12px',
                  color: GRAY_LIGHT,
                  marginTop: '16px',
                }}>
                  {t.changeLater}
                </p>
              </div>
            )}

            {/* ÉTAPE 2 : Formulaire complet */}
            {step === 2 && (
              <form onSubmit={handleSubmit} style={{ animation: 'scaleIn 0.3s ease both' }}>
                {/* Retour à l'étape 1 */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: GRAY_LIGHT,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    marginBottom: '20px',
                    padding: 0,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = GRAY}
                  onMouseLeave={e => e.currentTarget.style.color = GRAY_LIGHT}
                >
                  ← {t.changeRole}
                </button>

                {/* Nom et Prénom */}
                <div className="form-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '14px',
                  marginBottom: '16px',
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      color: GRAY,
                      fontWeight: 600,
                      marginBottom: '6px',
                    }}>
                      {t.firstName}
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon">
                        <User size={18} color={GRAY} />
                      </span>
                      <input
                        type="text"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        required
                        placeholder={t.firstNamePlaceholder}
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      color: GRAY,
                      fontWeight: 600,
                      marginBottom: '6px',
                    }}>
                      {t.lastName}
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon">
                        <User size={18} color={GRAY} />
                      </span>
                      <input
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        required
                        placeholder={t.lastNamePlaceholder}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    color: GRAY,
                    fontWeight: 600,
                    marginBottom: '6px',
                  }}>
                    {t.email}
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <Mail size={18} color={GRAY} />
                    </span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder={t.emailPlaceholder}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Téléphone */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    color: GRAY,
                    fontWeight: 600,
                    marginBottom: '6px',
                  }}>
                    {t.phone}
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <Phone size={18} color={GRAY} />
                    </span>
                    <input
                      type="text"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      placeholder={t.phonePlaceholder}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Mot de passe */}
                <div className="form-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '14px',
                  marginBottom: '24px',
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      color: GRAY,
                      fontWeight: 600,
                      marginBottom: '6px',
                    }}>
                      {t.password}
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon">
                        <Lock size={18} color={GRAY} />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="motDePasse"
                        value={formData.motDePasse}
                        onChange={handleChange}
                        required
                        placeholder={t.passwordPlaceholder}
                        className="form-input"
                      />
                      <button
                        type="button"
                        className="eye-btn"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <Lock size={18} color={GRAY_LIGHT} /> : <Lock size={18} color={GRAY_LIGHT} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      color: GRAY,
                      fontWeight: 600,
                      marginBottom: '6px',
                    }}>
                      {t.confirmPassword}
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon">
                        <Lock size={18} color={GRAY} />
                      </span>
                      <input
                        type="password"
                        name="confirmMotDePasse"
                        value={formData.confirmMotDePasse}
                        onChange={handleChange}
                        required
                        placeholder={t.passwordPlaceholder}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Bouton */}
                <button
                  type="submit"
                  disabled={loading}
                  className="submit-btn"
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        display: 'inline-block',
                        width: 18,
                        height: 18,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid #FFF',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                      {t.loading}
                    </span>
                  ) : (
                    t.register
                  )}
                </button>
              </form>
            )}

            {/* Footer */}
            <div style={{
              textAlign: 'center',
              marginTop: '24px',
            }}>
              <span style={{ color: GRAY, fontSize: 14 }}>
                {t.haveAccount}{' '}
              </span>
              <Link
                href="/login"
                style={{
                  color: EMERALD,
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: 'none',
                  transition: 'color .2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = EMERALD_DARK}
                onMouseLeave={e => e.currentTarget.style.color = EMERALD}
              >
                {t.login}
              </Link>
            </div>

            {/* Retour à l'accueil */}
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <Link
                href="/"
                style={{
                  fontSize: 13,
                  color: GRAY_LIGHT,
                  textDecoration: 'none',
                  transition: 'color .2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
                onMouseEnter={e => e.currentTarget.style.color = GRAY}
                onMouseLeave={e => e.currentTarget.style.color = GRAY_LIGHT}
              >
                ← {t.backHome}
              </Link>
            </div>

            {/* Badge de sécurité */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '16px',
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#0D9E7E'
              }} />
              <span style={{
                fontSize: '11px',
                color: GRAY_LIGHT,
              }}>
                {t.secure}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}