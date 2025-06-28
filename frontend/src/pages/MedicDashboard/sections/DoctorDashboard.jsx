import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faArrowDown, faArrowUp, faBell, faFolderOpen, faBriefcase,  faClock,  faClockRotateLeft,  faCommentDots,  faEnvelopeOpenText,  faEye,  faEyeSlash,  faHospital, faLock, faMagnifyingGlass, faMapMarkerAlt, faPaperPlane, faPenToSquare, faStar, faStethoscope,  faTools,  faUserDoctor, faHashtag, faClockFour, faUser, faUserCircle, faHeartbeat, faNotesMedical, faCalendarCheck, faUserPlus, faMinus, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

import { AppContext } from "../../../context/AppContex";
import { useCheckDoctorAccess } from '../../../accessControl/useCheckDoctorAccess ' 

import Loader from "../../../components/Loader";
import socket from "../../../socket";
import DoctorScheduleCalendar from "../Dashboard/DoctorScheduleCalendar";
import DoctorActivityChart from "../Dashboard/DoctorChart";

const getCurrentDateFormatted = () => {
    const now = new Date();
    return now.toLocaleDateString("ro-RO", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getCurrentTimeFormatted = () => {
    const now = new Date();
    return now.toLocaleTimeString("ro-RO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStars = (rating) => {
  const fullStars = Math.floor(rating);
  const stars = [];

  for (let i = 0; i < 5; i++) {
    stars.push(
      <FontAwesomeIcon
        key={i}
        icon={faStar}
        className={`mr-1 ${i < fullStars ? "text-yellow-500" : "text-gray-300"}`}
      />
    );
  }

  return stars;
};

const DoctorDashboard = () => {

    useCheckDoctorAccess()

    const { backendUrl } = useContext(AppContext);
    
    const { doctorID } = useParams();
      
 
    const navigate = useNavigate();
  
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
  
    const [dashboardData, setDashboardData] = useState(null)
    const [appointmentsToday, setAppointmentsToday] = useState([])

    const fetchDashboardData = async () => {
    
      try {
        setLoading(true);
        setLoadingMessage("Se încarcă datele medicului...");

        const res = await axios.post(`${backendUrl}/api/doctor/get-doctor-dashboard-data`, {
          doctorID: doctorID,
        });
        if (res.status === 200) {
          setDashboardData(res.data.data);
          const data = res.data.data;
          const today = new Date().toISOString().split("T")[0];
          const todays = data.appointments.filter(
            appt => appt.date === today && appt.status !== "anulata"
          );
        setAppointmentsToday(todays);
          console.log("Date ", res.data.data)
        }
      } catch (err) {
        console.error("Eroare la fetch medic:", err);
        toast.error("Nu s-au putut prelua datelor medicului.");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
        if (!doctorID) return; 

        fetchDashboardData();
    }, [doctorID]);

    const today = new Date().toISOString().split("T")[0];

    const todaysAppointments = dashboardData?.appointments?.filter(appt => appt.date === today) || [];
    const finalizedToday = todaysAppointments.filter(appt => appt.status === "finalizata");

    const uniqueNewPatients = new Set(
      (dashboardData?.appointments || [])
        .filter(appt => {
          const apptDate = new Date(appt.date);
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          return apptDate > oneMonthAgo;
        })
        .map(appt => appt.patientID)
    );
    
    const feedbacks = (dashboardData?.appointments || []).flatMap(appt =>
      Array.isArray(appt.feedbacks)
        ? appt.feedbacks.map(feedback => ({
            ...feedback,
            patientName: appt.patientName
          }))
        : []
    );


    const currentMonthPatients = uniqueNewPatients.size;

    const previousMonthPatients = dashboardData?.patientsLastMonthCount || 0; // <- dacă o preiei din backend
    const patientDiff = currentMonthPatients - previousMonthPatients;

    const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const yesterdaysAppointments = (dashboardData?.appointments || []).filter(
        appt => appt.date === yesterdayStr && appt.status !== "anulata"
      );

      const difference = todaysAppointments.length - yesterdaysAppointments.length;

    // ----------------- Calendar -----------------
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [weekDays, setWeekDays] = useState([]);

    useEffect(() => {
      const startOfWeek = new Date();
      const day = startOfWeek.getDay(); 
      const diffToMonday = day === 0 ? -6 : 1 - day;
      const monday = new Date(startOfWeek.setDate(startOfWeek.getDate() + diffToMonday));

      const week = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(d.getDate() + i);
        return d;
      });

      setWeekDays(week);
    }, []);


    const dailyAppointments = (dashboardData?.appointments || []).filter(
      appt => appt.date === selectedDate.toISOString().split("T")[0]
    );



  return (
    <div>
      {loading ? (
        <div>
           {loading && <Loader message={loadingMessage} />}
        </div>
         ) : !dashboardData || !dashboardData.doctor || !dashboardData.appointments ? (
          
         <div className="px-6 py-3 bg-white rounded-xl shadow-md px-6 py-4 mb-10 mt-4 text-center text-gray-500 italic md:font-semibold font-medium">    
            Nu s-au putut încărca datele medicului.
          </div>
      ) : (
        <>
        <div className="px-6 py-3">

          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-400 rounded-lg shadow-lg p-4 md:p-6 mb-8 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  Bine ați revenit, Dr. {dashboardData.doctor.lastName} {dashboardData.doctor.firstName}
                </h2>
                <p className="text-purple-100 font-semibold">
                  {getCurrentDateFormatted()} • {getCurrentTimeFormatted()}
                </p>
              </div>
               <div className="bg-white/10 rounded-lg p-4 text-center font-semibold">
                <p className="text-sm ">Programări astăzi</p>
                <p className="text-3xl font-bold">{appointmentsToday.length}</p>
              </div>
            </div>
          </div>

          {/* Info generale rapide */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
             {/* programari astazi */}
              <div className="bg-white rounded-lg shadow p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-md text-gray-600 text">Programări astăzi</p>
                    <p className="text-2xl font-bold text-gray-800">{todaysAppointments.length}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <FontAwesomeIcon icon={faCalendarCheck}  className="text-xl text-purple-800"/>
                  </div>
                </div>

                <div className={`mt-2 font-semibold text-sm ${difference > 0 ? "text-green-600" : difference < 0 ? "text-red-600" : "text-gray-500"}`}>
                  {difference > 0 && (
                    <>
                      <FontAwesomeIcon icon={faArrowUp} />
                      <span>+ {difference} față de ieri</span>
                    </>
                  )}

                  {difference < 0 && (
                    <>
                      <FontAwesomeIcon icon={faArrowDown} />
                      <span>- {difference} față de ieri</span>
                    </>
                  )}
                  {difference === 0 && (
                    <>
                      <FontAwesomeIcon icon={faMinus} />
                      <span> La fel ca ieri</span>
                    </>
                  )}
                </div>
              </div>

              {/* Pacienti noi */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-md text-gray-600">Pacienți noi luna aceasta</p>
                    <p className="text-2xl font-bold text-gray-800">{currentMonthPatients}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FontAwesomeIcon icon={faUserPlus} className="text-xl text-purple-800"/>
                  </div>
                </div>

                <div
                  className={`mt-2 text-sm font-semibold ${
                    patientDiff > 0
                      ? "text-green-600"
                      : patientDiff < 0
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {patientDiff > 0 && (
                    <>
                      <FontAwesomeIcon icon={faArrowUp} />
                      <i className="fas fa-arrow-up mr-1"></i>
                      <span>+ {patientDiff} față de luna trecută</span>
                    </>
                  )}
                  {patientDiff < 0 && (
                    <>
                      <FontAwesomeIcon icon={faArrowDown} />
                      <span>- {patientDiff} față de luna trecută</span>
                    </>
                  )}
                  {patientDiff === 0 && (
                    <>
                      <FontAwesomeIcon icon={faMinus} />
                      <span>La fel ca luna trecută</span>
                    </>
                  )}
                </div>
              </div>

              {/* Feedback-uri noi */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-md text-gray-600">Feedback-uri</p>
                    <p className="text-2xl font-bold text-gray-800">{feedbacks.length}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <FontAwesomeIcon icon={faStar} className="text-xl text-yellow-800" />
                  </div>
                </div>
                <div className="mt-4 text-sm">
                  <span className="text-yellow-500">{dashboardData.doctor.rating}</span>
                  <span className="text-gray-500"> scor mediu</span>
                </div>
              </div>

              {/* Programari */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-md text-gray-600">Consultații finalizate azi</p>
                    <p className="text-2xl font-bold text-gray-800">{finalizedToday.length}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-xl text-green-600" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  <span>Din {todaysAppointments.length} programate</span>
                </div>
              </div>
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">

              {/* Calendar */}
              <DoctorScheduleCalendar appointments={dashboardData.appointments} />
              
              {/* Activity Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Grafic de Activitate
                </h3>
                <div className="bg-white rounded-lg shadow p-6">
                  <DoctorActivityChart appointments={dashboardData.appointments} />
                </div>
              </div>
            </div>


            {/* Right Column */}
            <div className="space-y-8">
              {/* Feedback-uri Recente */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Feedback-uri Recente</h3>
                  <button
                    onClick={() => navigate(`/profil-medic/${doctorID}/feedback`)}
                    className="text-purple-600 text-sm cursor-pointer hover:underline"
                  >
                    <FontAwesomeIcon icon={faEye} className="mr-1" />
                    Vezi toate
                  </button>

                </div>
                <div className="p-4 space-y-4">
                  {(feedbacks && feedbacks.length > 0) ? (
                    feedbacks
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .slice(0, 5)
                      .map((feedback, index) => (
                        <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">{renderStars(feedback.rating)}</div>
                            <span className="text-sm text-gray-500">
                              {new Date(feedback.createdAt).toLocaleDateString("ro-RO", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-2">"{feedback.comment}"</p>
                          <p className="text-sm text-gray-500">- {feedback.patientName}</p>
                        </div>
                      ))
                  ) : (
                    <div className="text-gray-500 font-semibold italic text-center">
                      Nu există feedback-uri disponibile momentan.
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
        </> 
        )}
        
    </div>
  )
}

export default DoctorDashboard