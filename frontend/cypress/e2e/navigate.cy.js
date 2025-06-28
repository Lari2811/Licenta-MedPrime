describe('Navigare în aplicație', () => {
    it("Navighează de pe pagina Acasă până la pagina unui medic", () => {
        cy.visit("http://localhost:5173");

        cy.contains('LOCAŢII').click();
        cy.contains('button', 'Vezi detalii').first().click();cy.wait(2000);
        cy.contains('button', 'Echipa medicală').click();cy.wait(2000);

        cy.get('input[name="searchDoctor"]').type('Stoica');cy.wait(2000);

        cy.contains('button', 'Vezi profil').first().click();cy.wait(2000);
        cy.contains('button', 'Program').click();cy.wait(2000);

        cy.url().should("include", "/medici/");
    });
})