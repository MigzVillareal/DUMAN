export function isToday(dateString) {
  if (!dateString) return false;

  const today = new Date();
  const date = new Date(`${dateString}T00:00:00`);

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}
