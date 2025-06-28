import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faArrowDown, faArrowUp, faBell, faFolderOpen, faBriefcase,  faClock,  faClockRotateLeft,  faCommentDots,  faEnvelopeOpenText,  faEye,  faEyeSlash,  faHospital, faLock, faMagnifyingGlass, faMapMarkerAlt, faPaperPlane, faPenToSquare, faStar, faStethoscope,  faTools,  faUserDoctor } from "@fortawesome/free-solid-svg-icons";

import { AppContext } from "../../../context/AppContex";
import { useCheckDoctorAccess } from '../../../accessControl/useCheckDoctorAccess ' 


import Loader from "../../../components/Loader";

import PatientCard from "../PatientsFiles/PatientCard";

const DoctorPatients = () => {

  useCheckDoctorAccess();

  const { backendUrl } = useContext(AppContext);

  const { doctorID } = useParams();
  
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [patients, setPatients] = useState([]);

  //Preluare date
    const fetchDoctorPatients = async () => {
    
    try {
      setLoading(true);
      setLoadingMessage("Se încarcă pacienți medicului...");

      const res = await axios.post(`${backendUrl}/api/doctor/get-doctor-patients`, {
        doctorID: doctorID,
      });
      if (res.status === 200) {
        setPatients(res.data.data);
        console.log("Pacienți ", res.data.data)
      }
    } catch (err) {
      console.error("Eroare la fetch pacienți:", err);
      toast.error("Nu s-au putut prelua pacienți.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      if (!doctorID) return; 

      fetchDoctorPatients();
  }, [doctorID]);


  const handleView = (patientID) => {
    navigate(`/profil-medic/${doctorID}/dosare-pacienti/${patientID}`);
  };

  return (
    <div>
      {/* Intro */}
      <div className="flex flex-col items-center sm:flex-row sm:justify-between sm:items-center border-b-1 border-gray-200 p-3">
          <div className="flex flex-col items-center sm:flex-row sm:items-center gap-2 sm:gap-3">
              {/* Icon */}
              <FontAwesomeIcon
              icon={faFolderOpen} 
              className="text-purple-600 md:text-3xl text-3xl sm:mb-0 ml-5"
              />
              {/* Text */}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center sm:text-left">
              Dosare medicale
              <p className="text-gray-600 text-sm font-semibold">
                  Vizualizează dosarele pacienților tăi.
              </p>
              </h2>
          </div>
      </div>

      {loading ? (
        <div>
           {loading && <Loader message={loadingMessage} />}
        </div>
      ) : patients.length === 0 ? (
        <div className="px-6 py-3">
            <div className="bg-white rounded-xl shadow-md px-6 py-4 mb-10 mt-4 text-center text-gray-500 italic font-semibold">    
              Nu ai pacienți înregistrați.
            </div>
          </div>
   
      ) : (
        <>
          <div className="px-6 py-3">
            <div className="bg-white rounded-xl shadow-md px-6 py-4 mb-10 mt-4">    

               <div className="flex items-center justify-center relative my-2 mt-3 mb-5">
                    <div className="flex-grow border-t border-gray-300 mr-3"></div>
                    <span className="text-gray-700 md:text-base text-sm font-medium whitespace-nowrap">
                    Numărul pacinețiilor: <strong>{patients.length}</strong>
                    </span>
                    <div className="flex-grow border-t border-gray-300 ml-3"></div>
                </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {patients.map((patient) => (
                  <PatientCard
                    key={patient.patientID}
                    patient={patient}
                    onView={handleView}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default DoctorPatients