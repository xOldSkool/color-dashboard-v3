export function getLogoByFornitore(fornitore: string): string {
  const map: Record<string, string> = {
    cfp: '/cfp.png',
    'cfp+sw': '/cfp+sw.png',
    cfptext: '/cfptext.png',
    huber: '/huber.svg',
    'j+s': '/j+s.png',
    // aggiungi altri fornitori se necessario
  };
  // Normalizza il nome per evitare problemi di maiuscole/minuscole
  return map[fornitore.toLowerCase()] || '';
}
