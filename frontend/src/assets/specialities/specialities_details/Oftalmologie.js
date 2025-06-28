import OftalmologieImage from '../images/oftalmologie.png'

const Oftalmologie = {
  speciality: 'Oftalmologie',
  image: OftalmologieImage,
  locations: ['Cluj', 'București'],
  about: {
    short: 'Oftalmologia se ocupă cu sănătatea ochilor și tratarea afecțiunilor vizuale.',
    extended: [
      'Oftalmologia este specialitatea medicală care se ocupă cu prevenirea, diagnosticarea și tratamentul afecțiunilor oculare și ale vederii, inclusiv miopia, glaucomul, cataracta și degenerescența maculară.',
      'Consultația oftalmologică presupune testarea acuității vizuale, examinarea fundului de ochi, măsurarea presiunii intraoculare și, după caz, investigații imagistice specializate.'
    ],
    whenToGo: [
      'Scăderea clarității vederii',
      'Dureri sau disconfort ocular',
      'Roșeață sau secreții oculare',
      'Dificultăți de adaptare la lumină',
      'Monitorizarea unei afecțiuni cunoscute (ex: glaucom)'
    ],
    benefits: [
      'Prevenirea pierderii vederii prin diagnostic precoce',
      'Tratamentul eficient al bolilor oculare cronice',
      'Îmbunătățirea calității vieții prin corectarea vederii'
    ]
  },
  investigations: [
    {
      name: 'Test acuitate vizuală',
      description: 'Evaluarea clarității vederii pentru fiecare ochi.',
      duration: '10 minute',
      price: '50 RON',
      availableIn: ['Cluj', 'București']
    },
    {
      name: 'Examen fund de ochi',
      description: 'Vizualizarea retinei și a nervului optic pentru detectarea bolilor oculare.',
      duration: '15 minute',
      price: '120 RON',
      availableIn: ['Cluj']
    },
    {
      name: 'Tonometrie',
      description: 'Măsurarea presiunii intraoculare pentru diagnosticarea glaucomului.',
      duration: '10 minute',
      price: '80 RON',
      availableIn: ['București']
    },
    {
      name: 'OCT (tomografie retiniană)',
      description: 'Investigație imagistică de înaltă rezoluție a retinei și a nervului optic.',
      duration: '20 minute',
      price: '250 RON',
      availableIn: ['Cluj', 'București']
    }
  ]
};

export default Oftalmologie;