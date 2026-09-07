/**
 * Genau EINE Definition (§5) für die vier ZH-PDF-Seiten-Fixtures
 * (`zh-pdf-seiten-stuecke.ts`, `.212812.ts`, `.1752.ts`, `.2111.ts`), die
 * bislang das Interface vierfach mitführten. Eine Typdatei statt der Barrel
 * `zh-pdf-seiten-stuecke.ts`, damit die drei Datendateien es importieren
 * können, ohne einen Zirkel über die Barrel-Re-Exports zu ziehen (Nachzug
 * QS-FREMDAGENTEN, 5.9.2026).
 */
export interface ZhStueckFixture {
  x: number;
  y: number;
  h: number;
  w: number;
  s: string;
}
