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
