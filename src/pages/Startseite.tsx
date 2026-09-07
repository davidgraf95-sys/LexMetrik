import { useSyncExternalStore } from 'react';
import { START_MODULE } from '../lib/startseiteModule';
import {
  abonniere, istWerkseinstellung, schalte, schnappschuss, setzeZurueck,
  speichere, verschiebe, werkSchnappschuss, type StartPosten,
} from '../lib/startseiteEinstellung';
import { usePaneKlasse } from '../components/layout/PaneKontext';
import { SuchBlock } from '../components/start/SuchBlock';
import { BereichsReihe } from '../components/start/BereichsReihe';
import { ZuletztVerwendet } from '../components/start/ZuletztVerwendet';
import { PultModul } from '../components/start/PultModul';
import { PultAbschluss } from '../components/start/PultAbschluss';
import { VertrauensFuss } from '../components/start/VertrauensFuss';

// ─── Startseite — das Pult (W2·24-DESIGN-IDENTITAET R10) ────────────────────
//
// Referenzbild `abnahme/design-identitaet/pult-freigegeben.html`, von David am
// 6.9.2026 freigegeben («ja das gefällt mir, nimm das als vorgabe für runde
// 10»). EIN Bildschirm in drei festen Ebenen — (1) Suche mit Begrüssung,
// (2) die fünf Bereiche in einer Reihe, (3) «Zuletzt» — und darunter die
// MODULE, die der Nutzer selbst ein- und ausschaltet und umordnet.
//
// WAS R3 HIER HATTE UND R10 NICHT MEHR HAT (§17-Gegengewicht):
//   · die MARGINALIENSPALTE (150 px + 36 px Rinne). Sie trug je Zeile Bereich
//     und Bestandszahl; beides steht jetzt EINMAL in der Bereichs-Reihe. Der
//     Baustein `start/Satzspiegel` ist damit ersatzlos gestrichen — David
//     6.9.2026: «zu viel text und linien».
//   · das Modul «Titelblatt» (`start/Hero`) — der Kopf ist keine Registry-Zeile
//     mehr, sondern die feste erste Ebene (s. `lib/startseiteModule`).
//
// DER NUTZER-ZUSTAND KOMMT AUS EINEM EXTERNEN SPEICHER, NICHT AUS useState:
// `useSyncExternalStore` ist hier kein Zierrat, sondern der einzige Weg, der
// beides erfüllt (§15/CLS + §2/Prerender):
//   · Der PRERENDER hat kein localStorage und liefert `werkSchnappschuss` —
//     die Werkseinstellung steht damit deterministisch im HTML.
//   · Der CLIENT liest beim ersten Render synchron nach. Weicht sein
//     Schnappschuss ab, zieht React die Attribute unmittelbar nach der
//     Hydration nach. Mit `useState(() => lies())` täte es das NICHT: React
//     patcht bei der Hydration keine Attribute, und der erste Client-Render
//     wäre schon der «richtige» — die Seite bliebe optisch auf dem
//     Server-Stand stehen.
//   · Ein zweiter Tab (`storage`) und das eigene Blatt (`lm:startseite`) melden
//     sich über dasselbe Abonnement; es gibt keinen zweiten Zustand (§5).
//
// ORDNUNG PER CSS, NICHT PER DOM-UMBAU: die Module stehen IMMER in der
// Registry-Reihenfolge im Baum, ihre Anzeige-Position ist `style.order`, und
// zugeklappt heisst `hidden` (s. `start/PultModul`). So sind Server- und
// Client-Baum gestaltgleich — ein Struktur-Unterschied liesse React 19 die
// Hydration verwerfen und die ganze Seite neu rendern.
//
// A11y (§8): genau EINE <h1> (das Titelblatt-Wort im Suchblock), je Modul eine
// <h2> in einer `<section aria-labelledby>` — keine Heading-Sprünge.
// Reine Darstellung (§3).
export function Startseite() {
  const pk = usePaneKlasse();
  const posten = useSyncExternalStore(
    abonniere,
    () => schnappschuss(START_MODULE),
    () => werkSchnappschuss(START_MODULE),
  );
  const platz = new Map(posten.map((p, i) => [p.id, i] as const));
  const zustand = new Map(posten.map((p) => [p.id, p.an] as const));
  const schreibe = (neu: StartPosten[]) => speichere(neu);

  return (
    // LEERRAUM ÜBER DEM PULT (David-Befund D3, 6.9.2026, unverändert
    // fortgeschrieben): der Route-Wrapper (`layout/Shell.tsx`, `py-8 sm:py-12`)
    // polstert 48 px; ab `sm` nimmt die Seite 24 px davon zurück. NUR im
    // Vollfenster — im Pane polstert `Pane.tsx` mit `py-6`, dort wäre der Abzug
    // der ganze Abstand. Wurzel (eine je Routentyp gesetzte Wrapper-Polsterung)
    // liegt in `layout/`, das diese Runde nicht anfasst.
    <div className={`grid gap-y-9 ${pk('sm:-mt-6', '')}`}>
      <SuchBlock />
      <BereichsReihe />
      <ZuletztVerwendet />

      <div className="grid border-t border-rule-soft">
        {START_MODULE.map((modul) => {
          const Komponente = modul.Komponente;
          const an = zustand.get(modul.id) ?? modul.standard;
          return (
            <PultModul key={modul.id} id={modul.id} titel={modul.titel} reg={modul.reg} an={an}
              position={platz.get(modul.id) ?? 0}
              aufSchalten={() => schreibe(schalte(posten, modul.id))}>
              <Komponente an={an} />
            </PultModul>
          );
        })}
      </div>

      <PultAbschluss
        module={START_MODULE}
        posten={posten}
        istWerk={istWerkseinstellung(START_MODULE, posten)}
        aufSchalten={(id) => schreibe(schalte(posten, id))}
        aufVerschieben={(id, richtung) => schreibe(verschiebe(posten, id, richtung))}
        aufZuruecksetzen={setzeZurueck}
      />
      <VertrauensFuss />
    </div>
  );
}
