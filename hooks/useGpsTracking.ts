import { useEffect, useState } from 'react';

export function useGpsTracking(trajetId: number | null, isActive: boolean) {
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let watchId: number | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (isActive && trajetId) {
      if (!navigator.geolocation) {
        setError("La géolocalisation n'est pas supportée par ce navigateur.");
        return;
      }

      setIsTracking(true);
      setError(null);

      // Fonction pour envoyer la position au backend
      const sendPosition = (latitude: number, longitude: number) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        fetch(`/api/conducteur/trajets/${trajetId}/position`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ latitude, longitude })
        }).catch(err => {
          console.error("Erreur envoi position:", err);
        });
      };

      // 1. Suivi continu et précis (se déclenche quand la position change)
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          sendPosition(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          console.error("Erreur GPS:", err);
          setError("Impossible d'accéder à votre position GPS. Vérifiez les permissions de votre navigateur/téléphone.");
          setIsTracking(false);
        },
        {
          enableHighAccuracy: true, // Force l'utilisation du GPS réel (pas juste le réseau)
          timeout: 10000,
          maximumAge: 0
        }
      );

      // 2. Fallback : envoi toutes les 10 secondes au cas où l'appareil est immobile 
      // (certains navigateurs mettent en pause watchPosition si on ne bouge pas)
      intervalId = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            sendPosition(position.coords.latitude, position.coords.longitude);
          },
          () => { /* On ignore les erreurs du fallback si watchPosition fonctionne déjà */ }
        );
      }, 10000);
    } else {
      setIsTracking(false);
    }

    // Nettoyage quand le composant est démonté ou isActive devient false
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [isActive, trajetId]);

  return { isTracking, error };
}