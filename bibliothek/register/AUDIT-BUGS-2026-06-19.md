# Bug- & Logik-Audit — 19.6.2026

**Methode:** Zweistufiger read-only-Review der gesamten Codebasis (~87.500 LOC).
Runde 1 nach Rechtsdomäne (7 Reviewer), Runde 2 nach Fehlerklasse quer durch den
ganzen Code (8 Tiefen-Sweeps: Grenzwerte · Geld/Rundung · Datums-Arithmetik ·
null/NaN/Div0 · Array/Sort/Dedup · String/Regex · §5/§3-Konsistenz · Rechts-Edge-Cases).
Jeder HOCH/MITTEL-Befund adversariell mit Repro belegt; alle HOCH gegen den echten
Code verifiziert.

**Baseline bei Audit-Beginn:** `tsc · vitest · golden:vergleich · lint` grün;
Logik-Sweep 14.448 Kombinationen ohne Widerspruch. Die Befunde liegen also
durchweg jenseits der bestehenden Testabdeckung.

Status-Legende: ✓ = von Hand gegen Code verifiziert · (agent) = agent-verifiziert
mit Repro · [latent] = real, aber heute nicht über die UI auslösbar.

---

## HOCH (7)

### H1 · `sperrfristen.ts:526` — Hemmungsfenster beginnt vor Kündigungszugang ✓
`beginn_frist = subMonths(kb.ordentlichesEndeDatum, kb.fristMonate)` rutscht bei
Monatsende-Zugängen durch die date-fns-Klemmung **vor** den Zugang. Beispiel: Zugang
31.12.2025, Frist 2 Mt., Monatsendtermin → `addMonths(31.12,2)`=28.02.2026 →
`subMonths(28.02,2)`=28.12.2025 (3 Tage vor Zugang). Krankheit 28.–30.12. (komplett
vor Zugang) wird als Hemmung gezählt → Beendigung 31.03. statt 28.02. Widerspricht dem
eigenen Rechenweg-Satz «Sperrgründe vor Fristbeginn werden NICHT gehemmt».
**Fix:** Fensteruntergrenze auf `max(beginn_frist, zugang)` klemmen. Vorbild korrekt:
`mietrecht.ts:81` (`addMonths(zugang+1,…)` — der 1. eines Monats klemmt nie).

### H2 · `eheschutzgesuch.ts:304` / `scheidungsklage.ts` / `scheidungsbegehren.ts` — Rubrum: Rollenzeile labelt die Kinder ✓
Bei `kinderErfassen=true` wird der Kinder-Block (`\n\ngemeinsame Kinder: …`) an
`gesuchsgegnerRubrum` gehängt; im Schema folgt direkt die feste Rollenzeile
«(gesuchsgegnerische Partei)» → sie steht optisch unter den Kindern und bezeichnet
sie als Partei. **Fix:** Kinder-Block als eigener Baustein NACH der Rollenzeile.

### H3 · `datum.ts:40` (`zahl`) / `:22` (`fmtCHF`) — typografischer Apostroph U+2019 → Kapital 0 ✓ (repro)
Bereinigungs-Regex `/['\s]/` trifft nur ASCII-`'` (U+0027), nicht den typografisch
korrekten Schweizer Tausendertrenner `’` (U+2019, kommt bei Copy-Paste/macOS-Smartquotes).
`zahl("20’000")` → `null` → in `kapitalKern.ts:92` wird `(null ?? 0)*1 = 0` →
**Stammkapital 0** im GmbH-Gründungsdokument. Ausgelöst durch das rohe `<input>` in
`GmbhDokumentmappe.tsx:129` (kein `BetragsFeld`), dessen Platzhalter aktiv zum Apostroph
anleitet. **Fix:** Regex `/['’\s]/`.

### H4 · `mietrecht.ts:209` — Art. 257d Abs. 1: 10-Tage-Frist für Nicht-Wohn/Geschäftsräume fehlt ✓
Zahlungsfrist (Stufe 1) unbedingt `addDays(za,30)`, auch für `bewegliche_sache`,
`unbewegliche_sache`, `moebliertes_zimmer`/Einstellplatz (`!istRaum`). Art. 257d Abs. 1:
«mindestens zehn Tage, bei Wohn- und Geschäftsräumen mindestens 30 Tage» → ~20 Tage zu
lang. **Fix:** `istRaum ? 30 : 10` Tage.

### H5 · `passus.ts:3` + `pdf/normLinks.ts:23` — Artikel-Regex frisst lat. Suffix ✓ (repro)
`(\d+[a-z]?(?:bis|ter|quater|quinquies)?)` ohne abschließende Wortgrenze: «Art. 334bis»
→ `334_b` (das `[a-z]?` greift das «b», die Suffix-Gruppe matcht leer). Volltext-Popover
(`ladeSnapshot`) findet den Anker nicht → öffnet nicht; PDF-Export setzt toten Fedlex-Anker
`#art_334_b`. Korrekte Schwester `fedlex.ts:161` hat das fehlende `\b`. Der Kommentar
`normLinks.ts:21-22` («gefixt 10.6.») ist faktisch falsch — liefert weiter `art_334_b`.
**Fix:** `\b` (bzw. `(?![a-z])`) hinter die Suffix-Gruppe in beide Regexes.

### H6 · `beurkundungZusatzkosten.ts:56` — Emissionsabgabe: Freigrenze statt Freibetrag ✓
Behandelt 1 Mio als Freigrenze → über 1 Mio wird der GANZE Betrag × 1 % besteuert
(`1,5 Mio = 15'000`). `gruendungsunterlagen.ts:139` rechnet korrekt als **Freibetrag**
(nur Überschuss → 5'000). Art. 6 Abs. 1 lit. h StG (SR 641.10): befreit «*soweit* die
Leistungen … 1 Million Franken *nicht übersteigen*» = Freibetrag (nur der übersteigende
Teil steuerbar; gefestigte ESTV-Praxis). `beurkundungZusatzkosten.ts` überfakturiert um
10'000 bei 1,5 Mio; sein Pinning-Test zementiert den Fehler.
**Fix:** Auf Freibetrag umstellen, beide Engines auf eine geteilte Funktion vereinheitlichen;
Test als deklarierte fachliche Änderung (§6) korrigieren.
**Quelle:** Art. 8 Abs. 1 i.V.m. Art. 6 Abs. 1 lit. h StG, SR 641.10,
https://www.fedlex.admin.ch/eli/cc/1974/11_11_11/de (Stand 1.1.2024).

### H7 · `beurkundung.ts:26/44/239` (NW §20) — Staffel widerspricht eigenem Hinweis ✓ [recherche]
NW baurecht/vorkaufsrecht/verpfründung kodieren §20 GebVN als `0.25/0.20/0.15/…`
→ 1 Mio = 1'850, der Hinweis jedes Eintrags sagt aber «Bei 1 Mio = 2'100». NW
testament/erbvertrag kodieren denselben §20 als `0.30/0.25/0.15/…` → korrekt 2'100.
Interner Widerspruch. **Fix:** Sätze angleichen — VORHER NG 268.12 § 20 gegen die
amtliche Quelle verifizieren (Einträge stehen auf `verifiziert: recherche`, §7);
nicht blind ändern.

---

## MITTEL (12)

- **GAV stiller Wegfall** `arbeitsvertrag.ts:596`+`:310` ✓ — Gate verlangt nur `gavTyp`,
  `gavVariante` braucht aber `gavName`; bei leerem Namen erklärt der Vertrag einen
  normwirksamen GAV, enthält aber keine GAV-Klausel.
- **§5-Renderer-Divergenz Klage-Betreff** `klageOrdentlich.ts:244`/`klageVereinfacht.ts`
  (agent) — eingebettetes `\n`: DOCX setzt 2 fette Betreff-Zeilen + 2 Haarlinien,
  Vorschau kollabiert inline.
- **Normtext Item-Marken verstümmelt** `public/normtext/bund/*.json` (Generator
  `scripts/normtext/`) ✓ — cbis/cter/cquater/cquinquies alle als «c» gespeichert
  (`OR.json` art_336_c); abis als «a» (ZPO art_198); verschachtelte Ziffern geflacht →
  Zitat «lit. cbis» findet keine/falsche Markierung. §7-Build-Regel-Verstoß (Anzeigeschicht).
- **Nbis-Zwischenabsätze** `absatz:null` (202 Blöcke) → Absatz-Hervorhebung greift nicht. ✓
- **§5-Doppelpflege MwSt 8.1 %** `mietvertrag.ts:29` eigenes Literal statt
  `MWST_NORMALSATZ_PROZENT` (typen.ts:38) ✓ — driftet bei Satzänderung.
- **§5-Doppelpflege KTG-Schwellen** (80/720/3/50) doppelt in `lohnfortzahlung.ts:48`
  und `arbeitsvertrag.ts:300` ✓.
- **§5 hartkodierte 30000** `VorlageKlageOrdentlich.tsx:149` statt
  `ZPO_SCHWELLEN.VEREINFACHT` ✓.
- **`mietvertrag.ts:664`** (agent) — globaler `replace(/Mieter/g,…)` macht «Mieterschäden»
  → «Untermieterschäden» (Untermiete+Versicherung). Fix: `\bMieter\b`.
- **Probezeit Art. 335b III** `kuendigungsfrist.ts:35` (agent) — Verlängerung bei
  krankheitsbedingter Verkürzung nicht modelliert; Kündigung im verlängerten Fenster
  fälschlich als ordentlich. Keine Warnung (§8).
- **Tarif-Vereinfachungen** (agent) — ZH Verpfründung fehlt 1‰-Wertzuschlag
  (`beurkundung.ts:248`); SZ −50 %-Reduktion über 8/10 Mio fehlt (Audit-Backlog);
  TI Fixbetrag als Decke statt reduzierbares Maximum.
- **`notariatsgebuehrenGruendung.ts:59`** (agent) [latent] — einziger Tarif ohne
  Eingangs-Guard; «CHF NaN»/negativ. Heute durch Aufrufer `VorlageAgGruendung.tsx:1236`
  abgeschirmt; latent bei künftigem 2. Aufrufer (GmbH-Gründung).

---

## NIEDRIG (Auswahl)

- Verzugszins Zwischenrundung ±5 Rp. bei vielen Segmenten (`verzugszins.ts:235`).
- Arbeitsrecht-`30000` (Art. 113/114 ZPO) an 3 Stellen — **NICHT** mit Art. 243
  (`ZPO_SCHWELLEN.VEREINFACHT`) zusammenführen (numerisch gleich, rechtlich verschieden).
- `vorlagenText.ts:9` lässt Versions-/Entwurf-Zeile weg (≠ PDF/DOCX).
- Falscher Kommentar `allgemeineFrist.ts:230` («30.6−3M→31.3»; Code/Test korrekt 29.3).
- `lehrvertrag.ts:280` toter `endeSatz`.
- `scheidungsbegehren.ts:145` «und» nicht zentriert (rein optisch).
- erbFristen: kein Hinweis auf parallele relative/absolute Frist (§8).
- diverse Index-Keys in entfernbaren Listen / async-Unmount-Guards (kosmetisch).
- `lohnfortzahlung.ts:298` 2.-Kredit-Erklärungstext sequenziell behauptet, überlappend
  dargestellt (Enddatum korrekt).

---

## Ausdrücklich sauber bestätigt

Fristen-/Datums-Kern (frühere UTC-Bugs weg) · Grenzwert-Schwellen (alle < vs ≤ gegen
Wortlaut) · Gerichts-/Prozesskosten-Tarife (Staffel-Rahmen korrekt, `tarifInvarianten.test.ts`
schützt) · Zuständigkeit/Rechtsweg (keine falschen Ergebnisse) · Array/Sort/Dedup (keine
Mutation/Zahlen-`.sort()`) · Datums-Arithmetik (sperrfristen-Klemmung ist Einzelfall;
`mietrecht`/`allgemeineFrist` korrekt/konservativ) · Permalink/Hydration/Validierungs-Trigger.

## Abarbeitungs-Stand

Fixes nach Audit (per TDD): siehe Commits/STRUKTUR.md.
