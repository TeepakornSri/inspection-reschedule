export function checkNeedManager(
  criticality: string,
  originalDueDate: Date,
  newDueDate: Date,
  approvedCount: number,
): boolean {
  if (criticality !== 'A') return false;

  const maxDate = new Date(originalDueDate);
  maxDate.setUTCDate(maxDate.getUTCDate() + 30);

  if (newDueDate > maxDate) return true;
  if (approvedCount >= 1) return true;

  return false;
}
