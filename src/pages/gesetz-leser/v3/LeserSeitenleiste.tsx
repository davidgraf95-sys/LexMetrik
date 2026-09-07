import { useCallback, type ReactNode } from 'react';
import { AnfangSlot } from './anfangSlot';

// ─── Seitenleiste V3 — feste Reihenfolge, nur der Baum klebt (Kap. 4b) ──────
//
//   ▸ Übersicht  (SR 312.0 · 480 Art. · Stand …)        scrollt MIT weg
//   Gliederung        [alles auf/zu]   [↑ Anfang]       ◀ ab hier sticky
//    1. Teil … / 1. Titel …
//
// ── D28 (David 6.9.2026) · DIE GLIEDERUNG BEHÄLT NUR DIE GLIEDERUNG ─────────
// Über dem Baum stand bis hierher das Such-/Sprungfeld (Entscheid ② unten,
// Kap. 4b Pos. 4). Es ist in den klebenden Kopf-BLOCK des Lesers gezogen —
// «oben am gesetz», wo es beim Ein-/Ausklappen dieser Leiste stehen bleibt
// (Herleitung und Messung: `./SuchZone`, D28). Entscheid ② ist damit erledigt,
// nicht verworfen: es gibt weiterhin GENAU EIN Feld für Suche und Sprung, es
// steht nur nicht mehr hier. Die Leiste ist dadurch wieder eine Sache: der Baum.
//
// DREI ENTSCHEIDE, DIE HIER MARKUP WERDEN:
//  ① EINE Übersichtsbox statt drei (Fedlex hat drei) — und sie klebt NICHT.
//    Wer im Gesetz liest, braucht SR-Nummer und Stand einmal beim Ankommen,
//    nicht dauerhaft; der Platz gehört dem Baum.
//  ② (erledigt durch D28, s. o. — das Feld lebt im Leser-Kopf.)
//  ③ Der Baum klebt ab seiner eigenen Kopfzeile — mit «alles auf/zu» als
//    sichtbarem Knopf und OHNE Tastenkürzel: ein globales Auf/Zu ist im
//    W3C-ARIA-APG kein Baum-Standard, ein erfundenes Kürzel wäre eine
//    Behauptung von Vertrautheit, die es nicht gibt (Kap. 4b, Pos. 16).
//
// Die Leiste ist reine Anordnung (§3): Übersicht und Baum kommen als fertige
// Elemente herein. Sie kennt weder Erlass noch Suchzustand — dadurch ist sie in
// der Spalte (D/S) und im Bottom-Sheet (H) dasselbe Bauteil.

export function LeserSeitenleiste({
  uebersicht, baum, baumTitel, onAlleAuf, onAlleZu, onAnfang, alleOffen,
  baumKnoepfe = true,
}: {
  /** Übersichtsbox (Kap. 4b ①). `null` = noch nicht ladbar ⇒ Zeile entfällt. */
  uebersicht?: ReactNode;
  /** Gliederungsbaum ODER — solange gesucht wird — die Trefferliste (Kap. 4b). */
  baum: ReactNode;
  /** Überschrift über dem klebenden Block; wechselt mit dem Inhalt.
   *
   *  Ä10 (H2b): `undefined` = KEINE eigene Überschrift. Gebraucht dort, wo der
   *  Behälter die Zone schon benennt — im Bottom-Sheet stand «Gliederung»
   *  zweimal übereinander (Sheet-Kopf + dieses `h2`, gemessen 17.8.2026: zwei
   *  Textknoten mit identischem Inhalt in einem 390-px-Blatt). Die Leiste
   *  behauptet damit keine Zonen-Benennung mehr, die ihr Behälter besser kennt —
   *  und bleibt ohne `imSheet`-Verzweigung (§3: sie kennt ihren Behälter nicht). */
  baumTitel?: string;
  onAlleAuf: () => void;
  onAlleZu: () => void;
  /** «↑ Anfang» — genau EIN Knopf pro Seite (Pos. 15), mit Text-Label. */
  onAnfang: () => void;
  /** Steuert nur die Beschriftung des einen Knopfes (auf/zu), kein Zustand. */
  alleOffen: boolean;
  // C4 (H3-Nachzug): der Slot `extra` («zusätzliche Blöcke unter dem Baum») ist
  // gestrichen. Gedacht war er als Anschluss für die Kontext-Reiter — die stehen
  // seit H3 im Panel, und der Slot hatte über drei Etappen keinen Aufrufer (§17,
  // Herleitung im Rahmen).
  /** Ä32 (H2b-Nachzug): Steht in Zone B wirklich der GLIEDERUNGSBAUM? Nur dann
   *  hat «alles auf/zu» ein Ziel. `false` setzt der Aufrufer, während die
   *  Trefferliste an seinem Platz liegt — Herleitung unten am Markup. */
  baumKnoepfe?: boolean;
}) {
  // ── W-1 · Zone A publiziert ihre Höhe als `--toc-deckel` (Befund 16.8.2026) ─
  // Die Trefferliste klebt mit `top: var(--toc-deckel, 0px)`
  // (`LeserTrefferListe.tsx`) — das ist aus V1 geerbt und dort richtig, weil
  // dort `inhalt-volltext.tsx` die Marke setzt. In V3 setzte sie NIEMAND: der
  // Rückfallwert 0px griff, und damit klebten Trefferlisten-Kopf UND Zone A
  // beide bei `top: 0`. Gemessen: `elementFromPoint` auf der Mitte des
  // Suchfelds traf `SuchBereichWahl` — die Facetten-Leiste legte sich beim
  // Scrollen über das Feld, mit dem man sucht.
  //
  // Wörtlich dieselbe Mechanik wie V1 (§5 — eine Bedeutung, ein Muster): Zone A
  // misst sich selbst und legt die Höhe auf den `[data-toc]`-Scroller. Reine
  // Darstellungs-Geometrie, kein State ⇒ kein Re-Render (§15). Der `ResizeObserver`
  // ist nötig, weil Zone A ihre Höhe ändert, sobald das Suchfeld erscheint oder
  // die Kopfzeile umbricht — ein einmaliges Messen wäre beim ersten Tippen falsch.
  const zoneARef = useCallback((el: HTMLDivElement | null) => {
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ziel = el.closest('[data-toc]') as HTMLElement | null;
    if (!ziel) return;
    const setze = () => ziel.style.setProperty('--toc-deckel', `${Math.round(el.getBoundingClientRect().height)}px`);
    setze();
    const ro = new ResizeObserver(setze);
    ro.observe(el);
    // Kein Cleanup-Rückgabewert: ein Callback-Ref darf keinen liefern. Der
    // Observer stirbt mit dem Element; beim Unmount ruft React den Callback
    // ohnehin mit `null`, worauf hier nichts Neues entsteht.
  }, []);

  // Ä94: Die Kopfzeile von Zone A steht, sobald sie etwas ZU SAGEN hat — eine
  // Überschrift oder den Auf/Zu-Knopf des Baumes. Bleibt nur «↑ Anfang» übrig,
  // trägt die Zeile keinen eigenen Inhalt mehr; dann geht der Knopf in den Slot
  // (siehe `./anfangSlot`) und die Zeile entfällt.
  const zeigtZeile = Boolean(baumTitel) || baumKnoepfe;

  return (
    // `flex-1 min-h-0` statt `h-full`: der Vorfahre (die klebende Spalte) hat eine
    // `max-height`, KEINE feste Höhe — und `height:100%` löst gegen eine
    // Maximalhöhe nicht auf (CSS-Spec). Die Folge war ein Scroller, der auf die
    // volle Inhaltshöhe wuchs und darum nichts zu scrollen hatte: der Überschuss
    // wurde stumm abgeschnitten (belegt am OR @1440×900, scrollHeight ===
    // clientHeight === 1082 bei 712 px Spaltenhöhe). Dieselbe Flex-Anatomie wie
    // die Ist-Spalte (`inhalt-volltext.tsx`, `flex-1 min-h-0` im `[data-toc]`).
    <div data-v3-leiste className="flex min-h-0 flex-1 flex-col">
      {/* Der ganze Block scrollt in EINEM Scroller; sticky wirkt darin.
          `data-toc` ist KEIN Testhaken, sondern der Anschluss an die GETEILTE
          Mechanik: der Scroll-Spy in `inhalt-hooks.tsx` sucht `[data-toc]`, um
          die aktive Baumzeile mitzuführen (P9b/A33) und um den
          Nutzer-Interaktions-Guard anzuhängen. Ohne die Marke lief beides in V3
          ins Leere — die Gliederung wäre beim Lesen still stehen geblieben. */}
      {/* ── LM-064 (B8, 31.8.2026) · DER SCHNITT IST JETZT ANGEKÜNDIGT ────────
          BEFUND, am gebauten Stand reproduziert @1440 auf `/gesetze/bund/OR`:
          dieser Scroller zeigt 728 px von 1'061 px Inhalt und schneidet dabei
          GENAU EINE Baumzeile am unteren Rand mitten durch — bei
          `border-bottom: 0px` und `mask-image: none`, hell wie dunkel. Ohne
          jedes Zeichen liest sich der Schnitt als Darstellungsfehler, nicht als
          «hier geht es weiter» (Befund-Wortlaut: «im Dunkelmodus wirkt der
          Schnitt wie ein Darstellungsfehler»).
          `lc-scrollrand-y` ist dieselbe geteilte Affordanz wie an den
          waagrechten Leisten (§5, Herleitung im Regel-Block `lc-scrollrand` in
          index.css) — der untere Schatten steht genau dann, wenn unter der
          Kante wirklich noch Baum liegt, und weicht am Ende der Strecke.
          OBERE KANTE: dort deckt der klebende Sockel (Zone A, `bg-paper`) den
          Schatten ohnehin ab — Hintergrund liegt hinter dem Inhalt. Das ist
          erwünscht und kein Sonderfall: an der oberen Kante sagt schon der
          Sockel, dass man mitten im Baum steht.
          NICHT GEBAUT und bewusst nicht: «schneidet keine Zeile an». Ein frei
          scrollender Kasten kann an keiner Halteposition zeilenrein enden;
          erzwungen würde das ein `scroll-snap`, das dem Scroll-Spy und dem
          `scrollIntoView` der Gliederung (`tocAutoZuklappen`) in die Quere
          käme. Der Anschnitt bleibt — er ist ab jetzt nur nicht mehr stumm.
          Der im Befund zusätzlich genannte WAAGRECHTE Balken ist überholt:
          gemessen `overflow-x: hidden`, `scrollWidth === clientWidth === 288`. */}
      <div data-toc data-v3-leiste-scroller className="lc-scrollrand-y min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain pr-2 [scrollbar-width:thin]">
        {uebersicht && (
          <div data-v3-leiste-uebersicht className="mb-3">{uebersicht}</div>
        )}
        {/* Ab hier klebt es. `bg-paper` ist Pflicht: ohne opake Fläche liefe der
            Baum beim Scrollen sichtbar unter der Kopfzeile durch. */}
        {/* `data-toc-zone-a`: derselbe geteilte Anschluss — der Mitscroll-Nudge
            misst daran, wie viele oberste Pixel des Scrollers dieser klebende
            Sockel verdeckt. Ohne die Marke schöbe er die aktive Zeile exakt
            darunter und meldete «sichtbar», was niemand sieht. */}
        {/* ── H2 · DAS FELD KLEBT MIT (David 16.8.2026) ─────────────────────
            «Das Suchfeld muss immer zugreifbar sein, auch wenn ich in der
            Gliederung scrolle.» Die Zusage GILT UNVERÄNDERT, sie wird seit D28
            (6.9.2026) nur woanders eingelöst: das Feld klebt im Kopf-Block des
            Lesers und ist damit auch dann erreichbar, wenn diese Leiste gar
            nicht steht. Was hier bleibt: 1. Gliederungs-Kopfzeile · 2. der
            scrollbare Baum. Die Übersichtsbox bleibt darüber und scrollt
            weiterhin weg — sie ist Ankunfts-Information, kein Werkzeug. */}
        {/* ── Ä5 (H2b) · DER SOCKEL TRÄGT DIE FLÄCHE SEINES BEHÄLTERS ──────────
            Bis H2 stand hier fest `bg-paper`. In der Spalte ist das richtig, im
            Bottom-Sheet nicht: das Sheet liegt auf `paper-raised`, der Sockel
            malte darauf ein `paper`-Rechteck (gemessen 17.8.2026: rgb(255,254,252)
            gegen rgb(252,250,246)) — eine sichtbare, wandernde Kante, sobald man
            in der Leiste scrollt. Gestapelte Töne sind ausdrücklich verboten
            (Design-Grundlage Kap. 5).
            `.lc-leiste-sockel` liest `--leser-leiste-flaeche` und fällt auf
            `--paper` zurück; den Wert setzt der BEHÄLTER (der Rahmen am
            Sheet-Träger). Damit bleibt die Leiste ohne Behälter-Verzweigung (§3)
            und es gibt weiterhin genau EINE opake Fläche über dem Baum. */}
        {/* Ä94: Der Sockel BLEIBT als Element, auch wenn er nichts trägt — er ist
            der Messpunkt für `--toc-deckel` und der Anschluss des Mitscroll-Nudge
            (`data-toc-zone-a`). Leer verliert er nur seine Polster: die Messung
            liefert dann 0 px, und die Trefferliste klebt zuoberst statt unter
            einem 10-px-Gespenst. Ihn wegzulassen hiesse, den Deckel auf seinem
            letzten Wert einfrieren zu lassen. */}
        <div ref={zoneARef} data-toc-zone-a data-v3-leiste-baumkopf
          className={`lc-leiste-sockel sticky top-0 z-sticky space-y-2 ${
            zeigtZeile ? '-mt-0.5 pb-2 pt-0.5' : ''}`}>
          {/* ── Ä32 (H2b-Nachzug) · «ALLES AUF» GEHÖRT DEM BAUM ────────────────
              BEFUND (Ästhetik-Prüfung 17.8.2026, `lugue-H-hell-suche-liste`): im
              Treffer-Blatt hing die Knopfgruppe «⌄ alles auf   ↑ Anfang»
              etikettlos rechts — Ä10 hatte die Überschrift der Leiste dort
              entfernt (der Blatt-Kopf benennt die Zone), und übrig blieben zwei
              Knöpfe ohne Bezug. Der eigentliche Fehler steckt dahinter: «alle
              Gliederungsstufen aufklappen» klappt einen Baum auf, der während
              einer Suche gar nicht steht — an seinem Platz liegt die
              Trefferliste, die ihre Artikel EINZELN aufklappt. Ein Knopf, der
              etwas anderes tut als er sagt, ist schlimmer als keiner (§8).
              JETZT: der Auf/Zu-Knopf erscheint nur, wenn der Baum gezeigt wird
              (`baumTitel` ist genau dann gesetzt bzw. der Behälter benennt ihn —
              der Aufrufer sagt es über `baumKnoepfe`). «↑ Anfang» bleibt in
              beiden Zuständen: es bezieht sich auf den ERLASS, nicht auf den
              Baum, und ist «genau EIN Knopf pro Seite» (Pos. 15). */}
          {/* ── Ä94 (H4-Nachzug 18.8.2026) · EINE ZEILE OHNE INHALT IST KEINE ──
              Ä32 liess die Zeile stehen, auch wenn von ihr nur «↑ Anfang» übrig
              war. Gemessen im Handy-Sheet (390, StPO/«Entschädigung»): 358 × 34 px
              klebende Fläche für einen 62-px-Knopf — 246 px leer, und direkt
              darunter die zweite klebende Leiste der Trefferliste mit einem
              70-px-Loch neben dem Segment. Statt zwei halbleerer Balken gibt die
              Zeile den Knopf jetzt ab (`AnfangSlot`, Herleitung dort) und
              entfällt selbst. Entweder–oder, nie beides: Pos. 15 bleibt
              strukturell erfüllt statt bewacht. */}
          {zeigtZeile && (
            <div className={`flex items-center gap-2 ${baumTitel ? 'justify-between' : 'justify-end'}`}>
              {baumTitel && <h2 className="lc-overline">{baumTitel}</h2>}
              <div className="flex shrink-0 items-center gap-1">
                {baumKnoepfe && (
                  <button type="button" data-v3-alle
                    onClick={alleOffen ? onAlleZu : onAlleAuf}
                    aria-expanded={alleOffen}
                    title={alleOffen ? 'Alle Gliederungsstufen zuklappen' : 'Alle Gliederungsstufen aufklappen'}
                    className="lc-leiste-griff gap-1 px-1.5 text-micro">
                    <span aria-hidden>{alleOffen ? '⌃' : '⌄'}</span>
                    <span>{alleOffen ? 'alles zu' : 'alles auf'}</span>
                  </button>
                )}
                <button type="button" data-v3-anfang onClick={onAnfang}
                  title="Zum Anfang des Erlasses"
                  className="lc-leiste-griff gap-1 px-1.5 text-micro">
                  <span aria-hidden>↑</span><span>Anfang</span>
                </button>
              </div>
            </div>
          )}
        </div>
        {/* `data-toc-baum` ist — wie `data-toc` darüber — KEIN Testhaken,
            sondern ein geteilter Anschluss: die Taste «t» (`parts/LeserTastatur`)
            setzt den Fokus auf das erste Ziel im BAUM. Ohne die Marke suchte sie
            im ganzen Scroller und traf seit H2b den Quell-Link im Steckbrief,
            der hier zuoberst steht (Klick-Test B7, 18.8.2026). */}
        <div data-v3-leiste-baum data-toc-baum>
          <AnfangSlot.Provider value={zeigtZeile ? null : onAnfang}>{baum}</AnfangSlot.Provider>
        </div>
      </div>
    </div>
  );
}
