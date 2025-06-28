import BucurestiProfil from '../images/bucuresti_profil.jpg';
import BucurestiImage1 from '../images/bucuresti1.jpg';
import BucurestiImage2 from '../images/bucuresti2.jpg';
import BucurestiImage3 from '../images/bucuresti3.jpg';

const Bucuresti = {
  id: 'bucuresti',
  city: 'București',
  mainAddress: 'Str. Mihai Eminescu nr. 11',
  descriptionShort: 'MedPrime București combină tehnologia medicală modernă cu empatia față de pacient.',
  descriptionExtended: [
    'În inima capitalei, clinica oferă servicii medicale integrate pentru toate vârstele.',
    'Te așteptăm cu echipe de specialiști și aparatură de ultimă generație, pregătite să răspundă oricărei nevoi medicale.'
  ],
  image_profil: BucurestiProfil, // imaginea principală pentru listă/card
  images: [BucurestiImage1, BucurestiImage2, BucurestiImage3], // imagini pentru carusel
  phone: '+40 21 789 1234',
  email: 'bucuresti@medprime.ro',
  schedule: {
    mondayFriday: '08:00 - 21:00',
    saturday: '09:00 - 15:00',
    sunday: 'Închis'
  },
  acceptsDonations: false,
  mapLink: 'https://maps.google.com/?q=Str.+Mihai+Eminescu+nr.+11,+București',
  mapLinkInfo: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2848.3189265581136!2d26.097156076219044!3d44.44713117107566!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40b1ff4d9c853b51%3A0x89e68ca0cd5ea12a!2sStrada%20Mihai%20Eminescu%2011%2C%20Bucure%C8%99ti%20030167!5e0!3m2!1sro!2sro!4v1746008945216!5m2!1sro!2sro" ,
  facilities: ['Parcare gratuită', 'Acces lift', 'Wi-Fi gratuit']
};

export default Bucuresti;
