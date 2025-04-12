export type Filter = {
  type: string;
  defaultChecked: boolean;
}

export const hinatazakaFilters: Filter[] = [
  { type: '1期生', defaultChecked: true },
  { type: '2期生', defaultChecked: true },
  { type: '3期生', defaultChecked: true },
  { type: '4期生', defaultChecked: true },
  { type: '5期生', defaultChecked: true },
  { type: '卒業生', defaultChecked: false },
]

enum Generation {
  First = "1st",
  Second = "2nd",
  Third = "3rd",
  Fourth = "4th",
  Fifth = "5th",
  Graduated = "graduated",
}

export const GenerationMap: { [key: string]: Generation } = {
  "1期生": Generation.First,
  "2期生": Generation.Second,
  "3期生": Generation.Third,
  "4期生": Generation.Fourth,
  "5期生": Generation.Fifth,
  "卒業生": Generation.Graduated,
};
