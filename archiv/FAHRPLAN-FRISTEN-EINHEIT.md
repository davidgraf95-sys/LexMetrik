# Fahrplan: EIN Fristenrechner-Erlebnis (Vereinheitlichung + Darstellung)

Stand: 10.6.2026 (Auftrag David: «im fristenrechner zuviele einzelne
engines. erstelle handlungsplan wie man diese vereinheitlichen kann und
nutzerfreundlicher darstellen»).

## Befund

Die Fristen-Kategorie führt heute 8 verfügbare Einstiege: Tagerechner
(intern bereits 3 Regime-Tabs Allgemein/ZPO/SchKG + Rückwärts + Zwischen-
tage), Fristenspiegel, zpo-fristen, schkg-fristen (Doppelpfad zu den
Tagerechner-Tabs — bewusst als Fach-/Laien-Einstieg), verjaehrung,
mietrecht, kuendigung-sperrfristen, gewaehrleistung, erbrecht-fristen.

**Technisch ist die Rechenbasis BEREITS vereinheitlicht** (fristenEngine/
datumsUtils/naechsterWerktag — V1–V3-Inventur 10.6.2026): Die Vielfalt ist
REGIME-getrieben (§4: Verjährungs-Unterbrechung ≠ 336c-Hemmung ≠ Miet-
Termine ≠ Gerichtsferien) und darf nicht in eine Engine kollabieren.
**Der Hebel liegt also in der DARSTELLUNG**: ein Einstieg, klare Führung,
Spezialfälle als beschriftete Abzweigungen.

## Leitidee

> **EIN «Fristen berechnen»-Einstieg** (der Tagerechner) mit Regime-Führung
> und einem durchsuchbaren PRESET-Katalog über alle fixen gesetzlichen
> Fristen; die Spezial-Engines bleiben eigenständige Werkzeuge (eigene
> Eingabemodelle!), erscheinen aber als **benannte Abzweigungen** («Ihr Fall
> hat ein eigenes Regime → Spezialrechner X»), nie als gleichrangiges Grid.

## Etappen (je §6-Tore; UI-Etappen golden-neutral)

### FE-1 · Informationsarchitektur der Fristen-Kategorie
Eine GROSSE Einstiegszeile «Fristenrechner» (Tagerechner, mit Regime-
Untertiteln Allgemein·ZPO·SchKG·Rückwärts) + «Fristenspiegel» daneben;
darunter die Spezialrechner als «Eigenes Regime»-Zeilen mit
Ein-Satz-Begründung, WARUM eigen (z. B. verjaehrung: «mit Unterbrechungs-
Kette»; kuendigung-sperrfristen: «mit 336c-Hemmung»). Der Doppelpfad
zpo-/schkg-fristen ↔ Tagerechner-Tabs bleibt (gewollt), wird aber als
«Fach-Direkteinstieg» gekennzeichnet.

### FE-2 · Geführte Regime-Frage im Tagerechner
Statt nackter Tabs eine Eingangsfrage «In welchem Verfahren läuft die
Frist?» (Allgemein/Vertrag · Zivilprozess · Betreibung · weiss nicht) —
«weiss nicht» öffnet eine ehrliche 3-Punkte-Weiche (gerichtliche Frist? →
ZPO · Betreibungshandlung? → SchKG · sonst Allgemein, mit den bekannten
Warnungen). Tabs bleiben als Schnellzugriff für Profis (URL-Hash erhalten).

### FE-3 · EIN Preset-Katalog über alle Regimes
Heute: zpoPresets (Phasen) + schkgPresets (Phasen, dual) + Tagerechner-
Mechanik-Presets + famStatusPresets — vier Orte. Neu: eine durchsuchbare
Preset-Leiste im Tagerechner («Frist suchen: ‹Einsprache Strafbefehl›…»),
die ALLE Preset-Quellen listet (Suche über label/norm, Muster
katalogSuche-Rang) und beim Wählen das richtige REGIME-Tab samt Parametern
setzt. Die Preset-DATEN bleiben je Regime-Datei (§5/§4 — V2-Erkenntnis:
kein gemeinsamer Typ-Brei), nur ein dünner Such-Index `presetIndex.ts`
aggregiert {label, norm, regime, setzen()}.

### FE-4 · Abzweigungs-Hinweise in beide Richtungen
Tagerechner erkennt Abzweigungs-SIGNALE deterministisch (z. B. Einheit
Jahre + Stichwort Verjährung im gewählten Preset → Hinweis auf
verjaehrung-Rechner; Kündigungs-Presets → sperrfristen/mietrecht) — reine
Hinweise, keine Auto-Navigation. Spezialrechner verlinken zurück («nur
Datum + feste Länge? → Tagerechner»). Spiegel bleibt der «alle Fristen
EINES Ereignisses»-Einstieg und wird in FE-1 prominent erklärt.

### FE-5 · Geteilte Ergebnis-Anatomie (Code, byte-golden)
Inventur der Fristen-Ergebnisblöcke (diesAdQuem-Karte, Stillstands-Zeile,
ICS/Teilen/Aktenzeichen, Begründungs-Absatz) über alle Fristen-Forms —
Rest-Dubletten in EINE Ergebnis-Komponente heben (reine Darstellung, §3;
Engines unberührt). Messlatte: golden byte-gleich + Smoke.

### FE-6 · Messlatte & Abnahme
Suchbegriff-Goldliste um Fristen-Laienbegriffe erweitern («Frist
Strafbefehl», «Kündigungsfrist Wohnung», «verjährt?») — jeder Begriff muss
den RICHTIGEN Einstieg ranken; Inventur-Zähler «ein Einstieg pro
Rechtsfrage» für die Fristen-Kategorie; Davids Abnahme der FE-1-Texte
(WARUM-eigen-Begründungen sind fachliche Aussagen).

## Tabu (aus FAHRPLAN-VEREINHEITLICHUNG übernommen)

Keine Engine-Fusion der Regimes (V2/V3-Verdikte); keine «intelligente»
Regime-Erkennung aus Freitext (§2 — die Weiche FE-2 fragt, sie rät nicht).

## Umsetzung (Session 10.6.2026 nachmittags)

- [x] FE-1 IA Fristen-Kategorie — `lib/fristenKategorie.ts` (Haupteinstiege/
  Fach-Direkteinstiege/Eigene-Regimes mit WARUM-Sätzen) + FristenRegister in
  `Katalog.tsx`; Invarianten-Test erzwingt Klassifikation jeder verfügbaren
  Fristen-Karte. **WARUM-Sätze = fachliche Aussagen, Abnahme David OFFEN.**
- [x] FE-2 Regime-Frage — Eingangsfrage + «Weiss nicht?»-Weiche (3 Punkte)
  im Tagerechner; Tabs/Hash unverändert.
- [x] FE-3 Preset-Index — `lib/presetIndex.ts` (dünner Index, Daten bleiben
  je Regime-Datei); Wahl setzt Tab + Parameter via Form-Link-Kodierung (§5),
  Form-Remount per search-Key. Dazu: SCHKG_LINK_SPEC → rechnerPermalinks.ts
  (geteilt), ZPO-presetKey dekodiert (Phase+Hinweis), famStatusPresets mit
  Keys + fp=, MECHANIK_PRESETS in die lib, fristQueryLesen s/l/e einzeln
  optional. Round-Trip-Tests Index↔Form. **Deklarierter Fix (MITTEL):
  SCHKG-Spec verwarf die Fristnaturen klagefrist/beschwerdefrist/
  ordnungsfrist beim Dekodieren geteilter Links.**
- [x] FE-4 Abzweigungen — Preset-Suche zeigt Eigenes-Regime-Treffer
  (katalogSuche über Karten); Jahre-ohne-Fach-Preset-Signal → Verjährungs-
  rechner; 5 Spezialrechner mit Rückverweis «Zum Fristenrechner».
- [x] FE-5 Ergebnis-Anatomie — Inventur (Subagent, alle 8 Forms + Spiegel):
  Anatomie BEREITS konvergent (geteilte Bausteine überall); einzige byte-
  gleiche Rest-Dublette (Mietrecht-Eckdaten) auf EckdatenKachel gehoben
  (SSR-byte-verglichen). Erb-/Sperr-/Gewährleistungs-Blöcke bleiben BEWUSST
  eigen (Akzentrand/Status-Farben/Bedingungsbäume — lieber Variation als
  falsche Abstraktion). Export-Zeilen-Vereinheitlichung VERWORFEN
  (Props-Parametrisierung würde Komplexität erhöhen).
- [x] FE-6 Messlatte — Goldliste +7 Fristen-Paare (Keywords Vaterschaft/
  KESB/Kündigungsfrist am Preset-/Engine-Code verifiziert); Inventur-Zähler
  2+2+5=9 in fristenKategorie.test.ts. **OFFEN: Davids Abnahme der
  FE-1-Texte (WARUM-Sätze) + der Weiche-Formulierungen (FE-2).**

Nicht aufgenommen (ehrlich): «Frist Strafbefehl» hat KEINEN richtigen
Einstieg (kein StPO-Preset im Tagerechner; Mehrwert-Test-Frage an David —
StPO-Fristen ohne Regime wären Tagerechner-Presets, Art. 89 Abs. 2 StPO
kennt keinen Stillstand).
