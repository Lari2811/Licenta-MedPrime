import { useContext, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContex";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import axios from "axios";

const fetchUserDataByID = async (userID, backendUrl) => {
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

export const checkProfileCompletion = async () => {

    const { backendUrl } = useContext(AppContext)

    const navigate = useNavigate();
    
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Token inexistent!");
      return null;
    }

    const decoded = jwtDecode(token);
    const userID = decoded.linkedID;


    const userData = await fetchUserDataByID(userID, backendUrl);
    if (!userData) return false;

    if (userData.mustCompleteProfile) {
        toast.info("Te rugăm să-ți completezi profilul!");
        navigate(`/finishregister/${userID}`);
        return false;
    }

  return true;
};