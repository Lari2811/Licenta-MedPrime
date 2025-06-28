import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan, faCheckCircle, faHourglassHalf, faLock, faUmbrellaBeach } from "@fortawesome/free-solid-svg-icons";


export const statusConfig = {
  activ: {
    text: "Disponibil",
    color: "text-green-500",
    icon: faCheckCircle
  },
  concediu: {
    text: "În concediu",
    color: "text-orange-500",
    icon: faUmbrellaBeach
  },
  "in asteptare": {
    text: "În așteptare",
    color: "text-yellow-500",
    icon: faHourglassHalf
  },
  blocat: {
    text: "Blocat",
    color: "text-red-500",
    icon: faBan
  },
  suspendat: {
    text: "Suspendat",
    color: "text-gray-500",
    icon: faLock
  }
};

