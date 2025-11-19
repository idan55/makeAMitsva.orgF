import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import MyMap from '../components/Mymapp';

function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(
      'https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/-93.118,44.9453.json?radius=25&limit=5&dedupe&access_token=pk.eyJ1IjoiZG9kb3YiLCJhIjoiY21pNXpjOXR5MjR2NzJpczUxamJ4eGg0YSJ9.Lz91JboxvuSrrXloSNuGUg'
    )
      .then((response) => {
        if (!response.ok) throw new Error('Erreur lors de la récupération des données');
        return response.json();
      })
      .then((json) => {
        if (json.features) setData(json.features);
        else setError("Pas de données dans la réponse");
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page-container">
      <Header />

      <div className="content">
        {loading && <p>Chargement...</p>}
        {error && <p>Erreur : {error}</p>}

        {data.length > 0 && (
          <>
            <ul>
              {data.map((item, index) => (
                <li key={index}>
                  {item.properties?.name || "Pas de nom"}
                </li>
              ))}
            </ul>

            {/* Passer les données au composant Map */}
            <MyMap markers={data} />
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Home;
