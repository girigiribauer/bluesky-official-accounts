const formatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "Asia/Tokyo",
});

export const formatDateTime = (isoString: string): string => {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "-";
  return formatter.format(d);
};
