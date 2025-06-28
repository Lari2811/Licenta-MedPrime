import TimisoaraProfil from '../images/timisoara_profil.jpg';
import TimisoaraImage1 from '../images/timisoara1.jpg';
import TimisoaraImage2 from '../images/timisoara2.jpg';
import TimisoaraImage3 from '../images/timisoara3.jpg';

const Timisoara = {
  id: 'timisoara',
  city: 'Timișoara',
  mainAddress: 'Str. General Ion Dragalina nr. 7',
  descriptionShort: 'Clinica MedPrime Timișoara oferă servicii integrate într-un spațiu modern și prietenos.',
  descriptionExtended: [
    'Situată central, clinica din Timișoara prioritizează diagnosticarea rapidă și tratamentele personalizate.',
    'Echipamente moderne, cabinete confortabile și echipe de specialiști pregătite pentru orice nevoie medicală.'
  ],
  image_profil: TimisoaraProfil, // <--- imagine de profil pentru listă / header
  images: [TimisoaraImage1, TimisoaraImage2, TimisoaraImage3], // <--- imagini pentru carusel
  phone: '+40 256 123 456',
  email: 'timisoara@medprime.ro',
  schedule: {
    mondayFriday: '08:00 - 20:00',
    saturday: '08:00 - 14:00',
    sunday: 'Închis'
  },
  acceptsDonations: true,
  mapLink: 'https://maps.google.com/?q=Str.+General+Ion+Dragalina+nr.+7,+Timișoara',
  mapLinkInfo: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2784.360461611512!2d21.20923637628938!3d45.74391907107996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47455d7151e381d9%3A0x5c0163a45e522b6b!2sBulevardul%20General%20Ion%20Dragalina%207%2C%20Timi%C8%99oara%20300425!5e0!3m2!1sro!2sro!4v1746009011214!5m2!1sro!2sro",
  facilities: ['Parcare gratuită', 'Acces persoane cu dizabilități', 'Wi-Fi gratuit']
};

export default Timisoara;
