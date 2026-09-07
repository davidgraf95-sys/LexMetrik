import { NormText } from '../NormText';
import { befundZahl, type SchrittBefund } from './seiteHelfer';

// ─── D5 (W2·24-DESIGN-IDENTITAET) · Der «Prüfen»-Schritt prüft ───────────────
//
// GEMESSEN am 6./7.9.2026 (Funktions-Inventar W2·24, Befund D5, Fläche
// `/vorlagen/schlichtungsgesuch-bs`): Schritt 7 «Prüfen & Download» mit
// komplett leerem Formular ergab 0 × `role=alert`, 0 × `aria-invalid`,
// 0 × `required`; das PDF entstand und trug «KLAGENDE PARTEI» über lauter
// «________». Der Schrittname versprach eine Prüfung, die es nicht gab.
//
// URSACHE (kein W2·24-Rückschritt — auf `main` zeichengleich, siehe
// `abnahme/design-identitaet/D5-VORLAGEN.md`): der Wizard-Rahmen kannte
// immer nur die Fehler des GERADE sichtbaren Schritts (`fehler`-Prop). Im
// letzten Schritt sind das nur noch Ort/Datum und die fachlichen Blocker —
// die Pflichtangaben der Eingabe-Schritte 1..n-1 waren aus dem Blick. Wo eine
// Seite gar kein `fehler` durchreichte (Schlichtungsgesuch BS), blieb sogar
// «Weiter» dauerhaft aktiv, und man lief mit leerem Formular durch.
//
// DER FIX IST EIN ÜBERBLICK, KEINE SPERRE (§8 · Daueranweisung David
// 12.6.2026 «jede Vorlage ist jederzeit herunterladbar — auch unausgefüllt»):
// Der letzte Schritt sammelt die Fehler ALLER Schritte und sagt, was offen
// ist und wo es steht. Der Export bleibt möglich; er fragt einmal nach
// (ExportLeiste). Blockiert wird weiterhin NUR, was fachlich falsch wäre
// (gates.blocker) — eine fehlende Angabe ist kein Rechtsfehler, sondern eine
// Lücke, die das Dokument als Ausfüll-Strich ehrlich ausweist.
//
// §3: reine Darstellung. Welche Angabe Pflicht ist, entscheidet allein die
// Seite/Engine (`fehlerJeSchritt`); dieser Baustein zählt und zeigt.

/** Sammel-Hinweis am Kopf des «Prüfen»-Schritts.
 *
 *  `data-pruefbefund` ist der Tor-Griff (Wächter `wizard-pruefschritt-d5`,
 *  e2e `vorlagen-pruefschritt-d5`): «offen» = es fehlt etwas, «vollstaendig» =
 *  geprüft und nichts offen. Der Vollzugs-Fall ist bewusst KEIN `role=alert`
 *  (nichts ist eingetreten) und trägt die neutrale `.lc-notice`-Grammatik. */
export function PruefBefund({ befunde, onSpringe }: {
  befunde: SchrittBefund[];
  /** Sprung in den Schritt, der die Lücke trägt. */
  onSpringe: (schritt: number) => void;
}) {
  const zahl = befundZahl(befunde);
  if (zahl === 0) {
    return (
      <div data-pruefbefund="vollstaendig" className="lc-notice text-body-s">
        Alle Pflichtangaben dieser Vorlage sind ausgefüllt.
      </div>
    );
  }
  return (
    <div role="alert" data-pruefbefund="offen" className="lc-notice lc-notice-danger space-y-2">
      <p className="lc-overline text-danger-700">Prüfung</p>
      <p className="text-body-s text-danger-700">
        Es fehlen <span className="num">{zahl}</span> {zahl === 1 ? 'Pflichtangabe' : 'Pflichtangaben'}.
      </p>
      <ul className="space-y-2">
        {befunde.map((b) => (
          <li key={b.index} className="space-y-0.5">
            {/* Sprungliste: der Knopf trägt Schritt-Nummer UND Beschriftung —
                «Schritt 3» allein sagt nicht, wo man landet.
                `lc-btn-ghost lc-btn-sm` ist der Haus-Textknopf (B-K1/§5: kein
                Knopf ohne Baustein) — `px-0` nimmt ihm die Toolbar-Polsterung,
                damit er in der Aufzählung auf der Textkante steht, der
                Unterstrich sagt «hier geht es weiter» (F0.8/§13). Die Tinte
                bleibt die des Kastens (danger-700). */}
            <button type="button" onClick={() => onSpringe(b.index)}
              className="lc-btn-ghost lc-btn-sm px-0 text-danger-700 underline underline-offset-2 hover:no-underline">
              Schritt <span className="num">{b.index + 1}</span> · {b.label} →
            </button>
            <ul className="space-y-0.5">
              {b.fehler.map((f, i) => (
                <li key={i} className="text-body-s text-danger-700">• <NormText text={f} /></li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {/* §8/Daueranweisung David 12.6.2026: der Ausweg wird benannt, nicht
          verschwiegen — der Download bleibt offen, die Lücke wird sichtbar. */}
      <p className="text-xs text-danger-700">
        Herunterladen ist trotzdem möglich; offene Stellen erscheinen im Dokument als Ausfüll-Striche («________»).
      </p>
    </div>
  );
}
