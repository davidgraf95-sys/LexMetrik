import { dauerUeberDreiMonate } from '../src/lib/datumsUtils';
import { parseISO } from 'date-fns';
// exactly 3 months: 01.01 -> 01.04 should be FALSE (not >3 months)
console.log('01.01->01.04 (exactly 3mo):', dauerUeberDreiMonate(parseISO('2025-01-01'), parseISO('2025-04-01')), '(expect false)');
console.log('01.01->02.04 (3mo+1d):', dauerUeberDreiMonate(parseISO('2025-01-01'), parseISO('2025-04-02')), '(expect true)');
// month-end edge: 30.11 -> 28.02 (almost 3 months but feb short)
console.log('30.11->28.02:', dauerUeberDreiMonate(parseISO('2024-11-30'), parseISO('2025-02-28')), '(diffMonths?)');
console.log('31.12->31.03:', dauerUeberDreiMonate(parseISO('2024-12-31'), parseISO('2025-03-31')), '(exactly 3mo, expect false)');

// kuendigungsfrist month-end clamp
import { berechneKuendigungsfrist } from '../src/lib/kuendigungsfrist';
const k = berechneKuendigungsfrist({ vertragsbeginn:'2015-01-01', zugangKuendigung:'2025-01-31', kuendigendePartei:'arbeitgeber', probezeitMonate:0, kuendigungsterminMonatsende:true } as any);
console.log('zugang 31.01, 3mo (10DJ), monatsende:', k.beendigungsdatum?.toISOString().slice(0,10), '(addMonths(31.01,3)=30.04->eoM 30.04)');
const k2 = berechneKuendigungsfrist({ vertragsbeginn:'2024-06-01', zugangKuendigung:'2025-01-31', kuendigendePartei:'arbeitgeber', probezeitMonate:0, kuendigungsterminMonatsende:true } as any);
console.log('zugang 31.01, 1mo, monatsende:', k2.beendigungsdatum?.toISOString().slice(0,10), '(addMonths 28.02->eoM 28.02)');
