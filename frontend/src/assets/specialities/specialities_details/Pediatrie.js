import PediatrieImage from '../images/pediatrie.png';

const Pediatrie = {
  speciality: 'Pediatrie',
  image: PediatrieImage,
  locations: ['Timișoara', 'București'],
  about: {
    short: 'Pediatria se ocupă cu sănătatea și dezvoltarea copiilor, de la naștere până la adolescență.',
    extended: [
      'Pediatria este ramura medicinei care se concentrează pe prevenirea, diagnosticarea și tratamentul bolilor și tulburărilor specifice copilăriei, precum infecțiile frecvente, alergiile, tulburările de dezvoltare sau nutriționale.',
      'Consultația pediatrică include evaluarea stării generale a copilului, monitorizarea dezvoltării, administrarea vaccinurilor și recomandări pentru îngrijirea optimă a celor mici.'
    ],
    whenToGo: [
      'Consult preventiv sau control de rutină',
      'Febră persistentă sau infecții recurente',
      'Întârzieri în dezvoltare',
      'Probleme alimentare sau de somn',
      'Vaccinări obligatorii sau opționale'
    ],
    benefits: [
      'Promovarea unei dezvoltări sănătoase și armonioase',
      'Detecția precoce a eventualelor afecțiuni cronice',
      'Educația părinților privind îngrijirea și nutriția copilului'
    ]
  },
  investigations: [
    {
      name: 'Consultație pediatrică',
      description: 'Evaluare generală a copilului de către medicul pediatru.',
      duration: '20-30 minute',
      price: '150 RON',
      availableIn: ['Timișoara', 'București']
    },
    {
      name: 'Vaccinări',
      description: 'Administrarea vaccinurilor conform calendarului național sau opțional.',
      duration: '10 minute',
      price: 'Gratuit / În funcție de vaccin',
      availableIn: ['Timișoara']
    },
    {
      name: 'Evaluare dezvoltare copil',
      description: 'Monitorizarea dezvoltării fizice, cognitive și emoționale a copilului.',
      duration: '30 minute',
      price: '170 RON',
      availableIn: ['București']
    },
    {
      name: 'Analize sânge copii',
      description: 'Analize uzuale de sânge adaptate pentru copii pentru depistarea anemiilor sau infecțiilor.',
      duration: '15 minute',
      price: '120 RON',
      availableIn: ['Timișoara', 'București']
    }
  ]
};

export default Pediatrie;