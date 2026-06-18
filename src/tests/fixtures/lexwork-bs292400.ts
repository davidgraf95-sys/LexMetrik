/**
 * Echter, gekürzter xhtml_tol-Ausschnitt der LexWork-API für die ZWEITE reale
 * Aufzählungs-Form (INLINE im Absatz, KEINE enumeration_item-Tabelle).
 *
 * Quelle: GET https://www.gesetzessammlung.bs.ch/api/de/texts_of_law/292.400
 * (BS, Verordnung über die Notariatstaxen / Notariatstarif), Feld
 * text_of_law.selected_version.xhtml_tol, abgerufen 16.6.2026.
 *
 * REALE Struktur (Spike 16.6.2026) — weicht von der Auftragsleitlinie ab (§7):
 *   - § 11 ist GENAU EIN <div class='paragraph'> (Absatz «1») mit VIELEN
 *     <p><span class='text_content'>…</span></p>.
 *   - Die Ziffern (1., 2., … 42.) stehen INLINE am Anfang eines text_content-
 *     Spans, der Punkttitel als <strong>: «1. <strong>Stiftung:</strong>».
 *   - Es gibt KEINE <table class='enumeration_item'> in diesem Erlass.
 *   - Unterpunkte erscheinen als «a) …», «b) …».
 *   - Folge-Spans ohne Marke (Tarif-Zeilen) gehören zum laufenden Punkt.
 *   - Aufgehobene Ziffern sind leere Marken («13.&nbsp;» ohne Text).
 *   - Artikel-Nummer trägt einen Änderungsmarker: «11&nbsp;<strong>*</strong>»
 *     → bereinige() liefert das Token «11».
 *
 * Der Ausschnitt enthält § 11 mit den Ziffern 1 (Stiftung), 13–15 (leer/
 * aufgehoben), 16, 17 (mit Tarif-Folgezeilen) — strukturell repräsentativ.
 */
export const LEXWORK_BS_292400_XHTML = `<div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>11&nbsp;<strong>*</strong></span>
    </div>
    <div class='article_title'>
      <span class='title_text'>Notariatstarif</span>
    </div>
  </div>
  <div class='paragraph'>
    <span class='number'>1</span>
    <p>
      <span class='text_content'>1. <strong>Stiftung:</strong></span>
    </p>
    <p>
      <span class='text_content'>Errichtung durch lebzeitiges Gesch&auml;ft und &Auml;nderung:</span>
    </p>
    <p>
      <span class='text_content'>CHF 400 bis CHF 2&rsquo;000;</span>
    </p>
    <p>
      <span class='text_content'>bei Errichtung vom Mehrbetrag &uuml;ber CHF 500&rsquo;000 zus&auml;tzlich 0,15%.</span>
    </p>
    <p>
      <span class='text_content'>13.&nbsp;</span>
    </p>
    <p>
      <span class='text_content'>14.&nbsp;</span>
    </p>
    <p>
      <span class='text_content'>15.&nbsp;</span>
    </p>
    <p>
      <span class='text_content'>16. <strong>Teilungsakt betreffend Liegenschaften</strong> zuhanden des Grundbuches (soweit nicht in Ziff. 34 geregelt):</span>
    </p>
    <p>
      <span class='text_content'>Die H&auml;lfte der Taxe gem&auml;ss Ziff. 17 hienach.</span>
    </p>
    <p>
      <span class='text_content'>17. <strong>&Uuml;bertragung von Grundeigentum:</strong></span>
    </p>
    <p>
      <span class='text_content'>bei Werten bis zu CHF 2 Mio. 0,25%, mindestens jedoch CHF 500,</span>
    </p>
    <p>
      <span class='text_content'>vom Mehrbetrag &uuml;ber CHF 2 Mio. 0,2%,</span>
    </p>
    <p>
      <span class='text_content'>vom Mehrbetrag &uuml;ber 10 Mio. 0,075%, h&ouml;chstens jedoch CHF 50&rsquo;000.&nbsp;</span>
    </p>
    <p>
      <span class='text_content'>20. <strong>Vorvertr&auml;ge:</strong></span>
    </p>
    <p>
      <span class='text_content'>a) <strong>Vorvertr&auml;ge</strong> sowie Vertr&auml;ge: H&auml;lfte der Taxe gem&auml;ss Ziff. 17;</span>
    </p>
    <p>
      <span class='text_content'>b) <strong>Vorkaufsrecht</strong> (OR 216 Abs. 2): H&auml;lfte der Taxe gem&auml;ss Ziff. 17;</span>
    </p>
  </div>
  <div class='paragraph_post'></div>`;
