export default function truncate(str, options = {}) {
  const separator = options.separator || '...';
  const keepLength = options.size || 18;

  if (str.length <= keepLength) return str;

  const sepLen = separator.length;
  const charsToShow = keepLength - sepLen;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);

  return str.substring(0, frontChars) + separator + str.substring(str.length - backChars);
}
