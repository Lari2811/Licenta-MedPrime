import HematologieImage from '../images/hematologie.png';

const Hematologie = {
  speciality: 'Hematologie',
  image: HematologieImage,
  locations: ['București', 'Timișoara', 'Cluj'],
  about: {
    short: 'Hematologia se ocupă cu studiul și tratarea bolilor sângelui și ale organelor hematopoietice.',
    extended: [
      'Hematologia este specialitatea medicală care investighează afecțiunile sângelui, măduvei osoase și sistemului limfatic, incluzând anemiile, leucemiile, trombocitopeniile și tulburările de coagulare.',
      'Consultația hematologică implică evaluarea analizelor de laborator, examinarea clinică și recomandarea unor investigații specifice pentru stabilirea diagnosticului.'
    ],
    whenToGo: [
      'Oboseală persistentă sau slăbiciune nejustificată',
      'Apariția frecventă a vânătăilor sau sângerări anormale',
      'Infecții frecvente',
      'Paloare excesivă a pielii',
      'Inflamații inexplicabile ale ganglionilor limfatici'
    ],
    benefits: [
      'Diagnosticul precis al bolilor de sânge',
      'Monitorizarea pacienților cu afecțiuni hematologice cronice',
      'Tratament personalizat și sprijin interdisciplinar'
    ]
  },
  investigations: [
    {
      name: 'Hemogramă completă',
      description: 'Analiză de bază a sângelui care oferă informații despre celulele roșii, albe și trombocite.',
      duration: '10 minute',
      price: '70 RON',
      availableIn: ['București', 'Timișoara']
    },
    {
      name: 'Frotiu de sânge',
      description: 'Examinare microscopică a unei probe de sânge pentru detectarea anomaliilor celulare.',
      duration: '15 minute',
      price: '90 RON',
      availableIn: ['București']
    },
    {
      name: 'Test de coagulare',
      description: 'Evaluarea timpului necesar pentru coagularea sângelui în vederea identificării tulburărilor de coagulare.',
      duration: '20 minute',
      price: '110 RON',
      availableIn: ['Timișoara']
    },
    {
      name: 'Test feritină',
      description: 'Măsurarea nivelului de feritină pentru evaluarea rezervelor de fier din organism.',
      duration: '15 minute',
      price: '100 RON',
      availableIn: ['București', 'Timișoara']
    }
  ]
};

export default Hematologie;