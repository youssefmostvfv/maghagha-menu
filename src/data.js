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
import mazekaLogo from './assets/mazeka-logo.png';
import mazekaMenu from './assets/mazeka--meanu.jpg';
import elthwraLogo from './assets/elthwra-menu.jpg';
import elthwraMenu from './assets/elthwra.jpg';
import elshraeaLogo from './assets/elshraea-logo.jpg';
import elshraeaMenu1 from './assets/elshraea-menu1.jpg';
import elshraeaMenu2 from './assets/elshraea-menu2.jpg';
import elshraeaMenu3 from './assets/elshraea-menu3.jpg';
import elshraeaOffer from './assets/elshraea-offer.jpg';
import elshraea2Menu1 from './assets/elshraea2-menu1.jpg';
import elshraea2Menu2 from './assets/elshraea2-menu2.jpg';
import koshiLogo from './assets/Koshi-Sushi-logo.jpg';
import koshiMenu from './assets/Koshi-Sushi-menu.jpg';
import babaLogo from './assets/baba-food-logo.jpg';
import babaMenu from './assets/baba-food-menu.jpg';

// بيانات المطاعم والمحلات النموذجية لموقع دليل مغاغة للمطاعم
export const CATEGORIES = [
  { id: 'all', name: 'الكل', icon: 'fa-store' },
  { id: 'grill', name: 'المشويات', icon: 'fa-fire-burner' },
  { id: 'syrian', name: 'سوري/شاورما', icon: 'fa-fire' },
  { id: 'crepe', name: 'كريب/بيتزا', icon: 'fa-pizza-slice' },
  { id: 'sweets', name: 'وافل/حلويات', icon: 'fa-ice-cream' },
  { id: 'chicken', name: 'فرايد تشكن /بروست', icon: 'fa-drumstick-bite' },
  { id: 'burger', name: 'سماش برجر', icon: 'fa-burger' },
  { id: 'sushi', name: 'سوشي', icon: 'fa-shrimp' }
];

export const RESTAURANTS = [
  {
    id: 16,
    name: 'بابا برجر - Baba Burger',
    category: 'burger',
    logo: babaLogo,
    description: 'أفضل وأجود ساندوتشات السماش برجر اللحم والدجاج الطازج بخلطتنا الفريدة في مغاغة.',
    phones: ['01118487387'],
    whatsApp: '201118487387',
    deliveryFee: '20 جنيه',
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
    menuImages: [babaMenu]
  },
  {
    id: 15,
    name: 'سوشي كوشي - Koshi Sushi',
    category: 'sushi',
    logo: koshiLogo,
    description: 'أشهى ساندوتشات ولفائف السوشي اليابانية الطازجة والمحضرّة من أجود المكونات في مغاغة.',
    phones: ['01287187786'],
    whatsApp: '',
    deliveryFee: '20 جنيه',
    address: 'أونلاين (توصيل فقط)',
    workingHours: {
      start: '12:00',
      end: '23:00',
      display: 'من 12:00 ظهراً إلى 11:00 مساءً'
    },
    popularItems: [
      { name: 'هوسو ماكي سالمون (6 قطع)', price: 95, description: 'لفائف سوشي كلاسيكية محشوة بالسلمون الطازج والأرز ونوري' },
      { name: 'فيلادلفيا رول (8 قطع)', price: 150, description: 'سلمون، جبنة كريمي، خيار، أفوكادو، سمسم' },
      { name: 'كومبو مشكل (16 قطعة)', price: 290, description: 'تشكيلة ممتازة من السوشي رولز والماكي والساشيمي تناسب جميع الأذواق' }
    ],
    menuImages: [koshiMenu]
  },
  {
    id: 11,
    name: 'مزيكا كريب - Mazeka Crepe',
    category: 'crepe',
    logo: mazekaLogo,
    description: 'أطعم وأكبر كريب حادق وحلو وبيتزا إيطالي مميزة في مغاغة.',
    phones: ['01024716334', '01110672280'],
    whatsApp: '',
    deliveryFee: '20 جنيه',
    address: 'مغاغة - شارع الثورة - أمام مطعم زيزو',
    workingHours: {
      start: '12:00',
      end: '03:00',
      display: 'من 12:00 ظهراً إلى 3:00 بعد منتصف الليل'
    },
    popularItems: [
      { name: 'كريب سوبر كرانشي حار', price: 75, description: 'فرايد تشيكن مقرمش، بطاطس، جبن موزاريلا، صوصات مميزة' },
      { name: 'كريب بطاطس سوري بالجبنة', price: 40, description: 'بطاطس مقلية مع تشكيلة جبن وصوص تومية' },
      { name: 'بيتزا سوبر سوبريم وسط', price: 95, description: 'شرائح لحوم متبلة، موزاريلا، خضروات طازجة' }
    ],
    menuImages: [mazekaMenu]
  },
  {
    id: 12,
    name: 'مطعم الثورة - El Thawra Restaurant',
    category: 'crepe',
    logo: elthwraLogo,
    description: 'أشهى كريب وسندوتشات غربية متنوعة وبيتزا إيطالية مميزة.',
    phones: ['01128804535', '01032527269'],
    whatsApp: '',
    deliveryFee: '20 جنيه',
    address: 'مغاغة - شارع الثورة، بجوار قصر السلطان',
    workingHours: {
      start: '12:00',
      end: '02:30',
      display: 'من 12:00 ظهراً إلى 2:30 بعد منتصف الليل'
    },
    popularItems: [
      { name: 'كريب زنجر سوبريم حار', price: 80, description: 'قطع زنجر الدجاج الحار، جبن موزاريلا، فلفل، زيتون، صوصات' },
      { name: 'بيتزا مارجريتا (وسط)', price: 65, description: 'عجينة بيتزا إيطالية غنية بالجبن الموزاريلا وصلصة الطماطم المتبلة' },
      { name: 'كريب شاورما دجاج جامبو', price: 75, description: 'شاورما دجاج، جبن شيدر وموزاريلا، بطاطس، تومية وصوصات' }
    ],
    menuImages: [elthwraMenu]
  },
  {
    id: 14,
    name: 'كريب وبيتزا الشريعي - El Shraea Crepe & Pizza',
    category: 'crepe',
    logo: elshraeaLogo,
    description: 'أجود أنواع الكريب والبيتزا الإيطالية والسندوتشات الغربية اللذيذة.',
    phones: ['01201882717'],
    whatsApp: '',
    deliveryFee: '20 جنيه',
    address: 'مغاغة - شارع السلام، أمام مدرسة الراهبات',
    workingHours: {
      start: '12:00',
      end: '02:30',
      display: 'من 12:00 ظهراً إلى 2:30 بعد منتصف الليل'
    },
    popularItems: [
      { name: 'كريب زنجر سوبر سوبريم', price: 75, description: 'قطع زنجر الدجاج، بطاطس، موزاريلا، كاتشب، مايونيز، زيتون، فلفل' },
      { name: 'بيتزا تشيكن رانش وسط', price: 90, description: 'صدور دجاج، صوص رانش، موزاريلا، فلفل، زيتون' },
      { name: 'كريب نوتيلا بالموز والمكسرات', price: 50, description: 'كريب حلو غني بالنوتيلا والموز والمكسرات' }
    ],
    menuImages: [elshraea2Menu1, elshraea2Menu2]
  },
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
    id: 13,
    name: 'الشريعي فرايد تشيكن - El Shraea Fried Chicken',
    category: 'chicken',
    logo: elshraeaLogo,
    description: 'أقوى وجبات الفرايد تشيكن والبروست المقرمش بعروض وخلطات مميزة.',
    phones: ['01208696419'],
    whatsApp: '',
    deliveryFee: '20 جنيه',
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
    menuImages: [elshraeaMenu1, elshraeaMenu2, elshraeaMenu3, elshraeaOffer]
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
