
import React from 'react';
import { FaFacebook, FaTwitter, FaGithub } from "react-icons/fa"; 

function Footer() {
  return (
    <footer className="site-footer">
      <div className="social-icons">
        <FaFacebook size={30} color="#1877F2" />
        <FaTwitter size={30} color="#1DA1F2" />
        <FaGithub size={30} color="#000" />
      </div>
      <p className="footer-text">© 2025 My Website. All rights reserved.</p>
    </footer>
  );
}

export default Footer;