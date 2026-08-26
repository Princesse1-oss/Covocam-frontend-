'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useTheme } from '@/app/lib/ThemeContext';

const API_BASE_URL = '/api';

const EMERALD = '#0D9E7E';
const EMERALD_DARK = '#0A7B62';
const BLACK = '#0D0D0D';
const GRAY = '#6B7280';
const GRAY_LIGHT = '#9CA3AF';
const BORDER = '#E5E7EB';

export default function LoginPage() {
  const router = useRouter();
  const { t, lang, toggleLang } = useTheme();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const lockoutIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup countdown interval on unmount
  useEffect(() => {
    return () => { if (lockoutIntervalRef.current) clearInterval(lockoutIntervalRef.current); };
  }, []);

  // Countdown effect
  useEffect(() => {
    if (lockoutTimer > 0) {
      lockoutIntervalRef.current = setInterval(() => {
        setLockoutTimer(prev => {
          if (prev <= 1) {
            if (lockoutIntervalRef.current) clearInterval(lockoutIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (lockoutIntervalRef.current) clearInterval(lockoutIntervalRef.current); };
  }, [lockoutTimer > 0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('ðŸ“¤ Envoi login:', { email, motDePasse: '***' });
      
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, motDePasse }),
      });

      const rawText = await response.text();
      console.log('ðŸ“¥ RÃ©ponse brute:', response.status, rawText);

      let data: any = {};
      try { data = JSON.parse(rawText); } 
      catch { /* pas du JSON */ }

      if (!response.ok) {
        // ✅ RATE LIMITING : gérer le 429 avec countdown
        if (response.status === 429 && data.retryAfter) {
          setLockoutTimer(data.retryAfter);
          setError(data.error || t('tooManyAttempts'));
          setLoading(false);
          return;
        }
        const msg = data.error || data.message || data.detail || t('errorStatus').replace('{status}', String(response.status));
        throw new Error(msg);
      }

      if (!data.token) {
        throw new Error(t('missingToken'));
      }

      localStorage.setItem('token', data.token);
      let profile = data.user;

      if (!profile) {
        console.log('ðŸ” RÃ©cupÃ©ration profil via /api/me...');
        const profileRes = await fetch(`${API_BASE_URL}/me`, {
          headers: { 'Authorization': `Bearer ${data.token}`, 'Accept': 'application/json' }
        });
        
        const profileText = await profileRes.text();
        console.log('ðŸ“¥ Profil brut:', profileRes.status, profileText);
        
        if (!profileRes.ok) {
          throw new Error(t('loadProfileError'));
        }
        profile = JSON.parse(profileText);
      }

      console.log('âœ… Profil reÃ§u:', profile);
      localStorage.setItem('user', JSON.stringify(profile));
      
      const roles = profile.roles || [];
      const typeUtilisateur = profile.typeUtilisateur || profile.role?.toLowerCase() || 'passager';
      
      console.log('ðŸŽ¯ RÃ´les dÃ©tectÃ©s:', roles, '| Type:', typeUtilisateur);
      
      let redirectPath = '/passager/dashboard';
      if (roles.includes('ROLE_ADMIN') || typeUtilisateur === 'admin') {
        redirectPath = '/admin/dashboard';
      } else if (roles.includes('ROLE_CONDUCTEUR') || typeUtilisateur === 'conducteur') {
        redirectPath = '/conducteur/dashboard';
      }

      console.log('âž¡ï¸ Redirection vers:', redirectPath);
      router.push(redirectPath);

    } catch (error: any) {
      console.error('âŒ Erreur complÃ¨te:', error);
      setError(error.message || t('loginError'));
    } finally {
      setLoading(false);
    }
  };

  // SÃ©lecteur de langue
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
              onClick={() => { if (l !== lang) toggleLang(); setIsLangOpen(false); }}
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
              {l === 'fr' ? 'FranÃ§ais' : 'English'}
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
          max-width: 400px;
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

        @media (min-width: 769px) {
          .login-container {
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
            inset: 0 !important;
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
        }
      `}</style>

      <div className="login-container">
        {/* â”€â”€â”€ SECTION HERO : IMAGE â”€â”€â”€ */}
        <div className="hero-section">
          <div 
            className="hero-image"
            style={{
              backgroundImage: 'url(/kribi-login.jpg)',
            }}
          />
          <div className="hero-overlay" />

          {/* Logo en haut avec sÃ©lecteur de langue */}
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
              <img src="/covocam_logo.png" alt="CovoCam"
                style={{
                  width: '44px', height: '44px', borderRadius: '14px',
                  objectFit: 'contain', display: 'block',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }} />
              <div>
                <span className="logo-text" style={{
                  fontSize: '20px',
                  fontWeight: '800',
                  color: 'white',
                  letterSpacing: '-0.4px',
                  textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                }}>
                  {t('brandName')}<span style={{ color: '#0D9E7E' }}>Cam</span>
                </span>
                <br />
                <span style={{
                  fontSize: '9px',
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: '500',
                  letterSpacing: '0.3px',
                  textShadow: '0 1px 8px rgba(0,0,0,0.2)',
                }}>
                  {t('tagline')}
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
              {t('heroTitle')}<br />
              <span style={{ color: '#0D9E7E' }}>{t('heroTitleHighlight')}</span>
            </h1>
            <p className="hero-subtitle" style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.9)',
              margin: 0,
              lineHeight: '1.5',
              maxWidth: '420px',
              textShadow: '0 1px 12px rgba(0,0,0,0.15)',
            }}>
              {t('loginHeroDesc')}
            </p>
          </div>
        </div>

        {/* â”€â”€â”€ SECTION FORMULAIRE â”€â”€â”€ */}
        <div className="form-section">
          <div className="form-wrapper">
            {/* En-tÃªte */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '800',
                color: BLACK,
                margin: '0 0 4px',
                letterSpacing: '-0.5px',
              }}>
                {t('loginTitle')}
              </h2>
              <p style={{
                fontSize: '14px',
                color: GRAY,
                margin: 0,
              }}>
                {t('loginSubtitle')}
              </p>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div style={{
                background: lockoutTimer > 0 ? '#FFF7ED' : '#FAFAFA',
                border: lockoutTimer > 0 ? '1px solid #FDBA74' : '1px solid #E5E7EB',
                borderRadius: 12,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                marginBottom: 24,
              }}>
                <AlertCircle size={18} color={lockoutTimer > 0 ? '#EA580C' : GRAY} style={{ flexShrink: 0, marginTop: 1 }} />
                <div style={{ flex: 1 }}>
                  <span style={{ color: lockoutTimer > 0 ? '#9A3412' : GRAY, fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{error}</span>
                  {lockoutTimer > 0 && (
                    <div style={{
                      marginTop: 8,
                      background: '#FFEDD5',
                      borderRadius: 8,
                      padding: '6px 12px',
                      display: 'inline-block',
                    }}>
                      <span style={{ color: '#9A3412', fontSize: 22, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                        {lockoutTimer}s
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit}>
              {/* Champ Email */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  color: GRAY,
                  fontWeight: 600,
                  marginBottom: '6px',
                }}>
                  {t('emailAddress')}
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <Mail size={18} color={GRAY} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={t('emailPlaceholder')}
                    className="form-input"
                    disabled={lockoutTimer > 0}
                  />
                </div>
              </div>

              {/* Champ Mot de passe */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  color: GRAY,
                  fontWeight: 600,
                  marginBottom: '6px',
                }}>
                  {t('passwordLabel')}
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <Lock size={18} color={GRAY} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    required
                    placeholder={t('passwordPlaceholder')}
                    className="form-input"
                    disabled={lockoutTimer > 0}
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} color={GRAY_LIGHT} /> : <Eye size={18} color={GRAY_LIGHT} />}
                  </button>
                </div>
              </div>

              {/* Bouton Connexion */}
              <button
                type="submit"
                disabled={loading || lockoutTimer > 0}
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
                    {t('loggingIn')}
                  </span>
                ) : (
                  t('login')
                )}
              </button>
            </form>

            {/* SÃ©parateur */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              margin: '24px 0',
            }}>
              <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
              <span style={{
                fontSize: 12,
                color: GRAY_LIGHT,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {t('newHere')}
              </span>
              <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
            </div>

            {/* Lien d'inscription */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ color: GRAY, fontSize: 14 }}>
                {t('noAccount')}{' '}
              </span>
              <Link
                href="/register"
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
                {t('createAccount')}
              </Link>
            </div>

            {/* Retour Ã  l'accueil */}
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
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
                â† {t('backHome')}
              </Link>
            </div>

            {/* Badge de sÃ©curitÃ© */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '20px',
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
                {t('loginSecureBadge')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
