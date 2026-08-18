import React, { useState, useEffect } from 'react';
import { CATEGORIES, RESTAURANTS, isRestaurantOpen } from './data';

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
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme;
      
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return systemPrefersDark ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

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
      {/* Header */}
      <header className="app-header">
        <h1 className="brand-title">منيو مغاغة <i className="fa-solid fa-burger"></i></h1>
        <button 
          className="theme-toggle-btn" 
          onClick={toggleTheme} 
          aria-label="Toggle Theme"
          title="تغيير المظهر"
        >
          {theme === 'light' ? <i className="fa-solid fa-moon"></i> : <i className="fa-solid fa-sun"></i>}
        </button>
      </header>

      {/* Main Area */}
      <main className="app-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h2 className="hero-title">دليل مغاغه ف جيبك <i className="fa-solid fa-bullseye"></i></h2>
            <p className="hero-subtitle">
              دليلك السريع لمعرفة مواعيد العمل، أرقام الدليفري والاتصال، تصفح المنيو الورقي الأصلي، ومعرفة أسعار وجباتك المفضلة بسهولة تامة.
            </p>
          </div>
        </section>

        {/* Search Input */}
        <div className="search-wrapper">
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            type="text"
            className="search-input"
            placeholder="ابحث عن مطعم، كريب، شاورما، حلو..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

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
                        {isOpen ? 'مفتوح الآن' : 'مغلق حالياً'}
                      </span>
                    </div>
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
              <button 
                onClick={() => {
                  if (selectedRestaurant.phones && selectedRestaurant.phones.length > 1) {
                    setPhoneSelectorList(selectedRestaurant.phones);
                  } else if (selectedRestaurant.phones && selectedRestaurant.phones.length === 1) {
                    window.location.href = `tel:${selectedRestaurant.phones[0]}`;
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
              {phoneSelectorList.map((phone, idx) => (
                <a 
                  key={idx} 
                  href={`tel:${phone}`} 
                  className="action-btn btn-call" 
                  style={{ fontSize: '16px', padding: '14px' }}
                  onClick={() => setPhoneSelectorList(null)}
                >
                  <i className="fa-solid fa-phone"></i>
                  <span>{phone}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
