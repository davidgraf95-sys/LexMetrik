import type { RefObject } from 'react';
import { tabSchluessel, reiterKurzformTeile, reiterKurzformText, reiterTitel, type TabEintrag } from '../../../lib/tabs';
import type { VerlaufManifeste } from '../../../lib/verlaufLabel';
import { registerVonPfad, REG_FLAECHE, REG_TON } from '../bereiche';
import { SchliessKnopf } from '../../ui/SchliessKnopf';
import { REITER_MIME } from './ueberlauf';

// ═══ EIN REITER (§6.6-Split aus `Reiterleiste.tsx`, R13) ════════════════
//
// Wörtlich aus der Leiste herausgelöst — Ziehen, Kontextmenü-Auslöser,
// Registerfarbe, Fenster-Marke, Griffe. Die Leiste behält, was ÜBER den
// Reitern steht (Fenster, Tastatur, Überlauf, Blatt); dieser Baustein weiss
// nur, wie EIN Reiter aussieht und welche Rückrufe er auslöst (§3).

export interface ReiterProps {
  t: TabEintrag;
  /** 1-basierte Stelle in der GESPEICHERTEN Ordnung — nicht im Fenster:
   *  «Reiter 3» und Alt+3 meinen denselben Reiter, auch wenn das sichtbare
   *  Fenster ihn an erster Stelle zeigt (R13-3). */
  nr: number;
  aktiv: boolean;
  /** Ist dies der LETZTE Reiter der Speicherordnung? (Alt+9, R13-8) */
  letzter: boolean;
  manifeste: VerlaufManifeste;
  paneSchluessel: string[];
  zieht: string | null;
  ueber: { path: string; davor: boolean } | null;
  gezogenRef: RefObject<string | null>;
  kannOeffnen: boolean;
  istOffen: (path: string) => boolean;
  onDaneben: (path: string) => void;
  onNavigate: (path: string) => void;
  onSchliessen: (path: string) => void;
  onZieht: (path: string | null) => void;
  onUeber: (u: { path: string; davor: boolean } | null) => void;
  onMenue: (m: { path: string; x: number; y: number }) => void;
  /** Umordnen: gezogener Pfad, Ziel, davor/dahinter (`lib/tabs.ordneTabsUm`). */
  onUmordnen: (von: string, nach: string, davor: boolean) => void;
}

export function Reiter({
  t, nr, aktiv, letzter, manifeste, paneSchluessel, zieht, ueber, gezogenRef,
  kannOeffnen, istOffen, onDaneben, onNavigate, onSchliessen,
  onZieht, onUeber, onMenue, onUmordnen,
}: ReiterProps) {
  const schluessel = tabSchluessel(t.path);
  const { kopf, kern, stelle } = reiterKurzformTeile(t, manifeste);
  const name = reiterKurzformText(t, manifeste);
  // R8 · Volltitel, Stand/Datum/Kurzbeschreibung und Lesestellung stehen in
  // EINER Ableitung (`lib/tabs.reiterTitel`) — Herleitung dort.
  const titel = reiterTitel(t, manifeste);
  // ── R13-7 · DER TASTATURWEG STEHT AM ORT DER HANDLUNG ────────────────────
  // GEMESSEN 7.9.2026: in der ganzen Leiste 0 × `aria-keyshortcuts`; der
  // `title` nannte Stand, Datum und Lesestellung — aber keinen Alt-Weg.
  // Alt+1…9 und Alt+⇧+←/→ funktionierten, lernte aber niemand.
  // Die 9 gehört dem LETZTEN Reiter (Browser-Norm, R13-8): sie steht darum nur
  // dort, wo sie auch trifft — an Reiter 1–8 die eigene Zahl, am letzten
  // zusätzlich (bzw. ausschliesslich) die 9. Kein Kürzel an Reiter 10 ff.:
  // ein angezeigtes Kürzel, das nichts tut, wäre eine Zusage, die nicht gilt.
  const kuerzel = [nr <= 8 ? `Alt+${nr}` : null, letzter ? 'Alt+9' : null]
    .filter(Boolean).join(' ');
  const reg = registerVonPfad(t.path);
  // F10 · EINE REGEL FÜR BEIDE GRIFFE (✕ und ⧉): der aktive Reiter zeigt sie
  // immer, inaktive bei Hover ODER Tastatur-Fokus irgendwo im Reiter. Vorher
  // war das ✕ dauernd sichtbar und das ⧉ nur bei Hover — zwei Regeln für
  // dieselbe Zeile, und die Tastatur erreichte das ⧉ nur unsichtbar.
  const griffSicht = aktiv
    ? ''
    : 'opacity-0 transition-opacity group-hover/reiter:opacity-100 group-focus-within/reiter:opacity-100';
  // Aktiv-Marken der Panes: welcher Reiter steht in welchem Fenster (§5a
  // Ziff. 4). Bei einem einzigen Pane trägt der aktive Reiter keine Marke —
  // «links» ohne ein «rechts» sagt nichts.
  const paneIdx = paneSchluessel.length > 1 ? paneSchluessel.indexOf(schluessel) : -1;
  const paneWort = paneIdx === 0 ? 'links' : paneIdx > 0 ? 'rechts' : null;
  return (
    <div
      data-reiter-aktiv={aktiv}
      // Test-Anker: die Reiter-IDENTITÄT im DOM (`lib/tabs.tabSchluessel`).
      // Die Beschriftung taugt dafür nicht — sie hängt an lazy geladenen
      // Manifesten und ist genau das, was hier NICHT gemessen werden soll.
      data-reiter-schluessel={schluessel}
      draggable
      onDragStart={(ev) => {
        gezogenRef.current = t.path;
        onZieht(t.path);
        ev.dataTransfer.setData('text/plain', t.path);
        ev.dataTransfer.setData(REITER_MIME, t.path);
        ev.dataTransfer.effectAllowed = 'copyMove';
        // GHOST: der Reiter selbst hängt am Zeiger, gefasst dort, wo man ihn
        // angepackt hat. Chromium nimmt zwar von sich aus das gezogene
        // Element — aber erst NACH dem Handler und ohne Griffpunkt; ein
        // explizites `setDragImage` mit dem Zeiger-Offset ist der Unterschied
        // zwischen «etwas fliegt» und «ich halte diesen Reiter» (D15: die
        // Funktion war da, nur nicht als Funktion erkennbar).
        const kasten = ev.currentTarget.getBoundingClientRect();
        try { ev.dataTransfer.setDragImage(ev.currentTarget, ev.clientX - kasten.left, ev.clientY - kasten.top); }
        catch { /* ältere Engines ohne setDragImage — der Default-Ghost tut es auch */ }
      }}
      onDragOver={(ev) => {
        const von = gezogenRef.current;
        if (!von || von === t.path) return;
        ev.preventDefault();
        // SEITE AUS DEM ZEIGER-X (D15, «analog browser»): linke Hälfte des
        // Ziels = davor, rechte Hälfte = dahinter. Ohne diese Unterscheidung
        // liesse sich ein Reiter nie ans ENDE der Leiste ziehen — hinter dem
        // letzten gibt es kein weiteres Ziel.
        const kasten = ev.currentTarget.getBoundingClientRect();
        const davor = ev.clientX < kasten.left + kasten.width / 2;
        if (ueber?.path !== t.path || ueber.davor !== davor) onUeber({ path: t.path, davor });
      }}
      onDrop={(ev) => {
        ev.preventDefault();
        const von = gezogenRef.current ?? ev.dataTransfer.getData(REITER_MIME);
        if (von && von !== t.path) {
          const kasten = ev.currentTarget.getBoundingClientRect();
          onUmordnen(von, t.path, ev.clientX < kasten.left + kasten.width / 2);
        }
        gezogenRef.current = null; onZieht(null); onUeber(null);
      }}
      onDragEnd={() => { gezogenRef.current = null; onZieht(null); onUeber(null); }}
      // M4 · RECHTSKLICK ÖFFNET DAS REITER-MENÜ. Unterdrückt wird das
      // Browser-Kontextmenü NUR über einem Reiter — über der Leiste
      // daneben, über dem «+» und über der ganzen übrigen Seite bleibt es
      // erreichbar (Risiko aus dem Plan).
      onContextMenu={(ev) => {
        ev.preventDefault();
        onMenue({ path: t.path, x: ev.clientX, y: ev.clientY });
      }}
      title={kuerzel ? `${titel} — ${kuerzel.replace(' ', ' · ')}` : titel}
      // F9 · DER AKTIVE REITER IST EINE FLÄCHE, KEIN 4-EINHEITEN-UNTERSCHIED.
      // GEMESSEN 6.9.2026: aktiv `paper-raised` (255) gegen inaktiv `paper`
      // (251) — der Unterschied trug allein der 2-px-Strich. Jetzt trägt der
      // aktive Reiter die REGISTERFARBE seiner Domäne als leichte Tönung
      // (Papier bleibt Papier, die Farbe sagt zugleich, WELCHES Register).
      // `cursor-grab` / `active:cursor-grabbing` an der HÜLLE: die Affordanz
      // war der ganze D15-Befund — das Ziehen funktionierte, sah aber nach
      // nichts aus. Der Zeiger sagt jetzt schon vor dem Anfassen, dass hier
      // etwas zu greifen ist; die Griffe ✕/⧉ setzen ihren eigenen Zeiger.
      // Der gezogene Reiter nimmt sich zurück (`opacity-40`) — was am Zeiger
      // hängt, soll nicht zugleich an seinem alten Platz stehen.
      // ── R13-2 · DER REITER SCHRUMPFT, STATT ÜBER DIE KANTE ZU LAUFEN ────
        // Hier stand `shrink-0`. GEMESSEN 7.9.2026: 8 realistische Reiter
        // @1440 massen zusammen 1476 px in einem 1355 px breiten Streifen —
        // der Scrollbalken ist per CSS unsichtbar, ein «+N» gab es bei 8
        // Reitern noch nicht, also stand der letzte als stummes «Z» an der
        // Kante. Ohne `shrink-0` gibt der Reiter nach: der Kopf (das ohnehin
        // gekürzte Gericht) kürzt sich weg, die Untergrenze ist sein
        // `min-content` — die Geschäftsnummer bleibt ungekürzt (F6, unten).
        // Was auch dann nicht mehr passt, zieht ins Blatt (`useReiterFenster`).
        className={`group/reiter relative flex cursor-grab items-center border-r border-rule-soft active:cursor-grabbing ${
        zieht === t.path ? 'opacity-40' : ''
      } ${aktiv ? (reg ? REG_TON[reg] : 'bg-paper-raised') : ''}`}>
      {/* EINFÜGEMARKE (D15): 2 px in der Registerfarbe des GEZOGENEN Reiters,
          über die volle Reiterhöhe, auf der Seite, auf der er landen wird.
          Sie ersetzt den früheren, immer linken `border-l-2` — der konnte
          nicht sagen, ob der Reiter davor oder dahinter einrastet, und ans
          Ende der Leiste kam man mit ihm gar nicht. */}
      {ueber?.path === t.path && (
        <span aria-hidden data-reiter-marke={ueber.davor ? 'davor' : 'dahinter'}
          className={`pointer-events-none absolute inset-y-0 w-0.5 ${ueber.davor ? '-left-px' : '-right-px'} ${
            zieht && registerVonPfad(zieht) ? REG_FLAECHE[registerVonPfad(zieht)!] : 'bg-ink-900'}`} />
      )}
      {/* ── R1 (Prüfbefund R11, 6.9.2026) · DIE LEISTE IST NICHT TRIST ─────
          GEMESSEN: alle inaktiven Reiter trugen `bg-ink-400 opacity-30` —
          eine graue Leiste, in der die Registerfarbe erst beim Überfahren
          erschien. Der Streifen ist aber die EINE Stelle, an der man ohne
          Lesen sieht, was offen ist (Gesetz, Entscheid, Werkzeug …).
          ENTSCHEID (David «nicht trist»): jeder Reiter trägt seine eigene
          Registerfarbe, der inaktive auf 60 % Deckkraft, der aktive voll
          plus Flächen-Tönung (`REG_TON`, oben). 60 % ist die Stufe, die
          RUHIG bleibt und den aktiven Reiter trotzdem eindeutig lässt: er
          unterscheidet sich in ZWEI Merkmalen (volle Farbe UND Tönung),
          nicht nur in der Deckkraft. Der Hover hebt auf 100 % — dieselbe
          Auskunft wie vorher, nur nicht mehr die einzige.
          Ohne Register (Meta-Route) bleibt es bei Tinte: geraten wird keine
          Farbe (§8). */}
      <span aria-hidden className={`absolute inset-x-0 bottom-0 h-0.5 ${
        aktiv
          ? (reg ? REG_FLAECHE[reg] : 'bg-ink-900')
          : `${reg ? REG_FLAECHE[reg] : 'bg-ink-400'} opacity-60 group-hover/reiter:opacity-100`}`} />
      <button type="button" aria-current={aktiv ? 'page' : undefined}
        aria-keyshortcuts={kuerzel || undefined}
        onClick={() => onNavigate(t.path)}
        onAuxClick={(ev) => {
          // Mittelklick schliesst — das Browser-Idiom, das David meint.
          if (ev.button === 1) { ev.preventDefault(); onSchliessen(t.path); }
        }}
        // M4 · DASSELBE MENÜ OHNE MAUS: Shift+F10 und die Menü-Taste sind
        // die beiden Wege, die Windows/Linux-Tastaturen dafür kennen
        // (WCAG 2.1.1 — eine Zeigergeste allein wäre keine Bedienung).
        // Verankert wird es an der linken unteren Ecke des Reiters, nicht am
        // Zeiger, den es hier nicht gibt.
        onKeyDown={(ev) => {
          if (ev.key !== 'ContextMenu' && !(ev.key === 'F10' && ev.shiftKey)) return;
          ev.preventDefault();
          const k = ev.currentTarget.getBoundingClientRect();
          onMenue({ path: t.path, x: k.left, y: k.bottom });
        }}
        className={`flex min-w-0 items-baseline gap-1 py-1.5 pl-2.5 pr-1 text-body-s ${
          aktiv ? 'font-medium text-ink-900' : 'text-ink-600 hover:text-ink-900'}`}>
        <span className="sr-only">{`Reiter ${nr}: `}</span>
        {/* F6 · DIE GESCHÄFTSNUMMER WIRD NIE GEKÜRZT. Gekürzt wird der Kopf
            (das Gericht, ohnehin schon abgekürzt); der Kern trägt die Nummer
            und steht `shrink-0`. Der Deckel sitzt darum AM KOPF, nicht am
            Knopf: läge er am Knopf, ragte ein langer Kern als `shrink-0`-Kind
            über dessen Kasten und legte sich über die ⧉/✕-Griffe daneben.
            Ohne Kopf kürzt der Kern selbst — dann ist er der ganze Name
            (Gesetz, Rechner, Vorlage) und nichts daran ist geschützt. */}
        {/* ── DIE WORTFUGE IST EIN ECHTES LEERZEICHEN, KEIN `gap` ─────────
            GEMESSEN 6.9.2026 (`e2e/w224-plus-reiter`, nach der D27-Trennung):
            der Knopf las sich als «Art. 257dOR» — die Lücke kam allein aus
            `gap-1` des Flex-Kastens, und die trägt weder `textContent` noch
            die Berechnung des Accessible Name (WCAG 4.1.2: eine Sprachaus-
            gabe hätte «Artikel 257dOR» gesagt). `{' '}` ist ein Leerzeichen-
            Textknoten: als Flex-Kind wird er nicht gerendert (das Bild bleibt
            byte-gleich, die Lücke macht weiter `gap-1`), im Text steht er.
            Gilt für BEIDE Fugen — die zum Kopf hatte den Defekt schon
            vorher («OGer AGHOR.2024.19»). */}
        {kopf && <span className="truncate max-w-[9rem]">{kopf}</span>}
        {kopf && ' '}
        {/* ── D27 (David 6.9.2026) · DIE LESESTELLUNG STEHT IM REITER ──────
            «diese funktion, dass es anzeigt in welchem artikel wir sind,
            soll der tab bekommen.» Die Stelle wandert beim Scrollen (aus
            `lib/tabs`, entprellt auf 200 ms vom Scroll-Spy des Lesers) —
            und ein wandernder Text ändert seine Breite. Läge er im selben
            Fluss wie der Kern, schöbe jeder Artikelwechsel alle Reiter
            rechts davon. `.rl-stelle` (index.css) reserviert darum eine
            feste Breite, auch solange die Stellung noch unbekannt ist
            (`stelle === ''`): die Leiste steht schon vor dem ersten
            Spy-Lauf da, wo sie danach steht. Nur Gesetzes-Reiter tragen den
            Platz (`stelle === null` = keine Stellung möglich). */}
        {/* ── R13-4 · KEIN LEERER PLATZHALTER MEHR ────────────────────
            GEMESSEN 7.9.2026: ein Gesetzes-Reiter OHNE Lesestellung trug
            `.rl-stelle` mit leerem `textContent` und 60 px Breite — ein
            sichtbares Loch links vom Namen (ZGB 137 px gegen 77 px ohne).
            Entscheid/Rechner/Vorlage hatten gar keinen Platzhalter; die
            Reitertexte begannen also an drei verschiedenen Stellen.
            Der Platz wird jetzt erst reserviert, WENN eine Stellung da ist
            (`.rl-stelle:empty` fällt in `index.css` weg) — die Reservierung
            selbst bleibt, damit der wandernde Artikel den Reiter nicht bei
            jedem Scroll umbaut (D27). Der einmalige Übergang «keine Stelle →
            Art. 1» springt seit R13-2 nichts mehr: die Reiter schrumpfen
            gemeinsam, die Gesamtbreite des Streifens ändert sich nicht. */}
        {stelle ? <span className="rl-stelle num">{stelle}</span> : null}
        {stelle ? ' ' : null}
        <span className={kopf ? 'shrink-0' : 'truncate max-w-[15rem]'}>{kern}</span>
        {paneWort && <span className="sr-only">{` (Fenster ${paneWort})`}</span>}
      </button>
      {/* Fenster-Marke: zeigt, welcher Reiter links bzw. rechts steht. */}
      {paneWort && (
        <span aria-hidden title={`Fenster ${paneWort}`}
          className="shrink-0 border border-rule-soft px-1 text-micro leading-tight text-ink-500">
          {paneWort === 'links' ? '◧' : '◨'}
        </span>
      )}
      {/* «daneben öffnen» — der Klick-Weg zu dem, was das Ziehen ins zweite
          Fenster tut (§5a Ziff. 4); nur ab lg und mit freier Kapazität. */}
      {kannOeffnen && !istOffen(t.path) && (
        <button type="button" onClick={() => onDaneben(t.path)}
          aria-label={`«${name}» daneben öffnen`} title="Daneben öffnen"
          className={`hidden lg:inline-flex h-6 w-5 shrink-0 items-center justify-center text-ink-400 hover:text-ink-900 ${griffSicht}`}>
          <span aria-hidden className="lc-griff-glyph">⧉</span>
        </button>
      )}
      {/* A3-1: EIN Schliess-✕ der App; der Klick wirft ein offenes Dokument
          samt Leseposition weg — derselbe deklarierte destruktive Ton wie in
          der Reiter-Liste und der Pane-Titelleiste.
          `komfort={false}`: die 44-px-Trefferfläche des Bausteins läge in
          einer 28-px-Reiterzeile über dem ⧉-Nachbarn UND über dem nächsten
          Reiter — dieselbe begründete Ausnahme wie dort; die AA-Untergrenze
          (24 px, WCAG 2.5.8) hält die Grundklasse. */}
      <SchliessKnopf name={`Reiter «${name}» schliessen`} ton="destruktiv" komfort={false}
        onClick={() => onSchliessen(t.path)} klasse={`h-6 w-6 mr-1 shrink-0 ${griffSicht}`} />
    </div>
  );
}
