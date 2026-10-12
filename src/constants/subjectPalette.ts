import { colors } from './colors';

export interface SubjectAccent {
  background: string;
  foreground: string;
}

export const subjectPalette: SubjectAccent[] = [
  { background: colors.primaryLight, foreground: colors.primary },
  { background: '#F2EAFB', foreground: '#8A54C3' },
  { background: '#EAF3FB', foreground: '#3079A3' },
  { background: '#EDF7F2', foreground: '#268366' },
  { background: '#FCF3E4', foreground: '#A87021' },
  { background: '#FBF0F4', foreground: '#B34568' },
];
