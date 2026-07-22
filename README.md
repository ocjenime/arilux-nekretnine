# Arilux Nekretnine — Prodaja stanova u predgradnji

Web prezentacija za prodaju stanova u predgradnji — dio ekosistema [arilux.ba](https://arilux.ba).

**Live:** https://ocjenime.github.io/arilux-nekretnine/

## Sadržaj

- 4 zgrade u ponudi: **Arilux One**, **Arilux Park**, **Arilux Centar**, **Arilux Panorama**
- 102 generisana stana sa cijenama, kvadraturama i statusima (slobodan / rezervisan / prodan)
- Interaktivni finder: filter po zgradi, sobama i budžetu + sortiranje
- Sekcija kupovine u predgradnji (5 koraka + beneficije)
- Kontakt forma (mailto integracija sa info@arilux.ba)
- Dizajn usklađen sa arilux.ba identitetom (#0041B1 / #F26721)

## Tehnologija

Čisti HTML / CSS / JS — bez build koraka i bez zavisnosti. Dovoljno je otvoriti `index.html`.

```
arilux-nekretnine/
├── index.html
└── assets/
    ├── css/styles.css
    ├── js/main.js
    └── img/ (logo, favicon)
```

## Deployment

GitHub Pages — automatski servirano sa `main` grane (root).

## Napomene

- Cijene i dostupnost stanova su demo podaci generisani u `assets/js/main.js` — zamijeniti stvarnim cjenovnikom prije produkcije.
- Kontakt forma šalje upit kroz e-mail klijent korisnika; za produkciju spojiti na backend ili servis (npr. Formspree).
