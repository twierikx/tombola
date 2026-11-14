# Tómbola

Gooi jullie ideeën in de pot. Trek er één. Ga op pad.

**https://twierikx.github.io/tombola/**

Een date-randomizer voor stellen en vriendengroepen, naar een idee van Margot:

- **Kringen** – maak een kring en nodig mensen uit met een link.
- **Geheime ideeën** – niemand ziet wat een ander in de pot stopt tot het getrokken wordt.
- **Eerlijk verdelen** – gelijke kans per persoon, om de beurt, een maximum per persoon, of volledig willekeurig.
- **Verrassingen** – de beheerder bepaalt of iedereen het getrokken idee ziet, of alleen de bedenker.
- **Vast ritme** – optioneel elke week (of om de week, of elke vier weken) automatisch een trekking.
- **Logboek** – wat er getrokken is, wanneer, en hoe het was.
- Nederlands, Engels en Spaans. Werkt op telefoon en desktop.

Zonder account uitproberen: https://twierikx.github.io/tombola/?demo

## Techniek

Statische site (GitHub Pages), geen build-stap. Google-login en opslag via Firebase
(Authentication + Cloud Firestore, gratis Spark-plan).

| Bestand | Wat |
| --- | --- |
| `index.html`, `css/style.css` | pagina en opmaak |
| `js/app.js` | schermen en interactie |
| `js/draw.js` | loting, eerlijkheidsregels en het ritme |
| `js/backend-firebase.js` | Google-login en Firestore |
| `js/backend-demo.js` | demo zonder account (`?demo`) |
| `js/i18n.js` | teksten in drie talen |
| `firestore.rules` | wie wat mag lezen en schrijven |

De titel, notitie en link van een idee staan in een apart document (`secrets`) dat volgens
`firestore.rules` alleen de bedenker kan lezen, tot het idee getrokken of onthuld is.
De regels staan in de Firebase-console onder Firestore → Rules en moeten gelijk zijn aan `firestore.rules`.
