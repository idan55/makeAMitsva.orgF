import React, { useState, useEffect } from 'react';
import Footer from './Footer';

// Composant pour dessiner un Marqueur de Position (simple SVG)
const UserMarker = ({ position, name }) => {
    // Note: Ces calculs sont basés sur la toile virtuelle de 8000x8000.
    const style = {
        left: `${position[1] * 20 + 500}px`, 
        top: `${-position[0] * 20 + 3500}px`, 
    };
    
    // Bleu pour l'utilisateur
    const color = "#3B82F6"; 

    return (
        <div 
            className="absolute transform -translate-x-1/2 -translate-y-full group z-40 animate-pulse"
            style={style}
            title={name}
        >
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill={color} 
                className="w-10 h-10 transition-transform duration-300 shadow-lg"
                stroke="white"
                strokeWidth="2"
            >
                {/* Icône de point de position */}
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
        </div>
    );
};


function Map() {
    // État pour stocker la position actuelle de l'utilisateur (par défaut : Paris)
    const [userPosition, setUserPosition] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialisation de la géolocalisation
    useEffect(() => {
        if (!navigator.geolocation) {
            setError("La géolocalisation n'est pas supportée par ce navigateur.");
            setLoading(false);
            return;
        }

        const success = (position) => {
            const { latitude, longitude } = position.coords;
            setUserPosition([latitude, longitude]);
            setLoading(false);
        };

        const handleError = (err) => {
            setError("Impossible de récupérer votre position. (Refusé ou Erreur)");
            setLoading(false);
            console.error("Geolocation Error:", err);
        };

        // Demande la position de l'utilisateur
        navigator.geolocation.getCurrentPosition(success, handleError, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        });
    }, []);

    // Utilise la position trouvée ou Paris par défaut (48.8566, 2.3522)
    const centerPosition = userPosition || [48.8566, 2.3522];
    
    // Calcul des translations pour centrer la carte sur le point 'centerPosition'
    // La fenêtre de la carte est 100% x 500px. La toile virtuelle est 8000x8000.
    // L'ajout de 500 et 300 permet de centrer le point dans la fenêtre de 500x500.
    const translateX = -(centerPosition[1] * 20 + 500) + 500;
    const translateY = -(-centerPosition[0] * 20 + 3500) + 300; 

    return (
        <div 
            className="relative w-full overflow-hidden bg-gray-100 border border-gray-300 rounded-lg shadow-xl"
            style={{ height: '500px' }} // Hauteur fixe pour la zone de carte
        >
            {/* 1. Fond de carte simulé (Image) - z-index 10 */}
            <div className="absolute inset-0 bg-gray-200 z-10">
                <img 
                    src="https://placehold.co/1000x600/F3F4F6/6B7280?text=VUE+DE+VOTRE+EMPLACEMENT"
                    alt="Fond de carte simulé"
                    className="w-full h-full object-cover opacity-80"
                />
            </div>

            {/* 2. Conteneur de la Toile Virtuelle (8000x8000) qui se DÉPLACE pour CENTRER la carte - z-index 30 */}
            <div 
                className="absolute w-[8000px] h-[8000px] transition-transform duration-700 z-30"
                style={{ transform: `translate(${translateX}px, ${translateY}px)` }}
            >
                {/* Marqueur de la position de l'utilisateur (bleu) */}
                <UserMarker 
                    position={centerPosition} // Utilise centerPosition pour placer le marqueur au centre initial
                    name={userPosition ? "Vous êtes ici" : "Position par défaut (Paris)"}
                />
            </div>

            {/* 3. Gestion des états de chargement/erreur (Z-INDEX le plus élevé: z-50) */}
            {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm">
                    <div className="text-center p-4 rounded-lg bg-white shadow-xl">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                         <p className="text-lg font-semibold text-blue-600">Recherche de votre position...</p>
                    </div>
                </div>
            )}
            
            {/* Affichage du message de statut */}
            {(!loading) && (
                 <div className="absolute top-4 left-4 z-50 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {userPosition ? "Carte centrée sur votre position" : "Centrage par défaut sur Paris"}
                 </div>
            )}
            <Footer/>
        </div>
    );
}

export default Map;