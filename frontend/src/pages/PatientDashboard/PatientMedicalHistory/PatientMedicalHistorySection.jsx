import React, { useContext, useEffect, useState } from 'react'
import { useCheckPatientAccess } from '../../../accessControl/useCheckPatientAccess';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardCheck, faClipboardList, faCommentDots, faDownload, faEdit, faEye, faFileImage, faFilePdf, faHashtag, faHistory, faHospital, faHouse, faMessage, faStar, faUser, faUserMd } from '@fortawesome/free-solid-svg-icons';
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
import PdfPreviewModal from '../../../components/PdfPreviewModal ';
import { formatDateRo } from '../../../utils/formatDataRO';


const calcEndDate = (startDate, durata) => {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(start.getDate() + parseInt(durata));
  return end.toLocaleDateString();
};


const PatientMedicalHistorySection = () => {

    useCheckPatientAccess();

    const { backendUrl } = useContext(AppContext);

    const navigate = useNavigate();

    const { patientID } = useParams();

    const [patientData, setPatientData] = useState([])
    const [medicalHistoryData, setMedicalHistoryData] = useState([]);

    const { label, color, icon } = formatStatus(patientData?.status);
  
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const [loadingPatients, setLoadingPatient] = useState(false)

    // ------------------------- Preluare date pacient  -------------------------
    const fetchPatientData = async () => {
        let loadingTimer;

        try {
        // Afișare mesaj loading cu întârziere scurtă
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

    // ------------------------- Preluare date istoric medical  -------------------------
    useEffect(() => {
      const fetchMedicalHistory = async () => {
        setLoading(true);
        try {
          const res = await axios.post(`${backendUrl}/api/patient/get-medical-history`, {
            patientID: patientID,
          });

          if (res.status === 200 && res.data.success) {
            setMedicalHistoryData(res.data.data);
            console.log("Istoric medical:", res.data.data);
          }
        } catch (err) {
          toast.error("Eroare la preluarea istoricului medical.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      if (patientID) fetchMedicalHistory();
    }, [patientID]);


    const handleFileClick = (url, filename) => {
  if (filename.endsWith('.pdf')) {
    setModalPdfUrl(url); 
    setShowPdfModal(true);
  } else {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};


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
                <FontAwesomeIcon icon={faHistory} />
                <span className="ml-1">Istoric Medical</span>
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

          {/* Istoric */}
          <div className="px-6 py-1">

            {/* Header inside */}
            <div className="flex flex-col items-center sm:flex-row sm:justify-between sm:items-center gap-4 p-4 border-b-1 border-gray-300 p-5 mb-3">
                <div className="flex flex-col items-center sm:flex-row sm:items-center gap-2 sm:gap-3">
                    {/* Icon */}
                    <FontAwesomeIcon
                        icon={faHistory}
                        className="text-purple-600 md:text-3xl text-3xl sm:mb-0"
                    />
    
                    {/* Text */}
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center sm:text-left">
                        Istoricum meu medical
                    </h2>
                </div>
                
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
               {medicalHistoryData.appointments?.map((appointment, idx) => (
                  appointment.medicalSheet && (
                    <div key={idx} className="bg-gray-50 p-4 mb-4 rounded-lg border border-purple-100 shadow-sm hover:shadow-md transition">
                      
                      {/* Header card */}
                      <div className="mb-3">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">
                          Consultație: {appointment.appointmentID} - {appointment.investigationName}
                      </h3>
                      <p className="text-sm font-semibold text-gray-600">
                          Data: <strong>{formatDateRo(appointment.date)}</strong> | Ora: <strong>{appointment.startTime} - {appointment.endTime}</strong>
                      </p>
                      <p className="text-sm font-semibold text-gray-600">
                          Locația: <strong>{appointment.locationName}</strong> 
                      </p>
                      <p className="text-sm font-semibold text-gray-600">
                          Medicul: <strong>{appointment.doctorName}</strong>
                      </p>
                      </div>

                      {/* Diagnostic + recomandari */}
                      <div className="mb-3 text-sm space-y-2">
                      <p><strong>Diagnostic:</strong> {appointment.medicalSheet.diagnostic}</p>
                      <p><strong>Descriere:</strong> {appointment.medicalSheet.rezumat}</p>
                      <p><strong>Recomandări:</strong> {appointment.medicalSheet.recomandari}</p>
                      <p><strong>Trimitere:</strong> {appointment.medicalSheet.trimiteri}</p>
                      </div>

                      {/* Tratamente */}
                      <div className="mb-3 text-sm space-y-2">
                      <p className="font-semibold text-purple-600 mb-2">Tratamente:</p>
                      <div className="grid grid-cols-1 gap-3">
                          {appointment.medicalSheet.treatments?.map((t, i) => {
                          const endDate = calcEndDate(t.startDate, t.durata);
                          const isActive = new Date() < new Date(endDate);

                          return (
                              <div
                              key={i}
                              className={`border-l-4 rounded-md p-3 shadow-sm ${
                                  isActive
                                  ? 'border-orange-400 bg-orange-50'
                                  : 'border-green-500 bg-green-50'
                              }`}
                              >
                              <p><strong>Medicament:</strong> {t.medicament}</p>
                              <p><strong>Observații:</strong> {t.observatii}</p>
                              <p><strong>Dozaj:</strong> {t.dozaj}</p>
                              <p><strong>Perioadă:</strong> {t.startDate} – {endDate}</p>
                              <p><strong>Durata:</strong> {t.durata} zile</p>
                              <p><strong>Observații:</strong> {t.observatii}</p>
                              </div>
                          );
                          })}
                      </div>
                      </div>

                      {/* Atasaamente */}
                      <div className="text-sm">
                      <p className="font-semibold text-purple-600 mb-1">Atașamente:</p>
                      {appointment.medicalSheet.atasamente?.map((url, i) => (
                          <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline text-sm block"
                          >
                          Atașament {i + 1}
                          </a>
                      ))}
                      </div>
                  </div>
                  )
                ))}
            </div>
          </div>
        </div>


      
      
      
      </>)}




    </div>
  )
}

export default PatientMedicalHistorySection