// Gekürzter, FAITHFUL-Ausschnitt des echten TI-HTML (m3.ti.ch, atto 137 = LTG —
// Legge sulla tariffa giudiziaria), live abgerufen 16.6.2026. Server-gerendertes
// HTML (utf-8), KEIN SPA. Geprüft am echten Markup (§7):
//   - Artikel-Kopf: fetter <span …font-weight:bold…>Art. N</span> (teils in
//     mehrere fette Spans zerlegt «Art.»·« »·«N»).
//   - Absatznummer: kleiner <span …font-size:8pt; vertical-align:2pt…>1</span>.
//   - Sachtitel/Marginalie: eigener <p> mit nur fettem Span (kein «Art. N»).
//   - Fussnoten: <a href="#_ftn…">…[N]…</a> bzw. hochgestellte «[N]»-Spans.
//   - Stand: «in vigore dal D.M.YYYY».
// Bewusst kompakt (drei Artikel + Sachtitel + Stand-Marker); die Tarif-Tabelle
// von Art. 7 ist weggelassen, ihre Tabellen-Verarbeitung deckt der Live-Lauf ab.
export const TI_LTG_HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>CAN - Raccolta delle leggi del Cantone Ticino</title></head>
<body>
<p style="margin:0pt 0pt 0pt 36pt; font-size:10pt">
  <span style="font-family:Arial; font-weight:bold">Oggetto</span>
</p>
<p style="margin:0pt 9.35pt 0pt 36pt; text-align:justify; font-size:10pt">
  <span style="font-family:Arial; font-weight:bold; vertical-align:2pt">Art.</span><span style="font-family:Arial; font-weight:bold; vertical-align:2pt"> </span><span style="font-family:Arial; font-weight:bold; vertical-align:2pt">1</span><span style="width:23.49pt; display:inline-block"></span><span style="font-family:Arial; font-size:8pt; vertical-align:2pt">1</span><span style="font-family:Arial; vertical-align:2pt">La presente legge stabilisce la tariffa delle spese processuali per l’amministrazione della giustizia civile e penale.</span>
</p>
<p style="margin:0pt 9.35pt 0pt 36pt; text-align:justify; font-size:10pt">
  <span style="font-family:Arial; font-size:8pt; vertical-align:2pt">2</span><span style="font-family:Arial">Sono riservate le leggi speciali.</span>
</p>
<p style="margin:0pt 0pt 0pt 36pt; font-size:10pt">
  <span style="font-family:Arial; font-weight:bold">Procedura semplificata</span>
</p>
<p style="margin:0pt 9.35pt 0pt 36pt; text-align:justify; font-size:10pt">
  <span style="font-family:Arial; font-weight:bold; vertical-align:2pt">Art. 8</span><span style="width:23.49pt; display:inline-block"></span><span style="font-family:Arial; font-size:8pt; vertical-align:2pt">1</span><span style="font-family:Arial; vertical-align:2pt">La tariffa delle decisioni del pretore nella procedura semplificata è uguale a quella nella procedura ordinaria.</span>
</p>
<p style="margin:0pt 0pt 0pt 36pt; font-size:10pt">
  <span style="font-family:Arial; font-weight:bold">Procedura sommaria</span>
</p>
<p style="margin:0pt 9.35pt 0pt 36pt; text-align:justify; font-size:10pt">
  <span style="font-family:Arial; font-weight:bold">Art. 9</span><a name="_ftnref3"></a><a href="#_ftn3" style="text-decoration:none"><span style="font-family:Arial; font-size:6.67pt; vertical-align:super; color:#000000">[3]</span></a><span style="width:12.37pt; display:inline-block"></span><span style="font-family:Arial; font-size:8pt; vertical-align:2pt">1</span><span style="font-family:Arial">La tariffa delle decisioni del pretore nella procedura sommaria è la metà di quella nella procedura ordinaria.</span>
</p>
<p style="margin:0pt 9.35pt 0pt 36pt; text-align:justify; font-size:10pt">
  <span style="font-family:Arial; font-size:8pt; vertical-align:2pt">2</span><span style="font-family:Arial">Nelle cause con un valore litigioso indeterminabile la tassa è fissata dal giudice.</span>
</p>
<p style="margin:0pt 9.35pt 0pt 7.1pt; text-align:justify; font-size:10pt">
  <a href="#_ftnref3" style="text-decoration:none"><span style="font-family:Arial; font-size:6.67pt; vertical-align:super; color:#000000">[3]</span></a><span style="font-family:Arial"> </span><span style="font-family:Arial">Articolo modificato dalla L 17.12.2014; in vigore dal 10.2.2015 - BU 2015, 38.</span>
</p>
</body></html>`;
