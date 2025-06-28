import { useEffect, useState } from "react";
import { donareInfo }  from "../assets/donation/info";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardCheck, faCircleCheck, faGift, faBookMedical, faCheck, faListCheck } from "@fortawesome/free-solid-svg-icons";

const DonationInfo = () => {
  const [info, setInfo] = useState({ criterii: [], proces: [], beneficii: [] });

  useEffect(() => {
    setInfo(donareInfo);
  }, []);

  return (
    <div className="bg-white border border-gray-300 rounded-2xl shadow-2xl mx-4 sm:mx-10 my-10 px-6 py-10">

        <h2 className="text-2xl sm:text-3xl text-center font-bold text-purple-900 mb-5 md:mb-10 italic">
            <FontAwesomeIcon icon={faBookMedical} className='mr-2' />
            Informații despre donare
        </h2> 

      <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 sm:gap-5 md:gap-10 gap-5 md:ml-25 md:mr-25">
        
        {/* Criterii */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl shadow p-6">
            <div className="flex items-center justify-center gap-2 mb-6 text-purple-800 font-bold text-lg md:text-xl">
                <FontAwesomeIcon icon={faClipboardCheck } className="mr-2"/>
                Criterii de eligibilitate
            </div>
            <ul className="list-none space-y-1 text-sm text-gray-700">
                {info.criterii.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 mb-3">
                        <FontAwesomeIcon icon={faCheck} className="text-green-500 mt-1" />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>

        {/* Proces */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl shadow p-6">
            <div className="flex items-center justify-center gap-2 mb-6 text-purple-800 font-bold text-lg md:text-xl">
                <FontAwesomeIcon icon={faListCheck} className="mr-2" />
                Procesul de donare
          </div>
          <ul className="list-none space-y-1 text-sm text-gray-700">
            {info.proces.map((step, index) => (
              <li key={index} className="flex items-start gap-2 mb-3">
                <FontAwesomeIcon  icon={faCircleCheck}  className="text-green-500 mt-1" />
                <span>{step}</span>
                </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-2xl shadow p-6">
            <div className="flex items-center justify-center gap-2 mb-6 text-purple-800 font-bold text-lg md:text-xl">
                <FontAwesomeIcon icon={faGift}  className="mr-2"/>
                Beneficii pentru donatori
            </div>
            <ul className="list-none space-y-1 text-sm text-gray-700">
                {info.beneficii.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2 mb-3">
                <FontAwesomeIcon icon={faCheck} className="text-green-500 mt-1" />
                <span>{benefit}</span>
                </li>
            ))}
            </ul>
        </div>
      </div>
    </div>
  );
};

export default DonationInfo;
