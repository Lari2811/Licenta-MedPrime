import {
  faDoorOpen,
  faDoorClosed,
  faTriangleExclamation,
  faQuestionCircle,
  faTools,
} from "@fortawesome/free-solid-svg-icons";

export const formatLocationStatus = (status) => {
  const lower = status?.toLowerCase();

  switch (lower) {
    case "deschis":
      return {
        label: "Deschis",
        color: "text-green-700",
        bg: "bg-green-100",
        icon: faDoorOpen,
      };

    case "inchis temporar":
      return {
        label: "Închis temporar",
        color: "text-orange-700",
        bg: "bg-orange-100",
        icon: faDoorClosed,
      };

    case "inchis definitiv":
      return {
        label: "Închis definitiv",
        color: "text-red-700",
        bg: "bg-red-100",
        icon: faTriangleExclamation,
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
