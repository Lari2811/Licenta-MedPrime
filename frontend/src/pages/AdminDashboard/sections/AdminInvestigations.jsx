import React, { useState, useEffect, useContext } from 'react';

import { AppContext } from '../../../context/AppContex';
import axios from 'axios';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDown,
  faArrowUp,
  faCheckCircle, faClipboard, faEdit, faEnvelope, faEye, faHospital,
  faMagnifyingGlass, faMapMarkerAlt, faStethoscope,
  faTimesCircle, faTools, faTrashAlt
} from '@fortawesome/free-solid-svg-icons';

import { useNavigate, useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddInvestigation from '../InvestigationsSection/AddInvestigation';
import DisplayTableInvestigations from '../InvestigationsSection/DisplayTableInvestigations';
import { useCheckAdminAccess } from '../../../accessControl/useCheckAdminAccess';
import AddInvestigationSpecialityAndLocations from '../InvestigationsSection/AddInvestigationSpecialityAndLocations';
import { io } from 'socket.io-client';
import CustomSelect from '../../../components/customSelect';

const AdminInvestigations = () => {

    useCheckAdminAccess();
    const { backendUrl } = useContext(AppContext);

    const [investigationsData, setInvestigationsData] = useState([]);
    const [specialitiesData, setSpecialitiesData] = useState([]);
    const [locationsData, setLocationsData] = useState([]);
    const [investigationExtended, setInvestigationExtended] = useState([])
    const [showModalAddInvestigation, setShowModalAddInvestigation] = useState(false);
    const [showModalAddInvestigationSpecialityLocations, setShowModalAddInvestigationSpecialityLocations] = useState(false);
    

    // pentru modale
    const [selectedInvestigationData, setSelectedInvestigationData] = useState(null);

     //contorizare
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
  
// ------------------------ FILTRARE   ------------------------

    const [specialityOptions, setSpecialityOptions] = useState([])
    const [locationsOptions, setLocationsOptions] = useState([])

    const [selectedSpeciality, setSelectedSpeciality] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    
    const [countyOptions, setCountyOptions] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");

    const [selectedCounty, setSelectedCounty] = useState(null);  
    const [sortOption, setSortOption] = useState('Ordonare');

    const fetchInvestigations = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/admin/get-all-investigations`);
        if (res.data.success) {
          setInvestigationsData(res.data.data);
          console.log("Investigatii din backend:", res.data.data);

        } else {
          toast.error(res.data.message || "Eroare la încărcarea investigatiilor");
        }
      } catch (err) {
        toast.error("Eroare server la investigatii");
      }
    };

    const fetchSpecialities = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/admin/get-all-specialities`);
          const options = res.data.data.map(spec => ({
            label: spec.name,
            value: spec.specialityID
          }));
          setSpecialityOptions([
            { label: 'Toate specialitățile', value: 'Toate specialitățile' },
            ...options
          ]);
          setSpecialitiesData(res.data.data);
          //console.log("Specialități din backend:", res.data.data);
      
      } catch (err) {  
        toast.error("Eroare server la specialități");
      }
    };

    const fetchLocations = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/admin/get-all-locations`);
        const countiesRes = await axios.get(`${backendUrl}/api/admin/get-counties`);
          const options = res.data.locations.map(loc => ({
            label: loc.clinicName,
            value: loc.locationID
          }));
          setLocationsOptions([
            { label: 'Toate clinicile', value: 'Toate clinicile' },
            ...options
          ]);
          setCountyOptions(['Toate județele', ...countiesRes.data.counties]);
          setLocationsData(res.data.locations);
          console.log("clinicile din backend:", res.data.locations);
      
      } catch (err) {  
        toast.error("Eroare server la locații");
      }
    };

    useEffect(() => {
      setSelectedLocation(null);
    }, [selectedCounty]);

    const filteredLocationsOptions = selectedCounty && selectedCounty !== 'Toate județele'
      ? locationsData
          .filter(loc => loc.address.county === selectedCounty)
          .map(loc => ({ label: loc.clinicName, value: loc.locationID }))
      : locationsData.map(loc => ({ label: loc.clinicName, value: loc.locationID }));

    const locationOptionsToShow = [
      { label: 'Toate clinicile', value: 'Toate clinicile' },
      ...filteredLocationsOptions
    ];

    // Filtrarea efectiva
    const filteredInvestigations = investigationExtended
      .filter(inv => {
        const matchesSearch =
          inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.investigationID.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCounty =
          !selectedCounty || selectedCounty === 'Toate județele' ||
          inv.locations?.some(loc => {
            const found = locationsData.find(l => l.locationID === loc.locationID);
            return found?.address?.county === selectedCounty;
          });

        const matchesLocation =
          !selectedLocation || selectedLocation === 'Toate clinicile' ||
          inv.locations?.some(loc => loc.locationID === selectedLocation);

        const matchesSpeciality =
          !selectedSpeciality || selectedSpeciality === 'Toate specialitățile' ||
          inv.specialities?.some(spec => spec.specialityID === selectedSpeciality);

        return matchesSearch && matchesCounty && matchesLocation && matchesSpeciality;
      })
      .sort((a, b) => {
        switch (sortOption) {
          case 'Ordonare':
            return a.name.localeCompare(b.name);
          case 'Nume A-Z':
            return a.name.localeCompare(b.name);
          case 'Nume Z-A':
            return b.name.localeCompare(a.name);
          default:
            return 0;
        }
      });


   // -----------------------------------------------------------------------

    useEffect(() => {
          fetchSpecialities();
          fetchInvestigations();
          fetchLocations();
          
    const socket = io(backendUrl);

    socket.on('investigationAdded', (data) => {
      console.log('Investigație nouă adăugată:', data);
      fetchSpecialities(); 
      fetchInvestigations();
      fetchLocations();
      toast.info('Date actualizate');
    });

    socket.on('INVESTIGATION_DELETED', () => {
        console.log(' Investigaatiile s-au actualizat!');
        fetchDoctors(); 
        fetchSpecialities(); 
        fetchInvestigations();
        fetchLocations();
        toast.info('Date actualizate');
      });

      socket.on('SPECIALITY_DELETED', () => {
        console.log(' Investigaatiile s-au actualizat!');
        fetchDoctors(); 
        fetchSpecialities(); 
        fetchInvestigations();
        fetchLocations();
        toast.info('Date actualizate');
      });

    return () => {
      socket.off('investigationAdded');
      socket.off('INVESTIGATION_DELETED');
      socket.off('SPECIALITY_DELETED');
      
    };
    }, []);

    useEffect(() => {
      const fetchExtendedInvestigations = async () => {
        try {
          const inv = await axios.get(`${backendUrl}/api/admin/get-extended-investigations`);
          setInvestigationExtended(inv.data.data);
          console.log("INV EXT:", inv.data.data);
        } catch (err) {
          console.error('Eroare la preluarea locațiilor:', err);
        } 
      };

      fetchExtendedInvestigations();
    }, []);

    //statistica
    const totalPages = Math.ceil(filteredInvestigations.length / itemsPerPage);
    const paginatedInvestigations = filteredInvestigations.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

   
  return (
     <div className="">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white shadow-md rounded-xl px-6 py-4 mb-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              <FontAwesomeIcon icon={faStethoscope} className='mr-2 text-purple-600' /> Gestionare investigați
            </h1>
            <p className="text-sm text-gray-500">Administrează investigațile disponibile în clinici</p>
          </div>
          <button
            onClick={() => setShowModalAddInvestigation(true)}
            className="btn-outline-purple-little-little hover:cursor-pointer"
          >
            + Investigație nouă
          </button>
        </div>

        {showModalAddInvestigation && 
        <AddInvestigation
          onCloseSave={(investigationData) => {
            //console.log("Am primit datele:", investigationData);
            setShowModalAddInvestigation(false);
            setSelectedInvestigationData(investigationData); // (ex: cu useState)
            setShowModalAddInvestigationSpecialityLocations(true);
            toast.info("Acum trebuie să asociezi investigația cu specialitățile disponibile!")

          }}
          onClose={() => {
              setShowModalAddInvestigation(false)
              toast.info("Adăugarea investigației s-a anulat!");
            }
          }
        />
        }

        {showModalAddInvestigationSpecialityLocations && 
          <AddInvestigationSpecialityAndLocations 
            investigationData={selectedInvestigationData}
            onClose={ () => 
              {
                setShowModalAddInvestigationSpecialityLocations(false) 
                toast.info("Adăugarea specialitățiilor pentru investigație s-a anulat!");
              }
            }
            onCloseFinish = { () => 
              {
                setShowModalAddInvestigationSpecialityLocations(false)
                toast.success("Adăugarea investigație s-a finalizat cu succes!");
    
              }
            }

            onCloseSave={ () => {
              setShowModalAddInvestigationSpecialityLocations(false)
              toast.success("Datele au fost salvate cu succes!");
            }}
          />
        }

          {/* Afisare */}
          <div className="bg-white rounded-xl shadow-md px-6 py-4 mb-1">

             {/* Filtre */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="text-purple-700" />
                  <h2 className="text-base sm:text-lg md:text-lg font-medium text-gray-800">Filtrează investigațiile</h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 items-center">
                  <div className="relative w-full lg:w-1/3">
                  <input
                    type="text"
                    placeholder="Investigatie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-700 p-2.5 rounded w-full text-sm pl-10"
                    
                  />
                    <FontAwesomeIcon
                      icon={faMagnifyingGlass}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                    />
                  </div>
                  

                  <CustomSelect
                    options={countyOptions.map(c => ({ value: c, label: c }))}
                    value={selectedCounty}
                    onChange={(selected) => setSelectedCounty(selected)}
                    className="w-full lg:w-1/3 text-sm"
                    placeholder="Județul..."
                  />

                  <CustomSelect
                      options={locationOptionsToShow}
                      value={selectedLocation}
                      onChange={(selected) => setSelectedLocation(selected)}
                      className="w-full lg:w-1/3 text-sm"
                      placeholder="Clinica..."
                    />


                  <CustomSelect
                    options={specialityOptions}
                    value={selectedSpeciality} 
                    onChange={(selected) => setSelectedSpeciality(selected)}
                    className="w-full lg:w-1/3 text-sm"
                    placeholder="Specialitatea..."
                  />


                  <CustomSelect
                    options={[
                      { value: 'Nume A-Z', label: (<> <FontAwesomeIcon icon={faArrowUp} className="mr-1" /> <span> Nume </span> </>)},
                      { value: 'Nume Z-A', label: (<> <FontAwesomeIcon icon={faArrowDown} className="mr-1" /> <span> Nume </span> </>)},
                    ]}
                    value={sortOption}
                    onChange={(selected) => setSortOption(selected)}
                    className="w-full lg:w-1/3 text-sm"
                    placeholder="Ordinea..."
                  />

                  {/* Resetare */}
                  <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCounty(null);
                    setSelectedLocation(null);
                    setSelectedSpeciality(null);
                    setSortOption(null);
                  
                  }}
                  className="bg-purple-100 hover:bg-purple-200 text-gray-700 border border-gray-300 px-4 py-2 rounded text-sm w-full lg:w-auto"
                  >
                    Resetează
                  </button>
                </div>
              </div>

              {/* Navigare pagini */}
              <div>
                {/* Primul rand */}
                <div className="flex items-center justify-center relative my-2 mt-10">
                  <div className="flex-grow border-t border-gray-300 mr-3"></div>
                  <span className="text-gray-700 md:text-base text-sm font-medium whitespace-nowrap">
                    Numărul investigaților: <strong>{filteredInvestigations.length}</strong>
                  </span>
                  <div className="flex-grow border-t border-gray-300 ml-3"></div>
                </div>

                {/* Al doilea rand */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-3 text-sm text-gray-700">
                  
                  {/* Select nr. pe pagina */}
                  <div className="flex items-center gap-2">
                    <span>Arată pe pagină:</span>
                    {[5, 25, 50, 100].map(number => (
                      <button
                        key={number}
                        onClick={() => {
                          setItemsPerPage(number);
                          setCurrentPage(1);
                        }}
                        className={`px-2 py-1 rounded ${
                          itemsPerPage === number
                            ? 'font-bold text-purple-700 underline'
                            : 'hover:text-purple-600'
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                    <span>specialități</span>
                  </div>

                  {/* Navigare pagini */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="text-gray-500 enabled:hover:text-purple-700 disabled:opacity-40"
                    >
                  
                      ← Anterior
                    </button>
                    <span>{currentPage} din {totalPages}</span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="text-gray-500 enabled:hover:text-purple-700 disabled:opacity-40"
                    >
                      Următor →
                    </button>
                  </div>
                </div>
              </div>

              {/* Table */}
              <DisplayTableInvestigations 
                investigations={paginatedInvestigations}
              />


               {/* Navigare pagini */}
              <div className="flex justify-end items-center gap-3 mt-4 text-sm">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="text-gray-500 enabled:hover:text-purple-700 disabled:opacity-40"
                >
              
                  ← Anterior
                </button>
                <span>{currentPage} din {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="text-gray-500 enabled:hover:text-purple-700 disabled:opacity-40"
                >
                  Următor →
                </button>
              </div>

              </div>
          
          
      </div>
  )
}

export default AdminInvestigations