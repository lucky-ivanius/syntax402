export const shortenString = (str: string, startLen = 6, endLen = 6) => {
  const pattern = new RegExp(`^(.{${startLen}}).*(.{${endLen}})$`);
  return str.replace(pattern, "$1...$2");
};
