export const formatFileSize = (bytes?: number): string => {
  if (bytes === undefined) {
    return 'Unknown size';
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const cleanFileTitle = (fileName: string): string =>
  fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .trim();

export const createCameraMaterialTitle = (): string => {
  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  return `Camera material ${date} ${time}`;
};
