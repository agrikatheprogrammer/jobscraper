export default function formatDate(input?: string | null) {
  if (!input) return null;
  try {
    const d = new Date(input);
    const datePart = d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    const timePart = d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // set to true for AM/PM
    });
    return `${datePart} ${timePart}`; // just a space, no comma
  } catch {
    return input;
  }
}