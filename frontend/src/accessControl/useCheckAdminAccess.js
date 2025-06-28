import { useContext, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContex";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import axios from "axios";


export const useCheckAdminAccess = () => 
  {
  const { aToken, logout, backendUrl, isAuthReady } = useContext(AppContext);
  const navigate = useNavigate();
  const { adminID } = useParams();
  const hasVerified = useRef(false);

  const logoutTriggered = useRef(false); 
  
    const safeLogout = (message) => {
        const logoutReason = sessionStorage.getItem("logoutReason");

        if (logoutTriggered.current) return; 
        logoutTriggered.current = true;

       if (logoutReason === "manual") {
            toast.error("Admin deconectat!"); 
        }

        if (logoutReason !== "manual") {
            toast.error(message); 
        }

        sessionStorage.removeItem("logoutReason");
        logout();
        navigate("/autentificare");
    };

  const performCheck = async () => {
    const localToken = localStorage.getItem("authToken");

    if (!aToken || !localToken || aToken !== localToken) {
      safeLogout("Acces invalid! Te vom deconecta.");
      return;
    }

    try {
      const decoded = jwtDecode(localToken);

      if (decoded.role !== "admin") {
        safeLogout("Acces nepermis. Se revine la autentificare...");
        return;
      }

      if (adminID !== decoded.linkedID) {
       safeLogout("Acces interzis. ID-ul nu se potrivește cu utilizatorul autentificat.")
        return;
      }

    } catch (err) {
      console.error("Eroare token:", err);
      toast.error("Token invalid sau expirat. Te redirecționăm...");
      setTimeout(() => navigate("/autentificare"), 2500);
    }
  };

  useEffect(() => {
    if (!isAuthReady || hasVerified.current) return;
    hasVerified.current = true;
    performCheck();
  }, [adminID, aToken, isAuthReady]);

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
};
