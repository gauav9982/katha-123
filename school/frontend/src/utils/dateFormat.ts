// Convert DD-MM-YYYY to YYYY-MM-DD
export function ddmmyyyyToYyyymmdd(dateStr: string): string {
  if (!dateStr || dateStr.length !== 10) return dateStr;
  const [dd, mm, yyyy] = dateStr.split('-');
  return `${yyyy}-${mm}-${dd}`;
} 