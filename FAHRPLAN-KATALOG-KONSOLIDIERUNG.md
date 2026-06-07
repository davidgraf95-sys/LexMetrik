# FAHRPLAN — Katalog-Konsolidierung: ein Einstieg pro Rechtsfrage

**Auftrag David (7.6.2026):** «fundiert analysieren, wie ich die Rechner
simplifizieren kann, sodass es nicht verschiedene Rechner und Vorlagen gibt,
die das Selbe können.»

**Analyse-Grundlage:** 3 unabhängige Erkundungen (Voll-Inventar Karten→Routen→
Engines · funktionale Überlappungen am Code · Auswahl-Schicht aus Nutzersicht
inkl. Suchbegriffs-Kollisionen). Stand: 34 verfügbare Karten (16 Rechner,
18 Vorlagen) auf ~28 Seiten.

---

## 1. Befund: WO die Doppelung liegt (und wo nicht)

### Ebene Engine (src/lib): KEINE Doppelung — nichts zu tun
Jede Rechenregel lebt genau einmal (§5 bestätigt). `mietrecht.ts` bedient
6 Karten, `sperrfristen.ts` 5, `zpoFristen.ts` 5 — das ist Wiederverwendung,
nicht Duplikat. Geteilt sind nur fachneutrale Helfer (§4-konform). **Die
Simplifizierung darf hier NICHT ansetzen (§4: Engines nie fusionieren).**

### Ebene Seiten: weitgehend konsolidiert — Muster existiert bereits
Drei Seiten bündeln heute schon mehrere Karten:
- `/rechner/kuendigung` — Tabs (Sperrfristen · Lohnfortzahlung)
- `/rechner/zustaendigkeit` — 3 Rechtswege (#zivil/#schkg/#straf)
- `/vorlagen/mietvertrag` — Weiche (#untermiete)

Der Tagerechner rendert die ZPO-/SchKG-Forms als Tabs zusätzlich zu deren
Einzelseiten — **dokumentiert gewollter Doppel-Einstieg** (Laie/Fach), Engines
getrennt. Der Fristenspiegel ist reiner Orchestrierer (rechnet nichts selbst).

### Ebene AUSWAHL (Katalog): hier liegt das Problem
7 Cluster, in denen eine Rechtsfrage 2–6 Karten hat, ohne dass der Titel die
Funktion verrät:

| Laien-Frage | Karten heute | Problem |
|---|---|---|
| «Kündigung» (Arbeit) | sperrfristen-Rechner + AG-Maske + AN-Maske | Rolle/Funktion nicht im Titel |
| «Wohnung kündigen» | mietrecht-Rechner + Mieter-Maske + Vermieter-Checkliste | rechnen vs. schreiben unklar |
| «Zuständigkeit» | 3 Karten (Zivil/SchKG/Straf) | Rechtsweg nicht im Titel; EINE Seite dahinter |
| «Mietvertrag» | mietvertrag-wohnen + untermietvertrag | EINE Seite dahinter (Weiche existiert) |
| «Firma gründen» | gmbh-gruendung + ag-gruendung | Rechtsform als Karten-Split |
| «Pflichtteil» | erbteilung + erb-fristen + testament | 3 verschiedene Fragen, 3 Treffer |
| «Frist» | 4+ Karten quer durch die Gebiete | keine Funktions-Differenzierung |

**Kernbefund:** Die Titel sind fachlich präzis, aber funktional stumm. Der
Nutzer erkennt nicht, ob eine Karte **rechnet**, ein **Schreiben erzeugt**
oder **Voraussetzungen prüft** — und nicht, in welcher **Rolle** (Mieter/
Vermieter, AN/AG) sie ihm dient.

---

## 2. Leitsatz

> **Eine Rechtsfrage = ein Einstieg.** Konsolidiert wird ausschliesslich die
> Auswahl- und Darstellungsschicht (Karten, Titel, Weichen). Engines, Schemas,
> Golden-Outputs bleiben byte-identisch (§3–§6). Kein Werkzeug verliert eine
> Fähigkeit; alte Routen bleiben als Redirects/Weichen erreichbar
> (.ics-Links/Permalinks im Umlauf!).

---

## 3. Etappen

### E1 — Funktions-Klarheit ohne Umbau (klein, sofort möglich)
1. **Titel-Konvention Verb-zuerst:** jede Karte sagt im Titel/Untertitel, WAS
   sie tut — «… berechnen» (Rechner), «… erstellen» (Vorlage), «… prüfen»
   (Checkliste). Behebt die Modus-Verwirrung ohne einen einzigen Merge.
2. **Art-Kennzeichen auf der Kachel** (Rechner/Vorlage/Checkliste) sichtbar
   machen — das `art`-Feld existiert in der SSoT bereits.
3. **Fristenspiegel-Beschreibung:** offenlegen, dass er die bestehenden
   Rechner orchestriert («ein Ereignis · alle Fristen — ruft die Einzel-
   rechner auf»).

### E2 — Karten-Merges, wo EINE Seite schon existiert (mittel, reine Katalog-Pflege)
4. **Zuständigkeit 3 → 1 Karte** «Zuständigkeit (Zivil · Betreibung · Straf)»;
   die Rechtsweg-Weiche liegt auf der Seite (heute schon #zivil/#schkg/#straf).
   ⚠ Kehrt den Katalog-Split vom 6.6.2026 (Auftrag David) um — **Entscheid David**.
5. **Mietvertrag 2 → 1 Karte** «Mietvertrag (Wohnen · Geschäft · Untermiete)»;
   #untermiete-Weiche existiert.
6. **Gründung 2 → 1 Karte** «Gesellschaft gründen (GmbH · AG)» mit Rechtsform-
   Weiche als Vorschalt-Frage; die zwei grossen Wizards bleiben getrennte
   Seiten (§4), nur der EINSTIEG wird einer.

### E3 — Themen-Einstiege für die Kündigungs-Cluster (gross, eigener Bau)
7. **«Kündigung Arbeitsverhältnis» = ein Einstieg** mit Rollen-/Ziel-Weiche:
   *Ich kündige (AN)* → Maske 1a · *Ich kündige als AG* → Maske 1b (mit
   Sperrfristen-Gate) · *Ich habe eine Kündigung erhalten / nur rechnen* →
   Sperrfristen-Rechner. Die drei bestehenden Seiten bleiben; neu ist nur die
   Weiche + EINE Karte statt drei.
8. **«Kündigung Mietverhältnis» = ein Einstieg** analog: *Als Mieter:in
   kündigen* (Maske 2a) · *Als Vermieter:in* (Checkliste 2b, amtliches
   Formular) · *Nur Termin/Fristen rechnen* (mietrecht-Rechner).
9. Prefill-Brücken (rechnerPermalinks) bleiben — sie sind das Bindegewebe
   zwischen den Modi, keine Dublette.

### Ausdrücklich BEHALTEN (geprüft, keine Dubletten)
- Tagerechner ↔ ZPO-/SchKG-Fristen-Karten (gewollter Laien-/Fach-Doppel-
  einstieg; nur per E1-Untertitel als «derselbe Rechner» kenntlich machen).
- Rechner ↔ Vorlage mit derselben Engine (mietrecht/sperrfristen): das IST
  §5 — eine Quelle, zwei Ausgabeformen.
- Kosten-Familie (Streitwert · Betreibungskosten): verschiedene Erlasse,
  keine Überschneidung.
- GmbH-/AG-Maske intern (Checkliste + Mappe aus einer Engine): bereits optimal.

---

## 4. Wirkung

| | Karten | Einstiege pro Rechtsfrage |
|---|---|---|
| Heute | 34 | bis zu 6 (Kündigung) |
| nach E2 | 30 | bis zu 3 |
| nach E3 | 26 | 1 (mit Weiche) |

Null Engine-Änderungen · Golden byte-identisch · alle Routen bleiben
erreichbar (Karten-Merges sind reine `startseiteConfig`-Pflege + Redirects).

## 5. Offene Entscheide David
- **E2.4 Zuständigkeits-Karten 3→1** (kehrt eigenen Auftrag vom 6.6. um) — ja/nein?
- **E3 Themen-Einstiege Kündigung** — bauen oder bei E1+E2 belassen?
- Titel-Konvention E1.1: Wortlaute sind fachliche Aussagen → Abnahme-Welle.

## 6. Umsetzungsstand (7.6.2026 abends, Davids Delegation «mach was du für richtig hälst»)

**UMGESETZT** (alle Tore grün: 1070 Tests · Lint 0 · tsc 0 · Golden 87/87
byte-gleich · Sweep · Inventur related-0 · SSR-Sichtcheck aller Panels):

- **E1.2** Funktions-Kennzeichen auf jeder Kachel: Overline `Gebiet · Rechner/Vorlage`.
- **E1.3** entfiel — Fristenspiegel-Beschreibung legte die Orchestrierung schon offen.
- **E2.4** Zuständigkeit 3→1 als ECHTER Karten-Merge (szenarien-Feld zeigt die
  drei Rechtswege; Keywords/Kern-Normen der Split-Karten übernommen).
- **E2.5** Mietvertrag 2→1 («Wohnen · Geschäft · Untermiete»).
- **E2.6** Gründung 2→1 VERWORFEN (Abweichung): GmbH/AG sind zwei Werkzeuge,
  die Rechtsform-Wahl ist eine echte juristische Entscheidung — eine
  Vorschalt-Seite wäre ein Extra-Klick ohne Gewinn.
- **E3.7/8** OHNE neue Weichen-Seiten umgesetzt (Abweichung, Subtraktion):
  Themen-Karten «Kündigung & Fristen im Arbeitsverhältnis/Mietverhältnis»
  (IDs kuendigung-sperrfristen/mietrecht bleiben — HäufigGebraucht/Brücken
  stabil) + Masken-Direktlinks auf den Rechner-Seiten. Die 4 Masken-Karten
  sind via NEU `imKatalog:false` + `KATALOG_KARTEN` versteckt, NICHT
  gelöscht — sie bleiben SSoT ihrer Seiten (`karte(id)` im Seitenkopf).
- Mechanik: gelöscht wurden nur die 3 reinen Hash-Deep-Link-Karten;
  Goldliste misst deklariert den SICHTBAREN Katalog (7 Paare retargetet);
  Zählung 32 gebaut / 28 sichtbar im Test gepinnt.

**OFFEN für David:** Abnahme der neuen Titel-Wortlaute (fachliche Aussagen,
Erstformulierung Claude) · E1.1 Verb-Titel-Konvention für die ÜBRIGEN Karten
(bewusst zurückgestellt: Titeländerungen sind Such-/Goldliste-relevant,
erst nach Davids Richtungs-Ja in einer Welle).

*Erstellt + umgesetzt 7.6.2026 (Analyse: 3 Erkundungs-Agents; Belege in den
Agent-Berichten der Session).*
