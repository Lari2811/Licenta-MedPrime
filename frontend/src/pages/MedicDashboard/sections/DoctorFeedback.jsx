import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faArrowDown, faArrowUp, faBell, faBriefcase,  faClock,  faClockRotateLeft,  faCommentDots,  faEnvelopeOpenText,  faEye,  faEyeSlash,  faHospital, faLock, faMagnifyingGlass, faMapMarkerAlt, faPaperPlane, faPenToSquare, faStar, faStethoscope,  faTools,  faUserDoctor } from "@fortawesome/free-solid-svg-icons";

import { AppContext } from "../../../context/AppContex";
import { useCheckDoctorAccess } from '../../../accessControl/useCheckDoctorAccess '

import CustomSelect from "../../../components/customSelect";
import DisplayRequestsTable from "../Request/DisplayRequestsTable";
import Loader from "../../../components/Loader";

import socket from "../../../socket";
import FeedbackCard from "../Feedback/FeedbackCard";

const DoctorFeedback = () => {

  useCheckDoctorAccess();

  const { backendUrl } = useContext(AppContext);
  
  const { doctorID } = useParams();

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [feedbackData, setFeedbackData] = useState([]);
  
  const fetchFeedbacks = async () => {
    
    try {
      setLoading(true);
      setLoadingMessage("Se încarcă feedback-urile medicului...");
      const res = await axios.post(`${backendUrl}/api/doctor/get-feedback-by-id`, {
        doctorID: doctorID,
      });
      if (res.status === 200) {
        setFeedbackData(res.data.data);
        console.log("Feedback-uri: ", res.data.data)
      }
    } catch (err) {
      console.error("Eroare la fetch feedback-uri:", err);
      toast.error("Nu s-au putut prelua feedback-urile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      if (!doctorID) return; 

      fetchFeedbacks();

      socket.on('FEEDBACK_ADDED', ({ doctorID }) => {
        if (doctorID === doctorID) {
          toast.info('Ai primit un nou feedback!');
          fetchFeedbacks();
        } 
      });

      return () => {
        socket.off('FEEDBACK_ADDED');
      };
  }, [doctorID]);

  //Filtre ==============================
  const [searchTerm, setSearchTerm ] = useState("")
  const [periodOption, setPeriodOption] = useState("");
  const [ratingOption, setRatingOption] = useState("");
  const [sortOption, setSortOption] = useState("");
  
    
  const periodOptions = [
      { value: "", label: "Toate perioadele" },
      { value: "ultima_saptamana", label: (<> <span> Ultima săptămână </span> <FontAwesomeIcon icon={faClockRotateLeft} className="ml-1 " /></>) },
      { value: "ultima_luna", label: (<> <span> Ultima lună </span> <FontAwesomeIcon icon={faClockRotateLeft} className="ml-1 " /></>) },
  ];
    
  const ratingOptions = [
    { value: "", label: "Toate rating-urile" },
    ...[1, 2, 3, 4, 5].map(num => ({
      value: `${num}_stele`,
      label: (
        <>
          {Array.from({ length: num }).map((_, i) => (
            <FontAwesomeIcon key={i} icon={faStar} className="mr-1 text-yellow-500" />
          ))}
        </>
      ),
    })),
  ];

  const sortOptions = [
      { value: "", label: "Fără sortare" },
      { value: "rating_cresc", label: (<> <FontAwesomeIcon icon={faArrowUp} className="mr-1" /> <span> Rating </span>  <FontAwesomeIcon icon={faStar} className="ml-1 text-yellow-500" /> </>) },
      { value: "rating_desc", label: (<> <FontAwesomeIcon icon={faArrowDown} className="mr-1"/> <span> Rating </span> <FontAwesomeIcon icon={faStar} className="ml-1 text-yellow-500" /></>) },
      { value: "period_cresc", label: (<> <FontAwesomeIcon icon={faArrowUp} className="mr-1"/> <span> Perioadă </span> <FontAwesomeIcon icon={faClockRotateLeft} className="ml-1 " /></>) },
      { value: "period_desc", label: (<> <FontAwesomeIcon icon={faArrowDown} className="mr-1"/> <span> Perioadă </span> <FontAwesomeIcon icon={faClockRotateLeft} className="ml-1 " /></>) },
  ];

  const filteredFeedbacks = feedbackData
    .filter((fb) => {
      const searchText = searchTerm.trim().toLowerCase();

      const matchesSearch =
        searchText === "" ||
        (typeof fb.comment === "string" && fb.comment.toLowerCase().includes(searchText)) ||
        (typeof fb.patientInfo?.name === "string" && fb.patientInfo.name.toLowerCase().includes(searchText)) ||
        (typeof fb.investigationName === "string" && fb.investigationName.toLowerCase().includes(searchText)) ||
        (typeof fb.appointmentInfo?.type === "string" && fb.appointmentInfo.type.toLowerCase().includes(searchText)) ||
        (typeof fb.appointmentInfo?.startTime === "string" && fb.appointmentInfo.startTime.toLowerCase().includes(searchText)) ||
        (typeof fb.appointmentInfo?.endTime === "string" && fb.appointmentInfo.endTime.toLowerCase().includes(searchText)) ||
        (typeof fb.appointmentInfo?.date === "string" &&
          new Date(fb.appointmentInfo.date)
            .toLocaleDateString("ro-RO", { day: "2-digit", month: "2-digit", year: "numeric" })
            .toLowerCase()
            .includes(searchText));


      const matchesPeriod =
        periodOption === null || periodOption === "" ||
        (periodOption === "ultima_saptamana" &&
          new Date(fb.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
        (periodOption === "ultima_luna" &&
          new Date(fb.createdAt) >= new Date(new Date().setMonth(new Date().getMonth() - 1)));

      const matchesRating =
        ratingOption === null || ratingOption === "" || 
        fb.rating === parseInt(ratingOption.split("_")[0]);

      return matchesSearch && matchesPeriod && matchesRating;
    })
    .sort((a, b) => {
      if (!sortOption) return 0;

      if (sortOption === "rating_cresc") {
        return a.rating - b.rating;
      } else if (sortOption === "rating_desc") {
        return b.rating - a.rating;
      } else if (sortOption === "period_cresc") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortOption === "period_desc") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }

      return 0;
    });
  

  return (
    <div>
      {/* Intro */}
      <div className="flex flex-col items-center sm:flex-row sm:justify-between sm:items-center border-b-1 border-gray-200 p-3">
          <div className="flex flex-col items-center sm:flex-row sm:items-center gap-2 sm:gap-3">
              {/* Icon */}
              <FontAwesomeIcon
              icon={faCommentDots} 
              className="text-purple-600 md:text-3xl text-3xl sm:mb-0 ml-5"
              />
              {/* Text */}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center sm:text-left">
              Feedback
              <p className="text-gray-600 text-sm font-semibold">
                  Vizualizează recenziile primite de la pacienți.
              </p>
              </h2>
          </div>
      </div>

      {loading ? (
        <div>
           {loading && <Loader message={loadingMessage} />}
        </div>
      ) : (
        <>
        <div className="px-6 py-3">
            <div className="bg-white rounded-xl shadow-md px-6 py-4 mb-10 mt-4">    
            
              {/* Filtre */}
              <div>
                  <div className="flex items-center gap-2 mb-4">
                      <FontAwesomeIcon icon={faMagnifyingGlass} className="text-purple-700" />
                      <h2 className="text-base sm:text-lg md:text-lg font-medium text-gray-800">Filtrează recenziile</h2>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-4 items-center">
                    
                      <div className="relative w-full">
                        <input
                          type="text"
                          placeholder="Caută..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="border border-gray-700 p-2.5 rounded w-full text-sm pl-10"
                          
                        />
                          <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                          />
                        </div>

                      <div className="w-full ">
                          <CustomSelect
                          options={periodOptions}
                          value={periodOption}
                          onChange={setPeriodOption}
                          placeholder="Filtrează după perioadă..."
                          />
                      </div>

                      <div className="w-full ">
                          <CustomSelect
                          options={ratingOptions}
                          value={ratingOption}
                          onChange={setRatingOption}
                          placeholder="Filtrează după rating..."
                          />
                      </div>

                      <div className="w-full ">
                          <CustomSelect
                          options={sortOptions}
                          value={sortOption}
                          onChange={setSortOption}
                          placeholder="Sortează..."
                          />
                      </div>

                      {/* Resetare */}
                      <button
                      onClick={() => {
                          setSearchTerm("");
                          setPeriodOption(null);
                          setRatingOption(null);
                          setSortOption(null);
                          }}
                      className="bg-purple-100 hover:bg-purple-200 text-gray-700 border border-gray-300 px-4 py-2 rounded text-sm w-full lg:w-auto"
                      >
                      Resetează
                      </button>
                  </div>
                  
              </div>

              
                <div className="flex items-center justify-center relative my-2 mt-7 mb-7">
                    <div className="flex-grow border-t border-gray-300 mr-3"></div>
                    <span className="text-gray-700 md:text-base text-sm font-medium whitespace-nowrap">
                    Numărul recenziilor: <strong>{filteredFeedbacks.length}</strong>
                    </span>
                    <div className="flex-grow border-t border-gray-300 ml-3"></div>
                </div>

              {filteredFeedbacks.length === 0 ? (
                <div className=" mt-5 mb-2 text-center font-semibold  text-gray-500 italic">
                  Nu există recenzii care corespund filtrului aplicat.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  {filteredFeedbacks.map((fb) => (
                    <FeedbackCard key={fb._id} feedback={fb} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
        )}
    </div>
  )
}

export default DoctorFeedback