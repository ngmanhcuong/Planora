import { getMultiLangText, type AppLanguage } from '@/lib/i18n';

type LocaleMap = Record<AppLanguage, string>;

const L = (
  vi: string,
  en: string,
  ja: string,
  ko: string,
  zh: string,
  fr: string,
  de: string,
  es: string
): LocaleMap => ({ vi, en, ja, ko, zh, fr, de, es });

const knownValues: Record<string, LocaleMap> = {
  'chưa cập nhật': L(
    'Chưa cập nhật',
    'Not updated',
    '未更新',
    '미업데이트',
    '未更新',
    'Non renseigné',
    'Nicht aktualisiert',
    'Sin actualizar'
  ),
  'công nghệ thông tin': L(
    'Công nghệ thông tin',
    'Information technology',
    '情報技術',
    '정보기술',
    '信息技术',
    'Technologies de l’information',
    'Informationstechnologie',
    'Tecnología de la información'
  ),
  'khoa học máy tính': L(
    'Khoa học máy tính',
    'Computer science',
    'コンピュータ科学',
    '컴퓨터 과학',
    '计算机科学',
    'Informatique',
    'Informatik',
    'Ciencias de la computación'
  ),
  'kỹ thuật phần mềm': L(
    'Kỹ thuật phần mềm',
    'Software engineering',
    'ソフトウェア工学',
    '소프트웨어 공학',
    '软件工程',
    'Génie logiciel',
    'Softwaretechnik',
    'Ingeniería de software'
  ),
  'hệ thống thông tin': L(
    'Hệ thống thông tin',
    'Information systems',
    '情報システム',
    '정보 시스템',
    '信息系统',
    'Systèmes d’information',
    'Informationssysteme',
    'Sistemas de información'
  ),
  'an toàn thông tin': L(
    'An toàn thông tin',
    'Information security',
    '情報セキュリティ',
    '정보보안',
    '信息安全',
    'Sécurité de l’information',
    'Informationssicherheit',
    'Seguridad de la información'
  ),
  'trí tuệ nhân tạo': L(
    'Trí tuệ nhân tạo',
    'Artificial intelligence',
    '人工知能',
    '인공지능',
    '人工智能',
    'Intelligence artificielle',
    'Künstliche Intelligenz',
    'Inteligencia artificial'
  ),
  'khoa học dữ liệu': L(
    'Khoa học dữ liệu',
    'Data science',
    'データサイエンス',
    '데이터 과학',
    '数据科学',
    'Science des données',
    'Datenwissenschaft',
    'Ciencia de datos'
  ),
  'trường đại học công nghệ': L(
    'Trường Đại học Công nghệ',
    'University of Technology',
    '工科大学',
    '공과대학',
    '科技大学',
    'Université de technologie',
    'Technische Universität',
    'Universidad de Tecnología'
  ),
};

export const translateProfileDisplayValue = (language: string | null | undefined, value?: string) => {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return value || '';

  const translated = knownValues[normalized];
  if (!translated) return value || '';

  return getMultiLangText(language, {
    vi: translated.vi,
    en: translated.en,
    ja: translated.ja,
    ko: translated.ko,
    zh: translated.zh,
    fr: translated.fr,
    de: translated.de,
    es: translated.es,
  });
};
