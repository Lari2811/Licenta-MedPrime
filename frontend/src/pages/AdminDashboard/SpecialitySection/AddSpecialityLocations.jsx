import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AppContext } from '../../../context/AppContex';
import { useParams } from 'react-router-dom';
import Loader from '../../../components/Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faCircleCheck, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { getStatusLabel } from '../../../utils/getStatusLabel';

const AddSpecialityLocations = ({ onClose, onCloseFinish, specialityData }) => {
  const { backendUrl } = useContext(AppContext);
  const { adminID } = useParams();

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [locationsData, setLocationsData] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [errors, setErrors] = useState({});

      const [noLocations, setNoLocations] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const [locRes, specLocRes] = await Promise.all([
          axios.get(`${backendUrl}/api/admin/get-all-locations`),
          axios.get(`${backendUrl}/api/admin/get-all-speciality-locations`),
        ]);

        const locations = locRes.data.locations;
        const specLocs = specLocRes.data.data;

        const locatiiPreluate = locations
         .filter(loc => loc.status !== 'inchis definitiv')
        .map(loc => {
          const foundSpecLoc = specLocs.find(sl => sl.locationID === loc.locationID && sl.specialityID === specialityData.specialityID);
          return {
            locationID: loc.locationID,
            locationCounty: loc.address.county,
            locationClinicName: loc.clinicName,
            locationStatus: loc.status,
            locationReopenDate: loc.reopenDate,
            isLocationActive: loc.isLocationActive,
            isSpecialityActive: foundSpecLoc ? foundSpecLoc.isSpecialityActive : false,  
          };
        }).sort((a, b) => a.locationCounty.localeCompare(b.locationCounty));

        setLocationsData(locations);
        setSelectedLocations(locatiiPreluate);

        if (locatiiPreluate.length === 0) {
                setNoLocations(true);
            }


      } catch (err) {
        console.error("Eroare la aducerea datelor:", err);
        toast.error("Eroare la încărcarea datelor.");
      }
    };

    fetchLocations();
  }, [backendUrl, specialityData.specialityID]);

  const handleToggleActive = (locationID) => {
    const updated = selectedLocations.map(loc => {
      if (loc.locationID === locationID) {
        if (loc.locationStatus !== 'deschis') {
          toast.warn('Această locație este închisă temporar și nu poate fi activată.');
          return loc;
        }
        return { ...loc, isSpecialityActive: !loc.isSpecialityActive };
      }
      return loc;
    });
    setSelectedLocations(updated);
  };


  const handleSave = async () => {
   

    try {
      setLoading(true);
      setLoadingMessage("Se salvează locațiile...");

      console.log("Selected loc:", selectedLocations)

      const response = await axios.post(`${backendUrl}/api/admin/add-speciality-locations`, {
        adminID,
        specialityID: specialityData.specialityID,
        specialityName: specialityData.specialityName,
        selectedLocations,
      });

      toast.success(response.data.message || "Locațiile au fost salvate cu succes!");
      onCloseFinish();
    } catch (error) {
      console.error("Eroare la salvare:", error);
      toast.error(error.response?.data?.message || "Eroare la salvare!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-y">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-4xl max-h-[90%] overflow-y-auto">
        <div className="w-18 h-1 bg-green-600 rounded-full mx-auto mb-4"></div>
        <p className="text-2xl font-semibold text-gray-800 text-center">
          Asociază Locații pentru Specialitatea
        </p>
        <p className="text-xl font-semibold text-gray-700 text-center mb-3">
          ~ {specialityData.specialityName} - {specialityData.specialityID} ~
        </p>



        {noLocations ? (
            <div>
                <p className="text-xl italic font-semibold text-gray-700 mb-3 text-center mt-7">
                    Nu există locații disponibile momentan!
                </p>
                <div className="flex justify-center mt-">
                    <button
                        onClick={onCloseFinish}
                        className="btn-outline-green-little-little"
                    >
                        <FontAwesomeIcon icon={faCircleCheck} />
                        Finalizare
                    </button>
                </div>

            </div>
        ) : (
            <>
            <div>
                <p className="text-sm text-gray-600 italic mb-4 text-center">
                Activează sau dezactivează disponibilitatea acestei specialități în fiecare locație.
                </p>

                {/* Legenda culori */}
                <div className="flex flex-wrap justify-center gap-4 items-center text-sm text-gray-600 font-medium mb-4">

                <div className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                    Investigație activă
                </div>
                <div className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
                    Investigație inactivă
                </div>
                <div className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-gray-400"></span>
                    Locație închisă sau specialitate inactivă
                </div>
                </div>

                <div className="flex flex-col gap-3 border-t pt-4">
                {selectedLocations.map(loc => (
                    <div key={loc.locationID}
                    className={`flex justify-between items-center p-4 rounded-lg shadow-sm border-l-4 transition-transform hover:shadow-md hover:scale-[1.02]
                    ${loc.locationStatus !== 'deschis'
                        ? 'bg-gray-50 border-gray-500'
                        : loc.isSpecialityActive
                        ? 'bg-green-50 border-green-500'
                        : 'bg-red-100 border-red-300'}`}>
                    <div className="flex flex-col">
                        <span className="font-semibold text-md text-gray-800">{loc.locationCounty} - {loc.locationID}</span>
                        <span className="text-sm text-gray-700">{loc.locationClinicName}</span>
                        <span className="text-sm italic text-gray-600">
                        Locație:
                        <span className={`ml-1 font-semibold ${loc.locationStatus === 'deschis' ? 'text-green-700' : 'text-red-700'}`}>
                            {getStatusLabel(loc.locationStatus)}
                            {loc.locationReopenDate ? ` (Redeschidere: ${new Date(loc.locationReopenDate).toLocaleDateString('ro-RO')})` : ''}
                        </span>
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-800">
                        <input
                            type="checkbox"
                            checked={loc.isSpecialityActive}
                            disabled={loc.locationStatus !== 'deschis'}
                            onChange={() => handleToggleActive(loc.locationID)}
                            className="h-5 w-5 accent-green-600"
                        />
                        Activ
                        </label>
                    </div>
                    </div>
                ))}
                </div>

                <div className="flex justify-center gap-3 mt-5 border-t pt-4">
                <button onClick={handleSave} className="btn-outline-green-little-little">
                    <FontAwesomeIcon icon={faCheckCircle} /> Salvează
                </button>
                </div>
            </div>
            </>
        )
    }

        {loading && <Loader message={loadingMessage} />}
      </div>
    </div>
  );
};

export default AddSpecialityLocations;
