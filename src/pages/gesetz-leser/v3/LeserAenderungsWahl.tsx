import { useId } from 'react';
import { MenueGruppe, MenueSchalter, MenueTitel } from '../../../components/ui/Menue';
import { setzeVermerke, type VermerkeWahl } from '../leserOptionen';

// ═══ D35-F3 (Entscheid David 7.9.2026) · «ÄNDERUNGEN ANZEIGEN ALS» ═══════════
//
// Davids Wortlaut zum Ansicht-Menü: «es soll entweder fassung oder fussnoten
// angezeigt werden. also entweder fassung, fussnoten oder aus.» Bis 7.9.2026
// standen dort ZWEI unabhängige Schalter, und beide Stellungen waren zugleich
// wählbar — gemessen vier erreichbare Kombinationen (D35-Bericht Teil 3).
//
// DIE WAHL IST DREIWERTIG UND VERLUSTFREI (Entscheid David: «A und verlustfrei»).
// Sie schaltet ausschliesslich die ÄNDERUNGSHISTORIE gegeneinander:
//
//   Fassung    «Gilt seit …» + Zeitleiste · Änderungs-Fussnoten (kl:'A') gedämpft
//   Fussnoten  voller amtlicher Apparat inkl. kl:'A' · Fassungs-Zeile aus
//   aus        weder noch
//
// In JEDER Stellung sichtbar bleiben `kl:'V'/'G'/'Z'/'U'` und jede Fussnote OHNE
// Klasse. Der Grund steht als Messwert da und nicht als Meinung: im ZPO-Apparat
// sind 99 von 311 Einträgen (32 %) keine Änderungsvermerke — eine Radiogruppe im
// Wortsinn hätte sie mitgenommen (§7/§8), und H0-Auflage 1 verlangt ausdrücklich,
// dass `A` die EINZIGE dämpfbare Klasse ist
// (`bibliothek/normen/hist-ansicht-h0-trennbarkeit.md`).
//
// WARUM EINE EIGENE DATEI: `LeserAnsichtV3.tsx` stand bei 418 der 420 Zeilen, die
// die Fundament-Sonde erlaubt (`src/tests/leser-v3-fundament.test.ts`, §6.6) —
// derselbe Grund, aus dem `./menueTasten.ts` entstanden ist. Eine Wahl mit drei
// Stellungen, einer Anbieten-Bedingung und einer Ehrlichkeits-Zeile ist zudem ein
// eigener Gedanke, kein Absatz im Menü.
//
// DIE ROLLEN SETZT DER AUFRUFER (`ui/Menue`-Vertrag): `MenueSchalter` bringt
// `role="switch"` mit, hier wird daraus `menuitemradio`; die FORM der Marke ist
// `punkt` — der Kreis, den D35-F4 für genau diesen Fall vorgesehen hat («damit
// ein künftiges Menü mit Dreier-Wahl (F1/F3) ohne Umbau hineinpasst», index.css).

/** Beschriftung, Tooltip und Stellung — die Reihenfolge IST die Menü-Ordnung. */
const STELLUNGEN: ReadonlyArray<{ wert: VermerkeWahl; label: string; titel: string }> = [
  {
    wert: 'fassung',
    label: 'Fassung',
    titel: 'Zeigt die Fassungs-Zeile «Gilt seit …» samt Zeitleiste. Die amtlichen '
      + 'Änderungs-Fussnoten sind dann gedämpft — Verweis- und Nachweis-Fussnoten '
      + 'bleiben in jeder Stellung sichtbar.',
  },
  {
    wert: 'fussnoten',
    label: 'Fussnoten',
    titel: 'Zeigt den vollständigen amtlichen Fussnoten-Apparat samt '
      + 'Änderungsvermerken; die abgeleitete Fassungs-Zeile ist dann aus.',
  },
  {
    wert: 'aus',
    label: 'aus',
    titel: 'Weder Fassungs-Zeile noch Änderungs-Fussnoten. Verweis- und '
      + 'Nachweis-Fussnoten bleiben sichtbar — amtlicher Nicht-Änderungs-Apparat '
      + 'wird nie ausgeblendet.',
  },
];

export function LeserAenderungsWahl({ wahl, fussnotenAnzahl, ohneKlassifikation }: {
  /** Die gesetzte Stellung aus dem geteilten Store. */
  wahl: VermerkeWahl;
  /**
   * A26 (David 11.7.2026) · der Zähler N am Fussnoten-Eintrag. Er zählt den
   * GANZEN Erlass, nicht den Artikel (LM-025) — darum steht die Bezugsgrösse im
   * Accessible Name und im Tooltip, nie die nackte Zahl.
   */
  fussnotenAnzahl: number | null;
  /**
   * §8 · Trägt der Apparat dieses Erlasses gar keine `kl`-Klassifikation?
   *
   * Kantonssidecars tragen sie nicht (`lib/normtext/browse.ts`: «fehlt das Feld
   * …, bleibt die Fussnote in JEDER Ansicht sichtbar»). Dort dämpft «Fassung»
   * nichts, und die drei Stellungen unterscheiden sich nur noch in der
   * Fassungs-Zeile. Das MENÜ sagt das hin, statt eine Wirkung zu behaupten, die
   * es auf diesem Erlass nicht gibt — dieselbe Ehrlichkeit, aus der D1 den
   * Schalter auf vermerkfreien Erlassen gar nicht erst anbietet.
   */
  ohneKlassifikation: boolean;
}) {
  const hinweisId = useId();
  const zahl = fussnotenAnzahl != null && fussnotenAnzahl > 0 ? fussnotenAnzahl : null;
  return (
    <MenueGruppe attrs={{
      role: 'group',
      'aria-label': 'Änderungen anzeigen als',
      // Der Hinweis gehört zur GRUPPE, nicht zu einer Stellung: er erklärt, warum
      // sich zwei der drei Stellungen auf diesem Erlass gleich verhalten.
      'aria-describedby': ohneKlassifikation ? hinweisId : undefined,
      'data-v3-vermerke-wahl': '',
    }}>
      <MenueTitel>Änderungen anzeigen als</MenueTitel>
      {STELLUNGEN.map((s) => (
        <MenueSchalter
          key={s.wert}
          an={wahl === s.wert}
          form="punkt"
          label={s.label}
          titel={zahl != null && s.wert === 'fussnoten' ? `${s.titel} (${zahl} in diesem Erlass)` : s.titel}
          ariaLabel={zahl != null && s.wert === 'fussnoten' ? `Fussnoten (${zahl} im Erlass)` : undefined}
          /* Idempotent: ein Klick auf die gesetzte Stellung ist ein No-op
             (`setzeVermerke`) — eine Radiogruppe schaltet sich nicht selbst ab. */
          onKlick={() => setzeVermerke(s.wert)}
          attrs={{ role: 'menuitemradio', 'data-v3-vermerke': s.wert }}
        />
      ))}
      {ohneKlassifikation && (
        /* Kein `.lc-menu-zeile`: der Hinweis ist keine Bedienung, und die
           Zeilenhöhen-Sonde (`e2e/w224-d35-f4-menue.e2e.ts`) misst nur Zeilen,
           die eine sind. */
        <p id={hinweisId} className="px-3 pb-1.5 text-micro leading-snug text-ink-500">
          Dieser Erlass führt keine klassifizierten Änderungs-Fussnoten;
          «Fassung» und «Fussnoten» unterscheiden sich hier nur in der Fassungs-Zeile.
        </p>
      )}
    </MenueGruppe>
  );
}
