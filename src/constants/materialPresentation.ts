import {
  Camera,
  FileText,
  Image as ImageIcon,
  LucideIcon,
  Type,
} from 'lucide-react-native';
import { MaterialSourceType } from '../domain/models/Material';
import { colors } from './colors';

export interface MaterialPresentation {
  label: string;
  foreground: string;
  background: string;
  border: string;
  icon: LucideIcon;
}

export const materialPresentation: Record<
  MaterialSourceType,
  MaterialPresentation
> = {
  text: {
    label: 'Text',
    foreground: colors.primary,
    background: colors.primaryLight,
    border: '#D9D2FF',
    icon: Type,
  },
  pdf: {
    label: 'PDF',
    foreground: '#B34568',
    background: '#FBF0F4',
    border: '#F0D6E0',
    icon: FileText,
  },
  image: {
    label: 'Image',
    foreground: '#3079A3',
    background: '#EAF3FB',
    border: '#D0E6F3',
    icon: ImageIcon,
  },
  camera: {
    label: 'Camera',
    foreground: '#268366',
    background: '#EDF7F2',
    border: '#D4EDE1',
    icon: Camera,
  },
};
