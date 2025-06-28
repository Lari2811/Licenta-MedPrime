# Titlu proiect: MedPrime – Aplicație web pentru gestionarea clinicilor medicale

## Adresa repository-ului GitHub:  https://github.com/Lari2811/Licenta-MedPrime
---

## Descrierea livrabilelor:
- cod sursă complet pentru aplicația web (frontend și backend)
- fișier .gitignore pentru a exclude fișierele binare
- README.md cu instrucțiuni de instalare, rulare și compilare
---

## Aplicații necesare:
- Node.js (v18+) [https://nodejs.org/en/download]
- VS Code [https://code.visualstudio.com/]
- MongoDB Atlas [https://www.mongodb.com/cloud/atlas/register]
- Cloudinary [https://cloudinary.com]
---

## Pașii de compilare:

###Configurare Backend
- deschide folderul "backend" În VS Code
- deschide terminalul
- rulează comanda "npm install"
- rulează comanda "npm run server” pentru a porni aplicația
---

### Configurare Cloudinary
- se crează un cont 
- din Dashboard se copiază CloudName, API Key, API Secret
- în backend, în fișierul .env se lipesc informațiile copiate
---

### Configurare MangoDB
- se crează un cont aici: https://www.mongodb.com/cloud/atlas/register
- se autentifică în site
- se crează un nou proiect ”New Project”
- după creare, se merge în ”Database” și se dă click pe ”Build a Database”
- se selectează M0 și Regiunea apoi se dă click pe ”Create”
- se introduce un username și parolă și se dă click pe ”Create User” apoi pe ”Finish and Close”
- în Network Acces, se dă click pe ”ADD IP ADDRESS” și se introduce 0.0.0.0 apoi se confirmă
- se dă click pe ”Connect” și se selectează ”Compass”
- se copiază string-ul de conectare și se înlocuiește parola cu cea setată mai sus
- în backend, în fișierul .env se lipește string-ul copiat mai sus
---

### Configurare Frontend
- deschide folderul "backend" În VS Code
- deschide terminalul
- rulează comanda "npm install"
- rulează comanda "npm run dev” pentru a porni aplicația
---

### Configurare Cypress (pentru testarea automată)
- în frontend, se deschide un al doilea terminal (în primul terminal rulează aplicația frontend)
- rulează comanda ”npm install cypress --save-dev”
- după instalare rulează comanda ”npx cypress open”
- se va deschide o fereastră 
- se alege ”E2E Testing” apoi ”Electron”
---
