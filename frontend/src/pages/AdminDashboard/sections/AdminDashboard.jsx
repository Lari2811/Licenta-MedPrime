import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faArrowDown, faArrowUp, faBell, faFolderOpen, faBriefcase,  faClock,  faClockRotateLeft,  faCommentDots,  faEnvelopeOpenText,  faEye,  faEyeSlash,  faHospital, faLock, faMagnifyingGlass, faMapMarkerAlt, faPaperPlane, faPenToSquare, faStar, faStethoscope,  faTools,  faUserDoctor, faHashtag, faClockFour, faUser, faUserCircle, faHeartbeat, faNotesMedical, faCalendarCheck, faUserPlus, faMinus, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

import { AppContext } from "../../../context/AppContex";

import Loader from "../../../components/Loader";
import socket from "../../../socket";

import { useCheckAdminAccess } from '../../../accessControl/useCheckAdminAccess';
import { formatStatus } from "../../../utils/formatStatus";
import { formatAppointmentStatus } from "../../../utils/formatAppointmentStatus";
import { formatLocationStatus } from "../../../utils/formatStatusLocation";
import { formatStatusDoctor } from "../../../utils/formatStatusDoctor";

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

const StatCard = ({ title, icon, count, percentage, label, children }) => (
  <div className="bg-white shadow rounded-lg p-4 w-full">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium">{title} noi</h3>
      <div className="text-xl">{icon}</div>
    </div>
    <p className="text-3xl font-bold mt-2">{count}</p>
    <p className="text-sm text-green-600 mt-1">
      +{percentage}% {label}
    </p>

    {/* Detalii extra */}
    {children && <div className="mt-4 border-t pt-3">{children}</div>}
  </div>
);

const countAppointmentsByStatus = (appointments) => {
  const statusMap = {};

  appointments.forEach((app) => {
    const status = app.status || "Necunoscut";
    statusMap[status] = (statusMap[status] || 0) + 1;
  });

  return statusMap;
};


const views = [
  { key: "zi", label: "Zi" },
  { key: "saptamana", label: "Săptămână" },
  { key: "luna", label: "Lună" },
  { key: "an", label: "Anul acesta" } 
];


const AdminDashboard = () => {
  
   useCheckAdminAccess();

    const { backendUrl } = useContext(AppContext);
       
    const { adminID } = useParams();
        
    const navigate = useNavigate();
  
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
  
    const [dashboardData, setDashboardData] = useState(null)

    const fetchDashboardData = async () => {
    
      try {
        setLoading(true);
        setLoadingMessage("Se încarcă datele medicului...");

        const res = await axios.post(`${backendUrl}/api/admin/get-admin-dashboard-data`, {
          adminID: adminID,
        });
        if (res.status === 200) {
          setDashboardData(res.data.data);
          console.log("Date:", res.data.data)
          const data = res.data.data;
          
        }
        
      } catch (err) {
        console.error("Eroare la fetch medic:", err);
        toast.error("Nu s-au putut prelua datelor administratorului.");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
        if (!adminID) return; 

        fetchDashboardData();
    }, [adminID]);

    const [selectedView, setSelectedView] = useState("luna"); 

     const calcPercentageChange = (current, previous) => {
      if (previous === 0) return current === 0 ? 0 : 100;
      return Math.round(((current - previous) / previous) * 100);
    };

const filterByPeriod = (items, period) => {
  const now = new Date();
  let start, prevStart;

  if (period === "zi") {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    prevStart = new Date(start);
    prevStart.setDate(prevStart.getDate() - 1);
  } else if (period === "saptamana") {
    const day = now.getDay() || 7;
    start = new Date(now);
    start.setDate(now.getDate() - (day - 1));
    prevStart = new Date(start);
    prevStart.setDate(prevStart.getDate() - 7);
  } else if (period === "luna") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    prevStart = new Date(start);
    prevStart.setMonth(prevStart.getMonth() - 1);
  } else if (period === "an") {
    start = new Date(now.getFullYear(), 0, 1);
    prevStart = new Date(start);
    prevStart.setFullYear(prevStart.getFullYear() - 1);
  }

  const currentItems = items.filter((item) => new Date(item.createdAt) >= start);
  const previousItems = items.filter((item) => {
    const created = new Date(item.createdAt);
    return created >= prevStart && created < start;
  });

  return {
    current: currentItems.length,
    previous: previousItems.length,
    percentage: calcPercentageChange(currentItems.length, previousItems.length),
    list: currentItems 
  };
};


  const periodLabel = {
    zi: "față de ieri",
    saptamana: "față de săptămâna trecută",
    luna: "față de luna trecută",
    an: "față de anul trecut" 
  };

  const getTopInvestigations = (appointments) => {
  if (!appointments) return [];

  const countMap = {};

  appointments.forEach((app) => {
    const inv = app.investigationName;
    if (inv) {
      countMap[inv] = (countMap[inv] || 0) + 1;
    }
  });

  const total = Object.values(countMap).reduce((sum, val) => sum + val, 0);

  return Object.entries(countMap)
    .map(([name, count]) => ({
      name,
      percent: total ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.percent - a.percent);
};


const medici = dashboardData ? filterByPeriod(dashboardData.doctors, selectedView) : { current: 0, previous: 0, percentage: 0, list: [] };
const pacienti = dashboardData ? filterByPeriod(dashboardData.patients, selectedView) : { current: 0, previous: 0, percentage: 0, list: [] };
const programari = dashboardData ? filterByPeriod(dashboardData.appointments, selectedView) : { current: 0, previous: 0, percentage: 0, list: [] };
const locatii = dashboardData ? filterByPeriod(dashboardData.locations, selectedView) : { current: 0, previous: 0, percentage: 0, list: [] };
const specialitati = dashboardData ? filterByPeriod(dashboardData.specialities, selectedView) : { current: 0, previous: 0, percentage: 0, list: [] };
const investigatii = dashboardData ? filterByPeriod(dashboardData.investigations, selectedView) : { current: 0, previous: 0, percentage: 0, list: [] };

  return (
    <div>
      {loading ? (
        <div>
           {loading && <Loader message={loadingMessage} />}
        </div>
         ) : !dashboardData ? (
          
         <div className="px-6 py-3 bg-white rounded-xl shadow-md px-6 py-4 mb-10 mt-4 text-center text-gray-500 italic md:font-semibold font-medium">    
            Nu s-au putut încărca datele administratorului.
          </div>
      ) : (
        <>
        <div className="">

          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-400 rounded-lg shadow-lg p-4 md:p-6 mb-8 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  Bine ați revenit, {dashboardData.admin.lastName} {dashboardData.admin.firstName}
                </h2>
                <p className="text-purple-100 font-semibold">
                  {getCurrentDateFormatted()} • {getCurrentTimeFormatted()}
                </p>
              </div>
              
            </div>
          </div>

          <div>
            {/* View */}
            <div className="flex justify-end mb-6">
              <div className="flex gap-2 bg-white p-2 rounded-xl shadow-md">
                {views.map((view) => (
                  <button
                    key={view.key}
                    onClick={() => setSelectedView(view.key)}
                    className={`px-4 py-1 rounded-md text-sm cursor-pointer font-semibold ${
                      selectedView === view.key
                        ? "bg-purple-100 text-purple-700"
                        : "text-gray-700"
                    }`}
                  > 
                  {view.label}
                  </button>
              ))}
              </div>
           </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Medici"
            count={medici.current}
            percentage={medici.percentage}
            label={periodLabel[selectedView]}
            icon={
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-700">
                <FontAwesomeIcon icon={faUserDoctor} className="text-lg" />
              </div>
            }
          >
            {medici.list.slice(0, 10).map((doc) => {
              const statusObj = formatStatusDoctor(doc.status);
              const rating = doc.rating || 0; 

          return (
            <div
              key={doc.doctorID}
              className="grid grid-cols-3 text-sm text-gray-700 items-center py-1"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{doc.firstName} {doc.lastName}</span>
              </div>

              <div className="flex items-center gap-1 text-gray-500 text-xs">
                <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                <span>({rating.toFixed(1)})</span>
              </div>

              <div className={`text-right ${statusObj.color} font-medium`}>
                {statusObj.label}
              </div>
            </div>
          );

            })}

            {medici.list.length > 10 && (
              <div className="text-sm text-gray-500 italic mt-1">
                +{medici.list.length - 10} altele
              </div>
            )}
          </StatCard>


          <StatCard
            title="Pacienți"
            count={pacienti.current}
            percentage={pacienti.percentage}
            label={periodLabel[selectedView]}
            icon={
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100 text-green-700">
                <FontAwesomeIcon icon={faUser} className="text-lg" />
              </div>
            }
          >
            {pacienti.list.slice(0, 10).map((pac) => {
              const statusObj = formatStatus(pac.status); 

              return (
                <div
                  key={pac.patientID}
                  className="grid grid-cols-2 text-sm text-gray-700 items-center py-1 font-medium"
                >
                  <span className="font-medium">
                    {pac.lastName} {pac.firstName}
                  </span>

                  <span className={`flex items-center gap-1 justify-end  ${statusObj.color}`}>
                    <FontAwesomeIcon icon={statusObj.icon} className="text-sm" />
                    <span className="text-sm">{statusObj.label}</span>
                  </span>
                </div>
              );
            })}

            {pacienti.list.length > 10 && (
              <div className="text-sm text-gray-500 italic mt-1">
                +{pacienti.list.length - 10} altele
              </div>
            )}
          </StatCard>



          <StatCard
            title="Programări"
            count={programari.current}
            percentage={programari.percentage}
            label={periodLabel[selectedView]}
            icon={
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-yellow-100 text-yellow-700">
                <FontAwesomeIcon icon={faCalendarCheck} className="text-lg" />
              </div>
            }
          >
            {Object.entries(countAppointmentsByStatus(programari.list)).map(([statusRaw, count]) => {
              const status = formatAppointmentStatus(statusRaw);
              return (
                <div key={statusRaw} className="flex justify-between text-sm py-1 font-medium text-gray-700 items-center">
                  <span className={`flex items-center gap-1 ${status.color}`}>
                    <FontAwesomeIcon icon={status.icon} />
                    {status.label}
                  </span>
                  <span className="font-semibold">{count}</span>
                </div>
              );
            })}
          </StatCard>


          <StatCard
            title="Locații"
            count={locatii.current}
            percentage={locatii.percentage}
            label={periodLabel[selectedView]}
            icon={
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100 text-red-700">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-lg" />
              </div>
            }
          >
          {locatii.list.slice(0, 10).map((loc) => {
            const status = formatLocationStatus(loc.status);
            return (
              <div key={loc.locationID} className="flex justify-between text-sm py-1 font-medium text-gray-700 items-center">
                <span>{loc.clinicName}</span>
                <span className={`flex items-center gap-1 ${status.color}`}>
                  {status.label}
                  <FontAwesomeIcon icon={status.icon} />
                </span>
              </div>
            );
          })}

          {locatii.list.length > 10 && (
            <div className="text-sm text-gray-500 italic mt-1">
              +{locatii.list.length - 10} altele
            </div>
          )}


            
          </StatCard>

            <StatCard
              title="Specialități"
              count={specialitati.current}
              percentage={specialitati.percentage}
              label={periodLabel[selectedView]}
              icon={
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100 text-purple-700">
                  <FontAwesomeIcon icon={faStethoscope} className="text-lg" />
                </div>
              }
            >
              {specialitati.list.map((spec) => (
                <div key={spec.specialityID} className="text-sm py-1 font-medium text-gray-700">
                  {spec.name}
                </div>
              ))}
            </StatCard>

            <StatCard
              title="Investigații"
              count={investigatii.current}
              percentage={investigatii.percentage}
              label={periodLabel[selectedView]}
              icon={
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-700">
                  <FontAwesomeIcon icon={faNotesMedical} className="text-lg" />
                </div>
              }
            >
          {investigatii.list.slice(0, 10).map((inv) => (
              <div key={inv.investigationID} className="text-sm py-1 font-medium text-gray-700">
                {inv.name}
              </div>
            ))}

            {investigatii.list.length > 10 && (
              <div className="text-sm text-gray-500 italic mt-1">
                +{investigatii.list.length - 10} altele
              </div>
            )}
            </StatCard>
          </div>
    
          </div>

          

          </div>

          </> 
        )}
        </div>
  )
}

export default AdminDashboard