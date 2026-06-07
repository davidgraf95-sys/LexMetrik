# FAHRPLAN — Aufhebung der Free/Pro-Zweiteilung (eine Hauptseite)

> **UMGESETZT 7.6.2026** auf Davids «bau» mit allen Defaults (D-1–D-4):
> Commits `2e80daf` (E1+E2: Hauptseite, Routen/Redirects, Header,
> /pro-Links, Tests, Smoke) und `ca163b4` (E3: proSession/freeReihenfolge
> gelöscht, (Pro)-Suffix, Test-Nachzug). Die tier-Feld-Entfernung aus
> startseiteConfig.ts wurde vom Parallel-Session-Commit `0b4d5e7` über
> den geteilten Index mit eingesammelt (Inhalt korrekt, dort nicht
> erwähnt); umgekehrt enthält `2e80daf` deren Stufe-2-Zeilen in
> VorlageAgGruendung.tsx. Tore grün (tsc · 1051 Tests · Lint 0 · Smoke ·
> Build · Golden 84/84 byte-gleich). Empirisch geprüft (Headless-Chrome):
> Hauptseite Desktop, /pro- und /fachpersonen-Redirects MIT Query,
> Mobil 390px (erbt den vorbestehenden Katalog-Overflow,
> FAHRPLAN-DESIGN E4). lib/freeReihenfolge.ts heisst neu
> lib/haeufigGebraucht.ts (Namenskollision: schnellzugriff.ts war durch
> «Zuletzt verwendet» belegt). Doku gespiegelt: STRUKTUR.md (IA-Kapitel,
> offener Punkt 3 gestrichen), PROJEKTBESCHRIEB.md.

**Auftrag David (7.6.2026, wörtlich):** «ich möchte die zweiteilung der
webseite in pro und free wieder aufheben. ich möchte dass wieder nur eine
hauptseite gibt.»

**Ziel:** EINE Hauptseite unter `/` mit dem vollständigen Katalog
(heute: `/` = kuratierte Free-Kachelwand mit 9 Einträgen + Pro-Teaser;
`/pro` = Vollkatalog mit Gebiets-Kacheln, Suche, Anliegen-Zeile,
Pseudo-Login). Kein Login, kein Pro-Button, kein Teaser.

**Einordnung Strategie:** widerspricht STRATEGIE-PLATTFORM.md NICHT —
dort ist Monetarisierung ohnehin hinter Gate G1 (20 Kanzlei-Gespräche)
verschoben und das Zahlungssystem bewusst undefiniert. Eine spätere
Monetarisierung würde dann pro FUNKTION statt pro SEITE zugeschnitten
(neuer Entscheid, neues Konzept). Der Phase-4-Andockpunkt «Experten-
Gating über Header-Button» (STRUKTUR.md, offene Punkte) entfällt mit
diesem Umbau ersatzlos.

---

## Ist-Stand (Inventar der Zweiteilung, erhoben 7.6.2026)

| Baustein | Ort | Schicksal |
|---|---|---|
| `tier: 'free'│'pro'` (9 free / 106 pro) | `lib/startseiteConfig.ts` (Typ `Tier`, Feld je Karte, `PAYWALL_ACTIVE`) | entfernen |
| Free-Startseite (Kachelwand + ProTeaser) | `pages/Startseite.tsx` | wird zur EINEN Hauptseite umgebaut |
| Pro-Seite (Vollkatalog) | `pages/Pro.tsx` | Inhalt wandert nach `/`, Datei entfällt |
| Pseudo-Login (localStorage `lexmetrik.pro.v1`) | `lib/proSession.ts`; `App.tsx:54` (Redirect `/`→`/pro` wenn eingeloggt); `Header.tsx` (Pro-/Ausloggen-Button) | ersatzlos entfernen |
| Routen `/pro`, `/fachpersonen`, `/rechner` | `App.tsx:88–91` | Redirects auf `/` (Query erhalten: `?gebiet=`, `?q=`, `?modus=`) |
| Kuratierte Free-Reihenfolge | `lib/freeReihenfolge.ts` | → «Häufig gebraucht»-Sektion (D-2) |
| Links auf `/pro` | `RechnerKopf.tsx:35` («Katalog»), `zurueckHref`/Zurück-Links in 6 Vorlagen-Seiten, `Startseite.tsx:39` | auf `/` umstellen |
| «(Pro)»-Suffix bei verwandten Karten | `RechnerKarte.tsx:91` | entfernen |
| Tests | `startseiteConfig.test.ts` (Block «Stufen-Zuteilung», Free-Reihenfolge-Invarianten), `proKatalog.test.tsx`, `katalogSuche.test.ts` | deklariert anpassen (§6 Ziff. 3: fachliche Änderung, KEIN Refactoring) |
| Smoke-Render | `scripts/smoke-render.tsx:38–39` (Startseite + Pro) | Pro-Eintrag entfällt |
| Hero-Texte (Free gross / Pro kompakt) | beide Seiten | EIN Hero (D-1) |

Nicht betroffen: alle Engines, Vorlagen-Schemas, PDF/DOCX, Golden-Outputs
(keine Engine-Änderung), `Katalog.tsx` (ist bereits tier-agnostisch,
nimmt `karten` als Prop), Permalink-Specs der Rechner.

---

## Entscheide David (mit Default — Umsetzung läuft ohne Rückfrage durch)

- **D-1 Hero:** Welcher Hero trägt die eine Hauptseite?
  **Default/Empfehlung:** der Free-Hero (Nutzen-Headline «Fristen
  berechnen. Beträge beziffern. Rechtsdokumente aufsetzen.», Methodik-
  Anker), aber in der kompakten Pro-Höhe (h2-Grösse, Katalog ohne
  Scrollen erreichbar — Entscheid 5.6.2026 gilt weiter). Untertitel
  vereinigt beide Aufzählungen (Zuständigkeit/Rechtsmittel ergänzen).
- **D-2 Kuratierter Einstieg:** Die Free-Kachelwand war nach
  ALLTAGSNUTZEN kuratiert. Behalten als schlanke Sektion «Häufig
  gebraucht» (eine Kachelzeile, IDs aus `FREE_REIHENFOLGE`) über dem
  Katalog? **Default: ja, behalten** — die Kuratierung ist erarbeitetes
  Wissen; Datei wird zu `lib/schnellzugriff.ts` umbenannt (Begriff
  «free» verschwindet aus dem Code). Alternativ: ersatzlos streichen.
  (Hinweis: «Zuletzt verwendet» existiert daneben weiter und bleibt.)
- **D-3 `tier`-Feld:** ganz entfernen (**Default/Empfehlung** — §5/§8:
  kein totes Metadatum pflegen; eine spätere Monetarisierung bekäme
  einen NEUEN, funktionsbezogenen Zuschnitt) oder stillgelegt behalten.
- **D-4 «kostenlos»-Wording:** Der Free-Hero sagt «… kostenlos». Auf
  der einen Hauptseite für ALLES aussagbar (Paywall war nie aktiv).
  **Default: Kennzahlenzeile ohne Preisaussage** («N Rechner ·
  M Vorlagen · X Rechtsgebiete»), bis die Monetarisierungsfrage (G1)
  entschieden ist — sonst verspricht die Seite etwas, das ein späterer
  Entscheid zurücknehmen müsste.

---

## Etappen (je Etappe: Tore + eigener Commit)

### E1 — Eine Hauptseite bauen
`pages/Startseite.tsx` wird zur Vollseite: Hero (D-1) ·
optional «Häufig gebraucht» (D-2) · `<Katalog karten={ALLE_KARTEN}
filterArt>` (Gebiets-Kacheln, Suche `?q=`, `?gebiet=`, Anliegen-Zeile —
alles unverändert aus Pro übernommen) · Status-Legende («Entwurf»-Zeile,
datengetrieben) · Methodik-Kacheln («So rechnet LexMetrik») ·
Rechtlicher Hinweis. `ProTeaser` entfällt ersatzlos.
`pages/Pro.tsx` löschen. Kennzahlen nach D-4.

### E2 — Routen, Navigation, Link-Erbe
- `App.tsx`: `/`-Route rendert direkt die Hauptseite (kein
  `istProEingeloggt()`-Redirect mehr); `/pro` → `Navigate to="/"`
  **mit erhaltenem Suchstring** (Muster FachpersonenRedirect — alte
  Permalinks `?gebiet=`/`?q=` müssen weiter treffen); `/fachpersonen`
  und `/rechner` ebenso direkt auf `/`.
- `Header.tsx`: ProButton + `proSession`-Import raus; Aktionscluster
  = Sprache · Methodik.
- `RechnerKopf.tsx:35` «Katalog» → `/`; alle `zurueckHref="/pro"` und
  Zurück-Links in Vorlagen-Seiten (`VorlageSchlichtungsgesuchBs`,
  `VorlageKuendigungVermieter`, `VorlageKapitalerhoehung`,
  `VorlageAgGruendung`, `VorlageKlageVereinfacht`,
  `VorlageGmbhGruendung`) → `/`.

### E3 — Aufräumen (nach D-3)
- `lib/proSession.ts` löschen (Andockpunkt-Kommentar in STRATEGIE
  F-Notiz überführen, nicht im Code lassen). Der localStorage-Schlüssel
  `lexmetrik.pro.v1` bleibt in Browsern liegen — harmlos, kein
  Aufräum-Code nötig (Seite ist laut Strategie-Stand unbenutzt).
- `startseiteConfig.ts`: Typ `Tier`, Feld `tier`, `PAYWALL_ACTIVE`
  entfernen (106+9 Kartenzeilen, mechanisch).
- `RechnerKarte.tsx:91` «(Pro)»-Suffix raus.
- `lib/freeReihenfolge.ts` → `lib/schnellzugriff.ts` (D-2) bzw. löschen.
- Kommentare/Prosa mit «Free/Pro» in den betroffenen Dateien bereinigen
  (gezielt, kein blindes Suchen-Ersetzen — «pro» ist Wortbestandteil).

### E4 — Tests + Smoke (deklarierte fachliche Änderung, §6 Ziff. 3)
- `startseiteConfig.test.ts`: Block «Stufen-Zuteilung» entfällt;
  Free-Reihenfolge-Invarianten werden zu Schnellzugriff-Invarianten
  (jede ID existiert; Determinismus) oder entfallen mit D-2.
- `proKatalog.test.tsx` → `katalog.test.tsx`: prüft dieselben
  Render-Invarianten neu gegen `/` (Kennzahl «sofort verfügbar» =
  alle verfügbaren Karten — Zählweise bleibt identisch, da Pro schon
  heute free+pro zeigt).
- `katalogSuche.test.ts` (48-Paare-Goldliste): unverändert lassen —
  Suche ist tier-agnostisch; nur prüfen, dass kein Testfall ein
  tier-Feld konstruiert.
- `scripts/smoke-render.tsx`: Pro-Zeile raus.
- Tore komplett: `npx tsc -b` · Suite · Lint (voll, Exit nackt) ·
  Build · `golden-outputs vergleich` (muss byte-identisch bleiben —
  Beweis, dass keine Engine berührt wurde) · `smoke-render` ·
  `norm-zitate-pruefen`.

### E5 — Doku + Abschluss
- STRUKTUR.md (IA-Kapitel + offene Punkte: Phase-4-Gating streichen),
  PROJEKTBESCHRIEB.md, HANDLUNGSPLAN.md (A-Block: dieser Umbau),
  STRATEGIE-PLATTFORM.md (Notiz: Monetarisierungs-Andockpunkt entfällt
  im Code, Entscheid-Lage unverändert), memory.
- Bug-Check §9 LIGHT (1 Agent UI-Klickwege: alle Alt-Routen-Redirects
  mit Query, Katalog-Suche/Kacheln auf `/`, Zurück-Links der Vorlagen,
  Header auf 390px ohne Pro-Button) — keine Engine-Prüfung nötig.
- Push/Deploy nur auf Davids Ja (§9).

---

## Risiken / bewusst in Kauf genommen

- **Link-Erbe:** Alte `/pro`-Permalinks (auch in versendeten .ics-
  DESCRIPTIONs!) bleiben über den Redirect funktionsfähig — der
  Redirect ist deshalb DAUERHAFT, kein Übergangs-Provisorium.
- **SEO:** Seite ist faktisch unbenutzt (Strategie-Befund) — kein
  Index-Risiko; `vercel.json` braucht keine Änderung (SPA-Rewrite
  deckt alles).
- **Parallel-Sessions:** E1–E3 berühren Header/App/Karten — VOR Beginn
  prüfen, ob eine andere Session in `src/pages/`/`src/components/`
  arbeitet; strikt eigene Dateien stagen.
- **Wiedereinführung:** Falls später doch ein Bezahl-Zuschnitt kommt,
  ist `git log` die Quelle (dieser Fahrplan + Commits dokumentieren,
  was wo lag) — nichts «auf Vorrat» im Code lassen.

**Aufwand:** eine Session. **Reihenfolge zwingend:** E1 vor E2 (sonst
zeigt `/` ins Leere), E3 erst nach grünem E2.
