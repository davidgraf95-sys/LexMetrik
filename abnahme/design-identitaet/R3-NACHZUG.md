# R3-Nachzug — Startseite und Feld-Anatomie (6.9.2026)

Runde R3b von `W2·24-DESIGN-IDENTITAET`: die Nachbesserung nach Davids Bild-Befund
und der Ästhetik-Prüfung zu R3. Massgeblich bleibt
`abnahme/design-identitaet/vorschlag-freigegeben.html` (Seite «Startseite»);
Wortlaut David 6.9.2026: «nicht trist», «alles angleichen», Links unterstrichen.

Gebaut im Worktree `w2-24` (Zweig `feat/w2-24-design-identitaet`), parallel zu
R4 (Leser) und R2b (Rahmen/Reiter) — `layout/**`, `lib/tabs.ts` und
`gesetz-leser/**` blieben darum unberührt.

## Was gebaut wurde

| Befund | Gebaut | Ort |
|---|---|---|
| D1 · Suchzeile liest sich als Überschrift | Lupe IN der Zeile (SVG, `currentColor`) + echtes `<label>` «Suchen» in Archivo darüber; Platzhalter gekürzt, Ellipse statt Wortbruch | `start/UniversalSuche.tsx`, `.st-frage*` in `index.css` |
| D2 · drei Aussagen in einer Zeile | Bestand · Beispiele · «Zuletzt geöffnet» als drei Zeilen | `start/Hero.tsx`, `start/ZuletztVerwendet.tsx` |
| D3 · Leerraum über dem Block, Marginalie ohne Bezug | Vorlauf der ersten Zeile weg, ab `sm` 24 px des Wrapper-Polsters zurück; Titelblatt-Marginalie mit Registerstrich in Tinte | `start/Satzspiegel.tsx`, `pages/Startseite.tsx` |
| R3-F1 · Inline-Links ohne Unterstrich | unterstrichen (Beispiele, Zuletzt, Werkzeuge-Fuss, Abdeckungs-Verweis der Trefferliste) | `start/*`, `suche/SuchResultate.tsx` |
| R3-F2 · Gold-Hex im Select-Pfeil | zwei gekreuzte Farbverläufe in `currentColor`; Dunkel-Kopie entfällt | `index.css` |
| R3-F3 · `.lc-input` als Kasten | zentrale Unterstrich-Anatomie, metrik-neutral | `index.css` |
| R3-F4 · Datum doppelt | Datums-Suffix der Zitierung fällt | `start/entscheidZitierung.ts` |
| R3-F5 · Beispiele/Zuletzt laufen ineinander | mit D2 erledigt | s. o. |
| R3-F6 · Platzhalter @390 im Wort gekappt | kürzerer Platzhalter + `text-overflow: ellipsis` | s. D1 |
| R3-F9 · Internationales Recht ohne Nummer | «0» (amtliche SR-Gruppenziffer, einstellig) | `start/SystematikListe.tsx` |
| Nebenfund · Social-Bild in der alten Marke | neu im System (Papier/Tinte, Registerstriche, Literata+Archivo) | `scripts/og-bild.ts`, `public/og.png` |

## Was NICHT gebaut wurde — und warum

- **R3-F7** (Reiter-Kurzform «Sammlung») · `lib/tabs.ts` gehört zu R2b.
- **R3-F8** (Aktivmarke «Sammlung» im Masthead) · liegt in `layout/**`, in dieser
  Runde gesperrt. Offen für R2b/R5.
- **D4/D5/D6** (Kopf-/Ortsprüfung, Menü-Anatomie, Wizard-Lücke) · R5.
- **Nebenfund «✕» als Farb-Emoji** · **nicht reproduzierbar.** Gemessen am
  Worktree-Preview (`vite preview :4336`, Chromium headless,
  `deviceScaleFactor: 3`, hell, Startseite mit gefülltem Suchfeld): die Glyphe
  rendert einfarbig in `--ink-500`, kein Emoji-Font. Kein Fix ohne gesehenen
  Fehlschlag. Tritt der Befund in einem anderen Browser auf, ist der Ausweg
  eine Zeile — `font-variant-emoji: text` am Baustein `.lc-griff-glyph`, nicht
  ein zweites Zeichen im Quelltext (`✕︎` würde den Wächter
  `design-r3b-chrome.test.ts` still blind machen, weil er auf das nackte ✕ prüft).
- **Kantige Ankreuzfelder** · verlangt `appearance: none` samt eigener Zeichnung
  aller Zustände (checked, indeterminate, Fokus, forced-colors) — ein eigener
  Baustein, kein Nachzug; der Akzent ist seit R1 ohnehin neutrale Tinte. → R5.

## Die eine app-weite Änderung: `.lc-input`

Das Referenzbild kennt keine Feldfläche (`.werk input`: `border:0; border-bottom:
1px solid var(--ink); background:transparent`). `.lc-input` war das Gegenteil —
getönte Fläche, umlaufender Rahmen, Radius — und sitzt an 27 Konsumenten. Der
Nachzug stellt darum die Regel um, nicht die Startseite.

**Metrik-neutral, mit Absicht.** Die Feldhöhe bleibt Pixel für Pixel gleich:
vorher `12 + 12 px` Polster plus `2 × 1 px` Rahmen, jetzt `12 + 13 px` Polster
plus `1 px` Unterstrich. Kein CLS-Wächter, keine Leser-Geometrie
(`SUCH_H_RUHE`/`SUCH_H_AKTIV`) und kein Formular springt. Der Fokus verdoppelt
den Unterstrich (`border-bottom-color` + 1 px `box-shadow` darunter) — als
Rahmenbreite hätte er das Feld gestaucht und in `.lc-input-sm` (feste Höhe
36 px) den Text verschoben. `aria-invalid` trägt dieselbe Form in
`--danger-line`.

Sichtprobe hell + dunkel, @1440 und @390, dazu die Druckansicht:
`r3b-tagerechner-*`, `r3b-prozesskosten-*`, `r3b-vorlage-*`, `r3b-druck-*`.
In allen drei Formularen steht das Label über dem Feld, der Wert darunter, die
Kante darunter; im Druck bleiben Label, Wert und Kante vollständig lesbar.

## Neues Tor (§6.7)

`check:farbwelt` prüft jetzt zusätzlich: **kein `%23`-Hexliteral in
`src/index.css`** (Kommentare vorher entfernt — ein Hexwert in einer Notiz malt
nichts). Anlass ist R3-F2: der Chevron war nach dem Token-Tausch die einzige
Stelle, die noch Gold malte, und für ein Token-Tor unsichtbar.

Rot gezeigt am 6.9.2026 durch Wiedereinsetzen der alten Zeile:

```
Farbwelt-Tor ROT — 1 harte(r) Verstoss/Verstösse (DESIGN-REGLEMENT §13/F2):
  ✗ Hex-Farbe «%23826225» in einer data-URI in src/index.css — eine URL erbt
    keine Token und wird bei einer Farb-Rekalibrierung stumm zurückgelassen …
```

Nach Rücknahme grün: «… Flächen-L-Leiter beide Modi, kein Hex in data-URIs.»

## Ein Freibrief weniger

`e2e/a11y.e2e.ts` führte für `startseite` und `startseite-suche` den Befund
`link-in-text-block` als bekannt (Markenentscheid B-2 «Inline-Links ohne
Unterstreichung»). Dieser Entscheid ist mit §5 des Fahrplans aufgehoben. Der
Eintrag ist **gestrichen, nicht umgeschrieben** — und die Streichung hat sofort
einen echten Rest gefunden: den Abdeckungs-Verweis in der Trefferliste
(gemessen 2.06:1 hell / 1.85:1 dunkel gegen den Fliesstext, Schranke 3:1). Der
ist mitgefixt; beide Prüfpunkte sind ohne Freibrief grün.

## Tore

`lint` · `tsc -b` · `test` (444 Dateien, 7283 Fälle) · `check:design-tokens` ·
`check:farbwelt` (mit Rot-Probe) · `check:seo-index` · `check:zaehler` ·
`golden:vergleich` (256 Fälle byte-gleich) · `check:e2e-shards` · `build` ·
`playwright e2e/a11y.e2e.ts` (47 Fälle, hell + dunkel) — alle grün.
