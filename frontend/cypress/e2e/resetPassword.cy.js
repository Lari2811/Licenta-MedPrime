describe('Resetare parola pacient în aplicație', () => {
  it("Navighează la pagina Setari și efectuează resetarea parolei", () => {
    cy.visit("http://localhost:5173/autentificare");

    cy.get('input[name="email"]').type('larisa@yahoo.com');
    cy.get('button[id="toggle-password"]').click();
    cy.get('input[name="parola"]').type('Larisa2002');
    cy.get('button[type="submit"]').click();

    cy.wait(3000);
    cy.visit("http://localhost:5173");
    cy.wait(1000);
    
    cy.get('img.rounded-full').trigger('mouseover');
    cy.contains('Setări').click({ force: true });

    cy.url().should('include', '/profil-pacient');
    cy.url().should('include', '/setari');

    cy.get('input[name="currentPassword"]').type('Larisa2002');
    cy.contains('Verifică parola').click();

    cy.contains('Parola actuală este corectă').should('be.visible');

    cy.wait(500);
    cy.get('input[name="newPassword"]').type('Larisa28');
    cy.get('input[name="confirmPassword"]').type('Larisa28');
    cy.wait(500);
    cy.pause();

    cy.contains('Salvează').click();
    cy.contains('Parola a fost actualizată').should('exist');

    cy.get('input[name="currentPassword"]').type('Larisa28');
    cy.contains('Verifică parola').click();
    cy.contains('Parola actuală este corectă').should('be.visible');
    cy.contains('Anulează').click();
  });
});
