import React, { useContext, useEffect, useState } from 'react'
import { useCheckPatientAccess } from '../../../accessControl/useCheckPatientAccess';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardCheck, faClipboardList, faCommentDots, faEdit, faHouse, faMessage, faStar, faUser } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { formatStatus } from '../../../utils/formatStatus';
import { AppContext } from '../../../context/AppContex';
import { assets } from '../../../assets/assets';
import Loader from '../../../components/Loader';
import axios from 'axios';
import { toast } from 'react-toastify';
import CustomSelect_2 from '../../../components/customSelect_2';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import socket from '../../../socket';

const PatientFeedbackSection = () => {

    useCheckPatientAccess();

    const { backendUrl } = useContext(AppContext);

    const navigate = useNavigate();

    const { patientID } = useParams();

    const [patientData, setPatientData] = useState([])
    const [feedbackData, setFeedbackData] = useState([]);

    
    const { label, color, icon } = formatStatus(patientData?.status);
  
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const [loadingPatients, setLoadingPatient] = useState(false)
    const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);


    // ------------------------- Preluare date pacient  -------------------------
  
    const fetchPatientData = async () => {
        let loadingTimer;

        try {
        // afisare mesaj loading cu întârziere scurtă
        loadingTimer = setTimeout(() => {
            setLoadingPatient(true);
            setLoadingMessage("Se încarcă datele pacientului...");
        }, 150);

        const response = await axios.get(`${backendUrl}/api/patient/get-patient-by-ID/${patientID}`);

        if (response.status === 200 && response.data.success) {
            console.log("Pacient:", response.data.data);
            setPatientData(response.data.data);
            
        } else {
            toast.error(response.data.message || 'Pacientul nu a fost găsit.');
        }
        } catch (error) {
        console.error('Eroare API pacient:', error);
        toast.error('Eroare la încărcarea datelor pacientului.');
        } finally {
        clearTimeout(loadingTimer);
        setLoadingPatient(false);
        }
    };

    useEffect(() => {
      fetchPatientData();
    }, []);

  // ------------------------- Preluare date feedback  -------------------------
    useEffect(() => {
      if (!patientID) return;

      const fetchFeedbacks = async () => {
        setLoadingFeedbacks(true);
        try {
          const res = await axios.post(`${backendUrl}/api/patient/get-feedback-by-id`, {
            patientID: patientID,
          });
          if (res.status === 200) {
            setFeedbackData(res.data.data);
            console.log("Feedback-uri: ", res.data.data)
          }
        } catch (err) {
          console.error("Eroare la fetch feedback-uri:", err);
          toast.error("Nu s-au putut prelua feedback-urile.");
        } finally {
          setLoadingFeedbacks(false);
        }
      };

      fetchFeedbacks();

      socket.on('FEEDBACK_ADDED', ({ doctorID }) => {
        if (patientID === patientID) {
          toast.info('Ai adăugat un nou feedback!');
          fetchFeedbacks();
        } 
      });

      return () => {
        socket.off('FEEDBACK_ADDED');
      };


    }, [patientID]);
        

  return (
      <div>
        {loading && <Loader message={loadingMessage} />}

        {patientData && (
          <>
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-gray-500 text-xs sm:text-lg mb-5 px-5 mx-5 sm:mx-10 my-5">
                    <Link to="/" className="flex items-center space-x-1 hover:text-purple-600 hover:underline transition">
                    <FontAwesomeIcon icon={faHouse} />
                    <span className="ml-1">Acasă</span>
                </Link>
                <span className="text-gray-400">{'>'}</span>
                <span className="text-purple-600 underline font-medium">
                    <FontAwesomeIcon icon={faCommentDots} />
                    <span className="ml-1">Feedback</span>
                </span>
            </nav>

            {/* Info */}
            <div className="border bg-gray-50 border-gray-200 border-2 rounded-2xl shadow-xl mx-4 sm:mx-10 my-5 flex flex-col text-gray-900">
               
              {/* Header */}
              <div className="relative bg-gradient-to-r from-purple-200 to-pink-100 border border-gray-200 rounded-t-2xl shadow-md p-3  flex flex-col sm:flex-row items-center gap-6">
                  {/* poza de profil + input */}
                  <div className="relative">
                      <img
                      src={patientData.profileImage || assets.user_default}
                      alt="Profil"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      <span className="absolute bottom-2 right-0  bg-blue-300 text-white rounded-full p-2 px-3 shadow-md">
                      <FontAwesomeIcon icon={faUser} />
                      </span>
                  </div>
      
                  {/* Info pacient */}
                  <div className="flex-1 flex flex-col items-center sm:items-start">
                      <h2 className="md:text-3xl text-2xl font-extrabold text-purple-700 mb-1">
                      {patientData ? `${patientData.lastName} ${patientData.firstName}` : 'Nume Prenume'}
                      </h2>
                      <div className="flex items-center gap-2 mb-2 bg-white px-3 py-1 rounded-full text-sm font-bold">
                      <span className="text-purple-700">
                          Pacient MedPrime: 
                      </span>
                      {patientData?.createdAt && (
                          <span className="text-gray-800 font-semibold">
                          din {new Date(patientData.createdAt).getFullYear()}
                          </span>
                      )}
                      </div>
                      <div className="flex items-center gap-2 mb-2 bg-white px-3 py-1 rounded-full text-sm font-bold">
                      <span className="text-purple-700">
                          Status: 
                      </span>
                      <span className={`flex items-center gap-1 ${color}`}>
                          <FontAwesomeIcon icon={icon} className="w-4 h-4 ml-1" />
                          <span className="font-semibold text-sm">{label}</span>
                      </span>
                      </div>
                  </div>
              </div>

              {/* Feedback-uri */}
              <div className="px-6 py-1">

                {/* Header */}
                <div className="flex flex-col items-center sm:flex-row sm:justify-between sm:items-center gap-4 p-4 border-b-1 border-gray-300 p-5 mb-3">
                    <div className="flex flex-col items-center sm:flex-row sm:items-center gap-2 sm:gap-3">
                        {/* Icon */}
                        <FontAwesomeIcon
                            icon={faCommentDots}
                            className="text-purple-600 md:text-3xl text-3xl sm:mb-0"
                        />
        
                        {/* Text */}
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center sm:text-left">
                            Feedbak-uri oferite medicilor
                        </h2>
                    </div>
                    
                </div>
                                  
                <div className=" mb-4 mt-4">   
                    
                  {loadingFeedbacks ? (
                    <p className="text-gray-500 text-sm">Se încarcă feedback-urile...</p>
                  ) : feedbackData.length === 0 ? (
                    <p className="text-gray-500">Nu ai oferit încă niciun feedback.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {feedbackData.map((fb) => (
                       <div
                        key={fb.patientFeedbackID}
                        className="relative bg-white rounded-2xl border border-gray-200 shadow-lg p-6 hover:shadow-xl transition-all duration-300"
                      >
                       

                        {/* Header - poza + medic */}
                        <div className="flex items-center gap-4 mb-4">
                          <img
                            src={fb.doctorInfo?.profileImage || assets.doctor_default}
                            alt="Medic"
                            className="w-16 h-16 rounded-full object-cover border-2 border-purple-300"
                          />
                          <div className="flex flex-col">
                            <h3 className="text-xl font-bold text-gray-800">
                              {fb.doctorInfo?.lastName} {fb.doctorInfo?.firstName}
                            </h3>
                            <p className="text-md text-gray-700 font-semibold">ID: {fb.doctorInfo?.doctorID}</p>
                             {/* eticheta investigatie investigație */}
                              {fb.investigationName && (
                                <p className=" text-md text-gray-700 font-semibold">
                                  {fb.investigationName}
                                </p>
                              )}
                          </div>
                          
                        </div>

                        {/* Rating */}
                        <div className="flex items-center mb-3">
                          {[...Array(5)].map((_, i) => (
                            <FontAwesomeIcon
                              key={i}
                              icon={faStar}
                              className={`h-5 w-5 ${
                                i < fb.rating ? "text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-md text-gray-600 font-semibold">({fb.rating}/5)</span>
                        </div>

                        {/* Comentariu */}
                        <div className="bg-gray-50 p-4 rounded-lg border text-gray-700 mb-3">
                          <p className="text-md italic font-semibold">„{fb.comment}”</p>
                        </div>

                        {/* data feedback */}
                        <p className="text-sm text-gray-400 text-right font-mono">
                          {format(new Date(fb.createdAt), "dd.MM.yyyy HH:mm")}
                        </p>
                      </div>

                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      
    </div>
  )
}

export default PatientFeedbackSection