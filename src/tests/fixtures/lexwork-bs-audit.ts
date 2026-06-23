/**
 * Echte, gekürzte xhtml_tol-Ausschnitte der LexWork-API (BS,
 * gesetzessammlung.bs.ch) für die fünf Daten-Treue-Fixes des
 * BS-Vorbildkanton-Audits (23.6.2026). Jeder Ausschnitt ist 1:1 aus
 * GET https://www.gesetzessammlung.bs.ch/api/de/texts_of_law/{nr}
 * (Feld text_of_law.selected_version.xhtml_tol) übernommen, abgerufen 23.6.2026.
 *
 * Quellen je Konstante in der jeweiligen Doku.
 */

/**
 * S1 — aufgehobene, aber UMNUMMERIERTE Artikel: Header (Nummer + «…»-Titel),
 * aber KEIN paragraph/enumeration-Body. § 6 ist aufgehoben (Platzhalter «&hellip;»),
 * § 7 trägt einen Body — beide müssen erscheinen, die Nummerierung darf nicht reissen.
 *
 * Quelle: 410.100 (Schulgesetz), §§ 6–7. Nachgebildet im selben Markup wie live.
 */
export const LEXWORK_BS_410100_AUFGEHOBEN_XHTML = `<div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>6&nbsp;<strong>*</strong></span>
    </div>
    <div class='article_title'>
      &hellip;
    </div>
  </div>
  <div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>7&nbsp;<strong>*</strong></span>
    </div>
    <div class='article_title'>
      <span class='title_text'>Schulpflicht</span>
    </div>
  </div>
  <div class='paragraph'>
    <span class='number'>1</span>
    <p>
      <span class='text_content'>Die Schulpflicht dauert elf Jahre.</span>
    </p>
  </div>`;

/**
 * S1 (zweiter Regressionsfall) — § 53 hat NUR einen Randtitel («Änderung anderer
 * Gesetze») mit Fussnoten-Anker und KEINEN Body. Darf nicht verschluckt werden;
 * der Randtitel (N1) muss fussnoten-bereinigt extrahiert werden.
 *
 * Quelle: 153.100, § 53.
 */
export const LEXWORK_BS_153100_S53_XHTML = `<div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>53</span>
    </div>
    <div class='article_title'>
      <span class='title_text'>&Auml;nderung anderer Gesetze<a class="footnote" name="articletitle_text_fn_729094_2_4" href="#articletitle_text_fn_729094_2_4_c" id="articletitle_text_fn_729094_2_4">[4]</a></span>
    </div>
  </div>`;

/**
 * S2 + S4 + N1 — 834.410 (Verordnung über die Krankenversicherung) § 8a:
 *   - N1: Randtitel «Kantonale Beiträge an die Spital- und Pflegeheimtaxen».
 *   - S4: Abs. 1/2/3 sind je ein paragraph-Block, dessen ERSTER Span ein kurzer
 *     markierter Sachtitel ist («a) Spital», «b) Pflegeheim», «c) Beitragshöhe») —
 *     KEINE lit.-Aufzählung, sondern eine Zwischenüberschrift.
 *   - S2: nach der enumeration_tabular folgt ein paragraph_post mit
 *     text_content_post (Ziff. 2–6: Vermögensgrenze Fr. 1'000'000, 360 Pflegetage,
 *     ausserkantonal-Klausel) — substantieller Normtext, der nicht verloren gehen darf.
 *   - Die LEEREN paragraph_post zwischen den Absätzen («<div class='paragraph_post'></div>»)
 *     dürfen die folgenden Absätze nicht verschlucken.
 *
 * Quelle: 834.410, § 8a (1:1 live, gekürzte Tarif-Tabelle).
 */
export const LEXWORK_BS_834410_S8A_XHTML = `<div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>8a&nbsp;<strong>*</strong></span>
    </div>
    <div class='article_title'>
      <span class='title_text'>Kantonale Beitr&auml;ge an die Spital- und Pflegeheimtaxen</span>
    </div>
  </div>
  <div class='paragraph'>
    <span class='number'>1</span>
    <p>
      <span class='text_content'>a) Spital<a class="footnote" name="paragraphtext_content_fn_3197856_2_5" href="#paragraphtext_content_fn_3197856_2_5_c" id="paragraphtext_content_fn_3197856_2_5">[5]</a></span>
    </p>
    <p>
      <span class='text_content'>Reduziert ein Krankenversicherer seine Leistungen pro Spitaltag in Anwendung von Art. 49 Abs. 4 KVG und bezieht die versicherte Person weder eine Rente der AHV oder IV noch ein Taggeld der IV oder Sozialhilfe, richtet der Kanton bis zum 360. Pflegetag an den Aufenthalt der versicherten Person in den Spit&auml;lern, welche auf der Spitalliste des Kantons aufgef&uuml;hrt sind, auf Gesuch hin Beitr&auml;ge aus.</span>
    </p>
  </div>
  <div class='paragraph_post'></div>
  <div class='paragraph'>
    <span class='number'>2</span>
    <p>
      <span class='text_content'>b) Pflegeheim</span>
    </p>
    <p>
      <span class='text_content'>Bei Aufenthalt der versicherten Person, welche weder eine Rente der AHV oder IV noch ein Taggeld der IV noch Sozialhilfe bezieht, in einem Pflegeheim oder in einer Pflegeabteilung eines Spitals, welche auf der Pflegeheimliste des Kantons aufgef&uuml;hrt ist, richtet der Kanton bis zum 360. Pflegetag auf Gesuch hin Beitr&auml;ge aus.</span>
    </p>
  </div>
  <div class='paragraph_post'></div>
  <div class='paragraph'>
    <span class='number'>3</span>
    <p>
      <span class='text_content'>c) Beitragsh&ouml;he</span>
    </p>
    <p>
      <span class='text_content'>1. Die H&ouml;he der Beitr&auml;ge richtet sich nach den f&uuml;r die individuelle Pr&auml;mienverbilligung (IPV) geltenden Einkommensgruppen.&nbsp;<strong>*</strong></span>
    </p>
  </div>
  <table class='enumeration_tabular'>
    <tr>
      <th>IPV-Einkommensgruppe</th>
      <th>Max. Eigenleistungen Patient/-in Fr. pro Tag&nbsp;<strong>*</strong></th>
    </tr>
    <tr>
      <td>1</td>
      <td>10</td>
    </tr>
    <tr>
      <td>keine IPV-Anspruch</td>
      <td>50</td>
    </tr>
  </table>
  <div class='paragraph_post'>
    <p>
      <span class='text_content_post'>2. Die Beitr&auml;ge sind zu Leistungen Dritter subsidi&auml;r.</span>
    </p>
    <p>
      <span class='text_content_post'>3. Die Beitr&auml;ge werden nur an Personen mit Wohnsitz im Kanton ausgerichtet.</span>
    </p>
    <p>
      <span class='text_content_post'>4. Keinen Anspruch auf Beitr&auml;ge gem&auml;ss &sect; 8 lit. a und b haben Personen mit einem steuerbaren Verm&ouml;gen von mehr als Fr. 1'000'000.<a class="footnote" name="paragraphtext_content_post_fn_3197858_2_6" href="#paragraphtext_content_post_fn_3197858_2_6_c" id="paragraphtext_content_post_fn_3197858_2_6">[6]</a></span>
    </p>
    <p>
      <span class='text_content_post'>5. Das Gesundheitsdepartement kann die Beitragsgew&auml;hrung &uuml;ber die genannten 360 Pflegetage hinaus verl&auml;ngern.</span>
    </p>
    <p>
      <span class='text_content_post'>6. Der Kanton kann die Beitr&auml;ge auch bei Aufenthalten der versicherten Person in ausserkantonalen Spit&auml;lern und Pflegeheimen ausrichten.</span>
    </p>
  </div>`;

/**
 * S3 — aufgehobener lit.-Buchstabe mit Marke, aber leerem Body (Zelle «&nbsp;»):
 * 640.100 (Steuergesetz) § 35 Abs. 1, lit. g (zwischen f und h). Die lit.-Reihe
 * muss a,b,c,d,e,f,g,h lauten (kein fehlendes g). KEIN fabrizierter Text.
 *
 * Quelle: 640.100, § 35 (gekürzt auf f/g/h).
 */
export const LEXWORK_BS_640100_S35_XHTML = `<div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>35</span>
    </div>
    <div class='article_title'>
      <span class='title_text'>&nbsp;</span>
    </div>
  </div>
  <div class='paragraph'>
    <span class='number'>1</span>
    <p>
      <span class='text_content'>Vom Einkommen werden abgezogen:&nbsp;<strong>*</strong></span>
    </p>
  </div>
  <table class='enumeration_item'>
    <tr>
      <td class='number'>f)</td>
      <td class='left_col last' colspan='3'>3'300 Franken f&uuml;r allein stehende Rentner und Rentnerinnen zus&auml;tzlich zum Abzug nach lit. c;</td>
    </tr>
  </table>
  <table class='enumeration_item'>
    <tr>
      <td class='number'>g)&nbsp;<strong>*</strong></td>
      <td class='left_col last' colspan='3'>&nbsp;</td>
    </tr>
  </table>
  <table class='enumeration_item'>
    <tr>
      <td class='number'>h)&nbsp;<strong>*</strong></td>
      <td class='left_col last' colspan='3'>18'500 Franken h&ouml;chstens f&uuml;r die Unterst&uuml;tzung der Partnerin oder des Partners einer Lebensgemeinschaft.</td>
    </tr>
  </table>`;

/**
 * S3 (zweiter Regressionsfall) — 832.710 § 14 Abs. 2: lit. b ist aufgehoben
 * (Marke «b)», leere Zelle). Die Reihe muss a,b,c lauten.
 *
 * Quelle: 832.710, § 14 (gekürzt auf Abs. 2 mit lit. a/b/c).
 */
export const LEXWORK_BS_832710_S14_XHTML = `<div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>14</span>
    </div>
    <div class='article_title'>
      <span class='title_text'>&nbsp;</span>
    </div>
  </div>
  <div class='paragraph'>
    <span class='number'>2</span>
    <p>
      <span class='text_content'>H&auml;rtef&auml;lle k&ouml;nnen insbesondere sein:</span>
    </p>
  </div>
  <table class='enumeration_item'>
    <tr>
      <td class='number'>a)</td>
      <td class='left_col last' colspan='3'>Der Eintritt in ein Pflegeheim oder in ein Wohnheim f&uuml;r Behinderte.</td>
    </tr>
  </table>
  <table class='enumeration_item'>
    <tr>
      <td class='number'>b)&nbsp;<strong>*</strong></td>
      <td class='left_col last' colspan='3'>&nbsp;</td>
    </tr>
  </table>
  <table class='enumeration_item'>
    <tr>
      <td class='number'>c)&nbsp;<strong>*</strong></td>
      <td class='left_col last' colspan='3'>Der Eintritt des Todes einer im gemeinsamen Haushalt lebenden Ehegattin.</td>
    </tr>
  </table>`;

/**
 * T3/S4 (BS-Audit 23.6.2026) — Tarif-Tabellen aus echter LexWork-API, verbatim.
 * Abgerufen 23.6.2026, GET .../api/de/texts_of_law/{nr}, Feld xhtml_tol.
 *  - STG_50  640.100 § 50: label-lose enumeration_tabular (leere <th>), 3 Spalten,
 *            «Über …»-Zeile mit leerer Mittelzelle → positionsbasiert (T3).
 *  - STG_131 640.100 § 131: label-lose enumeration_tabular, 4 Spalten (T3).
 *  - IWB_3   772.430 § 3: erste <th> leer (Tarif-Nr.), Rest beschriftet → Tarif-Nr.
 *            in Spalte 0, kein Phantom-Spalten-Versatz (S4); &ge;/&lt; im Text.
 *  - GER_29  154.810 § 29 (auf Kopf + 4 Datenzeilen gekürzt): Positions-Nr. «4.a)»
 *            mit Buchstaben-Suffix muss als Tarif-Nr. erkannt werden (T3).
 */
export const LEXWORK_BS_640100_S50_XHTML = `<div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>50</span>
    </div>
    <div class='article_title'>
      <span class='title_text'>&nbsp;</span>
    </div>
  </div>
  <div class='paragraph'>
    <span class='number'>1</span>
    <p>
      <span class='text_content'>Die j&auml;hrliche Steuer auf dem steuerbaren Verm&ouml;gen wird nach folgendem Tarif (Tarif A) berechnet:&nbsp;<strong>*</strong></span>
    </p>
  </div>
  <table class='enumeration_tabular'>
    <tr>
      <th></th>
      <th></th>
      <th></th>
    </tr>
    <tr>
      <td>
        Von Fr. 0&nbsp;<strong>*</strong>
      </td>
      <td>
        bis Fr. 250'000:&nbsp;<strong>*</strong>
      </td>
      <td>
        Fr. 4.50 je Fr. 1'000&nbsp;<strong>*</strong>
      </td>
    </tr>
    <tr>
      <td>
        Von Fr. 250'000&nbsp;<strong>*</strong>
      </td>
      <td>
        bis Fr. 750'000:&nbsp;<strong>*</strong>
      </td>
      <td>
        Fr. 6.50 je Fr. 1'000&nbsp;<strong>*</strong>
      </td>
    </tr>
    <tr>
      <td>
        &Uuml;ber Fr. 750'000:&nbsp;<strong>*</strong>
      </td>
      <td></td>
      <td>
        Fr. 7.90 je Fr. 1'000&nbsp;<strong>*</strong>
      </td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td></td>
    </tr>
  </table>
  `;

export const LEXWORK_BS_640100_S131_XHTML = `<div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>131</span>
    </div>
    <div class='article_title'>
      <span class='title_text'>b) Zuschl&auml;ge</span>
    </div>
  </div>
  <div class='paragraph'>
    <span class='number'>1</span>
    <p>
      <span class='text_content'>Auf der einfachen Steuer wird ein Zuschlag erhoben. Dieser betr&auml;gt:</span>
    </p>
  </div>
  <table class='enumeration_tabular'>
    <tr>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
    <tr>
      <td>
        25%
      </td>
      <td>
        bei einem Empfange
      </td>
      <td>
        bis zu
      </td>
      <td>
        CHF 100'000
      </td>
    </tr>
    <tr>
      <td>
        50%
      </td>
      <td>
        bei einem Empfange
      </td>
      <td>
        bis zu
      </td>
      <td>
        CHF 200'000
      </td>
    </tr>
    <tr>
      <td>
        75%
      </td>
      <td>
        bei einem Empfange
      </td>
      <td>
        bis zu
      </td>
      <td>
        CHF 500'000
      </td>
    </tr>
    <tr>
      <td>
        100%
      </td>
      <td>
        bei einem Empfange
      </td>
      <td>
        bis zu
      </td>
      <td>
        CHF 1'000'000
      </td>
    </tr>
    <tr>
      <td>
        125%
      </td>
      <td>
        bei einem Empfange
      </td>
      <td>
        bis zu
      </td>
      <td>
        CHF 2'000'000
      </td>
    </tr>
    <tr>
      <td>
        150%
      </td>
      <td>
        bei einem Empfange
      </td>
      <td>
        bis zu
      </td>
      <td>
        CHF 3'000'000
      </td>
    </tr>
    <tr>
      <td>
        175%
      </td>
      <td>
        bei einem Empfange
      </td>
      <td>
        von &uuml;ber
      </td>
      <td>
        CHF 3'000'000.
      </td>
    </tr>
  </table>
  `;

export const LEXWORK_BS_772430_S3_XHTML = `<div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>3</span>
    </div>
    <div class='article_title'>
      <span class='title_text'>Kundensegmente und Zuteilungskriterien</span>
    </div>
  </div>
  <div class='paragraph'>
    <span class='number'>1</span>
    <p>
      <span class='text_content'>Der Geb&uuml;hrentarif unterscheidet zwischen folgenden Kundensegmenten:</span>
    </p>
  </div>
  <table class='enumeration_tabular'>
    <tr>
      <th></th>
      <th>
        Segment
      </th>
      <th>
        Zuordnungskriterium
      </th>
    </tr>
    <tr>
      <td>
        1
      </td>
      <td>
        Small
      </td>
      <td>
        Vorjahresverbrauch &lt;13 MWh oder tempor&auml;re Netzanschl&uuml;sse (Messen, M&auml;rkte, &ouml;ffentliche Beleuchtung und sonstige Veranstaltungen sowie Baustromanschl&uuml;sse)
      </td>
    </tr>
    <tr>
      <td>
        2
      </td>
      <td>
        Small plus
      </td>
      <td>
        Vorjahresverbrauch &ge;13 MWh bis &lt;50 MWh
      </td>
    </tr>
    <tr>
      <td>
        3
      </td>
      <td>
        Medium
      </td>
      <td>
        Vorjahresverbrauch &ge;50 MWh bis &lt;100 MWh
      </td>
    </tr>
    <tr>
      <td>
        4
      </td>
      <td>
        Medium plus
      </td>
      <td>
        Vorjahresverbrauch &ge;100 MWh bis &lt;1 GWh
      </td>
    </tr>
    <tr>
      <td>
        5
      </td>
      <td>
        Big
      </td>
      <td>
        Vorjahresverbrauch &ge;1 GWh bis &lt;10 GWh
      </td>
    </tr>
    <tr>
      <td>
        6
      </td>
      <td>
        Big plus
      </td>
      <td>
        Vorjahresverbrauch &ge;10 GWh
      </td>
    </tr>
    <tr>
      <td>
        7
      </td>
      <td>
        Switch
      </td>
      <td>
        Kundinnen und Kunden mit Wahltarif unterbrechbare Verbraucher gem&auml;ss &sect; 13 Geb&uuml;hrentarif von IWB Industrielle Werke Basel f&uuml;r den Anschluss und die Nutzung des Netzes f&uuml;r elektrische Energie
      </td>
    </tr>
    <tr>
      <td>
        8
      </td>
      <td>
        Crowd
      </td>
      <td>
        Kundinnen und Kunden mit Wahltarif IWB Sonnenbox Crowd
      </td>
    </tr>
  </table>
  `;

export const LEXWORK_BS_154810_S29_XHTML = `<div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>29</span>
    </div>
    <div class='article_title'>
      <span class='title_text'>Geb&uuml;hren des Erbschaftsamtes</span>
    </div>
  </div>
  <div class='paragraph'>
    <span class='number'>1</span>
    <p>
      <span class='text_content'>F&uuml;r Verrichtungen des Erbschaftsamtes werden folgende Geb&uuml;hren erhoben.</span>
    </p>
  </div>
  <table class='enumeration_tabular'>
    <tr>
      <th></th>
      <th>
        Gegenstand
      </th>
      <th>
        Geb&uuml;hren
      </th>
    </tr>
    <tr>
      <td>
        1.
      </td>
      <td>
        Ausk&uuml;ndungen (Rechnungsruf und dergleichen)
      </td>
      <td>
        Fr. 25
      </td>
    </tr>
    <tr>
      <td>
        2.
      </td>
      <td>
        Einschreibung einer Gl&auml;ubigerin oder eines Gl&auml;ubigers beim &ouml;ffentlichen Inventar und bei der amtlichen Liquidation
      </td>
      <td>
        Fr. 6
      </td>
    </tr>
    <tr>
      <td>
        3.
      </td>
      <td>
        Vorladungen und Anzeigen
      </td>
      <td>
        Fr. 6
      </td>
    </tr>
    <tr>
      <td>
        4.a)
      </td>
      <td>
        Auskunfts- und Erkundigungsschreiben, Korrespondenz, Vernehmlassungen, Berichte und Begutachtungen, Abfragen im Internet&nbsp;<strong>*</strong>
      </td>
      <td>
        Fr. 20 bis Fr. 600&nbsp;<strong>*</strong>
      </td>
    </tr>
  </table>
  `;
