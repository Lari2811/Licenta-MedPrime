import React from 'react';
import { useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';

import registerImage from '../assets/login.png';
import Lottie from 'lottie-react';
import register from '../assets/register.json'

const JoinNow = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row items-center justify-between bg-purple-50 border border-purple-200 rounded-2xl shadow-xl p-6 md:p-10 mx-4 sm:mx-10 my-10">
      {/* Text si actiuni */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-purple-900 mb-3">
          Ești pregătit să începi?
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-700 drop-shadow-xs mb-3">
          Creează-ți contul gratuit și bucură-te de acces rapid la consultații medicale, programări online și istoricul tău medical, totul într-un singur loc.
        </p>

        <button
          onClick={() => navigate('/inregistrare')}
          className="bg-purple-600 cursor-pointer hover:bg-purple-700 text-white font-semibold px-7 py-2.5 rounded-full transition duration-300 flex items-center justify-center gap-2 shadow-md hover:scale-105"
        >
          <FontAwesomeIcon icon={faUserPlus} />
          Creează cont (pacient)
        </button>

        <p className="text-base text-gray-600 mt-5">
          Ai deja un cont?
          <span
            onClick={() => navigate('/autentificare')}
            className="ml-2 text-purple-700 underline cursor-pointer hover:text-purple-900"
          >
            Autentifică-te aici
          </span>
        </p>

      
      </div>

      {/* Imagine */}
      <div className="w-full md:w-1/2 mt-6 md:mt-0 flex justify-center">
        <Lottie animationData={register} loop={true} />
      </div>
    </div>
  );
};

export default JoinNow;
