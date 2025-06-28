import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faArrowDown, faArrowUp, faBell, faFolderOpen, faBriefcase,  faClock,  faClockRotateLeft,  faCommentDots,  faEnvelopeOpenText,  faEye,  faEyeSlash,  faHospital, faLock, faMagnifyingGlass, faMapMarkerAlt, faPaperPlane, faPenToSquare, faStar, faStethoscope,  faTools,  faUserDoctor, faHashtag, faClockFour, faUser, faUserCircle, faHeartbeat, faNotesMedical } from "@fortawesome/free-solid-svg-icons";

import { AppContext } from "../../../context/AppContex";
import { useCheckDoctorAccess } from '../../../accessControl/useCheckDoctorAccess ' 

import CustomSelect from "../../../components/customSelect";
import DisplayRequestsTable from "../Request/DisplayRequestsTable";
import Loader from "../../../components/Loader";
import socket from "../../../socket";
import { formatDate, formatDateRo } from "../../../utils/formatDataRO";
import DisplayAppForPatient from "./displayAppForPatient";


const formatDateDMY = (date) => {
  const zi = String(date.getDate()).padStart(2, '0');
  const luna = String(date.getMonth() + 1).padStart(2, '0'); 
  const an = date.getFullYear();
  return `${zi}.${luna}.${an}`;
};

const PatientFileInfo = () => {

    useCheckDoctorAccess();
    
      const { backendUrl } = useContext(AppContext);
    
      const { doctorID, subsection: patientID } = useParams();
      
 
      const navigate = useNavigate();
    
      const [loading, setLoading] = useState(false);
      const [loadingMessage, setLoadingMessage] = useState("");
    
      const [patientData, setPatientData] = useState([]);

      
      const fetchPatientData = async () => {
      
        try {
          setLoading(true);
          setLoadingMessage("Se încarcă datele pacientului...");

          const res = await axios.post(`${backendUrl}/api/doctor/get-patient-medical-record`, {
            patientID: patientID,
          });
          if (res.status === 200) {
            setPatientData(res.data.data);
            console.log("Pacient ", res.data.data)
          }
        } catch (err) {
          console.error("Eroare la fetch pacient:", err);
          toast.error("Nu s-au putut prelua pacientul.");
        } finally {
          setLoading(false);
        }
      };

      useEffect(() => {
          if (!patientID) return; 

          fetchPatientData();
      }, [patientID]);

      const getActiveTreatments = () => {
        const today = new Date();
        const activeTreatments = [];

        if (!patientData?.appointments) {
          return activeTreatments;
        }


        patientData.appointments.forEach((appt, index) => {
          if (!appt?.medicalSheet) {
            return;
          }
          const treatments = appt.medicalSheet.treatments || [];
          treatments.forEach((treat, idx) => {
            const start = new Date(treat.startDate);
            const end = new Date(start);
            end.setDate(end.getDate() + Number(treat.durata)); 

            if (today >= start && today <= end)
              activeTreatments.push({
                ...treat,
                endDate: formatDateDMY(end),
                sourceAppointmentID: appt.appointmentID,
                doctorName: appt.doctorName,
                investigationName: appt.investigationName,
                date: appt.date
              });
          
          });
        });

        console.log("Tratamente active finale:", activeTreatments);
        return activeTreatments;
      };


      const getAppointmentSummary = () => {
        const today = new Date();
        const appointments = patientData.appointments || [];

        // Filtrari
        const completed = appointments.filter(appt => appt.status?.toLowerCase() === "finalizata");
        const upcoming = appointments.filter(appt => new Date(appt.date) > today);
        const withInvestigation = appointments.filter(
          appt => appt.investigationName && new Date(appt.date) <= today
        );

        // Sortari
        const sortedCompleted = [...completed].sort((a, b) => new Date(b.date) - new Date(a.date));
        const sortedUpcoming = [...upcoming].sort((a, b) => new Date(a.date) - new Date(b.date));
        const sortedInvestigations = [...withInvestigation].sort((a, b) => new Date(b.date) - new Date(a.date));

        return {
          lastCompleted: sortedCompleted[0] || null,
          nextAppointment: sortedUpcoming[0] || null,
          recentInvestigations: sortedInvestigations.slice(0, 2),
          totalAppointments: appointments.length,
        };
      };

      const summary = getAppointmentSummary();

      // ----------- Carduri de date -----------
      const renderPersonalInfoCard = () => {
        const p = patientData.patient;

        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg md:text-xl font-bold text-purple-800 mb-4 flex items-center">
              <FontAwesomeIcon icon={faUserCircle} className="text-purple-800 mr-2" />
              Date Personale
            </h2>

            <div className="space-y-3 text-sm md:text-base">
              <div>
                <p className="text-gray-500 md:font-medium text-xs md:text-sm">Nume și Prenume:</p>
                <p className="font-medium">{p.lastName} {p.firstName}</p>
              </div>

              <div>
                <p className="text-gray-500 md:font-medium text-xs md:text-sm">CNP:</p>
                <p className=" font-medium">{p.cnp}</p>
              </div>

              <div className="flex flex-col md:flex-row md:gap-10 gap-3">
                <div>
                  <p className="text-gray-500 md:font-medium text-xs md:text-sm">Data Nașterii:</p>
                  <p className="font-medium">{p.birthDate}</p>
                </div>
                <div>
                  <p className="text-gray-500 md:font-medium text-xs md:text-sm">Vârstă:</p>
                  <p className="font-medium">{p.age} ani</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:gap-10 gap-3">
                <div>
                  <p className="text-gray-500 md:font-medium text-xs md:text-sm">Telefon:</p>
                  <p className="font-medium">{p.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500 md:font-medium text-xs md:text-sm">Email:</p>
                  <p className="font-medium">{p.email}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-500 md:font-medium text-xs md:text-sm">Adresă:</p>
                <p className="font-medium">{p.address.address_details} {p.address.city} {p.address.county}</p>
              </div>
            </div>
            </div>

        );
      };

      const renderMedicalInfoCard = () => {
        const p = patientData.patient;
        const activeTreatments = getActiveTreatments();

        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg md:text-xl font-bold text-purple-800 mb-4 flex items-center">
              <FontAwesomeIcon icon={faHeartbeat} className="text-purple-800 mr-2" />
              <i className="fas fa-heartbeat mr-2 text-purple-600"></i>
              Informații Medicale
            </h2>

            <div className="space-y-4 text-sm md:text-base">
              {/* Grup Sanguin */}
              <div>
                <p className="text-gray-500 md:font-medium text-xs md:text-sm">Grup Sanguin:</p>
                <p className="font-medium">{p.bloodGroup || "—"} Rh {p.rh} </p>
              </div>

              {/* Alergii */}
              <div>
                <p className="text-gray-500 md:font-medium text-xs md:text-sm">Alergii:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {p.allergies?.length > 0 ? (
                    p.allergies.map((a, i) => (
                      <span
                        key={i}
                        className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs md:text-sm"
                      >
                        {a}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs md:text-sm text-gray-500">Nicio alergie cunoscută</span>
                  )}
                </div>
              </div>

              {/* Medicatie Curenta */}
              <div>
                <p className="text-gray-500 md:font-medium text-xs md:text-sm">Medicație Curentă:</p>
                <ul className="list-disc list-inside text-xs md:text-sm text-gray-700 mt-1">
                  
                  {activeTreatments.length > 0 ? (
                    activeTreatments.map((t, i) => (
                      <li key={i}>{t.medicament} - {t.dozaj} până la data de {t.endDate} </li>
                    ))
                  ) : (
                    <li>Niciuna activă</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        );
      };

      const renderSummaryCard = () => {
        const summary = getAppointmentSummary();

        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg md:text-xl font-bold text-purple-800 mb-4 flex items-center">
              <FontAwesomeIcon icon={faNotesMedical} className="text-purple-800 mr-2" />
              Rezumat Dosar
            </h2>

            <div className="space-y-3 text-sm md:text-base">
              
              <div>
                <p className="text-gray-500 md:font-medium text-xs md:text-sm">Ultimul diagnostic:</p>
                <p className="font-medium">{summary.lastCompleted?.medicalSheet.diagnostic || "—"}</p>
              </div>

              <div>
                <p className="text-gray-500 md:font-medium text-xs md:text-sm">Ultima consultație:</p>
                <p className="font-medium">{formatDate(summary.lastCompleted?.date)}</p>
              </div>

              <div>
                <p className="text-gray-500 md:font-medium text-xs md:text-sm">Consultații totale:</p>
                <p className="font-medium">{summary.totalAppointments}</p>
              </div>

              <div>
                <p className="text-gray-500 md:font-medium text-xs md:text-sm">Investigații recente:</p>
                <ul className="list-disc list-inside text-sm font-medium text-gray-700">
                {summary.recentInvestigations.length > 0
                  ? summary.recentInvestigations.map((inv, i) => (
                      <li key={i}>{inv.investigationName} ({formatDate(inv.date)})</li>
                    ))
                  : <li>—</li>
                }
              </ul>
              </div>

              <div>
                <p className="text-gray-500 md:font-medium text-xs md:text-sm">Programarea uumătoare:</p>
                <p className="font-medium text-blue-700">
                {summary.nextAppointment
                  ? `${summary.nextAppointment.investigationName} - ${formatDate(summary.nextAppointment.date)}`
                  : "—"}
              </p>
              </div>
            
            </div>
          </div>
        );
      };

  return (
    <div>
      {loading ? (
        <div>
           {loading && <Loader message={loadingMessage} />}
        </div>
         ) : !patientData || !patientData.patient ? (
          
         <div className="px-6 py-3 bg-white rounded-xl shadow-md px-6 py-4 mb-10 mt-4 text-center text-gray-500 italic md:font-semibold font-medium">    
            Nu s-au putut încărca datele pacientului.
          </div>
      ) : (
        <>
        <div className="px-6 py-3">
          

          {/* Intro */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
              <div>
                <h1 className="text-lg md:text-3xl font-bold text-purple-800">
                  Dosar Medical - {patientData.patient.lastName} {patientData.patient.firstName}
                </h1>
                <div className="flex flex-col md:flex-row md:items-center mt-2 text-xs md:text-sm text-gray-600 gap-2">
                  <span>
                    <FontAwesomeIcon icon={faHashtag} className="text-gray-600 mr-1" />
                    ID: {patientData.patient.patientID}
                  </span>
                  <span>
                    <FontAwesomeIcon icon={faClockFour} className="text-gray-600 mr-1" />
                    Ultima actualizare: {formatDate(summary.lastCompleted?.date)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Carduri date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-6">
            {/* Card Date Personale */}
            {renderPersonalInfoCard()}

            {/* Card Info Medicale */}
            {renderMedicalInfoCard()}

            {/* Card Rezumat Dosar */}
            {renderSummaryCard()}
          </div>

          {/* Consultatii */}
           <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                <h2 className="text-lg md:text-xl font-bold text-purple-800 flex items-center">
                  <FontAwesomeIcon icon={faStethoscope} className="text-purple-800 mr-2" />
                 Consultații
                </h2>
              </div>
               
               <DisplayAppForPatient 
                    appointments = {patientData.appointments}
                />
            </div>
        </div>
        </> 
        )}
        
    </div>
    
  )
}

export default PatientFileInfo