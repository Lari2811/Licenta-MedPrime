export const formatStatusApp = (status) => {
  switch (status) {
    case 'activ':
      return 'Activ';

    case 'in asteptare':
      return 'În așteptare'

    case 'confirmata':
      return 'Confirmată'

    case 'blocat':
        return 'Blocat'
      
    case "in desfasurare":
      return "În desfășurare"
      
    case "anulata":
      return "Anulată"

    case "finalizata":
      return  "Finalizată"
       
    default:
      return status;
  }
};