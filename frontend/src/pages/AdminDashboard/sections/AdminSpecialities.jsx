
import React, { useState, useEffect, useContext } from 'react';
import { useCheckAdminAccess } from '../../../accessControl/useCheckAdminAccess';
import { AppContext } from '../../../context/AppContex';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faStethoscope } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import socket from '../../../socket';
import AddSpeciality from '../SpecialitySection/AddSpeciality';
import AddSpecialityLocations from '../SpecialitySection/AddSpecialityLocations';
import DisplayTableSpecialities from '../SpecialitySection/DisplayTableSpecialities';
import CustomSelect from '../../../components/customSelect';

const AdminSpecialities = () => {

    useCheckAdminAccess();
    const { backendUrl } = useContext(AppContext);

    const navigate = useNavigate();

    const { adminName } = useParams();


    // ------------------------------ DB ------------------------------
    const [specialitiesData, setSpecialitiesData] = useState([]);
    const [locationsData, setLocationsData] = useState([]);
    const [investigationsData, setInvestigationsData] = useState([]);
    const [specialityLocationsData, setSpecialityLocationsData] = useState([]);
    const [specialityInvestigationsMap, setSpecialityInvestigationsMap] = useState({});
    const [mergedSpecialities, setMergedSpecialities] = useState([]);
    // -------------------------------------------------------------------------------

    // -------------------------------- Afisare modale ------------------------------
     const [showModalAddSpeciality, setShowModalAddSpeciality] = useState(false);
    const [showModalAddSpecialityLocations, setShowModalAddSpecialityLocations] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [specialityToDelete, setSpecialityToDelete] = useState(null);
    const [selectedSpecialityData, setSelectedSpecialityData] = useState(null);
    //-------------------------------------------------------------------------------

    //--------------------------------- FILTRARE -------------------------------------
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedInvestigation, setSelectedInvestigation] = useState(null);
    const [sortOption, setSortOption] = useState({ value: 'Ordonare', label: 'Ordonare' });

    const [locationOptions, setLocationOptions] = useState([]);
    const [investigationOptions, setInvestigationOptions] = useState([]);
    

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    //-------------------------------------------------------------------------------

      // ================= FETCH ====================
      const fetchSpecialities = async () => {
        try {
          const res = await axios.get(`${backendUrl}/api/admin/get-all-specialities`);
          if (res.data.success) {
            setSpecialitiesData(res.data.data);
          } else {
            toast.error(res.data.message || "Eroare la încărcarea specialităților");
          }
        } catch {
          toast.error("Eroare server la specialități");
        }
      };
    
      const fetchLocations = async () => {
        try {
          const res = await axios.get(`${backendUrl}/api/admin/get-all-locations`);
          if (res.data.success) {
            setLocationsData(res.data.locations);
          } else {
            toast.error(res.data.message || "Eroare la încărcarea locațiilor");
          }
        } catch {
          toast.error("Eroare server la locații");
        }
      };
    
      const fetchInvestigations = async () => {
        try {
          const res = await axios.get(`${backendUrl}/api/admin/get-all-investigations`);
          if (res.data.success) {
            setInvestigationsData(res.data.data);
          } else {
            toast.error("Eroare la încărcarea investigațiilor");
          }
        } catch {
          toast.error("Eroare server la investigații");
        }
      };
    
      const fetchSpecialityLocations = async () => {
        try {
          const res = await axios.get(`${backendUrl}/api/admin/get-all-speciality-locations`);
          if (res.data.success) {
            setSpecialityLocationsData(res.data.data);
          } else {
            toast.error("Eroare la încărcarea legăturilor specialitate-locație");
          }
        } catch {
          toast.error("Eroare server la legături specialitate-locație");
        }
      };
    
      const fetchSpecialityInvestigations = async () => {
        try {
          const res = await axios.get(`${backendUrl}/api/admin/get-investigation-for-speciality`);
          if (res.data.success) {
            setSpecialityInvestigationsMap(res.data.data);
          } else {
            toast.error("Eroare la încărcarea legăturilor specialitate-investigații");
          }
        } catch {
          toast.error("Eroare server la legături specialitate-investigații");
        }
      };
    
      useEffect(() => {
        fetchSpecialities();
        fetchLocations();
        fetchSpecialityLocations();
        fetchInvestigations();
        fetchSpecialityInvestigations();
      }, []);

      // ==================== SOCKET ====================
  useEffect(() => {
     socket.on('ADD_SPECIALITY', () => {
        console.log('Specialitatile s-au actualizat (adăugare)!');
        toast.info('Date actualizate');
        fetchSpecialities();
        fetchLocations();
        fetchSpecialityLocations();
        fetchInvestigations();
        fetchSpecialityInvestigations();
      });
      socket.on('ADD_SPECIALITY_LOC', () => {
        console.log('Specialitatile s-au actualizat (adăugare)!');
        toast.info('Date actualizate');
        fetchSpecialities();
        fetchLocations();
        fetchSpecialityLocations();
        fetchInvestigations();
        fetchSpecialityInvestigations();
      });
      socket.on('SPECIALITY_DELETED', () => {
        console.log('Specialitatile s-au actualizat (stergere)!');
        toast.info('Date actualizate');
        fetchSpecialities();
        fetchLocations();
        fetchSpecialityLocations();
        fetchInvestigations();
        fetchSpecialityInvestigations();
      });
    
   
    return () => {
      socket.off('ADD_SPECIALITY');
      socket.off('ADD_SPECIALITY_LOC');
      socket.off('SPECIALITY_DELETED');
    };
  }, []);

  // ==================== MAPARE ====================
  useEffect(() => {
    const locationMap = {};
    locationsData.forEach(loc => {
      locationMap[loc.locationID] = loc;
    });

    const specLocationMap = {};
    specialityLocationsData.forEach(link => {
      if (!specLocationMap[link.specialityID]) specLocationMap[link.specialityID] = [];
      if (link.isSpecialityActive) {
        specLocationMap[link.specialityID].push({
          ...link,
          locationDetails: locationMap[link.locationID] || null
        });
      }
    });

    const specInvestigationMap = {};
    Object.entries(specialityInvestigationsMap).forEach(([specID, invList]) => {
      specInvestigationMap[specID] = invList.map(inv => inv.investigationID);
    });

    const merged = specialitiesData.map(spec => ({
      ...spec,
      linkedLocations: specLocationMap[spec.specialityID] || [],
      linkedInvestigations: specInvestigationMap[spec.specialityID] || []
    }));

    setMergedSpecialities(merged);
  }, [specialitiesData, locationsData, specialityLocationsData, specialityInvestigationsMap]);

  // ================ OPTIONS SELECT ================

    useEffect(() => {
      const options = locationsData
        .map(loc => ({
          value: `${loc.locationID}`,
          label: `${loc.address?.county || ''} - ${loc.clinicName}`
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

      setLocationOptions([{ value: 'all', label: 'Toate locațiile' }, ...options]);
    }, [locationsData]);

    useEffect(() => {
      const invOptions = investigationsData
        .map(inv => ({ value: inv.investigationID, label: inv.name }))
        .sort((a, b) => a.label.localeCompare(b.label));

      setInvestigationOptions([{ value: 'all', label: 'Toate investigațiile' }, ...invOptions]);
    }, [investigationsData]);


  // ================ FILTRARE ================
  const filteredSpecialities = mergedSpecialities
    .filter(spec =>
      ((spec.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (spec.specialityID.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (!selectedLocation || selectedLocation.value === 'all' ||
        spec.linkedLocations.some(loc => loc.locationID === selectedLocation.value)) &&
      (!selectedInvestigation || selectedInvestigation.value === 'all' ||
        spec.linkedInvestigations.includes(selectedInvestigation.value))
    )
    .sort((a, b) => {
      switch (sortOption?.value) {
        case 'asc': return a.name.localeCompare(b.name);
        case 'desc': return b.name.localeCompare(a.name);
        default: return 0;
      }
    });

  const totalPages = Math.ceil(filteredSpecialities.length / itemsPerPage);
  const paginatedSpecialities = filteredSpecialities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  return (
    <div className="">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white shadow-md rounded-xl px-6 py-4 mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            <FontAwesomeIcon icon={faStethoscope} className='mr-2 text-purple-600' /> Gestionare specialități
          </h1>
          <p className="text-sm text-gray-500">Administrează specialitățile medicale disponibile în clinici</p>
        </div>
        <button
          onClick={() => setShowModalAddSpeciality(true)}
          className="btn-outline-purple-little-little"
        >
          + Specialitate nouă
        </button>
      </div>
      

      {/* Adaugare in tabele */}
      {showModalAddSpeciality && 
        <AddSpeciality
          onCloseSave={(specialityData) => {
            //console.log("Am primit datele:", specialityData);
            setShowModalAddSpeciality(false);

            setSelectedSpecialityData(specialityData); 
            setShowModalAddSpecialityLocations(true);
            
            toast.info("Acum trebuie să asociezi specialitățile cu locațiile active!")
          }}
          onClose={() => 
            {
              setShowModalAddSpeciality(false)
              toast.info("Adăugarea specialități s-a anulat!");
            }
          }
        />
      }

      {showModalAddSpecialityLocations &&
        <AddSpecialityLocations 
          specialityData={selectedSpecialityData}
          onCloseFinish = { () => 
          {
            setShowModalAddSpecialityLocations(false)
            //toast.success("Adăugarea specialități s-a finalizat cu succes!");

          }
          }
        />
      }

       {/* Afisare */}
      <div className="bg-white rounded-xl shadow-md px-6 py-4 mb-1">

        {/* FILTRE */}
        <div>
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="text-purple-700" />
              <h2 className="text-base sm:text-lg md:text-lg font-medium text-gray-800">Filtrează specialitățiile</h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 items-center">
             <div className="relative w-full lg:w-1/4">
            <input
              type="text"
              placeholder="Specialitate..."
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
                options={locationOptions}
                value={selectedLocation?.value || ''}
                onChange={(val) => setSelectedLocation(locationOptions.find(opt => opt.value === val) || null)}
                placeholder="Locație"
                className="lg:w-1/4 w-full"
              />

              <CustomSelect
                options={investigationOptions}
                value={selectedInvestigation?.value || ''}
                onChange={(val) => setSelectedInvestigation(investigationOptions.find(opt => opt.value === val) || null)}
                placeholder="Investigație"
                className="lg:w-1/4 w-full"
              />

              <CustomSelect
                options={[
                  { value: 'Ordonare', label: 'Ordonare' },
                  { value: 'asc', label: 'Denumire A-Z' },
                  { value: 'desc', label: 'Denumire Z-A' }
                ]}
                value={sortOption?.value || ''}
                onChange={(val) => setSortOption([{ value: 'Ordonare', label: 'Ordonare' }, { value: 'asc', label: 'Denumire A-Z' }, { value: 'desc', label: 'Denumire Z-A' }].find(opt => opt.value === val) || null)}
                placeholder="Ordonare"
                className="lg:w-1/4 w-full"
              />

              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedLocation(null);
                  setSelectedInvestigation(null);
                  setSortOption(null);
                }}
                className="bg-purple-100 hover:bg-purple-200 text-gray-700 border border-gray-300 px-4 py-2 rounded text-sm w-full lg:w-auto"
              >
                Resetează
              </button>
            </div>
          </div>



        {/* Navigare pagina */}
        <div>
          {/* Primul rand */}
          <div className="flex items-center justify-center relative my-2 mt-10">
            <div className="flex-grow border-t border-gray-300 mr-3"></div>
            <span className="text-gray-700 md:text-base text-sm font-medium whitespace-nowrap">
              Numărul specialităților: <strong>{filteredSpecialities.length}</strong>
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
        <DisplayTableSpecialities 
          specialities={paginatedSpecialities}
           onDeleteClick={(id) => {
            setSpecialityToDelete(id);
            setShowDeleteModal(true);
          }}
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

        {showDeleteModal && (
          <DeleteSpeciality
            specialityID={specialityToDelete}
            onClose={() => setShowDeleteModal(false)}
            refreshSpecialities={fetchSpecialities}
          />
      )}
      </div>
    </div>
  )
}

export default AdminSpecialities