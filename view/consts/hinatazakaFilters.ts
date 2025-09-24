export type Filter = {
  type: string;
  defaultChecked: boolean;
};

export const hinatazakaFilters: Filter[] = [
  { type: "1期生", defaultChecked: true },
  { type: "2期生", defaultChecked: true },
  { type: "3期生", defaultChecked: true },
  { type: "4期生", defaultChecked: true },
  { type: "5期生", defaultChecked: true },
  { type: "卒業生", defaultChecked: false },
];

// Generation.ts
export type Generation = "1st" | "2nd" | "3rd" | "4th" | "5th" | "graduated";

export const GenerationMap: { [key: string]: Generation } = {
  "1期生": "1st",
  "2期生": "2nd",
  "3期生": "3rd",
  "4期生": "4th",
  "5期生": "5th",
  卒業生: "graduated",
};
