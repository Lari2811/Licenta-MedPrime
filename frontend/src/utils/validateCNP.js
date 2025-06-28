export const validateCNP = (cnp) => {
  if (!/^\d{13}$/.test(cnp)) return "CNP-ul trebuie să aibă exact 13 cifre.";

  const s = parseInt(cnp[0]);
  const yy = parseInt(cnp.slice(1, 3));
  const mm = parseInt(cnp.slice(3, 5));
  const dd = parseInt(cnp.slice(5, 7));
  const jj = parseInt(cnp.slice(7, 9));
  const nnn = parseInt(cnp.slice(9, 12));
  const c = parseInt(cnp[12]);

  if (![1, 2, 5, 6, 7, 8, 9].includes(s)) return "CNP invalid: prima cifră (S) este incorectă.";
  if (mm < 1 || mm > 12) return "CNP invalid: luna (MM) este incorectă.";
  if (dd < 1 || dd > 31) return "CNP invalid: ziua (DD) este incorectă.";
  if (!((jj >= 1 && jj <= 46) || jj === 51 || jj === 52)) return "CNP invalid: codul județului (JJ) este incorect.";

  const controlArray = [2,7,9,1,4,6,3,5,8,2,7,9];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnp[i]) * controlArray[i];
  }
  let rest = sum % 11;
  let controlDigit = rest === 10 ? 1 : rest;
  if (c !== controlDigit) return "CNP invalid: cifra de control (C) nu corespunde.";

  return ""; 
};

export const extractBirthDateAndAge = (cnp) => {
  if (!cnp || cnp.length !== 13) return { birthDate: null, age: null };

  const s = parseInt(cnp[0]);
  const yy = parseInt(cnp.slice(1, 3));
  const mm = parseInt(cnp.slice(3, 5));
  const dd = parseInt(cnp.slice(5, 7));

  let fullYear;
  if (s === 1 || s === 2) fullYear = 1900 + yy;
  else if (s === 5 || s === 6) fullYear = 2000 + yy;
  else if (s === 7 || s === 8 || s === 9) fullYear = 2000 + yy;
  else return { birthDate: null, age: null };

  //  format DD-MM-YYYY
  const birthDateStr = `${String(dd).padStart(2, '0')}-${String(mm).padStart(2, '0')}-${fullYear}`;
  const birthDateISO = `${fullYear}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
  const birthDateObj = new Date(birthDateISO);

  if (birthDateObj.getMonth() + 1 !== mm || birthDateObj.getDate() !== dd) {
    return { birthDate: null, age: null };
  }

  const today = new Date();
  let age = today.getFullYear() - fullYear;
  const m = today.getMonth() - (mm - 1);
  if (m < 0 || (m === 0 && today.getDate() < dd)) age--;

  return { birthDate: birthDateStr, age };
};

