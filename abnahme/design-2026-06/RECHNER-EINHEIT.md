# Abnahme-Grundlage: Rechner-Design-Vereinheitlichung (11.6.2026, über Nacht)

> **ABGENOMMEN — Verdikt David 11.6.2026 («das gilt als abgenommen»),
> ohne Auflagen, E-1 bis E-5 vollständig.** Prüfer: David Graf (Jurist,
> Anwaltsprüfung BS). Folgen: Reglement R1–R12 ist verbindliche
> Bau-Checkliste (E-5, via WACHSTUM-REGLEMENT Ziff. 4); der kosmetische
> ErgebnisBlock-Nachzug im Zuständigkeits-Trio ist freigegeben (E-4,
> VD-Stand ist seit `de677e0` committet). Diese Abnahme betrifft das
> DESIGN (Darstellungsschicht); sie ist KEINE fachliche Abnahme einzelner
> Katalog-Einträge (§7-Status «geprüft» bleibt unberührt).

Auftrag David 10.6.2026 spätnachts: alle Engines-UIs überprüfen,
vergleichbare Darstellung vereinheitlichen, Wiedergabe der
Rechtsinformationen überdenken, Regeln für den Designaufbau aufstellen,
Reihenfolge von oben nach unten. **Regelwerk:**
`DESIGN-REGLEMENT-RECHNER.md` (R1–R12) · **Plan/Audit:**
`FAHRPLAN-RECHNER-DESIGN.md` · Commits `2cd3791` (D1), `ff5bbb4` (D2),
`fcd2c38` (D3+D4).

## Was sich für Nutzer ändert (je Rechner gleich, statt je anders)

1. **Ein Ergebnisblock-Skelett überall:** Eckdaten-Kacheln (massgeblicher
   Wert mit Messing-Oberkante) → Verdikt mit Vorbehalten/Rechenweg/
   Annahmen/Normverweisen → Kalender/Zeitstrahl → zitierfähige
   Begründung → Aktenzeichen → Export-Zeile. Vorher wanderten
   Begründung, Aktenzeichen und Exporte je Rechner an andere Stellen
   (im Allgemeinen Fristenrechner sassen Begründung und Aktenzeichen
   sogar IN der Button-Zeile).
2. **Export-Zeile fix PDF → ICS → Teilen** (vorher drei Reihenfolgen).
3. **Mobile Sprungmarke «↓ Ergebnis» und der Live-Hinweis erscheinen
   jetzt bei ALLEN Rechnern** (vorher 6 bzw. 14 von 16 Formularen).
4. **Kalender/Zeitstrahl stehen NACH dem Verdikt** — Warnungen und
   Vorbehalte sind nie mehr unter einer abgeleiteten Ansicht versteckt
   (betroffen: ZPO, SchKG, Allg. Frist, Lohnfortzahlung, Verzugszins).
5. **Aufklapp-Disclaimer mit Kurz-Zeile in jedem Rechner** (ergänzt:
   Teuerung, Verzugszins, Allg. Frist, Kündigung B+C, Kombiniert).
6. Kleinkram: Teuerung-Eingabefehler in der Standard-FehlerBox; Quellen-
   Mikrozeile (BFS) als eigene Zeile; doppelte Screenreader-Ansage pro
   Live-Neuberechnung beseitigt (eine aria-live-Region statt zwei).

## Beweis Verhaltensneutralität (§6)

- Nur Darstellungsschicht (`src/components`, `src/pages`); `src/lib`
  unberührt.
- Golden **88/88 byte-gleich** (vorher und nachher) · 1239/1241 Tests
  grün — die 2 roten sind fremder VD-WIP der Parallel-Session
  (vdSchlichtung-Dossierverweis + VD-Stand-Datum), §12 ausgehalten ·
  Lint 0 · Build ok · check:smoke alle Seiten · e2e 33/33 (axe ohne
  neue Befunde, kein Overflow 390px, Tastatur).

## Screenshots (vorher/nachher, je 360/768/1280)

`abnahme/design-2026-06/screenshots/rechner-einheit-vorher-0b30683/`
gegen `…/rechner-einheit-nachher-fcd2c38/` (gitignored, lokal). Für die
Rechner-Reihenfolge aussagekräftig: `verzugszins-timeline--1280.png`
(Eckdaten-Akzent, Zeitstrahl neu nach dem Verdikt, Export-Zeile) und
`tagerechner-fristenkalender--1280.png`.

## Entscheid-Posten für David

- **E-1** Akzent-Regel: Messing-Oberkante auf der Kachel des
  massgeblichen Werts (Fristende/Hauptbetrag) — so umgesetzt; ok?
- **E-2** Kalender/Zeitstrahl nach dem Verdikt (statt davor) — ok?
- **E-3** Kurz-Disclaimer-Wortlaute der 5 ergänzten Rechner
  (TeuerungForm/VerzugszinsForm/AllgemeineFristForm/KuendigungSperrForm/
  KombinierteAnsicht — je 1 Satz, aus den Volltexten abgeleitet).
- **E-4** Zuständigkeits-Trio: bereits regelkonform (war Referenzmuster);
  die rein kosmetische ErgebnisBlock-Adoption habe ich wegen
  Kollisionsgefahr mit der parallel laufenden VD-Schlichtungs-Session
  zurückgestellt — nachziehen, sobald deren Stand committet ist?
- **E-5** Reglement R1–R12 als verbindliche Bau-Checkliste abnehmen
  (Verweis in WACHSTUM-REGLEMENT Ziff. 4).
