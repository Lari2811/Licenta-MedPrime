
export const getStatusLabel = (status) => {
  switch (status) {
    case 'deschis':
      return 'Deschis';
    case 'inchis temporar':
      return 'Închis temporar';
    case 'inchis definitiv':
      return 'Închis definitiv';
    default:
      return status;
  }
};