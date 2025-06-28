import { faCircleCheck, faClock, faBan, faCirclePause } from "@fortawesome/free-solid-svg-icons";

export const formatStatus = (status) => {
  const lowerStatus = status?.toLowerCase();

  switch (lowerStatus) {
    case "activ":
      return {
        label: "Activ",
        color: "text-green-700",
        bgColor: "bg-green-100",
        icon: faCircleCheck,
      };
    case "in asteptare":
      return {
        label: "În așteptare",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        icon: faClock,
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
        icon: faCirclePause,
      };
  }
};
