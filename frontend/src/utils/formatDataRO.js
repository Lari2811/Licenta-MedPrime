export const formatDateRo = (isoDate) => {
  if (!isoDate) return '–';

  const date = new Date(isoDate);
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    
    timeZone: 'Europe/Bucharest',
  };

  return new Intl.DateTimeFormat('ro-RO', options).format(date).replace(',', '');
};

export const formatDate = (isoDate) => {
  if (!isoDate) return '–';

  const date = new Date(isoDate);
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Europe/Bucharest',
  };

  return new Intl.DateTimeFormat('ro-RO', options).format(date);
};
