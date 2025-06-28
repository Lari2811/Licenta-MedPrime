describe('Înregistrare pacient', () => {
  it('Verifică tratamentul e-mailului deja folosit, parole invalide și crearea unui cont nou valid', () => {
    cy.visit('http://localhost:5173/inregistrare');

    cy.get('input[id="register-last-name"]').type('Popescu');
    cy.get('input[id="register-first-name"]').type('Ion');
    cy.get('input[id="register-email"]').type('larisa@yahoo.com');
    cy.get('input[id="register-password"]').type('PopescuIon');
    cy.get('input[id="confirm-password"]').type('PopescuIon2');
    cy.get('input[id="confirm-password"]').clear().type('PopescuIon');
    cy.get('#terms').check();
    cy.get('button[type="submit"]').click();

    cy.contains('Email-ul este asociat unui alt cont').should('be.visible');

    cy.get('input[id="register-email"]').clear().type('popescuion@yahoo.com');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/completare-profil');
    cy.wait(1000);
  });
});
