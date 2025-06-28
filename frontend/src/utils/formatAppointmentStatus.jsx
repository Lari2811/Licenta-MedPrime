import {
  faClock,
  faCheckCircle,
  faPlayCircle,
  faTimesCircle,
  faFlagCheckered,
  faQuestionCircle
} from "@fortawesome/free-solid-svg-icons";

export const formatAppointmentStatus = (status) => {
  const lowerStatus = status?.toLowerCase();

  switch (lowerStatus) {
    case "în așteptare":
    case "in asteptare":
      return {
        label: "În așteptare",
        color: "text-yellow-700",
        bg: "bg-yellow-100",
        icon: faClock,
      };
    case "confirmată":
    case "confirmata":
      return {
        label: "Confirmată",
        color: "text-blue-700",
        bg: "bg-blue-100",
        icon: faCheckCircle,
      };
    case "în desfășurare":
    case "in desfasurare":
      return {
        label: "În desfășurare",
        color: "text-purple-700",
        bg: "bg-purple-100",
        icon: faPlayCircle,
      };
    case "anulată":
    case "anulata":
      return {
        label: "Anulată",
        color: "text-red-700",
        bg: "bg-red-100",
        icon: faTimesCircle,
      };
    case "finalizată":
    case "finalizata":
      return {
        label: "Finalizată",
        color: "text-green-700",
        bg: "bg-green-100",
        icon: faFlagCheckered,
      };
    default:
      return {
        label: "Necunoscut",
        color: "text-gray-600",
        bg: "bg-gray-200",
        icon: faQuestionCircle,
      };
  }
};
