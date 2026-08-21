// بيانات المطاعم والمحلات النموذجية لموقع دليل مغاغة للمطاعم
export const CATEGORIES = [
  { id: 'all', name: 'الكل', icon: 'fa-store' },
  { id: 'grill', name: 'المشويات', icon: 'fa-fire-burner' },
  { id: 'syrian', name: 'سوري/شاورما', icon: 'fa-fire' },
  { id: 'crepe', name: 'كريب/بيتزا', icon: 'fa-pizza-slice' },
  { id: 'sweets', name: 'وافل/حلويات', icon: 'fa-ice-cream' },
  { id: 'chicken', name: 'فرايد تشكن /بروست', icon: 'fa-drumstick-bite' },
  { id: 'burger', name: 'سماش برجر', icon: 'fa-burger' },
  { id: 'koshary', name: 'كشري', icon: 'fa-bowl-food' },
  { id: 'fish', name: 'الأسماك', icon: 'fa-fish' }
];

export const RESTAURANTS = [
  {
    id: 21,
    name: 'مطعم توكيو - Tokyo',
    category: 'crepe',
    logo: 'tokyo-logo',
    description: 'مطعم توكيو لجميع أنواع الكريب الإيطالي المميز والبيتزا الغنية بأجود المكونات في مغاغة.',
    phones: ['01221104263'],
    whatsApp: '',
    deliveryFee: 'من 20 لـ 30 جنيه',
    address: 'مغاغة - شارع السلام - امام هارد روك',
    workingHours: {
      start: '12:00',
      end: '02:00',
      display: 'من 12:00 ظهراً إلى 2:00 بعد منتصف الليل'
    },
    popularItems: [
      { name: 'كريب نوتيلا بالموز', price: 65, description: 'كريب نوتيلا غني مع الموز الطازج والمكسرات' },
      { name: 'بيتزا تشيكن رانش وسط', price: 110, description: 'بيتزا وسط مغطاة بقطع الدجاج، صوص الرانش اللذيذ، فلفل ألوان، وموزاريلا' }
    ],
    menuImages: ['tokyo-menu1', 'tokyo-menu2', 'tokyo-menu3', 'tokyo-menu4', 'tokyo-menu5']
  },
  {
    id: 23,
    name: 'اسماك يونس',
    category: 'fish',
    logo: 'youns-logo',
    description: 'اسماك يونس لجميع المأكولات البحرية الطازجة، صواني فرن، طواجن، وألذ الوجبات في مغاغة.',
    phones: ['01203504063', '01111475437', '01040092445'], // Using valid call phones
    whatsApp: '201113826695',
    deliveryFee: 'من 20 لـ 30 جنيه',
    address: 'ش الثورة - امام كشري هند',
    workingHours: {
      start: '12:00',
      end: '02:00',
      display: 'من 12:00 ظهراً إلى 2:00 بعد منتصف الليل'
    },
    popularItems: [
      { name: 'كيلو سمك بلطي مشوي', price: 120, description: 'سمك بلطي طازج متبل ومشوي بالردة على اللهب' },
      { name: 'طاجن فواكه البحر بالكريمة وسط', price: 160, description: 'تشكيلة جمبري، كاليماري، فيليه بخلطة الكريمة والجبنة في الفرن' }
    ],
    menuImages: ['youns-menu1', 'youns-menu2']
  },
  {
    id: 22,
    name: 'تيك اوي حوده',
    category: 'crepe',
    logo: 'houda-logo',
    description: 'تيك اوي حوده يقدم أشهى وأفضل أنواع الكريب والبيتزا الإيطالية والسندوتشات الغربية اللذيذة في مغاغة.',
    phones: ['01025850812'],
    whatsApp: '',
    deliveryFee: 'من 20 لـ 30 جنيه',
    address: 'مغاغة - شارع الثورة - بجوار حلا بحليب',
    workingHours: {
      start: '12:00',
      end: '02:00',
      display: 'من 12:00 ظهراً إلى 2:00 بعد منتصف الليل'
    },
    popularItems: [
      { name: 'كريب كرانشي سوبريم', price: 75, description: 'كريب مقرمش غني بقطع الفرايد تشكن، البطاطس، الموتزاريلا والصوصات' },
      { name: 'بيتزا مارجريتا وسط', price: 70, description: 'عجينة بيتزا إيطالية مميزة بصلصة الطماطم الغنية والجبن الموزاريلا' }
    ],
    menuImages: ['houda-menu1', 'houda-menu2', 'houda-menu3']
  },
  {
    id: 20,
    name: 'جدو الشام - Gedo Elsham',
    category: 'syrian',
    logo: 'gedo-logo',
    description: 'أفضل شاورما سوري، فتة، ساندوتشات غربية، وأكلات شامية لذيذة في مغاغة.',
    phones: ['01002405348'],
    whatsApp: '',
    deliveryFee: 'من 20 لـ 30 جنيه',
    address: 'مغاغة - شارع الشعبة (أمام بن الأسمر)',
    workingHours: {
      start: '12:00',
      end: '02:00',
      display: 'من 12:00 ظهراً إلى 2:00 بعد منتصف الليل'
    },
    popularItems: [
      { name: 'ساندوتش شاورما دجاج سوبر عربي', price: 80, description: 'شاورما دجاج، تومية، مخلل، خبز صاج مقرمش مع بطاطس فارم فريتس' },
      { name: 'فتة شاورما دجاج وسط', price: 95, description: 'أرز بسمتي مبهر، شاورما دجاج، خبز محمص، وصوص التومية الغني' },
      { name: 'وجبة نصف دجاجة بروستد', price: 135, description: '2 قطعة دجاج بروستد مقرمش، بطاطس، تومية، كول سلو، خبز سوري' }
    ],
    menuImages: ['gedo-menu1', 'gedo-menu2']
  },
  {
    id: 19,
    name: 'كشري هند - Koshary Hend',
    category: 'koshary',
    logo: 'hind-logo',
    description: 'أشهر وألذ أطباق الكشري المصري الأصيل والطواجن المتنوعة في مغاغة بفرعيه.',
    phones: ['01210195153', '01015061338'],
    secondBranchPhones: ['01206500071', '01116816266'],
    whatsApp: '',
    deliveryFee: 'من 20 لـ 30 جنيه',
    address: 'مغاغة - فرع شارع الثورة (أمام أسواق سيف) | فرع شارع المحطة',
    workingHours: {
      start: '12:00',
      end: '02:00',
      display: 'من 12:00 ظهراً إلى 2:00 بعد منتصف الليل'
    },
    popularItems: [
      { name: 'علبة كشري هند خصوصي', price: 40, description: 'أرز، مكرونة، عدس، حمص، بصل مقرمش مع الصلصة والتقلية المميزة' },
      { name: 'طاجن لحمة مفرومة بالفرن', price: 55, description: 'مكرونة فرن باللحمة المفرومة والصلصة الحمراء الغنية' },
      { name: 'طاجن فراخ بالجبنة الموتزاريلا', price: 65, description: 'مكرونة بقطع الدجاج والصلصة مغطاة بطبقة غنية من الموزاريلا' }
    ],
    menuImages: ['hind-menu1', 'hind-menu2', 'hind-menu3', 'hind-menu4']
  },
  {
    id: 18,
    name: 'هاي بروست - Hy Broasted',
    category: 'chicken',
    logo: 'hy-brosted-logo',
    description: 'أقوى بروست مقرمش ووجبات فرايد تشيكن غنية بخلطات وتتبيلات هاي المميزة في مغاغة.',
    phones: ['01287877563', '01110771334', '01020020965'],
    whatsApp: '',
    deliveryFee: 'من 20 لـ 30 جنيه',
    address: 'مغاغة - شارع الشعبة / الزهور، متفرع من شارع السلام',
    workingHours: {
      start: '12:00',
      end: '02:00',
      display: 'من 12:00 ظهراً إلى 2:00 بعد منتصف الليل'
    },
    popularItems: [
      { name: 'وجبة سوبر هاي بروست (4 قطع)', price: 145, description: '4 قطعة دجاج بروست مقرمش، بطاطس فارم فريتس، تومية، كول سلو، خبز' },
      { name: 'وجبة العيلة هاي (8 قطع)', price: 270, description: '8 قطع بروست مقرمش، بطاطس عائلية، لتر كولا، كول سلو كبير وخبز' },
      { name: 'ساندوتش تشيكن رويال العملاق', price: 90, description: 'صدور دجاج كريسبي، جبنة شيدر سايحة، خس، خيار مخلل وصوص هاي السري' }
    ],
    menuImages: ['hy-brosted-menu1', 'hy-brosted-menu2']
  },
  {
    id: 17,
    name: 'مطعم عروس الشام - Arous El Sham',
    category: 'syrian',
    logo: 'arous-alsham-logo',
    description: 'أشهى المأكولات السورية، الشاورما، الفتات، والوجبات المتنوعة بطعم الشام الأصيل في مغاغة.',
    phones: ['01031115114', '01128904090'],
    whatsApp: '',
    deliveryFee: 'من 20 لـ 30 جنيه',
    address: 'مغاغة - شارع السلام، ميدان الحمامة',
    workingHours: {
      start: '12:00',
      end: '02:00',
      display: 'من 12:00 ظهراً إلى 2:00 بعد منتصف الليل'
    },
    popularItems: [
      { name: '🎁 عرض عروس الشام الخاص', price: 'حسب الاختيار', description: 'اشتري 2 كريب من اختيارك وخد عليهم ساندوتش شاورما كبير هدية مجاناً! 🔥' },
      { name: 'ماريا شاورما دجاج سبيشال', price: 85, description: 'خبز صاج محشو شاورما دجاج، جبنة موزاريلا، تومية ومخلل مشوي على الجريل' },
      { name: 'فتة شاورما مشكل (دبل)', price: 110, description: 'أرز بسمتي مبهر، شاورما لحم ودجاج، خبز مقرمش وصوص تومية مميز' },
      { name: 'وجبة عربي سوبر دجاج', price: 95, description: 'قطع رول شاورما مقطعة تقدم مع بطاطس فارم فريتس، تومية، مخلل وكول سلو' }
    ],
    menuImages: ['arous-alsham-menu1', 'arous-alsham-menu2']
  },
  {
    id: 16,
    name: 'بابا برجر - Baba Burger',
    category: 'burger',
    logo: 'baba-food-logo',
    description: 'أفضل وأجود ساندوتشات السماش برجر اللحم والدجاج الطازج بخلطتنا الفريدة في مغاغة.',
    phones: ['01118487387'],
    whatsApp: '201118487387',
    deliveryFee: 'من 20 لـ 30 جنيه',
    address: 'مغاغة - شارع الثورة، بجوار حلو الشام',
    workingHours: {
      start: '12:00',
      end: '02:00',
      display: 'من 12:00 ظهراً إلى 2:00 بعد منتصف الليل'
    },
    popularItems: [
      { name: 'سماش برجر كلاسيك (سنجل)', price: 70, description: 'قطعة لحم سماش، جبنة شيدر، خس، طماطم، خيار مخلل، صوص بابا المميز' },
      { name: 'بابا برجر دبل سماش', price: 95, description: 'قطعتين لحم سماش، دبل جبنة شيدر، بصل مكرمل وصوص خاص' },
      { name: 'ساندوتش دجاج كريسبي بابا', price: 80, description: 'صدر دجاج مقرمش، جبنة شيدر سايحة، خس، مايونيز' }
    ],
    menuImages: ['baba-food-menu']
  },
  {
    id: 11,
    name: 'مزيكا كريب - Mazeka Crepe',
    category: 'crepe',
    logo: 'mazeka-logo',
    description: 'أطعم وأكبر كريب حادق وحلو وبيتزا إيطالي مميزة في مغاغة.',
    phones: ['01024716334', '01110672280'],
    whatsApp: '',
    deliveryFee: 'من 20 لـ 30 جنيه',
    address: 'مغاغة - شارع الثورة - أمام مطعم زيزو',
    workingHours: {
      start: '12:00',
      end: '02:00',
      display: 'من 12:00 ظهراً إلى 2:00 بعد منتصف الليل'
    },
    popularItems: [
      { name: 'كريب سوبر كرانشي حار', price: 75, description: 'فرايد تشيكن مقرمش، بطاطس، جبن موزاريلا، صوصات مميزة' },
      { name: 'كريب بطاطس سوري بالجبنة', price: 40, description: 'بطاطس مقلية مع تشكيلة جبن وصوص تومية' },
      { name: 'بيتزا سوبر سوبريم وسط', price: 95, description: 'شرائح لحوم متبلة، موزاريلا، خضروات طازجة' }
    ],
    menuImages: ['mazeka--meanu']
  },
  {
    id: 12,
    name: 'مطعم الثورة - El Thawra Restaurant',
    category: 'crepe',
    logo: 'elthwra-menu',
    description: 'أشهى كريب وسندوتشات غربية متنوعة وبيتزا إيطالية مميزة.',
    phones: ['01128804535', '01032527269'],
    whatsApp: '',
    deliveryFee: 'من 20 لـ 30 جنيه',
    address: 'مغاغة - شارع الثورة، بجوار قصر السلطان',
    workingHours: {
      start: '12:00',
      end: '02:00',
      display: 'من 12:00 ظهراً إلى 2:00 بعد منتصف الليل'
    },
    popularItems: [
      { name: 'كريب زنجر سوبريم حار', price: 80, description: 'قطع زنجر الدجاج الحار، جبن موزاريلا، فلفل، زيتون، صوصات' },
      { name: 'بيتزا مارجريتا (وسط)', price: 65, description: 'عجينة بيتزا إيطالية غنية بالجبن الموزاريلا وصلصة الطماطم المتبلة' },
      { name: 'كريب شاورما دجاج جامبو', price: 75, description: 'شاورما دجاج، جبن شيدر وموزاريلا، بطاطس، تومية وصوصات' }
    ],
    menuImages: ['elthwra']
  },
  {
    id: 14,
    name: 'كريب وبيتزا الشريعي - El Shraea Crepe & Pizza',
    category: 'crepe',
    logo: 'elshraea-logo',
    description: 'أجود أنواع الكريب والبيتزا الإيطالية والسندوتشات الغربية اللذيذة.',
    phones: ['01201882717'],
    whatsApp: '',
    deliveryFee: 'من 20 لـ 30 جنيه',
    address: 'مغاغة - شارع السلام، أمام مدرسة الراهبات',
    workingHours: {
      start: '12:00',
      end: '02:00',
      display: 'من 12:00 ظهراً إلى 2:00 بعد منتصف الليل'
    },
    popularItems: [
      { name: 'كريب زنجر سوبر سوبريم', price: 75, description: 'قطع زنجر الدجاج، بطاطس، موزاريلا، كاتشب، مايونيز، زيتون، فلفل' },
      { name: 'بيتزا تشيكن رانش وسط', price: 90, description: 'صدور دجاج، صوص رانش، موزاريلا، فلفل، زيتون' },
      { name: 'كريب نوتيلا بالموز والمكسرات', price: 50, description: 'كريب حلو غني بالنوتيلا والموز والمكسرات' }
    ],
    menuImages: ['elshraea2-menu1', 'elshraea2-menu2']
  },
  {
    id: 8,
    name: 'مشويات أبو طلعت - Abo Talaat Grill',
    category: 'grill',
    logo: 'abo-talaat-logo',
    description: 'أفضل الكباب والكفتة والمشويات على الفحم بطعم مغاغي بلدي أصيل.',
    phones: ['01113567679', '01023449972'],
    whatsApp: '',
    deliveryFee: 'من 20 لـ 30 جنيه',
    address: 'مغاغة - شارع السلام - بجوار مسجد السمسطاوي',
    workingHours: {
      start: '12:00',
      end: '02:00',
      display: 'من 12:00 ظهراً إلى 2:00 بعد منتصف الليل'
    },
    popularItems: [
      { name: 'كيلو كفتة مشوية على الفحم', price: 390, description: 'لحم بلدي متبل على الطريقة الشرقية الأصيلة' },
      { name: 'وجبة ربع كباب وكفتة', price: 130, description: 'كفتة وكباب مشوي مع أرز، سلطة خضراء، طحينة، وخبز' },
      { name: 'فرخة مشوية على الفحم', price: 240, description: 'تقدم مع الأرز والسلطات والعيش' }
    ],
    menuImages: ['abo-talaat-meanu1', 'abo-talaat-meanu2']
  },
  {
    id: 7,
    name: 'أبو علي بروست - Abo Ali Broast',
    category: 'chicken',
    logo: 'abo-ali-brost',
    description: 'أقوى بروست مقرمش ووجبات فرايد تشكن بخلطة أبو علي السرية المميزة.',
    phones: ['01035890038', '01240077763', '01144074480', '01233370023', '01035872002', '01100896009'],
    whatsApp: '',
    deliveryFee: 'من 20 لـ 30 جنيه',
    address: 'مغاغة - شارع الثورة - بجوار مسجد السلام',
    workingHours: {
      start: '12:00',
      end: '02:00',
      display: 'من 12:00 ظهراً إلى 2:00 بعد منتصف الليل'
    },
    popularItems: [
      { name: 'العرض الأول | لَمّة محبي الفرايد تشيكن', price: 149, description: '2 قطعة فرايد تشيكن + 2 كرسبي استربس + 2 خبز + كاتشب 🔥' },
      { name: '👑 العرض الثاني | صينية اللتاتة', price: 449, description: '8 قطع فرايد تشيكن + أرز بخلطة أبو علي + تومية وسط + كولسلو وسط + بطاطس بالجبنة + 4 خبز + كاتشب 😋🔥' },
      { name: '❤️ العرض الثالث | صينية الطبطبة', price: 399, description: '4 قطع فرايد تشيكن + 4 كرسبي استربس + أرز بالخلطة + بطاطس بالجبنة + كولسلو وسط + تومية وسط + كاتشب + 3 خبز 🍗🧀' }
    ],
    menuImages: ['abo-ali-meanu1', 'abo-ali-meanu2']
  },
  {
    id: 9,
    name: 'دكتور بوكس - Doctor Box',
    category: 'chicken',
    logo: 'doctor-box',
    description: 'وجبات تشيكن بروست وفرايد تشكن مقرمشة وساندوتشات عائلية متميزة.',
    phones: ['17818'],
    whatsApp: '',
    deliveryFee: 'من 20 لـ 30 جنيه',
    address: 'مغاغة – شارع السلام، أمام مدرسة الصنايع',
    workingHours: {
      start: '12:00',
      end: '02:00',
      display: 'من 12:00 ظهراً إلى 2:00 بعد منتصف الليل'
    },
    popularItems: [
      { name: 'بوكس الوجبة الفردية (3 قطع)', price: 110, description: '3 قطع دجاج بروست، بطاطس، ثومية، خبز' },
      { name: 'ساندوتش دكتور تشيكن العملاق', price: 85, description: 'صدور الدجاج المقرمشة بخلطة الطبيب الحارة مع الجبن السايح' },
      { name: 'شيرنج بوكس العائلي (9 قطع)', price: 285, description: '9 قطع بروست، بطاطس عائلية، كول سلو كبير، خبز، لتر بيبسي' }
    ],
    menuImages: ['doctor-box-meanu1', 'doctor-box-meanu2', 'doctor-box-meanu3', 'doctor-box-meanu4', 'doctor-box-meanu5', 'doctor-box-meanu6', 'doctor-box-meanu7', 'doctor-box-meanu8']
  },
  {
    id: 13,
    name: 'الشريعي فرايد تشيكن - El Shraea Fried Chicken',
    category: 'chicken',
    logo: 'elshraea-logo',
    description: 'أقوى وجبات الفرايد تشيكن والبروست المقرمش بعروض وخلطات مميزة.',
    phones: ['01208696419'],
    whatsApp: '',
    deliveryFee: 'من 20 لـ 30 جنيه',
    address: 'مغاغة - شارع السلام، أمام كوبري الصنائع',
    workingHours: {
      start: '12:00',
      end: '02:00',
      display: 'من 12:00 ظهراً إلى 2:00 بعد منتصف الليل'
    },
    popularItems: [
      { name: 'وجبة سوبر كرانشي فردية', price: 90, description: '3 قطع دجاج بروست، بطاطس، ثومية، عيش' },
      { name: 'ساندوتش الشريعي العملاق', price: 80, description: 'صدور دجاج كريسبي مقرمشة مع الخس والمايونيز والجبن' },
      { name: 'وجبة العيلة الشريعي (12 قطعة)', price: 340, description: '12 قطعة بروست، بطاطس عائلية، كول سلو كبير، خبز ولتر كولا' }
    ],
    menuImages: ['elshraea-menu1', 'elshraea-menu2', 'elshraea-menu3', 'elshraea-offer']
  },
  {
    id: 10,
    name: 'كوكب السعادة - Kawkab El Saada',
    category: 'sweets',
    logo: 'kokap-logo',
    description: 'أجود وأطعم أنواع الوافل، الكريب الحلو، العصائر، والحلويات المنعشة.',
    phones: ['01113914972'],
    whatsApp: '',
    deliveryFee: 'من 20 لـ 30 جنيه',
    address: 'مغاغة - شارع السلام، أمام الشعبة',
    workingHours: {
      start: '12:00',
      end: '02:00',
      display: 'من 12:00 ظهراً إلى 2:00 بعد منتصف الليل'
    },
    popularItems: [
      { name: 'وافل نوتيلا فواكه مشكل', price: 55, description: 'وافل مغطى بالنوتيلا مع قطع الفراولة والموز والكيوي' },
      { name: 'كريب حلو نوتيلا بندق', price: 45, description: 'كريب رقيق محشو شوكولاتة نوتيلا وبندق محمص' },
      { name: 'عصير كوكتيل كوكب السعادة', price: 40, description: 'طبقات من المانجو والفراولة والجوافة مع قطع الفواكه الطازجة' }
    ],
    menuImages: ['kokap-meanu1.jpg'] // Base filename maps to kokap-meanu1.jpg.webp
  },
  {
    id: 24,
    name: 'حلا بحليب - Hala B.Haleeb',
    category: 'sweets',
    logo: 'halabhaleeb-logo',
    description: 'حلا بحليب لألذ وأطيب الحلويات الشرقية والغربية، الوافل، الآيس كريم، وعصائر منعشة بأعلى جودة في مغاغة.',
    phones: ['01040853091', '01228838016'],
    whatsApp: '',
    deliveryFee: 'من 20 لـ 30 جنيه',
    address: 'مغاغة - ش الثورة بجوار حلو الشام',
    workingHours: {
      start: '12:00',
      end: '02:00',
      display: 'من 12:00 ظهراً إلى 2:00 بعد منتصف الليل'
    },
    popularItems: [
      { name: 'طبق حلا بحليب المشكل', price: 65, description: 'أرز بلبن غني مع قشطة، مكسرات، عسل وفواكه طازجة' },
      { name: 'وافل نوتيلا دبل', price: 50, description: 'وافل مقرمش مغطى بطبقة غنية من الشوكولاتة النوتيلا والمكسرات' }
    ],
    menuImages: ['halabhaleeb-menu1']
  },
  {
    id: 25,
    name: 'رغيف كفتة - Raghif Kofta',
    category: 'grill',
    logo: 'raghifkofta-logo',
    description: 'مطعم رغيف كفتة لأشهر ساندوتشات المشويات على الفحم، كفتة، كباب، وطواجن شرقية شهية بأجود أنواع اللحوم البلدي في مغاغة.',
    phones: ['01144252519', '01095496696'],
    whatsApp: '',
    deliveryFee: 'من 20 لـ 30 جنيه',
    address: 'مغاغة - شارع الثورة - امام كشرى هند',
    workingHours: {
      start: '12:00',
      end: '02:00',
      display: 'من 12:00 ظهراً إلى 2:00 بعد منتصف الليل'
    },
    popularItems: [
      { name: 'ساندوتش رغيف كفتة بلدي على الفحم', price: 45, description: 'كفتة بلدي مشوية على الفحم مع السلطات والطحينة في خبز بلدي طازج' },
      { name: 'وجبة كفتة وكباب مكس', price: 120, description: 'مشويات بلدي متبلة تقدم مع الأرز والعيش والسلطات' }
    ],
    menuImages: ['raghifkofta-menu1']
  },
  {
    id: 10,
    name: 'كوكب السعادة - Kawkab El Saada',
    category: 'sweets',
    logo: 'kokap-logo',
    description: 'أجود وأطعم أنواع الوافل، الكريب الحلو، العصائر، والحلويات المنعشة.',
    phones: ['01113914972'],
    whatsApp: '',
    deliveryFee: 'من 20 لـ 30 جنيه',
    address: 'مغاغة - شارع السلام، أمام الشعبة',
    workingHours: {
      start: '12:00',
      end: '02:00',
      display: 'من 12:00 ظهراً إلى 2:00 بعد منتصف الليل'
    },
    popularItems: [
      { name: 'وافل نوتيلا فواكه مشكل', price: 55, description: 'وافل مغطى بالنوتيلا مع قطع الفراولة والموز والكيوي' },
      { name: 'كريب حلو نوتيلا بندق', price: 45, description: 'كريب رقيق محشو شوكولاتة نوتيلا وبندق محمص' },
      { name: 'عصير كوكتيل كوكب السعادة', price: 40, description: 'طبقات من المانجو والفراولة والجوافة مع قطع الفواكه الطازجة' }
    ],
    menuImages: ['kokap-meanu1.jpg']
  },
  {
    id: 24,
    name: 'حلا بحليب - Hala B.Haleeb',
    category: 'sweets',
    logo: 'halabhaleeb-logo',
    description: 'حلا بحليب لألذ وأطيب الحلويات الشرقية والغربية، الوافل، الآيس كريم، وعصائر منعشة بأعلى جودة في مغاغة.',
    phones: ['01040853091', '01228838016'],
    whatsApp: '',
    deliveryFee: 'من 20 لـ 30 جنيه',
    address: 'مغاغة - ش الثورة بجوار حلو الشام',
    workingHours: {
      start: '12:00',
      end: '02:00',
      display: 'من 12:00 ظهراً إلى 2:00 بعد منتصف الليل'
    },
    popularItems: [
      { name: 'طبق حلا بحليب المشكل', price: 65, description: 'أرز بلبن غني مع قشطة، مكسرات، عسل وفواكه طازجة' },
      { name: 'وافل نوتيلا دبل', price: 50, description: 'وافل مقرمش مغطى بطبقة غنية من الشوكولاتة النوتيلا والمكسرات' }
    ],
    menuImages: ['halabhaleeb-menu1']
  },
  {
    id: 25,
    name: 'رغيف كفتة - Raghif Kofta',
    category: 'grill',
    logo: 'raghifkofta-logo',
    description: 'مطعم رغيف كفتة لأشهر ساندوتشات المشويات على الفحم، كفتة، كباب، وطواجن شرقية شهية بأجود أنواع اللحوم البلدي في مغاغة.',
    phones: ['01144252519', '01095496696'],
    whatsApp: '',
    deliveryFee: 'من 20 لـ 30 جنيه',
    address: 'مغاغة - شارع الثورة - امام كشرى هند',
    workingHours: {
      start: '12:00',
      end: '02:00',
      display: 'من 12:00 ظهراً إلى 2:00 بعد منتصف الليل'
    },
    popularItems: [
      { name: 'ساندوتش رغيف كفتة بلدي على الفحم', price: 45, description: 'كفتة بلدي مشوية على الفحم مع السلطات والطحينة في خبز بلدي طازج' },
      { name: 'وجبة كفتة وكباب مكس', price: 120, description: 'مشويات بلدي متبلة تقدم مع الأرز والعيش والسلطات' }
    ],
    menuImages: ['raghifkofta-menu1']
  }
];

export const CAPTAINS = [
  {
    id: 'captain_1',
    name: 'الكابتن أحمد الجارحي (أبو فهد)',
    avatar: 'avatar-men',
    phone: '01062049652',
    serviceTypes: ['توصيل طلبات', 'مشاوير'],
    isAvailable: true,
    description: 'شاب ملتزم وموثوق، توصيل سريع وأمان كامل لطلباتكم ومأكولاتكم داخل مغاغة وضواحيها 24 ساعة.',
    tripsCount: 235
  },
  {
    id: 'captain_2',
    name: 'مكتب دليفري لك',
    avatar: 'dlevarlk-logo',
    phone: '01155435543',
    whatsApp: '201155435543',
    serviceTypes: ['توصيل طلبات'],
    isAvailable: true,
    description: 'مكتب توصيل طلبات فقط، يقدم خدمة سريعة ومتميزة تشمل مدينة مغاغة بالكامل لتوصيل جميع طلباتكم.',
    tripsCount: 150
  }
];

export const SUPERMARKETS = [
  {
    id: 'supermarket_1',
    name: 'هايبر العمدة - El Omda Hypermarket',
    logo: 'elomda-logo',
    description: 'سلسلة هايبر العمدة توفر جميع السلع الغذائية، المنتجات المنزلية والمستلزمات بأفضل الأسعار وخدمة دليفري لجميع مناطق مغاغة.',
    phones: ['01224161001', '01288583389', '01040092445'],
    branches: [
      'فرع 1: مغاغة العبور - شارع الثورة',
      'فرع 2: مغاغة - شارع السلام - بجوار مدرسة الراهبات',
      'فرع 3: مغاغة - منشية المصري بجوار جامع ناصر'
    ],
    deliveryFee: 'خدمة توصيل فورية 🚀',
    workingHours: {
      start: '08:00',
      end: '02:00',
      display: 'من 8:00 صباحاً إلى 2:00 بعد منتصف الليل'
    }
  },
  {
    id: 'supermarket_2',
    name: 'الوكيل لتجارة الجملة - Al Wakeel',
    logo: 'alwakeel-logo',
    description: 'محل الوكيل متخصص في بيع السلع الغذائية والبقالة الأساسية بالكامل، يقدم أسعار قطاعي بسعر الجملة لتلبية احتياجاتكم بأقل الأسعار.',
    phones: ['01015838397', '01010279704'],
    whatsApp: '201015838397',
    address: 'مغاغة - شارع الزهور - بجوار شبكة المياه - خلف المطافي',
    deliveryFee: 'خدمة توصيل طلبات 📦',
    workingHours: {
      start: '08:00',
      end: '02:00',
      display: 'من 8:00 صباحاً إلى 2:00 بعد منتصف الليل'
    }
  },
  {
    id: 'supermarket_3',
    name: 'بـ جبنة - BeGebna',
    logo: 'begebna-logo',
    description: 'محل بـ جبنة لجميع أنواع الأجبان، البقالة، والمنتجات الطبيعية 100%. جميع أنواع المربات الطبيعية متاحة بجميع الأطعام المميزة في مغاغة.',
    phones: ['01156115709', '01038860273'],
    whatsApp: '201156115709',
    address: 'مغاغة - شارع الثورة - خلف أسواق سيف',
    deliveryFee: 'خدمة توصيل طلبات 📦',
    workingHours: {
      start: '08:00',
      end: '02:00',
      display: 'من 8:00 صباحاً إلى 2:00 بعد منتصف الليل'
    },
    popularItems: [
      { name: 'مربى توت طبيعي 100%', price: 'حسب الحجم', description: 'مربى توت طبيعي طازجة وبدون مواد حافظة 💛👌🏻' },
      { name: 'مربى فراولة طبيعي 100%', price: 'حسب الحجم', description: 'مربى فراولة طازجة طبيعية 100% 💛👌🏻' },
      { name: 'مربى مانجو طبيعي 100%', price: 'حسب الحجم', description: 'مربى مانجو طبيعية بطعم غني 💛👌🏻' },
      { name: 'مربى كيوي طبيعي 100%', price: 'حسب الحجم', description: 'مربى كيوي طبيعي 100% 💛👌🏻' },
      { name: 'مربى تين طبيعي 100%', price: 'حسب الحجم', description: 'مربى تين طبيعي طازجة وبدون مواد حافظة 💛👌🏻' },
      { name: 'مربى مشمش طبيعي 100%', price: 'حسب الحجم', description: 'مربى مشمش طبيعية 100% 💛👌🏻' }
    ],
    menuImages: ['begebna-menu2', 'begebna-menu1']
  }
];

export function isRestaurantOpen(workingHours) {
  if (!workingHours || !workingHours.start || !workingHours.end) {
    return true;
  }
  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const parseTimeToMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + (minutes || 0);
    };

    const startMinutes = parseTimeToMinutes(workingHours.start);
    let endMinutes = parseTimeToMinutes(workingHours.end);

    if (endMinutes < startMinutes) {
      if (currentTimeInMinutes >= startMinutes || currentTimeInMinutes < endMinutes) {
        return true;
      }
      return false;
    } else {
      return currentTimeInMinutes >= startMinutes && currentTimeInMinutes <= endMinutes;
    }
  } catch (error) {
    console.error('Error parsing working hours:', error);
    return true;
  }
}
