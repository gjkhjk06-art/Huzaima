
export enum Resolution {
  ONE_K = '1K',
  TWO_K = '2K',
  FOUR_K = '4K'
}

export enum AspectRatio {
  SQUARE = '1:1',
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
  PHOTO = '4:3',
  TALL = '3:4'
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  resolution: Resolution;
}

export interface AppState {
  hasApiKey: boolean;
  isLoading: boolean;
  error: string | null;
  history: GeneratedImage[];
  promptHistory: string[];
  selectedImage: string | null;
  currentResolution: Resolution;
  currentAspectRatio: AspectRatio;
}
