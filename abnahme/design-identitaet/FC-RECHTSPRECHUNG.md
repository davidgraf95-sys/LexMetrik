# FC — Integration «Rechtsprechung»: die zwei roten Sonden nach GA/GB

**Bau-Einheit:** W2·24-DESIGN-IDENTITAET · Folge-Zweig `feat/w2-24-fc`,
Basis `85daf2926` (Merge der Zweige GA/GB in `feat/w2-24-folge`)
**Anlass:** voller e2e-Lauf 7.9.2026, zwei rote Fälle
(`e2e/rechtsprechung.e2e.ts:106`, `e2e/uinav-j-rechtsprechung.e2e.ts:195`)
**Fläche:** zwei Sonden — kein Produktcode geändert (Begründung unten je Fall)

---

## 0 · Messbedingung (für beide Fälle identisch)

Worktree `.claude/worktrees/w2-24-fc`, eigener Build (`npm run build`, Exit 0,
alle 63 Routen prerendered), `vite preview` auf Port **4420** (`--strictPort`,
Port vorher per `lsof -i :4420` leer), Chromium headless, `--workers=2`.
Rot-Lauf und Grün-Lauf desselben Paars, sonst unverändert.

---

## 1 · Fall 1 — «Kanton BS» im Entscheid-Kopf

### Rot-Beweis (vor dem Eingriff)

```
1) e2e/rechtsprechung.e2e.ts:106:3 › BS-Entscheid rendert: Kopf, Erwägungs-Sprunganker, …
   Error: expect(locator).toBeVisible() failed
   Locator: getByText('Kanton BS', { exact: true }).first()
   Error: element(s) not found
   > 111 |     await expect(page.getByText('Kanton BS', { exact: true }).first()).toBeVisible()
```

### Wurzel

`src/components/layout/BrotkrumeRegel.ts:61` (`ortsLeistenKrumen`), eingehängt in
`src/components/layout/InhaltsKopf.tsx:173` — **GA-1**. Die Ortsleiste der
Einzelansicht zeigt seither nur noch die Sektions-Krume; die Ebenen-Krume
(«Kanton BS», eine Krume ohne `to`) fällt regelhaft heraus.

Der DOM-Auszug des roten Laufs zeigt genau das:

```yaml
- navigation "Brotkrümel":
  - link "Rechtsprechung": { /url: /rechtsprechung }
- main "Hauptinhalt":
  - paragraph: Öffentliches Recht
  - heading "Appellationsgericht BS AUS.2026.54 vom 08.07.2026" [level=1]
```

### Nullprobe

`git diff --quiet 018b41a37 HEAD -- src/components/layout/InhaltsKopf.tsx` → **rot**
(Datei auf dem Zweig geändert), `BrotkrumeRegel.ts` existiert auf `018b41a37`
gar nicht. Die Wurzel liegt also **im Zweig** (GA), nicht auf der Basis.

### Entscheid: deklarierte Sonden-Änderung, kein Produkt-Fix

Die Sonde zitiert eine **absichtlich ersetzte Anatomie** — dieselbe Streichung
ist am Gesetz-Leser schon einmal deklariert worden (D27,
`e2e/leser-v3-kopfzeile.e2e.ts:397`); GA-1 macht daraus EINE Regel (§5). Ein
Produkt-Fix hiesse, GA-1 für eine Route zurückzunehmen — also die Dopplung
wiederherzustellen, die gemessen der Anlass war.

Die **Zusage bleibt**: der Kopf sagt, woher der Entscheid stammt. Sie wird ab
jetzt an der H1 gemessen (`/Appellationsgericht BS/`), die den kantonalen
Spruchkörper wörtlich führt. Kein §8-Verlust: trägt die Zitierung den
Gerichtsnamen NICHT, hält ihn GA-2 in der Overline
(`src/pages/EntscheidLeser.tsx:660`, `angabeImTitel(...) ? null : …`) — die
Herkunft steht auf jedem Entscheid genau einmal.

Die übrigen Zusagen des Falls (Sprunganker `#abschnitt-erwaegung`, Badge
«maschinell», amtlicher Quell-Link mit `Aufruf=getMarkupDocument`,
Provenienz-Fuss) sind unverändert und laufen mit.

---

## 2 · Fall 2 — Datums-Gruppe der Startseiten-Entscheidliste

### Rot-Beweis (vor dem Eingriff)

```
2) e2e/uinav-j-rechtsprechung.e2e.ts:195:3 › Entscheid-Liste: Gebiet je Zeile, Datum einmal je Gruppe, …
   Error: mindestens eine Datums-Gruppe
   Expected: > 0   Received: 0
   > 216 |     expect(daten.length, 'mindestens eine Datums-Gruppe').toBeGreaterThan(0)
     215 |     const daten = await liste.locator('li > p').allTextContents()
```

### Wurzel

`src/components/start/EntscheideListe.tsx:142`. Das Gruppen-Datum stand bei
R3 (`4dd675fd3`) als `<p className="num">{deDatum(g.datum)}</p>` direkt im
`<li>` — daran hing der Griff `li > p`. **R9-2/A-3** (`55acbf45d`) hat genau
diesen sechsten byte-gleichen Datums-Formatierer eingesammelt; die Gruppe trägt
ihr Datum seither über den geteilten Baustein `src/components/ui/Datum.tsx:36`,
also als `span.lc-ziffern`. Der Selektor traf danach nichts mehr — die
Gruppierung selbst (`nachDatumGruppiert`) ist unberührt.

### Nullprobe

`git diff --quiet 018b41a37 HEAD -- src/components/start/EntscheideListe.tsx
src/components/ui/Datum.tsx` → **grün**: beide Dateien sind byte-gleich zur
Zweig-Basis. `git merge-base --is-ancestor 55acbf45d 018b41a37` → wahr. Der
Griff war auf der Basis schon tot; die Wurzel liegt **vor** diesem Zweig, GA/GB
haben sie nur sichtbar gemacht (der volle Lauf lief hier zum ersten Mal wieder
über die Gruppe).

### Entscheid: deklarierte Sonden-Änderung, kein Produkt-Fix

`<p class="num">` → geteilter Baustein ist die absichtliche Ersetzung (§5,
Entdopplung von sechs Formatierern). Ein Produkt-Fix wäre entweder der Rückbau
in die Kopie oder ein zusätzliches `data-…`-Attribut allein für die Sonde —
beides fügt Bewachung hinzu, wo der Baustein schon eine kanonische, ausdrücklich
nicht verhandelbare Rolle setzt (§17-Gegengewicht).

Die **drei Zusagen bleiben wörtlich** (Datum genau einmal je Gruppe · ein
Rechtsgebiet je Zeile · keine «Bundesgericht»-Fusszeile); nur der Griff folgt
dem Baustein: `li > .lc-ziffern`.

---

## 3 · Grün-Beweis

```
✓  1 e2e/uinav-j-rechtsprechung.e2e.ts:195:3 › Entscheid-Liste: Gebiet je Zeile, … (826ms)
✓  2 e2e/rechtsprechung.e2e.ts:106:3 › BS-Entscheid rendert: Kopf, Erwägungs-Sprunganker, … (1.4s)
   2 passed (15.7s)
```

Tor-Lauf der Fläche (`rechtsprechung*.e2e.ts`, `uinav-j-rechtsprechung.e2e.ts`,
`w224-ga-kopf.e2e.ts`, `w224-gb-register.e2e.ts`, `--repeat-each=2
--workers=2`) samt `npm run test`, `npx tsc -b`, `npm run lint`,
`check:ui-normzitate` und `golden:vergleich`: Schlusszeilen im Commit dieses
Zweigs.
