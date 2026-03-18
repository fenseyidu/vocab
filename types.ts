export interface WordPair {
  id: string;
  english: string;
  chinese: string;
  phonetic?: string;
}

export interface WordList {
  id: string;
  title: string;
  createdAt: number;
  words: WordPair[];
}

export enum ViewMode {
  INPUT = 'INPUT',
  PREVIEW = 'PREVIEW',
  LISTS = 'LISTS',
}