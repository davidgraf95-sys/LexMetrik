# Kantonale Handelsregisterämter — Adressdossier aller 26 Kantone

**Erstellt:** 7.6.2026 (Auftrag David: Adressen aller 26 kantonalen
Handelsregisterämter recherchieren und geordnet ablegen). **Recherche:**
Web-Sweep über die amtlichen kantonalen *.ch-Seiten; jede Adresse von der
jeweiligen kantonalen Behördenseite (Kontakt-/Standortseite des HR-Amts)
abgerufen am 7.6.2026.
**Status: ERSTRECHERCHE (einfach belegt).** Fachliche Abnahme David ausstehend.

## 1. Quelle + Stand

**Primärquelle (Verzeichnis):** Das Eidgenössische Amt für das Handelsregister
(EHRA, beim BJ) führt die Oberaufsicht über die kantonale
Handelsregisterführung; das amtliche Behördenverzeichnis liegt hinter
zefix.admin.ch. Die maschinelle Primärquelle
`https://www.zefix.admin.ch/ZefixPublicREST/api/v1/registryOffices` ist am
7.6.2026 **nicht offen erreichbar** (HTTP 401 — Endpoint verlangt einen
API-Schlüssel/Registrierung); die zefix-SPA ist JS-gerendert und liefert per
Abruf keine Adressliste. Die EHRA-Seite
`https://www.bj.admin.ch/bj/de/home/wirtschaft/handelsregister/zustaendigkeiten.html`
trägt nur Fliesstext, keine Adresstabelle.
→ **Verwendete Primärquelle daher (CLAUDE.md-Fallback): die amtlichen
kantonalen Behördenseiten** (*.ch-Domain des jeweiligen Kantons bzw. des
HR-Amts). URL + Abrufdatum je Eintrag in der Tabelle.

**Abrufdatum aller Einträge:** 7.6.2026.

## 2. Stammdaten-Tabelle (deterministisch: Kanton → Amt + Adresse)

Geführt wird je Kanton der **Hauptsitz** des Handelsregisteramts. Kantone mit
mehreren Standorten/Bezirksämtern sind in Abschnitt 3 offengelegt.

| Kt. | Amt (amtliche Bezeichnung) | Strasse | PLZ/Ort | Telefon | E-Mail | Website (geprüft 7.6.2026) |
|---|---|---|---|---|---|---|
| ZH | Handelsregisteramt des Kantons Zürich | Schöntalstrasse 5, Postfach | 8022 Zürich | +41 43 259 74 00 | kanzlei.hra@ji.zh.ch | https://www.zh.ch/de/direktion-der-justiz-und-des-innern/handelsregisteramt.html |
| BE | Handelsregisteramt des Kantons Bern | Poststrasse 25 | 3071 Ostermundigen | +41 31 633 43 60 | hrabe@be.ch | https://www.hra.dij.be.ch/ |
| LU | Handelsregister des Kantons Luzern | Bundesplatz 14 | 6002 Luzern | +41 41 228 58 16 | (Kontaktformular) | https://handelsregister.lu.ch/ |
| UR | Handelsregisteramt des Kantons Uri | Bahnhofstrasse 1 | 6460 Altdorf | +41 41 875 22 72 | hra@ur.ch | https://www.ur.ch/dienstleistungen/3349 |
| SZ | Handelsregister des Kantons Schwyz (Amt für Wirtschaft) | Bahnhofstrasse 15, Postfach 1185 | 6431 Schwyz | +41 41 819 16 50 | handelsregister@sz.ch | https://www.sz.ch/behoerden/verwaltung/volkswirtschaftsdepartement/amt-fuer-wirtschaft/handelsregister.html/8756-8758-8802-10373-10943-10947 |
| OW | Handelsregister des Kantons Obwalden (Volkswirtschaftsamt) | St. Antonistrasse 4 | 6060 Sarnen | +41 41 666 62 21 | hra@ow.ch | https://www.ow.ch/fachbereiche/1876 |
| NW | Handelsregisteramt des Kantons Nidwalden | Stansstaderstrasse 54, Postfach 1251 | 6371 Stans | +41 41 618 76 90 | handelsregister@nw.ch | https://www.nw.ch/hregamt/316 |
| GL | Handelsregister des Kantons Glarus (Dep. Volkswirtschaft und Inneres) | Zwinglistrasse 6 | 8750 Glarus | +41 55 646 66 30 | hra@gl.ch | https://www.gl.ch/verwaltung/volkswirtschaft-und-inneres/wirtschaft-und-arbeit/handelsregister.html/1038 |
| ZG | Handelsregisteramt des Kantons Zug | Industriestrasse 24 | 6300 Zug | +41 41 594 55 60 | contact.hra@zg.ch | https://zg.ch/de/wirtschaft-arbeit/handelsregister |
| FR | Service du registre du commerce (SRC) / Handelsregisteramt | Boulevard de Pérolles 25, Case postale | 1701 Fribourg | +41 26 305 30 90 | (via fr.ch/src/contact) | https://www.fr.ch/deef/src |
| SO | Kantonales Handelsregisteramt Solothurn | Schmelzihof, Wengimattstrasse 2 | 4710 Klus-Balsthal | +41 62 311 90 51 | hr@fd.so.ch | https://so.ch/verwaltung/finanzdepartement/kantonales-handelsregister/ |
| BS | Handelsregisteramt Basel-Stadt | Postfach (Schalter: Claramattweg 8) | 4001 Basel | +41 61 267 44 55 | info.hra@jsd.bs.ch | https://www.bs.ch/jsd/zentraler-rechtsdienst/handelsregisteramt |
| BL | Handelsregisteramt Basel-Landschaft (Zivilrechtsverwaltung) | Domplatz 13 (Eingang Domplatz 9), Postfach | 4144 Arlesheim | +41 61 552 46 80 | handelsregister@bl.ch | https://oslvb.bl.ch/Behoerdengang/213 |
| SH | Handelsregisteramt des Kantons Schaffhausen | Mühlentalstrasse 105 | 8200 Schaffhausen | +41 52 632 72 22 | handelsregisteramt@ktsh.ch | https://sh.ch/CMS/Webseite/Kanton-Schaffhausen/Beh-rde/Verwaltung/Volkswirtschaftsdepartement/Handelsregisteramt-3872-DE.html |
| AR | Handelsregister Appenzell Ausserrhoden (Amt für Wirtschaft und Arbeit) | Obstmarkt 3, Postfach | 9102 Herisau | +41 71 353 61 11 | handelsregister@ar.ch | https://ar.ch/verwaltung/departement-bau-und-volkswirtschaft/amt-fuer-wirtschaft-und-arbeit/handelsregister/ |
| AI | Handelsregisteramt des Kantons Appenzell Innerrhoden | Marktgasse 2 | 9050 Appenzell | +41 71 788 96 66 | (via ai.ch-Kontakt) | https://www.ai.ch/verwaltung/volkwirtschaftsdepartement/handelsregisteramt |
| SG | Amt für Handelsregister und Notariate (Hauptsitz) | Davidstrasse 27 | 9001 St. Gallen | +41 58 229 37 24 | info.afhn@sg.ch | https://www.sg.ch/recht/handelsregister-notariate/standorte/hauptsitz-st-gallen.html |
| GR | Grundbuchinspektorat und Handelsregister (GIHA) | Ringstrasse 10 | 7001 Chur | +41 81 257 24 85 | info@giha.gr.ch | https://www.gr.ch/DE/institutionen/verwaltung/dvs/giha/handelsregister/Seiten/handelsregister.aspx |
| AG | Handelsregisteramt des Kantons Aargau | Bahnhofplatz 3c | 5001 Aarau | +41 62 835 14 80 | info.hra@ag.ch | https://www.ag.ch/de/themen/wirtschaft-arbeit/handelsregister |
| TG | Amt für Handelsregister und Zivilstandswesen | Bahnhofplatz 65 | 8510 Frauenfeld | +41 58 345 70 70 | (via hz.tg.ch) | https://hz.tg.ch/handelsregister.html/3164 |
| TI | Ufficio del registro di commercio | Via Tognola 7 | 6710 Biasca | +41 91 816 29 81 | di-rc@ti.ch | https://www4.ti.ch/di/dg/rf/contatti/ufficio-del-registro-di-commercio |
| VD | Office cantonal du registre du commerce (OJV) | Rue de la Grenade 38, Case postale | 1510 Moudon | +41 21 557 81 21 | info.rc@vd.ch | https://www.vd.ch/ojv/office-cantonal-du-registre-du-commerce |
| VS | Registre du commerce du Valais central (2e arrondissement) | Place du Midi 30 | 1951 Sion | +41 27 322 92 05 | rdc.vc@admin.vs.ch | https://www.vs.ch/web/ext-rc/contacts |
| NE | Office du registre du commerce | Rue de Tivoli 5, Case postale 1 | 2002 Neuchâtel 2 | +41 32 889 61 14 | Registre.Commerce@ne.ch | https://www.ne.ch/autorites/decs/neco/ocrc |
| GE | Registre du commerce (OCIRT) | Rue du Puits-Saint-Pierre 4 (Postfach: CP 1211 Genève 3) | 1204 Genève | +41 22 546 88 60 | rc@etat.ge.ch | https://www.ge.ch/organisation/ocirt-registre-du-commerce-rc |
| JU | Service du registre foncier et du registre du commerce (RFC) | Rue de la Justice 2 | 2800 Delémont | +41 32 420 59 77 | registre.commerce@jura.ch | https://www.jura.ch/rc |

## 3. Geltungsbereich, Mehrfach-Standorte und Auffälligkeiten

**Vollständigkeit:** 26 von 26 Kantonen erfasst. **Keine** Konkordate/gemeinsamen
Ämter empirisch gefunden — entgegen einer naheliegenden Vermutung führen
auch die Halbkantonspaare **OW/NW** (Sarnen bzw. Stans) und **AI/AR**
(Appenzell bzw. Herisau) je ein **eigenes** Handelsregisteramt. Ebenso
BS/BL je eigenständig (Basel bzw. Arlesheim). Jeder Kanton ist HR-autonom
(Art. 927 OR, HRegV); ein interkantonales Konkordat besteht nicht.

**Behördenname weicht von «Handelsregisteramt» ab (kein Fehler, amtliche
Bezeichnung):**
- **GR:** «Grundbuchinspektorat und Handelsregister (GIHA)» — HR und
  Grundbuch in einem Amt.
- **TG:** «Amt für Handelsregister und Zivilstandswesen».
- **SG:** «Amt für Handelsregister und Notariate».
- **JU:** «Service du registre foncier et du registre du commerce (RFC)» —
  HR und Grundbuch gemeinsam.
- **SZ/OW:** HR ist Teil des Amts für Wirtschaft bzw. Volkswirtschaftsamts.
- **GE:** HR organisatorisch unter dem OCIRT.

**Mehrere Standorte (Hauptsitz geführt, übrige hier offengelegt):**
- **VS — drei Bezirks-/Arrondissement-Ämter** (gleichrangig, je eigener
  örtlicher Zuständigkeitsbereich); geführt ist das zentrale Amt in Sion:
  - Haut-Valais (1. Arr.): Bahnhofstrasse 10, 3900 Brig-Glis, +41 27 923 75 20
  - Valais central (2. Arr.): Place du Midi 30, 1951 Sion, +41 27 322 92 05 ← Tabelle
  - Bas-Valais (3. Arr.): Chemin de la Tuilerie 3a, 1890 St-Maurice, +41 24 485 22 75
- **TI — Sitz der Sektion vs. Amt:** Die «Sezione dei registri» sitzt an der
  Piazza Governo 7, 6501 Bellinzona; das eigentliche **Ufficio del registro
  di commercio** ist in **Biasca** (Via Tognola 7) — in der Tabelle geführt.
- **SG:** Ein Handelsregister mit Hauptsitz St. Gallen (Davidstrasse 27);
  die Amtsnotariate Buchs, Wil und Rapperswil-Jona sind Aussenstellen mit
  Schalterfunktion, nicht eigene HR-Ämter.

**Sitz ≠ Kantonshauptort (zur Vermeidung von Fehlannahmen):**
- BE: Amt in **Ostermundigen** (nicht Stadt Bern).
- BL: Amt in **Arlesheim** (nicht Liestal).
- SO: Amt in **Klus-Balsthal** (nicht Solothurn).
- VD: Amt in **Moudon** (nicht Lausanne).
- TI: Amt in **Biasca** (Sektion in Bellinzona).

**Schalter- vs. Postadresse:** BS (Schalter Claramattweg 8 / Post: Postfach
4001 Basel) und GE (Schalter Rue du Puits-Saint-Pierre 4 / Post: CP 1211
Genève 3) trennen Schalter- und Postadresse; beide in der Tabelle vermerkt.

## 4. Pflegebedarf (Verfallsregister-Kandidaten)

- **Umzüge/Adressänderungen** kommen vor (z. B. ZG: Medienmitteilung
  «Umzug Handelsregisteramt und Konkursamt» 10/2025 — die hier geführte
  Adresse Industriestrasse 24 ist der aktuelle Stand, vor Live-Einsatz
  gegenprüfen). → **Adressen jährlich nachprüfen.**
- **E-Mail-Lücken (kein amtlich publizierter Direkt-Mail, nur
  Kontaktformular):** LU, FR, AI, TG. Ehrlich offen — **nicht geraten.**
  Telefon/Website für diese Kantone amtlich belegt.
- **Primärquellen-Upgrade ausstehend:** Sobald ein zefix-API-Zugang (EHRA)
  verfügbar ist, die gesamte Tabelle gegen das amtliche Behördenverzeichnis
  (registryOffices) gegenprüfen — das wäre die kanonische SSoT und würde die
  Pflege automatisierbar machen.

## 5. Abnahme-Status

**Erstrecherche** (einfach belegt, je Eintrag eine amtliche kantonale
Quelle + Abrufdatum 7.6.2026). Noch nicht: adversarialer Zweitdurchgang,
zefix-API-Abgleich, fachliche Abnahme durch David. Vier E-Mail-Lücken
(LU/FR/AI/TG) und die ZG-Adresse (Umzug 2025) explizit als prüfbedürftig
markiert.
