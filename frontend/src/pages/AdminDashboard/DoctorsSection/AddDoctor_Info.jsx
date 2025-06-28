import React, { useContext, useEffect, useState } from 'react';
import { toast } from "react-toastify";
import axios from 'axios';
import { AppContext } from '../../../context/AppContex';
import { useParams } from 'react-router-dom';
import Loader from '../../../components/Loader';
import CustomSelect from '../../../components/customSelect';
import { ziuaCorecta } from '../../../utils/ziProgram';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdd, faCalendarAlt, faCheckToSlot, faChevronUp, faCircleCheck, faCircleChevronDown, faClock, faClose, faMinus, faPlus, faStethoscope, faTrash } from '@fortawesome/free-solid-svg-icons';
import { selectOptions } from '../../../utils/selectOptions';


const AddDoctor_Info = ({ onCloseFinish , onCloseSave, doctorData }) => {
    const { backendUrl } = useContext(AppContext);
    const { adminID } = useParams();

    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const [noSpecialities, setNoSpecialities] = useState(false);
    const [selectedSpecialities, setSelectedSpecialities] = useState([]);

    const [specialitiesData, setSpecialitiesData] = useState([]);
    const [locationsData, setLocationsData] = useState([]);
    const [specialityLocationData, setSpecialityLocationData] = useState([]);
    const [investigationsData, setInvestigationsData] = useState([]);
    const [invSpecData, setInvSpecData] = useState([]);

    const [showScheduleModal, setShowScheduleModal] = useState(false);



    const [specialityToAdd, setSpecialityToAdd] = useState(null);

    // State pentru a ține evidența locațiilor cu programul afișat
    const [openProgram, setOpenProgram] = useState({});

    const zileOrdine = ["luni", "marti", "miercuri", "joi", "vineri", "sambata", "duminica"];

    const sorteazaDupaZi = (a, b) => {
        const zileOrdine = ["luni", "marti", "miercuri", "joi", "vineri", "sambata", "duminica"];
        const ziA = a.day?.toLowerCase();
        const ziB = b.day?.toLowerCase();
        return zileOrdine.indexOf(ziA) - zileOrdine.indexOf(ziB);
    };

    // expindere spec
    const [expandedSpecialities, setExpandedSpecialities] = useState({});
    const [workLocations, setWorkLocations] = useState({}); 

    const toggleSpeciality = (specialityID) => {
    setExpandedSpecialities(prev => ({
        ...prev,
        [specialityID]: !prev[specialityID],
    }));
    };

    const toggleWorkLocation = (specialityID, locationID) => {
        setWorkLocations(prev => {
        const current = prev[specialityID] || [];
        if (current.includes(locationID)) {
            return {
            ...prev,
            [specialityID]: current.filter(id => id !== locationID)
            };
        } else {
            return {
            ...prev,
            [specialityID]: [...current, locationID]
            };
        }
        });
    };


    const fetchData = async () => {
        try {
            setLoading(true);
            setLoadingMessage('Se încarcă datele...');

            const [specRes, specLocRes, locRes] = await Promise.all([
                axios.get(`${backendUrl}/api/admin/get-all-specialities`),
                axios.get(`${backendUrl}/api/admin/get-all-speciality-locations`),
                axios.get(`${backendUrl}/api/admin/get-all-locations`),
                ]);

            setSpecialitiesData(specRes.data.data || []);
            setSpecialityLocationData(specLocRes.data.data || []);
            setLocationsData(locRes.data.locations || []);
          
            const specialities = specRes.data.data || [];
            setSpecialitiesData(specialities);
            setNoSpecialities(specialities.length === 0);
            setSelectedSpecialities([]); 
            } catch (error) {
                toast.error('Eroare la încărcarea datelor');
                console.error(error);
            } finally {
                setLoading(false);
            }
    };

    useEffect(() => {
        fetchData();
    }, [backendUrl]);


    //date necesare
    //console.log('Specialities:', specialitiesData);
    //console.log('Speciality Locations:', specialityLocationData);
    //console.log('Locations:', locationsData);
    //console.log('Investigations:', investigationsData);
    //console.log('Investigation-Speciality Relations:', invSpecData);
 
    //optiuni select
    const options = specialitiesData
        .filter(spec => !selectedSpecialities.some(sel => sel.specialityID === spec.specialityID))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(spec => ({
            value: spec.specialityID,
            label: `${spec.name} (${spec.specialityID})`
        }));

    const handleAddSpeciality = () => {
    if (!specialityToAdd) {
        toast.error('Selectează o specialitate înainte de a adăuga');
        return;
    }
    console.log("specialityToAdd:", specialityToAdd);
    const specObj = specialitiesData.find(spec => spec.specialityID === specialityToAdd);
    if (specObj) {
        setSelectedSpecialities(prev => [...prev, specObj]);
        setSpecialityToAdd(null);
    }
    };


    const handleRemoveSpeciality = (specialityID) => {
        setSelectedSpecialities(prev => prev.filter(spec => spec.specialityID !== specialityID));
    };

    //Program munca ---------------------------------------
    const [workSchedules, setWorkSchedules] = useState({}); 

    const [tempScheduleInputs, setTempScheduleInputs] = useState({}); 
    const handleInputChange = (specialityID, locationID, field, value) => {
    setTempScheduleInputs(prev => ({
        ...prev,
        [specialityID]: {
        ...prev[specialityID],
        [locationID]: {
            ...((prev[specialityID] && prev[specialityID][locationID]) || {}),
            [field]: value,
        }
        }
    }));
    };

    const addWorkSchedule = (specialityID, locationID) => {
        const input = tempScheduleInputs?.[specialityID]?.[locationID];
        if (!input || !input.day || !input.startTime || !input.endTime) {
            toast.error('Completează toate câmpurile programului.');
            return;
        }

        // Gaseste programul locatie pentru ziua respectivă
        const location = locationsData.find(loc => loc.locationID === locationID);
        if (!location || !location.schedule) {
            toast.error('Programul locației nu este disponibil.');
            return;
        }

        const daySchedule = location.schedule.find(sch => sch.day.toLowerCase() === input.day.toLowerCase());
        if (!daySchedule) {
            toast.error(`Clinica nu este deschisă în ziua ${ziuaCorecta(input.day)}.`);
            return;
        }

        // Verifica intervalul de timp: program medic trebuie sa fie in intervalul clinicii
        if (input.startTime < daySchedule.startTime || input.endTime > daySchedule.endTime) {
            toast.error(`Intervalul ales trebuie să fie între ${daySchedule.startTime} și ${daySchedule.endTime}.`);
            return;
        }

        // Ora de start trebuie sa fie înaintea orei de final
        if (input.startTime >= input.endTime) {
            toast.error('Ora de început trebuie să fie înaintea orei de final.');
            return;
        }

        // Verifica suprapunerea programelor pe aceeasi zi, pentru toate locatiile acelei specialitati
        const allSchedulesForSpeciality = workSchedules[specialityID] || {};
        
        // Parcurgem toate locatiile si programele pentru specialitatea respectiva
        for (const [locID, schedules] of Object.entries(allSchedulesForSpeciality)) {
            for (const schedule of schedules) {
            if (schedule.day.toLowerCase() === input.day.toLowerCase()) {
                if (
                input.startTime < schedule.endTime &&
                input.endTime > schedule.startTime
                ) {
                toast.error(
                    `Programul se suprapune cu un interval existent la locația ${locationsData.find(l => l.locationID === locID)?.clinicName || locID} (${ziuaCorecta(schedule.day)} ${schedule.startTime} - ${schedule.endTime}).`
                );
                return;
                }
            }
            }
        }

        // Verificare suprapunere globala pentru toate specialitatile 
        for (const [specID, locations] of Object.entries(workSchedules)) {
        for (const [locID, schedules] of Object.entries(locations)) {
            for (const schedule of schedules) {
            if (schedule.day.toLowerCase() === input.day.toLowerCase()) {
                if (
                input.startTime < schedule.endTime &&
                input.endTime > schedule.startTime
                ) {
                toast.error(
                    `Programul se suprapune cu un interval existent pentru specialitatea ${specialitiesData.find(s => s.specialityID === specID)?.name || specID}, ` +
                    `la locația ${locationsData.find(l => l.locationID === locID)?.clinicName || locID} ` +
                    `(${ziuaCorecta(schedule.day)} ${schedule.startTime} - ${schedule.endTime}).`
                );
                return; 
                }
            }
            }
        }
        }

        setWorkSchedules(prev => {
            const currentSchedules = prev[specialityID]?.[locationID] || [];
            return {
            ...prev,
            [specialityID]: {
                ...prev[specialityID],
                [locationID]: [...currentSchedules, input]
            }
            };
        });

        setTempScheduleInputs(prev => ({
            ...prev,
            [specialityID]: {
            ...prev[specialityID],
            [locationID]: { day: '', startTime: '08:00', endTime: '20:00' }
            }
        }));
    };



    const removeWorkSchedule = (specialityID, locationID, index) => {
    setWorkSchedules(prev => {
        const currentSchedules = prev[specialityID]?.[locationID] || [];
        return {
        ...prev,
        [specialityID]: {
            ...prev[specialityID],
            [locationID]: currentSchedules.filter((_, i) => i !== index)
        }
        };
    });
    };

    // ---------------------- Salvare ----------------------
   const handleSave = async () => {
        const hasAnySchedule = Object.values(workSchedules).some(locations =>
            Object.values(locations).some(scheduleArray => scheduleArray.length > 0)
        );

        if (!hasAnySchedule) {
            toast.error("Trebuie să adaugi cel puțin un program înainte de a salva.");
            return;
        }

        try {
            setLoading(true);
            setLoadingMessage('Se salvează datele...');

            const finalPayload = Object.entries(workSchedules).map(([specialityID, locations]) => ({
                specialityID,
                locations: Object.entries(locations).map(([locationID, schedules]) => ({
                    locationID,
                    schedule: schedules,
                })),
            }));
            const response = await axios.post(`${backendUrl}/api/admin/add-doctor-specialities-locations`, {
                adminID,
                doctorID: doctorData.doctorID,
                schedules: finalPayload,  
                });

            if (response.status === 201) {
                toast.success("Datele au fost salvate cu succes!");
                onCloseSave(); 
            } else {
                toast.error(" Eroare la salvarea datelor!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Eroare la salvarea datelor!");
        } finally {
            setLoading(false);
            setLoadingMessage('');
        }
        };



  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-y-auto">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-5xl max-h-[90%] overflow-y-auto">
        <div className="w-18 h-1 bg-green-600 rounded-full mx-auto mb-4"></div>
        <p className="text-2xl font-semibold text-gray-800 text-center mb-1">
         Asociază specialități, locații și programe de lucru pentru medicul
        </p>
        <p className="text-xl font-semibold text-gray-700 text-center mb-4">
          ~ {doctorData.lastName} {doctorData.firstName} - {doctorData.doctorID} ~
        </p>
        <p className='border-b-1 mb-5'></p>

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

    {/* Afisrea continutului */}
    <div>

        {/* Mesaj informativ */}
        <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-3 rounded-md text-sm text-center mb-4">
        <strong>Notă importantă:</strong> Asociază mai întâi <strong>specialitățile</strong> medicului, apoi selectează <strong>locațiile</strong> unde va activa și configurează <strong>programul de lucru</strong> pentru fiecare locație.  
        <br />
        Pentru o organizare eficientă, programul medicului trebuie să fie în concordanță cu programul locației.  
        <span className="underline">Programul introdus pentru o specialitate nu trebuie să se suprapună cu programele altor specialități.</span>
        </div>

        {/* Select + Buton */}
        <div className="flex gap-2 mb-4 w-full">
            <CustomSelect
                options={options}
                value={specialityToAdd}
                onChange={setSpecialityToAdd}
                placeholder="Selectează specialitatea"
                isClearable
                isDisabled={loading || options.length === 0}
                className="w-full"
                />
            <button
                onClick={handleAddSpeciality}
                disabled={!specialityToAdd}
                className="btn-outline-purple-little"
            >
                <FontAwesomeIcon icon={faAdd} />
                Adaugă
            </button>
        </div>

        
        <div>
            {selectedSpecialities.length === 0 && 
                <div className="min-h-[35px] flex items-center justify-center text-gray-600 italic">
                    Nu ai adăugat nicio specialitate.
                </div>
            }


            {selectedSpecialities.map(spec => {
                // Gasim toate locatiile pentru specialitatea curenta
                const locationsForSpec = specialityLocationData
                    .filter(sl => sl.specialityID === spec.specialityID && sl.isSpecialityActive)
                    .map(sl => locationsData.find(loc => loc.locationID === sl.locationID))
                    .filter(Boolean)
                    .sort((a, b) => a.address.county.localeCompare(b.address.county));

                const selectedLocs = workLocations[spec.specialityID] || [];

                const isExpanded = !!expandedSpecialities[spec.specialityID];
            
                return (
                    <div 
                        key={spec.specialityID} 
                        className="mb-6 border border-gray-300 rounded-lg bg-white shadow-lg p-4">

                        {/* Denumire si butoane */}
                        <div className="flex items-center justify-between gap-4 p-3 bg-green-50 rounded-t-xl shadow-sm mb-3">
                            <span className="font-bold text-xl flex items-center gap-2 text-green-700 ">
                                <FontAwesomeIcon icon={faStethoscope} />
                                {spec.name}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    title="Arată detalii"
                                    onClick={() => toggleSpeciality(spec.specialityID)}
                                    className="btn-outline-green-little-little"
                                >
                                    <FontAwesomeIcon
                                        icon={ faChevronUp }
                                        className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
                                    />
                                </button>
                                <button
                                    title="Șterge specialitate"
                                    className="btn-outline-red-little-little"
                                    onClick={() => handleRemoveSpeciality(spec.specialityID)}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        </div>

                    {/* Liste locatii */}
                    {isExpanded && (
                            <>
                    
                       <p className="mb-6 text-lg font-semibold text-green-800 bg-green-50 border-l-5 border-green-600 pl-5 py-3 rounded-r-md shadow-sm">
                            Alege locația în care medicul își va desfășura activitatea:
                        </p>


                        {/* Lista checkbox-urilor */}
                        {locationsForSpec.length === 0 ? (
                            <p className="text-sm italic text-gray-500">Această specialitate nu este asociată niciunei locații.</p>
                        ) : (
                           <div className="grid grid-cols-1 gap-6 ">
                                {locationsForSpec.map(loc => (
                                    <div 
                                    key={loc.locationID} 
                                    className="border border-gray-300 rounded-lg bg-white shadow-md p-6 transition-shadow hover:shadow-lg border-2 border-green-600"
                                    >
                                    {/* Denumire + Checkbox */}
                                    <div className="flex justify-between items-center ">
                                        <h4 className="font-semibold text-lg text-gray-800 ">
                                        {loc.address.county || 'Nedefinit'} - {loc.clinicName || loc.address_details || loc.locationID} - ({loc.locationID})
                                        </h4>
                                        <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedLocs.includes(loc.locationID)}
                                            onChange={() => toggleWorkLocation(spec.specialityID, loc.locationID)}
                                            className="w-6 h-6 accent-green-600 rounded-md"
                                        />
                                        <span className="ml-2 text-gray-700 select-none font-medium">Alege locația</span>
                                        </label>
                                    </div>

                                    <div className='border-b-2 border-gray-300 p-2'></div>

                                    {selectedLocs.includes(loc.locationID) && (
                                        <div className="grid grid-cols-1 md:grid-cols-[2.7fr_1.3fr] gap-8 mt-5">
                                        
                                            {/* Configurare program medic */}
                                            <div className="bg-green-50 rounded-lg p-5 shadow-inner">
                                            <p className="font-semibold mb-4 text-green-800 text-lg">
                                                <FontAwesomeIcon icon={faCalendarAlt} className='mr-2'/>
                                                Configurează programul de muncă</p>
                                            
                                            {/* Select ziua pe un rand */}
                                            <div className="mb-4">
                                                <label className="block ml-1 text-gray-700 font-medium text-sm" htmlFor={`startTime-${loc.locationID}`}>
                                                    Zi
                                                </label>
                                                <CustomSelect
                                                options={selectOptions.days}
                                                value={tempScheduleInputs?.[spec.specialityID]?.[loc.locationID]?.day || ''}
                                                onChange={val => handleInputChange(spec.specialityID, loc.locationID, 'day', val)}
                                                placeholder="Selectează ziua"
                                                isClearable
                                                className="text-gray-700 w-full"
                                                />
                                            </div>

                                            {/* Orele pe urmatorul rand */}
                                            <div className="grid grid-cols-3 gap-4 items-end mb-3">
                                                {/* Ora inceput */}
                                                <div>
                                                <label className="block ml-1 text-gray-700 font-medium text-sm" htmlFor={`startTime-${loc.locationID}`}>
                                                    Ora început
                                                </label>
                                                <input
                                                    id={`startTime-${loc.locationID}`}
                                                    type="time"
                                                    value={tempScheduleInputs?.[spec.specialityID]?.[loc.locationID]?.startTime || ''}
                                                    onChange={e => handleInputChange(spec.specialityID, loc.locationID, 'startTime', e.target.value)}
                                                    className="border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-green-400 w-full"
                                                    placeholder="Ora început"
                                                />
                                                </div>

                                                {/* Ora final */}
                                                <div>
                                                <label className="block ml-1 text-gray-700 font-medium text-sm" htmlFor={`endTime-${loc.locationID}`}>
                                                    Ora final
                                                </label>
                                                <input
                                                    id={`endTime-${loc.locationID}`}
                                                    type="time"
                                                    value={tempScheduleInputs?.[spec.specialityID]?.[loc.locationID]?.endTime || ''}
                                                    onChange={e => handleInputChange(spec.specialityID, loc.locationID, 'endTime', e.target.value)}
                                                    className="border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-green-400 w-full"
                                                    placeholder="Ora final"
                                                />
                                                </div>

                                                {/* Butonul de adaugare, aliniat in dreapta */}
                                            <div className="flex justify-end">
                                                <button
                                                onClick={() => addWorkSchedule(spec.specialityID, loc.locationID)}
                                                className="btn-outline-green-little px-5 py-2 rounded-md shadow hover:shadow-lg transition"
                                                >
                                                <FontAwesomeIcon icon={faAdd} /> Adaugă 
                                                </button>
                                            </div>
                                            </div>
                                            

                                            {/* Lista programelor adaugate */}
                                            {(workSchedules?.[spec.specialityID]?.[loc.locationID] || []).length === 0 ? (
                                                <p className="italic text-gray-600 mt-4">Nu există programe adăugate pentru această locație.</p>
                                            ) : (
                                                <ul className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-green-100 mt-4">
                                                {(workSchedules[spec.specialityID][loc.locationID] || [])
                                                .sort(sorteazaDupaZi)
                                                .map((prog, idx) => (
                                                    <li
                                                    key={idx}
                                                    className="flex justify-between items-center bg-gray-50 rounded-md p-2 text-semibold border rounded-md"
                                                    >
                                                    <span>{ziuaCorecta(prog.day)}: {prog.startTime} - {prog.endTime}</span>
                                                    <button
                                                        onClick={() => removeWorkSchedule(spec.specialityID, loc.locationID, idx)}
                                                        className="text-red-600 hover:text-red-800 ml-4"
                                                        aria-label="Șterge program"
                                                        title="Șterge program"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} className='text-red-400 font-medium mr-2 hover:text-red-500 hover:cursor-pointer'/>
                                                    </button>
                                                    </li>
                                                ))}
                                                </ul>
                                            )}
                                            </div>


                                            {/* Programul locatiei */}
                                            <div className="bg-gray-50 rounded-lg p-5 shadow-inner ">
                                            <p className="font-semibold mb-4 text-gray-700 text-lg flex items-center justify-center gap-2">
                                                <FontAwesomeIcon icon={faClock} />
                                                Programul locației
                                            </p>
                                            {loc.schedule && loc.schedule.length > 0 ? (
                                                <div className=' flex items-center justify-center'>
                                                <ul className="text-md  text-gray-600 list-disc list-inside max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                                                {loc.schedule
                                                    .sort(sorteazaDupaZi)
                                                    .map((daySchedule, idx) => (
                                                        <li key={idx}>
                                                        {ziuaCorecta(daySchedule.day)}: {daySchedule.startTime} - {daySchedule.endTime}
                                                        </li>
                                                ))}
                                                </ul>
                                                </div>
                                            ) : (
                                                <p className="text-xs italic text-gray-400 text-center">Program indisponibil</p>
                                            )}
                                            </div>

                                        </div>
                                    )}
                                    </div>
                                ))}
                                </div>
                        )}
                    </>)}
                    </div>
                );
            })}
        </div>
    </div>
        </>
        )}

        <p className='border-b-1 mb-5 mt-3'></p>

        <div className="flex justify-center mt-6 gap-3 items-center">
            <button 
                onClick={handleSave} 
                className="btn-outline-green-little flex items-center gap-2 px-5 py-2 rounded"
            >
                <FontAwesomeIcon icon={faCheckToSlot} />
                Finalizează
            </button>

            {/* Buton rotund pentru vizualizare program */}
            <button
                onClick={() => setShowScheduleModal(true)}
                title="Vezi programul medicului"
                className="w-10 h-10 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center shadow-lg transition"
            >
                <FontAwesomeIcon icon={faCalendarAlt} />
            </button>
        </div>
      </div>

    {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto p-6">
             <div className="w-12 h-1 bg-green-600 rounded-full mx-auto mb-3"></div>
            <h2 className="text-xl font-semibold mb-1 text-center">
                Programul medicului 
            </h2>
          
            <p className="text-xl font-semibold text-gray-700 text-center mb-3">
            ~ {doctorData.lastName} {doctorData.firstName} - {doctorData.doctorID} ~
            </p>
             <p className='border-b-1 mb-5'></p>
            


            {selectedSpecialities.length === 0 ? (
                <p className="italic text-center text-gray-600">Nu există specialități adăugate.</p>
            ) : (
                selectedSpecialities.map(spec => {
                const locs = workLocations[spec.specialityID] || [];
                return (
                    <div key={spec.specialityID} className="mb-4 text-center">
                    <h3 className="font-semibold text-green-700 mb-2 text-center">{spec.name}</h3>
                    {locs.length === 0 ? (
                        <p className="italic text-gray-600">Nu există locații selectate pentru această specialitate.</p>
                    ) : (
                        locs.map(locID => {
                        const location = locationsData.find(loc => loc.locationID === locID);
                        const schedules = workSchedules?.[spec.specialityID]?.[locID] || [];
                        return (
                            <div key={locID} className="mb-3 border p-3 rounded shadow-sm bg-green-50">
                            <p className="font-medium mb-1">{location ? `${location.clinicName} - ${location.address.county}` : locID}</p>
                            {schedules.length === 0 ? (
                                <p className="italic text-gray-600">Nu există programe adăugate pentru această locație.</p>
                            ) : (
                                <ul className="list-disc list-inside text-sm">
                                {schedules.map((prog, idx) => (
                                    <li key={idx}>
                                    {ziuaCorecta(prog.day)}: {prog.startTime} - {prog.endTime}
                                    </li>
                                ))}
                                </ul>
                            )}
                            </div>
                        );
                        })
                    )}
                    </div>
                );
                })
            )}

            <p className='border-b-1 mb-5 mt-5'></p>
            <div className="flex justify-center mt-6">
                <button
                onClick={() => setShowScheduleModal(false)}
                className="btn-outline-red-little-little"
                >
                    <FontAwesomeIcon icon={faClose} />
                Închide
                </button>
            </div>
            </div>
        </div>
    )}


        {/* Loader */}
        {loading && <Loader message={loadingMessage} />}
    </div>
  );
};

export default AddDoctor_Info;
