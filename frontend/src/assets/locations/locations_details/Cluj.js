import ClujProfil from '../images/cluj_profil.jpg';
import ClujImage1 from '../images/cluj1.jpg';
import ClujImage2 from '../images/cluj2.jpg';
import ClujImage3 from '../images/cluj3.jpg';

const Cluj = {
  id: 'cluj',
  city: 'Cluj',
  mainAddress: 'Str. Clinicilor nr. 9',
  descriptionShort: 'La MedPrime Cluj ai acces la consultații și investigații rapide într-o locație centrală.',
  descriptionExtended: [
    'Clinica noastră din Cluj oferă servicii complete, într-un mediu prietenos și profesional.',
    'Fie că este vorba despre consultații preventive sau investigații complexe, echipa noastră este pregătită să te ajute.'
  ],
  image_profil: ClujProfil, // imaginea de profil pentru listă
  images: [ClujImage1, ClujImage2, ClujImage3], // imagini pentru carusel
  phone: '+40 264 654 321',
  email: 'cluj@medprime.ro',
  schedule: {
    mondayFriday: '08:00 - 19:00',
    saturday: '08:00 - 13:00',
    sunday: 'Închis'
  },
  acceptsDonations: true,
  mapLink: 'https://maps.google.com/?q=Str.+Clinicilor+nr.+9,+Cluj',
  mapLinkInfo: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2733.0141082294494!2d23.575708376345712!3d46.76461837112507!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47490e86b4e9e967%3A0xd16f94629626d192!2sStr.%20Clinicilor%209%2C%20Cluj-Napoca%20400394!5e0!3m2!1sro!2sro!4v1746009129953!5m2!1sro!2sro",
  facilities: ['Acces persoane cu dizabilități', 'Farmacie în incintă', 'Wi-Fi gratuit']
};

export default Cluj;
