import { faCheckCircle, faClock, faBan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const locationStatusBadge = (status) => {
    switch (status) {
    case "deschis":
      return (
        <span className="flex items-center bg-green-100 px-3 py-1 rounded-full text-green-700 font-medium text-sm sm:text-base">
          <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
          Deschis
        </span>
      );

    case "inchis temporar":
      return (
        <span className="flex items-center bg-yellow-100 px-3 py-1 rounded-full text-yellow-700 font-medium text-sm sm:text-base">
          <FontAwesomeIcon icon={faClock} className="mr-2" />
          Închis temporar
        </span>
      );

    case "inchis definitiv":
      return (
        <span className="flex items-center bg-red-100 px-3 py-1 rounded-full text-red-600 font-medium text-sm sm:text-base">
          <FontAwesomeIcon icon={faBan} className="mr-2" />
          Închis definitiv
        </span>
      );

    default:
      return (
        <span className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-medium text-sm sm:text-base">
          Necunoscut
        </span>
      );
  }
};