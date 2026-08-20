'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/lib/ThemeContext';
import ConducteurLayout from '../../../components/conducteur/ConducteurLayout';

const API_URL = '/api';

const E = '#0D9E7E';
const EL = '#E8F7F3';
const ED = '#0A7B62';
const BK = '#0D0D0D';
const GR = '#6B7280';
const BD = '#EBEBEB';
const RD = '#DC2626';
const RL = '#FEE2E2';
const AM = '#F59E0B';
const AL = '#FEF3C7';
const BL = '#2563EB';
const BLL = '#DBEAFE';

const Icon = ({ name, size = 20, color = E }: { name: string; size?: number; color?: string }) => {
  const s = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle' } as React.CSSProperties;
  const icons: Record<string, React.ReactNode> = {
    mapPin: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    calendar: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    clock: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    users: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    money: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="14" rx="3" stroke="#16A34A" strokeWidth="2" fill="#DCFCE7"/>
        <path d="M2 10H22" stroke="#16A34A" strokeWidth="2"/>
        <path d="M6 15H10" stroke="#16A34A" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="17" cy="15" r="1.5" fill="#16A34A"/>
      </svg>
    ),
    check: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    x: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
    filter: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
      </svg>
    ),
    car: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 11L6.5 6.5C6.8 5.6 7.6 5 8.6 5H15.4C16.4 5 17.2 5.6 17.5 6.5L19 11" />
        <rect x="2" y="11" width="20" height="7" rx="2" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
      </svg>
    ),
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

interface Demande {
  id: number;
  villeDepart: string;
  villeArrivee: string;
  quartierDepart?: string;
  quartierArrivee?: string;
  dateDepart: string;
  heureDepart?: string;
  nbPlaces: number;
  budgetMax: number;
  description?: string;
  dateCreation: string;
  passager: {
    id: number;
    nom: string;
    prenom: string;
    photo?: string;
  };
  estPrivee: boolean;
}

export default function ConducteurDemandesPage() {
  const router = useRouter();
  const { t, darkMode } = useTheme();
  
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState<Demande | null>(null);
  const [prixPropose, setPrixPropose] = useState('');
  
  const [filtreVilleDepart, setFiltreVilleDepart] = useState('');
  const [filtreVilleArrivee, setFiltreVilleArrivee] = useState('');
  const [filtreBudgetMin, setFiltreBudgetMin] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    fetchDemandes();
    return () => window.removeEventListener('resize', checkMobile);
  }, [filtreVilleDepart, filtreVilleArrivee, filtreBudgetMin]);

  const fetchDemandes = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const params = new URLSearchParams();
      if (filtreVilleDepart) params.append('villeDepart', filtreVilleDepart);
      if (filtreVilleArrivee) params.append('villeArrivee', filtreVilleArrivee);
      if (filtreBudgetMin) params.append('budgetMin', filtreBudgetMin);

      const res = await fetch(`${API_URL}/demandes/disponibles?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("🚨 VRAIE ERREUR DU BACKEND 🚨:\n", errorText);
        alert("Erreur serveur :\n" + errorText);
        setDemandes([]);
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        setDemandes(data);
      }
    } catch (err) {
      console.error('Erreur chargement demandes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccepterClick = (demande: Demande) => {
    setSelectedDemande(demande);
    setPrixPropose(demande.budgetMax.toString());
    setShowModal(true);
  };

  const handleAccepter = async () => {
    if (!selectedDemande || !prixPropose || parseFloat(prixPropose) <= 0) {
      alert('Veuillez entrer un prix valide');
      return;
    }

    const token = localStorage.getItem('token');
    setAcceptingId(selectedDemande.id);

    try {
      const res = await fetch(`${API_URL}/demandes/${selectedDemande.id}/accepter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prixPropose: parseFloat(prixPropose) })
      });

      const responseText = await res.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("🚨 VRAIE ERREUR DU BACKEND 🚨:\n", responseText);
        alert("Erreur Serveur :\n\n" + responseText);
        setAcceptingId(null);
        return;
      }

      if (res.ok) {
        alert(`Demande acceptee ! Prix propose : ${parseFloat(prixPropose).toLocaleString()} FCFA/place\n\nLe trajet a ete cree en brouillon. Vous avez 24h pour le completer.`);
        setShowModal(false);
        fetchDemandes();
      } else {
        alert(data.error || 'Erreur lors de l\'acceptation');
      }
    } catch (err) {
      console.error('Erreur réseau:', err);
      alert('Erreur de connexion au serveur');
    } finally {
      setAcceptingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const bgCard = darkMode ? '#1A1A1A' : '#FFFFFF';
  const textColor = darkMode ? '#FFFFFF' : BK;
  const textSecondary = darkMode ? '#9CA3AF' : GR;
  const borderColor = darkMode ? '#2A2A2A' : BD;
  const inputBg = darkMode ? '#2A2A2A' : '#FFFFFF';

  if (loading) {
    return (
      <ConducteurLayout>
        <div style={{ padding: '80px', textAlign: 'center', color: textSecondary }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `3px solid ${EL}`, borderTopColor: E, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p>Chargement des demandes...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
        </div>
      </ConducteurLayout>
    );
  }

  return (
    <ConducteurLayout>
      <div style={{ padding: isMobile ? '20px 16px' : '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '800', color: textColor, margin: '0 0 8px' }}>
            Demandes de trajets
          </h1>
          <p style={{ fontSize: '14px', color: textSecondary, margin: 0 }}>
            Trouvez des passagers et acceptez les demandes qui vous intéressent
          </p>
        </div>

        {/* Filtres */}
        <div style={{
          background: bgCard, borderRadius: '16px', padding: '20px',
          marginBottom: '24px', border: `1px solid ${borderColor}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Icon name="filter" size={18} color={E} />
            <span style={{ fontSize: '14px', fontWeight: '700', color: textColor }}>Filtres</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: textSecondary, marginBottom: '6px' }}>Ville de départ</label>
              <select value={filtreVilleDepart} onChange={(e) => setFiltreVilleDepart(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '13px', outline: 'none' }}>
                <option value="">Toutes</option>
                {['Yaoundé', 'Douala', 'Bafoussam', 'Bamenda', 'Garoua', 'Maroua'].map(v => (<option key={v} value={v}>{v}</option>))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: textSecondary, marginBottom: '6px' }}>Ville d'arrivée</label>
              <select value={filtreVilleArrivee} onChange={(e) => setFiltreVilleArrivee(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '13px', outline: 'none' }}>
                <option value="">Toutes</option>
                {['Yaoundé', 'Douala', 'Bafoussam', 'Bamenda', 'Garoua', 'Maroua'].map(v => (<option key={v} value={v}>{v}</option>))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: textSecondary, marginBottom: '6px' }}>Budget minimum (FCFA)</label>
              <input type="number" value={filtreBudgetMin} onChange={(e) => setFiltreBudgetMin(e.target.value)} placeholder="Ex: 3000" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '13px', outline: 'none' }} />
            </div>
          </div>
        </div>

        {/* Liste des demandes */}
        {demandes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: isMobile ? '40px 20px' : '60px', background: bgCard, borderRadius: '16px', border: `1px dashed ${borderColor}` }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: EL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon name="eye" size={32} color={GR} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: textColor, marginBottom: '8px' }}>Aucune demande disponible</h3>
            <p style={{ fontSize: '14px', color: textSecondary }}>
              {filtreVilleDepart || filtreVilleArrivee || filtreBudgetMin ? 'Aucune demande ne correspond à vos filtres. Essayez de les modifier.' : 'Revenez plus tard, de nouvelles demandes seront publiées !'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {demandes.map(demande => (
              <div key={demande.id} style={{ background: bgCard, borderRadius: '16px', border: `1px solid ${borderColor}`, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}
              >
                <div style={{ background: demande.estPrivee ? BLL : EL, padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${borderColor}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {demande.estPrivee ? (
                      <><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: BL, display: 'inline-block' }} /><span style={{ fontSize: '12px', fontWeight: '600', color: BL }}>Demande privée</span></>
                    ) : (
                      <><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: E, display: 'inline-block' }} /><span style={{ fontSize: '12px', fontWeight: '600', color: E }}>Demande publique</span></>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', color: textSecondary }}>Publiée le {formatDate(demande.dateCreation)}</span>
                </div>

                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: EL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="mapPin" size={20} color={E} />
                        </div>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: textColor }}>{demande.villeDepart} {demande.quartierDepart && <span style={{ fontSize: '13px', color: textSecondary }}>({demande.quartierDepart})</span>}</div>
                          <div style={{ fontSize: '12px', color: E, margin: '2px 0' }}>↓</div>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: textColor }}>{demande.villeArrivee} {demande.quartierArrivee && <span style={{ fontSize: '13px', color: textSecondary }}>({demande.quartierArrivee})</span>}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: textSecondary }}><Icon name="calendar" size={14} color={GR} />{formatDate(demande.dateDepart)}</div>
                        {demande.heureDepart && (<div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: textSecondary }}><Icon name="clock" size={14} color={GR} />{demande.heureDepart}</div>)}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: textSecondary }}><Icon name="users" size={14} color={GR} />{demande.nbPlaces} {demande.nbPlaces > 1 ? 'places' : 'place'}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: textSecondary }}><Icon name="money" size={14} color="#16A34A" />Budget: {demande.budgetMax.toLocaleString()} FCFA</div>
                      </div>
                      {demande.description && (
                        <div style={{ padding: '12px', background: darkMode ? '#2A2A2A' : '#F9FAFB', borderRadius: '8px', fontSize: '13px', color: textSecondary, lineHeight: '1.5' }}>
                          <span style={{ fontWeight: '600', color: textColor }}>Note du passager : </span>{demande.description}
                        </div>
                      )}
                    </div>
                    
                    {/* ✅ CORRECTION : Affichage de la photo du passager avec fallback sur les initiales */}
                    <div style={{ padding: '12px 16px', background: darkMode ? '#2A2A2A' : '#F9FAFB', borderRadius: '12px', minWidth: '180px' }}>
                      <div style={{ fontSize: '11px', color: textSecondary, fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Passager</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        
                        {/* Conteneur relatif pour superposer l'image et les initiales */}
                        <div style={{ position: 'relative', width: '36px', height: '36px', flexShrink: 0 }}>
                          {demande.passager.photo && (
                            <img 
                              src={demande.passager.photo.startsWith('http') 
                                ? demande.passager.photo 
                                : `/uploads/profils/${demande.passager.photo}`} 
                              alt="Photo passager" 
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} 
                              style={{ 
                                width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', 
                                position: 'absolute', top: 0, left: 0, zIndex: 10, border: '2px solid white' 
                              }} 
                            />
                          )}
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: `linear-gradient(135deg, ${E}, ${ED})`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '13px', fontWeight: '700', color: '#FFF',
                            position: 'relative', zIndex: 1
                          }}>
                            {demande.passager.prenom?.charAt(0)}{demande.passager.nom?.charAt(0)}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: textColor }}>{demande.passager.prenom} {demande.passager.nom}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleAccepterClick(demande)} disabled={acceptingId === demande.id} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: acceptingId === demande.id ? GR : `linear-gradient(135deg, ${E}, ${ED})`, color: '#FFF', fontSize: '14px', fontWeight: '700', cursor: acceptingId === demande.id ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: acceptingId === demande.id ? 'none' : `0 4px 15px rgba(13, 158, 126, 0.3)`, transition: 'all 0.2s' }}>
                      {acceptingId === demande.id ? (
                        <><div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Traitement...</>
                      ) : (
                        <><Icon name="check" size={16} color="#FFF" />Accepter cette demande</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALE : Accepter une demande */}
      {showModal && selectedDemande && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setShowModal(false)}>
          <div style={{ background: bgCard, borderRadius: '20px', padding: '32px', maxWidth: '500px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: EL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Icon name="check" size={28} color={E} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: textColor, marginBottom: '8px' }}>Accepter cette demande</h3>
              <p style={{ fontSize: '14px', color: textSecondary }}>{selectedDemande.villeDepart} → {selectedDemande.villeArrivee}</p>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: textColor, marginBottom: '8px' }}>Prix par place (FCFA) *</label>
              <input type="number" value={prixPropose} onChange={(e) => setPrixPropose(e.target.value)} placeholder="Ex: 5000" min="0" autoFocus style={{ width: '100%', padding: '14px 16px', borderRadius: '10px', border: `2px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '16px', fontWeight: '600', outline: 'none', textAlign: 'center' }} onFocus={(e) => e.currentTarget.style.borderColor = E} onBlur={(e) => e.currentTarget.style.borderColor = borderColor} />
              <div style={{ fontSize: '12px', color: textSecondary, marginTop: '6px', textAlign: 'center' }}>Budget du passager : {selectedDemande.budgetMax.toLocaleString()} FCFA</div>
            </div>
            <div style={{ padding: '14px', background: AL, borderRadius: '10px', marginBottom: '24px', fontSize: '13px', color: AM }}>
              <strong>Important :</strong> En acceptant, un trajet sera créé en brouillon. Vous aurez 24h pour le compléter (véhicule, heure précise, point de RDV).
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: `1.5px solid ${borderColor}`, background: 'transparent', color: textColor, fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Annuler</button>
              <button onClick={handleAccepter} disabled={!prixPropose || parseFloat(prixPropose) <= 0} style={{ flex: 2, padding: '14px', borderRadius: '10px', border: 'none', background: !prixPropose || parseFloat(prixPropose) <= 0 ? GR : `linear-gradient(135deg, ${E}, ${ED})`, color: '#FFF', fontSize: '14px', fontWeight: '700', cursor: !prixPropose || parseFloat(prixPropose) <= 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Icon name="check" size={16} color="#FFF" />Confirmer l'acceptation
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </ConducteurLayout>
  );
}