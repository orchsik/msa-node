export const lastCharFor = (str: string) => {
  return str.charAt(str.length - 1);
};

export const isLastIdx = (idx: number, lastIdx: number) => {
  return idx === lastIdx;
};
