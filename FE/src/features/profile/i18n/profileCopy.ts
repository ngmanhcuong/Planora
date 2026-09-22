import { normalizeLanguage, type AppLanguage } from '@/lib/i18n';

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

const pick = (map: LocaleMap, language: AppLanguage) => map[language];

export const getProfileCopy = (language: string | null | undefined) => {
  const lang = normalizeLanguage(language);

  return {
    notUpdated: pick(L(
      'Chưa cập nhật',
      'Not updated',
      '未更新',
      '미업데이트',
      '未更新',
      'Non renseigné',
      'Nicht aktualisiert',
      'Sin actualizar'
    ), lang),
    user: pick(L(
      'Người dùng Planora',
      'Planora user',
      'Planoraユーザー',
      'Planora 사용자',
      'Planora 用户',
      'Utilisateur Planora',
      'Planora-Nutzer',
      'Usuario de Planora'
    ), lang),
    university: pick(L(
      'Trường Đại học Công nghệ',
      'University of Technology',
      '工科大学',
      '공과대학',
      '科技大学',
      'Université de technologie',
      'Technische Universität',
      'Universidad de Tecnología'
    ), lang),
    defaultBio: pick(L(
      'Học hết sức, chơi hết mình! Đang cố gắng nâng cao GPA kỳ này.',
      'Studying hard and enjoying the journey. Working to improve my GPA this term.',
      '全力で学び、楽しみながら今学期のGPA向上に取り組んでいます。',
      '열심히 공부하고 즐기며 이번 학기 GPA를 높이기 위해 노력 중입니다.',
      '全力以赴学习，也在努力提升本学期的 GPA。',
      'J’étudie avec sérieux tout en profitant du parcours. J’essaie d’améliorer ma moyenne ce semestre.',
      'Ich lerne fleißig und genieße den Weg. Dieses Semester arbeite ich an einer besseren GPA.',
      'Estudio con esfuerzo y disfruto el camino. Intento mejorar mi GPA este periodo.'
    ), lang),
    loading: pick(L(
      'Đang tải thông tin hồ sơ...',
      'Loading profile information...',
      'プロフィールを読み込み中...',
      '프로필 정보를 불러오는 중...',
      '正在加载个人资料...',
      'Chargement du profil...',
      'Profil wird geladen...',
      'Cargando información del perfil...'
    ), lang),
    loadError: pick(L(
      'Đã xảy ra lỗi khi tải hồ sơ cá nhân. Vui lòng thử lại sau.',
      'Could not load your profile. Please try again later.',
      'プロフィールを読み込めませんでした。後でもう一度お試しください。',
      '프로필을 불러올 수 없습니다. 나중에 다시 시도해 주세요.',
      '无法加载个人资料，请稍后重试。',
      'Impossible de charger votre profil. Réessayez plus tard.',
      'Profil konnte nicht geladen werden. Bitte später erneut versuchen.',
      'No se pudo cargar el perfil. Inténtalo de nuevo más tarde.'
    ), lang),
    excellentStudent: pick(L(
      'Sinh viên Ưu tú',
      'Excellent student',
      '優秀な学生',
      '우수 학생',
      '优秀学生',
      'Étudiant excellent',
      'Hervorragender Student',
      'Estudiante destacado'
    ), lang),
    changeAvatar: pick(L(
      'Đổi ảnh đại diện',
      'Change avatar',
      'アバターを変更',
      '아바타 변경',
      '更换头像',
      'Changer l’avatar',
      'Avatar ändern',
      'Cambiar avatar'
    ), lang),
    changeCover: pick(L(
      'Đổi ảnh nền hồ sơ',
      'Change profile background',
      'プロフィール背景を変更',
      '프로필 배경 변경',
      '更换资料背景',
      'Changer l’arrière-plan du profil',
      'Profilhintergrund ändern',
      'Cambiar fondo del perfil'
    ), lang),
    savingCover: pick(L(
      'Đang lưu ảnh nền...',
      'Saving background...',
      '背景を保存中...',
      '배경 저장 중...',
      '正在保存背景...',
      'Enregistrement de l’arrière-plan...',
      'Hintergrund wird gespeichert...',
      'Guardando fondo...'
    ), lang),
    coverSaveError: pick(L(
      'Không thể lưu ảnh nền. Hãy chọn ảnh hợp lệ (tối đa 5 MB) và thử lại.',
      'Could not save the background. Choose a valid image up to 5 MB and try again.',
      '背景を保存できませんでした。5 MB以下の有効な画像を選んで再試行してください。',
      '배경을 저장할 수 없습니다. 5MB 이하의 유효한 이미지를 선택해 다시 시도하세요.',
      '无法保存背景。请选择不超过 5 MB 的有效图片后重试。',
      'Impossible d’enregistrer l’arrière-plan. Choisissez une image valide (max. 5 Mo).',
      'Hintergrund konnte nicht gespeichert werden. Wähle ein gültiges Bild bis 5 MB.',
      'No se pudo guardar el fondo. Elige una imagen válida de hasta 5 MB e inténtalo de nuevo.'
    ), lang),
    studying: pick(L(
      'Đang học',
      'Studying',
      '在学中',
      '재학 중',
      '在读',
      'En études',
      'Im Studium',
      'Estudiando'
    ), lang),
    studentId: pick(L(
      'MSSV',
      'Student ID',
      '学籍番号',
      '학번',
      '学号',
      'N° étudiant',
      'Matrikelnr.',
      'ID de estudiante'
    ), lang),
    major: pick(L(
      'Ngành học',
      'Major',
      '専攻',
      '전공',
      '专业',
      'Filière',
      'Studienfach',
      'Carrera'
    ), lang),
    joined: pick(L(
      'Tham gia',
      'Joined',
      '参加日',
      '가입일',
      '加入日期',
      'Inscription',
      'Beigetreten',
      'Ingreso'
    ), lang),
    savingAvatar: pick(L(
      'Đang lưu ảnh đại diện...',
      'Saving avatar...',
      'アバターを保存中...',
      '아바타 저장 중...',
      '正在保存头像...',
      'Enregistrement de l’avatar...',
      'Avatar wird gespeichert...',
      'Guardando avatar...'
    ), lang),
    avatarSaveError: pick(L(
      'Không thể lưu ảnh. Hãy chọn ảnh hợp lệ (tối đa 5 MB) và thử lại.',
      'Could not save the image. Choose a valid image up to 5 MB and try again.',
      '画像を保存できませんでした。5 MB以下の有効な画像を選んで再試行してください。',
      '이미지를 저장할 수 없습니다. 5MB 이하의 유효한 이미지를 선택해 다시 시도하세요.',
      '无法保存图片。请选择不超过 5 MB 的有效图片后重试。',
      'Impossible d’enregistrer l’image. Choisissez une image valide (max. 5 Mo).',
      'Bild konnte nicht gespeichert werden. Wähle ein gültiges Bild bis 5 MB.',
      'No se pudo guardar la imagen. Elige una imagen válida de hasta 5 MB e inténtalo de nuevo.'
    ), lang),
    academicSummaryTitle: pick(L(
      'Tóm tắt học tập',
      'Academic summary',
      '学業サマリー',
      '학업 요약',
      '学业概览',
      'Résumé académique',
      'Studienübersicht',
      'Resumen académico'
    ), lang),
    academicSummarySubtitle: pick(L(
      'Theo dõi GPA, tín chỉ và nhịp học hiện tại.',
      'Track GPA, credits, and your current study rhythm.',
      'GPA、単位、現在の学習リズムを確認できます。',
      'GPA, 학점, 현재 학습 리듬을 확인하세요.',
      '跟踪 GPA、学分和当前学习节奏。',
      'Suivez la moyenne, les crédits et votre rythme d’étude.',
      'Verfolge GPA, Credits und deinen Lernrhythmus.',
      'Sigue tu GPA, créditos y ritmo académico actual.'
    ), lang),
    averageGrade: pick(L(
      'Điểm trung bình',
      'Average grade',
      '平均成績',
      '평균 성적',
      '平均成绩',
      'Moyenne',
      'Durchschnittsnote',
      'Promedio'
    ), lang),
    completedCredits: pick(L(
      'Tín chỉ tích lũy',
      'Completed credits',
      '修得単位',
      '이수 학점',
      '已修学分',
      'Crédits obtenus',
      'Erreichte Credits',
      'Créditos acumulados'
    ), lang),
    habitStreak: pick(L(
      'Chuỗi thói quen',
      'Habit streak',
      '習慣ストリーク',
      '습관 연속',
      '习惯连续天数',
      'Série d’habitudes',
      'Gewohnheitsserie',
      'Racha de hábitos'
    ), lang),
    equivalent: pick(L(
      'Tương đương',
      'Equivalent to',
      '換算',
      '환산',
      '相当于',
      'Équivalent à',
      'Entspricht',
      'Equivale a'
    ), lang),
    scale10: pick(L(
      'hệ 10',
      'on 10-point scale',
      '10点満点',
      '10점 만점',
      '十分制',
      'sur 10',
      'Skala 10',
      'en escala de 10'
    ), lang),
    program: pick(L(
      'chương trình',
      'program',
      'プログラム',
      '프로그램',
      '课程',
      'du programme',
      'des Programms',
      'del programa'
    ), lang),
    days: pick(L(
      'ngày',
      'days',
      '日',
      '일',
      '天',
      'jours',
      'Tage',
      'días'
    ), lang),
    habitHelper: pick(L(
      'Hoàn thành mục tiêu liên tục',
      'Complete goals consistently',
      '目標を継続的に達成',
      '목표를 꾸준히 달성',
      '持续完成目标',
      'Atteindre les objectifs régulièrement',
      'Ziele konsequent erreichen',
      'Objetivos completados de forma continua'
    ), lang),
    rankingExcellent: pick(L(
      'Xếp loại: Xuất sắc',
      'Ranking: Excellent',
      '評価：優秀',
      '등급: 우수',
      '评级：优秀',
      'Classement : Excellent',
      'Einstufung: Hervorragend',
      'Clasificación: Excelente'
    ), lang),
    personalInfoTitle: pick(L(
      'Thông tin cá nhân',
      'Personal information',
      '個人情報',
      '개인 정보',
      '个人信息',
      'Informations personnelles',
      'Persönliche Informationen',
      'Información personal'
    ), lang),
    personalInfoSubtitle: pick(L(
      'Xem và cập nhật thông tin hồ sơ hiển thị trên Planora.',
      'View and update the profile information shown on Planora.',
      'Planoraに表示するプロフィール情報を確認・更新します。',
      'Planora에 표시되는 프로필 정보를 확인하고 수정합니다.',
      '查看并更新在 Planora 上显示的个人资料。',
      'Consultez et mettez à jour les informations affichées sur Planora.',
      'Profilinformationen in Planora ansehen und aktualisieren.',
      'Consulta y actualiza la información del perfil que se muestra en Planora.'
    ), lang),
    saved: pick(L(
      'Đã lưu',
      'Saved',
      '保存しました',
      '저장됨',
      '已保存',
      'Enregistré',
      'Gespeichert',
      'Guardado'
    ), lang),
    cancel: pick(L(
      'Hủy',
      'Cancel',
      'キャンセル',
      '취소',
      '取消',
      'Annuler',
      'Abbrechen',
      'Cancelar'
    ), lang),
    saveChanges: pick(L(
      'Lưu thay đổi',
      'Save changes',
      '変更を保存',
      '변경 저장',
      '保存更改',
      'Enregistrer',
      'Änderungen speichern',
      'Guardar cambios'
    ), lang),
    edit: pick(L(
      'Chỉnh sửa',
      'Edit',
      '編集',
      '편집',
      '编辑',
      'Modifier',
      'Bearbeiten',
      'Editar'
    ), lang),
    contactInfo: pick(L(
      'Thông tin liên hệ',
      'Contact information',
      '連絡先',
      '연락처',
      '联系信息',
      'Coordonnées',
      'Kontaktinformationen',
      'Información de contacto'
    ), lang),
    academicInfo: pick(L(
      'Thông tin học tập',
      'Academic information',
      '学業情報',
      '학업 정보',
      '学业信息',
      'Informations académiques',
      'Studieninformationen',
      'Información académica'
    ), lang),
    fullName: pick(L(
      'Họ và tên',
      'Full name',
      '氏名',
      '이름',
      '姓名',
      'Nom complet',
      'Vollständiger Name',
      'Nombre completo'
    ), lang),
    email: pick(L(
      'Email',
      'Email',
      'メール',
      '이메일',
      '邮箱',
      'E-mail',
      'E-Mail',
      'Email'
    ), lang),
    universityLabel: pick(L(
      'Trường Đại học',
      'University',
      '大学',
      '대학',
      '大学',
      'Université',
      'Universität',
      'Universidad'
    ), lang),
    totalCredits: pick(L(
      'Tổng tín chỉ',
      'Total credits',
      '総単位',
      '총 학점',
      '总学分',
      'Total des crédits',
      'Gesamtcredits',
      'Créditos totales'
    ), lang),
    aboutMe: pick(L(
      'Giới thiệu bản thân',
      'About me',
      '自己紹介',
      '자기소개',
      '关于我',
      'À propos de moi',
      'Über mich',
      'Presentación personal'
    ), lang),
    bioField: pick(L(
      'Giới thiệu',
      'Bio',
      '自己紹介',
      '소개',
      '简介',
      'Bio',
      'Bio',
      'Bio'
    ), lang),
    fullNamePlaceholder: pick(L(
      'Nhập họ và tên...',
      'Enter your full name...',
      '氏名を入力...',
      '이름을 입력하세요...',
      '输入姓名...',
      'Saisissez votre nom...',
      'Name eingeben...',
      'Introduce tu nombre completo...'
    ), lang),
    majorPlaceholder: pick(L(
      'Nhập ngành học của bạn...',
      'Enter your major...',
      '専攻を入力...',
      '전공을 입력하세요...',
      '输入专业...',
      'Saisissez votre filière...',
      'Studienfach eingeben...',
      'Introduce tu carrera...'
    ), lang),
    universityPlaceholder: pick(L(
      'Nhập tên trường của bạn...',
      'Enter your university...',
      '大学名を入力...',
      '대학명을 입력하세요...',
      '输入学校名称...',
      'Saisissez votre université...',
      'Universität eingeben...',
      'Introduce el nombre de tu universidad...'
    ), lang),
    bioPlaceholder: pick(L(
      'Mô tả ngắn về sở thích, định hướng học tập...',
      'Write a short note about your interests or study goals...',
      '興味や学習目標を短く書いてください...',
      '관심사나 학습 목표를 간단히 작성하세요...',
      '简要描述兴趣或学习目标...',
      'Décrivez brièvement vos intérêts ou objectifs d’étude...',
      'Kurz zu Interessen oder Lernzielen schreiben...',
      'Describe brevemente tus intereses u objetivos académicos...'
    ), lang),
    bioTip: pick(L(
      'Mẹo: phần giới thiệu nên ngắn gọn, nêu mục tiêu học tập hoặc phong cách làm việc của bạn.',
      'Tip: keep the introduction short and mention your study goals or working style.',
      'ヒント：短く、学習目標や作業スタイルを書くと良いです。',
      '팁: 소개는 짧게, 학습 목표나 작업 스타일을 적어 보세요.',
      '提示：简介宜短，可写学习目标或工作方式。',
      'Conseil : restez bref et mentionnez vos objectifs ou votre façon de travailler.',
      'Tipp: Kurz halten und Lernziele oder Arbeitsstil erwähnen.',
      'Consejo: mantén la presentación breve y menciona tus objetivos académicos o estilo de trabajo.'
    ), lang),
    selectSearch: pick(L(
      'Tìm trong danh sách...',
      'Search the list...',
      'リストを検索...',
      '목록에서 검색...',
      '在列表中搜索...',
      'Rechercher dans la liste...',
      'Liste durchsuchen...',
      'Buscar en la lista...'
    ), lang),
    selectNoResult: pick(L(
      'Không có trong danh sách.',
      'No matching option.',
      'リストにありません。',
      '목록에 없습니다.',
      '列表中无匹配项。',
      'Aucune option correspondante.',
      'Keine passende Option.',
      'No está en la lista.'
    ), lang),
    selectCustom: pick(L(
      'Thêm tùy chỉnh',
      'Add custom value',
      'カスタムを追加',
      '사용자 지정 추가',
      '添加自定义',
      'Ajouter une valeur',
      'Eigener Wert',
      'Agregar personalizado'
    ), lang),
    selectChooseFromList: pick(L(
      'Chọn từ danh sách',
      'Choose from list',
      'リストから選択',
      '목록에서 선택',
      '从列表选择',
      'Choisir dans la liste',
      'Aus Liste wählen',
      'Elegir de la lista'
    ), lang),
    validationCheck: pick(L(
      'Vui lòng kiểm tra lại thông tin vừa nhập.',
      'Please check the information you entered.',
      '入力内容を確認してください。',
      '입력한 정보를 확인해 주세요.',
      '请检查您输入的信息。',
      'Vérifiez les informations saisies.',
      'Bitte prüfe deine Eingaben.',
      'Revisa la información introducida.'
    ), lang),
    gpaLabel: 'GPA',
    validationMessages: {
      nameMin: pick(L(
        'Họ và tên phải có ít nhất 2 ký tự',
        'Full name must be at least 2 characters',
        '氏名は2文字以上必要です',
        '이름은 2자 이상이어야 합니다',
        '姓名至少需要 2 个字符',
        'Le nom doit contenir au moins 2 caractères',
        'Der Name muss mindestens 2 Zeichen haben',
        'El nombre debe tener al menos 2 caracteres'
      ), lang),
      nameMax: pick(L(
        'Họ và tên tối đa 50 ký tự',
        'Full name must be at most 50 characters',
        '氏名は50文字以内です',
        '이름은 50자 이하여야 합니다',
        '姓名最多 50 个字符',
        'Le nom ne peut pas dépasser 50 caractères',
        'Der Name darf höchstens 50 Zeichen haben',
        'El nombre debe tener como máximo 50 caracteres'
      ), lang),
      email: pick(L(
        'Địa chỉ email không hợp lệ',
        'Invalid email address',
        'メールアドレスが無効です',
        '유효하지 않은 이메일입니다',
        '邮箱地址无效',
        'Adresse e-mail invalide',
        'Ungültige E-Mail-Adresse',
        'Dirección de email no válida'
      ), lang),
      gpaNumber: pick(L(
        'GPA phải là một số',
        'GPA must be a number',
        'GPAは数値である必要があります',
        'GPA는 숫자여야 합니다',
        'GPA 必须是数字',
        'La moyenne doit être un nombre',
        'GPA muss eine Zahl sein',
        'El GPA debe ser un número'
      ), lang),
      gpaMin: pick(L(
        'GPA không được nhỏ hơn 0',
        'GPA cannot be less than 0',
        'GPAは0未満にできません',
        'GPA는 0보다 작을 수 없습니다',
        'GPA 不能小于 0',
        'La moyenne ne peut pas être inférieure à 0',
        'GPA darf nicht kleiner als 0 sein',
        'El GPA no puede ser menor que 0'
      ), lang),
      gpaMax: pick(L(
        'GPA không được lớn hơn 4.0',
        'GPA cannot be greater than 4.0',
        'GPAは4.0を超えられません',
        'GPA는 4.0을 초과할 수 없습니다',
        'GPA 不能大于 4.0',
        'La moyenne ne peut pas dépasser 4.0',
        'GPA darf nicht größer als 4.0 sein',
        'El GPA no puede ser mayor que 4.0'
      ), lang),
      completedNumber: pick(L(
        'Tín chỉ tích lũy phải là số',
        'Completed credits must be a number',
        '修得単位は数値である必要があります',
        '이수 학점은 숫자여야 합니다',
        '已修学分必须是数字',
        'Les crédits obtenus doivent être un nombre',
        'Credits müssen eine Zahl sein',
        'Los créditos acumulados deben ser un número'
      ), lang),
      completedInt: pick(L(
        'Tín chỉ tích lũy phải là số nguyên',
        'Completed credits must be a whole number',
        '修得単位は整数である必要があります',
        '이수 학점은 정수여야 합니다',
        '已修学分必须是整数',
        'Les crédits obtenus doivent être un entier',
        'Credits müssen eine ganze Zahl sein',
        'Los créditos acumulados deben ser enteros'
      ), lang),
      completedMin: pick(L(
        'Tín chỉ tích lũy không được nhỏ hơn 0',
        'Completed credits cannot be less than 0',
        '修得単位は0未満にできません',
        '이수 학점은 0보다 작을 수 없습니다',
        '已修学分不能小于 0',
        'Les crédits obtenus ne peuvent pas être négatifs',
        'Credits dürfen nicht kleiner als 0 sein',
        'Los créditos acumulados no pueden ser menores que 0'
      ), lang),
      totalNumber: pick(L(
        'Tổng tín chỉ phải là số',
        'Total credits must be a number',
        '総単位は数値である必要があります',
        '총 학점은 숫자여야 합니다',
        '总学分必须是数字',
        'Le total des crédits doit être un nombre',
        'Gesamtcredits müssen eine Zahl sein',
        'Los créditos totales deben ser un número'
      ), lang),
      totalInt: pick(L(
        'Tổng tín chỉ phải là số nguyên',
        'Total credits must be a whole number',
        '総単位は整数である必要があります',
        '총 학점은 정수여야 합니다',
        '总学分必须是整数',
        'Le total des crédits doit être un entier',
        'Gesamtcredits müssen eine ganze Zahl sein',
        'Los créditos totales deben ser enteros'
      ), lang),
      totalMin: pick(L(
        'Tổng tín chỉ phải lớn hơn 0',
        'Total credits must be greater than 0',
        '総単位は0より大きい必要があります',
        '총 학점은 0보다 커야 합니다',
        '总学分必须大于 0',
        'Le total des crédits doit être supérieur à 0',
        'Gesamtcredits müssen größer als 0 sein',
        'Los créditos totales deben ser mayores que 0'
      ), lang),
      bioMax: pick(L(
        'Tự giới thiệu tối đa 200 ký tự',
        'Bio must be at most 200 characters',
        '自己紹介は200文字以内です',
        '소개는 200자 이하여야 합니다',
        '简介最多 200 个字符',
        'La bio ne peut pas dépasser 200 caractères',
        'Bio darf höchstens 200 Zeichen haben',
        'La presentación debe tener como máximo 200 caracteres'
      ), lang),
      creditsExceed: pick(L(
        'Tín chỉ tích lũy không được vượt quá tổng tín chỉ',
        'Completed credits cannot exceed total credits',
        '修得単位は総単位を超えられません',
        '이수 학점은 총 학점을 초과할 수 없습니다',
        '已修学分不能超过总学分',
        'Les crédits obtenus ne peuvent pas dépasser le total',
        'Credits dürfen die Gesamtcredits nicht überschreiten',
        'Los créditos acumulados no pueden superar el total'
      ), lang),
    },
  };
};

export type ProfileCopy = ReturnType<typeof getProfileCopy>;
