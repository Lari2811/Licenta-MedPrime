import EndocrinologieImage from '../images/endocrinologie.png';

const Endocrinologie = {
  speciality: 'Endocrinologie',
  image: EndocrinologieImage,
  locations: ['Timișoara', 'Cluj'],
  about: {
    short: 'Endocrinologia se ocupă cu diagnosticul și tratamentul afecțiunilor hormonale și ale glandelor endocrine.',
    extended: [
      'Endocrinologia este ramura medicinei care se ocupă cu tulburările hormonale și bolile sistemului endocrin, precum diabetul, hipotiroidismul, sindromul Cushing și tulburările tiroidiene.',
      'Consultația endocrinologică presupune analizarea simptomelor clinice, investigații hormonale și imagistice, precum și recomandarea unui plan personalizat de tratament.'
    ],
    whenToGo: [
      'Creștere în greutate inexplicabilă',
      'Oboseală cronică',
      'Tulburări menstruale',
      'Sensibilitate la frig sau căldură',
      'Transpirații excesive sau tremur'
    ],
    benefits: [
      'Depistarea timpurie a dezechilibrelor hormonale',
      'Tratament eficient pentru boli endocrine cronice',
      'Îmbunătățirea calității vieții pacienților cu afecțiuni hormonale'
    ]
  },
  investigations: [
    {
      name: 'Analize hormonale (TSH, FT4)',
      description: 'Evaluarea nivelului hormonilor tiroidieni și hipofizari pentru diagnosticarea dezechilibrelor endocrine.',
      duration: '15 minute',
      price: '100 RON',
      availableIn: ['Timișoara', 'Cluj']
    },
    {
      name: 'Ecografie tiroidiană',
      description: 'Investigație imagistică non-invazivă pentru evaluarea glandei tiroide.',
      duration: '20 minute',
      price: '180 RON',
      availableIn: ['Cluj']
    },
    {
      name: 'Test toleranță la glucoză',
      description: 'Evaluarea răspunsului organismului la glucoză pentru diagnosticarea diabetului sau a rezistenței la insulină.',
      duration: '2 ore',
      price: '150 RON',
      availableIn: ['Timișoara']
    },
    {
      name: 'RMN hipofizar',
      description: 'Investigație imagistică detaliată a glandei hipofize pentru depistarea formațiunilor sau tulburărilor hormonale.',
      duration: '30 minute',
      price: '500 RON',
      availableIn: ['Cluj']
    }
  ]
};

export default Endocrinologie;