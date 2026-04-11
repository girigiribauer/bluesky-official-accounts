export const mergeTextFilter = (existing: string, input: string): string => {
  const words = new Set(
    [...existing.split(" "), ...input.split(" ")].filter((a) => a !== "")
  );
  return Array.from(words).join(" ");
};
