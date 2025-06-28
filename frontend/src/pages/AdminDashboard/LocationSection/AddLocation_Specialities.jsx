import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AppContext } from '../../../context/AppContex';
import { useParams } from 'react-router-dom';
import Loader from '../../../components/Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faChevronDown, faChevronUp, faCircleCheck, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { getStatusLabel } from '../../../utils/getStatusLabel';

const AddLocation_Specialities = ({ onClose, onCloseSaveSpecialities, onCloseFinish, locationData }) => {
  const { backendUrl } = useContext(AppContext);
  const { adminID } = useParams();

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  const [specialitiesData, setSpecialitiesData] = useState([]);
  const [selectedSpecialities, setSelectedSpecialities] = useState([]);
  const [investigationsData, setInvestigationsData] = useState([]);
  const [noSpecialities, setNoSpecialities] = useState(false);

  const [expandedSpecialities, setExpandedSpecialities] = useState({});

  const toggleSpecialityExpand = (specialityID) => {
    setExpandedSpecialities(prev => ({
        ...prev,
        [specialityID]: !prev[specialityID],
    }));
    };

    const fetchInvData = async () => {
      try {
          setLoading(true);
          setLoadingMessage("Se încarcă datele...");

          const response = await axios.get(`${backendUrl}/api/admin/get-all-investigations`);
        
      
          console.log("Inv:", response.data.data)
          setInvestigationsData(response.data.data)
        
      
      } catch (error) {
        console.error('Eroare API:', error);
        toast.error('Eroare la încărcarea datelor');
      } finally{
        setLoading(false);
      }
    } ;

    useEffect(() => {
        fetchInvData();
    }, []);
	

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingMessage('Se încarcă datele...');
        const [specRes, specLocRes, invSpecRes, inv] = await Promise.all([
          axios.get(`${backendUrl}/api/admin/get-all-specialities`),
          axios.get(`${backendUrl}/api/admin/get-all-speciality-locations`),
          axios.get(`${backendUrl}/api/admin/get-all-INV-SPEC`),
        ]);

        const specialities = specRes.data.data;
        const specLocs = specLocRes.data.data;
        const investigations = invSpecRes.data.data;

        const asociate = specialities.map(spec => {
          const found = specLocs.find(sl => sl.locationID === locationData.locationID && sl.specialityID === spec.specialityID);
          const invForSpec = investigations.filter(inv => inv.specialityID === spec.specialityID);
          return {
            specialityID: spec.specialityID,
            specialityName: spec.name,
            isSpecialityActive: found ? found.isSpecialityActive : false,
            investigations: invForSpec.map(inv => ({
              investigationID: inv.investigationID,
              isInvestigationActive: false,
              price: 200
            }))
          };
        });

        const asociateSortate = asociate.sort((a, b) => a.specialityName.localeCompare(b.specialityName, 'ro', { sensitivity: 'base' }));

        setSpecialitiesData(specialities);
        setSelectedSpecialities(asociateSortate);
        setNoSpecialities(asociate.length === 0);
      } catch (err) {
        console.error('Eroare la aducerea datelor:', err);
        toast.error('Eroare la încărcarea datelor.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggleActive = (specialityID) => {
    setSelectedSpecialities(prev =>
      prev.map(spec =>
        spec.specialityID === specialityID
          ? { ...spec, isSpecialityActive: !spec.isSpecialityActive }
          : spec
      )
    );
  };

  const handleToggleInvestigation = (specID, invID) => {
    setSelectedSpecialities(prev =>
      prev.map(spec => {
        if (spec.specialityID === specID) {
          return {
            ...spec,
            investigations: spec.investigations.map(inv =>
              inv.investigationID === invID
                ? { ...inv, isInvestigationActive: !inv.isInvestigationActive }
                : inv
            )
          };
        }
        return spec;
      })
    );
  };

  const handleUpdatePrice = (specID, invID, price) => {
    setSelectedSpecialities(prev =>
      prev.map(spec => {
        if (spec.specialityID === specID) {
          return {
            ...spec,
            investigations: spec.investigations.map(inv =>
              inv.investigationID === invID
                ? { ...inv, price: Math.max(0, Number(price)) }
                : inv
            )
          };
        }
        return spec;
      })
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setLoadingMessage('Se salvează datele...');

      // Salveaza in `specialityLocationModel`
      for (const spec of selectedSpecialities) {
        await axios.post(`${backendUrl}/api/admin/add-speciality-locations`, {
          adminID,
          specialityID: spec.specialityID,
          specialityName: spec.specialityName,
          selectedLocations: [{ locationID: locationData.locationID, isSpecialityActive: spec.isSpecialityActive }]
        });
      }

      // Salveaza in `investigationAvailabilityModel` si `investigationSpecialityModel`
      for (const spec of selectedSpecialities) {
        if (spec.isSpecialityActive) {
          for (const inv of spec.investigations) {
            const finalPayload = {
              investigationID: inv.investigationID,
              specialities: [
                {
                  specialityID: spec.specialityID,
                  locations: [
                    {
                      locationID: locationData.locationID,
                      isInvestigationActive: inv.isInvestigationActive,
                      price: inv.price
                    }
                  ]
                }
              ]
            };

            await axios.post(`${backendUrl}/api/admin/add-investigation-availability`, {
              adminID,
              finalPayload
            });
          }
        }
      }

      toast.success('Datele au fost salvate cu succes!');
      onCloseSaveSpecialities();
    } catch (err) {
      console.error('Eroare la salvare:', err);
      toast.error(err.response?.data?.message || 'Eroare la salvare!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-y">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-4xl max-h-[90%] overflow-y-auto">
        <div className="w-18 h-1 bg-green-600 rounded-full mx-auto mb-4"></div>
        <p className="text-2xl font-semibold text-gray-800 text-center">
          Asociază Specialități și Investigații pentru Locația
        </p>
        <p className="text-xl font-semibold text-gray-700 text-center">
          ~ {locationData.clinicName} - {locationData.locationID} ~
        </p>

        {noSpecialities ? (
          <div className="text-center p-4">
            <p className="text-xl italic font-semibold text-gray-700 mb-3">
              Nu există specialități disponibile momentan.
            </p>
            <div className="flex justify-center">
              <button onClick={onCloseFinish} 
              className="btn-outline-green-little-little"
              >
                <FontAwesomeIcon icon={faCircleCheck} /> 
                Finalizare
              </button>
            </div>
          </div>
        ) : (
          <>
           
            {/* Legenda culori */}
            <div className="flex flex-wrap justify-center gap-4 items-center text-sm text-gray-600 font-medium mb-4 mt-2">

                <div className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                    Specialitate/Investigație activă
                </div>
                <div className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
                    Specialitate/Investigație inactivă
                </div>
            </div>

            {/* Mesaj informativ pentru investigatii */}
            <div className="bg-purple-100 border-l-4 border-purple-500 text-purple-800 p-3 rounded-md text-sm text-center mb-4">
                <strong>Atenție!</strong> Activează <strong>specialitățile</strong> pentru locație înainte de a activa <strong>investigațiile</strong> disponibile.  
                Dacă o <strong>specialitate este inactivă</strong> într-o locație, <span className="underline">investigațiile acesteia vor fi dezactivate automat</span>.
            </div>

            

            {selectedSpecialities.map(spec => {
                const isExpanded = expandedSpecialities[spec.specialityID] ?? true;


               return ( 
                <div 
                    key={spec.specialityID} 
                    className={`border rounded-lg shadow-lg p-4 mb-3 
                    ${spec.isSpecialityActive ? 'border-green-600 bg-green-100' : 'border-red-500 bg-red-100'}`}>
                
                    {/* Header specialitate */}
                    <div className="flex justify-between items-center border-b pb-2 mb-3">
                        <h3 className="font-bold md:text-lg text-md text-purple-700">{spec.specialityName} ({spec.specialityID})</h3>
                        <div className="flex gap-3">
                        
                            <label className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    checked={spec.isSpecialityActive} 
                                    onChange={() => handleToggleActive(spec.specialityID)} 
                                    className="h-5 w-5 accent-green-600"
                                />
                                    Activ
                            </label>

                            <button
                                onClick={() => toggleSpecialityExpand(spec.specialityID)}
                                className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700 transition-all duration-500 text-md hover:shadow-xl shadow-sm"
                                disabled={!spec.isSpecialityActive}
                                >
                                <FontAwesomeIcon
                                    icon={spec.isSpecialityActive ? (isExpanded ? faChevronUp : faChevronDown) : faChevronDown}
                                    className={`transition-transform duration-300 ${spec.isSpecialityActive && isExpanded ? 'rotate-180' : 'rotate-0'}`}
                                    />
                            </button>
                        </div>
                    </div>



                {/* Lista Investigatii */}
                {isExpanded && (
                <div className="flex flex-col gap-2">
                    {spec.isSpecialityActive && spec.investigations.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {spec.investigations.map(inv => (
                          <div 
                                key={inv.investigationID} 
                                className={`flex flex-col sm:flex-row sm:items-center justify-between items-center p-4 rounded-lg shadow-md border-l-4 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]
                                ${inv.isInvestigationActive 
                                    ? 'bg-green-50 border-green-600' 
                                    : 'bg-red-50 border-red-500'
                                }`}
                                >
                                <p className="text-medium font-semibold text-gray-700">
                                    {investigationsData.find(i => i.investigationID === inv.investigationID)?.name || 'N/A'} ({inv.investigationID})
                                </p>

                                <div className="flex items-center gap-1">
                                    <label className="text-sm font-medium text-gray-700 mr-2">Preț (RON):</label>
                                    <input 
                                    type="text"     
                                    value={inv.price} min={0} 
                                    onChange={(e) => handleUpdatePrice(spec.specialityID, inv.investigationID, e.target.value)} 
                                    className="border rounded px-2 py-1 w-24 text-sm" 
                                    />

                                    <label className="flex items-center gap-1 text-sm font-medium text-gray-800 ml-3">
                                    <input 
                                        type="checkbox" 
                                        checked={inv.isInvestigationActive} 
                                        onChange={() => handleToggleInvestigation(spec.specialityID, inv.investigationID)} 
                                        className="h-4 w-4 accent-green-600"
                                    />
                                    Activ
                                    </label>
                                </div>
                                </div>

                        ))}
                    </div>
                    )}
                </div>
                )}
              </div>
               );
                })}
            <div className="flex justify-center gap-3 mt-5 border-t pt-4">
              <button onClick={handleSave} className="btn-outline-green-little">
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

export default AddLocation_Specialities;
