import { skaliereSkalaDauer, letzterTagLohnfortzahlung } from '../src/lib/datumsUtils';
import { parseISO } from 'date-fns';
// 50% AUF -> double. 3 weeks -> 6 weeks
console.log('3wo @50%:', skaliereSkalaDauer({typ:'wochen', anzahl:3}, 50));
// 60% -> factor 1.6667. 3 months -> round(5)=5
console.log('3mo @60%:', skaliereSkalaDauer({typ:'monate', anzahl:3}, 60));
// edge 0% -> Infinity/NaN
console.log('3wo @0%:', skaliereSkalaDauer({typ:'wochen', anzahl:3}, 0));
// 33% -> 3wo*3.03 = round(9.09)=9
console.log('3wo @33%:', skaliereSkalaDauer({typ:'wochen', anzahl:3}, 33));
import { berechneLohnfortzahlung } from '../src/lib/lohnfortzahlung';
const r = berechneLohnfortzahlung({ vertragsbeginn:'2020-01-01', verhinderungBeginn:'2024-06-01', arbeitsunfaehigkeitProzent:0, kanton:'BE' } as any);
console.log('AUF 0%:', r.letzterTagISO, r.status);
