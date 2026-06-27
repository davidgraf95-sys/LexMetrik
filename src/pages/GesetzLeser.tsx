import { useParams } from 'react-router-dom';
import { GesetzLeserInhalt } from './gesetz-leser/inhalt';

export function GesetzLeser() {
  const { ebene, key: keyRoh } = useParams<{ ebene: string; key: string }>();
  const schluessel = keyRoh ? decodeURIComponent(keyRoh) : '';
  return <GesetzLeserInhalt key={schluessel} ebene={ebene ?? ''} schluessel={schluessel} />;
}
