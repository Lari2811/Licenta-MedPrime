import React, { useContext, useEffect, useState } from 'react';
import './TopDoctors.css';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContex';
import { toast } from 'react-toastify';
import axios from 'axios'
import { assets } from '../../assets/assets';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan, faCheckCircle, faHourglassHalf, faLock, faStar, faUmbrellaBeach, faUserClock } from '@fortawesome/free-solid-svg-icons';
import { statusConfig } from '../../utils/DoctorStatusConfig';

const TopDoctors = () => {

  const navigate = useNavigate();

  const { backendUrl } = useContext(AppContext);

  const [doctorsData, setDoctorsData] = useState([])

  const fetchDoctors = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/main/get-all-active-doctors-with-data`);
          setDoctorsData(res.data.data);
          console.log("Doctorii din backend:", res.data.data);
      
      } catch (err) {  
        toast.error("Eroare server la doctori");
      }
  };

    useEffect(() => {
          fetchDoctors(); 
    }, []);
	
	


  return (
    <div className="bg-white border border-gray-300 rounded-2xl shadow-xl mx-4 sm:mx-10 my-10 px-6 py-10 flex flex-col items-center gap-6 text-gray-900">

      <h1 className="title text-2xl sm:text-3xl md:text-4xl font-medium text-center mb-4 mt-1">
        Echipa noastră de specialiști
      </h1>
      <p className="text-sm sm:text-base md:text-lg text-gray-700 drop-shadow-xs">
        Profesioniști dedicați sănătății tale - alege medicul potrivit pentru tine.
      </p>

      <div className="w-full grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-5 pt-6 gap-y-10 px-3 sm:px-0">
        {Array.isArray(doctorsData) ? (
          doctorsData
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 12)
            .map((item, index) => (
              <div
                className="doctor-card-wrapper w-full max-w-[220px] mx-auto border border-gray-300 rounded-xl overflow-hidden cursor-pointer transition-all duration-500 shadow-md"
                key={index}
              >
                <div className="doctor-card-inner">
                  {/* Fata cardului */}
                  <div className="doctor-card-front bg-white rounded-xl shadow-md overflow-hidden">
                    <img
                        className="bg-blue-500 object-cover"
                        src={item.profile?.profileImage || assets.doctor_default}
                        alt={`Dr. ${item.lastName}`}
                      />
                      <div className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-green-500 text-sm mb-1">
                   
                          <div className={`flex items-center justify-center gap-2 text-sm mb-1 ${statusConfig[item.status]?.color || "text-gray-400"}`}>
                            <FontAwesomeIcon icon={statusConfig[item.status]?.icon} />
                            <p>{statusConfig[item.status]?.text || "Status necunoscut"}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-gray-800">
                          Dr. {item.lastName} {item.firstName}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {item.specialities?.[0]?.specialityName || "Fără specialitate"}
                        </p>
                        {typeof item.rating === "number" && (
                          <p className="text-yellow-500 text-xs mt-1">
                            <FontAwesomeIcon icon={faStar} /> {item.rating.toFixed(1)} / 5
                          </p>
                        )}
                      </div>

                  </div>

                {/* Spatele cardului */}
                  <div className="doctor-card-back p-4 text-center">
                    <p className="text-base font-semibold mb-1">
                      {item.type === "rezident" && "Medic rezident"}
                      {item.type === "specialist" && "Medic specialist"}
                      {item.type === "primar" && "Medic primar"}
                    </p>

                    <p className="text-sm mb-1">
                      Experiență: {item?.experience?.[0] || "Nespecificat"}
                    </p>

                    <p className="text-xs text-gray-500 mt-1 mb-3">
                      {item.locations?.[0]?.address?.city || "Locație indisponibilă"}
                    </p>

                    <button
                      
                      onClick={() => {
                        const doctorName = `Dr.${item.lastName}-${item.firstName}`;
                        navigate(`/medici/${item.doctorID}/${doctorName}/profil-medic`)
                     
                      }}
                      className="px-4 py-1 bg-purple-500 text-white rounded-full text-sm hover:bg-purple-700 transition hover:cursor-pointer"
                    >
                      Vezi profil
                    </button>
                  </div>

                </div>
              </div>
          ))
        ) : ( 
           <p>Se încarcă doctorii...</p>
        )}
      </div>

      <button
        onClick={() => {
          navigate('/medici');
          scrollTo(0, 0);
        }}
        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-50 text-gray-600 px-7 py-2.5 rounded-full mt-4 font-bold shadow-md hover:shadow-lg hover:scale-103 hover:cursor-pointer transition-all duration-300 md:text-base hover:text-gray-800"
      >
        mai mulţi medici
      </button>
    </div>
  );
};

export default TopDoctors;
