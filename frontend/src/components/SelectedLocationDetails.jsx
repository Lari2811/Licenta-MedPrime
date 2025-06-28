import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContex";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapLocationDot,
  faCalendarDays,
  faPhone,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { toast } from "react-toastify";
import CustomSelect from "./customSelect";
import LocationMap from "./LocationMap";
import socket from "../socket";

const SelectedLocationDetails = () => {
  const { backendUrl } = useContext(AppContext);

  const [locationsData, setLocationsData] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loadingLocations, setLoadingLocations] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoadingLocations(true);
        const res = await axios.get(`${backendUrl}/api/admin/get-all-locations`);
        const allLocations = res.data.locations || [];

        setLocationsData(allLocations);

        console.log("Locații preluate:", allLocations);

        const options = allLocations.map((loc) => ({
          value: loc.locationID,
          label: loc.clinicName,
        }));

        setLocationOptions(options);
      } catch (error) {
        console.error("Eroare la fetch locații:", error);
        toast.error("Eroare la preluarea locațiilor. Încearcă mai târziu.");
      } finally {
        setLoadingLocations(false);
      }
    };
    fetchLocations();

     socket.on('LOCATION_DELETED', () => {
        console.log('Locațiile s-au actualizat (ștergere)!');
		    toast.info('Date actualizate');
        fetchLocations();
      });

      socket.on('locationAdded', () => {
        console.log('Locațiile s-au actualizat (adăugare)!');
        toast.info('Date actualizate');
        fetchLocations();
      });

      return () => {
        socket.off('locationAdded');
        socket.off('LOCATION_DELETED');
      };
    
  }, [backendUrl]);

  useEffect(() => {
    const found = locationsData.find((loc) => loc.locationID === selectedLocationId);
    setSelectedLocation(found || null);
  }, [selectedLocationId, locationsData]);

   const lat = parseFloat(selectedLocation?.address?.latitude);
  const lng = parseFloat(selectedLocation?.address?.longitude);
  const isValidCoords = !isNaN(lat) && !isNaN(lng);

  return (
    <div className="space-y-6">
      <CustomSelect
        options={locationOptions}
        value={selectedLocationId}
        onChange={(value) => setSelectedLocationId(value)}
        placeholder="Selectează o locație..."
        className="w-full text-sm"
      />

      {/* Detalii locatie */}
      {selectedLocation && (
        <div className="space-y-4 border-t pt-4">
          <h2 className="text-xl font-bold text-purple-700">
            {selectedLocation.clinicName}
          </h2>

          {/* Adresa */}
          <div className="flex items-start">
            <FontAwesomeIcon icon={faMapLocationDot} className="text-purple-600 mt-1 mr-2" />
            <div>
              <strong className="sm:text-lg text-base">Adresă:</strong>
              <p className="text-gray-600">
                {selectedLocation.address?.city} – {selectedLocation.address?.address_details}
              </p>
            </div>
          </div>

          
          {/* Program */}
          <div className="flex items-start">
            <FontAwesomeIcon icon={faCalendarDays} className="text-purple-600 mt-1 mr-2" />
            <div>
              <strong className="sm:text-lg text-medium">Program:</strong>
              <div className="text-gray-600 space-y-1 mt-1">
                {[
                  { key: "luni", label: "Luni" },
                  { key: "marti", label: "Marți" },
                  { key: "miercuri", label: "Miercuri" },
                  { key: "joi", label: "Joi" },
                  { key: "vineri", label: "Vineri" },
                  { key: "sambata", label: "Sâmbătă" },
                  { key: "duminica", label: "Duminică" },
                ].map((day) => {
                  const foundDay = selectedLocation.schedule?.find((d) => d.day === day.key);
                  return (
                    <p key={day.key}>
                      <span className="font-medium">{day.label}:</span>{" "}
                      {foundDay
                        ? `${foundDay.startTime} - ${foundDay.endTime}`
                        : "Închis"}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>


          {/* Telefon */}
          <div className="flex items-start">
            <FontAwesomeIcon icon={faPhone} className="text-purple-600 mt-1 mr-2" />
            <div>
              <strong className="sm:text-lg text-medium">Telefon:</strong>
              <p className="text-gray-600">{selectedLocation.phone}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start">
            <FontAwesomeIcon icon={faEnvelope} className="text-purple-600 mt-1 mr-2" />
            <div>
              <strong className="sm:text-lg text-medium">Email:</strong>
              <p className="text-gray-600">{selectedLocation.email}</p>
            </div>
          </div>

            {/* Harta */}
                  {selectedLocation.address.latitude && selectedLocation.address.longitude && (
                    <div className="mt-6 w-full">
                      <FontAwesomeIcon icon={faMapLocationDot} className="text-purple-600 mr-2" />
                      <strong className="sm:text-xl text-lg">Locație:</strong>
                      
                      {/* Buton deschidere */}
                      {isValidCoords ? (
                        <>
                          <LocationMap lat={lat} lng={lng} label={selectedLocation.clinicName} />
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 text-purple-600 underline hover:text-purple-800 transition btn-outline-green"
                          >
                            Vezi în Google Maps
                          </a>
                        </>
                      ) : (
                        <p className="italic text-gray-500">Coordonatele nu sunt disponibile.</p>
                      )}
                    </div>
                  )}
        </div>
      )}
    </div>
  );
};

export default SelectedLocationDetails;
