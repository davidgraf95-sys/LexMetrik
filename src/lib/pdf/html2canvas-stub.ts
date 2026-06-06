// Leeres Stub-Modul für html2canvas.
//
// jsPDF lädt html2canvas ausschliesslich per dynamischem `import("html2canvas")`
// innerhalb seiner `.html()`-Methode. LexMetrik ruft `.html()` nie auf (der
// PDF-Export zeichnet das Dokumentmodell direkt mit den jsPDF-Primitiven, siehe
// src/lib/pdf/pdfRender.ts und src/lib/vorlagen/vorlagenPdf.ts). Damit der ~200 kB
// grosse html2canvas-Chunk nicht in den Build gelangt, wird das Modul über
// resolve.alias in vite.config.ts auf dieses Stub umgebogen.
//
// Reine Ladepfad-Änderung (CLAUDE.md §6.4): die Logik bleibt unberührt, da der
// betroffene Codepfad (.html()) zur Laufzeit nie erreicht wird.
export default undefined;
