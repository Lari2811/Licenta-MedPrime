describe('Autentificare utilizator', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/autentificare');
  }); 

  it('Autentificare reușită pacient - cu profil complet', () => {
    cy.get('input[name="email"]').type('larisa@yahoo.com');
    cy.get('button[id="toggle-password"]').click();
    cy.get('input[name="parola"]').type('Larisa28');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/profil-pacient'); 
    cy.url().should('include', '/informatii-personale');
    cy.contains('Profilul meu'); 
    cy.wait(2000);
  });

  it('Autentificare reușită pacient - parolă incorectă apoi profil incomplet', () => {
    cy.get('input[name="email"]').type('davidlavinia@yahoo.com');
    cy.get('input[name="parola"]').type('DavidLaviniaG');
    cy.get('button[type="submit"]').click();

    cy.contains('Email sau parolă incorectă').should('be.visible');
    cy.wait(500);

    cy.get('button[id="toggle-password"]').click();
    cy.get('input[name="parola"]').clear().type('DavidLavinia');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/profil-pacient'); 
    cy.url().should('include', '/completare-profil');
    cy.contains('Completează fiecare secțiune pentru a continua');
    cy.wait(2000);
  });


  it('Autentificare reușită medic - profil complet', () => {
    cy.get('input[name="email"]').type('popescu.andrei.medic@medprime.com');
    cy.get('input[name="parola"]').type('PopAM1');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/profil-medic');
    cy.url().should('include', 'dashboard');
    cy.contains('Profilul Medicului');
    cy.wait(2000);
  });

  it('Autentificare reușită medic - profil incomplet', () => {
    cy.get('input[name="email"]').type('georgescu.elena.medic@medprime.com');
    cy.get('input[name="parola"]').type('GeorgescuElenaMedic', { log: false });
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/completare-profil');
    cy.contains('Vă rugăm să completați profilul dumneavostră');
    cy.wait(2000);
  });

  it('Autentificare reușită administrator', () => {
    cy.get('input[name="email"]').type('admin.larisa@medprime.ro');
    cy.get('input[name="parola"]').type('AdminLari');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/admin');
    cy.url().should('include', '/dashboard');
    cy.wait(2000);
  });
});
