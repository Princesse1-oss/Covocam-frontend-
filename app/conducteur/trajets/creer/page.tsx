'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ConducteurLayout from '../../../../components/conducteur/ConducteurLayout';
import { useTheme } from '@/app/lib/ThemeContext';

const API_URL = '/api';

const E = '#0D9E7E';
const EL = '#E8F7F3';
const ED = '#0A7B62';
const BK = '#0D0D0D';
const GR = '#6B7280';
const BD = '#EBEBEB';

// ─── SVG Icons inline ───
const Icon = ({ name, size = 20, color = E }: { name: string; size?: number; color?: string }) => {
  const s = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle' } as React.CSSProperties;
  const icons: Record<string, React.ReactNode> = {
    road: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20a6 6 0 0 0-12 0"/><path d="M2 20h20"/><path d="M12 20V10"/><path d="M12 10a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2z"/>
      </svg>
    ),
    car: (
      <svg style={s} viewBox="0 0 24 24" fill="none">
        <path d="M5 11L6.5 6.5C6.8 5.6 7.6 5 8.6 5H15.4C16.4 5 17.2 5.6 17.5 6.5L19 11" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <rect x="2" y="11" width="20" height="7" rx="2" stroke={color} strokeWidth="2" fill={EL}/>
        <circle cx="7" cy="18" r="2" stroke={color} strokeWidth="2" fill="white"/>
        <circle cx="17" cy="18" r="2" stroke={color} strokeWidth="2" fill="white"/>
      </svg>
    ),
    plus: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8V16M8 12H16"/>
      </svg>
    ),
    mapPin: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    calendar: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    settings: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
    snowflake: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="2" x2="12" y2="22"/><line x1="12" y1="2" x2="16" y2="6"/><line x1="12" y1="2" x2="8" y2="6"/><line x1="12" y1="22" x2="16" y2="18"/><line x1="12" y1="22" x2="8" y2="18"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="12" x2="6" y2="16"/><line x1="2" y1="12" x2="6" y2="8"/><line x1="22" y1="12" x2="18" y2="16"/><line x1="22" y1="12" x2="18" y2="8"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><line x1="4.93" y1="4.93" x2="8" y2="8"/><line x1="4.93" y1="4.93" x2="6" y2="6"/><line x1="19.07" y1="19.07" x2="16" y2="16"/><line x1="19.07" y1="19.07" x2="18" y2="18"/><line x1="4.93" y1="19.07" x2="19.07" y2="4.93"/><line x1="4.93" y1="19.07" x2="8" y2="16"/><line x1="4.93" y1="19.07" x2="6" y2="18"/><line x1="19.07" y1="4.93" x2="16" y2="8"/><line x1="19.07" y1="4.93" x2="18" y2="6"/>
      </svg>
    ),
    luggage: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 14a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2"/><path d="M6 14v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6"/><path d="M10 2v4"/><path d="M14 2v4"/><path d="M10 20v2"/><path d="M14 20v2"/><path d="M6 10h12"/>
      </svg>
    ),
    eye: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    users: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    money: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="14" rx="3"/><path d="M2 10H22"/><path d="M6 15H10"/><circle cx="17" cy="15" r="1.5" fill="currentColor"/>
      </svg>
    ),
    rocket: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
      </svg>
    ),
    warning: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    check: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    lightbulb: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-7 7c0 2 1 3.5 2 5a5 5 0 0 1 1 3v1h8v-1a5 5 0 0 1 1-3c1-1.5 2-3 2-5a7 7 0 0 0-7-7z"/>
      </svg>
    ),
    clock: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    x: (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
  };
  return <span style={{ lineHeight: 0, display: 'inline-flex' }}>{icons[name] || null}</span>;
};

interface Ville {
  id: number;
  nom: string;
  region: string;
  quartiers: { id: number; nom: string }[];
}

interface Vehicule {
  id: number;
  marque: string;
  modele: string;
  immatriculation?: string;
  plaqueImmatriculation?: string;
  nbPlaces: number;
  places?: number;
  climatisation: boolean;
  gps: boolean;
}

interface VilleEtape {
  ville: string;
  quartier: string;
}

export default function CreerTrajetPage() {
  const router = useRouter();
  const { t, darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const saveAsDraftRef = useRef(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<any>(null);
  
  const [villes, setVilles] = useState<Ville[]>([]);
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  
  const [quartiersDepart, setQuartiersDepart] = useState<{ id: number; nom: string }[]>([]);
  const [quartiersArrivee, setQuartiersArrivee] = useState<{ id: number; nom: string }[]>([]);

  const [form, setForm] = useState({
    vehiculeId: '',
    villeDepart: '',
    quartierDepart: '',
    villeArrivee: '',
    quartierArrivee: '',
    dateDepart: '',
    heureDepart: '',
    heureArriveeEstimee: '',
    nbPlaces: 1,
    prixParPassager: 0,
    climatisation: true,
    gps: true,
    description: '',
    bagageAutorise: false,
  });

  const [villesEtapes, setVillesEtapes] = useState<VilleEtape[]>([]);
  const [prixConseille, setPrixConseille] = useState<number | null>(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        setUser(parsed);
      } catch {}
    }

    const cleanToken = token.replace(/"/g, '').trim();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    Promise.all([
      fetch(`${API_URL}/villes-quartiers`, {
        headers: { Authorization: `Bearer ${cleanToken}` },
        signal: controller.signal,
      }).then(async (r) => {
        clearTimeout(timeoutId);
        
        if (r.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          throw new Error('Unauthorized');
        }
        
        const text = await r.text();
        if (!r.ok) {
          console.error("🔴 Erreur brute Symfony (villes-quartiers):", text);
          throw new Error(t('cityLoadError'));
        }
        return JSON.parse(text);
      }),
      
      fetch(`${API_URL}/conducteur/vehicules`, { 
        headers: { Authorization: `Bearer ${cleanToken}` },
        signal: controller.signal,
      }).then(async (r) => {
        const text = await r.text();
        if (!r.ok) {
          console.error("🔴 Erreur brute Symfony (vehicules):", text);
          throw new Error(t('vehicleLoadError'));
        }
        return JSON.parse(text);
      }),

      fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${cleanToken}` },
        signal: controller.signal,
      }).then(async (r) => {
        if (!r.ok) return null;
        return r.json();
      }),
    ])
      .then(([villesData, vehiculesData, meData]) => {
        if (meData && !meData.error) {
          setUser(meData);
          localStorage.setItem('user', JSON.stringify(meData));
        }

        if (villesData.villes && Array.isArray(villesData.villes)) {
          setVilles(villesData.villes);
        } else if (Array.isArray(villesData)) {
          setVilles(villesData); 
        } else {
          setError(t('invalidCityData'));
        }
        
        if (Array.isArray(vehiculesData) && vehiculesData.length > 0) {
          setVehicules(vehiculesData);
          const premierVehicule = vehiculesData[0];
          const placesReelles = premierVehicule.nbPlaces || premierVehicule.places || 4;
          setForm(prev => ({
            ...prev,
            vehiculeId: String(premierVehicule.id),
            climatisation: premierVehicule.climatisation,
            gps: premierVehicule.gps,
            nbPlaces: Math.max(1, placesReelles - 1),
          }));
        } else {
          setError(t('noVehicleError'));
        }
        
        setLoading(false);
      })
      .catch(err => {
        // ✅ CORRECTION : Ignorer poliment si c'est juste une annulation due au délai (timeout)
        if (err.name === 'AbortError') {
          console.warn("⏱️ Le chargement a pris plus de 10 secondes. Ce n'est pas une erreur critique, le formulaire reste utilisable.");
        } else {
          console.error("❌ Erreur de chargement:", err);
          setError(err.message || t('serverError'));
        }
        setLoading(false);
      });
  }, [router, t]);

  useEffect(() => {
    if (form.villeDepart) {
      const ville = villes.find(v => v.nom === form.villeDepart);
      setQuartiersDepart(ville?.quartiers || []);
      setForm(prev => ({ ...prev, quartierDepart: '' }));
    }
  }, [form.villeDepart, villes]);

  useEffect(() => {
    if (form.villeArrivee) {
      const ville = villes.find(v => v.nom === form.villeArrivee);
      setQuartiersArrivee(ville?.quartiers || []);
      setForm(prev => ({ ...prev, quartierArrivee: '' }));
    }
  }, [form.villeArrivee, villes]);

  useEffect(() => {
    if (form.villeDepart && form.villeArrivee && form.nbPlaces > 0) {
      setCalculating(true);
      const token = localStorage.getItem('token');
      
      fetch(`${API_URL}/trajets/calculer-prix`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          villeDepart: form.villeDepart,
          villeArrivee: form.villeArrivee,
          nbPlaces: form.nbPlaces,
        }),
      })
        .then(async (r) => {
          const text = await r.text();
          if (!r.ok) {
            console.error("Erreur calcul prix:", text);
            return;
          }
          return JSON.parse(text);
        })
        .then(data => {
          if (data?.prixConseille) {
            setPrixConseille(data.prixConseille);
            if (form.prixParPassager === 0) {
              setForm(prev => ({ ...prev, prixParPassager: data.prixConseille }));
            }
          }
          setCalculating(false);
        })
        .catch(() => setCalculating(false));
    }
  }, [form.villeDepart, form.villeArrivee, form.nbPlaces]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'nbPlaces' || name === 'prixParPassager' ? Number(value) : value)
    }));
  };

  const handleVehiculeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    const selectedVehicule = vehicules.find(v => v.id === selectedId);
    
    if (selectedVehicule) {
      const placesReelles = selectedVehicule.nbPlaces || selectedVehicule.places || 4;
      setForm(prev => ({
        ...prev,
        vehiculeId: String(selectedId),
        nbPlaces: Math.max(1, placesReelles - 1),
        climatisation: selectedVehicule.climatisation,
        gps: selectedVehicule.gps,
      }));
    }
  };

  const ajouterEtape = () => {
    setVillesEtapes([...villesEtapes, { ville: '', quartier: '' }]);
  };

  const supprimerEtape = (index: number) => {
    setVillesEtapes(villesEtapes.filter((_, i) => i !== index));
  };

  const updateEtape = (index: number, field: keyof VilleEtape, value: string) => {
    const newEtapes = [...villesEtapes];
    newEtapes[index] = { ...newEtapes[index], [field]: value };
    if (field === 'ville') {
      newEtapes[index].quartier = '';
    }
    setVillesEtapes(newEtapes);
  };

  const getQuartiersPourVille = (villeNom: string) => {
    const ville = villes.find(v => v.nom === villeNom);
    return ville?.quartiers || [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.vehiculeId) {
      setError(t('selectVehicle'));
      return;
    }
    if (!form.villeDepart || !form.quartierDepart || !form.villeArrivee || !form.quartierArrivee) {
      setError(t('selectCities'));
      return;
    }
    if (form.dateDepart && form.heureDepart && form.heureArriveeEstimee) {
        const depart = new Date(`${form.dateDepart}T${form.heureDepart}`);
        const arrivee = new Date(`${form.dateDepart}T${form.heureArriveeEstimee}`);
        if (arrivee <= depart) {
            setError(t('arrivalAfterDeparture'));
            return;
        }
    }
    if (form.villeDepart === form.villeArrivee && form.quartierDepart === form.quartierArrivee) {
      setError(t('sameLocation'));
      return;
    }
    if (!form.dateDepart || !form.heureDepart) {
      setError(t('selectDateTime'));
      return;
    }

    const dateDepartComplete = new Date(`${form.dateDepart}T${form.heureDepart}`);
    if (dateDepartComplete <= new Date()) {
      setError(t('futureDateRequired'));
      return;
    }
    if (form.prixParPassager < 500) {
      setError(t('minPrice'));
      return;
    }

    for (const etape of villesEtapes) {
      if (!etape.ville || !etape.quartier) {
        setError(t('completeStops'));
        return;
      }
    }

    setSubmitting(true);
    const token = localStorage.getItem('token');

    const payload = {
      vehiculeId: Number(form.vehiculeId),
      villeDepart: form.villeDepart,
      quartierDepart: form.quartierDepart,
      villeArrivee: form.villeArrivee,
      quartierArrivee: form.quartierArrivee,
      villesEtapes: villesEtapes.map(e => `${e.ville} (${e.quartier})`),
      dateDepart: form.dateDepart,
      heureDepart: form.heureDepart,
      heureArriveeEstimee: form.heureArriveeEstimee,
      nbPlaces: form.nbPlaces,
      prixParPassager: form.prixParPassager,
      climatisation: form.climatisation,
      gps: form.gps,
      description: form.description,
      bagageAutorise: form.bagageAutorise,
      statut: saveAsDraftRef.current ? 'BROUILLON' : 'OUVERT',
    };

    try {
      const response = await fetch(`${API_URL}/conducteur/trajets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      if (!response.ok) {
        console.error("🔴 Erreur serveur brute (publication):", responseText);
        let errorMessage = t('unknownError');
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || JSON.stringify(errorData);
        } catch (e) {
          errorMessage = responseText;
        }
        setError(errorMessage);
        return;
      }

      const data = JSON.parse(responseText);
      setSuccess(saveAsDraftRef.current ? (t('tripSavedDraft') || 'Trajet enregistré en brouillon') : t('tripPublished'));
      setTimeout(() => router.push('/conducteur/trajets'), 1500);
      
    } catch (err) {
      console.error("❌ Erreur réseau ou parsing:", err);
      setError(t('serverError'));
    } finally {
      setSubmitting(false);
      saveAsDraftRef.current = false;
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', background: darkMode ? '#1D1D1D' : '#fff',
    border: `1px solid ${darkMode ? '#2A2A2A' : '#e5e7eb'}`,
    borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    color: darkMode ? '#FFFFFF' : '#111827',
    transition: 'border-color .2s, box-shadow .2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '12px', fontWeight: '700',
    color: darkMode ? '#9CA3AF' : '#374151',
    marginBottom: '6px', letterSpacing: '.3px',
  };

  if (loading) {
    return (
      <ConducteurLayout>
        <div style={{ textAlign: 'center', padding: '80px', color: darkMode ? '#9CA3AF' : '#6b7280' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}><Icon name="road" size={48} /></div>
          <p>{t('loading')}</p>
        </div>
      </ConducteurLayout>
    );
  }

  if (vehicules.length === 0 && !error.includes('charger la liste des villes')) {
    return (
      <ConducteurLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: darkMode ? '#2D2D2D' : '#E8F7F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', marginBottom: '20px', border: '2px solid #0D9E7E' }}><Icon name="car" size={48} color="#0D9E7E" /></div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: darkMode ? '#FFFFFF' : '#111827', marginBottom: '8px' }}>{t('vehicleRequired')}</h2>
          <p style={{ fontSize: '14px', color: darkMode ? '#9CA3AF' : '#6b7280', maxWidth: '400px', marginBottom: '24px', lineHeight: '1.6' }}>
            {t('vehicleRequiredDesc')}
          </p>
          <button onClick={() => router.push('/conducteur/vehicule')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #0A7B62, #0D9E7E)', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(13,158,126,0.4)' }}>
            <Icon name="plus" size={14} color="#0A7B62" /> {t('addVehicle')}
          </button>
        </div>
      </ConducteurLayout>
    );
  }

  if (!loading && user) {
    const missingItems: { label: string; action: string; icon: React.ReactNode }[] = [];

    if (!user.photo) {
      missingItems.push({
        label: 'Photo de profil',
        action: '/conducteur/profil',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        ),
      });
    }
    if (!user.nom || !user.prenom) {
      missingItems.push({
        label: 'Nom et prénom',
        action: '/conducteur/profil',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        ),
      });
    }
    if (!user.telephone) {
      missingItems.push({
        label: 'Numéro de téléphone',
        action: '/conducteur/profil',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        ),
      });
    }

    if (missingItems.length > 0) {
      return (
        <ConducteurLayout>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: darkMode ? '#2D2D2D' : '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '2px solid #F59E0B' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: darkMode ? '#FFFFFF' : '#111827', marginBottom: '8px' }}>
              Informations incomplètes
            </h2>
            <p style={{ fontSize: '14px', color: darkMode ? '#9CA3AF' : '#6b7280', maxWidth: '440px', marginBottom: '24px', lineHeight: '1.6' }}>
              Vous devez compléter votre profil avant de pouvoir publier un trajet. C&apos;est une mesure de sécurité pour la confiance des passagers.
            </p>

            <div style={{ width: '100%', maxWidth: '440px', background: darkMode ? '#1A1A1A' : '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px', marginBottom: '24px', textAlign: 'left' }}>
              {missingItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: idx < missingItems.length - 1 ? `1px solid ${darkMode ? '#2A2A2A' : '#f3f4f6'}` : 'none' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: darkMode ? '#FFFFFF' : '#111827', flex: 1 }}>{item.label}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
              ))}
            </div>

            <button onClick={() => router.push('/conducteur/profil')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #0A7B62, #0D9E7E)', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(13,158,126,0.4)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Compléter mon profil
            </button>
          </div>
        </ConducteurLayout>
      );
    }
  }

  return (
    <ConducteurLayout>
      <style>{`
        @media (max-width: 640px) {
          .stop-row { grid-template-columns: 1fr !important; }
          .form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: darkMode ? '#FFFFFF' : '#111827', margin: '0 0 4px' }}><Icon name="road" size={24} /> {t('publishTrip')}</h1>
        <p style={{ fontSize: '13px', color: darkMode ? '#9CA3AF' : '#6b7280' }}>{t('publishTripDesc')}</p>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', color: '#dc2626', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'pre-wrap' }}>
          <Icon name="warning" size={16} color="#dc2626" /> {error}
        </div>
      )}

      {success && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', color: '#15803d', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon name="check" size={16} color="#15803d" /> {success}
        </div>
      )}

      <form id="create-trajet-form" onSubmit={handleSubmit}>
        <div style={{ background: darkMode ? '#1A1A1A' : '#fff', borderRadius: '16px', border: `1px solid ${darkMode ? '#2A2A2A' : '#e5e7eb'}`, padding: '28px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${darkMode ? '#2A2A2A' : '#f3f4f6'}` }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #0A7B62, #0D9E7E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}><Icon name="mapPin" size={20} color="white" /></div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: darkMode ? '#FFFFFF' : '#111827', margin: 0 }}>{t('route')}</h3>
              <p style={{ fontSize: '12px', color: darkMode ? '#9CA3AF' : '#6b7280', margin: 0 }}>{t('routeDesc')}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label style={labelStyle}><Icon name="mapPin" size={12} color="#16a34a" /> {t('departureCity')} *</label>
              <select name="villeDepart" value={form.villeDepart} onChange={handleChange} required style={inputStyle} onFocus={e => { e.target.style.borderColor = '#0D9E7E'; e.target.style.boxShadow = '0 0 0 3px rgba(13,158,126,0.1)'; }} onBlur={e => { e.target.style.borderColor = darkMode ? '#2A2A2A' : '#e5e7eb'; e.target.style.boxShadow = 'none'; }}>
                <option value="">{t('selectCity')}</option>
                {villes.map(v => <option key={v.id} value={v.nom}>{v.nom} ({v.region})</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}><Icon name="mapPin" size={12} /> {t('departureLocation')} *</label>
              <select name="quartierDepart" value={form.quartierDepart} onChange={handleChange} required disabled={!form.villeDepart} style={{ ...inputStyle, opacity: !form.villeDepart ? 0.6 : 1 }} onFocus={e => { e.target.style.borderColor = '#0D9E7E'; e.target.style.boxShadow = '0 0 0 3px rgba(13,158,126,0.1)'; }} onBlur={e => { e.target.style.borderColor = darkMode ? '#2A2A2A' : '#e5e7eb'; e.target.style.boxShadow = 'none'; }}>
                <option value="">{form.villeDepart ? t('selectNeighborhood') : t('selectCityFirst')}</option>
                {quartiersDepart.map(q => <option key={q.id} value={q.nom}>{q.nom}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}><Icon name="mapPin" size={12} color="#dc2626" /> {t('arrivalCity')} *</label>
              <select name="villeArrivee" value={form.villeArrivee} onChange={handleChange} required style={inputStyle} onFocus={e => { e.target.style.borderColor = '#0D9E7E'; e.target.style.boxShadow = '0 0 0 3px rgba(13,158,126,0.1)'; }} onBlur={e => { e.target.style.borderColor = darkMode ? '#2A2A2A' : '#e5e7eb'; e.target.style.boxShadow = 'none'; }}>
                <option value="">{t('selectCity')}</option>
                {villes.map(v => <option key={v.id} value={v.nom}>{v.nom} ({v.region})</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}><Icon name="mapPin" size={12} /> {t('arrivalLocation')} *</label>
              <select name="quartierArrivee" value={form.quartierArrivee} onChange={handleChange} required disabled={!form.villeArrivee} style={{ ...inputStyle, opacity: !form.villeArrivee ? 0.6 : 1 }} onFocus={e => { e.target.style.borderColor = '#0D9E7E'; e.target.style.boxShadow = '0 0 0 3px rgba(13,158,126,0.1)'; }} onBlur={e => { e.target.style.borderColor = darkMode ? '#2A2A2A' : '#e5e7eb'; e.target.style.boxShadow = 'none'; }}>
                <option value="">{form.villeArrivee ? t('selectNeighborhood') : t('selectCityFirst')}</option>
                {quartiersArrivee.map(q => <option key={q.id} value={q.nom}>{q.nom}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: darkMode ? '#FFFFFF' : '#374151' }}><Icon name="mapPin" size={13} color="#dc2626" /> {t('stops')}</label>
              <button type="button" onClick={ajouterEtape} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: `1px solid ${darkMode ? '#2A2A2A' : '#e5e7eb'}`, background: darkMode ? '#1A1A1A' : '#fff', fontSize: '12px', fontWeight: '600', color: '#0D9E7E', cursor: 'pointer', transition: 'all .2s' }} onMouseEnter={e => { e.currentTarget.style.background = darkMode ? '#2D2D2D' : '#E8F7F3'; e.currentTarget.style.borderColor = '#0D9E7E'; }} onMouseLeave={e => { e.currentTarget.style.background = darkMode ? '#1A1A1A' : '#fff'; e.currentTarget.style.borderColor = darkMode ? '#2A2A2A' : '#e5e7eb'; }}>
                <Icon name="plus" size={12} color="#0D9E7E" /> {t('addStop')}
              </button>
            </div>
            {villesEtapes.length === 0 ? (
              <div style={{ padding: '16px', background: darkMode ? '#2D2D2D' : '#f9fafb', borderRadius: '10px', fontSize: '13px', color: darkMode ? '#6B7280' : '#9ca3af', textAlign: 'center', border: `1px dashed ${darkMode ? '#2A2A2A' : '#e5e7eb'}` }}>
                {t('noStops')}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {villesEtapes.map((etape, index) => (
                  <div key={index} className="stop-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end', padding: '16px', background: darkMode ? '#1A1A1A' : '#fff', border: `1px solid ${darkMode ? '#2A2A2A' : '#e5e7eb'}`, borderRadius: '10px' }}>
                    <div>
                      <label style={{ ...labelStyle, fontSize: '11px' }}>{t('city')}</label>
                      <select value={etape.ville} onChange={(e) => updateEtape(index, 'ville', e.target.value)} style={inputStyle} onFocus={e => { e.target.style.borderColor = '#0D9E7E'; }} onBlur={e => { e.target.style.borderColor = darkMode ? '#2A2A2A' : '#e5e7eb'; }}>
                        <option value="">{t('select')}</option>
                        {villes.map(v => <option key={v.id} value={v.nom}>{v.nom}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: '11px' }}>{t('neighborhood')}</label>
                      <select value={etape.quartier} onChange={(e) => updateEtape(index, 'quartier', e.target.value)} disabled={!etape.ville} style={{ ...inputStyle, opacity: !etape.ville ? 0.6 : 1 }} onFocus={e => { e.target.style.borderColor = '#0D9E7E'; }} onBlur={e => { e.target.style.borderColor = darkMode ? '#2A2A2A' : '#e5e7eb'; }}>
                        <option value="">{etape.ville ? t('select') : t('selectCityFirst')}</option>
                        {getQuartiersPourVille(etape.ville).map(q => <option key={q.id} value={q.nom}>{q.nom}</option>)}
                      </select>
                    </div>
                    <button type="button" onClick={() => supprimerEtape(index)} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }} onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; }} onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; }}><Icon name="x" size={16} color="#dc2626" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ background: darkMode ? '#1A1A1A' : '#fff', borderRadius: '16px', border: `1px solid ${darkMode ? '#2A2A2A' : '#e5e7eb'}`, padding: '28px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${darkMode ? '#2A2A2A' : '#f3f4f6'}` }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #0A7B62, #0D9E7E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}><Icon name="calendar" size={20} color="white" /></div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: darkMode ? '#FFFFFF' : '#111827', margin: 0 }}>{t('dateTimeTitle')}</h3>
              <p style={{ fontSize: '12px', color: darkMode ? '#9CA3AF' : '#6b7280', margin: 0 }}>{t('dateTimeDesc')}</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label style={labelStyle}>{t('departureDate')} *</label>
              <input type="date" name="dateDepart" value={form.dateDepart} onChange={handleChange} min={new Date().toISOString().split('T')[0]} required style={inputStyle} onFocus={e => { e.target.style.borderColor = '#0D9E7E'; e.target.style.boxShadow = '0 0 0 3px rgba(13,158,126,0.1)'; }} onBlur={e => { e.target.style.borderColor = darkMode ? '#2A2A2A' : '#e5e7eb'; e.target.style.boxShadow = 'none'; }} />
            </div>
            <div>
              <label style={labelStyle}>{t('departureTime')} *</label>
              <input type="time" name="heureDepart" value={form.heureDepart} onChange={handleChange} required style={inputStyle} onFocus={e => { e.target.style.borderColor = '#0D9E7E'; e.target.style.boxShadow = '0 0 0 3px rgba(13,158,126,0.1)'; }} onBlur={e => { e.target.style.borderColor = darkMode ? '#2A2A2A' : '#e5e7eb'; e.target.style.boxShadow = 'none'; }} />
            </div>
            <div>
              <label style={labelStyle}>{t('estimatedArrival')} *</label>
              <input 
                type="time" 
                name="heureArriveeEstimee" 
                value={form.heureArriveeEstimee} 
                onChange={handleChange} 
                required 
                style={inputStyle} 
                onFocus={e => { e.target.style.borderColor = '#0D9E7E'; e.target.style.boxShadow = '0 0 0 3px rgba(13,158,126,0.1)'; }} 
                onBlur={e => { e.target.style.borderColor = darkMode ? '#2A2A2A' : '#e5e7eb'; e.target.style.boxShadow = 'none'; }} 
              />
              <div style={{ fontSize: '11px', color: darkMode ? '#6B7280' : '#9ca3af', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Icon name="lightbulb" size={11} /> {t('arrivalInfo')}
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: darkMode ? '#1A1A1A' : '#fff', borderRadius: '16px', border: `1px solid ${darkMode ? '#2A2A2A' : '#e5e7eb'}`, padding: '28px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${darkMode ? '#2A2A2A' : '#f3f4f6'}` }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #0A7B62, #0D9E7E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}><Icon name="car" size={20} color="white" /></div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: darkMode ? '#FFFFFF' : '#111827', margin: 0 }}>{t('vehicleSeatsPrice')}</h3>
              <p style={{ fontSize: '12px', color: darkMode ? '#9CA3AF' : '#6b7280', margin: 0 }}>{t('vehicleSeatsPriceDesc')}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}><Icon name="car" size={12} /> {t('vehicleToUse')} *</label>
              <select
                name="vehiculeId"
                value={form.vehiculeId}
                onChange={handleVehiculeChange}
                required
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#0D9E7E'; e.target.style.boxShadow = '0 0 0 3px rgba(13,158,126,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = darkMode ? '#2A2A2A' : '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
              >
                <option value="">{t('selectVehicle')}</option>
                {vehicules.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.marque} {v.modele} ({v.immatriculation || v.plaqueImmatriculation}) - {v.nbPlaces || v.places} {t('places')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>{t('seatsToOffer')} *</label>
              <select name="nbPlaces" value={form.nbPlaces} onChange={handleChange} required style={inputStyle} onFocus={e => { e.target.style.borderColor = '#0D9E7E'; e.target.style.boxShadow = '0 0 0 3px rgba(13,158,126,0.1)'; }} onBlur={e => { e.target.style.borderColor = darkMode ? '#2A2A2A' : '#e5e7eb'; e.target.style.boxShadow = 'none'; }}>
                {Array.from({ length: ((vehicules.find(v => String(v.id) === form.vehiculeId)?.nbPlaces || vehicules.find(v => String(v.id) === form.vehiculeId)?.places || 4) - 1) }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n} {n > 1 ? t('places') : t('place')}</option>
                ))}
              </select>
              <div style={{ fontSize: '11px', color: darkMode ? '#6B7280' : '#9ca3af', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Icon name="lightbulb" size={11} /> {t('vehicleCapacity').replace('{seats}', String(vehicules.find(v => String(v.id) === form.vehiculeId)?.nbPlaces || vehicules.find(v => String(v.id) === form.vehiculeId)?.places || 4))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>{t('pricePerPassenger')} * (FCFA)</label>
              <input type="number" name="prixParPassager" value={form.prixParPassager} onChange={handleChange} min={500} step={100} required style={inputStyle} onFocus={e => { e.target.style.borderColor = '#0D9E7E'; e.target.style.boxShadow = '0 0 0 3px rgba(13,158,126,0.1)'; }} onBlur={e => { e.target.style.borderColor = darkMode ? '#2A2A2A' : '#e5e7eb'; e.target.style.boxShadow = 'none'; }} />
              {calculating ? (
                <div style={{ fontSize: '11px', color: darkMode ? '#6B7280' : '#9ca3af', marginTop: '6px' }}><Icon name="clock" size={11} /> {t('calculating')}</div>
              ) : prixConseille !== null ? (
                <div style={{ fontSize: '11px', color: '#15803d', marginTop: '6px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Icon name="lightbulb" size={11} /> {t('recommendedPrice')} : {prixConseille.toLocaleString('fr-FR')} FCFA
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div style={{ background: darkMode ? '#1A1A1A' : '#fff', borderRadius: '16px', border: `1px solid ${darkMode ? '#2A2A2A' : '#e5e7eb'}`, padding: '28px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${darkMode ? '#2A2A2A' : '#f3f4f6'}` }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #0A7B62, #0D9E7E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}><Icon name="settings" size={20} color="white" /></div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: darkMode ? '#FFFFFF' : '#111827', margin: 0 }}>{t('optionsDescription')}</h3>
              <p style={{ fontSize: '12px', color: darkMode ? '#9CA3AF' : '#6b7280', margin: 0 }}>{t('optionsDescriptionDesc')}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: darkMode ? '#FFFFFF' : '#374151', fontWeight: '500' }}>
              <input type="checkbox" name="climatisation" checked={form.climatisation} onChange={handleChange} style={{ width: '18px', height: '18px', accentColor: '#0D9E7E', cursor: 'pointer' }} />
              <Icon name="snowflake" size={14} /> {t('airConditioning')}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: darkMode ? '#FFFFFF' : '#374151', fontWeight: '500' }}>
              <input type="checkbox" name="gps" checked={form.gps} onChange={handleChange} style={{ width: '18px', height: '18px', accentColor: '#0D9E7E', cursor: 'pointer' }} />
              <Icon name="mapPin" size={14} /> GPS
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: darkMode ? '#FFFFFF' : '#374151', fontWeight: '500' }}>
              <input type="checkbox" name="bagageAutorise" checked={form.bagageAutorise} onChange={handleChange} style={{ width: '18px', height: '18px', accentColor: '#0D9E7E', cursor: 'pointer' }} />
              <Icon name="luggage" size={14} /> {t('luggageAllowed')}
            </label>
          </div>
          <div>
            <label style={labelStyle}>{t('description')} ({t('optional')})</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder={t('descriptionPlaceholder')} style={{ ...inputStyle, minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }} maxLength={500} onFocus={e => { e.target.style.borderColor = '#0D9E7E'; e.target.style.boxShadow = '0 0 0 3px rgba(13,158,126,0.1)'; }} onBlur={e => { e.target.style.borderColor = darkMode ? '#2A2A2A' : '#e5e7eb'; e.target.style.boxShadow = 'none'; }} />
            <div style={{ fontSize: '11px', color: darkMode ? '#6B7280' : '#9ca3af', marginTop: '6px', textAlign: 'right' }}>{form.description.length}/500 {t('characters')}</div>
          </div>
        </div>

        {form.villeDepart && form.villeArrivee && form.dateDepart && form.heureDepart && (
          <div style={{ background: darkMode ? '#1A1A1A' : 'linear-gradient(135deg, #E8F7F3, #F0FDF4)', borderRadius: '16px', padding: '24px', border: '1px solid #0D9E7E', marginBottom: '24px', boxShadow: '0 4px 20px rgba(13,158,126,0.1)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px', color: '#0A7B62', display: 'flex', alignItems: 'center', gap: '8px' }}><Icon name="eye" size={15} color="#0A7B62" /> {t('preview')}</h3>
            <div style={{ fontSize: '18px', fontWeight: '800', color: darkMode ? '#FFFFFF' : '#111827', marginBottom: '8px' }}>
              {form.villeDepart} {form.quartierDepart && <span style={{ color: '#6b7280', fontWeight: '600' }}>({form.quartierDepart})</span>}
              <span style={{ color: '#0D9E7E', margin: '0 8px' }}>→</span>
              {form.villeArrivee} {form.quartierArrivee && <span style={{ color: '#6b7280', fontWeight: '600' }}>({form.quartierArrivee})</span>}
            </div>
            <div style={{ fontSize: '13px', color: darkMode ? '#9CA3AF' : '#4b5563', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <span><Icon name="calendar" size={13} /> {new Date(`${form.dateDepart}T${form.heureDepart}`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
              <span><Icon name="users" size={13} /> {form.nbPlaces} {form.nbPlaces > 1 ? t('places') : t('place')} {t('available')}</span>
              <span style={{ fontWeight: '700', color: '#15803d' }}><Icon name="money" size={13} color="#15803d" /> {form.prixParPassager.toLocaleString('fr-FR')} FCFA / {t('passengerLabel')}</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap', paddingBottom: '40px' }}>
          <button type="button" onClick={() => router.push('/conducteur/trajets')} style={{ padding: '12px 24px', borderRadius: '10px', border: `1px solid ${darkMode ? '#2A2A2A' : '#e5e7eb'}`, background: darkMode ? '#1A1A1A' : '#fff', color: darkMode ? '#FFFFFF' : '#374151', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all .2s' }} disabled={submitting} onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = darkMode ? '#2D2D2D' : '#f9fafb'; }} onMouseLeave={e => { e.currentTarget.style.background = darkMode ? '#1A1A1A' : '#fff'; }}>
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={submitting}
            onClick={() => { saveAsDraftRef.current = true; (document.getElementById('create-trajet-form') as HTMLFormElement)?.requestSubmit(); }}
            style={{
              padding: '12px 24px', borderRadius: '10px',
              border: `1px solid ${darkMode ? '#4B5563' : '#d1d5db'}`,
              background: darkMode ? '#1F2937' : '#fff',
              color: darkMode ? '#D1D5DB' : '#374151',
              fontSize: '14px', fontWeight: '600', cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all .2s'
            }}
          >
            {t('saveDraft') || 'Enregistrer brouillon'}
          </button>
          <button type="submit" disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '10px', border: 'none', background: submitting ? '#d1d5db' : 'linear-gradient(135deg, #0A7B62, #0D9E7E)', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: submitting ? 'none' : '0 4px 15px rgba(13,158,126,0.4)', transition: 'all .2s' }} onMouseEnter={e => { if (!submitting) e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(13,158,126,0.5)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(13,158,126,0.4)'; }}>
            {submitting ? t('publishing') : <><Icon name="rocket" size={14} color="white" /> {t('publishTrip')}</>}
          </button>
        </div>
      </form>
    </ConducteurLayout>
  );
}