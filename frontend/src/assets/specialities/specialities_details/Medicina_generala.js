import MedicinaGeneralaImage from '../images/medicina_generala.png';

const MedicinaGenerala = {
  speciality: 'Medicină Generală',
  image: MedicinaGeneralaImage,
  locations: ['Timișoara', 'Cluj'],
  about: {
    short: 'Medicina generală oferă îngrijire medicală primară și evaluări generale de sănătate.',
    extended: [
      'Medicina generală este prima linie de contact a pacientului cu sistemul medical, având rolul de a evalua starea generală de sănătate și de a ghida pacientul către alte specialități, dacă este necesar.',
      'Consultația include anamneza, examinarea clinică, măsurători de rutină și recomandări pentru investigații suplimentare sau tratament.'
    ],
    whenToGo: [
      'Control de rutină anual',
      'Simptome nespecifice (oboseală, amețeli, dureri de cap)',
      'Evaluare înaintea unei intervenții medicale',
      'Monitorizarea stării generale de sănătate',
      'Îngrijire preventivă și vaccinări'
    ],
    benefits: [
      'Detecția timpurie a problemelor de sănătate',
      'Ghidare corectă către alte specialități',
      'Consiliere privind stilul de viață sănătos și prevenție'
    ]
  },
  investigations: [
    {
      name: 'Consultație generală',
      description: 'Evaluare clinică de bază pentru stabilirea stării generale de sănătate.',
      duration: '20 minute',
      price: '100 RON',
      availableIn: ['Timișoara', 'Cluj']
    },
    {
      name: 'Analize sânge uzuale',
      description: 'Panel de teste de laborator pentru a detecta eventuale anomalii metabolice sau infecții.',
      duration: '15 minute',
      price: '120 RON',
      availableIn: ['Timișoara']
    },
    {
      name: 'Măsurare tensiune arterială',
      description: 'Verificarea valorilor tensionale pentru diagnosticarea hipertensiunii sau hipotensiunii.',
      duration: '5 minute',
      price: '20 RON',
      availableIn: ['Cluj']
    },
    {
      name: 'Electrocardiogramă (ECG)',
      description: 'Test rapid care înregistrează activitatea electrică a inimii.',
      duration: '15 minute',
      price: '150 RON',
      availableIn: ['Timișoara']
    }
  ]
};

export default MedicinaGenerala;
