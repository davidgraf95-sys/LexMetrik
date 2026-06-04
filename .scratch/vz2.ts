import { berechneVerzugszins } from '../src/lib/verzugszins';
// partial payment less than accrued interest
const r = berechneVerzugszins({ kapital:10000, verzugsbeginn:'2024-01-01', stichtag:'2025-01-01', methode:'act365',
  ereignisse:[{typ:'teilzahlung', datum:'2024-07-01', betrag:100}] } as any);
console.log('teilzahlung<zins: zinsTotal', r.zinsTotal, 'zinsGetilgt', r.zinsGetilgt, 'kapitalOffen', r.kapitalOffen, 'zinsOffen', r.zinsOffen);
// teilzahlung exceeds total debt
const r2 = berechneVerzugszins({ kapital:1000, verzugsbeginn:'2024-01-01', stichtag:'2025-01-01', methode:'act365',
  ereignisse:[{typ:'teilzahlung', datum:'2024-07-01', betrag:5000}] } as any);
console.log('overpay: kapitalOffen', r2.kapitalOffen, 'warnungen?', r2.warnungen.some(w=>w.includes('übersteigt')));
// satzänderung
const r3 = berechneVerzugszins({ kapital:100000, verzugsbeginn:'2024-01-01', stichtag:'2025-01-01', methode:'act365',
  ereignisse:[{typ:'satzaenderung', datum:'2024-07-01', satz:10}] } as any);
console.log('satzänderung: zinsTotal', r3.zinsTotal, 'segmente', r3.segmente.length);
// zero kapital
const r4 = berechneVerzugszins({ kapital:0, verzugsbeginn:'2024-01-01', stichtag:'2025-01-01' } as any);
console.log('zero kapital status:', r4.status);
// inverse interval
const r5 = berechneVerzugszins({ kapital:1000, verzugsbeginn:'2025-01-01', stichtag:'2024-01-01' } as any);
console.log('inverse status:', r5.status);
// sum of segment days == tageTotal
const sum = r3.segmente.reduce((s,seg)=>s+seg.tage,0);
console.log('segment days sum', sum, 'tageTotal', r3.tageTotal);
