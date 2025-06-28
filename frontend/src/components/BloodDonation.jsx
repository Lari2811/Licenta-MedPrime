import React from 'react';
import Lottie from 'lottie-react';
import bloodAnimation from '../assets/blood-donation.json';
import { useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDroplet, faRightLong } from '@fortawesome/free-solid-svg-icons';

const BloodDonation = () => {

    const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row items-center justify-between bg-red-50 rounded-2xl shadow-xl p-6 md:p-10 mx-4 sm:mx-10 my-10 border border-red-200">
      {/* Animatie */}
      <div className="w-full md:w-1/3 mb-6 md:mb-0 flex justify-center">
        <div className="w-55 md:w-70">
          <Lottie animationData={bloodAnimation} loop={true} />
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold mr-3 animate-pulse  flex justify-center">
             <FontAwesomeIcon icon={faDroplet} className='mr-1'/> Urgent
            </span>
        </div>
      </div>

      {/* Textul si butonul */}
      <div className="w-full md:w-2/3 text-center md:text-left flex flex-col items-center md:items-midle">

        {/* Titlu */}
        <h2 className="text-2xl sm:text-3xl font-bold text-red-700 mb-3 leading-tight flex items-center justify-left gap-2">
          Salvează o viață. Donează sânge 
          <FontAwesomeIcon icon={faDroplet} size="sm" style={{color: "#b80000",}} />
        </h2>

        {/* Subtitlu */}
        <p className="text-sm sm:text-base md:text-lg text-gray-700 drop-shadow-xs mb-2">
          O singură donare poate ajuta până la 3 oameni. E simplu. E rapid. E vital.
        </p>

        {/* Statistică */}
        <p className="text-sm text-gray-600 mb-6 max-w-xl mx-auto">
          Peste 15.000 de donatori au salvat vieți prin platforma noastră.
        </p>

        {/* Buton pagina Donare */}
        <button 
          onClick={() => navigate('/donare')}
          className="bg-red-600 cursor-pointer hover:bg-red-700 text-white font-semibold px-7 py-2.5 rounded-full transition duration-300 shadow-md hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2"
        >
            Vezi cum poți ajuta  
            <FontAwesomeIcon icon={faRightLong} size="lg" />
        </button>
      </div>
    </div>
  );
};

export default BloodDonation;
