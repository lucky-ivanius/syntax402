export const shortenString = (str: string, startLen = 6, endLen = 6) => {
  if (str.length <= startLen + endLen + 3) return str;

  const pattern = new RegExp(`^(.{${startLen}}).*(.{${endLen}})$`);
  return str.replace(pattern, "$1...$2");
};
