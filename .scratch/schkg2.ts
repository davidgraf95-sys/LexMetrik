import { berechneSchkgFrist } from '../src/lib/schkgFristen';
// Monatsfrist ending in sommer ferien (15-31.07). ereignis 20.06, 1 month -> 20.07 (in ferien) -> 3WT after 31.07
const r = berechneSchkgFrist({ ereignis:'2025-06-20', einheit:'monate', laenge:1, kanton:'ZH', modus:'schkg_betreibungsferien', fristnatur:'ordnungsfrist' } as any);
console.log('Monatsfrist ende in ferien:', r.diesAQuo, '->', r.diesAdQuem);
// zpo_stillstand monatsfrist crossing gerichtsferien -> ruhen verlängerung
const r2 = berechneSchkgFrist({ ereignis:'2025-06-20', einheit:'monate', laenge:1, kanton:'ZH', modus:'zpo_stillstand', fristnatur:'klagefrist' } as any);
console.log('ZPO-stillstand monat (ruhen sommer 15.7-15.8):', r2.diesAQuo, '->', r2.diesAdQuem);
// Hemmung Art 88/166: verwirkungsfrist 10 days, hemmung 5 days mid-frist
const r3 = berechneSchkgFrist({ ereignis:'2025-03-01', einheit:'tage', laenge:10, kanton:'ZH', modus:'kein', fristnatur:'verwirkung', hemmungVon:'2025-03-05', hemmungBis:'2025-03-09' } as any);
console.log('Hemmung 5d in 10d frist:', r3.diesAdQuem, '(naiv 11.03 +5 = 16.03)');
