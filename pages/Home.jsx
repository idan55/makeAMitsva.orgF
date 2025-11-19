import React, { useEffect } from 'react'
import Footer from '../components/Footer';
import Header from '../components/Header';

function Home() {

  return (
    <div className="page-container">
      <Header />
      <div className="content">
        <h1>Home Page</h1>
      </div>
      <Footer/>
    </div>
  );
}

export default Home;

