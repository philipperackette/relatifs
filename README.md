[![CI](https://github.com/philipperackette/relatifs/actions/workflows/ci.yml/badge.svg)](https://github.com/philipperackette/relatifs/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

# Relatifs — Calcul interactif sur les nombres relatifs

> **Démo en ligne / Live demo:** https://philipperackette.github.io/relatifs/

## Français

Application web interactive pour travailler les **additions et soustractions d'entiers relatifs** au collège, avec visualisation, génération d'exercices et diagnostic d'erreurs.

### Modules disponibles

#### Un seul calcul
Tracer sur une **droite graduée** l'addition ou la soustraction d'entiers relatifs.

#### Plusieurs calculs
Générer une série d'exercices avec une **amplitude réglable**, puis afficher la correction.

#### Je réponds & diagnostic
Saisir une réponse, obtenir une correction automatique et un **diagnostic d'erreur probable**.

### Utilisation

#### En ligne
Ouvrir directement :
https://philipperackette.github.io/relatifs/

#### En local

```bash
git clone https://github.com/philipperackette/relatifs.git
cd relatifs
# Ouvrir index.html dans un navigateur
```

### Public visé

- élèves de collège,
- enseignants de mathématiques,
- remédiation sur les nombres relatifs.

---

## English

Interactive web application for practicing **addition and subtraction of signed integers**, with visualization, exercise generation, and error diagnosis.

### Available modules

#### Single calculation
Display an addition or subtraction on a **number line**.

#### Multiple calculations
Generate a series of exercises with adjustable range, then display the correction.

#### Answer & diagnosis
Enter an answer, get automatic correction, and receive a **probable error diagnosis**.

### Usage

#### Online
Open directly:
https://philipperackette.github.io/relatifs/

#### Local

```bash
git clone https://github.com/philipperackette/relatifs.git
cd relatifs
# Open index.html in a browser
```

### Intended audience

- middle school students,
- mathematics teachers,
- remediation activities on signed numbers.

---

## Vérifications automatiques / Automated checks

À chaque push et pull request, GitHub Actions lance ESLint et HTMLHint sur `index.html`, puis des tests Playwright des trois modules dans Chromium (écran d’ordinateur et de téléphone). Le site n’a toujours aucune dépendance : `package.json` ne sert qu’à ces vérifications.  
On every push and pull request, GitHub Actions runs ESLint and HTMLHint on `index.html`, then Playwright tests of the three modules in Chromium (desktop and phone screens). The site itself still has no dependencies: `package.json` is only used for these checks.

```bash
npm ci
npm run lint
npx playwright install chromium
npm test
```

---

## Licence / License

Ce projet est distribué sous licence [MIT](LICENSE).  
This project is distributed under the [MIT License](LICENSE).
