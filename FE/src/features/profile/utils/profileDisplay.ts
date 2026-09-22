import { getMultiLangText } from '@/lib/i18n';

export const translateProfileDisplayValue = (language: string | null | undefined, value?: string) => {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return value || '';

  const knownValues: Record<string, { vi: string; en: string; es: string }> = {
    'chưa cập nhật': { vi: 'Chưa cập nhật', en: 'Not updated', es: 'Sin actualizar' },
    'công nghệ thông tin': { vi: 'Công nghệ thông tin', en: 'Information technology', es: 'Tecnología de la información' },
    'khoa học máy tính': { vi: 'Khoa học máy tính', en: 'Computer science', es: 'Ciencias de la computación' },
    'kỹ thuật phần mềm': { vi: 'Kỹ thuật phần mềm', en: 'Software engineering', es: 'Ingeniería de software' },
    'hệ thống thông tin': { vi: 'Hệ thống thông tin', en: 'Information systems', es: 'Sistemas de información' },
    'an toàn thông tin': { vi: 'An toàn thông tin', en: 'Information security', es: 'Seguridad de la información' },
    'trí tuệ nhân tạo': { vi: 'Trí tuệ nhân tạo', en: 'Artificial intelligence', es: 'Inteligencia artificial' },
    'khoa học dữ liệu': { vi: 'Khoa học dữ liệu', en: 'Data science', es: 'Ciencia de datos' },
    'trường đại học công nghệ': { vi: 'Trường Đại học Công nghệ', en: 'University of Technology', es: 'Universidad de Tecnología' },
  };

  const translated = knownValues[normalized];
  return translated ? getMultiLangText(language, translated) : value || '';
};
