import React, { useState, useEffect } from 'react';
import { CATEGORIES, RESTAURANTS, isRestaurantOpen } from './data';
import logo from './assets/logo.png';
import logoTow from './assets/logo-tow.png';

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
  const [activeMainTab, setActiveMainTab] = useState('restaurants');

  const KVDB_URL = 'https://kvdb.io/kvd_maghagha_menu_7d9a1e/all_ratings';

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

    // Fetch global ratings
    fetch(KVDB_URL)
      .then(res => {
        if (res.ok) return res.json();
        return {};
      })
      .then(data => {
        setRatings(data || {});
      })
      .catch(err => console.error('Error loading ratings:', err));
  }, []);

  const [showBottomWhatsApp, setShowBottomWhatsApp] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      // Show if page is very short or scrolled near the bottom
      if (documentHeight - windowHeight <= 100 || documentHeight - (scrollTop + windowHeight) < 180) {
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
  }, [activeMainTab]); // re-run listener check when active tab changes

  const handleRate = async (restaurantId, ratingValue) => {
    if (userRatings[restaurantId] || isRatingSubmitting) return;
    setIsRatingSubmitting(true);

    try {
      const res = await fetch(KVDB_URL);
      let currentRatings = {};
      if (res.ok) {
        currentRatings = await res.json();
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

      const putRes = await fetch(KVDB_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRatings)
      });

      if (putRes.ok) {
        setRatings(newRatings);
        const newUserRatings = {
          ...userRatings,
          [restaurantId]: ratingValue
        };
        setUserRatings(newUserRatings);
        localStorage.setItem('user_ratings', JSON.stringify(newUserRatings));
      }
    } catch (error) {
      console.error('Error saving rating:', error);
    } finally {
      setIsRatingSubmitting(false);
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

  const filteredRestaurants = RESTAURANTS.filter(restaurant => {
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
        <button 
          className="theme-toggle-btn" 
          onClick={toggleTheme} 
          aria-label="Toggle Theme"
          title="تغيير المظهر"
        >
          {theme === 'light' ? <i className="fa-solid fa-moon"></i> : <i className="fa-solid fa-sun"></i>}
        </button>
      </header>

      {/* Main Services Switcher */}
      <div className="main-services-tabs">
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
          className={`service-tab ${activeMainTab === 'motorcycle' ? 'active' : ''}`}
          onClick={() => setActiveMainTab('motorcycle')}
        >
          <i className="fa-solid fa-motorcycle"></i>
          <span>موتوسيكل</span>
        </button>
        <button 
          className={`service-tab ${activeMainTab === 'pharmacy' ? 'active' : ''}`}
          onClick={() => setActiveMainTab('pharmacy')}
        >
          <i className="fa-solid fa-mortar-pestle"></i>
          <span>الصيدليات</span>
        </button>
      </div>

      {/* Main Area */}
      <main className="app-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <img src={logoTow} alt="Menu Maghagha Logo" className="hero-logo-img" />
            <h2 className="hero-title">دليل مغاغه ف جيبك 🎯</h2>
            <p className="hero-subtitle">
              منصتك المتكاملة لتصفح خدمات، عيادات، محلات، ومطاعم مغاغة بالأسعار والتفاصيل، والاتصال المباشر بنقرة واحدة.
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
            <div className="categories-container">
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
                        src={restaurant.logo} 
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
        ) : (
          <div className="coming-soon-container">
            <div className="coming-soon-card">
              <div className="coming-soon-icon">
                {activeMainTab === 'motorcycle' ? (
                  <i className="fa-solid fa-motorcycle coming-soon-bounce"></i>
                ) : (
                  <i className="fa-solid fa-house-chimney-medical coming-soon-pulse"></i>
                )}
              </div>
              <h3 className="coming-soon-title">هذه الخدمة ستتوفر قريباً 🚀</h3>
              <p className="coming-soon-text">
                {activeMainTab === 'motorcycle' 
                  ? 'نوفر لك قريباً أرقام وتفاصيل كباتن الدليفري والموتوسيكلات للتوصيل السريع داخل مغاغة.' 
                  : 'دليل كامل للصيدليات المتاحة، عيادات الأطباء، ومواعيدها لتصل لكل الخدمات الطبية بسهولة.'}
              </p>
              <div className="coming-soon-badge">قيد التطوير والتحضير</div>
            </div>
          </div>
        )}
      </main>

      {/* Details Bottom Sheet (Drawer) */}
      {selectedRestaurant && (
        <div className="drawer-overlay" onClick={() => setSelectedRestaurant(null)}>
          <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <span className={`status-badge ${isRestaurantOpen(selectedRestaurant.workingHours) ? 'open' : 'closed'}`} style={{ marginBottom: '8px', display: 'inline-block' }}>
                  {isRestaurantOpen(selectedRestaurant.workingHours) ? 'مفتوح الآن' : 'مغلق حالياً'}
                </span>
                <h2 className="restaurant-detail-title">{selectedRestaurant.name}</h2>
                <p className="restaurant-desc" style={{ WebkitLineClamp: 'unset' }}>{selectedRestaurant.description}</p>
              </div>
              <button className="close-btn" onClick={() => setSelectedRestaurant(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Quick action buttons */}
            <div className="action-buttons-grid">
              {selectedRestaurant.secondBranchPhones ? (
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
                    <span>اتصال بالدليفري</span>
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
                <h3 className="drawer-section-title">تقييم المكان</h3>
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
                    
                    const isActive = hasRated ? (star <= userRating) : (star <= Math.round(avgRating));

                    return (
                      <button
                        key={star}
                        className={`star-btn ${isActive ? 'active' : ''} ${hasRated ? 'disabled' : ''}`}
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

            {/* General Info */}
            <div>
              <h3 className="drawer-section-title">بيانات التواصل والموقع</h3>
              <div className="info-list">
                <div className="info-row">
                  <i className="fa-solid fa-location-dot info-icon"></i>
                  <span><strong>العنوان:</strong> {selectedRestaurant.address}</span>
                </div>
                <div className="info-row">
                  <i className="fa-solid fa-clock info-icon"></i>
                  <span><strong>مواعيد العمل:</strong> {selectedRestaurant.workingHours.display}</span>
                </div>
                <div className="info-row">
                  <i className="fa-solid fa-truck info-icon"></i>
                  <span><strong>خدمة التوصيل:</strong> {selectedRestaurant.deliveryFee}</span>
                </div>
              </div>
            </div>

            {/* Menu Images List */}
            <div>
              <h3 className="drawer-section-title">المنيو الورقي (اضغط للتكبير)</h3>
              <div className="menu-thumbnails">
                {selectedRestaurant.menuImages.map((img, idx) => (
                  <div 
                    key={idx} 
                    className="menu-thumbnail-wrapper"
                    onClick={() => {
                      setActiveMenuImage(img);
                      setZoomScale(1);
                    }}
                  >
                    <img src={img} alt={`منيو صفحة ${idx + 1}`} className="menu-thumbnail" />
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Items */}
            <div>
              <h3 className="drawer-section-title">الوجبات الأكثر مبيعاً والأسعار</h3>
              <div className="popular-menu-list">
                {selectedRestaurant.popularItems.map((item, idx) => (
                  <div key={idx} className="popular-menu-item">
                    <div className="popular-item-info">
                      <span className="popular-item-name">{item.name}</span>
                      <span className="popular-item-desc">{item.description}</span>
                    </div>
                    <span className="popular-item-price">{item.price} ج.م</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Image Viewer */}
      {activeMenuImage && (
        <div className="lightbox-overlay" onClick={() => setActiveMenuImage(null)}>
          <button className="lightbox-close" onClick={() => setActiveMenuImage(null)}>
            <i className="fa-solid fa-xmark" style={{ fontSize: '20px' }}></i>
          </button>
          
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
                pointerEvents: 'none'
              }}
            />
          </div>

          <div className="lightbox-controls" onClick={(e) => e.stopPropagation()}>
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
