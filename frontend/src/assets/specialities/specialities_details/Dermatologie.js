import DermatologieImage from '../images/dermatologie.png';

const Dermatologie = {
  speciality: 'Dermatologie',
  image: DermatologieImage,
  locations: ['Cluj', 'București'],
  about: {
    short: 'Dermatologia tratează bolile pielii, părului, unghiilor și ale mucoaselor.',
    extended: [
      'Dermatologia este specialitatea medicală care se ocupă cu diagnosticul și tratamentul afecțiunilor pielii, inclusiv eczeme, acnee, psoriazis, infecții cutanate și boli autoimune dermatologice.',
      'Consultația dermatologică implică examinarea vizuală a pielii, folosirea instrumentelor precum dermatoscopul și, dacă e necesar, recoltarea de probe pentru analize.'
    ],
    whenToGo: [
      'Apariția unor pete sau iritații pe piele',
      'Acnee severă sau persistentă',
      'Alunițe care își schimbă forma sau culoarea',
      'Căderea excesivă a părului',
      'Mâncărimi sau uscăciune severă a pielii'
    ],
    benefits: [
      'Diagnostic rapid pentru afecțiuni cutanate',
      'Tratament personalizat și eficient',
      'Prevenirea complicațiilor dermatologice'
    ]
  },
  investigations: [
    {
      name: 'Dermatoscopie',
      description: 'Examinare neinvazivă a pielii cu un aparat special pentru evaluarea leziunilor pigmentare.',
      duration: '10 minute',
      price: '120 RON',
      availableIn: ['Cluj', 'București']
    },
    {
      name: 'Biopsie cutanată',
      description: 'Prelevarea unei mici porțiuni de piele pentru analiză microscopică.',
      duration: '20 minute',
      price: '250 RON',
      availableIn: ['București']
    },
    {
      name: 'Teste alergologice cutanate',
      description: 'Testare locală pentru identificarea alergenilor care provoacă reacții cutanate.',
      duration: '30-60 minute',
      price: '180 RON',
      availableIn: ['Cluj']
    },
    {
      name: 'Crioterapie',
      description: 'Tratament prin înghețarea leziunilor cutanate cu azot lichid.',
      duration: '15 minute',
      price: '200 RON',
      availableIn: ['Cluj', 'București']
    }
  ]
};

export default Dermatologie;
