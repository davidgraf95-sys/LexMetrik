import { usePaneKontext } from '../../../components/layout/PaneKontext';
import { useKopieren } from '../../../components/useKopieren';
import { NEUER_TAB } from '../../../lib/benennung';
import { zitatMitAusweis, heuteIso } from '../../../lib/format';
import { urlMitHash } from '../../../lib/liveUrlSync';

// ═══ W2·24-D35-F1 · DIE AKTIONEN DES ARTIKELS ═══════════════════════════════
//
// Entscheid David 7.9.2026 (Variante A des D35-Vorschlags): was für GENAU
// DIESEN Artikel gilt, steht am Artikelende in EINER Funktionszeile — links die
// Rubriken mit ihren Zahlen, rechts diese Aktionen. Der Erlass-Kopf behält, was
// für den ganzen Erlass gilt.
//
// ── ZWEI BEFUNDE, DIE HIER ZUSAMMENFALLEN ──────────────────────────────────
// (1) UNSICHTBAR BIS ZUM HOVER. Bis D35 standen «Zitat · Link · Amtliche
//     Fassung ↗» in der Artikel-KOPFZEILE unter `opacity-0`, sichtbar erst bei
//     Hover/Fokus/Touch (gemessen 7.9.2026, D35-Untersuchung Teil 1b: Deckkraft
//     0). Eine Aktion, die man nur findet, wenn man mit der Maus zufällig
//     darüberfährt, gibt es auf dem Telefon praktisch nicht. In der Fusszeile
//     stehen sie DAUERHAFT — kein `opacity-0`, keine Hover-Kette.
// (2) EIN ORT. Die Kopf-Variante ist mit D35-F1 ERSATZLOS gelöscht, nicht
//     zusätzlich gebaut (§5, §17-Gegengewicht): zwei Orte für dieselbe Aktion
//     wären genau die Dopplung, die dieser Schritt abräumt.
//
// ── D44 (David 7.9.2026) · «⧉ ARTIKEL DANEBEN» IST ERSATZLOS GESTRICHEN ────
// Die Zeile trug testweise eine vierte Aktion, die diesen Artikel per
// `usePaneSteuerung`/`naechsteInstanz` in ein zweites Fenster stellte
// (Herleitung, Messung `bb99937aa` und Nachfix: Git-Historie dieser Datei
// sowie `abnahme/design-identitaet/D35-F1-FUSSZEILE.md` §Nachzug). David
// wollte sie nicht — ersatzlos entfernt, kein zweiter Mechanismus dafür
// gebaut (§17-Gegengewicht). Die Zeile trägt seither nur noch die drei
// Aktionen, die es schon vor D35-F1 gab.
//
// FUNKTION, aria und title der drei bestehenden Knöpfe sind WORT FÜR WORT
// unverändert übernommen (§6: der Schritt verschiebt und macht sichtbar, er
// ändert keine Wirkung). Auch die LM-202-Regel wandert unverändert mit: der
// «Link»-Knopf schreibt den Anker in die Adresse, der «Zitat»-Knopf nicht, und
// im SEKUNDÄREN Pane schreibt keiner von beiden.

export function ArtikelAktionen({ artikel, basisPfad, zitat, zitatVoll, amtlich }: {
  /** Artikel-Token (`e.artikel`) — der Anker `#art-<token>`. */
  artikel: string;
  /** Pfad des Erlasses ohne Anker (`/gesetze/bund/OR`). */
  basisPfad: string;
  /** KURZ-Zitat («Art. 336c OR») — für die Namen der Aktionen. */
  zitat: string;
  /** VOLL-Zitat mit SR und Stand (§7 a–d) — der Text, der kopiert wird. */
  zitatVoll: string;
  /** EID-2 · amtlicher Deep-Link an genau diese Stelle, oder null (§8). */
  amtlich: string | null;
}) {
  // R4-D (5.9.2026): ZWEI Kopier-Knöpfe in einer Zeile ⇒ der geteilte Hook mit
  // MARKE, damit nur der geklickte sein Häkchen zeigt.
  const { marke: kopiert, kopieren } = useKopieren();
  // LM-202: der Teilen-Knopf schreibt die Adresse — im SEKUNDÄREN Pane nicht.
  // Massgeblich ist die ROLLE, nicht `imPane`: `Shell.tsx` montiert auch das
  // primäre Pane mit `imPane: true`; nur die Rolle unterscheidet die beiden.
  const { rolle } = usePaneKontext();
  const istSekundaer = rolle === 'sekundaer';

  /** §5 — EINE Kodierung für Kopie und Adresse (`urlMitHash`).
   *  Handgebaute Strings gerieten bei 54 Artikel-Token mit Leerzeichen oder
   *  Halbgeviert («22 a», «36–42», «10. 1») auseinander; ein Leerzeichen im
   *  Permalink bricht zusätzlich die Auto-Verlinkung in Mail und Chat. */
  const ursprung = typeof window !== 'undefined' ? window.location.origin : 'https://lexmetrik.ch';
  const permalink = urlMitHash(`${ursprung}${basisPfad}`, `art-${artikel}`);

  const kopiere = (was: 'zitat' | 'link') => {
    // B-6 (QS-BASIS): die Zitat-Kopie trägt den Stand-Ausweis (§7 a–d) —
    // `zitatVoll` liefert bereits «… (Stand …)», der Baustein ergänzt
    // Abrufdatum + Permalink (kein doppeltes Standdatum, §5). W2·10-UI-NAV/R3:
    // dazu der amtliche Deep-Link — derselbe Wert, den der Knopf «Amtliche
    // Fassung ↗» daneben ansteuert (EINE Quelle: `verifizierLinkArtikel`).
    // `?? undefined`: ohne validierten Link bleibt die Zeile ohne amtliche
    // Quelle statt mit einer geratenen (§8).
    const text = was === 'zitat'
      ? zitatMitAusweis(zitatVoll, { abruf: heuteIso(new Date()), permalink, amtlich: amtlich ?? undefined })
      : permalink;
    kopieren({ text, marke: was });
    // ── LM-202 (David-Entscheid 3.8.2026) ────────────────────────────────
    // «Die URL ändert sich NUR bei explizitem Klick auf einen Artikel-Anker
    // bzw. bei der Teilen-Aktion.» Der «Link»-Knopf IST die Teilen-Aktion; wer
    // ihn drückte und danach die Adresse las, sah bis LM-202 zwei verschiedene
    // Fundstellen. `replaceState`, damit das Kopieren keinen «Zurück»-Schritt
    // erzeugt. NUR beim Link: ein Zitat wandert in einen Schriftsatz, es ist
    // kein Ortswechsel. Und nur im primären Pane — das sekundäre ist nicht die
    // adressierte Seite (dieselbe Grenze wie `springeZuArtikel`).
    if (was === 'link' && !istSekundaer && typeof window !== 'undefined' && window.history) {
      window.history.replaceState(window.history.state, '', urlMitHash(window.location.href, `art-${artikel}`));
    }
  };

  return (
    <span className="lr7-bez-aktionen">
      <button type="button" onClick={() => kopiere('zitat')}
        className="lc-btn-mini text-micro text-ink-500 hover:text-brass-700"
        aria-label={`Zitat kopieren: ${zitatVoll}`}>{kopiert === 'zitat' ? '✓ kopiert' : 'Zitat'}</button>
      <button type="button" onClick={() => kopiere('link')}
        className="lc-btn-mini text-micro text-ink-500 hover:text-brass-700"
        aria-label="Permalink kopieren">{kopiert === 'link' ? '✓' : 'Link'}</button>
      {/* EID-2: Outbound zur amtlichen Fassung AN DIESER STELLE (ELI-Form,
          target/rel wie die übrigen amtlichen Links, §12.4). Ä110: EINE
          Schreibung für EIN Ziel — sichtbarer Text = aria-label = title. */}
      {amtlich && (
        <a href={amtlich} target="_blank" rel="noopener noreferrer"
          className="lc-btn-mini text-micro text-ink-500 hover:text-brass-700 no-underline whitespace-nowrap"
          aria-label={`Amtliche Fassung von ${zitat} auf Fedlex öffnen ${NEUER_TAB}`}
          title="Amtliche Fassung an genau dieser Stelle (Fedlex)">Amtliche Fassung ↗</a>
      )}
    </span>
  );
}
