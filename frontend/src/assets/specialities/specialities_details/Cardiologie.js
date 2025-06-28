import CardiologieImage from '../images/cardiologie.png';

const Cardiologie = {
    speciality: 'Cardiologie',
    image: CardiologieImage,
    locations: ['Timișoara', 'Cluj', 'București'],
    about: {
      short: 'Cardiologia se ocupă cu diagnosticarea și tratarea afecțiunilor inimii și vaselor de sânge.',
      extended: [
        'Cardiologia este o ramură esențială a medicinei care se concentrează pe prevenirea, diagnosticarea și tratarea bolilor cardiovasculare.',
        'Consultația cardiologică implică evaluarea simptomelor, examinarea fizică, testele non-invazive și recomandări pentru tratament sau stil de viață.'
      ],
      whenToGo: [
        'Palpitații',
        'Durere în piept',
        'Amețeli',
        'Oboseală inexplicabilă',
        'Tensiune arterială crescută'
      ],
      benefits: [
        'Depistarea precoce a bolilor de inimă',
        'Monitorizarea pacienților cu afecțiuni cronice',
        'Optimizarea tratamentului și prevenirea complicațiilor'
      ]
    },
    investigations: [
      {
        name: 'Electrocardiogramă (ECG)',
        description: 'Înregistrează activitatea electrică a inimii și ajută la detectarea aritmiilor.',
        duration: '15 minute',
        price: '150 RON',
        availableIn: ['Timișoara', 'Cluj']
      },
      {
        name: 'Ecocardiografie',
        description: 'Evaluare cu ultrasunete a inimii pentru a analiza structura și funcția sa.',
        duration: '20-30 minute',
        price: '200 RON',
        availableIn: ['București']
      },
      {
        name: 'Test de efort',
        description: 'Monitorizarea inimii în timpul efortului fizic pentru a detecta ischemia miocardică.',
        duration: '30 minute',
        price: '250 RON',
        availableIn: ['Cluj']
      },
      {
        name: 'Holter ECG',
        description: 'Înregistrare continuă a activității cardiace timp de 24-48 de ore.',
        duration: '24-48 ore',
        price: '300 RON',
        availableIn: ['Timișoara', 'București']
      }
    ]
  };
  
  export default Cardiologie;
  