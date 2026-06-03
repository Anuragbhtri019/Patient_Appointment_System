export const formatRating = (num) => {
  if (!num) return 'N/A';
  return `${num.toFixed(1)} ★`;
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (str, n) => {
  if (!str) return '';
  return str.length > n ? str.slice(0, n) + '...' : str;
};
