import { useEffect, useState } from 'react';
import { Field, inputCls } from './ui';
import type { Kanton } from '../../types/legal';
import { zivilgerichtErstinstanz } from '../../data/zivilgerichteErstinstanz';
import type { KvMaterie } from '../../lib/vorlagen/klageVereinfacht';

// ─── Klage (vereinfachtes Verfahren): Gerichts-Auflösung alle Kantone ───────
// Kantonsausbau 10.6.2026 (Auftrag David). Reine Darstellung (§3): löst das
// erstinstanzliche Zivilgericht des gewählten Kantons über die zweifach
// geprüfte Recherche-Schicht (data/zivilgerichteErstinstanz.ts) auf —
// zentral → automatisch · liste → Wahl (massgeblich die örtliche
// Zuständigkeit) · verzeichnis → amtlicher Link + Handeingabe. Meldet die
// Adresszeilen ans Schema (answers.gerichtAufgeloest). BS läuft weiter über
// die abgenommenen KV_GERICHTE_BS (Vorrang in der Assemble-Kette, §5).
// MITTEL-Befund-Muster Schlichtungsgesuch: KEINE Auto-Vorwahl bei Listen —
// bis zur Wahl wird null gemeldet (Mängel-Gate hält den Export an).

export function KvGerichtWahl({ kanton, materie, onAufgeloest }: {
  kanton: Kanton;
  materie: KvMaterie | '';
  onAufgeloest: (zeilen: string[] | null) => void;
}) {
  // Render-Abgleich mit Schlüssel statt synchronem setState im Effect
  // (Haus-Lint-Regel): die Wahl gilt nur, solange der Kanton stimmt.
  const [wahl, setWahl] = useState<{ kanton: Kanton; idx: number }>({ kanton, idx: -1 });
  const wahlIdx = wahl.kanton === kanton ? wahl.idx : -1;
  const eintrag = zivilgerichtErstinstanz(kanton);
  const modus = eintrag?.erstinstanz.modus ?? null;
  // Bug-Check 10.6.2026 (MITTEL, fachlich): Ist für die Materie ein
  // SPEZIALGERICHT belegt (GE prud'hommes/baux, VD Tribunal des baux,
  // ZH Arbeits-/Mietgericht), darf NICHT automatisch das ordentliche
  // Gericht als Adressat gesetzt werden — Hinweis + Handeingabe.
  const spezialHinweis = materie === 'arbeit' ? eintrag?.hinweisArbeit
    : materie === 'miete_kernbereich' ? eintrag?.hinweisMiete : undefined;
  const spezial = !!spezialHinweis && kanton !== 'BS';

  useEffect(() => {
    if (!eintrag || spezial) { onAufgeloest(null); return; }
    const e = eintrag.erstinstanz;
    if (e.modus === 'zentral') {
      onAufgeloest([e.stelle.name, e.stelle.strasse, e.stelle.plzOrt]);
    } else if (e.modus === 'liste') {
      const g = wahlIdx >= 0 ? e.gerichte[Math.min(wahlIdx, e.gerichte.length - 1)] : undefined;
      onAufgeloest(g ? [g.name, g.strasse, g.plzOrt] : null);
    } else {
      onAufgeloest(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kanton, modus, wahlIdx, spezial]);

  if (!eintrag) return null;
  const e = eintrag.erstinstanz;
  const gewaehlt = e.modus === 'liste' && wahlIdx >= 0 ? e.gerichte[Math.min(wahlIdx, e.gerichte.length - 1)] : null;

  if (spezial) {
    return (
      <div className="space-y-3">
        <p className="lc-notice-warn text-body-s">{spezialHinweis}</p>
        <p className="text-body-s text-ink-600">
          Adressat wird hier NICHT automatisch gesetzt — Adresse des zuständigen Spezialgerichts unten von Hand erfassen.
        </p>
        <p className="text-xs text-ink-500">
          Quelle: {eintrag.quelle} (Stand {eintrag.stand}) — zweifach geprüft, fachliche Abnahme ausstehend.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {e.modus === 'zentral' && (
        <div className="lc-notice text-body-s">
          <span className="font-medium text-ink-900">{e.stelle.name}</span><br />
          {e.stelle.strasse}, {e.stelle.plzOrt} — wird als Adressat eingesetzt.
          {e.stelle.hinweis && <span className="block text-xs text-ink-600 mt-1">{e.stelle.hinweis}.</span>}
        </div>
      )}
      {e.modus === 'liste' && (
        <>
          <Field label="Zuständiges Gericht wählen" hint={`${e.gerichte.length} erstinstanzliche Gerichte im Kanton ${kanton} — massgeblich ist die örtliche Zuständigkeit (Forum)`}>
            <select className={inputCls} value={wahlIdx} onChange={(ev) => setWahl({ kanton, idx: Number(ev.target.value) })}>
              <option value={-1}>– Gericht wählen –</option>
              {e.gerichte.map((g, i) => <option key={g.name} value={i}>{g.name} — {g.plzOrt}{g.zustaendigFuer ? ` (${g.zustaendigFuer})` : ''}</option>)}
            </select>
          </Field>
          {gewaehlt?.hinweis && <p className="text-xs text-ink-600">{gewaehlt.hinweis}.</p>}
        </>
      )}
      {e.modus === 'verzeichnis' && (
        <p className="text-body-s text-ink-600">
          {e.beschreibung}.{' '}
          <a href={e.url} target="_blank" rel="noreferrer" className="text-brass-700 underline">Amtliches Verzeichnis öffnen ↗</a>
          {' '}— Adresse dort entnehmen und unten von Hand erfassen.
        </p>
      )}
      {(materie === 'arbeit' || materie === 'miete_kernbereich') && kanton !== 'BS' && (
        <p className="text-xs text-ink-600">
          Einzelne Kantone kennen für {materie === 'arbeit' ? 'arbeitsrechtliche Streitigkeiten' : 'Mietsachen'} besondere
          Gerichte oder Spruchkörper — massgeblich ist das kantonale Gerichtsorganisationsrecht; Adressat vor Einreichung prüfen.
        </p>
      )}
      <p className="text-xs text-ink-500">
        Quelle: {eintrag.quelle} (Stand {eintrag.stand}) — zweifach geprüft, fachliche Abnahme ausstehend;
        Adresse vor Einreichung kurz gegenprüfen.
      </p>
    </div>
  );
}
