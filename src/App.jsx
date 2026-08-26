import React, { useState, useEffect } from 'react';
import { CATEGORIES, RESTAURANTS as INITIAL_RESTAURANTS, isRestaurantOpen, getPromoCode, CAPTAINS as INITIAL_CAPTAINS, SUPERMARKETS as INITIAL_SUPERMARKETS, INITIAL_JOB_SEEKERS, INITIAL_JOB_VACANCIES, DOCTOR_CATEGORIES, INITIAL_DOCTORS, INITIAL_PHARMACIES, INITIAL_GOV_SERVICES } from './data';
import logo from '../public/assets/logo.webp';
import logoTow from '../public/assets/logo-tow.webp';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
// 
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const resolveImage = (imgName) => {
  if (!imgName) return '/favicon.png';
  
  let filename = imgName;
  
  // Clean up development paths from older database seeds
  if (typeof filename === 'string' && filename.includes('src/assets/')) {
    filename = filename.substring(filename.lastIndexOf('/') + 1);
  }

  if (filename.startsWith('http') || filename.startsWith('data:') || filename.startsWith('blob:')) {
    return filename;
  }
  
  // Strip any leading '/assets/', 'assets/', or '/'
  let cleanName = filename;
  if (cleanName.startsWith('/assets/')) {
    cleanName = cleanName.substring(8);
  } else if (cleanName.startsWith('assets/')) {
    cleanName = cleanName.substring(7);
  } else if (cleanName.startsWith('/')) {
    cleanName = cleanName.substring(1);
  }
  
  // Strip Vite production build hashes (e.g., -D_mkwAT5)
  cleanName = cleanName.replace(/-[a-zA-Z0-9_-]{8}(\.[a-zA-Z0-9]+)?$/, '$1');
  
  // Strip any old extension and force .webp
  const dotIndex = cleanName.lastIndexOf('.');
  const baseName = dotIndex !== -1 ? cleanName.substring(0, dotIndex) : cleanName;
  
  let finalExt = 'webp';
  if (baseName === 'avatar-men') {
    finalExt = 'webp';
  }
  
  return `/assets/${baseName}.${finalExt}`;
};

const shuffleArray = (array) => {
  if (!array || !Array.isArray(array)) return [];
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const formatTo12Hour = (timeStr) => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  const hour24 = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hour24 >= 12 ? 'م' : 'ص';
  let hour12 = hour24 % 12;
  hour12 = hour12 ? hour12 : 12;
  return `${hour12}:${minutes} ${ampm}`;
};

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [activeMenuImage, setActiveMenuImage] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [phoneSelectorList, setPhoneSelectorList] = useState(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchStartDist, setTouchStartDist] = useState(0);
  const [touchStartScale, setTouchStartScale] = useState(1);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [showPreloader, setShowPreloader] = useState(true);
  const [fadePreloader, setFadePreloader] = useState(false);
  const [ratings, setRatings] = useState({});
  const [userRatings, setUserRatings] = useState({});
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false);
  const [ratingAnimationState, setRatingAnimationState] = useState(null);
  const [tripsCounts, setTripsCounts] = useState({});
  const [activeMainTab, setActiveMainTab] = useState('restaurants');
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedCaptainService, setSelectedCaptainService] = useState('all');
  const [restaurants, setRestaurants] = useState(INITIAL_RESTAURANTS);
  const [captains, setCaptains] = useState(INITIAL_CAPTAINS);
  const [supermarkets, setSupermarkets] = useState(INITIAL_SUPERMARKETS);
  const [jobSeekers, setJobSeekers] = useState(INITIAL_JOB_SEEKERS);
  const [jobVacancies, setJobVacancies] = useState(INITIAL_JOB_VACANCIES);
  const [doctors, setDoctors] = useState(INITIAL_DOCTORS);
  const [pharmacies, setPharmacies] = useState(INITIAL_PHARMACIES);
  const [govServices, setGovServices] = useState(INITIAL_GOV_SERVICES);

  const [shuffledRestaurants, setShuffledRestaurants] = useState(() => shuffleArray(INITIAL_RESTAURANTS));
  const [shuffledCaptains, setShuffledCaptains] = useState(() => shuffleArray(INITIAL_CAPTAINS));
  const [shuffledSupermarkets, setShuffledSupermarkets] = useState(() => shuffleArray(INITIAL_SUPERMARKETS));
  const [shuffledJobSeekers, setShuffledJobSeekers] = useState(() => shuffleArray(INITIAL_JOB_SEEKERS));
  const [shuffledJobVacancies, setShuffledJobVacancies] = useState(() => shuffleArray(INITIAL_JOB_VACANCIES));
  const [shuffledDoctors, setShuffledDoctors] = useState(() => shuffleArray(INITIAL_DOCTORS));
  const [shuffledPharmacies, setShuffledPharmacies] = useState(() => shuffleArray(INITIAL_PHARMACIES));
  const [shuffledGovServices, setShuffledGovServices] = useState(() => shuffleArray(INITIAL_GOV_SERVICES));

  const syncShuffledList = (shuffledList, updatedList) => {
    const updatedMap = new Map(updatedList.map(item => [String(item.id), item]));
    const shuffledMap = new Map(shuffledList.map(item => [String(item.id), item]));
    const result = shuffledList
      .filter(item => updatedMap.has(String(item.id)))
      .map(item => updatedMap.get(String(item.id)));
    const newItems = updatedList.filter(item => !shuffledMap.has(String(item.id)));
    return [...result, ...newItems];
  };

  useEffect(() => {
    setShuffledRestaurants(prev => syncShuffledList(prev, restaurants));
  }, [restaurants]);

  useEffect(() => {
    setShuffledCaptains(prev => syncShuffledList(prev, captains));
  }, [captains]);

  useEffect(() => {
    setShuffledSupermarkets(prev => syncShuffledList(prev, supermarkets));
  }, [supermarkets]);

  useEffect(() => {
    setShuffledJobSeekers(prev => syncShuffledList(prev, jobSeekers));
  }, [jobSeekers]);

  useEffect(() => {
    setShuffledJobVacancies(prev => syncShuffledList(prev, jobVacancies));
  }, [jobVacancies]);

  useEffect(() => {
    setShuffledDoctors(prev => syncShuffledList(prev, doctors));
  }, [doctors]);

  useEffect(() => {
    setShuffledPharmacies(prev => syncShuffledList(prev, pharmacies));
  }, [pharmacies]);

  useEffect(() => {
    setShuffledGovServices(prev => syncShuffledList(prev, govServices));
  }, [govServices]);

  const [activeJobSubTab, setActiveJobSubTab] = useState('seekers'); // 'seekers' | 'vacancies'
  const [selectedDoctorCategory, setSelectedDoctorCategory] = useState('surgery_urology');
  const [doctorCategories, setDoctorCategories] = useState(DOCTOR_CATEGORIES);
  const [showAddDoctorCategoryForm, setShowAddDoctorCategoryForm] = useState(false);
  const [editingDoctorCategory, setEditingDoctorCategory] = useState(null);
  const [doctorAdminSubTab, setDoctorAdminSubTab] = useState('doctors'); // 'doctors' | 'categories'
  const [activeGovSubTab, setActiveGovSubTab] = useState('civil'); // 'civil' | 'emergency'
  const [promoAlert, setPromoAlert] = useState(null); // { phone: string, countdown: number }
  
  const [isAdminPage, setIsAdminPage] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [activeAdminTab, setActiveAdminTab] = useState('stats');
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [activeStatsSubTab, setActiveStatsSubTab] = useState('general');
  const [sectionCalls, setSectionCalls] = useState({});
  const [activeCallsTab, setActiveCallsTab] = useState('restaurants');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setAdminSearchTerm('');
  }, [activeAdminTab]);
  // 
  
  // States for adding/editing forms in Admin Panel
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [editingCaptain, setEditingCaptain] = useState(null);
  const [showAddRestaurantForm, setShowAddRestaurantForm] = useState(false);
  const [showAddCaptainForm, setShowAddCaptainForm] = useState(false);
  const [editingSupermarket, setEditingSupermarket] = useState(null);
  const [showAddSupermarketForm, setShowAddSupermarketForm] = useState(false);
  const [editingJobSeeker, setEditingJobSeeker] = useState(null);
  const [showAddJobSeekerForm, setShowAddJobSeekerForm] = useState(false);
  const [editingJobVacancy, setEditingJobVacancy] = useState(null);
  const [showAddJobVacancyForm, setShowAddJobVacancyForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [showAddDoctorForm, setShowAddDoctorForm] = useState(false);
  const [editingPharmacy, setEditingPharmacy] = useState(null);
  const [showAddPharmacyForm, setShowAddPharmacyForm] = useState(false);
  const [editingGovService, setEditingGovService] = useState(null);
  const [showAddGovServiceForm, setShowAddGovServiceForm] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIOSInstallInstructions, setShowIOSInstallInstructions] = useState(false);
  const [showServicesArrow, setShowServicesArrow] = useState(true);
  const [showCategoriesArrow, setShowCategoriesArrow] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrShareCopied, setQrShareCopied] = useState(false);
  const [phoneModalData, setPhoneModalData] = useState(null);
  const [isCallsPage, setIsCallsPage] = useState(false);
  const [callsData, setCallsData] = useState({});
  const [visitsData, setVisitsData] = useState({});
  const [sortBy, setSortBy] = useState('total'); // total, today, yesterday, name
  const [callsSearchTerm, setCallsSearchTerm] = useState('');
  const [expandedCallsRestaurantId, setExpandedCallsRestaurantId] = useState(null);

  const handleShareQr = async () => {
    const shareData = {
      title: 'دليل مغاغة للمطاعم والخدمات 🍔🛒',
      text: 'تصفح جميع منيو مطاعم وخدمات مغاغة بسهولة عبر دليل مغاغة 📱✨',
      url: window.location.origin
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled or error:', err);
      }
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin);
      setQrShareCopied(true);
      setTimeout(() => setQrShareCopied(false), 2500);
    }
  };

  const handleNextImage = () => {
    if (selectedRestaurant && selectedRestaurant.menuImages && currentImageIndex < selectedRestaurant.menuImages.length - 1) {
      const nextIdx = currentImageIndex + 1;
      setCurrentImageIndex(nextIdx);
      setActiveMenuImage(resolveImage(selectedRestaurant.menuImages[nextIdx]));
      setZoomScale(1);
      setPanOffset({ x: 0, y: 0 });
    }
  };

  const handlePrevImage = () => {
    if (selectedRestaurant && selectedRestaurant.menuImages && currentImageIndex > 0) {
      const prevIdx = currentImageIndex - 1;
      setCurrentImageIndex(prevIdx);
      setActiveMenuImage(resolveImage(selectedRestaurant.menuImages[prevIdx]));
      setZoomScale(1);
      setPanOffset({ x: 0, y: 0 });
    }
  };

  const handleRecordRestaurantCall = (restaurantId) => {
    if (!restaurantId) return;
    const rIdStr = String(restaurantId);
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    const localDateTime = now.getFullYear() + '-' + 
      String(now.getMonth() + 1).padStart(2, '0') + '-' + 
      String(now.getDate()).padStart(2, '0') + ' ' + 
      String(now.getHours()).padStart(2, '0') + ':' + 
      String(now.getMinutes()).padStart(2, '0') + ':' + 
      String(now.getSeconds()).padStart(2, '0');

    const callsDbRef = ref(db, `restaurant_calls/${rIdStr}`);
    get(callsDbRef).then((snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : { total: 0, daily: {} };
      const currentTotal = data.total || 0;
      const currentDaily = (data.daily && data.daily[today]) || 0;
      
      set(ref(db, `restaurant_calls/${rIdStr}/total`), currentTotal + 1);
      set(ref(db, `restaurant_calls/${rIdStr}/daily/${today}`), currentDaily + 1);
      
      const logId = now.getTime();
      set(ref(db, `restaurant_calls/${rIdStr}/logs/${logId}`), localDateTime);
    }).catch((err) => console.error('Call tracking error:', err));
  };

  // Promo alert countdown timer and call initiation helper
  useEffect(() => {
    let timer;
    if (promoAlert && promoAlert.countdown > 0) {
      timer = setTimeout(() => {
        setPromoAlert(prev => {
          if (!prev) return null;
          if (prev.countdown <= 1) {
            window.location.href = `tel:${prev.phone}`;
            return null;
          }
          return { ...prev, countdown: prev.countdown - 1 };
        });
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [promoAlert]);

  const handleInitiateCall = (phoneNum, restaurant) => {
    if (restaurant && String(restaurant.id) === '999') {
      setPromoAlert({
        phone: phoneNum,
        countdown: 5
      });
      handleRecordRestaurantCall(restaurant.id);
    } else {
      if (restaurant) {
        handleRecordRestaurantCall(restaurant.id);
      }
      window.location.href = `tel:${phoneNum}`;
    }
  };

  // Dynamic SEO Meta Tags update depending on the selected tab
  useEffect(() => {
    const seoMap = {
      restaurants: {
        title: "منيو مغاغة - دليل مطاعم مغاغة وأرقام الدليفري 🍔",
        description: "منصتك المتكاملة لتصفح منيو، أسعار، تليفونات وعناوين جميع مطاعم مغاغة بنقرة واحدة! اطلب دليفري الآن بسهولة."
      },
      supermarket: {
        title: "دليل سوبر ماركت مغاغة - عناوين وأرقام التوصيل 🛒",
        description: "تصفح أرقام، فروع، وعروض أفضل المحلات والسوبر ماركت في مغاغة للتسوق والتوصيل المنزلي السريع."
      },
      jobs: {
        title: "وظائف مغاغة - دليل فرص العمل والوظائف الشاغرة 💼",
        description: "منصتك للتواصل المباشر بين الباحثين عن عمل وأصحاب الأعمال والمحلات في مركز مغاغة. أضف إعلانك مجاناً."
      },
      doctors: {
        title: "دليل أطباء مغاغة - عناوين وتليفونات عيادات مغاغة 👨‍⚕️",
        description: "دليل كامل لأشطر الأطباء والعيادات ومراكز التحاليل والآشعة بمختلف التخصصات في مركز مغاغة بالمنيا."
      },
      pharmacy: {
        title: "دليل صيدليات مغاغة - أرقام الصيدليات والعناوين 💊",
        description: "دليل كامل للصيدليات المتاحة والعاملة في مغاغة لتلبية احتياجاتك الدوائية على مدار الساعة."
      },
      gov: {
        title: "الدليل الحكومي والخدمي بمغاغة - أرقام ومواعيد المصالح 🏛️",
        description: "دليل أرقام، عناوين، ومواعيد المصالح الحكومية والخدمات والمرافق العامة والكهرباء والشرطة والطوارئ بمغاغة."
      },
      motorcycle: {
        title: "كباتن دليفري وتوصيل طلبات بمغاغة 🏍️",
        description: "تواصل مباشرة مع أسرع كباتن توصيل طلبات ومشاوير وسفر داخل مغاغة وضواحيها بأفضل الأسعار."
      }
    };

    const currentSeo = seoMap[activeMainTab] || seoMap.restaurants;
    
    // Update Title
    document.title = currentSeo.title;

    // Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', currentSeo.description);

    // Update Open Graph Tags (for Social Sharing on FB/WA)
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', currentSeo.title);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', currentSeo.description);
  }, [activeMainTab]);

  // Handle browser/hardware back button navigation for tabs
  useEffect(() => {
    // Replace initial state so it has a default tab
    if (window.history.state === null) {
      window.history.replaceState({ tab: 'restaurants' }, '');
    }

    const handlePopState = (event) => {
      if (event.state && event.state.tab) {
        setActiveMainTab(event.state.tab);
      } else {
        setActiveMainTab('restaurants');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    const recordVisit = async () => {
      try {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const visitsRef = ref(db, `site_visits/daily/${today}`);
        const snapshot = await get(visitsRef);
        const currentCount = snapshot.exists() ? (snapshot.val() || 0) : 0;
        await set(visitsRef, currentCount + 1);
      } catch (err) {
        console.error('Error recording visit:', err);
      }
    };
    recordVisit();
  }, []);

  useEffect(() => {
    const currentState = window.history.state;
    if (!currentState || currentState.tab !== activeMainTab) {
      window.history.pushState({ tab: activeMainTab }, '');
    }
  }, [activeMainTab]);

  useEffect(() => {
    if (isCallsPage || isAdminPage) {
      const dbCallsRef = ref(db, 'restaurant_calls');
      get(dbCallsRef).then((snapshot) => {
        if (snapshot.exists()) {
          setCallsData(snapshot.val());
        }
      }).catch(console.error);

      const dbVisitsRef = ref(db, 'site_visits');
      get(dbVisitsRef).then((snapshot) => {
        if (snapshot.exists()) {
          setVisitsData(snapshot.val() || {});
        }
      }).catch(console.error);
    }
  }, [isCallsPage, isAdminPage]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Check if iOS and not installed
  const isIOSDevice = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  };

  const isAppStandalone = () => {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  };

  const handleInstallApp = async () => {
    if (isIOSDevice()) {
      setShowIOSInstallInstructions(true);
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to PWA install: ${outcome}`);
    setDeferredPrompt(null);
  };

  useEffect(() => {
    // Load local ratings made by the user
    const savedUserRatings = localStorage.getItem('user_ratings');
    if (savedUserRatings) {
      try {
        setUserRatings(JSON.parse(savedUserRatings));
      } catch (e) {
        console.error(e);
      }
    }

    // Fetch global ratings from Firebase
    const ratingsRef = ref(db, 'ratings');
    get(ratingsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          setRatings(snapshot.val() || {});
        }
      })
      .catch((err) => console.error('Error loading ratings:', err));

    // Fetch global trips counts from Firebase
    const tripsRef = ref(db, 'trips');
    get(tripsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          setTripsCounts(snapshot.val() || {});
        }
      })
    // Fetch global calls counts from Firebase
    const callsRef = ref(db, 'calls');
    get(callsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          setSectionCalls(snapshot.val() || {});
        }
      })
      .catch((err) => console.error('Error loading section calls:', err));

    // Helper to normalize snapshot to array
    const normalizeData = (data) => {
      if (!data) return [];
      return Array.isArray(data) ? data.filter(Boolean) : Object.values(data).filter(Boolean);
    };

    // Fetch and seed Restaurants
    const dbRestaurantsRef = ref(db, 'restaurants');
    get(dbRestaurantsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const fetched = normalizeData(snapshot.val());
          const existingIds = new Set(fetched.map(item => String(item.id)));
          const missing = INITIAL_RESTAURANTS.filter(item => !existingIds.has(String(item.id)));
          const merged = [...fetched, ...missing];
          setRestaurants(merged);
          setShuffledRestaurants(shuffleArray(merged));
          if (missing.length > 0) {
            set(dbRestaurantsRef, merged);
          }
        } else {
          set(dbRestaurantsRef, INITIAL_RESTAURANTS);
          setRestaurants(INITIAL_RESTAURANTS);
          setShuffledRestaurants(shuffleArray(INITIAL_RESTAURANTS));
        }
      })
      .catch((err) => {
        console.error('Error loading restaurants:', err);
        setRestaurants(INITIAL_RESTAURANTS);
        setShuffledRestaurants(shuffleArray(INITIAL_RESTAURANTS));
      });

    // Fetch and seed Captains
    const dbCaptainsRef = ref(db, 'captains');
    get(dbCaptainsRef).then((snapshot) => {
      if (snapshot.exists()) {
        const fetched = normalizeData(snapshot.val());
        const existingIds = new Set(fetched.map(item => String(item.id)));
        const missing = INITIAL_CAPTAINS.filter(item => !existingIds.has(String(item.id)));
        const merged = [...fetched, ...missing];
        setCaptains(merged);
        setShuffledCaptains(shuffleArray(merged));
        if (missing.length > 0) set(dbCaptainsRef, merged);
      } else {
        set(dbCaptainsRef, INITIAL_CAPTAINS);
        setCaptains(INITIAL_CAPTAINS);
        setShuffledCaptains(shuffleArray(INITIAL_CAPTAINS));
      }
    }).catch((err) => {
      console.error('Error loading captains:', err);
      setCaptains(INITIAL_CAPTAINS);
      setShuffledCaptains(shuffleArray(INITIAL_CAPTAINS));
    });

    // Fetch and seed Supermarkets
    const dbSupermarketsRef = ref(db, 'supermarkets');
    get(dbSupermarketsRef).then((snapshot) => {
      if (snapshot.exists()) {
        const fetched = normalizeData(snapshot.val());
        const existingIds = new Set(fetched.map(item => String(item.id)));
        const missing = INITIAL_SUPERMARKETS.filter(item => !existingIds.has(String(item.id)));
        const merged = [...fetched, ...missing];
        setSupermarkets(merged);
        setShuffledSupermarkets(shuffleArray(merged));
        if (missing.length > 0) set(dbSupermarketsRef, merged);
      } else {
        set(dbSupermarketsRef, INITIAL_SUPERMARKETS);
        setSupermarkets(INITIAL_SUPERMARKETS);
        setShuffledSupermarkets(shuffleArray(INITIAL_SUPERMARKETS));
      }
    }).catch((err) => {
      console.error('Error loading supermarkets:', err);
      setSupermarkets(INITIAL_SUPERMARKETS);
      setShuffledSupermarkets(shuffleArray(INITIAL_SUPERMARKETS));
    });

    // Fetch and seed Job Seekers
    const dbJobSeekersRef = ref(db, 'job_seekers');
    get(dbJobSeekersRef).then((snapshot) => {
      if (snapshot.exists()) {
        const fetched = normalizeData(snapshot.val());
        const existingIds = new Set(fetched.map(item => String(item.id)));
        const missing = INITIAL_JOB_SEEKERS.filter(item => !existingIds.has(String(item.id)));
        const merged = [...fetched, ...missing];
        setJobSeekers(merged);
        setShuffledJobSeekers(shuffleArray(merged));
        if (missing.length > 0) set(dbJobSeekersRef, merged);
      } else {
        set(dbJobSeekersRef, INITIAL_JOB_SEEKERS);
        setJobSeekers(INITIAL_JOB_SEEKERS);
        setShuffledJobSeekers(shuffleArray(INITIAL_JOB_SEEKERS));
      }
    }).catch((err) => {
      console.error('Error loading job seekers:', err);
      setJobSeekers(INITIAL_JOB_SEEKERS);
      setShuffledJobSeekers(shuffleArray(INITIAL_JOB_SEEKERS));
    });

    // Fetch and seed Job Vacancies
    const dbJobVacanciesRef = ref(db, 'job_vacancies');
    get(dbJobVacanciesRef).then((snapshot) => {
      if (snapshot.exists()) {
        const fetched = normalizeData(snapshot.val());
        const existingIds = new Set(fetched.map(item => String(item.id)));
        const missing = INITIAL_JOB_VACANCIES.filter(item => !existingIds.has(String(item.id)));
        const merged = [...fetched, ...missing];
        setJobVacancies(merged);
        setShuffledJobVacancies(shuffleArray(merged));
        if (missing.length > 0) set(dbJobVacanciesRef, merged);
      } else {
        set(dbJobVacanciesRef, INITIAL_JOB_VACANCIES);
        setJobVacancies(INITIAL_JOB_VACANCIES);
        setShuffledJobVacancies(shuffleArray(INITIAL_JOB_VACANCIES));
      }
    }).catch((err) => {
      console.error('Error loading job vacancies:', err);
      setJobVacancies(INITIAL_JOB_VACANCIES);
      setShuffledJobVacancies(shuffleArray(INITIAL_JOB_VACANCIES));
    });

    // Fetch and seed Doctors
    const dbDoctorsRef = ref(db, 'doctors');
    get(dbDoctorsRef).then((snapshot) => {
      if (snapshot.exists()) {
        const fetched = normalizeData(snapshot.val());
        const existingIds = new Set(fetched.map(item => String(item.id)));
        const missing = INITIAL_DOCTORS.filter(item => !existingIds.has(String(item.id)));
        const merged = [...fetched, ...missing];
        setDoctors(merged);
        setShuffledDoctors(shuffleArray(merged));
        if (missing.length > 0) set(dbDoctorsRef, merged);
      } else {
        set(dbDoctorsRef, INITIAL_DOCTORS);
        setDoctors(INITIAL_DOCTORS);
        setShuffledDoctors(shuffleArray(INITIAL_DOCTORS));
      }
    }).catch((err) => {
      console.error('Error loading doctors:', err);
      setDoctors(INITIAL_DOCTORS);
      setShuffledDoctors(shuffleArray(INITIAL_DOCTORS));
    });
    // Fetch and seed Doctor Categories
    const dbDoctorCategoriesRef = ref(db, 'doctor_categories');
    get(dbDoctorCategoriesRef).then((snapshot) => {
      if (snapshot.exists()) {
        const fetched = normalizeData(snapshot.val());
        const existingIds = new Set(fetched.map(item => String(item.id)));
        const missing = DOCTOR_CATEGORIES.filter(item => !existingIds.has(String(item.id)));
        const merged = [...fetched, ...missing];
        setDoctorCategories(merged);
        if (missing.length > 0) set(dbDoctorCategoriesRef, merged);
      } else {
        set(dbDoctorCategoriesRef, DOCTOR_CATEGORIES);
        setDoctorCategories(DOCTOR_CATEGORIES);
      }
    }).catch((err) => {
      console.error('Error loading doctor categories:', err);
      setDoctorCategories(DOCTOR_CATEGORIES);
    });
    // Fetch and seed Pharmacies
    const dbPharmaciesRef = ref(db, 'pharmacies');
    get(dbPharmaciesRef).then((snapshot) => {
      if (snapshot.exists()) {
        const fetched = normalizeData(snapshot.val());
        const existingIds = new Set(fetched.map(item => String(item.id)));
        const missing = INITIAL_PHARMACIES.filter(item => !existingIds.has(String(item.id)));
        const merged = [...fetched, ...missing];
        setPharmacies(merged);
        setShuffledPharmacies(shuffleArray(merged));
        if (missing.length > 0) set(dbPharmaciesRef, merged);
      } else {
        set(dbPharmaciesRef, INITIAL_PHARMACIES);
        setPharmacies(INITIAL_PHARMACIES);
        setShuffledPharmacies(shuffleArray(INITIAL_PHARMACIES));
      }
    }).catch((err) => {
      console.error('Error loading pharmacies:', err);
      setPharmacies(INITIAL_PHARMACIES);
      setShuffledPharmacies(shuffleArray(INITIAL_PHARMACIES));
    });

    // Fetch and seed Government Services
    const dbGovServicesRef = ref(db, 'gov_services');
    get(dbGovServicesRef).then((snapshot) => {
      if (snapshot.exists()) {
        const fetched = normalizeData(snapshot.val());
        const existingIds = new Set(fetched.map(item => String(item.id)));
        const missing = INITIAL_GOV_SERVICES.filter(item => !existingIds.has(String(item.id)));
        const merged = [...fetched, ...missing];
        setGovServices(merged);
        setShuffledGovServices(shuffleArray(merged));
        if (missing.length > 0) set(dbGovServicesRef, merged);
      } else {
        set(dbGovServicesRef, INITIAL_GOV_SERVICES);
        setGovServices(INITIAL_GOV_SERVICES);
        setShuffledGovServices(shuffleArray(INITIAL_GOV_SERVICES));
      }
    }).catch((err) => {
      console.error('Error loading gov services:', err);
      setGovServices(INITIAL_GOV_SERVICES);
      setShuffledGovServices(shuffleArray(INITIAL_GOV_SERVICES));
    });

    // Parse Deep Link URL ID and page parameter on mount (using seed data for instant synchronous matching)
    const params = new URLSearchParams(window.location.search);
    
    const pageParam = params.get('page');
    if (pageParam === 'admin') {
      setIsAdminPage(true);
      const isAuth = sessionStorage.getItem('admin_logged_in');
      if (isAuth === 'true') {
        setIsAdminLoggedIn(true);
      }
    } else if (pageParam === 'calls' || window.location.pathname === '/calls') {
      setIsCallsPage(true);
    }

    const idParam = params.get('id');
    if (idParam) {
      const foundRestaurant = INITIAL_RESTAURANTS.find(r => String(r.id) === idParam);
      if (foundRestaurant) {
        setSelectedRestaurant(foundRestaurant);
        setActiveMainTab('restaurants');
      } else {
        const foundCaptain = INITIAL_CAPTAINS.find(c => String(c.id) === idParam);
        if (foundCaptain) {
          setSelectedRestaurant(foundCaptain);
          setActiveMainTab('motorcycle');
        }
      }
    }
  }, []);

  // Unified History popstate handling for closing drawer and lightbox on back button
  useEffect(() => {
    const handlePopState = (event) => {
      const state = event.state;
      if (!state || !state.lightboxOpen) {
        setActiveMenuImage(null);
      }
      if (!state || !state.drawerOpen) {
        setSelectedRestaurant(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Handle pushing state for selectedRestaurant
  useEffect(() => {
    if (selectedRestaurant) {
      const hasState = window.history.state && window.history.state.drawerOpen;
      if (!hasState) {
        window.history.pushState({ drawerOpen: true }, '');
      }
    } else {
      if (window.history.state && window.history.state.drawerOpen) {
        window.history.back();
      }
    }
  }, [selectedRestaurant]);

  // Handle pushing state for activeMenuImage
  useEffect(() => {
    if (activeMenuImage) {
      const hasState = window.history.state && window.history.state.lightboxOpen;
      if (!hasState) {
        window.history.pushState({ lightboxOpen: true }, '');
      }
    } else {
      if (window.history.state && window.history.state.lightboxOpen) {
        window.history.back();
      }
    }
  }, [activeMenuImage]);

  // Body Scroll Lock when modal/drawer/lightbox is open
  useEffect(() => {
    if (selectedRestaurant || activeMenuImage || phoneSelectorList) {
      document.body.classList.add('body-scroll-lock');
    } else {
      document.body.classList.remove('body-scroll-lock');
    }
    return () => {
      document.body.classList.remove('body-scroll-lock');
    };
  }, [selectedRestaurant, activeMenuImage, phoneSelectorList]);

  const [showBottomWhatsApp, setShowBottomWhatsApp] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // If a restaurant detail drawer or lightbox/image viewer is active, don't show the WhatsApp floating button
      if (selectedRestaurant || activeMenuImage) {
        setShowBottomWhatsApp(false);
        return;
      }

      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      // Show only when scrolled down more than 100px AND near the bottom or page is short
      const isScrolledDown = scrollTop > 100;
      const isNearBottom = documentHeight - windowHeight <= 100 || documentHeight - (scrollTop + windowHeight) < 180;

      if (isScrolledDown && isNearBottom) {
        setShowBottomWhatsApp(true);
      } else {
        setShowBottomWhatsApp(false);
      }
    };

    // Run once on mount/render to check page height
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [activeMainTab, selectedRestaurant, activeMenuImage]); // re-run listener check when dependencies change

  const handleRate = async (restaurantId, ratingValue) => {
    if (userRatings[restaurantId] || isRatingSubmitting) return;
    setIsRatingSubmitting(true);
    
    setRatingAnimationState({
      restaurantId,
      clickedStar: ratingValue,
      step: 'clicked'
    });

    try {
      // Get latest ratings from Firebase to ensure concurrency safety
      const ratingsRef = ref(db, 'ratings');
      const snapshot = await get(ratingsRef);
      let currentRatings = {};
      if (snapshot.exists()) {
        currentRatings = snapshot.val() || {};
      }

      const currentRestaurantRating = currentRatings[restaurantId] || { sum: 0, count: 0 };
      const updatedRestaurantRating = {
        sum: currentRestaurantRating.sum + ratingValue,
        count: currentRestaurantRating.count + 1
      };

      const newRatings = {
        ...currentRatings,
        [restaurantId]: updatedRestaurantRating
      };

      // Save to Firebase
      await set(ratingsRef, newRatings);

      // Update local state
      setRatings(newRatings);
      const newUserRatings = {
        ...userRatings,
        [restaurantId]: ratingValue
      };
      setUserRatings(newUserRatings);
      localStorage.setItem('user_ratings', JSON.stringify(newUserRatings));

      // Transition to showing previous stars after 3 seconds
      setTimeout(() => {
        setRatingAnimationState(prev => {
          if (prev && prev.restaurantId === restaurantId) {
            return { ...prev, step: 'completed' };
          }
          return prev;
        });
      }, 3000);
    } catch (error) {
      console.error('Error saving rating:', error);
      setRatingAnimationState(null);
    } finally {
      setIsRatingSubmitting(false);
    }
  };

  const handleIncrementTrips = async (captainId) => {
    try {
      const tripsRef = ref(db, `trips/${captainId}`);
      const snapshot = await get(tripsRef);
      const currentCount = snapshot.exists() ? (snapshot.val() || 0) : 0;
      const newCount = currentCount + 1;
      await set(tripsRef, newCount);
      
      setTripsCounts(prev => ({
        ...prev,
        [captainId]: newCount
      }));
    } catch (error) {
      console.error('Error incrementing trips:', error);
    }
  };

  const handleIncrementCall = async (category, itemId) => {
    if (!category || !itemId) return;
    try {
      const callRef = ref(db, `calls/${category}/${itemId}`);
      const snapshot = await get(callRef);
      const count = snapshot.exists() ? (snapshot.val() || 0) : 0;
      const newCount = count + 1;
      await set(callRef, newCount);
      
      setSectionCalls(prev => ({
        ...prev,
        [category]: {
          ...(prev[category] || {}),
          [itemId]: newCount
        }
      }));
    } catch (e) {
      console.error('Error incrementing calls:', e);
    }
  };

  const handleShare = (itemId) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${itemId}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => console.error('Failed to copy link:', err));
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPasscode === 'MaghaghaAdmin2026') {
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('admin_logged_in', 'true');
      setAdminLoginError('');
    } else {
      setAdminLoginError('كلمة المرور غير صحيحة ❌');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('admin_logged_in');
  };

  const handleBackToHome = () => {
    window.history.pushState({}, '', window.location.pathname);
    setIsAdminPage(false);
  };

  const handleAddRestaurant = async (newRes) => {
    try {
      const updatedList = [...restaurants, { ...newRes, id: Date.now() }];
      await set(ref(db, 'restaurants'), updatedList);
      setRestaurants(updatedList);
      setShowAddRestaurantForm(false);
      alert('تمت إضافة المطعم بنجاح! 🎉');
    } catch (error) {
      console.error('Error adding restaurant:', error);
      alert('حدث خطأ أثناء إضافة المطعم: ' + error.message);
    }
  };

  const handleEditRestaurant = async (updatedRes) => {
    try {
      const updatedList = restaurants.map(r => r.id === updatedRes.id ? updatedRes : r);
      await set(ref(db, 'restaurants'), updatedList);
      setRestaurants(updatedList);
      setEditingRestaurant(null);
      alert('تم تعديل المطعم بنجاح! 🎉');
    } catch (error) {
      console.error('Error editing restaurant:', error);
      alert('حدث خطأ أثناء تعديل المطعم: ' + error.message);
    }
  };

  const handleDeleteRestaurant = async (resId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المطعم نهائياً؟')) {
      try {
        const updatedList = restaurants.filter(r => r.id !== resId);
        await set(ref(db, 'restaurants'), updatedList);
        setRestaurants(updatedList);
        alert('تم حذف المطعم بنجاح! 🗑️');
      } catch (error) {
        console.error('Error deleting restaurant:', error);
        alert('حدث خطأ أثناء حذف المطعم: ' + error.message);
      }
    }
  };

  const handleAddCaptain = async (newCap) => {
    try {
      const updatedList = [...captains, { ...newCap, id: `captain_${Date.now()}` }];
      await set(ref(db, 'captains'), updatedList);
      setCaptains(updatedList);
      setShowAddCaptainForm(false);
      alert('تمت إضافة الكابتن بنجاح! 🎉');
    } catch (error) {
      console.error('Error adding captain:', error);
      alert('حدث خطأ أثناء إضافة الكابتن: ' + error.message);
    }
  };

  const handleEditCaptain = async (updatedCap) => {
    try {
      const updatedList = captains.map(c => c.id === updatedCap.id ? updatedCap : c);
      await set(ref(db, 'captains'), updatedList);
      setCaptains(updatedList);
      setEditingCaptain(null);
      alert('تم تعديل بيانات الكابتن بنجاح! 🎉');
    } catch (error) {
      console.error('Error editing captain:', error);
      alert('حدث خطأ أثناء تعديل بيانات الكابتن: ' + error.message);
    }
  };

  const handleDeleteCaptain = async (capId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الكابتن نهائياً؟')) {
      try {
        const updatedList = captains.filter(c => c.id !== capId);
        await set(ref(db, 'captains'), updatedList);
        setCaptains(updatedList);
        alert('تم حذف الكابتن بنجاح! 🗑️');
      } catch (error) {
        console.error('Error deleting captain:', error);
        alert('حدث خطأ أثناء حذف الكابتن: ' + error.message);
      }
    }
  };

  const handleAddSupermarket = async (newSup) => {
    try {
      const updatedList = [...supermarkets, { ...newSup, id: Date.now() }];
      await set(ref(db, 'supermarkets'), updatedList);
      setSupermarkets(updatedList);
      setShowAddSupermarketForm(false);
      alert('تمت إضافة المحل بنجاح! 🎉');
    } catch (error) {
      console.error('Error adding supermarket:', error);
      alert('حدث خطأ أثناء إضافة المحل: ' + error.message);
    }
  };

  const handleEditSupermarket = async (updatedSup) => {
    try {
      const updatedList = supermarkets.map(s => s.id === updatedSup.id ? updatedSup : s);
      await set(ref(db, 'supermarkets'), updatedList);
      setSupermarkets(updatedList);
      setEditingSupermarket(null);
      alert('تم تعديل المحل بنجاح! 🎉');
    } catch (error) {
      console.error('Error editing supermarket:', error);
      alert('حدث خطأ أثناء تعديل المحل: ' + error.message);
    }
  };

  const handleDeleteSupermarket = async (supId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السوبرماركت نهائياً؟')) {
      try {
        const updatedList = supermarkets.filter(s => s.id !== supId);
        await set(ref(db, 'supermarkets'), updatedList);
        setSupermarkets(updatedList);
        alert('تم حذف المحل بنجاح! 🗑️');
      } catch (error) {
        console.error('Error deleting supermarket:', error);
        alert('حدث خطأ أثناء حذف المحل: ' + error.message);
      }
    }
  };

  const handleAddJobSeeker = async (newSeeker) => {
    try {
      const updatedList = [...jobSeekers, { ...newSeeker, id: `seeker_${Date.now()}` }];
      await set(ref(db, 'job_seekers'), updatedList);
      setJobSeekers(updatedList);
      setShowAddJobSeekerForm(false);
      alert('تم تسجيل الباحث عن عمل بنجاح! 🎉');
    } catch (error) {
      console.error('Error adding job seeker:', error);
      alert('حدث خطأ أثناء التسجيل: ' + error.message);
    }
  };

  const handleEditJobSeeker = async (updatedSeeker) => {
    try {
      const updatedList = jobSeekers.map(s => s.id === updatedSeeker.id ? updatedSeeker : s);
      await set(ref(db, 'job_seekers'), updatedList);
      setJobSeekers(updatedList);
      setEditingJobSeeker(null);
      alert('تم تعديل بيانات الباحث عن عمل بنجاح! 🎉');
    } catch (error) {
      console.error('Error editing job seeker:', error);
      alert('حدث خطأ أثناء التعديل: ' + error.message);
    }
  };

  const handleDeleteJobSeeker = async (seekerId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الباحث عن عمل نهائياً؟')) {
      try {
        const updatedList = jobSeekers.filter(s => s.id !== seekerId);
        await set(ref(db, 'job_seekers'), updatedList);
        setJobSeekers(updatedList);
        alert('تم الحذف بنجاح! 🗑️');
      } catch (error) {
        console.error('Error deleting job seeker:', error);
        alert('حدث خطأ أثناء الحذف: ' + error.message);
      }
    }
  };

  const handleAddJobVacancy = async (newVacancy) => {
    try {
      const updatedList = [...jobVacancies, { ...newVacancy, id: `vacancy_${Date.now()}` }];
      await set(ref(db, 'job_vacancies'), updatedList);
      setJobVacancies(updatedList);
      setShowAddJobVacancyForm(false);
      alert('تمت إضافة الوظيفة بنجاح! 🎉');
    } catch (error) {
      console.error('Error adding job vacancy:', error);
      alert('حدث خطأ أثناء إضافة الوظيفة: ' + error.message);
    }
  };

  const handleEditJobVacancy = async (updatedVacancy) => {
    try {
      const updatedList = jobVacancies.map(v => v.id === updatedVacancy.id ? updatedVacancy : v);
      await set(ref(db, 'job_vacancies'), updatedList);
      setJobVacancies(updatedList);
      setEditingJobVacancy(null);
      alert('تم تعديل الوظيفة بنجاح! 🎉');
    } catch (error) {
      console.error('Error editing job vacancy:', error);
      alert('حدث خطأ أثناء تعديل الوظيفة: ' + error.message);
    }
  };

  const handleDeleteJobVacancy = async (vacancyId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الوظيفة الشاغرة نهائياً؟')) {
      try {
        const updatedList = jobVacancies.filter(v => v.id !== vacancyId);
        await set(ref(db, 'job_vacancies'), updatedList);
        setJobVacancies(updatedList);
        alert('تم حذف الوظيفة بنجاح! 🗑️');
      } catch (error) {
        console.error('Error deleting job vacancy:', error);
        alert('حدث خطأ أثناء حذف الوظيفة: ' + error.message);
      }
    }
  };

  const handleAddDoctor = async (newDoc) => {
    try {
      const updatedList = [...doctors, { ...newDoc, id: `doc_${Date.now()}` }];
      await set(ref(db, 'doctors'), updatedList);
      setDoctors(updatedList);
      setShowAddDoctorForm(false);
      alert('تمت إضافة الطبيب بنجاح! 🎉');
    } catch (error) {
      console.error('Error adding doctor:', error);
      alert('حدث خطأ أثناء إضافة الطبيب: ' + error.message);
    }
  };

  const handleEditDoctor = async (updatedDoc) => {
    try {
      const updatedList = doctors.map(d => d.id === updatedDoc.id ? updatedDoc : d);
      await set(ref(db, 'doctors'), updatedList);
      setDoctors(updatedList);
      setEditingDoctor(null);
      alert('تم تعديل بيانات الطبيب بنجاح! 🎉');
    } catch (error) {
      console.error('Error editing doctor:', error);
      alert('حدث خطأ أثناء تعديل بيانات الطبيب: ' + error.message);
    }
  };

  const handleDeleteDoctor = async (docId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطبيب نهائياً؟')) {
      try {
        const updatedList = doctors.filter(d => d.id !== docId);
        await set(ref(db, 'doctors'), updatedList);
        setDoctors(updatedList);
        alert('تم حذف الطبيب بنجاح! 🗑️');
      } catch (error) {
        console.error('Error deleting doctor:', error);
        alert('حدث خطأ أثناء حذف الطبيب: ' + error.message);
      }
    }
  };

  const handleToggleDoctorFeatured = async (docId) => {
    try {
      const updatedList = doctors.map(d => {
        if (d.id === docId) {
          return { ...d, isFeatured: !d.isFeatured };
        }
        return d;
      });
      await set(ref(db, 'doctors'), updatedList);
      setDoctors(updatedList);
      alert('تم تعديل حالة التمييز بنجاح! 🌟');
    } catch (error) {
      console.error('Error toggling doctor featured state:', error);
      alert('حدث خطأ أثناء تعديل حالة التمييز: ' + error.message);
    }
  };

  const handleAddDoctorCategory = async (newCat) => {
    try {
      const updatedList = [...doctorCategories, newCat];
      await set(ref(db, 'doctor_categories'), updatedList);
      setDoctorCategories(updatedList);
      setShowAddDoctorCategoryForm(false);
      alert('تمت إضافة التخصص بنجاح! 🎉');
    } catch (error) {
      console.error('Error adding doctor category:', error);
      alert('حدث خطأ أثناء إضافة التخصص: ' + error.message);
    }
  };

  const handleEditDoctorCategory = async (updatedCat) => {
    try {
      const updatedList = doctorCategories.map(c => c.id === updatedCat.id ? updatedCat : c);
      await set(ref(db, 'doctor_categories'), updatedList);
      setDoctorCategories(updatedList);
      setEditingDoctorCategory(null);
      alert('تم تعديل التخصص بنجاح! 🎉');
    } catch (error) {
      console.error('Error editing doctor category:', error);
      alert('حدث خطأ أثناء تعديل التخصص: ' + error.message);
    }
  };

  const handleDeleteDoctorCategory = async (catId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التخصص نهائياً؟ تنبيه: لن يتم حذف الأطباء المسجلين تحت هذا التخصص تلقائياً.')) {
      try {
        const updatedList = doctorCategories.filter(c => c.id !== catId);
        await set(ref(db, 'doctor_categories'), updatedList);
        setDoctorCategories(updatedList);
        alert('تم حذف التخصص بنجاح! 🗑️');
      } catch (error) {
        console.error('Error deleting doctor category:', error);
        alert('حدث خطأ أثناء حذف التخصص: ' + error.message);
      }
    }
  };

  const handleAddPharmacy = async (newPharm) => {
    try {
      const updatedList = [...pharmacies, { ...newPharm, id: `pharm_${Date.now()}` }];
      await set(ref(db, 'pharmacies'), updatedList);
      setPharmacies(updatedList);
      setShowAddPharmacyForm(false);
      alert('تمت إضافة الصيدلية بنجاح! 🎉');
    } catch (error) {
      console.error('Error adding pharmacy:', error);
      alert('حدث خطأ أثناء إضافة الصيدلية: ' + error.message);
    }
  };

  const handleEditPharmacy = async (updatedPharm) => {
    try {
      const updatedList = pharmacies.map(p => p.id === updatedPharm.id ? updatedPharm : p);
      await set(ref(db, 'pharmacies'), updatedList);
      setPharmacies(updatedList);
      setEditingPharmacy(null);
      alert('تم تعديل بيانات الصيدلية بنجاح! 🎉');
    } catch (error) {
      console.error('Error editing pharmacy:', error);
      alert('حدث خطأ أثناء تعديل بيانات الصيدلية: ' + error.message);
    }
  };

  const handleDeletePharmacy = async (pharmId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الصيدلية نهائياً؟')) {
      try {
        const updatedList = pharmacies.filter(p => p.id !== pharmId);
        await set(ref(db, 'pharmacies'), updatedList);
        setPharmacies(updatedList);
        alert('تم حذف الصيدلية بنجاح! 🗑️');
      } catch (error) {
        console.error('Error deleting pharmacy:', error);
        alert('حدث خطأ أثناء حذف الصيدلية: ' + error.message);
      }
    }
  };

  const handleAddGovService = async (newSrv) => {
    try {
      const updatedList = [...govServices, { ...newSrv, id: `gov_${Date.now()}` }];
      await set(ref(db, 'gov_services'), updatedList);
      setGovServices(updatedList);
      setShowAddGovServiceForm(false);
      alert('تمت إضافة الخدمة بنجاح! 🎉');
    } catch (error) {
      console.error('Error adding gov service:', error);
      alert('حدث خطأ أثناء إضافة الخدمة: ' + error.message);
    }
  };

  const handleEditGovService = async (updatedSrv) => {
    try {
      const updatedList = govServices.map(s => s.id === updatedSrv.id ? updatedSrv : s);
      await set(ref(db, 'gov_services'), updatedList);
      setGovServices(updatedList);
      setEditingGovService(null);
      alert('تم تعديل الخدمة بنجاح! 🎉');
    } catch (error) {
      console.error('Error editing gov service:', error);
      alert('حدث خطأ أثناء تعديل الخدمة: ' + error.message);
    }
  };

  const handleDeleteGovService = async (srvId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الخدمة نهائياً؟')) {
      try {
        const updatedList = govServices.filter(s => s.id !== srvId);
        await set(ref(db, 'gov_services'), updatedList);
        setGovServices(updatedList);
        alert('تم حذف الخدمة بنجاح! 🗑️');
      } catch (error) {
        console.error('Error deleting gov service:', error);
        alert('حدث خطأ أثناء حذف الخدمة: ' + error.message);
      }
    }
  };

  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme;
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadePreloader(true);
    }, 3400);

    const removeTimer = setTimeout(() => {
      setShowPreloader(false);
    }, 4000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const filteredRestaurants = shuffledRestaurants.filter(restaurant => {
    const matchesCategory = selectedCategory === 'all' || restaurant.category === selectedCategory;
    const matchesSearch = 
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.popularItems.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const renderCategoryIcon = (iconClass) => {
    return <i className={`fa-solid ${iconClass}`}></i>;
  };

  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => {
    setZoomScale(prev => {
      const nextScale = Math.max(prev - 0.25, 0.75);
      if (nextScale === 1) setPanOffset({ x: 0, y: 0 });
      return nextScale;
    });
  };
  const handleZoomReset = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Dragging / Panning handlers
  const handleDragStart = (clientX, clientY) => {
    if (zoomScale > 1) {
      setIsDragging(true);
      setDragStart({ x: clientX - panOffset.x, y: clientY - panOffset.y });
    }
  };

  const handleDragMove = (clientX, clientY) => {
    if (isDragging && zoomScale > 1) {
      setPanOffset({
        x: clientX - dragStart.x,
        y: clientY - dragStart.y
      });
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  if (isAdminPage) {
    if (!isAdminLoggedIn) {
      return (
        <div style={{ direction: 'rtl', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          {/* Login Screen */}
          <div style={{ maxWidth: '400px', width: '100%', padding: '32px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
            <img src={logo} alt="Logo" style={{ height: '70px', marginBottom: '16px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>تسجيل دخول الإدارة</h2>
            <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input 
                type="password" 
                placeholder="أدخل كلمة مرور المسؤول..." 
                value={adminPasscode}
                onChange={(e) => setAdminPasscode(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', textAlign: 'center' }}
                required
              />
              {adminLoginError && <p style={{ color: 'var(--status-closed)', fontSize: '14px', margin: 0 }}>{adminLoginError}</p>}
              <button type="submit" className="theme-toggle-btn" style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: 'none', backgroundColor: 'var(--accent-color)', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                دخول لوحة التحكم
              </button>
            </form>
          </div>
        </div>
      );
    }

    return (
      <div className="admin-layout-container">
        {/* Mobile Header */}
        <div className="admin-mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '20px', cursor: 'pointer' }}
            >
              <i className="fa-solid fa-bars"></i>
            </button>
            <h1 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>لوحة التحكم</h1>
          </div>
          <img src={logoTow} alt="Logo" style={{ height: '32px' }} />
        </div>

        {/* Sidebar Overlay for Mobile */}
        <div 
          className={`admin-sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
          onClick={() => setIsSidebarOpen(false)}
        />

        {/* Right Sidebar */}
        <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="admin-sidebar-header">
            <img src={logoTow} alt="Logo" style={{ height: '35px' }} />
            <h1 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>تحكم دليل مغاغة</h1>
          </div>

          <nav className="admin-sidebar-menu">
            <button 
              className={`admin-sidebar-item ${activeAdminTab === 'stats' ? 'active' : ''}`}
              onClick={() => { setActiveAdminTab('stats'); setEditingRestaurant(null); setEditingCaptain(null); setShowAddRestaurantForm(false); setShowAddCaptainForm(false); setIsSidebarOpen(false); }}
            >
              <i className="fa-solid fa-chart-line"></i>
              <span>📊 الإحصائيات العامة</span>
            </button>

            <button 
              className={`admin-sidebar-item ${activeAdminTab === 'restaurants' ? 'active' : ''}`}
              onClick={() => { setActiveAdminTab('restaurants'); setEditingRestaurant(null); setShowAddRestaurantForm(false); setIsSidebarOpen(false); }}
            >
              <i className="fa-solid fa-utensils"></i>
              <span>🍔 إدارة المطاعم</span>
            </button>

            <button 
              className={`admin-sidebar-item ${activeAdminTab === 'captains' ? 'active' : ''}`}
              onClick={() => { setActiveAdminTab('captains'); setEditingCaptain(null); setShowAddCaptainForm(false); setIsSidebarOpen(false); }}
            >
              <i className="fa-solid fa-motorcycle"></i>
              <span>🏍️ إدارة الكباتن</span>
            </button>

            {/* Admin control sections */}
            <div style={{ margin: '12px 0 6px', padding: '0 16px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>باقي الأقسام:</div>
            
            <button 
              className={`admin-sidebar-item ${activeAdminTab === 'supermarket' ? 'active' : ''}`}
              onClick={() => { setActiveAdminTab('supermarket'); setIsSidebarOpen(false); }}
            >
              <i className="fa-solid fa-store"></i>
              <span>🛒 إدارة السوبرماركت</span>
            </button>

            <button 
              className={`admin-sidebar-item ${activeAdminTab === 'jobs' ? 'active' : ''}`}
              onClick={() => { setActiveAdminTab('jobs'); setIsSidebarOpen(false); }}
            >
              <i className="fa-solid fa-briefcase"></i>
              <span>💼 إدارة الوظائف</span>
            </button>

            <button 
              className={`admin-sidebar-item ${activeAdminTab === 'doctors' ? 'active' : ''}`}
              onClick={() => { setActiveAdminTab('doctors'); setIsSidebarOpen(false); }}
            >
              <i className="fa-solid fa-user-doctor"></i>
              <span>🩺 إدارة الأطباء</span>
            </button>

            <button 
              className={`admin-sidebar-item ${activeAdminTab === 'pharmacies' ? 'active' : ''}`}
              onClick={() => { setActiveAdminTab('pharmacies'); setIsSidebarOpen(false); }}
            >
              <i className="fa-solid fa-pills"></i>
              <span>💊 إدارة الصيدليات</span>
            </button>

            <button 
              className={`admin-sidebar-item ${activeAdminTab === 'gov_services' ? 'active' : ''}`}
              onClick={() => { setActiveAdminTab('gov_services'); setIsSidebarOpen(false); }}
            >
              <i className="fa-solid fa-landmark"></i>
              <span>🏛️ الخدمات الحكومية</span>
            </button>
          </nav>

          <div className="admin-sidebar-footer">
            <button onClick={handleBackToHome} className="admin-sidebar-item" style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
              <i className="fa-solid fa-house"></i>
              <span>الموقع الرئيسي</span>
            </button>
            <button onClick={handleAdminLogout} className="admin-sidebar-item" style={{ backgroundColor: 'var(--status-closed)', color: '#fff', borderRadius: 'var(--radius-sm)' }}>
              <i className="fa-solid fa-right-from-bracket"></i>
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </aside>

        {/* Left Content Area */}
        <main className="admin-main-content" style={{ padding: '24px' }}>
          {(() => {
            if (activeAdminTab === 'stats') {
                const totalRatingsCount = Object.values(ratings).reduce((acc, curr) => acc + (curr.count || 0), 0);
                const totalTripsCount = Object.values(tripsCounts).reduce((acc, curr) => acc + (curr || 0), 0);
                const featuredDoctorsCount = doctors.filter(d => d.isFeatured || d.id === 'doc_phys_6').length;
                
                // Calculate dynamic call statistics for each section
                const totalRestaurantCalls = Object.values(callsData || {}).reduce((acc, curr) => acc + (curr.total || 0), 0);
                const totalSupermarketCalls = Object.values(sectionCalls['supermarket'] || {}).reduce((acc, curr) => acc + (curr || 0), 0);
                const totalDoctorCalls = Object.values(sectionCalls['doctors'] || {}).reduce((acc, curr) => acc + (curr || 0), 0);
                const totalPharmacyCalls = Object.values(sectionCalls['pharmacies'] || {}).reduce((acc, curr) => acc + (curr || 0), 0);
                const totalGovCalls = Object.values(sectionCalls['gov_services'] || {}).reduce((acc, curr) => acc + (curr || 0), 0);

                const statsTabs = [
                  { id: 'general', name: 'العامة', icon: 'fa-chart-pie' },
                  { id: 'restaurants', name: 'المطاعم', icon: 'fa-utensils' },
                  { id: 'captains', name: 'الكباتن', icon: 'fa-motorcycle' },
                  { id: 'supermarkets', name: 'السوبرماركت', icon: 'fa-store' },
                  { id: 'doctors', name: 'الأطباء', icon: 'fa-user-doctor' },
                  { id: 'pharmacies', name: 'الصيدليات', icon: 'fa-mortar-pestle' },
                  { id: 'jobs', name: 'الوظائف', icon: 'fa-briefcase' },
                  { id: 'gov', name: 'الحكومي والطوارئ', icon: 'fa-building-columns' },
                ];

                return (
                  <div>
                    <h2 style={{ marginBottom: '16px' }}>لوحة الإحصائيات التفصيلية 📈</h2>
                    
                    {/* Stats Sub-Tabs */}
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                      {statsTabs.map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveStatsSubTab(tab.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-color)',
                            backgroundColor: activeStatsSubTab === tab.id ? 'var(--accent-color)' : 'var(--bg-secondary)',
                            color: activeStatsSubTab === tab.id ? '#fff' : 'var(--text-primary)',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            fontSize: '13.5px'
                          }}
                        >
                          <i className={`fa-solid ${tab.icon}`}></i>
                          <span>{tab.name}</span>
                        </button>
                      ))}
                    </div>

                    {/* General Stats */}
                    {activeStatsSubTab === 'general' && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>إجمالي التقييمات المكتملة</h3>
                          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{totalRatingsCount} تقييم ⭐</p>
                        </div>
                        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>إجمالي الأقسام النشطة</h3>
                          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0' }}>8 أقسام 📁</p>
                        </div>
                      </div>
                    )}

                    {/* Restaurants Stats */}
                    {activeStatsSubTab === 'restaurants' && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>إجمالي المطاعم</h3>
                          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{restaurants.length} مطعم 🍔</p>
                        </div>
                        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>إجمالي اتصالات الدليفري</h3>
                          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{totalRestaurantCalls} مكالمة 📞</p>
                        </div>
                      </div>
                    )}

                    {/* Captains Stats */}
                    {activeStatsSubTab === 'captains' && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>إجمالي الكباتن</h3>
                          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{captains.length} كابتن 🛵</p>
                        </div>
                        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>إجمالي اتصالات الدليفري (الرحلات)</h3>
                          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{totalTripsCount} رحلة 🚀</p>
                        </div>
                      </div>
                    )}

                    {/* Supermarkets Stats */}
                    {activeStatsSubTab === 'supermarkets' && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>إجمالي السوبرماركت</h3>
                          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{supermarkets.length} ماركت 🛒</p>
                        </div>
                        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>إجمالي اتصالات الدليفري</h3>
                          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{totalSupermarketCalls} مكالمة 📞</p>
                        </div>
                      </div>
                    )}

                    {/* Doctors Stats */}
                    {activeStatsSubTab === 'doctors' && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>إجمالي الأطباء</h3>
                          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{doctors.length} طبيب/عيادة 🩺</p>
                        </div>
                        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>إجمالي اتصالات الحجز</h3>
                          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{totalDoctorCalls} مكالمة 📞</p>
                        </div>
                        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>الأطباء المميزون (Featured)</h3>
                          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{featuredDoctorsCount} طبيب ⭐</p>
                        </div>
                        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>الأقسام/التخصصات الطبية</h3>
                          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{doctorCategories.length} تخصص 🗂️</p>
                        </div>
                      </div>
                    )}

                    {/* Pharmacies Stats */}
                    {activeStatsSubTab === 'pharmacies' && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>إجمالي الصيدليات</h3>
                          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{pharmacies.length} صيدلية 💊</p>
                        </div>
                        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>إجمالي اتصالات الطلبات</h3>
                          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{totalPharmacyCalls} مكالمة 📞</p>
                        </div>
                      </div>
                    )}

                    {/* Jobs Stats */}
                    {activeStatsSubTab === 'jobs' && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>الباحثون عن عمل</h3>
                          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{jobSeekers.length} باحث 👨‍💼</p>
                        </div>
                        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>فرص العمل المتاحة</h3>
                          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{jobVacancies.length} فرصة 📢</p>
                        </div>
                      </div>
                    )}

                    {/* Gov Stats */}
                    {activeStatsSubTab === 'gov' && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>الجهات والخدمات المسجلة</h3>
                          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{govServices.length} جهة 🏛️</p>
                        </div>
                        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>إجمالي اتصالات الطوارئ/الاستفسار</h3>
                          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{totalGovCalls} مكالمة 📞</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
            }

              if (activeAdminTab === 'restaurants') {
                const isFormOpen = showAddRestaurantForm || editingRestaurant;
                const targetRestaurant = editingRestaurant || {};
                return (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h2>إدارة المطاعم ({restaurants.length})</h2>
                      {!isFormOpen && (
                        <button onClick={() => setShowAddRestaurantForm(true)} style={{ padding: '10px 20px', backgroundColor: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>
                          ➕ إضافة مطعم جديد
                        </button>
                      )}
                    </div>

                    {isFormOpen ? (
                      /* Restaurant Add/Edit Form */
                      <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', maxWidth: '700px' }}>
                        <h3 style={{ marginBottom: '20px' }}>{editingRestaurant ? `تعديل مطعم: ${targetRestaurant.name}` : 'إضافة مطعم جديد'}</h3>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          
                          // Parse Popular Items
                          const popText = formData.get('popularItems') || '';
                          const popItems = popText.split('\n').map(line => {
                            if (!line.trim()) return null;
                            const parts = line.split('|');
                            return {
                              name: parts[0]?.trim() || '',
                              price: parts[1]?.trim() || '0',
                              description: parts[2]?.trim() || ''
                            };
                          }).filter(Boolean);

                          const menuText = formData.get('menuImages') || '';
                          const menuImgs = menuText.split(',').map(url => url.trim()).filter(Boolean);

                          const data = {
                            id: editingRestaurant ? targetRestaurant.id : Date.now(),
                            name: formData.get('name'),
                            category: formData.get('category'),
                            logo: formData.get('logo') || '',
                            description: formData.get('description'),
                            address: formData.get('address'),
                            deliveryFee: formData.get('deliveryFee') || 'من 20 لـ 30 جنيه',
                            phones: (formData.get('phones') || '').split(',').map(p => p.trim()).filter(Boolean),
                            secondBranchPhones: (formData.get('secondBranchPhones') || '') ? (formData.get('secondBranchPhones') || '').split(',').map(p => p.trim()).filter(Boolean) : null,
                            whatsApp: formData.get('whatsApp') || '',
                            workingHours: {
                              start: formData.get('workingHoursStart') || '12:00',
                              end: formData.get('workingHoursEnd') || '02:00',
                              display: formData.get('workingHoursDisplay') || 'من 12:00 ظهراً إلى 2:00 بعد منتصف الليل'
                            },
                            popularItems: popItems,
                            menuImages: menuImgs
                          };

                          if (editingRestaurant) {
                            handleEditRestaurant(data);
                          } else {
                            handleAddRestaurant(data);
                          }
                        }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>اسم المطعم:</label>
                              <input type="text" name="name" defaultValue={targetRestaurant.name || ''} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                            </div>
                            <div>
                              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>تصنيف المطعم:</label>
                              <select name="category" defaultValue={targetRestaurant.category || 'syrian'} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                                {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>رابط اللوجو (Logo URL):</label>
                              <input type="text" name="logo" placeholder="مثال: /assets/logo.png" defaultValue={targetRestaurant.logo || ''} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                            </div>
                            <div>
                              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>سعر التوصيل:</label>
                              <input type="text" name="deliveryFee" defaultValue={targetRestaurant.deliveryFee || 'من 20 لـ 30 جنيه'} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                            </div>
                          </div>

                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>الوصف القصير:</label>
                            <input type="text" name="description" defaultValue={targetRestaurant.description || ''} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>أرقام الهواتف الأساسية (مفصولة بفواصل):</label>
                              <input type="text" name="phones" placeholder="010..., 011..." defaultValue={targetRestaurant.phones ? targetRestaurant.phones.join(', ') : ''} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                            </div>
                            <div>
                              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>أرقام الفرع الثاني (مفصولة بفواصل - اختياري):</label>
                              <input type="text" name="secondBranchPhones" placeholder="012..." defaultValue={targetRestaurant.secondBranchPhones ? targetRestaurant.secondBranchPhones.join(', ') : ''} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>رابط الواتساب (اختياري):</label>
                              <input type="text" name="whatsApp" placeholder="010..." defaultValue={targetRestaurant.whatsApp || ''} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                            </div>
                            <div>
                              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>العنوان:</label>
                              <input type="text" name="address" defaultValue={targetRestaurant.address || 'مغاغة - المنيا'} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '16px' }}>
                            <div>
                              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>ساعة البدء (Start Time):</label>
                              <input type="text" name="workingHoursStart" placeholder="مثال: 12:00" defaultValue={targetRestaurant.workingHours ? targetRestaurant.workingHours.start : '12:00'} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                            </div>
                            <div>
                              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>ساعة الإغلاق (End Time):</label>
                              <input type="text" name="workingHoursEnd" placeholder="مثال: 02:00" defaultValue={targetRestaurant.workingHours ? targetRestaurant.workingHours.end : '02:00'} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                            </div>
                            <div>
                              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>مواعيد العمل (نص العرض):</label>
                              <input type="text" name="workingHoursDisplay" defaultValue={targetRestaurant.workingHours ? targetRestaurant.workingHours.display : 'من 12:00 ظهراً إلى 2:00 بعد منتصف الليل'} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                            </div>
                          </div>

                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>صور المنيو (روابط مفصولة بفواصل):</label>
                            <input type="text" name="menuImages" placeholder="http://..., http://..." defaultValue={targetRestaurant.menuImages ? targetRestaurant.menuImages.join(', ') : ''} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                          </div>

                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>الوجبات الأكثر مبيعاً (كل وجبة في سطر بصيغة: الاسم | السعر | وصف الوجبة):</label>
                            <textarea name="popularItems" rows="4" placeholder="كريب نوتيلا | 60 | شوكولاتة نوتيلا أصلية&#10;شاورما عربي | 80 | قطع شاورما دجاج مع التومية والبطاطس" defaultValue={targetRestaurant.popularItems ? targetRestaurant.popularItems.map(item => `${item.name} | ${item.price} | ${item.description || ''}`).join('\n') : ''} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'sans-serif' }}></textarea>
                          </div>

                          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                            <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>حفظ التعديلات</button>
                            <button type="button" onClick={() => { setEditingRestaurant(null); setShowAddRestaurantForm(false); }} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      /* Restaurants List */
                      <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
                              <th style={{ padding: '12px 16px' }}>الاسم</th>
                              <th style={{ padding: '12px 16px' }}>التصنيف</th>
                              <th style={{ padding: '12px 16px' }}>التوصيل</th>
                              <th style={{ padding: '12px 16px' }}>الهواتف</th>
                              <th style={{ padding: '12px 16px', textAlign: 'center' }}>العمليات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {restaurants.map((res) => (
                              <tr key={res.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{res.name}</td>
                                <td style={{ padding: '12px 16px' }}>{CATEGORIES.find(c => c.id === res.category)?.name || res.category}</td>
                                <td style={{ padding: '12px 16px' }}>{res.deliveryFee}</td>
                                <td style={{ padding: '12px 16px', direction: 'ltr', textAlign: 'right' }}>{res.phones.join(' - ')}</td>
                                <td style={{ padding: '12px 16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                  <button onClick={() => setEditingRestaurant(res)} style={{ padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--accent-color)', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🔧 تعديل</button>
                                  <button onClick={() => handleDeleteRestaurant(res.id)} style={{ padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--status-closed)', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🗑️ حذف</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              }

              if (activeAdminTab === 'captains') {
                const isFormOpen = showAddCaptainForm || editingCaptain;
                const targetCaptain = editingCaptain || {};
                return (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h2>إدارة كباتن الموتوسيكلات ({captains.length})</h2>
                      {!isFormOpen && (
                        <button onClick={() => setShowAddCaptainForm(true)} style={{ padding: '10px 20px', backgroundColor: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>
                          ➕ إضافة كابتن جديد
                        </button>
                      )}
                    </div>

                    {isFormOpen ? (
                      /* Captain Add/Edit Form */
                      <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', maxWidth: '600px' }}>
                        <h3 style={{ marginBottom: '20px' }}>{editingCaptain ? `تعديل كابتن: ${targetCaptain.name}` : 'إضافة كابتن جديد'}</h3>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const services = [];
                          if (formData.get('srv_delivery') === 'on') services.push('توصيل طلبات');
                          if (formData.get('srv_rides') === 'on') services.push('مشاوير');

                          const data = {
                            id: editingCaptain ? targetCaptain.id : `captain_${Date.now()}`,
                            name: formData.get('name'),
                            avatar: formData.get('avatar') || 'avatar-men',
                            phone: formData.get('phone'),
                            isAvailable: formData.get('isAvailable') === 'on',
                            description: formData.get('description'),
                            tripsCount: Number(formData.get('tripsCount') || 0),
                            serviceTypes: services
                          };

                          if (editingCaptain) {
                            handleEditCaptain(data);
                          } else {
                            handleAddCaptain(data);
                          }
                        }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>اسم الكابتن:</label>
                              <input type="text" name="name" defaultValue={targetCaptain.name || ''} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                            </div>
                            <div>
                              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>رقم الهاتف:</label>
                              <input type="text" name="phone" defaultValue={targetCaptain.phone || ''} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>رابط الصورة (Avatar URL):</label>
                              <input type="text" name="avatar" defaultValue={targetCaptain.avatar || ''} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                            </div>
                            <div>
                              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>عدد الرحلات الأساسية:</label>
                              <input type="number" name="tripsCount" defaultValue={targetCaptain.tripsCount || 0} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                            </div>
                          </div>

                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>الوصف القصير:</label>
                            <input type="text" name="description" defaultValue={targetCaptain.description || ''} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                          </div>

                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>أنواع الخدمات المتاحة:</label>
                            <div style={{ display: 'flex', gap: '20px', marginTop: '6px' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                <input type="checkbox" name="srv_delivery" defaultChecked={targetCaptain.serviceTypes ? targetCaptain.serviceTypes.includes('توصيل طلبات') : true} />
                                توصيل طلبات 📦
                              </label>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                <input type="checkbox" name="srv_rides" defaultChecked={targetCaptain.serviceTypes ? targetCaptain.serviceTypes.includes('مشاوير') : true} />
                                مشاوير 🗺️
                              </label>
                            </div>
                          </div>

                          <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                              <input type="checkbox" name="isAvailable" defaultChecked={targetCaptain.isAvailable !== false} />
                              الكابتن متاح للعمل حالياً 🟢
                            </label>
                          </div>

                          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                            <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>حفظ التعديلات</button>
                            <button type="button" onClick={() => { setEditingCaptain(null); setShowAddCaptainForm(false); }} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      /* Captains List */
                      <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
                              <th style={{ padding: '12px 16px' }}>الاسم</th>
                              <th style={{ padding: '12px 16px' }}>رقم الهاتف</th>
                              <th style={{ padding: '12px 16px' }}>الحالة</th>
                              <th style={{ padding: '12px 16px' }}>الخدمات</th>
                              <th style={{ padding: '12px 16px', textAlign: 'center' }}>العمليات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {captains.map((cap) => (
                              <tr key={cap.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{cap.name}</td>
                                <td style={{ padding: '12px 16px', direction: 'ltr', textAlign: 'right' }}>{cap.phone}</td>
                                <td style={{ padding: '12px 16px' }}>
                                  <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 'bold', backgroundColor: cap.isAvailable ? 'rgba(74, 222, 128, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: cap.isAvailable ? 'var(--status-open)' : 'var(--status-closed)' }}>
                                    {cap.isAvailable ? '🟢 متاح' : '🔴 غير متاح'}
                                  </span>
                                </td>
                                <td style={{ padding: '12px 16px' }}>{cap.serviceTypes.join(' - ')}</td>
                                <td style={{ padding: '12px 16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                  <button onClick={() => setEditingCaptain(cap)} style={{ padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--accent-color)', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🔧 تعديل</button>
                                  <button onClick={() => handleDeleteCaptain(cap.id)} style={{ padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--status-closed)', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🗑️ حذف</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              }

              if (activeAdminTab === 'supermarket') {
                const isFormOpen = showAddSupermarketForm || editingSupermarket;
                const targetSupermarket = editingSupermarket || {};
                return (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h2>إدارة محلات السوبرماركت والعروض ({supermarkets.length})</h2>
                      {!isFormOpen && (
                        <button onClick={() => setShowAddSupermarketForm(true)} style={{ padding: '10px 20px', backgroundColor: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>
                          ➕ إضافة محل جديد
                        </button>
                      )}
                    </div>

                    {isFormOpen ? (
                      <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', maxWidth: '600px' }}>
                        <h3 style={{ marginBottom: '20px' }}>{editingSupermarket && editingSupermarket.id ? `تعديل المحل: ${targetSupermarket.name}` : 'إضافة محل سوبرماركت جديد'}</h3>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const data = {
                            id: editingSupermarket && editingSupermarket.id ? targetSupermarket.id : Date.now(),
                            name: formData.get('name'),
                            logo: formData.get('logo') || '',
                            description: formData.get('description'),
                            deliveryFee: formData.get('deliveryFee') || 'من 15 لـ 20 جنيه',
                            phones: (formData.get('phones') || '').split(',').map(p => p.trim()).filter(Boolean),
                            whatsApp: formData.get('whatsApp') || '',
                            popularItems: (formData.get('popularItems') || '').split('\n').map(line => {
                              if (!line.trim()) return null;
                              const parts = line.split('|');
                              return {
                                name: parts[0]?.trim() || '',
                                price: parts[1]?.trim() || '',
                                description: parts[2]?.trim() || ''
                              };
                            }).filter(Boolean)
                          };

                          if (editingSupermarket && editingSupermarket.id) {
                            handleEditSupermarket(data);
                          } else {
                            handleAddSupermarket(data);
                          }
                        }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>اسم المحل:</label>
                            <input type="text" name="name" defaultValue={targetSupermarket.name || ''} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>شعار المحل (Logo URL):</label>
                            <input type="text" name="logo" defaultValue={targetSupermarket.logo || ''} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>الوصف والعروض:</label>
                            <textarea name="description" defaultValue={targetSupermarket.description || ''} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>أرقام الهواتف (مفصولة بفاصلة):</label>
                            <input type="text" name="phones" defaultValue={targetSupermarket.phones ? targetSupermarket.phones.join(', ') : ''} placeholder="010..., 012..." style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>رقم واتساب:</label>
                            <input type="text" name="whatsApp" defaultValue={targetSupermarket.whatsApp || ''} placeholder="2010..." style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>المنتجات المميزة / العروض (كل منتج في سطر بصيغة: الاسم | السعر | الوصف):</label>
                            <textarea name="popularItems" rows="3" placeholder="أرز معبأ | 30 | أرز مصري فاخر 1 كجم&#10;زيت طهي | 70 | زيت خليط 800 مل" defaultValue={targetSupermarket.popularItems ? targetSupermarket.popularItems.map(item => `${item.name} | ${item.price} | ${item.description || ''}`).join('\n') : ''} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'sans-serif' }} />
                          </div>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>حفظ</button>
                            <button type="button" onClick={() => { setEditingSupermarket(null); setShowAddSupermarketForm(false); }} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
                              <th style={{ padding: '12px 16px' }}>الاسم</th>
                              <th style={{ padding: '12px 16px' }}>الهواتف</th>
                              <th style={{ padding: '12px 16px', textAlign: 'center' }}>العمليات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {supermarkets.map((sup) => (
                              <tr key={sup.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{sup.name}</td>
                                <td style={{ padding: '12px 16px', direction: 'ltr', textAlign: 'right' }}>{sup.phones.join(' - ')}</td>
                                <td style={{ padding: '12px 16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                  <button onClick={() => setEditingSupermarket(sup)} style={{ padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--accent-color)', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🔧 تعديل</button>
                                  <button onClick={() => handleDeleteSupermarket(sup.id)} style={{ padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--status-closed)', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🗑️ حذف</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              }

              if (activeAdminTab === 'jobs') {
                const isFormOpen = showAddJobSeekerForm || editingJobSeeker || showAddJobVacancyForm || editingJobVacancy;
                const targetSeeker = editingJobSeeker || {};
                const targetVacancy = editingJobVacancy || {};

                return (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h2>إدارة قسم الوظائف (وظائف: {jobVacancies.length} | طالبو عمل: {jobSeekers.length})</h2>
                      {!isFormOpen && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button onClick={() => setShowAddJobVacancyForm(true)} style={{ padding: '10px 16px', backgroundColor: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>
                            ➕ إضافة وظيفة شاغرة
                          </button>
                          <button onClick={() => setShowAddJobSeekerForm(true)} style={{ padding: '10px 16px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>
                            ➕ إضافة طالب عمل
                          </button>
                        </div>
                      )}
                    </div>

                    {showAddJobVacancyForm || editingJobVacancy ? (
                      <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', maxWidth: '600px' }}>
                        <h3 style={{ marginBottom: '20px' }}>{editingJobVacancy && editingJobVacancy.id ? `تعديل الوظيفة: ${targetVacancy.title}` : 'إضافة وظيفة شاغرة جديدة'}</h3>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const data = {
                            id: editingJobVacancy && editingJobVacancy.id ? targetVacancy.id : `vacancy_${Date.now()}`,
                            title: formData.get('title'),
                            company: formData.get('company'),
                            location: formData.get('location') || 'مغاغة',
                            description: formData.get('description'),
                            salary: formData.get('salary') || 'غير مححدد',
                            phone: formData.get('phone')
                          };
                          if (editingJobVacancy && editingJobVacancy.id) {
                            handleEditJobVacancy(data);
                          } else {
                            handleAddJobVacancy(data);
                          }
                        }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>عنوان الوظيفة:</label>
                            <input type="text" name="title" defaultValue={targetVacancy.title || ''} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>اسم الشركة / صاحب العمل:</label>
                            <input type="text" name="company" defaultValue={targetVacancy.company || ''} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>تفاصيل الوظيفة:</label>
                            <textarea name="description" defaultValue={targetVacancy.description || ''} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>الراتب:</label>
                            <input type="text" name="salary" defaultValue={targetVacancy.salary || ''} placeholder="مثال: 4000 جنيه" style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>رقم التواصل:</label>
                            <input type="text" name="phone" defaultValue={targetVacancy.phone || ''} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                          </div>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>حفظ</button>
                            <button type="button" onClick={() => { setEditingJobVacancy(null); setShowAddJobVacancyForm(false); }} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
                          </div>
                        </form>
                      </div>
                    ) : showAddJobSeekerForm || editingJobSeeker ? (
                      <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', maxWidth: '600px' }}>
                        <h3 style={{ marginBottom: '20px' }}>{editingJobSeeker && editingJobSeeker.id ? `تعديل طلب: ${targetSeeker.name}` : 'إضافة طلب عمل جديد'}</h3>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const data = {
                            id: editingJobSeeker && editingJobSeeker.id ? targetSeeker.id : `seeker_${Date.now()}`,
                            name: formData.get('name'),
                            title: formData.get('title'),
                            experience: formData.get('experience'),
                            phone: formData.get('phone')
                          };
                          if (editingJobSeeker && editingJobSeeker.id) {
                            handleEditJobSeeker(data);
                          } else {
                            handleAddJobSeeker(data);
                          }
                        }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>اسم المتقدم:</label>
                            <input type="text" name="name" defaultValue={targetSeeker.name || ''} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>التخصص / المسمى الوظيفي:</label>
                            <input type="text" name="title" defaultValue={targetSeeker.title || ''} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>الخبرات والمهارات:</label>
                            <textarea name="experience" defaultValue={targetSeeker.experience || ''} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>رقم الهاتف:</label>
                            <input type="text" name="phone" defaultValue={targetSeeker.phone || ''} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                          </div>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>حفظ</button>
                            <button type="button" onClick={() => { setEditingJobSeeker(null); setShowAddJobSeekerForm(false); }} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                          <h3 style={{ marginBottom: '10px' }}>💼 الوظائف الشاغرة المعروضة:</h3>
                          <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
                                  <th style={{ padding: '12px 16px' }}>الوظيفة</th>
                                  <th style={{ padding: '12px 16px' }}>الشركة</th>
                                  <th style={{ padding: '12px 16px' }}>رقم الاتصال</th>
                                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>العمليات</th>
                                </tr>
                              </thead>
                              <tbody>
                                {jobVacancies.map((vac) => (
                                  <tr key={vac.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{vac.title}</td>
                                    <td style={{ padding: '12px 16px' }}>{vac.company}</td>
                                    <td style={{ padding: '12px 16px', direction: 'ltr', textAlign: 'right' }}>{vac.phone}</td>
                                    <td style={{ padding: '12px 16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                      <button onClick={() => setEditingJobVacancy(vac)} style={{ padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--accent-color)', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🔧 تعديل</button>
                                      <button onClick={() => handleDeleteJobVacancy(vac.id)} style={{ padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--status-closed)', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🗑️ حذف</button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div>
                          <h3 style={{ marginBottom: '10px' }}>👤 طلبات الباحثين عن عمل:</h3>
                          <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
                                  <th style={{ padding: '12px 16px' }}>الاسم</th>
                                  <th style={{ padding: '12px 16px' }}>التخصص</th>
                                  <th style={{ padding: '12px 16px' }}>الهاتف</th>
                                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>العمليات</th>
                                </tr>
                              </thead>
                              <tbody>
                                {jobSeekers.map((seeker) => (
                                  <tr key={seeker.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{seeker.name}</td>
                                    <td style={{ padding: '12px 16px' }}>{seeker.title}</td>
                                    <td style={{ padding: '12px 16px', direction: 'ltr', textAlign: 'right' }}>{seeker.phone}</td>
                                    <td style={{ padding: '12px 16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                      <button onClick={() => setEditingJobSeeker(seeker)} style={{ padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--accent-color)', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🔧 تعديل</button>
                                      <button onClick={() => handleDeleteJobSeeker(seeker.id)} style={{ padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--status-closed)', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🗑️ حذف</button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              if (activeAdminTab === 'doctors') {
                const isFormOpen = showAddDoctorForm || editingDoctor;
                const targetDoctor = editingDoctor || {};
                const isCategoryFormOpen = showAddDoctorCategoryForm || editingDoctorCategory;
                const targetCategory = editingDoctorCategory || {};
                return (
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h2>إدارة الأطباء والتخصصات</h2>
                      {!isFormOpen && !isCategoryFormOpen && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          {doctorAdminSubTab === 'doctors' ? (
                            <button onClick={() => setShowAddDoctorForm(true)} style={{ padding: '10px 20px', backgroundColor: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>
                              ➕ إضافة طبيب جديد
                            </button>
                          ) : (
                            <button onClick={() => setShowAddDoctorCategoryForm(true)} style={{ padding: '10px 20px', backgroundColor: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>
                              ➕ إضافة قسم/تخصص جديد
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Sub tabs */}
                    {!isFormOpen && !isCategoryFormOpen && (
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        <button 
                          onClick={() => setDoctorAdminSubTab('doctors')}
                          style={{
                            padding: '8px 16px',
                            border: 'none',
                            backgroundColor: doctorAdminSubTab === 'doctors' ? 'var(--accent-color)' : 'transparent',
                            color: doctorAdminSubTab === 'doctors' ? '#fff' : 'var(--text-primary)',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          📋 قائمة الأطباء ({doctors.length})
                        </button>
                        <button 
                          onClick={() => setDoctorAdminSubTab('categories')}
                          style={{
                            padding: '8px 16px',
                            border: 'none',
                            backgroundColor: doctorAdminSubTab === 'categories' ? 'var(--accent-color)' : 'transparent',
                            color: doctorAdminSubTab === 'categories' ? '#fff' : 'var(--text-primary)',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          🗂️ التخصصات الطبية ({doctorCategories.length})
                        </button>
                      </div>
                    )}

                    {/* Doctors sub-tab */}
                    {doctorAdminSubTab === 'doctors' && (
                      <>
                        {isFormOpen ? (
                          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', maxWidth: '600px' }}>
                            <h3 style={{ marginBottom: '20px' }}>{editingDoctor && editingDoctor.id ? `تعديل بيانات: ${targetDoctor.name}` : 'إضافة طبيب جديد'}</h3>
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              const formData = new FormData(e.currentTarget);
                              const p1 = formData.get('phone1')?.trim() || '';
                              const p2 = formData.get('phone2')?.trim() || '';
                              const combinedPhone = p2 ? `${p1} / ${p2}` : p1;
                              
                              const data = {
                                id: editingDoctor && editingDoctor.id ? targetDoctor.id : `doc_${Date.now()}`,
                                name: formData.get('name'),
                                specialty: formData.get('specialty'),
                                specialtyId: formData.get('specialtyId') || 'internal_chest',
                                address: formData.get('address'),
                                phone: combinedPhone,
                                workingHours: formData.get('workingHours') || '',
                                workingDays: formData.get('workingDays') || ''
                              };
                              if (editingDoctor && editingDoctor.id) {
                                handleEditDoctor(data);
                              } else {
                                handleAddDoctor(data);
                              }
                            }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>اسم الطبيب:</label>
                                <input type="text" name="name" defaultValue={targetDoctor.name || ''} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                              </div>
                              <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>التخصص:</label>
                                <input type="text" name="specialty" defaultValue={targetDoctor.specialty || ''} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                              </div>
                              <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>معرف التخصص (specialtyId):</label>
                                <select name="specialtyId" defaultValue={targetDoctor.specialtyId || 'internal_chest'} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                                  {doctorCategories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>العنوان:</label>
                                <input type="text" name="address" defaultValue={targetDoctor.address || ''} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>رقم الهاتف الأول:</label>
                                  <input type="text" name="phone1" defaultValue={(targetDoctor.phone || '').split('/')[0]?.trim() || ''} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                                </div>
                                <div>
                                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>رقم الهاتف الثاني (اختياري):</label>
                                  <input type="text" name="phone2" defaultValue={(targetDoctor.phone || '').split('/')[1]?.trim() || ''} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                                </div>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>ساعات العمل (مثال: من 1 مساءً إلى 10 مساءً):</label>
                                  <input type="text" name="workingHours" defaultValue={targetDoctor.workingHours || ''} placeholder="مثال: من 12 ظهراً - 7 مساءً" style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                                </div>
                                <div>
                                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>أيام العمل (مثال: الأحد والجمعة):</label>
                                  <input type="text" name="workingDays" defaultValue={targetDoctor.workingDays || ''} placeholder="مثال: الأحد والجمعة" style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>حفظ</button>
                                <button type="button" onClick={() => { setEditingDoctor(null); setShowAddDoctorForm(false); }} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
                              </div>
                            </form>
                          </div>
                        ) : (
                          <div>
                            <div style={{ marginBottom: '16px' }}>
                              <input 
                                type="text" 
                                placeholder="🔍 ابحث عن طبيب بالاسم، التخصص، أو العنوان..." 
                                value={adminSearchTerm}
                                onChange={(e) => setAdminSearchTerm(e.target.value)}
                                style={{
                                  width: '100%',
                                  maxWidth: '400px',
                                  padding: '10px 14px',
                                  borderRadius: 'var(--radius-sm)',
                                  border: '1px solid var(--border-color)',
                                  backgroundColor: 'var(--bg-secondary)',
                                  color: 'var(--text-primary)'
                                }}
                              />
                            </div>
                            <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                                <thead>
                                  <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
                                    <th style={{ padding: '12px 16px' }}>الاسم</th>
                                    <th style={{ padding: '12px 16px' }}>التخصص</th>
                                    <th style={{ padding: '12px 16px' }}>الهاتف</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>العمليات</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {doctors
                                    .filter((doc) => {
                                      return !adminSearchTerm || 
                                        doc.name.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
                                        doc.specialty.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
                                        doc.address.toLowerCase().includes(adminSearchTerm.toLowerCase());
                                    })
                                    .map((doc) => (
                                      <tr key={doc.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{doc.name}</td>
                                    <td style={{ padding: '12px 16px' }}>{doc.specialty}</td>
                                    <td style={{ padding: '12px 16px' }}>{doc.phone}</td>
                                    <td style={{ padding: '12px 16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                      <button 
                                        onClick={() => handleToggleDoctorFeatured(doc.id)} 
                                        style={{ 
                                          padding: '6px 12px', 
                                          border: 'none', 
                                          borderRadius: 'var(--radius-sm)', 
                                          backgroundColor: doc.isFeatured ? '#d4af37' : 'var(--bg-tertiary)', 
                                          color: doc.isFeatured ? '#000' : 'var(--text-primary)', 
                                          cursor: 'pointer', 
                                          fontSize: '12px', 
                                          fontWeight: 'bold'
                                        }}
                                      >
                                        {doc.isFeatured ? '⭐ مميز' : '☆ تمييز'}
                                      </button>
                                      <button onClick={() => setEditingDoctor(doc)} style={{ padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--accent-color)', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🔧 تعديل</button>
                                      <button onClick={() => handleDeleteDoctor(doc.id)} style={{ padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--status-closed)', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🗑️ حذف</button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Categories sub-tab */}
                  {doctorAdminSubTab === 'categories' && (
                    <>
                      {isCategoryFormOpen ? (
                        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', maxWidth: '600px', marginBottom: '20px' }}>
                          <h3 style={{ marginBottom: '20px' }}>{editingDoctorCategory ? `تعديل التخصص: ${targetCategory.name}` : 'إضافة تخصص طبي جديد'}</h3>
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const name = formData.get('cat_name');
                            const id = editingDoctorCategory ? targetCategory.id : (formData.get('cat_id') || `specialty_${Date.now()}`);
                            const icon = formData.get('cat_icon') || 'fa-user-doctor';
                            
                            const catData = { id, name, icon };
                            if (editingDoctorCategory) {
                              handleEditDoctorCategory(catData);
                            } else {
                              handleAddDoctorCategory(catData);
                            }
                          }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>اسم التخصص (مثال: المسالك البولية):</label>
                              <input type="text" name="cat_name" defaultValue={targetCategory.name || ''} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                            </div>
                            <div>
                              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>معرف التخصص بالإنجليزية (مثال: urology):</label>
                              <input type="text" name="cat_id" placeholder="حروف إنجليزية فقط" defaultValue={targetCategory.id || ''} disabled={!!editingDoctorCategory} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', opacity: editingDoctorCategory ? 0.6 : 1 }} />
                            </div>
                            <div>
                              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>أيقونة FontAwesome (مثال: fa-stethoscope):</label>
                              <input type="text" name="cat_icon" defaultValue={targetCategory.icon || 'fa-user-doctor'} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                              <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>{editingDoctorCategory ? 'حفظ التغييرات' : 'حفظ التخصص'}</button>
                              <button type="button" onClick={() => { setShowAddDoctorCategoryForm(false); setEditingDoctorCategory(null); }} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
                            </div>
                          </form>
                        </div>
                      ) : (
                        <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
                                <th style={{ padding: '12px 16px' }}>اسم التخصص</th>
                                <th style={{ padding: '12px 16px' }}>المعرف (ID)</th>
                                <th style={{ padding: '12px 16px' }}>الأيقونة</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>العمليات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {doctorCategories.map((cat) => (
                                <tr key={cat.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                  <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{cat.name}</td>
                                  <td style={{ padding: '12px 16px' }}>{cat.id}</td>
                                  <td style={{ padding: '12px 16px' }}>
                                    <i className={`fa-solid ${cat.icon}`} style={{ marginRight: '6px' }}></i>
                                    <span>{cat.icon}</span>
                                  </td>
                                  <td style={{ padding: '12px 16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                    <button onClick={() => setEditingDoctorCategory(cat)} style={{ padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--accent-color)', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🔧 تعديل الاسم</button>
                                    <button onClick={() => handleDeleteDoctorCategory(cat.id)} style={{ padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--status-closed)', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🗑️ حذف</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </div>
                );
              }

              if (activeAdminTab === 'pharmacies') {
                const isFormOpen = showAddPharmacyForm || editingPharmacy;
                const targetPharmacy = editingPharmacy || {};
                return (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h2>إدارة الصيدليات ({pharmacies.length})</h2>
                      {!isFormOpen && (
                        <button onClick={() => setShowAddPharmacyForm(true)} style={{ padding: '10px 20px', backgroundColor: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>
                          ➕ إضافة صيدلية جديدة
                        </button>
                      )}
                    </div>
                    {isFormOpen ? (
                      <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', maxWidth: '600px' }}>
                        <h3 style={{ marginBottom: '20px' }}>{editingPharmacy && editingPharmacy.id ? `تعديل بيانات: ${targetPharmacy.name}` : 'إضافة صيدلية جديدة'}</h3>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const data = {
                            id: editingPharmacy && editingPharmacy.id ? targetPharmacy.id : `pharm_${Date.now()}`,
                            name: formData.get('name'),
                            address: formData.get('address'),
                            phone: formData.get('phone')
                          };
                          if (editingPharmacy && editingPharmacy.id) {
                            handleEditPharmacy(data);
                          } else {
                            handleAddPharmacy(data);
                          }
                        }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>اسم الصيدلية:</label>
                            <input type="text" name="name" defaultValue={targetPharmacy.name || ''} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>العنوان:</label>
                            <input type="text" name="address" defaultValue={targetPharmacy.address || ''} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>الهاتف:</label>
                            <input type="text" name="phone" defaultValue={targetPharmacy.phone || ''} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                          </div>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>حفظ</button>
                            <button type="button" onClick={() => { setEditingPharmacy(null); setShowAddPharmacyForm(false); }} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
                              <th style={{ padding: '12px 16px' }}>الاسم</th>
                              <th style={{ padding: '12px 16px' }}>العنوان</th>
                              <th style={{ padding: '12px 16px' }}>الهاتف</th>
                              <th style={{ padding: '12px 16px', textAlign: 'center' }}>العمليات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pharmacies.map((pharm) => (
                              <tr key={pharm.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{pharm.name}</td>
                                <td style={{ padding: '12px 16px' }}>{pharm.address}</td>
                                <td style={{ padding: '12px 16px' }}>{pharm.phone}</td>
                                <td style={{ padding: '12px 16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                  <button onClick={() => setEditingPharmacy(pharm)} style={{ padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--accent-color)', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🔧 تعديل</button>
                                  <button onClick={() => handleDeletePharmacy(pharm.id)} style={{ padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--status-closed)', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🗑️ حذف</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              }

              if (activeAdminTab === 'gov_services') {
                const isFormOpen = showAddGovServiceForm || editingGovService;
                const targetService = editingGovService || {};
                return (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h2>إدارة الخدمات الحكومية والعامة ({govServices.length})</h2>
                      {!isFormOpen && (
                        <button onClick={() => setShowAddGovServiceForm(true)} style={{ padding: '10px 20px', backgroundColor: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>
                          ➕ إضافة خدمة جديدة
                        </button>
                      )}
                    </div>
                    {isFormOpen ? (
                      <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', maxWidth: '600px' }}>
                        <h3 style={{ marginBottom: '20px' }}>{editingGovService && editingGovService.id ? `تعديل بيانات: ${targetService.name}` : 'إضافة خدمة جديدة'}</h3>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const data = {
                            id: editingGovService && editingGovService.id ? targetService.id : `gov_${Date.now()}`,
                            name: formData.get('name'),
                            type: formData.get('type') || 'civil',
                            description: formData.get('description'),
                            phone: formData.get('phone')
                          };
                          if (editingGovService && editingGovService.id) {
                            handleEditGovService(data);
                          } else {
                            handleAddGovService(data);
                          }
                        }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>اسم الجهة الخدمية:</label>
                            <input type="text" name="name" defaultValue={targetService.name || ''} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>نوع الخدمة:</label>
                            <select name="type" defaultValue={targetService.type || 'civil'} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                              <option value="civil">دليل خدمي</option>
                              <option value="emergency">طوارئ وشكاوى</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>الوصف أو مواعيد العمل:</label>
                            <input type="text" name="description" defaultValue={targetService.description || ''} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>الهاتف:</label>
                            <input type="text" name="phone" defaultValue={targetService.phone || ''} required style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                          </div>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>حفظ</button>
                            <button type="button" onClick={() => { setEditingGovService(null); setShowAddGovServiceForm(false); }} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
                              <th style={{ padding: '12px 16px' }}>الاسم</th>
                              <th style={{ padding: '12px 16px' }}>النوع</th>
                              <th style={{ padding: '12px 16px' }}>الوصف</th>
                              <th style={{ padding: '12px 16px' }}>الهاتف</th>
                              <th style={{ padding: '12px 16px', textAlign: 'center' }}>العمليات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {govServices.map((srv) => (
                              <tr key={srv.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{srv.name}</td>
                                <td style={{ padding: '12px 16px' }}>{srv.type === 'emergency' ? '🚨 طوارئ' : '🏛️ دليل خدمي'}</td>
                                <td style={{ padding: '12px 16px' }}>{srv.description || '—'}</td>
                                <td style={{ padding: '12px 16px' }}>{srv.phone}</td>
                                <td style={{ padding: '12px 16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                  <button onClick={() => setEditingGovService(srv)} style={{ padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--accent-color)', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🔧 تعديل</button>
                                  <button onClick={() => handleDeleteGovService(srv.id)} style={{ padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--status-closed)', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🗑️ حذف</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              }
            })()}
        </main>
      </div>
    );
  }

  if (isCallsPage) {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    // Select raw items and calls database node depending on activeCallsTab
    let rawItems = [];
    let callsNode = {};
    let isTrips = false; // trips node uses a flat number schema instead of { total, daily }

    if (activeCallsTab === 'restaurants') {
      rawItems = restaurants;
      callsNode = callsData || {};
    } else if (activeCallsTab === 'captains') {
      rawItems = captains;
      callsNode = tripsCounts || {};
      isTrips = true;
    } else if (activeCallsTab === 'supermarkets') {
      rawItems = supermarkets;
      callsNode = sectionCalls['supermarket'] || {};
    } else if (activeCallsTab === 'doctors') {
      rawItems = doctors;
      callsNode = sectionCalls['doctors'] || {};
    } else if (activeCallsTab === 'pharmacies') {
      rawItems = pharmacies;
      callsNode = sectionCalls['pharmacies'] || {};
    } else if (activeCallsTab === 'gov') {
      rawItems = govServices;
      callsNode = sectionCalls['gov_services'] || {};
    }

    let totalCallsAll = 0;
    let todayCallsAll = 0;
    let yesterdayCallsAll = 0;

    const itemCallStats = rawItems.map((item) => {
      let total = 0;
      let todayCalls = 0;
      let yesterdayCalls = 0;
      let daily = {};
      let logs = {};

      if (isTrips) {
        total = callsNode[item.id] || 0;
      } else {
        const stats = callsNode[item.id];
        if (typeof stats === 'number') {
          total = stats;
        } else if (stats && typeof stats === 'object') {
          total = stats.total || 0;
          todayCalls = (stats.daily && stats.daily[todayStr]) || 0;
          yesterdayCalls = (stats.daily && stats.daily[yesterdayStr]) || 0;
          daily = stats.daily || {};
          logs = stats.logs || {};
        }
      }

      let last7DaysSum = 0;
      if (!isTrips && daily) {
        for (let i = 0; i < 7; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dStr = d.toISOString().split('T')[0];
          last7DaysSum += daily[dStr] || 0;
        }
      }

      totalCallsAll += total;
      todayCallsAll += todayCalls;
      yesterdayCallsAll += yesterdayCalls;

      return {
        id: item.id,
        name: item.name,
        logo: item.logo || '',
        avatar: item.avatar || '',
        total,
        todayCalls,
        yesterdayCalls,
        last7DaysSum,
        daily,
        logs
      };
    });

    // Apply Sorting
    const sortedStats = [...itemCallStats].sort((a, b) => {
      if (sortBy === 'today') {
        return b.todayCalls - a.todayCalls;
      } else if (sortBy === 'yesterday') {
        return b.yesterdayCalls - a.yesterdayCalls;
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name, 'ar');
      } else {
        return b.total - a.total; // Default: total
      }
    });

    const filteredStats = sortedStats.filter((r) =>
      !callsSearchTerm || r.name.toLowerCase().includes(callsSearchTerm.toLowerCase())
    );

    // Visits Calculations
    const todayVisits = (visitsData.daily && visitsData.daily[todayStr]) || 0;
    const yesterdayVisits = (visitsData.daily && visitsData.daily[yesterdayStr]) || 0;

    let weeklyVisits = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      weeklyVisits += (visitsData.daily && visitsData.daily[dStr]) || 0;
    }

    let monthlyVisits = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      monthlyVisits += (visitsData.daily && visitsData.daily[dStr]) || 0;
    }

    // Growth Indicators (Comparing today vs yesterday)
    let visitsGrowth = 0;
    if (yesterdayVisits > 0) {
      visitsGrowth = Math.round(((todayVisits - yesterdayVisits) / yesterdayVisits) * 100);
    } else if (todayVisits > 0) {
      visitsGrowth = 100;
    }

    let callsGrowth = 0;
    if (yesterdayCallsAll > 0) {
      callsGrowth = Math.round(((todayCallsAll - yesterdayCallsAll) / yesterdayCallsAll) * 100);
    } else if (todayCallsAll > 0) {
      callsGrowth = 100;
    }

    const renderGrowthBadge = (growthValue) => {
      if (growthValue > 0) {
        return (
          <span style={{ 
            fontSize: '11px', 
            color: '#10b981', 
            backgroundColor: 'rgba(16, 185, 129, 0.12)', 
            padding: '3px 8px', 
            borderRadius: '12px', 
            fontWeight: '800',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            ▲ +{growthValue}%
          </span>
        );
      } else if (growthValue < 0) {
        return (
          <span style={{ 
            fontSize: '11px', 
            color: '#ef4444', 
            backgroundColor: 'rgba(239, 68, 68, 0.12)', 
            padding: '3px 8px', 
            borderRadius: '12px', 
            fontWeight: '800',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            ▼ {growthValue}%
          </span>
        );
      } else {
        return (
          <span style={{ 
            fontSize: '11px', 
            color: 'var(--text-secondary)', 
            backgroundColor: 'var(--bg-tertiary)', 
            padding: '3px 8px', 
            borderRadius: '12px', 
            fontWeight: '800',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            0%
          </span>
        );
      }
    };

    return (
      <div className="admin-page-container" style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '20px 16px', color: 'var(--text-primary)' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fa-solid fa-chart-bar" style={{ color: 'var(--accent-color)' }}></i>
              إحصائيات وقراءات الدليل العامة 📊📈
            </h1>
            <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '13.5px' }}>
              تتبع دقيق ولحظي للزيارات واتصالات الدليل والمطاعم
            </p>
          </div>
          <a href="/" className="hero-tag-btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '14px' }}>
            <i className="fa-solid fa-house"></i>
            <span>الرئيسية</span>
          </a>
        </header>

        {/* Summary KPI Cards - Calls */}
        <h3 style={{ marginBottom: '12px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <i className="fa-solid fa-phone" style={{ color: 'var(--accent-color)' }}></i> إحصائيات الاتصالات:
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>إجمالي اتصالات اليوم</span>
              <i className="fa-solid fa-calendar-day" style={{ color: 'var(--accent-color)', fontSize: '18px' }}></i>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '26px' }}>{todayCallsAll}</h2>
              {renderGrowthBadge(callsGrowth)}
            </div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>اتصالات أمس</span>
              <i className="fa-solid fa-clock-rotate-left" style={{ color: '#f59e0b', fontSize: '18px' }}></i>
            </div>
            <h2 style={{ margin: '10px 0 0', fontSize: '26px' }}>{yesterdayCallsAll}</h2>
          </div>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>إجمالي الاتصالات الكلي</span>
              <i className="fa-solid fa-chart-line" style={{ color: '#10b981', fontSize: '18px' }}></i>
            </div>
            <h2 style={{ margin: '10px 0 0', fontSize: '26px' }}>{totalCallsAll}</h2>
          </div>
        </div>

        {/* Summary KPI Cards - Visits */}
        <h3 style={{ marginBottom: '12px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <i className="fa-solid fa-eye" style={{ color: '#3b82f6' }}></i> إحصائيات زيارات الدليل:
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '28px' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>زيارات أمس</span>
              <i className="fa-solid fa-history" style={{ color: '#f59e0b', fontSize: '18px' }}></i>
            </div>
            <h2 style={{ margin: '10px 0 0', fontSize: '26px' }}>{yesterdayVisits}</h2>
          </div>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>إجمالي زيارات اليوم</span>
              <i className="fa-solid fa-eye" style={{ color: 'var(--accent-color)', fontSize: '18px' }}></i>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '26px' }}>{todayVisits}</h2>
              {renderGrowthBadge(visitsGrowth)}
            </div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>إجمالي زيارات الأسبوع</span>
              <i className="fa-solid fa-calendar-week" style={{ color: '#3b82f6', fontSize: '18px' }}></i>
            </div>
            <h2 style={{ margin: '10px 0 0', fontSize: '26px' }}>{weeklyVisits}</h2>
          </div>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>إجمالي زيارات الشهر</span>
              <i className="fa-solid fa-calendar-days" style={{ color: '#10b981', fontSize: '18px' }}></i>
            </div>
            <h2 style={{ margin: '10px 0 0', fontSize: '26px' }}>{monthlyVisits}</h2>
          </div>
        </div>

        {/* Calls Section Sub-Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
          {[
            { id: 'restaurants', name: 'المطاعم', icon: 'fa-utensils' },
            { id: 'captains', name: 'الكباتن', icon: 'fa-motorcycle' },
            { id: 'supermarkets', name: 'السوبرماركت', icon: 'fa-store' },
            { id: 'doctors', name: 'الأطباء', icon: 'fa-user-doctor' },
            { id: 'pharmacies', name: 'الصيدليات', icon: 'fa-mortar-pestle' },
            { id: 'gov', name: 'الحكومي والطوارئ', icon: 'fa-building-columns' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveCallsTab(tab.id);
                setCallsSearchTerm('');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: activeCallsTab === tab.id ? 'var(--accent-color)' : 'var(--bg-secondary)',
                color: activeCallsTab === tab.id ? '#fff' : 'var(--text-primary)',
                fontWeight: 'bold',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontSize: '13.5px'
              }}
            >
              <i className={`fa-solid ${tab.icon}`}></i>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Controls: Search and Sort */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
          {/* Search Input */}
          <div className="search-wrapper" style={{ margin: 0 }}>
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              className="search-input"
              placeholder={`ابحث باسم ${
                activeCallsTab === 'restaurants' ? 'المطعم' : 
                activeCallsTab === 'captains' ? 'الكابتن' : 
                activeCallsTab === 'supermarkets' ? 'السوبرماركت' : 
                activeCallsTab === 'doctors' ? 'الدكتور/العيادة' : 
                activeCallsTab === 'pharmacies' ? 'الصيدلية' : 
                'الجهة/الخدمة'
              }...`}
              value={callsSearchTerm}
              onChange={(e) => setCallsSearchTerm(e.target.value)}
            />
          </div>

          {/* Sorting Controls */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>ترتيب القائمة حسب:</span>
            <button 
              onClick={() => setSortBy('total')} 
              style={{ 
                padding: '6px 12px', 
                borderRadius: 'var(--radius-sm)', 
                border: '1px solid var(--border-color)', 
                backgroundColor: sortBy === 'total' ? 'var(--accent-color)' : 'var(--bg-secondary)', 
                color: sortBy === 'total' ? '#fff' : 'var(--text-primary)', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                fontSize: '12px'
              }}
            >
              📊 الإجمالي الكلي
            </button>
            {activeCallsTab !== 'captains' && (
              <>
                <button 
                  onClick={() => setSortBy('today')} 
                  style={{ 
                    padding: '6px 12px', 
                    borderRadius: 'var(--radius-sm)', 
                    border: '1px solid var(--border-color)', 
                    backgroundColor: sortBy === 'today' ? 'var(--accent-color)' : 'var(--bg-secondary)', 
                    color: sortBy === 'today' ? '#fff' : 'var(--text-primary)', 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}
                >
                  📞 اتصالات اليوم
                </button>
                <button 
                  onClick={() => setSortBy('yesterday')} 
                  style={{ 
                    padding: '6px 12px', 
                    borderRadius: 'var(--radius-sm)', 
                    border: '1px solid var(--border-color)', 
                    backgroundColor: sortBy === 'yesterday' ? 'var(--accent-color)' : 'var(--bg-secondary)', 
                    color: sortBy === 'yesterday' ? '#fff' : 'var(--text-primary)', 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}
                >
                  ⏳ اتصالات أمس
                </button>
              </>
            )}
            <button 
              onClick={() => setSortBy('name')} 
              style={{ 
                padding: '6px 12px', 
                borderRadius: 'var(--radius-sm)', 
                border: '1px solid var(--border-color)', 
                backgroundColor: sortBy === 'name' ? 'var(--accent-color)' : 'var(--bg-secondary)', 
                color: sortBy === 'name' ? '#fff' : 'var(--text-primary)', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                fontSize: '12px'
              }}
            >
              🔤 الاسم (أبجدي)
            </button>
          </div>
        </div>

        {/* Stats Table */}
        <div style={{ overflowX: 'auto', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px 16px' }}>{
                  activeCallsTab === 'restaurants' ? 'المطعم' : 
                  activeCallsTab === 'captains' ? 'الكابتن' : 
                  activeCallsTab === 'supermarkets' ? 'السوبرماركت' : 
                  activeCallsTab === 'doctors' ? 'الدكتور/العيادة' : 
                  activeCallsTab === 'pharmacies' ? 'الصيدلية' : 
                  'الجهة/الخدمة'
                }</th>
                <th style={{ padding: '12px 16px' }}>اتصالات اليوم</th>
                <th style={{ padding: '12px 16px' }}>اتصالات أمس</th>
                <th style={{ padding: '12px 16px' }}>آخر 7 أيام</th>
                <th style={{ padding: '12px 16px' }}>الإجمالي الكلي</th>
                <th style={{ padding: '12px 16px' }}>تفاصيل يومية</th>
              </tr>
            </thead>
            <tbody>
              {filteredStats.map((item) => (
                <React.Fragment key={item.id}>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{item.name}</td>
                    <td style={{ padding: '12px 16px', color: item.todayCalls > 0 ? 'var(--accent-color)' : 'var(--text-muted)', fontWeight: item.todayCalls > 0 ? 'bold' : 'normal' }}>{item.todayCalls}</td>
                    <td style={{ padding: '12px 16px' }}>{item.yesterdayCalls}</td>
                    <td style={{ padding: '12px 16px' }}>{item.last7DaysSum}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{item.total}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {activeCallsTab !== 'captains' ? (
                        <button
                          className="hero-tag-btn"
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                          onClick={() => setExpandedCallsRestaurantId(expandedCallsRestaurantId === item.id ? null : item.id)}
                        >
                          {expandedCallsRestaurantId === item.id ? 'إخفاء' : 'عرض السجل 📅'}
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>غير متوفر لكباتن التوصيل</span>
                      )}
                    </td>
                  </tr>
                  {expandedCallsRestaurantId === item.id && (
                    <tr>
                      <td colSpan={6} style={{ padding: '16px 20px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '13.5px', color: 'var(--text-primary)' }}>📊 سجل الاتصالات اليومي بالأوقات:</h4>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {Object.keys(item.daily).length > 0 ? (
                              Object.entries(item.daily).sort(([a], [b]) => b.localeCompare(a)).map(([date, count]) => {
                                const times = Object.values(item.logs)
                                  .filter(ts => typeof ts === 'string' && ts.startsWith(date))
                                  .map(ts => ts.split(' ')[1])
                                  .map(timeStr => timeStr ? timeStr.substring(0, 5) : '')
                                  .filter(Boolean)
                                  .sort((t1, t2) => t2.localeCompare(t1))
                                  .map(formatTo12Hour);

                                const displayContent = times.length > 0 
                                  ? times.join(' ، ') 
                                  : `${count} اتصال`;

                                return (
                                  <span key={date} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '12.5px' }}>
                                    🗓️ <strong>{date}:</strong> {displayContent}
                                  </span>
                                );
                              })
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>لا توجد اتصالات مسجلة بعد.</span>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Preloader */}
      {showPreloader && (
        <div className={`preloader-overlay ${fadePreloader ? 'fade-out' : ''}`}>
          <div className="preloader-content">
            <div className="preloader-brand-wrapper">
              <div className="preloader-ring"></div>
              <div className="preloader-ring-pulse"></div>
              <div className="preloader-icon">
                <img src={logo} alt="Logo" className="preloader-logo-img" />
              </div>
            </div>
            <h1 className="preloader-title">
              <span className="word-1">دليل مغاغة</span>
              <span className="word-2">في جيبك</span>
            </h1>
            
            <div className="preloader-description">
              <p className="preloader-lead">كل خدمات ومطاعم مغاغة في مكان واحد 🎯</p>
              <div className="preloader-features">
                <div className="preloader-feature-item item-1">
                  <i className="fa-solid fa-square-phone"></i>
                  <span>أرقام الاتصال المباشر والدليفري بنقرة واحدة</span>
                </div>
                <div className="preloader-feature-item item-2">
                  <i className="fa-solid fa-book-open"></i>
                  <span>تصفح تفاصيل الخدمات وقوائم الأسعار</span>
                </div>
                <div className="preloader-feature-item item-3">
                  <i className="fa-solid fa-clock"></i>
                  <span>مواعيد فتح وإغلاق المحلات وحالة العمل الآن</span>
                </div>
              </div>
            </div>

            <div className="preloader-bar">
              <div className="preloader-progress"></div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="app-header">
        <h1 className="brand-title"><img src={logo} alt="Logo" className="brand-logo-img" /> منيو مغاغة</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {(deferredPrompt || (isIOSDevice() && !isAppStandalone())) && (
            <button 
              className="install-app-btn" 
              onClick={handleInstallApp}
              title="تثبيت التطبيق على الشاشة"
            >
              <i className="fa-solid fa-mobile-screen-button"></i>
              <span>تثبيت التطبيق</span>
            </button>
          )}
          <button 
            className="theme-toggle-btn" 
            onClick={toggleTheme} 
            aria-label="Toggle Theme"
            title="تغيير المظهر"
          >
            {theme === 'light' ? <i className="fa-solid fa-moon"></i> : <i className="fa-solid fa-sun"></i>}
          </button>
        </div>
      </header>

      {/* Main Services Switcher */}
      <div className="scroll-indicator-wrapper secondary-bg">
        <div 
          className="main-services-tabs"
          onScroll={(e) => {
            if (Math.abs(e.target.scrollLeft) > 10) {
              setShowServicesArrow(false);
            }
          }}
        >
          <button 
            className={`service-tab ${activeMainTab === 'restaurants' ? 'active' : ''}`}
            onClick={() => {
              setActiveMainTab('restaurants');
              setSearchTerm('');
            }}
          >
            <i className="fa-solid fa-utensils"></i>
            <span>المطاعم</span>
          </button>
          <button 
            className={`service-tab ${activeMainTab === 'supermarket' ? 'active' : ''}`}
            onClick={() => {
              setActiveMainTab('supermarket');
              setSearchTerm('');
            }}
          >
            <i className="fa-solid fa-cart-shopping"></i>
            <span>سوبر ماركت</span>
          </button>
          <button 
            className={`service-tab ${activeMainTab === 'motorcycle' ? 'active' : ''}`}
            onClick={() => setActiveMainTab('motorcycle')}
          >
            <i className="fa-solid fa-motorcycle"></i>
            <span>موتوسيكل</span>
          </button>
          {/* <button 
            className={`service-tab ${activeMainTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveMainTab('jobs')}
          >
            <i className="fa-solid fa-briefcase"></i>
            <span>وظائف</span>
          </button> */}
          <button 
            className={`service-tab ${activeMainTab === 'doctors' ? 'active' : ''}`}
            onClick={() => setActiveMainTab('doctors')}
          >
            <i className="fa-solid fa-user-doctor"></i>
            <span>الأطباء</span>
          </button>
          <button 
            className={`service-tab ${activeMainTab === 'pharmacy' ? 'active' : ''}`}
            onClick={() => setActiveMainTab('pharmacy')}
          >
            <i className="fa-solid fa-mortar-pestle"></i>
            <span>الصيدليات</span>
          </button>
          <button 
            className={`service-tab ${activeMainTab === 'gov' ? 'active' : ''}`}
            onClick={() => setActiveMainTab('gov')}
          >
            <i className="fa-solid fa-building-columns"></i>
            <span>حكومي</span>
          </button>
        </div>
        {showServicesArrow && (
          <div className="scroll-arrow-indicator">
            <i className="fa-solid fa-chevron-left"></i>
          </div>
        )}
      </div>

      {/* Global Search Bar */}
      <div className="global-search-container" style={{ maxWidth: '600px', margin: '16px auto 0 auto', padding: '0 16px', width: '100%', boxSizing: 'border-box' }}>
        <div className="search-wrapper hero-search-box" style={{ margin: '0' }}>
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            type="text"
            className="search-input"
            placeholder="ابحث في دليل مغاغة الشامل (مطاعم، أطباء، صيدليات، سوبر ماركت، خدمات...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Area */}
      <main className="app-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <img src={logoTow} alt="Menu Maghagha Logo" className="hero-logo-img" />
            <h2 className="hero-title">
              {activeMainTab === 'restaurants' && "دليل مطاعم مغاغة ف جيبك 🍔"}
              {activeMainTab === 'supermarket' && "دليل السوبر ماركت ف جيبك 🛒"}
              {activeMainTab === 'jobs' && "دليل وظائف وفرص عمل مغاغة 💼"}
              {activeMainTab === 'doctors' && "دليل عيادات وأطباء مغاغة 👨‍⚕️"}
              {activeMainTab === 'pharmacy' && "دليل صيدليات مغاغة 💊"}
              {activeMainTab === 'gov' && "الدليل الحكومي والخدمي بمغاغة 🏛️"}
              {activeMainTab === 'motorcycle' && "كباتن دليفري مغاغة ف جيبك 🏍️"}
            </h2>
            {/* <p className="hero-subtitle">
              {activeMainTab === 'restaurants' && "منصتك المتكاملة لتصفح منيو، أسعار، تليفونات وعناوين جميع مطاعم مغاغة بنقرة واحدة!"}
              {activeMainTab === 'supermarket' && "تصفح أرقام، فروع، وعروض أفضل المحلات والسوبر ماركت في مغاغة!"}
              {activeMainTab === 'jobs' && "منصتك للتواصل المباشر بين الباحثين عن عمل وأصحاب الأعمال والمحلات في مغاغة!"}
              {activeMainTab === 'doctors' && "دليل كامل لأشطر الأطباء والعيادات بمختلف التخصصات في مغاغة."}
              {activeMainTab === 'pharmacy' && "دليل كامل للصيدليات المتاحة والعاملة في مغاغة لتلبية احتياجاتك الدوائية."}
              {activeMainTab === 'gov' && "دليل أرقام، عناوين، ومواعيد المصالح الحكومية والخدمات والمرافق العامة بمغاغة."}
              {activeMainTab === 'motorcycle' && "تواصل مباشرة مع أسرع كباتن توصيل طلبات ومشاوير وسفر داخل مغاغة وضواحيها!"}
            </p> */}

            {/* Quick Search Tag Helpers */}
            {activeMainTab === 'restaurants' && (
              <div className="hero-tags">
                <span className="tags-label">الأكثر بحثاً:</span>
                {['بروست', 'كريب', 'شاورما'].map(tag => (
                  <button 
                    key={tag} 
                    className="hero-tag-btn"
                    onClick={() => setSearchTerm(tag)}
                  >
                    {tag}
                  </button>
                ))}
                {searchTerm && (
                  <button className="hero-tag-clear" onClick={() => setSearchTerm('')}>
                    مسح <i className="fa-solid fa-xmark"></i>
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {activeMainTab === 'restaurants' ? (
          <>
            {/* Categories Carousel */}
            <div className="scroll-indicator-wrapper primary-bg">
              <div 
                className="categories-container"
                onScroll={(e) => {
                  if (Math.abs(e.target.scrollLeft) > 10) {
                    setShowCategoriesArrow(false);
                  }
                }}
              >
                {CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    className={`category-chip ${selectedCategory === category.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {renderCategoryIcon(category.icon)}
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
              {showCategoriesArrow && (
                <div className="scroll-arrow-indicator">
                  <i className="fa-solid fa-chevron-left"></i>
                </div>
              )}
            </div>

            {/* Restaurants List */}
            {filteredRestaurants.length > 0 ? (
              <div className="restaurants-grid">
                {filteredRestaurants.map(restaurant => {
                  const isOpen = isRestaurantOpen(restaurant.workingHours);
                  return (
                    <div 
                      key={restaurant.id} 
                      className="restaurant-card"
                      onClick={() => setSelectedRestaurant(restaurant)}
                    >
                      <img 
                        src={resolveImage(restaurant.logo)} 
                        alt={restaurant.name} 
                        className="restaurant-logo" 
                        loading="lazy"
                      />
                      <div className="restaurant-info">
                        <div className="restaurant-header-row">
                          <h2 className="restaurant-name">{restaurant.name}</h2>
                          <span className={`status-badge ${isOpen ? 'open' : 'closed'}`}>
                            {isOpen ? 'مفتوح ' : 'مغلق '}
                          </span>
                        </div>

                        {(() => {
                          const rData = ratings[restaurant.id] || { sum: 0, count: 0 };
                          const avgRating = rData.count > 0 ? (rData.sum / rData.count).toFixed(1) : null;
                          if (!avgRating) return null;
                          return (
                            <div className="restaurant-card-rating">
                              <i className="fa-solid fa-star star-icon"></i>
                              <span>{avgRating} ({rData.count} تقييم)</span>
                            </div>
                          );
                        })()}

                        <p className="restaurant-desc">{restaurant.description}</p>
                        
                        <div className="restaurant-meta">
                          <div className="meta-item">
                            <i className="fa-solid fa-location-dot info-icon" style={{ fontSize: '12px' }}></i>
                            <span>{restaurant.address.split(' - ')[0]}</span>
                          </div>
                          <div className="meta-item">
                            <i className="fa-solid fa-truck info-icon" style={{ fontSize: '12px' }}></i>
                            <span>توصيل: {restaurant.deliveryFee}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <i className="fa-solid fa-inbox" style={{ fontSize: '48px', marginBottom: '10px', opacity: 0.5 }}></i>
                <h3 className="empty-state-title">لا توجد نتائج بحث تطابق مدخلاتك</h3>
                <p>جرّب البحث بكلمة مختلفة أو غير التصنيف المحدد.</p>
              </div>
            )}
          </>
        ) : activeMainTab === 'motorcycle' ? (
          <>
            {/* Captains Filter Chips */}
            <div className="scroll-indicator-wrapper primary-bg">
              <div className="categories-container">
                <button 
                  className={`category-chip ${selectedCaptainService === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedCaptainService('all')}
                >
                  <i className="fa-solid fa-motorcycle"></i>
                  <span>الكل</span>
                </button>
                <button 
                  className={`category-chip ${selectedCaptainService === 'توصيل طلبات' ? 'active' : ''}`}
                  onClick={() => setSelectedCaptainService('توصيل طلبات')}
                >
                  <i className="fa-solid fa-truck-ramp-box"></i>
                  <span>توصيل طلبات</span>
                </button>
                <button 
                  className={`category-chip ${selectedCaptainService === 'مشاوير' ? 'active' : ''}`}
                  onClick={() => setSelectedCaptainService('مشاوير')}
                >
                  <i className="fa-solid fa-route"></i>
                  <span>مشاوير</span>
                </button>
              </div>
            </div>

            <div className="captains-grid">
              {(() => {
                const filteredCaptains = shuffledCaptains.filter(captain => {
                  const matchesService = selectedCaptainService === 'all' || captain.serviceTypes.includes(selectedCaptainService);
                  const matchesSearch = !searchTerm || 
                    captain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (captain.description && captain.description.toLowerCase().includes(searchTerm.toLowerCase()));
                  return matchesService && matchesSearch;
                });

                if (filteredCaptains.length === 0) {
                  return (
                    <div className="empty-state" style={{ gridColumn: '1 / -1', padding: '40px 20px' }}>
                      <i className="fa-solid fa-motorcycle" style={{ fontSize: '48px', marginBottom: '10px', opacity: 0.5 }}></i>
                      <h3 className="empty-state-title">لا توجد نتائج بحث تطابق مدخلاتك</h3>
                      <p>جرّب البحث باسم الكابتن أو ميزة أخرى.</p>
                    </div>
                  );
                }

                return filteredCaptains.map(captain => {
                  const rData = ratings[captain.id] || { sum: 0, count: 0 };
                  const avgRating = rData.count > 0 ? (rData.sum / rData.count).toFixed(1) : null;
                  
                  return (
                    <div 
                      key={captain.id} 
                      className="captain-card"
                      onClick={() => setSelectedRestaurant(captain)}
                    >
                      <div className="captain-avatar-wrapper">
                        <img 
                          src={resolveImage(captain.avatar)} 
                          alt={captain.name} 
                          className="captain-avatar" 
                          loading="lazy"
                        />
                        <span className={`captain-status-dot ${captain.isAvailable ? 'available' : 'unavailable'}`}></span>
                      </div>
                      
                      <div className="captain-info">
                        <div className="captain-name-row">
                          <h2 className="captain-name">{captain.name}</h2>
                          {avgRating && (
                            <div className="captain-rating">
                              <i className="fa-solid fa-star"></i>
                              <span>{avgRating}</span>
                            </div>
                          )}
                        </div>
                        
                        <p className="captain-desc">{captain.description}</p>
                        
                        <div className="captain-services">
                          {captain.serviceTypes.slice(0, 2).map((srv, sIdx) => (
                            <span key={sIdx} className="captain-service-badge">{srv}</span>
                          ))}
                          {captain.serviceTypes.length > 2 && (
                            <span className="captain-service-badge">+{captain.serviceTypes.length - 2} المزيد</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </>
        ) : activeMainTab === 'supermarket' ? (
          <div className="captains-grid">
            {shuffledSupermarkets.filter(market => !searchTerm || market.name.toLowerCase().includes(searchTerm.toLowerCase()) || (market.description && market.description.toLowerCase().includes(searchTerm.toLowerCase()))).map(market => (
              <div 
                key={market.id} 
                className="captain-card"
                onClick={() => setSelectedRestaurant(market)}
              >
                <div className="captain-avatar-wrapper">
                  <img 
                    src={resolveImage(market.logo)} 
                    alt={market.name} 
                    className="captain-avatar" 
                    loading="lazy"
                  />
                  <span className={`captain-status-dot ${isRestaurantOpen(market.workingHours) ? 'available' : 'unavailable'}`}></span>
                </div>
                
                <div className="captain-info">
                  <div className="captain-name-row">
                    <h2 className="captain-name">{market.name}</h2>
                  </div>
                  
                  <p className="captain-desc">{market.description}</p>
                  
                  <div className="captain-services">
                    {market.branches && <span className="captain-service-badge">🏬 {market.branches.length} فروع في مغاغة</span>}
                    <span className="captain-service-badge">🛵 خدمة دليفري</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeMainTab === 'jobs' ? (
          <div className="jobs-section-container">
            {/* Sub Tabs Switcher */}
            <div className="job-subtabs-wrapper">
              <button 
                className={`job-subtab-btn ${activeJobSubTab === 'seekers' ? 'active' : ''}`}
                onClick={() => setActiveJobSubTab('seekers')}
              >
                <i className="fa-solid fa-user-tie"></i>
                <span>باحثون عن عمل ({jobSeekers.length})</span>
              </button>
              <button 
                className={`job-subtab-btn ${activeJobSubTab === 'vacancies' ? 'active' : ''}`}
                onClick={() => setActiveJobSubTab('vacancies')}
              >
                <i className="fa-solid fa-bullhorn"></i>
                <span>فرص عمل جديدة ({jobVacancies.length})</span>
              </button>
            </div>

            {/* Job Seekers Grid */}
            {activeJobSubTab === 'seekers' ? (
              <div className="jobs-grid">
                {shuffledJobSeekers.map((seeker) => (
                  <div key={seeker.id} className="job-card seeker-card">
                    <div className="job-card-header">
                      <div className="job-avatar-icon">
                        <i className="fa-solid fa-user"></i>
                      </div>
                      <div className="job-user-info">
                        <h3 className="job-person-name">{seeker.name}</h3>
                        <span className="job-badge-desired"><i className="fa-solid fa-briefcase"></i> {seeker.jobDesired}</span>
                      </div>
                      <span className="vacancy-notice-badge" style={{ marginRight: 'auto' }}><i className="fa-solid fa-flask"></i> نموذج تجريبي</span>
                    </div>

                    <div className="job-card-details">
                      <div className="job-detail-row">
                        <i className="fa-solid fa-cake-candles"></i>
                        <span>السن: {seeker.age}</span>
                      </div>
                      <div className="job-detail-row">
                        <i className="fa-solid fa-graduation-cap"></i>
                        <span>المؤهل: {seeker.education}</span>
                      </div>
                      <div className="job-detail-row">
                        <i className="fa-solid fa-location-dot"></i>
                        <span>العنوان: {seeker.location}</span>
                      </div>
                      <p className="job-skills-box">
                        <i className="fa-solid fa-star"></i> <strong>الخبرات والمهارات:</strong> {seeker.skills}
                      </p>
                    </div>

                    <div className="job-card-actions">
                      <a href={`tel:${seeker.phone}`} className="job-action-btn btn-call">
                        <i className="fa-solid fa-phone"></i>
                        <span>اتصال مباشر</span>
                      </a>
                      <a 
                        href={`https://wa.me/${seeker.whatsApp}?text=${encodeURIComponent(`أهلاً ${seeker.name}، تواصلت معك من خلال قسم الوظائف في دليل مغاغة بشأن فرصة عمل.`)}`}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="job-action-btn btn-wa"
                      >
                        <i className="fa-brands fa-whatsapp"></i>
                        <span>واتساب</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Job Vacancies Grid */
              <div className="jobs-grid">
                {shuffledJobVacancies.map((vacancy) => (
                  <div key={vacancy.id} className="job-card vacancy-card">
                    <div className="vacancy-header-bar">
                      <span className="vacancy-tag-badge"><i className="fa-solid fa-circle-check"></i> فرصة عمل متاحة</span>
                      <span className="vacancy-notice-badge"><i className="fa-solid fa-flask"></i> نموذج تجريبي</span>
                    </div>

                    <h3 className="vacancy-title">{vacancy.title}</h3>
                    <h4 className="vacancy-business-name"><i className="fa-solid fa-store"></i> {vacancy.businessName}</h4>

                    <div className="job-card-details">
                      <div className="job-detail-row">
                        <i className="fa-solid fa-clock"></i>
                        <span><strong>تفاصيل الشيفت:</strong> {vacancy.workType}</span>
                      </div>
                      <div className="job-detail-row">
                        <i className="fa-solid fa-clipboard-list"></i>
                        <span><strong>الشروط والمتطلبات:</strong> {vacancy.requirements}</span>
                      </div>
                      <div className="job-detail-row">
                        <i className="fa-solid fa-money-bill-wave"></i>
                        <span><strong>المرتب / النظام:</strong> {vacancy.salary}</span>
                      </div>
                      <div className="job-detail-row">
                        <i className="fa-solid fa-location-dot"></i>
                        <span><strong>العنوان:</strong> {vacancy.location}</span>
                      </div>
                    </div>

                    <div className="job-card-actions">
                      <a href={`tel:${vacancy.phone}`} className="job-action-btn btn-call">
                        <i className="fa-solid fa-phone"></i>
                        <span>اتصل للتقديم</span>
                      </a>
                      <a 
                        href={`https://wa.me/${vacancy.whatsApp}?text=${encodeURIComponent(`أهلاً، تواصلت معكم بشأن إعلان (${vacancy.title}) المنشور في دليل مغاغة.`)}`}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="job-action-btn btn-wa"
                      >
                        <i className="fa-brands fa-whatsapp"></i>
                        <span>قدم عبر الواتساب</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA Banner to add Job Post */}
            <div className="job-cta-banner">
              <div className="job-cta-text">
                <h3>هل تبحث عن عمل أو تطلب موظفين لمشروعك؟ 💼</h3>
                <p>أضف بياناتك أو إعلان وظيفتك مجاناً ليصل لآلاف الأهالي في مغاغة!</p>
              </div>
              <a 
                href={`https://wa.me/201558606314?text=${encodeURIComponent("أريد إضافة إعلان وظيفة / سيرتي الذاتية في قسم الوظائف بدليل مغاغة")}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="job-cta-btn"
              >
                <i className="fa-brands fa-whatsapp"></i>
                <span>أضف بياناتك الآن</span>
              </a>
            </div>
          </div>
        ) : activeMainTab === 'doctors' ? (
          <div className="doctors-section-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Doctor Categories Filter Carousel (Sticky) */}
            <div className="scroll-indicator-wrapper primary-bg">
              <div className="categories-container">
                {doctorCategories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`category-chip ${selectedDoctorCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setSelectedDoctorCategory(cat.id)}
                  >
                    <i className={`fa-solid ${cat.icon}`}></i>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Doctors Cards Grid */}
            {(() => {
              const filteredDoctors = shuffledDoctors.filter((doc) => {
                const matchesSearch = !searchTerm || 
                  doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  doc.address.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesCategory = searchTerm.trim() ? true : (doc.specialtyId === selectedDoctorCategory);
                return matchesCategory && matchesSearch;
              });

              const sortedDoctors = [...filteredDoctors].sort((a, b) => {
                const aFeatured = a.isFeatured || a.id === 'doc_phys_6';
                const bFeatured = b.isFeatured || b.id === 'doc_phys_6';
                if (aFeatured && !bFeatured) return -1;
                if (!aFeatured && bFeatured) return 1;
                return 0;
              });

              if (sortedDoctors.length === 0) {
                return (
                  <div className="empty-state">
                    <i className="fa-solid fa-user-doctor" style={{ fontSize: '48px', marginBottom: '10px', opacity: 0.5 }}></i>
                    <h3 className="empty-state-title">لا يزال جارٍ إضافة عيادات وأطباء هذا التخصص</h3>
                    <p>يمكنك التبديل إلى تخصص آخر أو البحث باسم الدكتور / العيادة.</p>
                  </div>
                );
              }

              return (
                <div className="jobs-grid">
                  {sortedDoctors.map((doc) => {
                    const isFeatured = doc.isFeatured || doc.id === 'doc_phys_6';
                    const rawPhone = doc.phone && doc.phone !== '—' ? doc.phone : null;
                    const phoneNumbers = rawPhone ? rawPhone.split('/').map(n => n.trim()).filter(Boolean) : [];

                    return (
                      <div 
                        key={doc.id} 
                        className={`job-card vacancy-card ${isFeatured ? 'featured-doctor-card' : ''}`}
                        style={isFeatured ? {
                          border: '2px solid #d4af37',
                          boxShadow: '0 4px 20px rgba(212, 175, 55, 0.25)',
                          position: 'relative',
                          overflow: 'hidden',
                          background: 'linear-gradient(to bottom, var(--bg-secondary), rgba(212, 175, 55, 0.03))'
                        } : {}}
                      >
                        {isFeatured && (
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            backgroundColor: '#d4af37',
                            color: '#000',
                            padding: '3px 8px',
                            borderRadius: '30px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <i className="fa-solid fa-star"></i>
                            <span>طبيب مميز</span>
                          </div>
                        )}
                        <div className="vacancy-header-bar">
                          <h3 className="vacancy-title" style={{ margin: 0 }}>{doc.name}</h3>
                          <span className="vacancy-tag-badge">
                            <i className="fa-solid fa-stethoscope"></i> {doc.specialty}
                          </span>
                        </div>

                        {doc.title && (
                          <h4 className="vacancy-business-name" style={{ marginTop: '4px' }}>
                            <i className="fa-solid fa-user-doctor"></i> {doc.title}
                          </h4>
                        )}

                        <div className="job-card-details">
                          <div className="job-detail-row-inline" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px' }}>
                            <i className="fa-solid fa-location-dot" style={{ color: 'var(--accent-color)' }}></i>
                            <span><strong>العنوان:</strong> {doc.address}</span>
                          </div>
                          {doc.workingHours && (
                            <div className="job-detail-row-inline" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', marginTop: '6px' }}>
                              <i className="fa-solid fa-clock" style={{ color: 'var(--accent-color)' }}></i>
                              <span><strong>مواعيد العمل:</strong> {doc.workingHours}</span>
                            </div>
                          )}
                        </div>

                        <div className="job-card-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {phoneNumbers.length === 1 ? (
                            <a href={`tel:${phoneNumbers[0]}`} className="job-action-btn btn-call" style={{ flex: '0 0 auto', padding: '10px 18px' }} onClick={() => handleIncrementCall('doctors', doc.id)}>
                              <i className="fa-solid fa-phone"></i>
                              <span>اتصال</span>
                            </a>
                          ) : phoneNumbers.length > 1 ? (
                            <button 
                              className="job-action-btn btn-call" 
                              style={{ flex: '0 0 auto', padding: '10px 18px', cursor: 'pointer' }}
                              onClick={() => setPhoneSelectorList(phoneNumbers.map((num, idx) => ({ label: `اتصال بالخط ${idx + 1}: ${num}`, number: num, category: 'doctors', itemId: doc.id })))}
                            >
                              <i className="fa-solid fa-phone"></i>
                              <span>اتصال ({phoneNumbers.length})</span>
                            </button>
                          ) : (
                            <div className="job-action-btn" style={{ flex: '0 0 auto', background: 'var(--bg-tertiary)', color: 'var(--text-muted)', cursor: 'default', padding: '10px 14px' }}>
                              <i className="fa-solid fa-phone-slash"></i>
                              <span>بدون تليفون</span>
                            </div>
                          )}

                          <div className="doc-working-hours-badge" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'var(--accent-light)', color: 'var(--accent-color)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '12.5px', fontWeight: '700' }}>
                            <i className="fa-regular fa-calendar-days" style={{ fontSize: '13.5px' }}></i>
                            <span>{doc.workingDays || 'يومياً عدا الجمعة'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Doctor CTA Banner */}
            <div className="job-cta-banner">
              <div className="job-cta-text">
                <h3>هل أنت طبيب أو صاحب عيادة/معمل في مغاغة؟ 👨‍⚕️</h3>
                <p>أضف بيانات عيادتك ومواعيد كشفك مجاناً لتسهيل وصول المرضى إليك!</p>
              </div>
              <a 
                href={`https://wa.me/201558606314?text=${encodeURIComponent("أريد إضافة بيانات عيادتي / معملي في قسم الأطباء بدليل مغاغة")}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="job-cta-btn"
              >
                <i className="fa-brands fa-whatsapp"></i>
                <span>أضف عيادتك الآن</span>
              </a>
            </div>
          </div>
        ) : activeMainTab === 'pharmacy' ? (
          <div className="doctors-section-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {(() => {
              const filteredPharmacies = shuffledPharmacies.filter((ph) => {
                return !searchTerm || 
                  ph.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  ph.address.toLowerCase().includes(searchTerm.toLowerCase());
              });

              if (filteredPharmacies.length === 0) {
                return (
                  <div className="empty-state">
                    <i className="fa-solid fa-mortar-pestle" style={{ fontSize: '48px', marginBottom: '10px', opacity: 0.5 }}></i>
                    <h3 className="empty-state-title">لا يوجد صيدليات تطابق بحثك</h3>
                    <p>يرجى التأكد من كتابة الاسم بشكل صحيح أو تصفح باقي الصيدليات.</p>
                  </div>
                );
              }

              return (
                <div className="jobs-grid">
                  {filteredPharmacies.map((ph) => {
                    const rawPhone = ph.phone && ph.phone !== '—' ? ph.phone : null;
                    const phoneNumbers = rawPhone ? rawPhone.split('/').map(n => n.trim()).filter(Boolean) : [];

                    return (
                      <div key={ph.id} className="job-card vacancy-card">
                        <div className="vacancy-header-bar">
                          <h3 className="vacancy-title" style={{ margin: 0 }}>{ph.name}</h3>
                          <span className="vacancy-tag-badge" style={{ background: '#e8f5e9', color: '#2e7d32' }}>
                            <i className="fa-solid fa-clock"></i> {ph.workingHours || 'مفتوح على مدار الساعة'}
                          </span>
                        </div>

                        <div className="job-card-details">
                          <div className="job-detail-row-inline" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px' }}>
                            <i className="fa-solid fa-location-dot" style={{ color: 'var(--accent-color)' }}></i>
                            <span><strong>العنوان:</strong> {ph.address}</span>
                          </div>
                        </div>

                        <div className="job-card-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
                          {phoneNumbers.length === 1 ? (
                            <a href={`tel:${phoneNumbers[0]}`} className="job-action-btn btn-call" style={{ flex: '1 1 auto', padding: '10px 18px', textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => handleIncrementCall('pharmacies', ph.id)}>
                              <i className="fa-solid fa-phone"></i>
                              <span>اتصال</span>
                            </a>
                          ) : phoneNumbers.length > 1 ? (
                            <button 
                              className="job-action-btn btn-call" 
                              style={{ flex: '1 1 auto', padding: '10px 18px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                              onClick={() => setPhoneSelectorList(phoneNumbers.map((num, idx) => ({ label: `اتصال بالخط ${idx + 1}: ${num}`, number: num, category: 'pharmacies', itemId: ph.id })))}
                            >
                              <i className="fa-solid fa-phone"></i>
                              <span>اتصال ({phoneNumbers.length})</span>
                            </button>
                          ) : (
                            <div className="job-action-btn" style={{ flex: '1 1 auto', background: 'var(--bg-tertiary)', color: 'var(--text-muted)', cursor: 'default', padding: '10px 14px', textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                              <i className="fa-solid fa-phone-slash"></i>
                              <span>بدون تليفون</span>
                            </div>
                          )}

                          {ph.locationUrl && (
                            <a 
                              href={ph.locationUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="job-action-btn" 
                              style={{ flex: '1 1 auto', backgroundColor: 'var(--brand-dark-blue)', color: 'white', padding: '10px 18px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: 'var(--radius-sm)' }}
                            >
                              <i className="fa-solid fa-location-arrow"></i>
                              <span>الاتجاهات</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Pharmacy CTA Banner */}
            <div className="job-cta-banner">
              <div className="job-cta-text">
                <h3>هل أنت صاحب صيدلية في مغاغة؟ 💊</h3>
                <p>أضف بيانات صيدليتك ومواعيد العمل مجاناً لتسهيل وصول أهالي مغاغة إليك!</p>
              </div>
              <a 
                href={`https://wa.me/201558606314?text=${encodeURIComponent("أريد إضافة بيانات صيدليتي في قسم الصيدليات بدليل مغاغة")}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="job-cta-btn"
              >
                <i className="fa-brands fa-whatsapp"></i>
                <span>أضف صيدليتك الآن</span>
              </a>
            </div>
          </div>
        ) : activeMainTab === 'gov' ? (
          <div className="doctors-section-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Gov Sub-Tabs Switcher */}
            <div className="scroll-indicator-wrapper primary-bg" style={{ alignSelf: 'stretch', marginBottom: '8px' }}>
              <div className="categories-container" style={{ justifyContent: 'center', gap: '12px' }}>
                <button 
                  className={`category-chip ${activeGovSubTab === 'civil' ? 'active' : ''}`}
                  onClick={() => setActiveGovSubTab('civil')}
                  style={{ padding: '10px 24px', fontSize: '14px', borderRadius: '30px' }}
                >
                  <i className="fa-solid fa-building-columns"></i>
                  <span>المدني</span>
                </button>
                <button 
                  className={`category-chip ${activeGovSubTab === 'emergency' ? 'active' : ''}`}
                  onClick={() => setActiveGovSubTab('emergency')}
                  style={{ 
                    padding: '10px 24px', 
                    fontSize: '14px', 
                    borderRadius: '30px',
                    backgroundColor: activeGovSubTab === 'emergency' ? '#dc2626' : 'var(--bg-secondary)',
                    color: activeGovSubTab === 'emergency' ? '#ffffff' : 'var(--text-primary)',
                    borderColor: activeGovSubTab === 'emergency' ? '#dc2626' : 'var(--border-color)'
                  }}
                >
                  <i className="fa-solid fa-shield-heart"></i>
                  <span>طوارئ</span>
                </button>
              </div>
            </div>

            {(() => {
              const filteredGov = shuffledGovServices.filter((gov) => {
                const matchesCategory = gov.category === activeGovSubTab;
                const matchesSearch = !searchTerm || 
                  gov.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  gov.address.toLowerCase().includes(searchTerm.toLowerCase());
                return matchesCategory && matchesSearch;
              });

              if (filteredGov.length === 0) {
                return (
                  <div className="empty-state">
                    <i className={activeGovSubTab === 'emergency' ? "fa-solid fa-shield-heart" : "fa-solid fa-building-columns"} style={{ fontSize: '48px', marginBottom: '10px', opacity: 0.5, color: activeGovSubTab === 'emergency' ? '#dc2626' : 'inherit' }}></i>
                    <h3 className="empty-state-title">لا توجد جهات تطابق بحثك</h3>
                    <p>يرجى التأكد من كتابة الاسم بشكل صحيح أو تصفح باقي العناصر.</p>
                  </div>
                );
              }

              return (
                <div className="jobs-grid">
                  {filteredGov.map((gov) => {
                    const rawPhone = gov.phone && gov.phone !== '—' ? gov.phone : null;
                    const phoneNumbers = rawPhone ? rawPhone.split('/').map(n => n.trim()).filter(Boolean) : [];

                    return (
                      <div key={gov.id} className="job-card vacancy-card">
                        <div className="vacancy-header-bar">
                          <h3 className="vacancy-title" style={{ margin: 0 }}>{gov.name}</h3>
                          <span className="vacancy-tag-badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                            <i className="fa-solid fa-clock"></i> {gov.workingHours || 'مفتوح'}
                          </span>
                        </div>

                        <div className="job-card-details">
                          <div className="job-detail-row-inline" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px' }}>
                            <i className="fa-solid fa-location-dot" style={{ color: 'var(--accent-color)' }}></i>
                            <span><strong>العنوان:</strong> {gov.address}</span>
                          </div>
                        </div>

                        <div className="job-card-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
                          {phoneNumbers.length === 1 ? (
                            <a href={`tel:${phoneNumbers[0]}`} className="job-action-btn btn-call" style={{ flex: '1 1 auto', padding: '10px 18px', textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => handleIncrementCall('gov_services', gov.id)}>
                              <i className="fa-solid fa-phone"></i>
                              <span>اتصال</span>
                            </a>
                          ) : phoneNumbers.length > 1 ? (
                            <button 
                              className="job-action-btn btn-call" 
                              style={{ flex: '1 1 auto', padding: '10px 18px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                              onClick={() => setPhoneSelectorList(phoneNumbers.map((num, idx) => ({ label: `اتصال بالخط ${idx + 1}: ${num}`, number: num, category: 'gov_services', itemId: gov.id })))}
                            >
                              <i className="fa-solid fa-phone"></i>
                              <span>اتصال ({phoneNumbers.length})</span>
                            </button>
                          ) : (
                            <div className="job-action-btn" style={{ flex: '1 1 auto', background: 'var(--bg-tertiary)', color: 'var(--text-muted)', cursor: 'default', padding: '10px 14px', textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                              <i className="fa-solid fa-phone-slash"></i>
                              <span>بدون تليفون</span>
                            </div>
                          )}

                          {gov.locationUrl && (
                            <a 
                              href={gov.locationUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="job-action-btn" 
                              style={{ flex: '1 1 auto', backgroundColor: 'var(--brand-dark-blue)', color: 'white', padding: '10px 18px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: 'var(--radius-sm)' }}
                            >
                              <i className="fa-solid fa-location-arrow"></i>
                              <span>الاتجاهات</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Gov CTA Banner */}
            <div className="job-cta-banner">
              <div className="job-cta-text">
                <h3>هل تريد إضافة أو تحديث بيانات جهة خدمية؟ 🏛️</h3>
                <p>ساهم معنا في تحديث الدليل الخدمي لمغاغة لتسهيل الوصول للخدمات الحكومية والعامة!</p>
              </div>
              <a 
                href={`https://wa.me/201558606314?text=${encodeURIComponent("أريد إضافة / تحديث بيانات جهة خدمية في دليل مغاغة")}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="job-cta-btn"
              >
                <i className="fa-brands fa-whatsapp"></i>
                <span>تواصل معنا الآن</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="coming-soon-container">
            <div className="coming-soon-card">
              <div className="coming-soon-icon">
                <i className="fa-solid fa-mortar-pestle coming-soon-pulse"></i>
              </div>
              <h3 className="coming-soon-title">هذه الخدمة ستتوفر قريباً 🚀</h3>
              <p className="coming-soon-text">
                دليل كامل للصيدليات المتاحة والعاملة في مغاغة لتلبية جميع احتياجاتك الدوائية.
              </p>
              <div className="coming-soon-badge">قيد التطوير والتحضير</div>
            </div>
          </div>
        )}
      </main>

      {/* Details Bottom Sheet (Drawer) */}
      {selectedRestaurant && (() => {
        const isCaptain = typeof selectedRestaurant.id === 'string' && selectedRestaurant.id.startsWith('captain_');
        const isSupermarket = typeof selectedRestaurant.id === 'string' && selectedRestaurant.id.startsWith('supermarket_');
        return (
          <div className="drawer-overlay" onClick={() => setSelectedRestaurant(null)}>
            <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
              <div className="drawer-header" style={{ alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', width: '100%', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {isCaptain ? (
                      <img 
                        src={resolveImage(selectedRestaurant.avatar)} 
                        alt={selectedRestaurant.name} 
                        style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '2px solid var(--border-color)' }}
                      />
                    ) : (
                      <img 
                        src={resolveImage(selectedRestaurant.logo)} 
                        alt={selectedRestaurant.name} 
                        style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '2px solid var(--border-color)' }}
                      />
                    )}
                    {isCaptain ? (
                      <span className={`status-badge ${selectedRestaurant.isAvailable ? 'open' : 'closed'}`} style={{ display: 'inline-block', fontSize: '10px', padding: '3px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {selectedRestaurant.isAvailable ? '🟢 متاح' : '🔴 غير متاح'}
                      </span>
                    ) : (
                      <span className={`status-badge ${isRestaurantOpen(selectedRestaurant.workingHours) ? 'open' : 'closed'}`} style={{ display: 'inline-block', fontSize: '10px', padding: '3px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {isRestaurantOpen(selectedRestaurant.workingHours) ? 'مفتوح الآن' : 'مغلق حالياً'}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <h2 className="restaurant-detail-title">{selectedRestaurant.name}</h2>
                    <p className="restaurant-desc" style={{ WebkitLineClamp: 'unset', marginTop: '4px' }}>{selectedRestaurant.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => handleShare(selectedRestaurant.id)} 
                        className="share-btn-detail"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-secondary)',
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: '700',
                          width: 'fit-content',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <i className="fa-solid fa-share-nodes"></i>
                        <span>{copySuccess ? 'تم نسخ الرابط! ✓' : 'مشاركة  '}</span>
                      </button>

                      {!isCaptain && !isSupermarket && (
                        <div className="promo-badge">
                          <i className="fa-solid fa-tag promo-icon"></i>
                          <span>كود الخصم:</span>
                          <strong>{getPromoCode(selectedRestaurant)}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button className="close-btn" onClick={() => setSelectedRestaurant(null)} style={{ alignSelf: 'flex-start' }}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              {/* Quick action buttons */}
              <div className="action-buttons-grid">
                {isCaptain ? (
                  <>
                    <a 
                      href={`tel:${selectedRestaurant.phone}`} 
                      className="action-btn btn-call"
                      onClick={() => handleIncrementTrips(selectedRestaurant.id)}
                    >
                      <i className="fa-solid fa-phone"></i>
                      <span>اتصال بالكابتن</span>
                    </a>
                    <a 
                      href={`https://wa.me/20${selectedRestaurant.phone}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="action-btn btn-whatsapp"
                      onClick={() => handleIncrementTrips(selectedRestaurant.id)}
                    >
                      <i className="fa-brands fa-whatsapp"></i>
                      <span>تواصل عبر واتساب</span>
                    </a>
                  </>
                ) : selectedRestaurant.secondBranchPhones ? (
                  <>
                    <button 
                      onClick={() => {
                        setPhoneSelectorList(selectedRestaurant.phones);
                      }} 
                      className="action-btn btn-call"
                    >
                      <i className="fa-solid fa-phone"></i>
                      <span>فرع شارع الثورة</span>
                    </button>
                    
                    <button 
                      onClick={() => {
                        setPhoneSelectorList(selectedRestaurant.secondBranchPhones);
                      }} 
                      className="action-btn"
                      style={{ backgroundColor: 'var(--brand-dark-blue)', color: 'white' }}
                    >
                      <i className="fa-solid fa-phone"></i>
                      <span>فرع شارع المحطة</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        if (selectedRestaurant.phones && selectedRestaurant.phones.length > 1) {
                          setPhoneSelectorList(selectedRestaurant.phones);
                        } else if (selectedRestaurant.phones && selectedRestaurant.phones.length === 1) {
                          const phone = selectedRestaurant.phones[0];
                          const number = typeof phone === 'object' && phone !== null ? phone.number : phone;
                          handleInitiateCall(number, selectedRestaurant);
                        }
                      }} 
                      className="action-btn btn-call"
                    >
                      <i className="fa-solid fa-phone"></i>
                      <span>اطلب الدليفري</span>
                    </button>
                    {selectedRestaurant.whatsApp ? (
                      <a 
                        href={`https://wa.me/${selectedRestaurant.whatsApp}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="action-btn btn-whatsapp"
                      >
                        <i className="fa-brands fa-whatsapp"></i>
                        <span>طلب عبر الواتساب</span>
                      </a>
                    ) : (
                      <button className="action-btn btn-whatsapp" style={{ opacity: 0.5, cursor: 'not-allowed' }} disabled>
                        <i className="fa-brands fa-whatsapp"></i>
                        <span>الواتساب غير متوفر</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            {/* Rating Section */}
            <div className="rating-section">
              <div className="rating-header">
                <h3 className="drawer-section-title">تقييمك للمكان</h3>
                <div className="rating-stats">
                  {(() => {
                    const rData = ratings[selectedRestaurant.id] || { sum: 0, count: 0 };
                    const avgRating = rData.count > 0 ? (rData.sum / rData.count).toFixed(1) : "0.0";
                    const totalVotes = rData.count;
                    return (
                      <>
                        <span className="avg-rating">
                          {avgRating} <i className="fa-solid fa-star" style={{ fontSize: '10px', marginRight: '2px' }}></i>
                        </span>
                        <span className="max-rating">من 5</span>
                        <span className="votes-count">({totalVotes} {totalVotes === 1 ? 'تقييم' : 'تقييمات'})</span>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="rating-container">
                <div className="stars-wrapper">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const rData = ratings[selectedRestaurant.id] || { sum: 0, count: 0 };
                    const avgRating = rData.count > 0 ? (rData.sum / rData.count) : 0;
                    const hasRated = !!userRatings[selectedRestaurant.id];
                    const userRating = userRatings[selectedRestaurant.id];
                    
                    const rAnim = ratingAnimationState && ratingAnimationState.restaurantId === selectedRestaurant.id ? ratingAnimationState : null;
                    
                    let isActive = false;
                    if (rAnim) {
                      if (rAnim.step === 'clicked') {
                        isActive = (star === rAnim.clickedStar);
                      } else {
                        isActive = (star <= userRating);
                      }
                    } else {
                      isActive = hasRated ? (star <= userRating) : (star <= Math.round(avgRating));
                    }

                    return (
                      <button
                        key={star}
                        className={`star-btn ${isActive ? 'active' : ''} ${hasRated ? 'disabled' : ''}`}
                        style={
                          rAnim && rAnim.step === 'completed' && star < rAnim.clickedStar
                            ? { transitionDelay: `${star * 0.15}s` }
                            : {}
                        }
                        onClick={() => !hasRated && handleRate(selectedRestaurant.id, star)}
                        disabled={hasRated || isRatingSubmitting}
                        title={hasRated ? `تقييمك: ${userRating} نجوم` : `تقييم بـ ${star} نجوم`}
                      >
                        <i className={isActive ? "fa-solid fa-star" : "fa-regular fa-star"}></i>
                      </button>
                    );
                  })}
                </div>
                {userRatings[selectedRestaurant.id] && (
                  <span className="rated-badge">تم التقييم بنجاح ✓</span>
                )}
              </div>
            </div>
            {/* Menu Images List (Only for Restaurants) */}
            {!isCaptain && selectedRestaurant.menuImages && (
              <div>
                <h3 className="drawer-section-title">المنيو  (اضغط للتكبير)</h3>
                <div className="menu-thumbnails">
                  {selectedRestaurant.menuImages.map((img, idx) => (
                    <div 
                      key={idx} 
                      className="menu-thumbnail-wrapper"
                      onClick={() => {
                        setActiveMenuImage(resolveImage(img));
                        setCurrentImageIndex(idx);
                        setZoomScale(1);
                        setPanOffset({ x: 0, y: 0 });
                      }}
                    >
                      <img src={resolveImage(img)} alt={`منيو صفحة ${idx + 1}`} className="menu-thumbnail" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* General Info */}
            <div>
              <h3 className="drawer-section-title">بيانات التواصل والموقع</h3>
              <div className="info-list">
                {isCaptain ? (
                  <>
                    <div className="info-row">
                      <i className="fa-solid fa-motorcycle info-icon"></i>
                      <span><strong>نوع الخدمات:</strong> {selectedRestaurant.serviceTypes.join(' - ')}</span>
                    </div>
                    <div className="info-row">
                      <i className="fa-solid fa-route info-icon"></i>
                      <span><strong>عدد الرحلات / الطلبات:</strong> {(selectedRestaurant.tripsCount || 0) + (tripsCounts[selectedRestaurant.id] || 0)} رحلة ناجحة 🚀</span>
                    </div>
                  </>
                ) : (
                  <>
                    {selectedRestaurant.branches ? (
                      <div className="info-row" style={{ alignItems: 'flex-start' }}>
                        <i className="fa-solid fa-location-dot info-icon" style={{ marginTop: '4px' }}></i>
                        <div>
                          <strong>فروع الهايبر:</strong>
                          <ul style={{ margin: '4px 0 0 0', paddingRight: '16px', listStyleType: 'disc' }}>
                            {selectedRestaurant.branches.map((b, bIdx) => (
                              <li key={bIdx} style={{ marginBottom: '4px' }}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="info-row">
                        <i className="fa-solid fa-location-dot info-icon"></i>
                        <span><strong>العنوان:</strong> {selectedRestaurant.address}</span>
                      </div>
                    )}
                    <div className="info-row">
                      <i className="fa-solid fa-clock info-icon"></i>
                      <span><strong>مواعيد العمل:</strong> {selectedRestaurant.workingHours.display}</span>
                    </div>
                    <div className="info-row">
                      <i className="fa-solid fa-truck info-icon"></i>
                      <span><strong>خدمة التوصيل:</strong> {selectedRestaurant.deliveryFee}</span>
                    </div>
                  </>
                )}
              </div>
            </div>


            {/* Services / Popular Items */}
            {isCaptain ? (
              <div>
                <h3 className="drawer-section-title">تفاصيل الخدمات والأسعار</h3>
                <div className="popular-menu-list">
                  {selectedRestaurant.serviceTypes.map((srv, idx) => (
                    <div key={idx} className="popular-menu-item" style={{ padding: '14px 8px' }}>
                      <div className="popular-item-info">
                        <span className="popular-item-name">{srv}</span>
                      </div>
                      <span className="popular-item-price" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>حسب الاتفاق 🗺️</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              selectedRestaurant.popularItems && (
                <div>
                  <h3 className="drawer-section-title">{isSupermarket ? 'المنتجات والأنواع المتاحة' : 'الوجبات الأكثر مبيعاً والأسعار'}</h3>
                  <div className="popular-menu-list">
                    {selectedRestaurant.popularItems.map((item, idx) => (
                      <div key={idx} className="popular-menu-item">
                        <div className="popular-item-info">
                          <span className="popular-item-name">{item.name}</span>
                          <span className="popular-item-desc">{item.description}</span>
                        </div>
                        <span className="popular-item-price">
                          {typeof item.price === 'number' ? `${item.price} ج.م` : item.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      );
      })()}

      {/* Lightbox / Image Viewer */}
      {activeMenuImage && (
        <div className="lightbox-overlay" onClick={() => setActiveMenuImage(null)}>
          <div 
            className="lightbox-image-container" 
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
            onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
             onTouchStart={(e) => {
               if (e.touches.length === 1) {
                 setTouchStartX(e.touches[0].clientX);
                 setTouchStartY(e.touches[0].clientY);
                 handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
               } else if (e.touches.length === 2) {
                 const dist = Math.hypot(
                   e.touches[0].clientX - e.touches[1].clientX,
                   e.touches[0].clientY - e.touches[1].clientY
                 );
                 setTouchStartDist(dist);
                 setTouchStartScale(zoomScale);
               }
             }}
             onTouchMove={(e) => {
               if (e.touches.length === 1) {
                 handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
               } else if (e.touches.length === 2 && touchStartDist > 0) {
                 const dist = Math.hypot(
                   e.touches[0].clientX - e.touches[1].clientX,
                   e.touches[0].clientY - e.touches[1].clientY
                 );
                 const factor = dist / touchStartDist;
                 const newScale = Math.min(Math.max(touchStartScale * factor, 0.85), 3.5);
                 setZoomScale(newScale);
                 if (newScale <= 1.01) {
                   setPanOffset({ x: 0, y: 0 });
                 }
               }
             }}
             onTouchEnd={(e) => {
               handleDragEnd();
               if (zoomScale <= 1.1 && e.changedTouches && e.changedTouches.length > 0) {
                 const diffX = e.changedTouches[0].clientX - touchStartX;
                 const diffY = e.changedTouches[0].clientY - touchStartY;
                 if (Math.abs(diffX) > 60 && Math.abs(diffY) < 50) {
                   if (diffX > 0) {
                     handlePrevImage();
                   } else {
                     handleNextImage();
                   }
                 }
               }
               setTouchStartDist(0);
             }}
             style={{ cursor: zoomScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
           >
            <img 
              src={activeMenuImage} 
              alt="صورة المنيو الكبيرة" 
              className="lightbox-image" 
              style={{ 
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                userSelect: 'none',
                pointerEvents: zoomScale > 1 ? 'auto' : 'none'
              }}
            />
          </div>

          <button className="lightbox-close" onClick={() => setActiveMenuImage(null)}>
            <i className="fa-solid fa-xmark" style={{ fontSize: '20px' }}></i>
          </button>

          <div className="lightbox-controls" onClick={(e) => e.stopPropagation()}>
            {selectedRestaurant && selectedRestaurant.menuImages && selectedRestaurant.menuImages.length > 1 && currentImageIndex > 0 && (
              <button className="lightbox-control-btn" onClick={handlePrevImage} title="الصورة السابقة">
                <i className="fa-solid fa-chevron-right"></i>
                <span>السابق</span>
              </button>
            )}
            <button className="lightbox-control-btn" onClick={handleZoomIn}>
              <i className="fa-solid fa-magnifying-glass-plus"></i>
              <span>تكبير</span>
            </button>
            <button className="lightbox-control-btn" onClick={handleZoomOut}>
              <i className="fa-solid fa-magnifying-glass-minus"></i>
              <span>تصغير</span>
            </button>
            <button className="lightbox-control-btn" onClick={handleZoomReset}>
              <i className="fa-solid fa-rotate-left"></i>
              <span>إعادة ضبط</span>
            </button>
            {selectedRestaurant && selectedRestaurant.menuImages && selectedRestaurant.menuImages.length > 1 && currentImageIndex < selectedRestaurant.menuImages.length - 1 && (
              <button className="lightbox-control-btn" onClick={handleNextImage} title="الصورة التالية">
                <span>التالي</span>
                <i className="fa-solid fa-chevron-left"></i>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Promo Code Alert Modal */}
      {promoAlert && (
        <div className="drawer-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="drawer-content" style={{ maxWidth: '400px', width: '90%', padding: '24px', textAlign: 'center', borderRadius: '16px', position: 'relative', transform: 'none', bottom: 'auto' }}>
            <button 
              className="close-btn" 
              onClick={() => {
                const phone = promoAlert.phone;
                setPromoAlert(null);
                window.location.href = `tel:${phone}`;
              }} 
              style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div style={{ fontSize: '48px', color: '#f59e0b', marginBottom: '16px' }}>
              <i className="fa-solid fa-gift"></i>
            </div>
            <h3 style={{ fontSize: '18px', margin: '0 0 12px 0', color: 'var(--text-primary)', fontFamily: 'inherit' }}>كود خصم خاص! 🎁</h3>
            <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: '0 0 20px 0', fontFamily: 'inherit' }}>
              متنساش تستخدم كود خصم <strong style={{ color: '#f59e0b', fontSize: '17px' }}>k-824</strong> مع الكاشير وأنت بتتصل علشان تستفيد بالخصم!
            </p>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              سيتم التحويل للاتصال تلقائياً خلال {promoAlert.countdown} ثوانٍ...
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari PWA Install Instructions Modal */}
      {showIOSInstallInstructions && (
        <div className="drawer-overlay" onClick={() => setShowIOSInstallInstructions(false)} style={{ zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="drawer-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', width: '90%', padding: '24px', borderRadius: '20px', textAlign: 'center', position: 'relative', transform: 'none', bottom: 'auto' }}>
            <button className="close-btn" onClick={() => setShowIOSInstallInstructions(false)} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div style={{ fontSize: '40px', color: '#007aff', marginBottom: '12px' }}>
              <i className="fa-brands fa-apple"></i>
            </div>
            <h3 style={{ fontSize: '18px', margin: '0 0 16px 0', color: 'var(--text-primary)', fontFamily: 'inherit' }}>تثبيت التطبيق على آيفون 📱</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px', fontFamily: 'inherit' }}>
              لتثبيت دليل مغاغة على شاشة هاتفك وتصفحه كشكل تطبيق، اتبع الخطوات البسيطة التالية باستخدام متصفح <strong>Safari</strong>:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'right', fontSize: '14px', color: 'var(--text-primary)', fontFamily: 'inherit' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ background: '#007aff', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '12px', fontWeight: 'bold' }}>١</span>
                <div>
                  اضغط على زر **المشاركة** <i className="fa-solid fa-arrow-up-from-bracket" style={{ color: '#007aff', margin: '0 4px' }}></i> في أسفل شاشة المتصفح.
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ background: '#007aff', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '12px', fontWeight: 'bold' }}>٢</span>
                <div>
                  اسحب القائمة للأعلى ثم اختر **\"إضافة إلى الصفحة الرئيسية\"** (Add to Home Screen) <i className="fa-regular fa-square-plus" style={{ margin: '0 4px' }}></i>.
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ background: '#007aff', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '12px', fontWeight: 'bold' }}>٣</span>
                <div>
                  اضغط على **\"إضافة\"** (Add) في الزاوية العلوية اليمنى.
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowIOSInstallInstructions(false)} 
              style={{ marginTop: '24px', width: '100%', padding: '12px', background: '#007aff', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              فهمت، جاهز للتثبيت
            </button>
          </div>
        </div>
      )}

      {/* Phone Selector Modal */}
      {phoneSelectorList && (
        <div className="drawer-overlay" onClick={() => setPhoneSelectorList(null)} style={{ zIndex: 300 }}>
          <div className="drawer-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '60%' }}>
            <div className="drawer-header">
              <h2 className="restaurant-detail-title" style={{ fontSize: '18px' }}>اختر رقم الاتصال بالدليفري</h2>
              <button className="close-btn" onClick={() => setPhoneSelectorList(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              {phoneSelectorList.map((phone, idx) => {
                const isObj = typeof phone === 'object' && phone !== null;
                const label = isObj ? phone.label : phone;
                const number = isObj ? phone.number : phone;
                return (
                  <a 
                    key={idx} 
                    href={`tel:${number}`} 
                    className="action-btn btn-call" 
                    style={{ fontSize: '16px', padding: '14px' }}
                    onClick={(e) => {
                      e.preventDefault();
                      setPhoneSelectorList(null);
                      if (phone.category && phone.itemId) {
                        handleIncrementCall(phone.category, phone.itemId);
                        window.location.href = `tel:${number}`;
                      } else {
                        handleInitiateCall(number, selectedRestaurant);
                      }
                    }}
                  >
                    <i className="fa-solid fa-phone"></i>
                    <span>{label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* Centered QR Code Modal */}
      {showQrModal && (
        <div className="qr-centered-overlay" onClick={() => setShowQrModal(false)}>
          <div className="qr-centered-card" onClick={(e) => e.stopPropagation()}>
            <div className="qr-card-header">
              <div className="qr-card-title">
                <i className="fa-solid fa-qrcode"></i>
                <span>رمز QR للموقع</span>
              </div>
              <button className="qr-card-close" onClick={() => setShowQrModal(false)} aria-label="إغلاق">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <div className="qr-card-body">
              <div className="qr-image-frame">
                <img src={resolveImage('qr-code.webp')} alt="رمز QR لدليل مغاغة" className="qr-code-img" />
              </div>
              
              <p className="qr-card-desc">
                امسح الـ QR كود بكاميرا الموبايل لفتح دليل مغاغة مباشرة ومشاركته مع أصدقائك! 📱✨
              </p>
              
              <div className="qr-actions-row">
                <a 
                  href={resolveImage('qr-code.webp')} 
                  download="maghagha-menu-qr.webp"
                  className="qr-action-btn btn-download"
                >
                  <i className="fa-solid fa-download"></i>
                  <span>تحميل</span>
                </a>

                <button 
                  onClick={handleShareQr}
                  className="qr-action-btn btn-share"
                  type="button"
                >
                  <i className={qrShareCopied ? "fa-solid fa-check" : "fa-solid fa-share-nodes"}></i>
                  <span>{qrShareCopied ? 'تم نسخ الرابط!' : 'مشاركة'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Left QR & WhatsApp Buttons (Hidden when opening restaurant menu / lightbox) */}
      {!selectedRestaurant && !activeMenuImage && (
        <>
          {/* <a 
            href={`https://wa.me/201558606314?text=${encodeURIComponent("أهلاً، أريد الاستفسار عن خدمات دليل مغاغة 📱✨")}`}
            target="_blank" 
            rel="noopener noreferrer" 
            className="fixed-whatsapp-left-btn"
            title="تواصل معنا عبر واتساب"
            aria-label="WhatsApp"
          >
            <i className="fa-brands fa-whatsapp"></i>
          </a> */}
          <button 
            onClick={() => setShowQrModal(true)}
            className="fixed-qr-left-btn"
            title="عرض الـ QR Code الخاص بالموقع"
            aria-label="QR Code"
          >
            <i className="fa-solid fa-qrcode"></i>
          </button>
        </>
      )}

      {/* Floating Bottom WhatsApp Button */}
      <div className={`floating-whatsapp-bottom ${showBottomWhatsApp ? 'show' : ''}`}>
        <a 
          href={`https://wa.me/201558606314?text=${encodeURIComponent(
            activeMainTab === 'restaurants' ? "أهلاً، أريد إضافة بيانات المطعم أو المنيو الخاص بي في دليل مغاغة 🍔" :
            activeMainTab === 'supermarket' ? "أهلاً، أريد إضافة بيانات وعروض المحل / السوبر ماركت الخاص بي في دليل مغاغة 🛒" :
            activeMainTab === 'jobs' ? "أهلاً، أريد إضافة فرصة عمل / الإعلان عن وظيفة شاغرة في دليل مغاغة 💼" :
            activeMainTab === 'doctors' ? "أهلاً، أريد إضافة بيانات عيادتي / معملي في قسم الأطباء بدليل مغاغة 👨‍⚕️" :
            activeMainTab === 'motorcycle' ? "أهلاً، أريد الانضمام والتسجيل ككابتن توصيل في دليل مغاغة 🏍️" :
            "أهلاً، أريد إضافة بياناتي في موقع دليل مغاغة 📱✨"
          )}`}
          target="_blank" 
          rel="noopener noreferrer" 
          className="bottom-whatsapp-btn"
        >
          <i className="fa-brands fa-whatsapp"></i>
          <span>تواصل لإرسال بياناتك</span>
        </a>
      </div>
    </>
  );
}

export default App;
