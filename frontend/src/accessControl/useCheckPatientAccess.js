import { useContext, useEffect, useRef } from "react";
import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContex";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import axios from "axios";

export const useCheckPatientAccess = () => {

    

    const { aToken, logout, backendUrl, isAuthReady } = useContext(AppContext);

    const navigate = useNavigate();
    const { patientID } = useParams();
    const hasVerified = useRef(false);

    const logoutTriggered = useRef(false);

    const safeLogout = (message) => {
      const logoutReason = sessionStorage.getItem("logoutReason");

      if (logoutTriggered.current) return;
      logoutTriggered.current = true;

      if (logoutReason === "manual") {
        toast.error("Pacient deconectat!");
      }

      if (logoutReason !== "manual") {
        toast.error(message);
      }

      sessionStorage.removeItem("logoutReason");
      logout();
      navigate("/autentificare");
    };

    const fetchUserDataByID = async (userID) => {
      try {
        const response = await axios.get(`${backendUrl}/api/main/get-user-by-ID/${userID}`);
        if (response.data.success) {
          return response.data.data;
        } else {
          toast.error(response.data.message || 'Userul nu a fost găsit.');
          return null;
        }
      } catch (error) {
        console.error('Eroare API la fetch user:', error);
        toast.error('Eroare la încărcarea userului.');
        return null;
      }
    };

    const performCheck = async () => {
        const localToken = localStorage.getItem("authToken");

        if (!aToken || !localToken || aToken !== localToken) {
            safeLogout("Acces invalid! Te vom deconecta.");
            return;
        }

        try {
            const decoded = jwtDecode(localToken);

            if (decoded.role !== "patient") {
                safeLogout("Acces nepermis. Se revine la autentificare...");
                return;
            }

            if (patientID !== decoded.linkedID ) {
                safeLogout("Acces interzis. ID-ul nu se potrivește cu utilizatorul autentificat.");
                return;
            }

        } catch (err) {
          console.error("Eroare token:", err);
          toast.error("Token invalid sau expirat. Te redirecționăm...");
          setTimeout(() => navigate("/autentificare"), 2500);
        }
    };

    const profileAccess = async () => {

          const localToken = localStorage.getItem("authToken");
          const decoded = jwtDecode(localToken);

          if (window.location.pathname.includes("/completare-profil")) return;

        try {
            const userData = await fetchUserDataByID(decoded.linkedID);
            if (!userData) { toast.error("user dont exist")
              safeLogout("Eroare la verificarea contului. Te vom deconecta.");
              return;
            }

            if (userData.mustCompleteProfile) {
              toast.info("Te rugăm să-ți completezi profilul!");
              navigate(`/profil-pacient/${decoded.linkedID}/completare-profil`);
              return;
            }

        } catch (err) {
          console.error("Eroare profil:", err);
          safeLogout("Eroare la verificarea profilului.");
        }
    };

    useEffect(() => {
        if (!isAuthReady || hasVerified.current) return;
        hasVerified.current = true;

        performCheck();
       
      }, [patientID, aToken, isAuthReady]);
      
      useEffect(() => {
        profileAccess();
      }, [] )

  // Asculta modificarile din alt tab sau manuale
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === "authToken") {
                performCheck();
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);
    
    useEffect(() => {
    if (isAuthReady && aToken === "") {
        safeLogout("Acces invalid! Vei fi deconectat.");
    }
    }, [aToken, isAuthReady, navigate]);

   


    return patientID;

};

const fetchUserDataByID = async (userID) => {
  try {
    const response = await axios.get(`${backendUrl}/api/main/get-user-by-ID/${userID}`);
    if (response.data.success) {
      return response.data.data;  // returnezi direct datele user-ului
    } else {
      toast.error(response.data.message || 'Userul nu a fost găsit.');
      return null;
    }
  } catch (error) {
    console.error('Eroare API la fetch user:', error);
    toast.error('Eroare la încărcarea userului.');
    return null;
  }
};

