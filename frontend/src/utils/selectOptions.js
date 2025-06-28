
export const selectOptions = {

  genderOptions: [
    { value: "masculin", label: "Masculin" },
    { value: "feminin", label: "Feminin" },
    { value: "altul", label: "Altul" },
  ],

  counties: [
    { label: "Alba", value: "Alba" },
    { label: "Arad", value: "Arad" },
    { label: "Argeș", value: "Argeș" },
    { label: "Bacău", value: "Bacău" },
    { label: "Bihor", value: "Bihor" },
    { label: "Bistrița-Năsăud", value: "Bistrița-Năsăud" },
    { label: "Botoșani", value: "Botoșani" },
    { label: "Brașov", value: "Brașov" },
    { label: "Brăila", value: "Brăila" },
    { label: "București", value: "București" },
    { label: "Buzău", value: "Buzău" },
    { label: "Caraș-Severin", value: "Caraș-Severin" },
    { label: "Călărași", value: "Călărași" },
    { label: "Cluj", value: "Cluj" },
    { label: "Constanța", value: "Constanța" },
    { label: "Covasna", value: "Covasna" },
    { label: "Dâmbovița", value: "Dâmbovița" },
    { label: "Dolj", value: "Dolj" },
    { label: "Galați", value: "Galați" },
    { label: "Giurgiu", value: "Giurgiu" },
    { label: "Gorj", value: "Gorj" },
    { label: "Harghita", value: "Harghita" },
    { label: "Hunedoara", value: "Hunedoara" },
    { label: "Ialomița", value: "Ialomița" },
    { label: "Iași", value: "Iași" },
    { label: "Ilfov", value: "Ilfov" },
    { label: "Maramureș", value: "Maramureș" },
    { label: "Mehedinți", value: "Mehedinți" },
    { label: "Mureș", value: "Mureș" },
    { label: "Neamț", value: "Neamț" },
    { label: "Olt", value: "Olt" },
    { label: "Prahova", value: "Prahova" },
    { label: "Satu Mare", value: "Satu Mare" },
    { label: "Sălaj", value: "Sălaj" },
    { label: "Sibiu", value: "Sibiu" },
    { label: "Suceava", value: "Suceava" },
    { label: "Teleorman", value: "Teleorman" },
    { label: "Timiș", value: "Timiș" },
    { label: "Tulcea", value: "Tulcea" },
    { label: "Vâlcea", value: "Vâlcea" },
    { label: "Vaslui", value: "Vaslui" },
    { label: "Vrancea", value: "Vrancea" }
  ],

  days: [
    { value: "luni", label: "Luni" },
    { value: "marti", label: "Marți" },
    { value: "miercuri", label: "Miercuri" },
    { value: "joi", label: "Joi" },
    { value: "vineri", label: "Vineri" },
    { value: "sambata", label: "Sâmbătă" },
    { value: "duminica", label: "Duminică" },
  ],

  professionalFields: [
    { label: "Sănătate", value: "Sănătate" },
    { label: "Educație", value: "Educație" },
    { label: "IT & Software", value: "IT & Software" },
    { label: "Comerț", value: "Comerț" },
    { label: "Construcții", value: "Construcții" },
    { label: "Transport", value: "Transport" },
    { label: "Administrație publică", value: "Administrație publică" },
    { label: "Producție", value: "Producție" },
    { label: "Finanțe", value: "Finanțe" },
    { label: "Altele", value: "Altele" },
  ],

  professionalStatus: [
    { label: "Angajat", value: "angajat" },
    { label: "Șomer", value: "somer" },
    { label: "Student", value: "student" },
    { label: "Elev", value: "elev" },
    { label: "Pensionar", value: "pensionar" },
    { label: "Casnic(ă)", value: "casnic" },
    { label: "Altul", value: "altul" },
  ],

  bloodTypes: [
    { label: "A", value: "A" },
    { label: "B", value: "B" },
    { label: "AB", value: "AB" },
    { label: "0", value: "0" },
    { label: "Nu cunosc", value: "nu cunosc" },
  ],

  bloodTypesRH: [
    { label: "Negativ ( - )", value: "negativ" },
    { label: "Pozitiv ( + )", value: "pozitiv" },
    { label: "Nu cunosc", value: "nu cunosc" },
  ],

  insurance: [
     { label: "CNAS", value: "CNAS" },
     { label: "Privat", value: "privat" },
     { label: "Neasigurat", value: "neasigurat" },
  ],

  requestOptions: [
      { label: "Modificare Date Personale", value: "MODIFICARE_DATE_PERSONALE",  },
      { label: "Modificare locații și program", value: "MODIFICARE_LOCATII_SI_PROGRAM" },
      { label: "Modificare specialitate", value: "MODIFICARE_SPECIALITATE" },
      { label: "Alte Solicitări", value: "ALTE_SOLICITARI",  },
  ],
  
  priorityOptions: [
      { value: "URGENT", label: "Urgent" },
      { value: "NORMAL", label: "Normal" },
      { value: "INFORMATIV", label: "Informativ" },
  ],

  statusLocations: [
    {value: "deschis", label: "Deschis"},
    {value: "inchis temporar", label: "Închis temporar"},
    {value: "inchis definitiv", label: "Închis definitiv"},
  ],

  requiresDoctorOptions: [
    { label: "Da", value: true },
    { label: "Nu", value: false }
  ],

  doctorType: [
    {value: "rezident", label: "Rezident"},
    {value: "specialist", label: "Specialist "},
    {value: "primar", label: "Primar"},
  ]
};
