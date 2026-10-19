export function isAdultDateOfBirth(value: string, today: Date = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date > today
  ) return false;
  const eighteenthBirthday = new Date(year + 18, month - 1, day);
  return eighteenthBirthday <= today;
}
