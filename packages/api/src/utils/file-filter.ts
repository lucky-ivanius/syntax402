export const checkFile = (filename: string, ignoreList: RegExp[]): boolean => {
  return !ignoreList.some((pattern) => pattern.test(filename));
};
