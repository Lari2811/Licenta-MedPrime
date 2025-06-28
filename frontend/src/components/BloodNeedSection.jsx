import { useEffect, useState } from "react";
import bloodNeedsData from "../assets/donation/bloodNeeds";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDroplet } from "@fortawesome/free-solid-svg-icons";

const BloodNeedSection = () => {
  const [bloodNeeds, setBloodNeeds] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setBloodNeeds(bloodNeedsData);
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white border border-gray-300 rounded-2xl shadow-2xl mx-4 sm:mx-10 my-10 px-6 py-10 ">
    
        <h2 className="text-xl sm:text-2xl text-center font-bold italic text-red-900 mb-5">
            <FontAwesomeIcon icon={faDroplet} className='mr-2 text-red-700' />
            Necesar actual de sânge
        </h2> 
      
      <p className="text-center text-gray-600 mb-8 text-base md:text-lg">
        Verificați grupele de sânge care sunt în prezent cele mai necesare la centrele noastre de donare.
        Donarea dumneavoastră poate salva vieți!
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 md:gap-10 md:ml-10 md:mr-10">
        {bloodNeeds.map((item, index) => (
          <div key={index} className="bg-gray-100 p-4 rounded-xl shadow text-center">
            <h3 className="text-lg font-semibold mb-2">{item.grupa}</h3>
            <div className="w-full h-3 bg-gray-300 rounded-full mb-2 overflow-hidden">
              <div
                className="h-full bg-red-700"
                style={{ width: `${item.procent}%` }}
              />
            </div>
            <p className="text-sm text-gray-700">Necesar: {item.procent}%</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BloodNeedSection;
