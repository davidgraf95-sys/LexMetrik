import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// ─── W2·10-UI-NAV/R7 · «Springe zu …» beim Deep-Link-Einsprung ───────────────
//
// PROD-RE-AUDIT (§0.1 Vintage-Regel, 3.8.2026, lexmetrik.vercel.app, Chromium
// 1280×800, CPU-Drossel 6×): Der Befund ist NICHT durch U-POSITION/A2 erledigt.
// Beim Einsprung über `…/gesetze/bund/OR#art-335c` bleibt der DOKUMENTANFANG
// 1.8 s / 2.4 s / 2.8 s sichtbar (drei Ziele, drei Läufe), das Ziel-Element
// erscheint erst nach 3.7–4.8 s im DOM. Der Leser sieht also mehrere Sekunden
// lang Art. 1 eines Gesetzes, das er wegen Art. 335c geöffnet hat — und hat
// keinen Hinweis, dass noch etwas kommt. Genau dafür ist dieses Overlay da.
//
// Was es NICHT tut: es greift nicht in die Sprung-Mechanik ein, wartet auf nichts
// und hält nichts auf. Es liest den Hash EINMAL beim Einsprung (kein URL-Sync,
// LM-202) und legt sich rein visuell darüber, bis der Sprung gelandet ist.
//
// §15/CLS: `position: fixed`, `pointer-events: none` ⇒ kein Layout-Anteil, kein
// Eingriff in Scroll/Klick. Rendert im Ruhezustand `null` ⇒ prerendertes Markup
// byte-gleich.

/** Der Hash muss dem BESTEHENDEN Ankerraum entsprechen (`#art-<token>`, K2/R8:
 *  überall derselbe, opake Token). Kein neuer Ankerraum, keine eigene Grammatik. */
const ART_HASH = /^#art-(.+)$/;
/** Harte Obergrenze als BACKSTOP. Was bis dahin nicht gelandet ist, landet nicht
 *  mehr (fremdes Dokument, Reader lädt gar nicht) — dann verschwindet das Overlay,
 *  statt zu behaupten, es käme noch etwas (§8). Den Regelfall entscheidet der
 *  Takt unten, nicht diese Kappe. */
const KAPPE_MS = 6000;

export function DeepLinkSkeleton() {
  const { hash, pathname } = useLocation();
  const [aktiv, setAktiv] = useState(false);

  useEffect(() => {
    const m = ART_HASH.exec(hash);
    if (!m) return;
    const id = `art-${m[1]}`;
    // Liegt das Ziel schon im DOM, ist der Sprung eine Sofort-Bewegung (interne
    // Navigation im geladenen Gesetz) — dafür braucht niemand ein Overlay. Das
    // Overlay gehört dem EINSPRUNG von aussen, wo der Reader erst noch entsteht.
    if (document.getElementById(id)) return;

    // Nutzer-Übernahme beendet das Overlay sofort: wer selbst scrollt, tippt
    // oder klickt, navigiert nicht mehr «hin» — ein Schleier mit «Springe zu …»
    // über der eigenen Bewegung wäre schlicht falsch.
    const uebernahme = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
    let raf = 0;
    let kappe = 0;
    let weg = false;
    const schliesse = () => {
      if (weg) return;
      weg = true;
      window.cancelAnimationFrame(raf);
      window.clearTimeout(kappe);
      for (const ev of uebernahme) window.removeEventListener(ev, schliesse);
      setAktiv(false);
    };
    for (const ev of uebernahme) window.addEventListener(ev, schliesse, { passive: true, once: true });

    // EINE Prüfung des äusseren Zustands (DOM + Sprung-Landung), je Frame
    // aufgerufen. Auch das Einschalten passiert hier und nicht im Effekt-Rumpf:
    // ob das Overlay gebraucht wird, entscheidet nicht React, sondern der
    // Ladezustand des Dokuments — der Effekt abonniert ihn nur.
    //
    // ── WARUM rAF UND NICHT setInterval (CI-Rot 30867800070) ──────────────────
    // Die erste Fassung taktete mit `setInterval(120ms)`, ausdrücklich um billiger
    // zu sein als ein Observer. Das war die falsche Abwägung: Blink priorisiert
    // unter Haupt-Thread-Sättigung die Rendering-Schritte und hungert die
    // Timer-Queue aus. Gemessen auf dieser Seite (Takt-Feuerungen statt der bei
    // 120 ms erwarteten Zahl, und die grösste Lücke zwischen zwei Feuerungen):
    //     6× Drossel:  6 Takte, grösste Lücke  636 ms
    //    14× Drossel:  7 Takte, grösste Lücke 1490 ms
    //    20× Drossel:  8 Takte, grösste Lücke 2154 ms
    // Auf dem gesättigten 2-vCPU-CI-Runner wuchs die Lücke auf ~4.4 s — das
    // Overlay stand also nach dem Artikel-Render noch 4.4 s, obwohl der Ausstieg
    // gebaut war: er kam schlicht nicht zum Zug. rAF lief in derselben Zeit
    // durch (der Mess-Sampler der e2e-Spec zeichnete Frames über die ganze
    // Strecke auf). Die Latenz React-Entscheid → DOM lag bei 3–110 ms, war also
    // nie das Problem.
    //
    // rAF ist hier auch sachlich das richtige Werkzeug: gefragt ist «steht das
    // Ziel schon an der Leselinie», also eine Frage an das GERENDERTE Bild. Die
    // Schleife lebt nur, solange das Overlay lebt (Sekundenbruchteile bis
    // wenige Sekunden), und pausiert im Hintergrund-Tab von selbst (§15).
    const pruefe = () => {
      const el = document.getElementById(id);
      if (!el) {
        // TOTER ANKER (B1). Alt-Permalinks überleben Aufhebungen und Umnumme-
        // rierungen — gerade die Zitate, die dieses Feature erzeugt, liegen
        // jahrelang in fremden Akten. Steht der Reader mit seinen Artikeln, das
        // Ziel fehlt aber, dann kommt es nicht mehr: die Lande-Bedingung könnte
        // NIE eintreten, und das Overlay stünde bis zur Kappe als deckender
        // Schleier über der ganzen Lesespalte — es verspräche eine Landung, die
        // es nicht geben kann (§8), und wäre schlechter als gar kein Feature.
        // Die Artikel erscheinen gemeinsam (eine Render-Runde, danach nur noch
        // content-visibility-Materialisierung); «irgendein Artikel da» ist damit
        // ein verlässliches «der Reader steht». Dann: aufhören und den Blick auf
        // das Dokument freigeben — der Reader selbst behandelt den unbekannten
        // Anker weiter wie bisher. (Der Satz «die Lande-Bedingung könnte nie
        // eintreten» galt der früheren Warteschleife; seit der Übergabe unten
        // beim ersten Sichten des Ziels bleibt hier der Fall «Ziel kommt nie».)
        // NACHGEMESSEN 1.9.2026 (QS-PERF/B5, BV#art-8, 6× Drossel, rAF-Sampler,
        // n=3): Die Annahme «die Artikel erscheinen gemeinsam» trägt — alle 232
        // Artikel stehen im SELBEN Frame im DOM, und `#art-8` erscheint auf die
        // Millisekunde mit dem ersten `article[id^="art-"]` (1193/1227/1390 ms,
        // beide Marker identisch). «Irgendein Artikel da» ist also nicht bloss
        // plausibel, sondern gemessen dasselbe wie «der Reader steht»; dieser
        // Zweig ist damit zustandsgekoppelt und bleibt unverändert.
        // Der Fehlschluss der B5-Diagnose lag anderswo: die Ansage verschwand
        // vorzeitig, weil `InhaltsKopf` beim Wechsel auf `kopfzeileSelbst`
        // diese Komponente UNMOUNTETE (zwei return-Zweige, verschiedene
        // Kind-Position) — Herleitung und Messreihe dort. Wer diesen Zweig
        // künftig anfasst, prüft zuerst, ob der Reader seine Artikel noch in
        // EINER Runde rendert; sonst gehört hier ein Vollständigkeits-Signal
        // des Readers hin, kein «irgendein Artikel».
        if (document.querySelector('article[id^="art-"]')) { schliesse(); return; }
        setAktiv(true);
        raf = window.requestAnimationFrame(pruefe);
        return;
      }
      // Ziel ist da ⇒ Übergabe an den Reader. Der Vorgänger wartete hier noch
      // ab, bis das Ziel an der Leselinie STAND («Lande-Bedingung») — das war
      // ein Fehlschluss aus meiner eigenen Messung und hat echten Schaden
      // angerichtet:
      //
      //  · Das Prod-Re-Audit zeigt, dass der Dokumentanfang BEREITS NICHT MEHR
      //    sichtbar ist, wenn das Ziel in den DOM kommt (Anfang sichtbar bis
      //    1788/2424/2839 ms, Ziel im DOM ab 3687/4331/4751 ms). Die Lücke, die
      //    das Warten schliessen sollte, existiert gar nicht. Nachgemessen mit
      //    dieser Fassung: null Frames mit sichtbarem Dokumentanfang nach dem
      //    Schliessen, bei 6× und 14× Drossel.
      //  · Bezahlt wurde das Warten mit einer NUTZERSICHTBAREN REGRESSION: das
      //    länger stehende Overlay samt seiner Rect-Lesung je Frame brachte den
      //    Scroll-Spy des Readers um seine erste Markierung — nach einem
      //    Deep-Link-Einsprung blieb die Gliederung unmarkiert, bis der Leser
      //    zum ersten Mal scrollte (A/B belegt: mit Overlay 0 markierte
      //    Einträge, ohne Overlay 2; Bestands-Spec leser-kopf-a9 lief darauf
      //    auf). Ein Ladehinweis darf die Sicht, die er überbrückt, nicht
      //    beschädigen (§1 vor §15, und §8: nichts verschlechtern).
      //
      // Darum: sobald das Ziel steht, ist die Aufgabe erledigt. Ohne Rect-
      // Lesung, ohne Warteschleife — das erspart nebenbei das erzwungene Layout
      // je Frame in genau der Sekunde, in der die Seite ohnehin am meisten zu
      // tun hat (§15).
      schliesse();
    };
    // Erste Prüfung sofort im nächsten Frame — das Overlay soll im selben
    // Wimpernschlag stehen wie der leere Dokumentanfang, den es ersetzt.
    raf = window.requestAnimationFrame(pruefe);
    kappe = window.setTimeout(schliesse, KAPPE_MS);

    return schliesse;
    // Absichtlich an pathname UND hash: ein zweiter Einsprung in dasselbe
    // Dokument (anderer Artikel) ist ein neuer Fall.
  }, [hash, pathname]);

  if (!aktiv) return null;
  return (
    <div role="status" aria-live="polite"
      // Positioniert wird RELATIV zum Inhalts-Kopf (`top-full`), nicht über eine
      // addierte Pixelhöhe von Topbar + Leiste: dieser Baustein hängt im Kopf,
      // also kennt er dessen Unterkante ohne Rechnung — und keine Magic-Number
      // veraltet still, wenn eine der beiden Leisten ihre Höhe ändert (§0.5).
      // Die Leiste selbst bleibt sichtbar; sie beantwortet ja bereits «wo bin
      // ich». Verdeckt wird nur der Dokumentanfang, der hier nichts zu suchen hat.
      className="pointer-events-none absolute inset-x-0 top-full z-dropdown flex h-screen justify-center bg-paper px-5">
      <div className="w-full max-w-3xl pt-8">
        {/* Ohne Artikel-Etikett: es steht erst im DOM, wenn das Ziel da ist —
            und dann ist das Overlay schon weg. Aus dem opaken Anker-Token
            liesse es sich nicht ableiten (K2/R8), und eine geratene
            Artikelnummer wäre schlimmer als keine (§8). Die frühere Fassung
            setzte den Platzhalter in denselben Satzbau wie ein Etikett und
            erzeugte damit «Springe zu die verlinkte Stelle» — grammatisch
            falsch und im CI-Report nachlesbar. */}
        <p className="text-body-s text-ink-600">Springe zur verlinkten Stelle …</p>
        {/* Platzhalter-Zeilen: sie sagen «hier kommt Text», ohne Text zu
            behaupten. `aria-hidden`, die Ansage steckt im Satz darüber. */}
        <div aria-hidden className="mt-6 animate-pulse space-y-3">
          {['w-1/3', 'w-full', 'w-11/12', 'w-4/5', 'w-full', 'w-2/3'].map((b, i) => (
            <div key={i} className={`h-3 rounded bg-paper-sunken ${b}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
