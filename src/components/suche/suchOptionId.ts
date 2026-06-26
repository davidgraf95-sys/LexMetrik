/** Stabile, zwischen Eingabefeld und Trefferpanel geteilte Options-ID (eine
 *  Quelle, §5). In eigener Datei, damit SuchResultate nur Komponenten exportiert
 *  (react-refresh/only-export-components). */
export const suchOptionId = (listboxId: string, gruppeId: string, trefferId: string) =>
  `${listboxId}-${gruppeId}-${trefferId}`;
