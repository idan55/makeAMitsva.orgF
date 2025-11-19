import React, { useEffect } from 'react'
import Footer from '../components/Footer';
import Header from '../components/Header';
import { useState } from 'react';
function Home() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
     
      fetch('https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/-93.118,44.9453.json?radius=25&limit=5&dedupe&access_token=YOUR_MAPBOX_ACCESS_TOKEN')
        .then((response) => {
          if (!response.ok) {
            throw new Error('Erreur lors de la récupération des données');
          }
          return response.json();
        })
        .then((data) => {
          setData(data);
          setLoading(false);
        })
        .catch((error) => {
          setError(error.message);
          setLoading(false);
        });
    }, []);
  return (
    <div className="page-container">
      <Header />
      <div className="content">
       
      {loading && <p>Chargement...</p>}
        {error && <p>Erreur : {error}</p>}
        {data && (
          <ul>
            {data.slice(0, 5).map((item) => (
              <li key={item.id}>{item.title}</li>
            ))}
          </ul>
        )}
      </div>
      <Footer/>
    </div>
  );
}

export default Home;

