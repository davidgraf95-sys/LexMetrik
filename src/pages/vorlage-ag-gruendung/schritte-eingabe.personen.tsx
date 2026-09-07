import { Field, inputCls, ListenEditor } from '../../components/vorlagen/ui';
import { usePaneKlasse } from '../../components/layout/PaneKontext';
import type { AgVrZeichnungsArt, AgVertretungsZeichnungsArt } from '../../lib/vorlagen/gruendungAgDokumente';
import { VR_ZEICHNUNGS_OPTIONEN, VERTRETUNGS_ZEICHNUNGS_OPTIONEN } from '../vorlagenAgGruendungDaten';
import type { AgSchrittCtx } from './ctx';

export function SchrittPersonen({ ctx }: { ctx: AgSchrittCtx }) {
  const {
    gruender, setGruender, vr, setVr, neuerKey, vertretungen, setVertretungen,
    protokollfuehrer, setProtokollfuehrer, sitzungBeginn, setSitzungBeginn,
    sitzungEnde, setSitzungEnde, optingOut, rsName, setRsName, rsSitz, setRsSitz,
  } = ctx;
  const pk = usePaneKlasse();
  return (
    <div className="space-y-4">
      {/* Gründer */}
      <div className="space-y-2">
        <p className="text-body-s font-medium text-ink-900">Gründer:innen und Zeichnung (Art. 629/630 OR)</p>
        {/* R2-F/F1-9: handgebauter `rounded-md border border-line`-Behälter,
            «✕»-Entfernen und «+ … hinzufügen» wichen dem ListenEditor. Der
            Übernahme-Knopf «→ als VR-Mitglied übernehmen» bleibt im Eintrag —
            er ist eine Fach-Handlung, keine Listen-Mechanik. */}
        <ListenEditor
          element="Gründer:in"
          eintraege={gruender}
          className="space-y-2"
          schluessel={(g) => g.key}
          onHinzufuegen={() => setGruender((alt) => [...alt, { key: neuerKey(), name: '', angaben: '', anzahl: '', liberierung: '' }])}
          onEntfernen={(i) => setGruender((alt) => alt.filter((_, j) => j !== i))}
          kinder={(g) => (
            <div className="space-y-2">
              <div className={pk('grid grid-cols-1 sm:grid-cols-2 gap-2', 'grid grid-cols-1 @lg/pane:grid-cols-2 gap-2')}>
                <Field label="Name">
                  <input className={inputCls} value={g.name}
                    onChange={(e) => setGruender((alt) => alt.map((x) => x.key === g.key ? { ...x, name: e.target.value } : x))} />
                </Field>
                <Field label="Angaben (z. B. «von Basel, in Zürich, Musterweg 1»)">
                  <input className={inputCls} value={g.angaben}
                    onChange={(e) => setGruender((alt) => alt.map((x) => x.key === g.key ? { ...x, angaben: e.target.value } : x))} />
                </Field>
              </div>
              <div className={pk('grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-end', 'grid grid-cols-1 @4xl/pane:grid-cols-[1fr_1fr_auto] gap-2 items-end')}>
                <Field label="Gezeichnete Aktien">
                  <input className={inputCls} inputMode="numeric" value={g.anzahl}
                    onChange={(e) => setGruender((alt) => alt.map((x) => x.key === g.key ? { ...x, anzahl: e.target.value } : x))} />
                </Field>
                <Field label="Liberierung in % (leer = globaler Wert)">
                  <input className={inputCls} inputMode="numeric" value={g.liberierung ?? ''}
                    onChange={(e) => setGruender((alt) => alt.map((x) => x.key === g.key ? { ...x, liberierung: e.target.value } : x))} />
                </Field>
                <button type="button" className="lc-btn-outline lc-btn-sm"
                  title="Übernimmt den Namen in den Verwaltungsrat (Heimatort/Wohnort dort ergänzen)."
                  disabled={!g.name.trim() || vr.some((v) => v.name.trim() === g.name.trim())}
                  onClick={() => setVr((alt) => [...alt, { key: neuerKey(), name: g.name.trim(), herkunft: '', wohnort: '', adresse: '', praesident: alt.length === 0, zeichnungsArt: 'einzelunterschrift' }])}>
                  → als VR-Mitglied übernehmen
                </button>
              </div>
            </div>
          )}
        />
      </div>

      {/* Verwaltungsrat */}
      <div className="space-y-2">
        <p className="text-body-s font-medium text-ink-900">Verwaltungsrat (Art. 707 ff. OR)</p>
        <ListenEditor
          element="VR-Mitglied"
          eintraege={vr}
          className="space-y-2"
          schluessel={(v) => v.key}
          onHinzufuegen={() => setVr((alt) => [...alt, { key: neuerKey(), name: '', herkunft: '', wohnort: '', adresse: '', praesident: alt.length === 0, zeichnungsArt: 'einzelunterschrift' }])}
          onEntfernen={(i) => setVr((alt) => alt.filter((_, j) => j !== i))}
          kinder={(v) => (
          <div className="space-y-2">
            <div className={pk('grid grid-cols-1 sm:grid-cols-3 gap-2', 'grid grid-cols-1 @xl/pane:grid-cols-3 gap-2')}>
              <Field label="Name">
                <input className={inputCls} value={v.name}
                  onChange={(e) => setVr((alt) => alt.map((x) => x.key === v.key ? { ...x, name: e.target.value } : x))} />
              </Field>
              <Field label="Heimatort / Staatsangehörigkeit">
                <input className={inputCls} value={v.herkunft}
                  onChange={(e) => setVr((alt) => alt.map((x) => x.key === v.key ? { ...x, herkunft: e.target.value } : x))} />
              </Field>
              <Field label="Wohnort">
                <input className={inputCls} value={v.wohnort}
                  onChange={(e) => setVr((alt) => alt.map((x) => x.key === v.key ? { ...x, wohnort: e.target.value } : x))} />
              </Field>
            </div>
            <div className={pk('grid grid-cols-1 sm:grid-cols-2 gap-2', 'grid grid-cols-1 @lg/pane:grid-cols-2 gap-2')}>
              <Field label="Adresse (für die Wahlannahmeerklärung)">
                <input className={inputCls} value={v.adresse}
                  onChange={(e) => setVr((alt) => alt.map((x) => x.key === v.key ? { ...x, adresse: e.target.value } : x))} />
              </Field>
              <Field label="Zeichnungsberechtigung">
                <select className={inputCls} value={v.zeichnungsArt}
                  onChange={(e) => setVr((alt) => alt.map((x) => x.key === v.key ? { ...x, zeichnungsArt: e.target.value as AgVrZeichnungsArt } : x))}>
                  {VR_ZEICHNUNGS_OPTIONEN.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </Field>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-body-s text-ink-700">
              <label className="flex items-center gap-1.5">
                <input type="checkbox" checked={v.praesident}
                  onChange={(e) => setVr((alt) => alt.map((x) => x.key === v.key ? { ...x, praesident: e.target.checked } : x))} />
                Präsident:in
              </label>
              <label className="flex items-center gap-1.5"
                title="Die Person ist beim Beurkundungstermin anwesend und erklärt die Annahme in der Urkunde – die separate Wahlannahmeerklärung entfällt (Art. 43 Abs. 1 lit. c HRegV).">
                <input type="checkbox" checked={v.annahmeInUrkunde ?? false}
                  onChange={(e) => setVr((alt) => alt.map((x) => x.key === v.key ? { ...x, annahmeInUrkunde: e.target.checked } : x))} />
                Annahme in der Urkunde
              </label>
            </div>
          </div>
          )}
        />
        <div className={pk('grid grid-cols-1 sm:grid-cols-3 gap-4', 'grid grid-cols-1 @xl/pane:grid-cols-3 gap-4')}>
          <Field label="Protokollführung (leer = Präsident:in)">
            <input className={inputCls} value={protokollfuehrer} onChange={(e) => setProtokollfuehrer(e.target.value)} />
          </Field>
          <Field label="Sitzungsbeginn (Uhrzeit, fürs Protokoll)">
            <input className={inputCls} value={sitzungBeginn} onChange={(e) => setSitzungBeginn(e.target.value)} placeholder="z. B. 11.00" />
          </Field>
          <Field label="Sitzungsende (Uhrzeit)">
            <input className={inputCls} value={sitzungEnde} onChange={(e) => setSitzungEnde(e.target.value)} placeholder="z. B. 11.15" />
          </Field>
        </div>
      </div>

      {/* Weitere Zeichnungsberechtigte */}
      <div className="space-y-2">
        <p className="text-body-s font-medium text-ink-900">Weitere Zeichnungsberechtigte (optional, ins VR-Protokoll)</p>
        <ListenEditor
          element="Person"
          eintraege={vertretungen}
          className="space-y-2"
          schluessel={(v) => v.key}
          onHinzufuegen={() => setVertretungen((alt) => [...alt, { key: neuerKey(), name: '', funktion: '', zeichnungsArt: 'kollektivzuzweien' }])}
          onEntfernen={(i) => setVertretungen((alt) => alt.filter((_, j) => j !== i))}
          kinder={(v) => (
            <div className={pk('grid grid-cols-1 sm:grid-cols-[2fr_2fr_2fr] gap-2 items-end', 'grid grid-cols-1 @4xl/pane:grid-cols-[2fr_2fr_2fr] gap-2 items-end')}>
              <Field label="Name">
                <input className={inputCls} value={v.name}
                  onChange={(e) => setVertretungen((alt) => alt.map((x) => x.key === v.key ? { ...x, name: e.target.value } : x))} />
              </Field>
              <Field label="Funktion">
                <input className={inputCls} value={v.funktion}
                  onChange={(e) => setVertretungen((alt) => alt.map((x) => x.key === v.key ? { ...x, funktion: e.target.value } : x))} />
              </Field>
              <Field label="Zeichnung">
                <select className={inputCls} value={v.zeichnungsArt}
                  onChange={(e) => setVertretungen((alt) => alt.map((x) => x.key === v.key ? { ...x, zeichnungsArt: e.target.value as AgVertretungsZeichnungsArt } : x))}>
                  {VERTRETUNGS_ZEICHNUNGS_OPTIONEN.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </Field>
            </div>
          )}
        />
      </div>

      {!optingOut && (
        <div className={pk('grid grid-cols-1 sm:grid-cols-2 gap-4', 'grid grid-cols-1 @lg/pane:grid-cols-2 gap-4')}>
          <Field label="Revisionsstelle (Name)">
            <input className={inputCls} value={rsName} onChange={(e) => setRsName(e.target.value)} />
          </Field>
          <Field label="Revisionsstelle (Sitz)">
            <input className={inputCls} value={rsSitz} onChange={(e) => setRsSitz(e.target.value)} />
          </Field>
        </div>
      )}
    </div>
  );
}
