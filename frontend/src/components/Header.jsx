import React from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-solid-svg-icons';


const Header = () => {
  const navigate = useNavigate();

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-xl mx-4 sm:mx-10 my-0 border border-gray-300">
      {/* Imaginea de fundal */}
      <img
        src={assets.header}
        alt="medici"
        className="w-full h-full object-cover object-center absolute inset-0 z-0"
      />

      <div className="relative z-10 bg-gradient-to-r from-white/90 to-white/60 px-6 md:px-10 py-10 flex flex-col md:flex-row items-start gap-6">
        {/* Text si buton */}
        <div className="md:w-1/2 flex flex-col items-start gap-6 text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#4c1d95] drop-shadow-md leading-snug sm:leading-tight">
            Clinica MedPrime - <br />
            Sănătatea ta, <br />
            prioritatea noastră
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-gray-700 drop-shadow-xs">
            Accesează rapid lista completă de medici și specialități și programează-te online,
            fără bătăi de cap, în câțiva pași simpli.
          </p>

          <a href="#speciality">
            <button className="w-full sm:w-auto flex items-center justify-center cursor-pointer gap-2 bg-white px-7 py-2.5 rounded-xl text-[#4c1d95] text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-500 md:text-base">
              Programează-te
              <FontAwesomeIcon icon={faBookmark} />
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Header;
