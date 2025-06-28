import { faRightToBracket, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

const ModalPacient = ({ onClose, onLogin }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white/90 backdrop-blur-lg p-6 rounded-2xl shadow-2xl w-[90%] max-w-md relative border border-gray-200">

        {/* Icon login */}
        <div className="w-full flex justify-center mb-4">
          <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-3xl">
            <FontAwesomeIcon icon={faRightToBracket} />
          </div>
        </div>

        {/* Titlu + text */}
        <h2 className="text-center text-xl font-bold text-gray-800 mb-2">Autentificare necesară</h2>
        <p className="text-center text-sm text-gray-600">
          Pentru a efectua o programare, trebuie să fii autentificat cu un cont de pacient.
        </p>

        {/* Butoane */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={onClose}
            className="flex cursor-pointer font-semibold items-center gap-2 border border-gray-300 text-gray-600 hover:text-red-600 hover:border-red-600 px-4 py-2 rounded-md transition text-sm"
          >
            <FontAwesomeIcon icon={faTimesCircle} />
            Renunță
          </button>
          <button
            onClick={onLogin}
            className="flex cursor-pointer font-semibold  items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition text-sm"
          >
            <FontAwesomeIcon icon={faRightToBracket} />
            Autentificare
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPacient;
