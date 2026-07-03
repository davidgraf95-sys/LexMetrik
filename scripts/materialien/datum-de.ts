// scripts/materialien/datum-de.ts
// E6a Stufe 1: deterministisches Mapping deutscher Hub-Datumslabel → ISO. Geteilte Infrastruktur
// (§6.6), von den Hub-Adaptern (EDÖB u. a.) genutzt. Der SECO-Adapter (M2) trägt seine eigene
// Kopie (unberührt, um dessen committete Snapshots/Tests nicht anzufassen); die Semantik ist
// identisch. Wirft bei Unbekanntem (§8: kein stilles Falschmapping).

const MONATE: Record<string, string> = {
  Januar: '01', Februar: '02', März: '03', April: '04', Mai: '05', Juni: '06',
  Juli: '07', August: '08', September: '09', Oktober: '10', November: '11', Dezember: '12',
};

/** «6. Oktober 2025» → «2025-10-06». Wirft bei unparsbarem Label / unbekanntem Monat. */
export function datumslabelNachIso(label: string): string {
  const m = /^(\d{1,2})\.\s+([A-Za-zÄÖÜäöüß]+)\s+(\d{4})$/.exec(label.trim());
  if (!m) throw new Error(`datum-de: unparsbares Datumslabel «${label}».`);
  const monat = MONATE[m[2]];
  if (!monat) throw new Error(`datum-de: unbekannter Monatsname «${m[2]}» in «${label}».`);
  return `${m[3]}-${monat}-${m[1].padStart(2, '0')}`;
}

/** Prüft, ob ein String dem deutschen Hub-Datumsmuster entspricht (für die Span-Auswahl). */
export function istDeutschesDatumslabel(s: string): boolean {
  return /^\d{1,2}\.\s+[A-Za-zÄÖÜäöüß]+\s+\d{4}$/.test(s.trim());
}
