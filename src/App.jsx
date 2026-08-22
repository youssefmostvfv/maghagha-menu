import React, { useState, useEffect } from 'react';
import { CATEGORIES, RESTAURANTS as INITIAL_RESTAURANTS, isRestaurantOpen, CAPTAINS as INITIAL_CAPTAINS, SUPERMARKETS as INITIAL_SUPERMARKETS } from './data';
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
  
  const [isAdminPage, setIsAdminPage] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [activeAdminTab, setActiveAdminTab] = useState('stats');
  
  // States for adding/editing forms in Admin Panel
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [editingCaptain, setEditingCaptain] = useState(null);
  const [showAddRestaurantForm, setShowAddRestaurantForm] = useState(false);
  const [showAddCaptainForm, setShowAddCaptainForm] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showServicesArrow, setShowServicesArrow] = useState(true);
  const [showCategoriesArrow, setShowCategoriesArrow] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const handleInstallApp = async () => {
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
      .catch((err) => console.error('Error loading trips counts:', err));

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
          if (missing.length > 0) {
            set(dbRestaurantsRef, merged);
          }
        } else {
          set(dbRestaurantsRef, INITIAL_RESTAURANTS);
          setRestaurants(INITIAL_RESTAURANTS);
        }
      })
      .catch((err) => {
        console.error('Error loading restaurants:', err);
        setRestaurants(INITIAL_RESTAURANTS);
      });

    // Fetch and seed Captains
    const dbCaptainsRef = ref(db, 'captains');
    get(dbCaptainsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const fetched = normalizeData(snapshot.val());
          const existingIds = new Set(fetched.map(item => String(item.id)));
          const missing = INITIAL_CAPTAINS.filter(item => !existingIds.has(String(item.id)));
          const merged = [...fetched, ...missing];
          setCaptains(merged);
          if (missing.length > 0) {
            set(dbCaptainsRef, merged);
          }
        } else {
          set(dbCaptainsRef, INITIAL_CAPTAINS);
          setCaptains(INITIAL_CAPTAINS);
        }
      })
      .catch((err) => {
        console.error('Error loading captains:', err);
        setCaptains(INITIAL_CAPTAINS);
      });

    // Fetch and seed Supermarkets
    const dbSupermarketsRef = ref(db, 'supermarkets');
    get(dbSupermarketsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const fetched = normalizeData(snapshot.val());
          const existingIds = new Set(fetched.map(item => String(item.id)));
          const missing = INITIAL_SUPERMARKETS.filter(item => !existingIds.has(String(item.id)));
          const merged = [...fetched, ...missing];
          setSupermarkets(merged);
          if (missing.length > 0) {
            set(dbSupermarketsRef, merged);
          }
        } else {
          set(dbSupermarketsRef, INITIAL_SUPERMARKETS);
          setSupermarkets(INITIAL_SUPERMARKETS);
        }
      })
      .catch((err) => {
        console.error('Error loading supermarkets:', err);
        setSupermarkets(INITIAL_SUPERMARKETS);
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
    const updatedList = [...restaurants, { ...newRes, id: Date.now() }];
    await set(ref(db, 'restaurants'), updatedList);
    setRestaurants(updatedList);
    setShowAddRestaurantForm(false);
  };

  const handleEditRestaurant = async (updatedRes) => {
    const updatedList = restaurants.map(r => r.id === updatedRes.id ? updatedRes : r);
    await set(ref(db, 'restaurants'), updatedList);
    setRestaurants(updatedList);
    setEditingRestaurant(null);
  };

  const handleDeleteRestaurant = async (resId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المطعم نهائياً؟')) {
      const updatedList = restaurants.filter(r => r.id !== resId);
      await set(ref(db, 'restaurants'), updatedList);
      setRestaurants(updatedList);
    }
  };

  const handleAddCaptain = async (newCap) => {
    const updatedList = [...captains, { ...newCap, id: `captain_${Date.now()}` }];
    await set(ref(db, 'captains'), updatedList);
    setCaptains(updatedList);
    setShowAddCaptainForm(false);
  };

  const handleEditCaptain = async (updatedCap) => {
    const updatedList = captains.map(c => c.id === updatedCap.id ? updatedCap : c);
    await set(ref(db, 'captains'), updatedList);
    setCaptains(updatedList);
    setEditingCaptain(null);
  };

  const handleDeleteCaptain = async (capId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الكابتن نهائياً؟')) {
      const updatedList = captains.filter(c => c.id !== capId);
      await set(ref(db, 'captains'), updatedList);
      setCaptains(updatedList);
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

  const filteredRestaurants = restaurants.filter(restaurant => {
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
    return (
      <div className="admin-layout" style={{ direction: 'rtl', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        {/* Admin Header */}
        <header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={logoTow} alt="Logo" style={{ height: '40px' }} />
            <h1 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>لوحة تحكم دليل مغاغة</h1>
          </div>
          {isAdminLoggedIn && (
            <div className="admin-tabs" style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={`admin-tab-btn ${activeAdminTab === 'stats' ? 'active' : ''}`}
                onClick={() => { setActiveAdminTab('stats'); setEditingRestaurant(null); setEditingCaptain(null); setShowAddRestaurantForm(false); setShowAddCaptainForm(false); }}
                style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
              >
                📊 الإحصائيات
              </button>
              <button 
                className={`admin-tab-btn ${activeAdminTab === 'restaurants' ? 'active' : ''}`}
                onClick={() => { setActiveAdminTab('restaurants'); setEditingRestaurant(null); setShowAddRestaurantForm(false); }}
                style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
              >
                🍔 إدارة المطاعم
              </button>
              <button 
                className={`admin-tab-btn ${activeAdminTab === 'captains' ? 'active' : ''}`}
                onClick={() => { setActiveAdminTab('captains'); setEditingCaptain(null); setShowAddCaptainForm(false); }}
                style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
              >
                🏍️ إدارة الكباتن
              </button>
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleBackToHome} style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 'bold' }}>
              🏠 الموقع الرئيسي
            </button>
            {isAdminLoggedIn && (
              <button onClick={handleAdminLogout} style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: 'none', backgroundColor: 'var(--status-closed)', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
                🚪 خروج
              </button>
            )}
          </div>
        </header>

        {/* Admin Body Content */}
        <div style={{ padding: '24px' }}>
          {!isAdminLoggedIn ? (
            /* Login Screen */
            <div style={{ maxWidth: '400px', margin: '80px auto', padding: '32px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
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
          ) : (
            /* Dashboard View */
            (() => {
              if (activeAdminTab === 'stats') {
                const totalRatingsCount = Object.values(ratings).reduce((acc, curr) => acc + (curr.count || 0), 0);
                const totalTripsCount = Object.values(tripsCounts).reduce((acc, curr) => acc + (curr || 0), 0);
                return (
                  <div>
                    <h2 style={{ marginBottom: '20px' }}>لوحة الإحصائيات العامة 📈</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                      <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                        <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>إجمالي المطاعم</h3>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{restaurants.length}</p>
                      </div>
                      <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                        <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>إجمالي الكباتن</h3>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{captains.length}</p>
                      </div>
                      <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                        <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>الرحلات المسجلة (نقرات الاتصال)</h3>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{totalTripsCount} رحلة 🚀</p>
                      </div>
                      <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                        <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>التقييمات المكتملة</h3>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{totalRatingsCount} تقييم ⭐</p>
                      </div>
                    </div>
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
                            avatar: formData.get('avatar') || '',
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
            })()
          )}
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
          {deferredPrompt && (
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
        </div>
        {showServicesArrow && (
          <div className="scroll-arrow-indicator">
            <i className="fa-solid fa-chevron-left"></i>
          </div>
        )}
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
              {activeMainTab === 'doctors' && "دليل عيادات وأطباء مغاغة 👨‍⚕️"}
              {activeMainTab === 'pharmacy' && "دليل صيدليات مغاغة 💊"}
              {activeMainTab === 'motorcycle' && "كباتن دليفري مغاغة ف جيبك 🏍️"}
            </h2>
            <p className="hero-subtitle">
              {activeMainTab === 'restaurants' && "منصتك المتكاملة لتصفح منيو، أسعار، تليفونات وعناوين جميع مطاعم مغاغة بنقرة واحدة!"}
              {activeMainTab === 'supermarket' && "تصفح أرقام، فروع، وعروض أفضل المحلات والسوبر ماركت في مغاغة!"}
              {activeMainTab === 'doctors' && "دليل كامل لأشطر الأطباء والعيادات بمختلف التخصصات في مغاغة."}
              {activeMainTab === 'pharmacy' && "دليل كامل للصيدليات المتاحة والعاملة في مغاغة لتلبية احتياجاتك الدوائية."}
              {activeMainTab === 'motorcycle' && "تواصل مباشرة مع أسرع كباتن توصيل طلبات ومشاوير وسفر داخل مغاغة وضواحيها!"}
            </p>
            
            {/* Integrated Search Input */}
            {activeMainTab === 'restaurants' && (
              <div className="search-wrapper hero-search-box">
                <i className="fa-solid fa-magnifying-glass search-icon"></i>
                <input
                  type="text"
                  className="search-input"
                  placeholder="ابحث عن خدمة، طبيب، صيدلية، مطعم، كريب، شاورما..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}

            {/* Quick Search Tag Helpers */}
            {activeMainTab === 'restaurants' && (
              <div className="hero-tags">
                <span className="tags-label">الأكثر بحثاً:</span>
                {['كريب', 'بروست', 'سماش برجر', 'شاورما', 'مشويات'].map(tag => (
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
            <div className="categories-container" style={{ margin: '10px 0 20px 0' }}>
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

            <div className="captains-grid">
              {captains.filter(captain => selectedCaptainService === 'all' || captain.serviceTypes.includes(selectedCaptainService)).map(captain => {
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
              })}
            </div>
          </>
        ) : activeMainTab === 'supermarket' ? (
          <div className="captains-grid">
            {supermarkets.map(market => (
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
        ) : (
          <div className="coming-soon-container">
            <div className="coming-soon-card">
              <div className="coming-soon-icon">
                {activeMainTab === 'doctors' && <i className="fa-solid fa-user-doctor coming-soon-pulse"></i>}
                {activeMainTab === 'pharmacy' && <i className="fa-solid fa-mortar-pestle coming-soon-pulse"></i>}
              </div>
              <h3 className="coming-soon-title">هذه الخدمة ستتوفر قريباً 🚀</h3>
              <p className="coming-soon-text">
                {activeMainTab === 'doctors' && "دليل شامل لأشطر الأطباء بمختلف التخصصات، العيادات والمواعيد الرسمية في مغاغة."}
                {activeMainTab === 'pharmacy' && "دليل كامل للصيدليات المتاحة والعاملة في مغاغة لتلبية جميع احتياجاتك الدوائية."}
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
                          <strong>{(() => {
                            const today = new Date();
                            return `${today.getMonth() + 1}${today.getDate()}`;
                          })()}</strong>
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
                          window.location.href = `tel:${number}`;
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
                handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onTouchMove={(e) => {
              if (e.touches.length === 1) {
                handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onTouchEnd={handleDragEnd}
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
                    onClick={() => setPhoneSelectorList(null)}
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
      {/* Floating Bottom WhatsApp Button */}
      <div className={`floating-whatsapp-bottom ${showBottomWhatsApp ? 'show' : ''}`}>
        <a 
          href={`https://wa.me/201062049652?text=${encodeURIComponent("عاوز اضيف بياناتي في الموقع")}`}
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
