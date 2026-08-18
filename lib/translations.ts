export const translations = {
  fr: {
    // Dashboard
    dashboard: 'Dashboard',
    totalUsers: 'Total utilisateurs',
    totalTrips: 'Total trajets',
    totalReservations: 'Total réservations',
    totalRevenue: 'Revenu total',
    recentActivity: 'Activité récente',
    loading: 'Chargement...',
    
    // Trajets
    trips: 'Trajets',
    searchTrips: 'Rechercher des trajets...',
    allStatus: 'Tous les statuts',
    statusScheduled: 'Programmé',
    statusInProgress: 'En cours',
    statusCompleted: 'Terminé',
    statusCancelled: 'Annulé',
    departure: 'Départ',
    arrival: 'Arrivée',
    date: 'Date',
    price: 'Prix',
    seats: 'Places',
    driver: 'Conducteur',
    actions: 'Actions',
    view: 'Voir',
    delete: 'Supprimer',
    confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce trajet ?',
    
    // Réservations
    reservations: 'Réservations',
    searchReservations: 'Rechercher des réservations...',
    reservationStatusPending: 'En attente',
    reservationStatusConfirmed: 'Confirmée',
    reservationStatusCancelled: 'Annulée',
    passenger: 'Passager',
    trip: 'Trajet',
    
    // Utilisateurs
    users: 'Utilisateurs',
    searchUsers: 'Rechercher des utilisateurs...',
    userName: 'Nom',
    email: 'Email',
    phone: 'Téléphone',
    role: 'Rôle',
    roleAdmin: 'Administrateur',
    roleUser: 'Utilisateur',
    roleDriver: 'Conducteur',
    rolePassenger: 'Passager',
    
    // Évaluations
    evaluations: 'Évaluations',
    searchEvaluations: 'Rechercher des évaluations...',
    allRatings: 'Toutes les notes',
    rating: 'Note',
    comment: 'Commentaire',
    author: 'Auteur',
    target: 'Cible',
    averageRating: 'Note moyenne',
    ratingDistribution: 'Répartition des notes',
    
    // Lieux
    locations: 'Lieux',
    cameroonMap: 'Carte du Cameroun',
    
    // Paiements
    payments: 'Paiements',
    searchPayments: 'Rechercher des paiements...',
    allPaymentStatus: 'Tous les statuts',
    paymentStatusSuccess: 'Succès',
    paymentStatusPending: 'En attente',
    paymentStatusFailed: 'Échec',
    allPaymentMethods: 'Tous les modes',
    methodCampay: 'Campay',
    methodMTN: 'MTN Money',
    methodOrange: 'Orange Money',
    methodCash: 'Espèces',
    amount: 'Montant',
    method: 'Mode',
    
    // Commun
    logout: 'Déconnexion',
    admin: 'Administrateur',
    search: 'Rechercher...',
    filter: 'Filtrer',
    noResults: 'Aucun résultat',
    error: 'Erreur',
    success: 'Succès',
  },
  en: {
    // Dashboard
    dashboard: 'Dashboard',
    totalUsers: 'Total Users',
    totalTrips: 'Total Trips',
    totalReservations: 'Total Reservations',
    totalRevenue: 'Total Revenue',
    recentActivity: 'Recent Activity',
    loading: 'Loading...',
    
    // Trajets
    trips: 'Trips',
    searchTrips: 'Search trips...',
    allStatus: 'All Status',
    statusScheduled: 'Scheduled',
    statusInProgress: 'In Progress',
    statusCompleted: 'Completed',
    statusCancelled: 'Cancelled',
    departure: 'Departure',
    arrival: 'Arrival',
    date: 'Date',
    price: 'Price',
    seats: 'Seats',
    driver: 'Driver',
    actions: 'Actions',
    view: 'View',
    delete: 'Delete',
    confirmDelete: 'Are you sure you want to delete this trip?',
    
    // Réservations
    reservations: 'Reservations',
    searchReservations: 'Search reservations...',
    reservationStatusPending: 'Pending',
    reservationStatusConfirmed: 'Confirmed',
    reservationStatusCancelled: 'Cancelled',
    passenger: 'Passenger',
    trip: 'Trip',
    
    // Utilisateurs
    users: 'Users',
    searchUsers: 'Search users...',
    userName: 'Name',
    email: 'Email',
    phone: 'Phone',
    role: 'Role',
    roleAdmin: 'Administrator',
    roleUser: 'User',
    roleDriver: 'Driver',
    rolePassenger: 'Passenger',
    
    // Évaluations
    evaluations: 'Reviews',
    searchEvaluations: 'Search reviews...',
    allRatings: 'All Ratings',
    rating: 'Rating',
    comment: 'Comment',
    author: 'Author',
    target: 'Target',
    averageRating: 'Average Rating',
    ratingDistribution: 'Rating Distribution',
    
    // Lieux
    locations: 'Locations',
    cameroonMap: 'Cameroon Map',
    
    // Paiements
    payments: 'Payments',
    searchPayments: 'Search payments...',
    allPaymentStatus: 'All Status',
    paymentStatusSuccess: 'Success',
    paymentStatusPending: 'Pending',
    paymentStatusFailed: 'Failed',
    allPaymentMethods: 'All Methods',
    methodCampay: 'Campay',
    methodMTN: 'MTN Money',
    methodOrange: 'Orange Money',
    methodCash: 'Cash',
    amount: 'Amount',
    method: 'Method',
    
    // Commun
    logout: 'Logout',
    admin: 'Administrator',
    search: 'Search...',
    filter: 'Filter',
    noResults: 'No results',
    error: 'Error',
    success: 'Success',
  },
};

export type TranslationKey = keyof typeof translations.fr;
export type Language = 'fr' | 'en';

export function useTranslation(lang: Language = 'fr') {
  const t = (key: TranslationKey): string => {
    return translations[lang][key] || translations.fr[key] || key;
  };
  
  return { t, lang };
}

export function getTranslation(key: TranslationKey, lang: Language = 'fr'): string {
  return translations[lang][key] || translations.fr[key] || key;
}
