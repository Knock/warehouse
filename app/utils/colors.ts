/**
 * Generates a consistent color based on a string input
 * @param str The input string to generate a color from
 * @returns A HSL color string
 */
const getColorFromString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

export default getColorFromString; 