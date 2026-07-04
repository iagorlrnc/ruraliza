export interface InternalNote {
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export const parseNotes = (observacaoInterna: string | null | undefined): InternalNote[] => {
  if (!observacaoInterna) return [];
  try {
    const parsed = JSON.parse(observacaoInterna);
    if (Array.isArray(parsed)) {
      return parsed as InternalNote[];
    }
  } catch (e) {
    const text = observacaoInterna.trim();
    if (text) {
      const colonIndex = text.indexOf(': ');
      if (colonIndex > 0 && colonIndex < 30) {
        const name = text.slice(0, colonIndex);
        const actualText = text.slice(colonIndex + 2);
        return [{
          userId: '',
          userName: name,
          text: actualText,
          createdAt: new Date().toISOString()
        }];
      }
      return [{
        userId: '',
        userName: 'Administração',
        text: text,
        createdAt: new Date().toISOString()
      }];
    }
  }
  return [];
};
