import Footer from "../components/Footer";
import Header from "../components/Header";
import Map from "../components/Map";
function Home() {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 font-sans">
        <Header/>
        <main className="w-full max-w-4xl bg-white shadow-2xl rounded-xl p-8 my-8">
          
          {/* Titre et description de l'application */}
          <div className="text-center mb-8">
              <h1 className="text-4xl font-extrabold text-blue-700 mb-2">
                  Mon Localisateur Simple
              </h1>
              <p className="text-gray-600">
                  Affiche votre emplacement sur une carte simulée. L'application demande l'autorisation de géolocalisation.
              </p>
          </div>
          
          {/* Conteneur de la carte */}
          <div className="w-full h-auto">
              <Map />
          </div>
          
        </main>
  
      </div>
    );
  }
  
  export default Home;