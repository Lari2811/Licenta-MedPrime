import {
  faCircleCheck,
  faClock,
  faBan,
  faCirclePause,
  faUmbrellaBeach,
  faLock
} from "@fortawesome/free-solid-svg-icons";

export const formatStatusDoctor = (status) => {
  const lowerStatus = status?.toLowerCase();

  switch (lowerStatus) {
    case "activ":
      return {
        label: "Activ",
        color: "text-green-700",
        bgColor: "bg-green-100",
        icon: faCircleCheck,
      };
    case "concediu":
      return {
        label: "Concediu",
        color: "text-blue-700",
        bgColor: "bg-blue-100",
        icon: faUmbrellaBeach,
      };
    case "in asteptare":
      return {
        label: "În așteptare",
        color: "text-yellow-700",
        bgColor: "bg-yellow-100",
        icon: faClock,
      };
    case "blocat":
      return {
        label: "Blocat",
        color: "text-red-700",
        bgColor: "bg-red-100",
        icon: faLock,
      };
    case "suspendat":
      return {
        label: "Suspendat",
        color: "text-gray-600",
        bgColor: "bg-gray-200",
        icon: faCirclePause,
      };
    default:
      return {
        label: "Necunoscut",
        color: "text-gray-400",
        bgColor: "bg-gray-100",
        icon: faBan,
      };
  }
};
