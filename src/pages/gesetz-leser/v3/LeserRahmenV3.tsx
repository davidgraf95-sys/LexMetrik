import { isValidElement, useId, useRef, type CSSProperties } from 'react';
import { grundartMeta } from '../helpers';
import { paneRoot } from '../berechnungen';
import { ErlassKopfBlock } from '../parts';
// Geteilte ANSICHTS-ZUSTÄNDE (Fehlseite · Currency-Pin · pdf-embed · Laden).
// Der zweite verbleibende Berührungspunkt zur `inhalt-*`-Familie neben dem
// Daten-Adapter — und ein bewusster: das sind Zustände des LESERS, nicht der
// Hülle. Sie umzuziehen hiesse, eine unter FL-4 eingefrorene Datei anzufassen;
// die Umbenennung in einen neutralen Namensraum gehört zu H5.
import { LadeAnzeige, FruehAnsicht } from '../inhalt-ansichten';
import { WeiterlesenChip } from '../parts/WeiterlesenChip';
import { LeserTastatur } from '../parts/LeserTastatur';
import { LeserKopf } from './LeserKopf';
import { LeserSeitenleiste } from './LeserSeitenleiste';
import { LeserGliederung } from './LeserGliederung';
import { LeserLesespalte } from './LeserLesespalte';
import { LeserLeseZeile } from './LeserLeseZeile';
import { LeserLeisteSheet } from './LeserLeisteSheet';
import { LeserErlassKopfZone } from './LeserErlassKopfZone';
import { LeserPanelZone } from './LeserPanelZone';
import { PanelZaehler } from './LeserPanelOeffner';
import { normZitat, panelBezug, trefferZahl, usePanelBezuege, usePanelZustand } from './panelModell';
import { SuchSprungFeld } from './SuchSprungFeld';
import { suchZoneAufbau } from './suchZoneAufbau';
import { SchwebeMeldung } from '../../../components/ui/SchwebeMeldung';
import { useTrefferBlatt } from './useTrefferBlatt';
import { useKopfAnspruch } from './useKopfAnspruch';
import { useStickAusgleich } from './useStickAusgleich';
import { leserCssVariablen } from './leserGeometrie';
import { rahmenBild, useRahmenRaum } from './rahmenSpalten';
import { kopfElemente, kopfGlypheKlassen, kopfGriffKlassen, panelForm, useKopfStufe } from './kopfStufen';
import { useSuchSprungKuerzel } from './suchKuerzel';
import { bestimmungsWort as bestimmungsWortVon, panelEbene, suchFeldName, suchPlatzhalter } from './erlassAnsicht';
import { LeserUebersicht } from './LeserUebersicht';
import { useLeserV3Modell } from './leserV3Modell';

// ═══ LESER V3 · Rahmen (FAHRPLAN-LESER-V3, Etappe H1) ═══════════════════════
//
// **Nur Layout.** Daten und Effekte kommen fertig aus `./leserV3Modell` (die
// eine Naht zur geteilten Maschinerie), der Lesekörper aus `./LeserLesespalte`.
// Diese Datei entscheidet ausschliesslich, **wo etwas steht** — und ist damit
// die Datei, die man liest, um die Hülle zu verstehen.
//
// DER AUFBAU, VON OBEN:
//   LeserKopf   klebt · Kürzel · ⚖ · ☰ · Ansicht · Such-Zone (4a/Ä19/D28)
//   ┌ aside ────────────┬ Zelle ───────────────────────────┐
//   │ Übersicht (zu)    │ ErlassLeserKopf                  │  (Kap. 4b/4e)
//   │ Gliederung klebt  │ ErlassKopfBlock (Ingress)        │
//   │                   │ Lesespalte  ← KERN, eingefroren  │  (Kap. 1.3)
//   └───────────────────┴──────────────────────────────────┘
// Das Feld steht seit D28 (6.9.2026) in JEDER Lage im klebenden Kopf-Block
// (`./SuchZone`); ohne Spalte wandert nur die Gliederung in ein Bottom-Sheet
// hinter ☰.
//
// ── DIE ERWEITERUNGS-SLOTS SIND GESTRICHEN (C4/H3, ein Eintrag statt zwei) ──
// `beiwerkSlot` · `fassungsWahl` · `leisteExtra` (H1, Fundament-Auflage 3) und
// `panelOeffner`/`panelSlot` (H3): null Aufrufer über drei Etappen, und die
// beiden Panel-Slots waren von aussen gar nicht füllbar (sie brauchen
// `useLeserV3Modell`, das erst HIER läuft — §5-Bruch). §17 in der Fassung vom
// 13.8.2026: was nicht scheitern kann, wird gestrichen statt bewacht; sie sind
// in der Historie greifbar, wenn ein echter Konsument auftritt. Vollständige
// Herleitung samt Befundliste: Vollzugsvermerk H3 im Fahrplan Kap. 7.
// (Gestrafft H4-II 18.8.2026 — der Absatz stand hier in voller Länge und die
// Datei klemmte an der 420-Zeilen-Sonde; §6.6.)
//
// ── EINE WURZEL FÜR PANE UND BREITE (Kap. 10) ───────────────────────────────
// `imPane`/`istSekundaer`/`istXl` kommen als `umgebung` aus dem Modell und
// werden GENAU HIER gelesen — sonst nirgends in `v3/` (bewacht von
// `src/tests/leser-v3-fundament.test.ts`). Die zwei Werte, die daraus folgen,
// stehen als CSS-Variablen am Wurzel-Element — damit rechnet auch der
// Sprung-Offset der Anker aus derselben Quelle (Risiko R1, Lehre LM-003).
//
// Bis 16.8. lag `umgebung` zusätzlich in einem React-Kontext
// (`LeserV3Kontext.ts`) mit NULL Konsumenten — alle Bauteile bekommen ihre Werte
// als Prop. Gestrichen statt bewacht (§17 Rückbau, Architektur-Review A2).

export interface LeserRahmenV3Props {
  ebene: string;
  schluessel: string;
}

export function LeserRahmenV3({ ebene, schluessel }: LeserRahmenV3Props) {
  const { modell: m, umgebung } = useLeserV3Modell({ ebene, schluessel });
  const { stufe, kopfRef } = useKopfStufe();
  // A3: die Id der Panel-Fläche entsteht HIER — Öffner und Fläche stehen in
  // verschiedenen Teilbäumen und brauchen dieselbe (`aria-controls`).
  const panelId = useId();
  // H3 · Panel: Zustand und Bezugs-Daten. BEIDE Hooks stehen VOR den frühen
  // Rückgaben (Hooks laufen nicht bedingt) und kosten im Ruhezustand nichts —
  // `usePanelBezuege` bekommt den Erlass-Key erst, wenn das Panel einmal offen
  // war, und ohne Key lädt die Bezugs-Hook nicht (Nachladen, Kap. 7).
  const rohPanel = usePanelZustand();
  const bezuege = usePanelBezuege(m.erlass?.key, rohPanel.jeGeoeffnet);
  // V6/Ä88: Höhenausgleich, wenn der klebende Kopf-Block wächst — Befund,
  // Messreihe und der Vertrag von `mitAusgleich`/`wurzelRef`:
  // `./useStickAusgleich`. Scroller aus derselben `paneRoot`-Auflösung wie
  // «↑ Anfang» (§5). Die LAGE trägt seit dem H4-Nachzug BEIDE Auslöser: die
  // Gliederung faltet den Kopf, und seit Ä60 (c) faltet das Beiwerk-Blatt
  // zwischen 1024 und 1391 px die Gliederung — also auch den Kopf.
  const { wurzelRef, mitAusgleich } = useStickAusgleich(
    `${m.tocOffen}·${rohPanel.offen}`,
    paneRoot(umgebung.imPane, umgebung.wurzel), m.aktivToken);
  const setzeTocOffen = (auf: boolean) => mitAusgleich(() => m.setTocOffen(auf));
  // Ä88: JEDER Weg, der das Blatt auf- oder zumacht, läuft durch den Ausgleich —
  // Kopf-Zähler, Menü-Eintrag, Taste «r», das ✕ und Esc des Blattes selbst.
  // Gewickelt wird darum der ZUSTAND, nicht jeder Aufrufpunkt: ein vergessener
  // Aufrufpunkt wäre genau der Sprung, den diese Zeile verhindert (§5).
  const panel = {
    ...rohPanel,
    oeffne: (r?: Parameters<typeof rohPanel.oeffne>[0]) => mitAusgleich(() => rohPanel.oeffne(r)),
    schliesse: () => mitAusgleich(rohPanel.schliesse),
    umschalten: () => mitAusgleich(rohPanel.umschalten),
  };
  // Ä60 (c) · WIE BREIT der Rahmen ist und WELCHE Spuren er trägt: `./rahmenSpalten`
  // (Herleitung, Messreihe und die eine Schwelle stehen dort). Gemessen wird der
  // RAUM im `<main>`, nicht das eigene Element — sonst entschiede der Rahmen über
  // seine Breite anhand seiner Breite.
  const { raum, raumRef } = useRahmenRaum();

  // ⌘K / «/» — Zusage des RAHMENS, nicht des Feldes (Bug-Check B1). Steht VOR den
  // frühen Rückgaben, weil Hooks nicht bedingt laufen dürfen.
  // A3: WELCHES Pane den Tastendruck bekommt, entscheidet `./suchKuerzel` am
  // Fokus. KEIN `onKuerzel` mehr — das Feld ist in jeder Lage im DOM (Kopf-Zone
  // bzw. offenes Blatt), es ist also nichts zu öffnen (§17 Rückbau).
  const suchFeldRef = useRef<HTMLInputElement>(null);
  useSuchSprungKuerzel({ feldRef: suchFeldRef, imSekundaerenPane: umgebung.istSekundaer });
  // Ä76: Offen-Zustand des Treffer-Blattes (Herleitung in `./LeserTrefferBlatt`).
  // Vor den frühen Rückgaben — Hooks laufen nicht bedingt.
  const trefferBlatt = useTrefferBlatt(m.sucheBegriff);

  // Frühe Ansichten (Fehlseite · Currency-Pin · pdf-embed · nur-live-link) und
  // der Ladezustand — dieselben Bausteine wie die Ist-Hülle (§5).
  const frueheAnsicht = FruehAnsicht({
    fehler: m.fehler, schluessel, manifest: m.manifest, erlass: m.erlass,
    currency: m.currency, kopf: m.kopf, internRefs: m.internRefs,
  });
  // V1: Der Kopf-Anspruch der Fassade ist eine RESERVIERUNG und auf drei Wegen falsch
  // (Fehlseite · pdf-embed · nur-live-link — dort stand weder App-Krume noch ✕); der
  // Lade-Platzhalter ist der Übergang, für den sie existiert (`./useKopfAnspruch`).
  useKopfAnspruch(isValidElement(frueheAnsicht) && frueheAnsicht.type !== LadeAnzeige);

  if (frueheAnsicht) return frueheAnsicht;
  if (!m.erlass || !m.eintraege) return <LadeAnzeige />;

  const { erlass, eintraege } = m;
  const meta = grundartMeta(erlass.key);
  const bestimmungsWort = bestimmungsWortVon(erlass.key); // B8: EINE Ableitung
  const hatLeiste = eintraege.length > 0;
  const bild = rahmenBild({
    raum, spaltenLage: hatLeiste && umgebung.istXl, tocOffen: m.tocOffen,
    blattOffen: panel.offen, ruheForm: panelForm(stufe, !umgebung.imPane),
  });
  const zweiSpalten = bild.gliederungSpalte;
  // ── P3 (3b) · DREI NAMEN FÜR DREI DINGE (H4-Nachzug 18.8.2026) ────────────
  // Bis hierher hiess die Zeile darunter `blattOffen` — und im selben Bau hiess
  // auch das BEIWERK-Blatt so (`rahmenBild({ blattOffen: panel.offen })`,
  // `bild.blattForm`). Zwei Flächen, ein Wort: der Architektur-Review 18.8.2026
  // hat es als (3b) gemeldet, und die dritte Formulierung stand weiter unten als
  // `zweiSpalten || blattOffen` — eine Frage ohne Namen.
  //   `gliederungsSheetOffen`  das GLIEDERUNGS-Sheet (☰, unter der Spaltenschwelle)
  //   `panel.offen`            das BEIWERK-Blatt (Rechtsprechung & Kontext)
  //   `leisteSteht`            trägt die Seitenleiste den Steckbrief gerade
  //                            irgendwo — als Spalte ODER im Sheet?
  const gliederungsSheetOffen = !umgebung.istXl && m.tocAuf && hatLeiste; // A2: Feld im Blatt
  const leisteSteht = zweiSpalten || gliederungsSheetOffen;

  // Ä20 · Platzhalter-Beispiel = amtliches Etikett des ERSTEN Eintrags («Art. 1»
  // bzw. «§ 1»), nie aus dem Bestimmungswort gebaut (§5, `./erlassAnsicht`).
  const beispielBestimmung = eintraege[0]?.artikelLabel ?? null;

  const suchFeld = (
    <SuchSprungFeld wert={m.suche} setzeWert={m.setSuche} loeseArtikel={m.loeseArtikel}
      onSprung={m.springeZuArtikel} feldRef={suchFeldRef}
      // Ä112/Ä126 (18.8.2026): der Platzhalter nennt die SACHE («Im Erlass
      // suchen») — sonst standen @720–1440 zwei fast gleich beschriftete
      // Suchfelder übereinander (Topbar vs. Leser). Das KÜRZEL steht nur im
      // zugänglichen Namen: es ist im Register nicht längenbeschränkt und
      // sprengte @390 das Feld. Herleitung in `./erlassAnsicht.suchPlatzhalter`.
      platzhalter={suchPlatzhalter(beispielBestimmung)}
      ariaName={suchFeldName(m.erlass?.kuerzel)} escLeert={!gliederungsSheetOffen}
      // H2 (Kap. 4h): ↑↓ und Enter bedienen dieselbe Fundstellen-Folge wie die
      // ↑↓-Knöpfe im Kopf der Trefferliste — EIN Weg, zwei Bedienarten (§5).
      hatTreffer={m.fundstellen > 0}
      onVor={() => m.springeZuFundstelle?.(1)}
      onZurueck={() => m.springeZuFundstelle?.(-1)} />
  );

  const leiste = (imSheet: boolean) => (
    <LeserSeitenleiste
      // Ä32: im TREFFER-Blatt keine Ankunfts-Übersicht über der Trefferliste.
      uebersicht={imSheet && m.sucheAktiv ? undefined : <LeserUebersicht m={m} bestimmungsWort={bestimmungsWort} />}
      // D28: kein Feld in der Leiste (`./SuchZone`); im Sheet: `sprungFeld` (A2).
      baum={<LeserGliederung m={m} bestimmungsWort={bestimmungsWort} />}
      baumKnoepfe={!m.sucheAktiv} // Ä32: «alles auf/zu» nur zum Baum
      // Ä10: im Sheet benennt der Sheet-Kopf die Zone (sonst «Gliederung» doppelt).
      baumTitel={imSheet ? undefined : (m.sucheAktiv ? 'Treffer' : 'Gliederung')}
      onAlleAuf={() => m.setTocBaum((o) => ({ ...o, ...Object.fromEntries(m.alleKnotenIds.map((id) => [id, true])) }))}
      onAlleZu={() => m.setTocBaum((o) => ({ ...o, ...Object.fromEntries(m.alleKnotenIds.map((id) => [id, false])) }))}
      alleOffen={m.alleKnotenIds.length > 0 && m.alleKnotenIds.every((id) => m.tocBaum[id] === true)}
      onAnfang={m.zumAnfang} />
  );

  // D28 (6.9.2026): der Kopf-Block trägt das Feld IMMER — bis hierher stand
  // `&& !zweiSpalten`, und dieses Hin-und-Her war der Mangel (`./SuchZone`).
  const suchZoneKlebt = hatLeiste;
  // Zusammensetzung in `./suchZoneAufbau` (§6.6-Auslagerung 17.8.2026); der
  // Rahmen sagt, OB die Zone klebt und WAS darin steht.
  const suchZone = suchZoneAufbau({
    klebt: suchZoneKlebt, istXl: umgebung.istXl, sucheAktiv: m.sucheAktiv,
    // `blattOffen` = Prop-Name von `suchZoneAufbau`; Quelle davor umbenannt.
    blattOffen: gliederungsSheetOffen, suchFeld, bestimmungsWort,
    liste: <LeserGliederung m={m} bestimmungsWort={bestimmungsWort} />,
    bestimmungen: m.treffer.length, fundstellen: m.fundstellen,
    trefferBlatt, onSheet: () => m.setTocAuf(true),
    // D28 · ‹ ›: dieselben Callbacks wie ↑↓ im Feld (§5, eine Folge).
    onVor: () => m.springeZuFundstelle?.(1),
    onZurueck: () => m.springeZuFundstelle?.(-1),
    listeSteht: zweiSpalten, // D28-Nachzug, Herleitung in `./SuchZone`
  });

  // ── H3 · Panel: WO es steht, WAS am Öffner steht ──────────────────────────
  // Die Overlay-Wurzel und die Pane-Rolle stehen hier EINMAL — Gliederungs-Blatt
  // und Panel-Blatt hängen in dieselbe Schicht und müssen dieselbe Rolle tragen
  // (H2-Befund, `./LeserLeisteSheet`).
  const overlayZiel = (umgebung.imPane && umgebung.overlayWurzel?.current) || null;
  const paneRolle = umgebung.istSekundaer ? 'sekundaer' as const : 'primaer' as const;
  // Ohne Leseposition gilt der ERSTE Artikel — benannt, nicht stillschweigend
  // (Begründung und Befund in `./panelModell`, `panelBezug`).
  const panelZiel = panelBezug(m.aktArtikel, m.aktivToken, eintraege[0]);
  const panelArtikel = panelZiel.label;
  // Die Zone steht, solange ein Öffner sichtbar IST oder das Panel offen ist —
  // das zweite ist der F8-Fall: mit «Rechtsprechung im Text: aus» gibt es keine
  // Lasche und keinen Zähler, das per `r` geöffnete Panel muss trotzdem rendern
  // (`panelModell`, `offen` ist bewusst nicht mit `oeffnerSichtbar` verrechnet).
  const panelZone = panel.oeffnerSichtbar || panel.offen;
  // A1: die Zahl gilt nur, wenn der Lade-VERSUCH durch ist — `bezuege.geladen`
  // kommt aus der Hook, die den Fetch kennt (Herleitung dort). Der abgelöste
  // Klassen-Zähler konnte «nichts erfasst» nicht von «lädt noch» trennen.
  const panelZahl = trefferZahl(bezuege.bezuegeFuer, bezuege.geladen, panelZiel.token);

  // Ä79 (H4-II): steht die Schiene, ist SIE der eine Griff — die Herleitung samt
  // Messreihe steht am Bauteil, das sie betrifft (`./LeserGliederungSchiene`).
  const schieneSteht = bild.schiene;
  // Ä60 (c): die Schiene steht seit H4 aus ZWEI Gründen — der Nutzer hat die
  // Gliederung eingeklappt, ODER das Beiwerk-Blatt hat ihren Platz. Im zweiten
  // Fall wäre «einblenden» ohne das Schliessen des Blatts eine Zusage ohne
  // Wirkung (der Platz reicht nicht für beide), also tut der Griff beides.
  // P1-1 (18.8.2026): BEIDE Zustandswechsel in EINER Klammer — der Ausgleich
  // misst dann einmal und rechnet mit der Lage NACH beiden (früher zwei Aufrufe,
  // also zwei Messungen desselben Vorher-Werts).
  const schieneAuf = () => mitAusgleich(() => {
    m.setTocOffen(true);
    if (bild.schieneHoltPlatz) rohPanel.schliesse();
  });
  // ☰ nur, wenn die Gliederung gerade NICHT als Spalte steht — sonst ein Knopf
  // ohne Wirkung (Design-Grundlage Kap. 6, Icon-Flut-Verbot).
  // Ä90: dieselbe Bauform wie ⚖ und «Ansicht» (`kopfStufen.kopfGriffKlassen`) —
  // bis 17.8. war dies der einzige NACKTE Griff der Zeile.
  const gliederungKnopf = hatLeiste && !zweiSpalten && !schieneSteht
    ? (
      <button type="button" data-v3-gliederung-auf
        aria-expanded={umgebung.istXl ? m.tocOffen : m.tocAuf}
        onClick={() => { if (umgebung.istXl) setzeTocOffen(true); else m.setTocAuf((v) => !v); }}
        // ── Ä111 (18.8.2026) · ZWEI ☰, ZWEI ZIELE ──────────────────────────
        // GEMESSEN @390: zwei ☰ in derselben Kopfzone — links das der App-Topbar
        // («Navigation öffnen»), rechts dieses. Der Name sagte nur, WAS
        // dahinterliegt, nicht was der Klick tut; ein Screenreader las an beiden
        // ein Substantiv. JETZT nennt er die Handlung, wortgleich mit
        // «Gliederung ausblenden» (`LeserLeseZeile`) und «Gliederung einblenden»
        // (Schiene). Die GLYPHE bleibt: ein zweites Zeichen wäre eine
        // Entscheidung über das App-Icon-Set (`Icon.tsx`) und damit H5.
        title="Gliederung öffnen" aria-label="Gliederung öffnen" className={kopfGriffKlassen(stufe === 'mini')}>
        <span aria-hidden className={kopfGlypheKlassen(stufe === 'mini')}>☰</span>
      </button>
    )
    : undefined;

  return (
    <div
      ref={(el) => { kopfRef(el); wurzelRef.current = el; raumRef(el); }}
      data-leser-v3="rahmen"
      className="lc-leser space-y-5"
      data-grundart={meta.grundart ?? undefined}
      // Die Geometrie (sechs voneinander abhängige CSS-Variablen, Risiko R1) ist
      // eine reine Funktion in `./leserGeometrie` — dort steht auch die Herleitung
      // samt LM-003. Der Rahmen sagt nur noch, WELCHE Lage gilt (C5a, §6.6).
      style={{
        ...leserCssVariablen({
          stufe, vollflaechig: !umgebung.imPane, suchZoneKlebt,
          // D28-Nachzug: hoch nur, wenn die Zähler-Zeile wirklich steht.
          sucheAktiv: m.sucheAktiv && !zweiSpalten,
        }),
        // FIX PR #559 (Herleitung `rahmenSpalten.RahmenBild.lesemassMaxRem`): löst den 45rem-Fallback ab, reserviert die Blatt-Spur statisch.
        ...({ '--leser-lesemass-max': `${bild.lesemassMaxRem}rem` } as CSSProperties),
        // Ä60 (c): die Aufweitung. `undefined`, solange das Blatt keine eigene
        // Spur hat — dann ist der Rahmen Zeichen für Zeichen der bisherige.
        ...bild.breite,
      }}>

      {/* D27: kein `aktArtikel` mehr — Herleitung in `./LeserKopf`. */}
      <LeserKopf erlass={erlass} fussnotenAnzahl={m.fussnotenAnzahl}
        hatAenderungsvermerke={m.hatAenderungsvermerke}
        stufe={stufe} gliederungKnopf={gliederungKnopf}
        // F8-Regel David 16.8.2026 («Rechtsprechung im Text» aus ⇒ Zähler weg):
        // unverändert der EINE wirksame Torwächter, `panel.oeffnerSichtbar`.
        // H4-II: die Stufe entscheidet nur noch die GESTALT des Zählers, nicht
        // sein Dasein (`kopfElemente(stufe).panel`, Herleitung dort).
        panelOeffner={panel.oeffnerSichtbar
          ? (
            <PanelZaehler anzahl={panelZahl} artikelLabel={panelArtikel} offen={panel.offen}
              form={kopfElemente(stufe).panel}
              // A3: dieselbe Id wie die Fläche — sonst ist `aria-controls` null.
              panelId={panel.offen ? panelId : undefined}
              onKlick={panel.umschalten} />
          )
          : undefined}
        // A2/Ä92: der Weg zum Panel OHNE Tastatur und ohne Zähler — und genau
        // dann, wenn kein Zähler dasteht. «Ein Öffner je Breite» (Fahrplan
        // Kap. 7): derselbe Torwächter `panel.oeffnerSichtbar` entscheidet
        // BEIDE Öffner, damit sie nie zugleich stehen und nie zugleich fehlen.
        onPanelOeffnen={panel.oeffnerSichtbar ? undefined : () => panel.oeffne('entscheide')}
        suchZone={suchZone} />

      {/* Handy/schmales Pane: die GANZE Seitenleiste als Bottom-Sheet hinter ☰
          (Kap. 4b). Wiederverwendet wird die bestehende Sheet-Anatomie
          (Dialog-Rolle, Fokusfang, Esc, Portal in die Pane-Overlay-Schicht) —
          §5, kein zweiter Overlay-Mechanismus. Portal-Vertrag und Pane-Rolle:
          `./LeserLeisteSheet` (H3-Auslagerung = B10-Auflage des H2b-Nachzugs,
          §6.6); der Rahmen entscheidet OB, WOHIN und WAS darin steht. */}
      {gliederungsSheetOffen && (
        <LeserLeisteSheet ziel={overlayZiel} paneRolle={paneRolle}
          sheetRef={m.refs.tocDrawerRef} onSchliessen={() => m.setTocAuf(false)}
          pfad={m.siePfad} aktArtikelLabel={m.siePfadArtikel}
          // A2/Ä32: DASSELBE Feld zuoberst im Blatt (Fokus-Falle, WCAG 2.4.3;
          // die Such-Zone gibt es solange her) · «Sie sind hier» nur zum Baum.
          sprungFeld={suchFeld} feldZuoberst ortAnzeigen={!m.sucheAktiv}
          titel={m.sucheAktiv ? 'Treffer' : 'Gliederung'} baum={leiste(true)} />
      )}

      {/* Die Lese-Zeile — die drei Spuren nebeneinander (`./LeserLeseZeile`,
          Auslagerung H4-Nachzug 18.8.2026, §6.6). Der Rahmen entscheidet ihre
          Gestalt (`bild` aus `./rahmenSpalten`) und füllt ihre Slots; WIE die
          Spuren stehen, steht dort. */}
      <LeserLeseZeile bild={bild} vollflaechig={!umgebung.imPane} tocOffen={m.tocOffen}
        onSchieneAuf={schieneAuf} onGliederungZu={() => setzeTocOffen(false)}
        leiste={leiste(false)}
        zelle={<>
          {/* Der geteilte Erlass-Kopf (Kap. 4e) — Prop-Weitergabe in
              `./LeserErlassKopfZone` (H3-Auslagerung, §6.6). */}
          <LeserErlassKopfZone m={m} erlass={erlass} artikelAnzahl={eintraege.length}
            bestimmungsWort={bestimmungsWort} />
          {m.kopf && <ErlassKopfBlock kopf={m.kopf} intern={m.internRefs} />}
          {/* Ä76: der `trefferListe`-Prop ist gestrichen — er traf die
              EINGEKLAPPTE Spalte statt des angekündigten Rand-Falls, und der ist
              unerreichbar. Herleitung samt Messreihe steht am Bauteil, das sie
              betrifft (`./LeserLesespalte`, `./LeserTrefferBlatt`). */}
          <LeserLesespalte m={m} bezuege={bezuege} weckeBezuege={rohPanel.weckeDaten} bezuegeGeweckt={rohPanel.jeGeoeffnet} />
        </>}
        // H3 · Panel/Lasche. EIN Aufrufpunkt für beide Modi: im Spalten-Modus
        // füllt die Zone die dritte Grid-Spur, im Blatt-Modus hat sie keine Box
        // und liegt ausserhalb des Flusses.
        panelZone={panelZone
          ? (
            <LeserPanelZone form={bild.blattForm} panelId={panelId}
              paneZiel={overlayZiel} paneRolle={paneRolle}
              zustand={panel} bezuege={bezuege} erlassKey={erlass.key} quelleUrl={erlass.quelleUrl}
              normZitat={normZitat(panelArtikel, erlass.kuerzel)}
              artikelLabel={panelArtikel} erlassKuerzel={erlass.kuerzel}
              bestimmungsWort={bestimmungsWort} aktArtikel={panelZiel.token} ebene={panelEbene(erlass)}
              steckbrief={leisteSteht ? null : <LeserUebersicht m={m} bestimmungsWort={bestimmungsWort} />} />
          )
          : null} />

      {/* R4 «Weiterlesen» + R8 Tastatur — dieselben BAUSTEINE wie die Ist-Hülle
          (Kap. 4h: KEINE zweite Tastaturebene), direkt aus `parts/` statt über
          den Ist-Wrapper `inhalt-overlays`. Nur die PRIMÄR-/Einzelansicht: im
          sekundären Pane liefe sonst ein zweiter globaler keydown-Listener und
          j/k sprängen doppelt.
          `display: contents` am Träger ist kein Zierrat, sondern der Fix eines
          gemessenen 20-px-Shifts: `.lc-leser` trägt `space-y-5`, und dessen
          `> * + *`-Regel gäbe dem Lese-Inhalt einen Margin, sobald ein zweites
          Kind danebensteht — obwohl beide Overlays `fixed` sind und gar keinen
          Platz brauchen. Ein Träger ohne eigene Box nimmt den Margin entgegen
          und wirft ihn weg. */}
      <div className="contents">
        {/* Der Reiter-Toast gehört hierher, nicht an den Kopf des Rahmens: er
            ist `fixed` und braucht keinen Platz, stand als ERSTES Grid-Kind aber
            im `space-y-5`-Fluss und gab der Kopfzeile darunter ein `mt-5` — ein
            sichtbarer Sprung von 20 px, sobald er erschien (Bug-Check «Nice»,
            16.8.2026). Derselbe `display: contents`-Träger, der das schon für
            «Weiterlesen» und die Tastatur löst, nimmt den Margin entgegen und
            wirft ihn weg. F2-5 (31.8.2026): Geometrie und Optik kommen aus `ui/SchwebeMeldung` — der Toast war die Abweichung unter drei gleichen Rollen (`top-20` geraten statt `--nt-stick`, darum @390 über den Kopf-Griffen; Herleitung und Messung dort). Behalten: `role="status"`. M8 (6.9.2026): der INHALT hiess «Im neuen Reiter geöffnet — oben unter ☰» und war zweimal überholt — das ☰-Flyout ist mit der Arbeitsleiste (W2·24) weg, und der auslösende Knopf öffnet seit M8 das zweite Fenster statt eines zweiten Reiters (Herleitung in `ReiterAktion.tsx`). */}
        {m.reiterToast && (
          <SchwebeMeldung kante="oben" ausrichtung="rechts" rolle="status" inhaltKlassen="gap-2 px-3 py-2 text-body-s text-ink-700">
            <span aria-hidden className="text-brass-700">⧉</span>
            Daneben geöffnet — im Fenster rechts
          </SchwebeMeldung>
        )}
        {!umgebung.istSekundaer && m.weiterlesen && (
          <WeiterlesenChip label={m.weiterlesen.label}
            onWeiterlesen={m.weiterlesenSprung} onVerwerfen={m.weiterlesenVerwerfen} />
        )}
        {/* H3 · «r» zieht das Panel auf (KEINE zweite Tastaturebene, Kap. 4h) —
            der Weg, der bleibt, wenn der Zähler nach der F8-Regel weg ist; darum
            UNABHÄNGIG von `oeffnerSichtbar` gesetzt.
            A2 (Nachzug): der Listener läuft jetzt in BEIDEN Panes. Vorher stand er
            unter `!istSekundaer` — mit der Folge, dass «r» aus dem sekundären Pane
            das PRIMÄRE Panel aufzog (gemessen 17.8.2026). Doppelte j/k-Sprünge
            verhindert nicht mehr die Abwesenheit des Listeners, sondern seine
            Zuständigkeitsprüfung: er beansprucht den Tastendruck nur, wenn der
            Fokus in SEINEM Pane steht — dieselbe Regel wie bei ⌘K, aus derselben
            Quelle (`../panePrioritaet`). */}
        <LeserTastatur tokens={m.artTokens} aktivToken={m.aktivToken} onSprung={m.springeZuArtikel}
          onPanel={() => panel.oeffne('entscheide')} imSekundaerenPane={umgebung.istSekundaer} />
      </div>
    </div>
  );
}
