import {
  Camera,
  FileText,
  Image as ImageIcon,
  LucideIcon,
  Type,
} from 'lucide-react-native';
import {MaterialSourceType} from '../domain/models/Material';

export interface MaterialPresentation {
  label: string;
  foreground: string;
  background: string;
  border: string;
  icon: LucideIcon;
}

export const materialPresentation: Record<MaterialSourceType, MaterialPresentation> = {
  text: {
    label: 'Text',
    foreground: '#4F46E5',
    background: '#EEF2FF',
    border: '#C7D2FE',
    icon: Type,
  },
  pdf: {
    label: 'PDF',
    foreground: '#E11D48',
    background: '#FFF1F2',
    border: '#FECDD3',
    icon: FileText,
  },
  image: {
    label: 'Image',
    foreground: '#0284C7',
    background: '#E0F2FE',
    border: '#BAE6FD',
    icon: ImageIcon,
  },
  camera: {
    label: 'Camera',
    foreground: '#16A34A',
    background: '#F0FDF4',
    border: '#BBF7D0',
    icon: Camera,
  },
};
