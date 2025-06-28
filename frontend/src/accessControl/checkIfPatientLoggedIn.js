import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

export const checkIfPatientLoggedIn = () => {
  try {
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.info("Trebuie să fii autentificat pentru a face o programare.");
      return null;
    }

    const decoded = jwtDecode(token);

    if (decoded.role !== "patient") {
      toast.error("Doar pacienții pot face programări.");
      return null;
    }

    return decoded; // returneaza email, linkedID, role

  } catch (err) {
    console.error("Token invalid:", err);
    toast.error("Token invalid sau expirat.");
    return null;
  }
};
