import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../../../context/AppContex';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loader from '../../../components/Loader';
import CustomSelect from '../../../components/customSelect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCheckCircle, faTimesCircle, faChevronUp, faChevronDown, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { getStatusLabel } from '../../../utils/getStatusLabel';

const AddInvestigationSpecialityAndLocations = ({ onClose, onCloseFinish, investigationData, onCloseSave }) => {
  const { backendUrl } = useContext(AppContext);
  const { adminID } = useParams();

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [expandedSpecialities, setExpandedSpecialities] = useState({});

  const [selectedSpecialities, setSelectedSpecialities] = useState([]);
  const [selectedSpeciality, setSelectedSpeciality] = useState('');

  const [specialitiesData, setSpecialitiesData] = useState([]);
  const [locationsData, setLocationsData] = useState([]);
  const [specialityLocationsData, setSpecialityLocationsData] = useState([]);
  
  const [noSpecialitiesAvailable, setNoSpecialitiesAvailable] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setLoadingMessage("Se încarcă datele...");

        const [specRes, locRes, specLocRes] = await Promise.all([
          axios.get(`${backendUrl}/api/admin/get-all-specialities`),
          axios.get(`${backendUrl}/api/admin/get-all-locations`),
          axios.get(`${backendUrl}/api/admin/get-all-speciality-locations`)
        ]);

        setSpecialitiesData(specRes.data.data);
        setLocationsData(locRes.data.locations);
        setSpecialityLocationsData(specLocRes.data.data);

        if (!specRes.data.data || specRes.data.data.length === 0) {
          setNoSpecialitiesAvailable(true);
        }

      } catch (err) {
        console.error(err);
        toast.error("Eroare la încărcarea datelor!");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const handleAddSpeciality = () => {
    if (!selectedSpeciality) {
      toast.error("Selectează o specialitate!");
      return;
    }

    const specObj = specialitiesData.find(s => s.specialityID === selectedSpeciality);
    if (!specObj) {
      toast.error("Specialitatea nu există!");
      return;
    }

    const specLocations = locationsData
      .filter(loc => loc.status !== 'inchis definitiv')
      .map(loc => {
        const activeSpecLoc = specialityLocationsData.find(
          sl => sl.specialityID === selectedSpeciality && sl.locationID === loc.locationID
        );

        return {
          locationID: loc.locationID,
          locationCounty: loc.address.county,
          locationClinicName: loc.clinicName,
          locationStatus: loc.status,
          isLocationActive: loc.isLocationActive,
          locationReopenDate: loc.reopenDate,
          isSpecialityActive: activeSpecLoc ? activeSpecLoc.isSpecialityActive : false,
          isInvestigationActive: false,
          price: 200
        };
      }).sort((a, b) => a.locationCounty.localeCompare(b.locationCounty));

    setSelectedSpecialities(prev => [...prev, {
      specialityID: specObj.specialityID,
      specialityName: specObj.name,
      locations: specLocations
    }]);

    setSelectedSpeciality('');
  };

  const handleRemoveSpeciality = (specialityID) => {
    setSelectedSpecialities(prev => prev.filter(spec => spec.specialityID !== specialityID));
  };

  const handleUpdateLocation = (specialityID, locationID, field, value) => {
    setSelectedSpecialities(prev =>
      prev.map(spec => {
        if (spec.specialityID === specialityID) {
          const updatedLocations = spec.locations.map(loc => {
            if (loc.locationID === locationID) {
              let newValue = value;
              if (field === 'price') {
                newValue = Math.max(0, Number(value));
                if (value < 0) toast.warn('Prețul nu poate fi negativ!');
              }
              return { ...loc, [field]: newValue };
            }
            return loc;
          });
          return { ...spec, locations: updatedLocations };
        }
        return spec;
      })
    );
  };

  const handleActivateAllLocations = (specialityID) => {
  setSelectedSpecialities(prev =>
    prev.map(spec => {
      if (spec.specialityID === specialityID) {
        const updatedLocations = spec.locations.map(loc => {
          if (loc.isLocationActive && loc.locationStatus === 'deschis' && loc.isSpecialityActive) {
            return { ...loc, isInvestigationActive: true };
          }
          return loc;
        });
        return { ...spec, locations: updatedLocations };
      }
      return spec;
    })
  );
};

const handleDeactivateAllLocations = (specialityID) => {
  setSelectedSpecialities(prev =>
    prev.map(spec => {
      if (spec.specialityID === specialityID) {
        const updatedLocations = spec.locations.map(loc => ({
          ...loc,
          isInvestigationActive: false
        }));
        return { ...spec, locations: updatedLocations };
      }
      return spec;
    })
  );
  //toast.info('Toate locațiile au fost dezactivate pentru această specialitate.');
};


  const handleSaveInvestigationAvailability = async () => {
    if (selectedSpecialities.length === 0) {
      toast.error("Selectează cel puțin o specialitate pentru investigație!");
      return;
    }

    const finalPayload = {
      investigationID: investigationData?.investigationID,
      specialities: selectedSpecialities.map(spec => ({
        specialityID: spec.specialityID,
        locations: spec.locations.map(loc => ({
          locationID: loc.locationID,
          isInvestigationActive: loc.isInvestigationActive,
          price: loc.price
        }))
      }))
    };

    try {
      setLoading(true);
      setLoadingMessage("Se salvează datele...");

      const response = await axios.post(`${backendUrl}/api/admin/add-investigation-availability`, {
        adminID,
        finalPayload
      });

      //toast.success(response.data?.message || "Datele au fost salvate cu succes!");
      onCloseSave();

    } catch (error) {
      console.error("Eroare la salvare:", error);
      toast.error(error.response?.data?.message || "Eroare la salvarea datelor!");
    } finally {
      setLoading(false);
    }
  };

  const specialityOptions = specialitiesData
    .filter(spec => !selectedSpecialities.find(s => s.specialityID === spec.specialityID))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(spec => ({
      value: spec.specialityID,
      label: `${spec.name} - ${spec.specialityID}`
    }));

    const toggleSpecialityExpand = (specialityID) => {
        setExpandedSpecialities(prev => ({
            ...prev,
            [specialityID]: !prev[specialityID],
        }));
    };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-y">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-4xl max-h-[90%] overflow-y-auto">
        <div className="w-18 h-1 bg-green-600 rounded-full mx-auto mb-4"></div>
        <p className="text-2xl font-semibold text-gray-800 text-center">
          Asociază Specialități și Locații pentru Investigația
        </p>
        <p className="text-xl font-semibold text-gray-700 text-center mb-3">
          ~ {investigationData.investigationName} - {investigationData.investigationID} ~
        </p>

        {noSpecialitiesAvailable ? (
          <div className="text-center p-4">
            <p className="text-xl italic font-semibold text-gray-700 mb-3">
              Nu există specialități disponibile pentru această investigație momentan.
            </p>
            <div className="flex justify-center mt-">
                <button onClick={onCloseFinish} className="btn-outline-green-little-little">
                <FontAwesomeIcon icon={faCircleCheck} /> Finalizare
                </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-center text-gray-600 mb-3 font-medium">
              Activează sau dezactivează investigația per locație, pentru fiecare specialitate.
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

            {/* Mesaj informativ pentru investigațti */}
            <div className="bg-purple-100 border-l-4 border-purple-500 text-purple-800 p-3 rounded-md text-sm text-center mb-4">
                Atenție! Când o <strong>specialitate este inactivă</strong> într-o locație, <strong>investigația nu poate fi activată</strong> pentru acea locație. Asigură-te că specialitatea este activă înainte de a activa investigația!
            </div>

            {/* Select cu buton */}
            <div className="flex gap-3 items-end mb-5 border-t pt-4">
              <div className="flex-1">
                <CustomSelect
                  options={specialityOptions}
                  value={selectedSpeciality}
                  onChange={setSelectedSpeciality}
                  placeholder="Selectează specialitatea..."
                />
              </div>
              <button 
                onClick={handleAddSpeciality} 
                className="btn-outline-purple-little hover:cursor-pointer"
                >
                + Adaugă
              </button>
            </div>

            <div className="space-y-6">
              {selectedSpecialities.map((spec) => {
                const isExpanded = expandedSpecialities[spec.specialityID] ?? true;
                return (
                  <div 
                  key={spec.specialityID} 
                  className="border border-gray-300 rounded-lg shadow-lg p-4 bg-gray-50"
                  >
                    {/* Header specialitate */}
                    <div className="flex justify-between items-center border-b pb-2 mb-3">
                      <h3 className="font-bold md:text-lg text-md text-purple-700">{spec.specialityName} ({spec.specialityID})</h3>
                      <div className="flex gap-3">
                         <button 
                         title="Activează în toate locațiile"
                            onClick={() => handleActivateAllLocations(spec.specialityID)} 
                            className="btn-outline-green-little"
                          >
                            <FontAwesomeIcon icon={faCheckCircle} className="" />
                            
                          </button>

                           <button 
                           title="Dezactivează în toate locațiile"
                              onClick={() => handleDeactivateAllLocations (spec.specialityID)} 
                              className="btn-outline-red-little"
                            >
                              <FontAwesomeIcon icon={faTimesCircle} className="" />
                            
                            </button>
                            
                        <button 
                        title="Șterge specialitatea"
                        onClick={() => handleRemoveSpeciality(spec.specialityID)} 
                        className="btn-outline-red-little">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                        <button 
                            onClick={() => toggleSpecialityExpand(spec.specialityID)} 
                            className="btn-outline-purple-little"
                            >
                           <FontAwesomeIcon
                                icon={ faChevronUp }
                                className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
                            />
                        </button>
                        
                      </div>
                    </div>

                    {/* Lista de Locatii */}
                    {isExpanded && (
                      <div className="flex flex-col gap-2">
                        {spec.locations.map((loc) => (
                          <div 
                          key={loc.locationID} 
                          className={`flex flex-col sm:flex-row sm:items-center justify-between items-center p-4 rounded-lg shadow-sm border-l-4 transition-all duration-300 hover:shadow-md hover:scale-[1.02]
                                ${(loc.locationStatus === 'inchis temporar' || !loc.isLocationActive || !loc.isSpecialityActive)
                                    ? 'border-gray-500 bg-gray-50'
                                    : !loc.isSpecialityActive
                                    ? 'border-red-500 bg-red-50'
                                    : !loc.isInvestigationActive
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-green-500 bg-green-50'
                                    }`}
                            > 
                            {/* Info locatie */}
                            <div className="flex flex-col">
                              <span className="font-medium text-md text-gray-800">{loc.locationCounty} - {loc.locationID}</span>
                              <p className="text-sm text-gray-700">{loc.locationClinicName}</p>
                              <p className="text-sm italic text-gray-600">
                                Locație: 
                                <span className={`font-bold ml-1 
                                    ${loc.locationStatus === 'deschis' ? 'text-green-700' : 'text-red-700'}`}>
                                        {getStatusLabel(loc.locationStatus)}
                                        {loc.locationReopenDate ? ` (Redeschidere: ${new Date(loc.locationReopenDate).toLocaleDateString('ro-RO', { day: '2-digit', month: 'long', year: 'numeric' })})` : ''}
                                </span>
                              </p>
                              <p className="text-sm italic text-gray-600 ">
                                Specialitate: 
                                <span className={`font-bold ml-1 ${loc.isSpecialityActive ? 'text-green-700' 
                                    : 'text-red-700'}`}>
                                    {loc.isSpecialityActive ? 'Activă' : 'Inactivă'}
                                </span>

                            </p>
                            </div>
                            
                            {/* Controls */}
                            <div className="flex items-center gap-3 mt-2 sm:mt-0">

                            {/* Pret */}
                            <div className="flex items-center gap-1">
                                <label className="text-xs font-medium text-gray-700">Preț (RON):</label>
                                <input
                                type="text"
                                value={loc.price}
                                onChange={(e) => handleUpdateLocation(spec.specialityID, loc.locationID, 'price', e.target.value)}
                                disabled={!loc.isLocationActive || loc.locationStatus !== 'deschis' || !loc.isSpecialityActive }
                                className={`border rounded px-2 py-1 w-24 text-sm ${!loc.isLocationActive || loc.locationStatus !== 'deschis' || !loc.isSpecialityActive ? 'bg-gray-100 text-gray-400' : ''}`}
                                />
                            </div>


                              {/* Toggle Activare Investigatie */}
                            <label className="flex items-center gap-2 text-xs font-medium text-gray-800">
                                <input
                                    type="checkbox"
                                    checked={loc.isInvestigationActive}
                                    disabled={!loc.isLocationActive || loc.locationStatus !== 'deschis' || !loc.isSpecialityActive}
                                    onChange={(e) => handleUpdateLocation(spec.specialityID, loc.locationID, 'isInvestigationActive', e.target.checked)}
                                    className="h-5 w-5 accent-green-600"
                                    />
                                Activ (Investigație)
                            </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center gap-3 mt-5 border-t pt-4">
              <button onClick={handleSaveInvestigationAvailability} className="btn-outline-green-little-little">
                <FontAwesomeIcon icon={faCheckCircle} /> Salvează
              </button>
            </div>
          </>
        )}

        {loading && <Loader message={loadingMessage} />}
      </div>
    </div>
  );
};

export default AddInvestigationSpecialityAndLocations;
