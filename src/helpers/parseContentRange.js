export default function parseContentRange(contentRange) {
  if (contentRange === '*/0') {
    return { start: 0, end: 0, size: 0 };
  }

  const contentRangeParts = contentRange.split(/[-/]/);

  return {
    start: Number(contentRangeParts[0]),
    end: Number(contentRangeParts[1]),
    size: Number(contentRangeParts[2]),
  };
}
