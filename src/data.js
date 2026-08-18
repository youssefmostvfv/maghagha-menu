import aboAliBrost from './assets/abo-ali-brost.jpg';
import aboAliMenu1 from './assets/abo-ali-meanu1.jpg';
import aboAliMenu2 from './assets/abo-ali-meanu2.jpg';
import aboTalaatLogo from './assets/abo-talaat-logo.png';
import aboTalaatMenu1 from './assets/abo-talaat-meanu1.jpg';
import aboTalaatMenu2 from './assets/abo-talaat-meanu2.jpg';
import doctorBoxLogo from './assets/doctor-box.jpg';
import docMenu1 from './assets/doctor-box-meanu1.jpg';
import docMenu2 from './assets/doctor-box-meanu2.jpg';
import docMenu3 from './assets/doctor-box-meanu3.jpg';
import docMenu4 from './assets/doctor-box-meanu4.jpg';
import docMenu5 from './assets/doctor-box-meanu5.jpg';
import docMenu6 from './assets/doctor-box-meanu6.jpg';
import docMenu7 from './assets/doctor-box-meanu7.jpg';
import docMenu8 from './assets/doctor-box-meanu8.jpg';
import kokapLogo from './assets/kokap-logo.jpg';
import kokapMenu1 from './assets/kokap-meanu1.jpg.jpeg';

// بيانات المطاعم والمحلات النموذجية لموقع دليل مغاغة للمطاعم
export const CATEGORIES = [
  { id: 'all', name: 'الكل', icon: 'fa-store' },
  { id: 'grill', name: 'المشويات', icon: 'fa-fire-burner' },
  { id: 'syrian', name: 'سوري/شاورما', icon: 'fa-fire' },
  { id: 'crepe', name: 'كريب/بيتزا', icon: 'fa-pizza-slice' },
  { id: 'sweets', name: 'وافل/حلويات', icon: 'fa-ice-cream' },
  { id: 'chicken', name: 'فرايد تشكن /بروست', icon: 'fa-drumstick-bite' },
  { id: 'burger', name: 'سماش برجر', icon: 'fa-burger' }
];

export const RESTAURANTS = [
  {
    id: 8,
    name: 'مشويات أبو طلعت - Abo Talaat Grill',
    category: 'grill',
    logo: aboTalaatLogo,
    description: 'أفضل الكباب والكفتة والمشويات على الفحم بطعم مغاغي بلدي أصيل.',
    phones: ['01113567679', '01023449972'],
    whatsApp: '',
    deliveryFee: '20 جنيه',
    address: 'مغاغة - شارع السلام - بجوار مسجد السمسطاوي',
    workingHours: {
      start: '11:00',
      end: '01:00',
      display: 'من 11:00 صباحاً إلى 1:00 بعد منتصف الليل'
    },
    popularItems: [
      { name: 'كيلو كفتة مشوية على الفحم', price: 390, description: 'لحم بلدي متبل على الطريقة الشرقية الأصيلة' },
      { name: 'وجبة ربع كباب وكفتة', price: 130, description: 'كفتة وكباب مشوي مع أرز، سلطة خضراء، طحينة، وخبز' },
      { name: 'فرخة مشوية على الفحم', price: 240, description: 'تقدم مع الأرز والسلطات والعيش' }
    ],
    menuImages: [aboTalaatMenu1, aboTalaatMenu2]
  },
  {
    id: 7,
    name: 'أبو علي بروست - Abo Ali Broast',
    category: 'chicken',
    logo: aboAliBrost,
    description: 'أقوى بروست مقرمش ووجبات فرايد تشكن بخلطة أبو علي السرية المميزة.',
    phones: ['01035890038', '01240077763', '01144074480', '01233370023', '01035872002', '01100896009'],
    whatsApp: '',
    deliveryFee: '20 جنيه',
    address: 'مغاغة - شارع الثورة - بجوار مسجد السلام',
    workingHours: {
      start: '11:00',
      end: '02:00',
      display: 'من 11:00 صباحاً إلى 2:00 بعد منتصف الليل'
    },
    popularItems: [
      { name: 'وجبة بروست 4 قطع', price: 140, description: '4 قطع دجاج، بطاطس، ثومية، كول سلو، خبز' },
      { name: 'وجبة عائلية 8 قطع', price: 260, description: '8 قطع دجاج بروست، بطاطس عائلية، لتر كولا، كول سلو كبير' },
      { name: 'ساندوتش سوبر جامبو مقرمش', price: 85, description: 'صدور دجاج سبايسي، لحم رومي، جبنة سايحة، صوص أبو علي المميز' }
    ],
    menuImages: [aboAliMenu1, aboAliMenu2]
  },
  {
    id: 9,
    name: 'دكتور بوكس - Doctor Box',
    category: 'chicken',
    logo: doctorBoxLogo,
    description: 'وجبات تشيكن بروست وفرايد تشكن مقرمشة وساندوتشات عائلية متميزة.',
    phones: ['17818'],
    whatsApp: '',
    deliveryFee: '20 جنيه',
    address: 'مغاغة – شارع السلام، أمام مدرسة الصنايع',
    workingHours: {
      start: '11:30',
      end: '02:30',
      display: 'من 11:30 صباحاً إلى 2:30 بعد منتصف الليل'
    },
    popularItems: [
      { name: 'بوكس الوجبة الفردية (3 قطع)', price: 110, description: '3 قطع دجاج بروست، بطاطس، ثومية، خبز' },
      { name: 'ساندوتش دكتور تشيكن العملاق', price: 85, description: 'صدور الدجاج المقرمشة بخلطة الطبيب الحارة مع الجبن السايح' },
      { name: 'شيرنج بوكس العائلي (9 قطع)', price: 285, description: '9 قطع بروست، بطاطس عائلية، كول سلو كبير، خبز، لتر بيبسي' }
    ],
    menuImages: [docMenu1, docMenu2, docMenu3, docMenu4, docMenu5, docMenu6, docMenu7, docMenu8]
  },
  {
    id: 1,
    name: 'باسم السوري - Bassem El Syrian',
    category: 'syrian',
    logo: 'https://images.unsplash.com/photo-1561651823-34fed022540d?w=150&auto=format&fit=crop&q=60',
    description: 'أقوى الشاورما السورية والوجبات الغربية السريعة في مغاغة.',
    phones: ['01123456789'],
    whatsApp: '201123456789',
    deliveryFee: '20 جنيه',
    address: 'مغاغة - شارع الجمهورية بجوار بنك مصر',
    workingHours: {
      start: '12:00',
      end: '02:00',
      display: 'من 12:00 ظهراً إلى 2:00 بعد منتصف الليل'
    },
    popularItems: [
      { name: 'شاورما عربي دبل', price: 85, description: 'شرائح شاورما دجاج، بطاطس، ثومية، مخلل' },
      { name: 'صاروخ شاورما لحم', price: 70, description: 'خبز صاج كبير، شاورما لحم بلدي، طحينة' },
      { name: 'ماريا باسم السوري', price: 90, description: 'خبز صاج محشو شاورما وجبنة موزاريلا على الفحم' },
      { name: 'وجبة عربي فرط (نص كيلو)', price: 210, description: 'شاورما فرط، بطاطس، ثومية، خبز، مخللات' }
    ],
    menuImages: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 2,
    name: 'كريب ستور - Crepe Store',
    category: 'crepe',
    logo: 'https://images.unsplash.com/photo-1621961401348-f09374731b2a?w=150&auto=format&fit=crop&q=60',
    description: 'أطعم وأكبر كريب حادق وحلو وبيتزا إيطالي مميزة.',
    phones: ['01098765432'],
    whatsApp: '201098765432',
    deliveryFee: '20 جنيه',
    address: 'مغاغة - شارع السلام خلف مجلس المدينة',
    workingHours: {
      start: '11:00',
      end: '03:00',
      display: 'من 11:00 صباحاً إلى 3:00 فجراً'
    },
    popularItems: [
      { name: 'كريب سوبر شيش كرانشي', price: 75, description: 'شيش طاووق، كرانشي حار، بطاطس، جبن، صوصات' },
      { name: 'كريب نوتيلا بالموز والمكسرات', price: 55, description: 'كريب حلو غني بشوكولاتة نوتيلا الأصلية' },
      { name: 'بيتزا تشيكن رانش (وسط)', price: 95, description: 'دجاج، صوص رانش، موزاريلا، فلفل، زيتون' },
      { name: 'كريب بطاطس سوري بالجبنة', price: 40, description: 'كريب اقتصادي ولذيذ بالبطاطس المقلية والجبن الموزاريلا' }
    ],
    menuImages: [
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 3,
    name: 'مشويات حضرموت - Hadramout Grill',
    category: 'grill',
    logo: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=150&auto=format&fit=crop&q=60',
    description: 'أصل المشويات على الفحم والمندي البلدي الفاخر.',
    phones: ['01211112223'],
    whatsApp: '',
    deliveryFee: '20 جنيه',
    address: 'مغاغة - الطريق الزراعي أمام كوبري المشاة',
    workingHours: {
      start: '09:00',
      end: '00:00',
      display: 'من 9:00 صباحاً إلى 12:00 منتصف الليل'
    },
    popularItems: [
      { name: 'ربع مندي فرخة (صدر/ورك)', price: 75, description: 'يقدم مع أرز مندي مبهر، سلطة خضراء، طحينة' },
      { name: 'كيلو كفتة بلدي على الفحم', price: 380, description: 'لحم بلدي صافي مشوي مع التتبيلة السرية' },
      { name: 'وجبة العيلة (نص تيس مندي)', price: 2100, description: 'تكفي من 6 لـ 8 أفراد، تقدم مع سرفيس الأرز والسلطات' },
      { name: 'طاجن عكاوي بالبصل', price: 190, description: 'عكاوي بلدي مطهوة في الفرن مع البصل والتوابل' }
    ],
    menuImages: [
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 4,
    name: 'حلواني قصر الإليزيه - El Elysee Sweets',
    category: 'sweets',
    logo: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=150&auto=format&fit=crop&q=60',
    description: 'شرقي، غربي، تورت، وافل، وأجود أنواع الأيس كريم والحلويات.',
    phones: ['0863812345'],
    whatsApp: '20863812345',
    deliveryFee: '20 جنيه',
    address: 'مغاغة - ميدان المحطة بجوار صيدلية الشعب',
    workingHours: {
      start: '10:00',
      end: '23:30',
      display: 'من 10:00 صباحاً إلى 11:30 مساءً'
    },
    popularItems: [
      { name: 'وافل نوتيلا لوتس دبل', price: 65, description: 'وافل ساخن مغطى بكريمة نوتيلا و زبدة لوتس مع قطع بسكويت' },
      { name: 'طبق بسبوسة سادة (كيلو)', price: 90, description: 'بسبوسة مرملة بالسمن البلدي والمكسرات' },
      { name: 'تورته شوكولاتة وسط', price: 220, description: 'شوكولاتة بلجيكية فاخرة مع الكريمة الطازجة' },
      { name: 'بولات أيس كريم مشكل', price: 35, description: 'أربع بولات بنكهات الفراولة، الشوكولاتة، المانجو، والفانيليا' }
    ],
    menuImages: [
      'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 10,
    name: 'كوكب السعادة - Kawkab El Saada',
    category: 'sweets',
    logo: kokapLogo,
    description: 'أجود وأطعم أنواع الوافل، الكريب الحلو، العصائر، والحلويات المنعشة.',
    phones: ['01113914972'],
    whatsApp: '',
    deliveryFee: '20 جنيه',
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
    menuImages: [kokapMenu1]
  },
  {
    id: 5,
    name: 'كافيه لافازا - Lavazza Cafe',
    category: 'cafe',
    logo: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&auto=format&fit=crop&q=60',
    description: 'مكان هادئ، مشروبات ساخنة وباردة، وميلك شيك منعش.',
    phones: ['01555566677'],
    whatsApp: '',
    deliveryFee: '20 جنيه',
    address: 'مغاغة - كورنيش النيل الجديد',
    workingHours: {
      start: '08:00',
      end: '02:00',
      display: 'من 8:00 صباحاً إلى 2:00 بعد منتصف الليل'
    },
    popularItems: [
      { name: 'سبانيش لاتيه بارد', price: 50, description: 'إسبريسو مع الحليب المكثف المحلى والحليب الطازج والثلج' },
      { name: 'كابتشينو مزدوج', price: 35, description: 'قهوة إسبريسو غنية مع رغوة الحليب الكثيفة' },
      { name: 'وافل نوتيلا فواكه', price: 60, description: 'وافل بلجيكي دافئ مغطى بالنوتيلا وقطع الموز والفراولة' },
      { name: 'عصير مانجو فريش', price: 40, description: 'مانجو طبيعي 100% بدون إضافات ألوان' }
    ],
    menuImages: [
      'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800&auto=format&fit=crop&q=80'
    ]
  }
];

export function isRestaurantOpen(workingHours) {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  const parseTimeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
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
}
