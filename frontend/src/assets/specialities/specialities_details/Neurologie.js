import NeurologieImage from '../images/neurologie.png';

const Neurologie = {
  speciality: 'Neurologie',
  image: NeurologieImage,
  locations: ['Cluj', 'Timișoara'],
  about: {
    short: 'Neurologia studiază bolile sistemului nervos central și periferic, inclusiv creierul și măduva spinării.',
    extended: [
      'Neurologia este ramura medicinei care se ocupă cu diagnosticul și tratamentul afecțiunilor ce afectează creierul, măduva spinării și nervii periferici, precum epilepsia, scleroza multiplă, Parkinson, accidentele vasculare cerebrale și neuropatiile.',
      'Consultația neurologică include evaluarea simptomelor neurologice, testarea reflexelor, investigații imagistice (RMN) sau electroneurofiziologice (EEG, EMG).' 
    ],
    whenToGo: [
      'Dureri de cap persistente sau severe',
      'Amețeli sau pierderi de echilibru',
      'Slăbiciune musculară inexplicabilă',
      'Tulburări de vedere sau vorbire',
      'Convulsii sau crize epileptice'
    ],
    benefits: [
      'Diagnosticarea corectă a tulburărilor neurologice',
      'Tratament personalizat pentru afecțiuni cronice',
      'Reducerea riscului de complicații severe prin intervenție precoce'
    ]
  },
  investigations: [
    {
      name: 'RMN cerebral',
      description: 'Investigație imagistică detaliată a creierului pentru diagnosticarea afecțiunilor neurologice.',
      duration: '30-45 minute',
      price: '400 RON',
      availableIn: ['Cluj']
    },
    {
      name: 'Electroencefalogramă (EEG)',
      description: 'Înregistrează activitatea electrică cerebrală pentru evaluarea funcției creierului.',
      duration: '30 minute',
      price: '250 RON',
      availableIn: ['Timișoara']
    },
    {
      name: 'EMG (Electromiografie)',
      description: 'Măsoară activitatea electrică a mușchilor pentru a evalua funcția nervilor periferici.',
      duration: '30 minute',
      price: '300 RON',
      availableIn: ['Cluj', 'Timișoara']
    },
    {
      name: 'Consult neurologic',
      description: 'Evaluare clinică completă a funcțiilor neurologice.',
      duration: '20-30 minute',
      price: '200 RON',
      availableIn: ['Cluj', 'Timișoara']
    }
  ]
};

export default Neurologie;