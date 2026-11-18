# Interaktiv fysiksimulering: Densitet

Detta projekt är en interaktiv webbläsarillustration av densitet för gymnasiefysik.

## Översikt

Illustrationen visar:

- en glasbägare med mätskala på en våg med skala
- olika vätskor i bägaren: vatten, etanol och kvicksilver
- föremål: badboll, sten, träbit, blykula, guldkula

Varje vätska och föremål har en egen knapp. Tryck för att lägga vätskan eller föremålet i bägaren; tryck på samma knapp igen för att ta bort det. En vätska och ett föremål kan vara i bägaren åt gången. Föremålet kan också läggas i en tom bägare. Vågens massa och den undanträngda volymen uppdateras medan föremålet flyter eller sjunker.

## Funktioner

- Lägg till eller ta bort vätska med respektive vätskeknapp
- Lägg till eller ta bort föremål med respektive föremålsknapp
- Visa ett föremål ensamt i en tom bägare
- Visa massan direkt på vågens display
- Visa volymen i bägaren kontinuerligt
- Visa volymskalan tydligt direkt på bägaren
- Gradera skalan med stora streck var 100 mL och fem mindre streck mellan dem
- Återställ till tom bägare och föremål och vätskor vid sidan om
- Förklara modellens antaganden

## Fysikmodell

Modellen använder SI-enheter och konstant tyngdacceleration `g = 9,82 m/s²`. Vågen visar vätskans och föremålets sammanlagda massa. Volymavläsningen följer vätskenivån och påverkas av undanträngning. Utan vätska visas 0 mL även om ett föremål står ensamt i bägaren.

Rörelsen i vätskan beskrivs av Arkimedes princip. Föremålets läge animeras beroende på dess densitet i förhållande till vätskans. Modellen förenklar föremålens geometri och visar inte stänk, överrinning eller luftmotstånd.

Se [physics.js](./physics.js) för beräkningsfunktionerna och [content.json](./content.json) för undervisningstexter och etiketter.

## Filstruktur

Projektet använder vanliga HTML-, CSS- och JavaScript-filer utan ramverk, byggsteg eller backend. Relativa sökvägar gör det möjligt att publicera webbplatsen på GitHub Pages.

```text
density/
├── README.md
├── content.json
├── physics.js
├── index.html
├── ui.js
└── styles.css
```

Öppna `index.html` via en lokal webbserver för att prova sidan. För fysikmodellen och innehållet, se [physics.js](./physics.js) och [content.json](./content.json).

## Syfte

Projektet är tänkt som en pedagogisk visualisering för undervisning i fysik, där användaren kan se kopplingen mellan matematiska modeller och verkligt beteende i rörelse.

## Licens

Detta projekt är avsett för utbildning och experimentering. Lägg till en licens om du vill dela projektet offentligt.
