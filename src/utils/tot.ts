import type { TotData } from '../types';

let tot: TotData | null = null;

export const getTot = async (): Promise<TotData | null> => {
  const storedTot = localStorage.getItem('evaluationTot');
  if (storedTot) {
    try {
      tot = JSON.parse(storedTot) as TotData;
    } catch {
      tot = null;
    }
  }
  return tot;
};

export const setTot = (value: TotData): void => {
  tot = value;
  localStorage.setItem('evaluationTot', JSON.stringify(value));
};
