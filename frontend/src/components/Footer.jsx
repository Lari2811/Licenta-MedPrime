import React from 'react';
import logo from '../assets/logo.png';
import { NavLink } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';


const Footer = () => {
  return (
    <footer className="bg-[var(--primary-color)] text-[var(--text-dark)] text-sm pt-7 px-4 sm:px-10 mt-10 border-t-2 border-[#136289] border-solid rounded-t-2xl shadow-lg">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 text-center md:text-left">
        
        {/* Coloana Brand */}
        <div className="flex flex-col items-center md:items-center md:mt-2">
          <img src={logo} alt="MedPrime Logo" className="w-34 h-34 mb-2 rounded-lg" />
          <h1 className="text-base md:text-lg font-bold ">  MED PRIME</h1>
          <p className="text-sm mt-2 md:text-base sm:text-sm  text-center">Clinica ta - modernă, accesibilă și mereu aproape de tine.</p>
        </div>

        {/* Coloana Despre platforma */}
        <div className="flex flex-col items-center text-xs md:text-base md:items-start md:mt-10">
          <h2 className="text-base sm:text-lg font-bold text-purple-900 mb-1 underline">Despre platformă</h2>
          <ul className="space-y-1.5">
            <li><NavLink to="/despre-noi" className="hover:text-gray-700 hover:font-bold transition">Despre noi</NavLink></li>
            <li><NavLink to="/despre-noi#values" className="hover:text-gray-700 hover:font-bold transition">Valorile MedPrime</NavLink></li>  
            <li><NavLink to="/locatii" className="hover:text-gray-700 hover:font-bold transition">Centre MedPrime</NavLink></li>
          </ul>
        </div>

        {/* Coloana Suport si contact si conectare */}
        <div className="flex flex-col items-center text-xs md:text-base md:items-start md:mt-10">
        <h2 className="text-base sm:text-lg font-bold text-purple-900 mb-1 underline">Suport & Contact</h2>
          <ul className="space-y-1.5">
            <li><NavLink to="/contact#suport" className="hover:text-gray-700 hover:font-bold transition">Formular suport</NavLink></li>
            <li><NavLink to="/contact#info-contact" className="hover:text-gray-700 hover:font-bold transition">Informații de contact</NavLink></li>

          </ul>
          </div>

          <div className="flex flex-col items-center text-xs md:text-base md:items-start md:mt-10 space-y-1.5">
            <h2 className="text-base sm:text-lg font-bold text-purple-900 mb-1 underline">Rămâi conectat</h2>
            <h2 className='text-[var(--text-dark)] mt-2 mb-2 '> Urmărește-ne și pe rețelele sociale: </h2>
            <div className="flex space-x-4 mt-2">
                <a href="#" className="hover:text-purple-900 transition-transform transform hover:scale-125 duration-200"> 
                  <FontAwesomeIcon icon={faFacebook} size="xl" />
                </a>
                <a href="#" className="hover:text-purple-900 transition-transform transform hover:scale-125 duration-200">
                  <FontAwesomeIcon icon={faInstagram} size="xl" />
                </a>
                <a href="#" className="hover:text-purple-900 transition-transform transform hover:scale-125 duration-200">
                  <FontAwesomeIcon icon={faTwitter} size="xl" />
                </a>
                <a href="#" className="hover:text-purple-900 transition-transform transform hover:scale-125 duration-200">
                  <FontAwesomeIcon icon={faLinkedin} size="xl" />
                </a>
            </div>

        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-xs text-gray-700 border-t border-gray-400 pt-4 pb-6">
        <p>© {new Date().getFullYear()} MedPrime. Toate drepturile rezervate.</p>
        <p>Creat cu ❤️ de Larisa Nicola</p>
      </div>
    </footer>
  );
};

export default Footer;