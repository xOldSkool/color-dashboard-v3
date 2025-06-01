export default function dateToItalia(key: string, value: unknown) {
  const dateKeys = ['data', 'dataDDT', 'dataCreazione'];
  if (dateKeys.includes(key) && value) {
    const date = new Date(value as string);
    if (!isNaN(date.getTime())) {
      if (key === 'dataDDT') {
        return date.toLocaleDateString('it-IT', { timeZone: 'Europe/Rome' });
      }
      return date.toLocaleString('it-IT', { timeZone: 'Europe/Rome' }).replace(', ', ' - ');
    }
  }
  return value as React.ReactNode;
}
