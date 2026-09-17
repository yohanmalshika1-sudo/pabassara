'use client';

import { useState, useEffect, useMemo } from 'react';

interface Category {
  id: string;
  labelSi: string;
  labelEn: string;
  icon: string;
}

interface CustomPage {
  id: string;
  titleSi: string;
  titleEn: string;
  contentSi: string;
  contentEn: string;
  bannerImage?: string;
}

interface Post {
  id: string;
  category: string;
  titleSi: string;
  titleEn: string;
  descriptionSi: string;
  descriptionEn: string;
  image?: string;
  youtubeUrl?: string;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'history', labelSi: 'ඉතිහාසය', labelEn: 'History', icon: '🏛️' },
  { id: 'dhamma', labelSi: 'දහම් පාසල', labelEn: 'Dhamma School', icon: '🪷' },
  { id: 'monks', labelSi: 'වැඩසිටින හිමිවරුන්', labelEn: 'Resident Monks', icon: '🧘‍♂️' },
  { id: 'videos', labelSi: 'ධර්ම දේශනා & වීඩියෝ', labelEn: 'Sermons & Videos', icon: '🎥' },
  { id: 'pinkam', labelSi: 'පිංකම්', labelEn: 'Religious Events', icon: '🪔' },
];

export default function CompleteTempleApp() {
  const [lang, setLang] = useState<'si' | 'en'>('si');
  const [activeTab, setActiveTab] = useState('history');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Dynamic Branding
  const [splashImage, setSplashImage] = useState('https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Dharmachakra.svg/512px-Dharmachakra.svg.png');
  const [templeNameSi, setTempleNameSi] = useState('ශ්‍රී බෝධිරුක්ඛාරාමය');
  const [templeNameEn, setTempleNameEn] = useState('Sri Bodhirukkharamaya');
  const [templeLocationSi, setTempleLocationSi] = useState('ගණිහිමුල්ල, දෙවලපොල');
  const [templeLocationEn, setTempleLocationEn] = useState('Ganihimulla, Devalapola');

  // Media & Backgrounds
  const [bgWallpaper, setBgWallpaper] = useState('');
  const [heroCover, setHeroCover] = useState('');
  const [badgeLogo, setBadgeLogo] = useState('');
  const [timerCover, setTimerCover] = useState('');

  // Event & Timer Configurations
  const [eventTitleSi, setEventTitleSi] = useState('වාර්ෂික මහා කඨින පූජෝත්සවය');
  const [eventTitleEn, setEventTitleEn] = useState('Annual Great Katina Pinkama');
  const [eventTargetDate, setEventTargetDate] = useState('2026-11-15T08:00');
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  // Bank Details
  const [bankName, setBankName] = useState('ලංකා බැංකුව (BOC)');
  const [bankAccountName, setBankAccountName] = useState('ශ්‍රී බෝධිරුක්ඛාරාම සංවර්ධන සභාව');
  const [bankAccountNumber, setBankAccountNumber] = useState('1234567890');
  const [bankBranch, setBankBranch] = useState('දෙවලපොල');
  const [bankQrImage, setBankQrImage] = useState('');

  // Categories, Pages & Posts
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  // Admin Auth & Ticker
  const [adminPassword, setAdminPassword] = useState('1234');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [tickerText, setTickerText] = useState('2026 වසර සඳහා දහම් පාසලට නවක සිසුන් ඇතුළත් කිරීම ආරම්භ වේ.');

  // Editing States
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postCat, setPostCat] = useState('history');
  const [postTitleSi, setPostTitleSi] = useState('');
  const [postTitleEn, setPostTitleEn] = useState('');
  const [postDescSi, setPostDescSi] = useState('');
  const [postDescEn, setPostDescEn] = useState('');
  const [postImg, setPostImg] = useState('');
  const [postYt, setPostYt] = useState('');

  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catSi, setCatSi] = useState('');
  const [catEn, setCatEn] = useState('');
  const [catIcon, setCatIcon] = useState('📌');

  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [pageTitleSi, setPageTitleSi] = useState('');
  const [pageTitleEn, setPageTitleEn] = useState('');
  const [pageContentSi, setPageContentSi] = useState('');
  const [pageContentEn, setPageContentEn] = useState('');
  const [pageBanner, setPageBanner] = useState('');

  // Load Storage Configurations
  useEffect(() => {
    localStorage.removeItem('temple_branding_v18');

    const savedCats = localStorage.getItem('temple_cats_v19');
    if (savedCats) setCategories(JSON.parse(savedCats));

    const savedPosts = localStorage.getItem('temple_posts_v19');
    if (savedPosts) setPosts(JSON.parse(savedPosts));

    const savedPages = localStorage.getItem('temple_pages_v19');
    if (savedPages) setCustomPages(JSON.parse(savedPages));

    const savedBranding = localStorage.getItem('temple_branding_v19');
    if (savedBranding) {
      const b = JSON.parse(savedBranding);
      setSplashImage(b.splash || splashImage);
      
      if (b.nameSi && !b.nameSi.toLowerCase().includes('pabassara') && !b.nameSi.includes('පබස්සරා')) {
        setTempleNameSi(b.nameSi);
      } else {
        setTempleNameSi('ශ්‍රී බෝධිරුක්ඛාරාමය');
      }

      if (b.nameEn && !b.nameEn.toLowerCase().includes('pabassara')) {
        setTempleNameEn(b.nameEn);
      } else {
        setTempleNameEn('Sri Bodhirukkharamaya');
      }

      setTempleLocationSi(b.locSi || templeLocationSi);
      setTempleLocationEn(b.locEn || templeLocationEn);
    }

    const savedImgs = localStorage.getItem('temple_imgs_v19');
    if (savedImgs) {
      const p = JSON.parse(savedImgs);
      setBgWallpaper(p.bg || '');
      setHeroCover(p.hero || '');
      setBadgeLogo(p.badge || '');
      setTimerCover(p.timer || '');
    }

    const savedEvent = localStorage.getItem('temple_event_v19');
    if (savedEvent) {
      const e = JSON.parse(savedEvent);
      setEventTitleSi(e.titleSi || '');
      setEventTitleEn(e.titleEn || '');
      setEventTargetDate(e.date || '2026-11-15T08:00');
    }

    const savedBank = localStorage.getItem('temple_bank_v19');
    if (savedBank) {
      const p = JSON.parse(savedBank);
      setBankName(p.name || '');
      setBankAccountName(p.accName || '');
      setBankAccountNumber(p.accNo || '');
      setBankBranch(p.branch || '');
      setBankQrImage(p.qr || '');
    }
  }, []);

  // Event Timer Calculation
  useEffect(() => {
    const calculateTimeLeft = () => {
      const diff = +new Date(eventTargetDate) - +new Date();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      } else setTimeLeft(null);
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [eventTargetDate]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const saveAdminConfigs = () => {
    localStorage.setItem('temple_branding_v19', JSON.stringify({
      splash: splashImage, nameSi: templeNameSi, nameEn: templeNameEn, locSi: templeLocationSi, locEn: templeLocationEn
    }));
    localStorage.setItem('temple_imgs_v19', JSON.stringify({ bg: bgWallpaper, hero: heroCover, badge: badgeLogo, timer: timerCover }));
    localStorage.setItem('temple_event_v19', JSON.stringify({ titleSi: eventTitleSi, titleEn: eventTitleEn, date: eventTargetDate }));
    localStorage.setItem('temple_bank_v19', JSON.stringify({ name: bankName, accName: bankAccountName, accNo: bankAccountNumber, branch: bankBranch, qr: bankQrImage }));
    localStorage.setItem('temple_cats_v19', JSON.stringify(categories));
    localStorage.setItem('temple_pages_v19', JSON.stringify(customPages));
    localStorage.setItem('temple_posts_v19', JSON.stringify(posts));
    if (newAdminPassword) setAdminPassword(newAdminPassword);
    alert('සියලුම වෙනස්කම් සාර්ථකව සුරකින ලදී!');
  };

  // Category Handlers
  const handleSaveCategory = () => {
    if (!catSi || !catEn) return alert('අංශයේ නම ඇතුළත් කරන්න.');
    let updated: Category[];
    if (editingCatId) {
      updated = categories.map(c => c.id === editingCatId ? { ...c, labelSi: catSi, labelEn: catEn, icon: catIcon } : c);
      setEditingCatId(null);
    } else {
      updated = [...categories, { id: `cat_${Date.now()}`, labelSi: catSi, labelEn: catEn, icon: catIcon || '📌' }];
    }
    setCategories(updated);
    localStorage.setItem('temple_cats_v19', JSON.stringify(updated));
    cancelCatEdit();
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCatId(cat.id);
    setCatSi(cat.labelSi);
    setCatEn(cat.labelEn);
    setCatIcon(cat.icon);
  };

  const cancelCatEdit = () => {
    setEditingCatId(null);
    setCatSi('');
    setCatEn('');
    setCatIcon('📌');
  };

  const deleteCategory = (id: string) => {
    if (confirm('මෙම Section එක මකා දැමීමට තහවුරු කරන්න?')) {
      const updated = categories.filter(c => c.id !== id);
      setCategories(updated);
      localStorage.setItem('temple_cats_v19', JSON.stringify(updated));
    }
  };

  // Custom Page Handlers
  const handleSavePage = () => {
    if (!pageTitleSi || !pageContentSi) return alert('මාතෘකාව සහ විස්තරය අත්‍යවශ්‍යයි.');
    let updated: CustomPage[];
    if (editingPageId) {
      updated = customPages.map(p => p.id === editingPageId ? {
        ...p, titleSi: pageTitleSi, titleEn: pageTitleEn || pageTitleSi, contentSi: pageContentSi, contentEn: pageContentEn || pageContentSi, bannerImage: pageBanner
      } : p);
      setEditingPageId(null);
    } else {
      updated = [...customPages, {
        id: `page_${Date.now()}`,
        titleSi: pageTitleSi,
        titleEn: pageTitleEn || pageTitleSi,
        contentSi: pageContentSi,
        contentEn: pageContentEn || pageContentSi,
        bannerImage: pageBanner,
      }];
    }
    setCustomPages(updated);
    localStorage.setItem('temple_pages_v19', JSON.stringify(updated));
    cancelPageEdit();
  };

  const handleEditPage = (page: CustomPage) => {
    setEditingPageId(page.id);
    setPageTitleSi(page.titleSi);
    setPageTitleEn(page.titleEn);
    setPageContentSi(page.contentSi);
    setPageContentEn(page.contentEn);
    setPageBanner(page.bannerImage || '');
  };

  const cancelPageEdit = () => {
    setEditingPageId(null);
    setPageTitleSi('');
    setPageTitleEn('');
    setPageContentSi('');
    setPageContentEn('');
    setPageBanner('');
  };

  const deleteCustomPage = (id: string) => {
    if (confirm('මෙම පිටුව මකා දැමීමට අවශ්‍යද?')) {
      const updated = customPages.filter(p => p.id !== id);
      setCustomPages(updated);
      localStorage.setItem('temple_pages_v19', JSON.stringify(updated));
    }
  };

  // Post Handlers
  const savePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitleSi || !postDescSi) return alert('මාතෘකාව සහ විස්තරය අවශ්‍යයි.');

    if (editingPostId) {
      const updated = posts.map(p => p.id === editingPostId ? {
        ...p, category: postCat, titleSi: postTitleSi, titleEn: postTitleEn || postTitleSi, descriptionSi: postDescSi, descriptionEn: postDescEn || postDescSi, image: postImg, youtubeUrl: postYt
      } : p);
      setPosts(updated);
      localStorage.setItem('temple_posts_v19', JSON.stringify(updated));
    } else {
      const updated = [{
        id: `post_${Date.now()}`,
        category: postCat,
        titleSi: postTitleSi,
        titleEn: postTitleEn || postTitleSi,
        descriptionSi: postDescSi,
        descriptionEn: postDescEn || postDescSi,
        image: postImg,
        youtubeUrl: postYt,
      }, ...posts];
      setPosts(updated);
      localStorage.setItem('temple_posts_v19', JSON.stringify(updated));
    }
    cancelPostEdit();
  };

  const cancelPostEdit = () => {
    setEditingPostId(null);
    setPostTitleSi(''); setPostTitleEn(''); setPostDescSi(''); setPostDescEn(''); setPostImg(''); setPostYt('');
  };

  const deletePost = (id: string) => {
    if (confirm('මෙම සටහන මකා දැමීමට තහවුරු කරන්න?')) {
      const updated = posts.filter(p => p.id !== id);
      setPosts(updated);
      localStorage.setItem('temple_posts_v19', JSON.stringify(updated));
    }
  };

  const activeCategory = categories.find(c => c.id === activeTab);
  const activeCustomPage = customPages.find(p => p.id === activeTab);

  const filteredPosts = useMemo(() => {
    return posts.filter(p => p.category === activeTab && (
      p.titleSi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.descriptionSi.toLowerCase().includes(searchTerm.toLowerCase())
    ));
  }, [posts, activeTab, searchTerm]);

  return (
    <div
      className={`min-h-screen font-sans pb-32 transition-colors duration-300 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}
      style={{
        backgroundColor: isDarkMode ? '#030712' : '#f8fafc',
        backgroundImage: bgWallpaper ? `linear-gradient(to bottom, rgba(3, 7, 18, 0.88), rgba(3, 7, 18, 0.95)), url(${bgWallpaper})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Top Header Bar */}
      <div className={`py-3 px-6 sm:px-12 flex flex-wrap justify-between items-center gap-4 border-b backdrop-blur-md ${isDarkMode ? 'bg-slate-950/80 border-amber-500/20' : 'bg-white/80 border-slate-200'}`}>
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
          <span>📢</span> <span>{tickerText}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setLang(lang === 'si' ? 'en' : 'si')} className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950">
            {lang === 'si' ? 'English' : 'සිංහල'}
          </button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="px-3 py-1 rounded-full text-xs border border-amber-500/30">
            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button onClick={() => setShowDonateModal(true)} className="px-4 py-1.5 rounded-full text-xs font-black bg-amber-500 text-slate-950 shadow-lg">
            🙏 {lang === 'si' ? 'ආධාර / දායකත්ව' : 'Donations'}
          </button>
          <button onClick={() => {
            if (isAdmin) setIsAdmin(false);
            else {
              const pwd = prompt('Admin Password එක ඇතුළත් කරන්න:');
              if (pwd === adminPassword) setIsAdmin(true);
              else alert('මුරපදය වැරදියි!');
            }
          }} className={`px-3 py-1 rounded-full text-xs font-bold ${isAdmin ? 'bg-red-500 text-white' : 'bg-slate-800 text-amber-300'}`}>
            {isAdmin ? '🔒 Exit Admin' : '⚙️ Admin Panel'}
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <header
        className="relative py-16 px-4 text-center border-b border-amber-500/20 overflow-hidden"
        style={heroCover ? { backgroundImage: `linear-gradient(to bottom, rgba(3, 7, 18, 0.7), rgba(3, 7, 18, 0.95)), url(${heroCover})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-block p-2 rounded-full border-2 border-amber-500/40 bg-slate-950/60 shadow-xl backdrop-blur-md">
            {badgeLogo ? (
              <img src={badgeLogo} alt="Temple Logo" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <span className="text-5xl p-2 block">🪷</span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-amber-400 py-3 leading-normal drop-shadow-[0_4px_15px_rgba(245,158,11,0.4)]">
            {lang === 'si' ? templeNameSi : templeNameEn}
          </h1>

          <p className="text-xs sm:text-sm font-bold text-amber-300/80 tracking-widest uppercase">
            {lang === 'si' ? templeLocationSi : templeLocationEn}
          </p>
        </div>
      </header>

      {/* Event Countdown Section */}
      <section className="max-w-4xl mx-auto px-4 -mt-8 relative z-10">
        <div
          className="p-6 sm:p-8 rounded-3xl border-2 border-amber-500/40 shadow-2xl text-center relative overflow-hidden backdrop-blur-2xl bg-slate-950/90"
          style={timerCover ? { backgroundImage: `linear-gradient(to bottom, rgba(3, 7, 18, 0.75), rgba(3, 7, 18, 0.92)), url(${timerCover})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        >
          <span className="text-xs font-black uppercase text-amber-400 tracking-widest block mb-1">🪔 {lang === 'si' ? 'ඉදිරි විශේෂ පූජෝත්සවය' : 'Upcoming Event'} 🪔</span>
          <h2 className="text-xl sm:text-2xl font-black text-amber-200 mb-6 py-1 leading-normal">{lang === 'si' ? eventTitleSi : eventTitleEn}</h2>
          {timeLeft ? (
            <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl backdrop-blur-md"><span className="block text-2xl font-black text-amber-400">{timeLeft.days}</span><span className="text-[10px] text-slate-300 uppercase">Days</span></div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl backdrop-blur-md"><span className="block text-2xl font-black text-amber-400">{timeLeft.hours}</span><span className="text-[10px] text-slate-300 uppercase">Hours</span></div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl backdrop-blur-md"><span className="block text-2xl font-black text-amber-400">{timeLeft.minutes}</span><span className="text-[10px] text-slate-300 uppercase">Mins</span></div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl backdrop-blur-md"><span className="block text-2xl font-black text-amber-400">{timeLeft.seconds}</span><span className="text-[10px] text-slate-300 uppercase">Secs</span></div>
            </div>
          ) : (
            <div className="text-xs text-amber-400 font-bold p-3 bg-amber-500/10 rounded-xl">පූජෝත්සවය දැනට පැවැත්වේ හෝ අවසන් වී ඇත!</div>
          )}
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-30 backdrop-blur-2xl py-4 px-4 border-b border-amber-500/20 bg-slate-950/80 mt-10">
        <div className="max-w-5xl mx-auto space-y-4">
          <input
            type="text"
            placeholder={lang === 'si' ? 'තොරතුරු සොයන්න...' : 'Search details...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full max-w-md mx-auto block px-4 py-2 text-xs rounded-xl bg-slate-900 border border-amber-500/30 text-white outline-none"
          />
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeTab === cat.id ? 'bg-amber-500 text-slate-950 font-black scale-105' : 'bg-slate-900 text-slate-300 border border-amber-500/20 hover:text-amber-300'}`}
              >
                <span>{cat.icon}</span> <span>{lang === 'si' ? cat.labelSi : cat.labelEn}</span>
              </button>
            ))}
            {customPages.map(page => (
              <button
                key={page.id}
                onClick={() => setActiveTab(page.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeTab === page.id ? 'bg-amber-500 text-slate-950 font-black scale-105' : 'bg-slate-900 text-amber-300/80 border border-amber-500/30'}`}
              >
                <span>📄</span> <span>{lang === 'si' ? page.titleSi : page.titleEn}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <main className="max-w-4xl mx-auto px-4 mt-10">
        {activeCategory && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-amber-400 flex items-center gap-2 border-b border-amber-500/20 pb-3 py-1 leading-normal">
              <span>{activeCategory.icon}</span> <span>{lang === 'si' ? activeCategory.labelSi : activeCategory.labelEn}</span>
            </h2>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">තවමත් තොරතුරු ඇතුළත් කර නොමැත.</div>
            ) : (
              filteredPosts.map(post => (
                <article key={post.id} className="p-6 rounded-3xl bg-slate-900/80 border border-amber-500/20 space-y-4 shadow-xl relative">
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button onClick={() => {
                        setEditingPostId(post.id); setPostCat(post.category); setPostTitleSi(post.titleSi); setPostTitleEn(post.titleEn); setPostDescSi(post.descriptionSi); setPostDescEn(post.descriptionEn); setPostImg(post.image || ''); setPostYt(post.youtubeUrl || '');
                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                      }} className="px-2.5 py-1 text-[10px] bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30 font-bold">✏️ Edit</button>
                      <button onClick={() => deletePost(post.id)} className="px-2.5 py-1 text-[10px] bg-red-500/20 text-red-300 rounded-lg border border-red-500/30 font-bold">🗑️ Delete</button>
                    </div>
                  )}
                  <h3 className="text-lg font-black text-amber-300 py-1 leading-normal">{lang === 'si' ? post.titleSi : post.titleEn}</h3>
                  {post.image && (
                    <img src={post.image} alt="post" onClick={() => setLightboxImage(post.image!)} className="w-full max-h-80 object-cover rounded-2xl cursor-pointer hover:opacity-90 transition border border-amber-500/20" />
                  )}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">{lang === 'si' ? post.descriptionSi : post.descriptionEn}</p>
                </article>
              ))
            )}
          </div>
        )}

        {/* Custom Dynamic Pages Display */}
        {activeCustomPage && (
          <div className="p-8 rounded-3xl bg-slate-900/90 border border-amber-500/30 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-amber-500/20 pb-4">
              <h2 className="text-2xl font-black text-amber-400 py-1 leading-normal">📄 {lang === 'si' ? activeCustomPage.titleSi : activeCustomPage.titleEn}</h2>
              {isAdmin && (
                <div className="flex gap-2">
                  <button onClick={() => handleEditPage(activeCustomPage)} className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs rounded-xl border border-amber-500/30">Edit Page</button>
                  <button onClick={() => deleteCustomPage(activeCustomPage.id)} className="px-3 py-1 bg-red-500/20 text-red-300 text-xs rounded-xl border border-red-500/30">Delete Page</button>
                </div>
              )}
            </div>
            {activeCustomPage.bannerImage && (
              <img src={activeCustomPage.bannerImage} alt="page banner" className="w-full h-64 object-cover rounded-2xl border border-amber-500/20" />
            )}
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">{lang === 'si' ? activeCustomPage.contentSi : activeCustomPage.contentEn}</p>
          </div>
        )}

        {/* ADMIN MANAGEMENT PANEL */}
        {isAdmin && (
          <div className="mt-16 p-6 sm:p-10 bg-slate-950 border-2 border-amber-500/60 rounded-3xl space-y-10 shadow-2xl text-white">
            <h2 className="text-xl font-black text-amber-400 border-b border-amber-500/30 pb-4">
              🛠️ Admin Management Panel
            </h2>

            {/* 1. BRANDING & TEMPLE NAME */}
            <div className="space-y-4 p-5 bg-slate-900 rounded-2xl border border-amber-500/30">
              <h3 className="text-sm font-black text-amber-300">🏛️ 1. Temple Branding</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" value={templeNameSi} onChange={e => setTempleNameSi(e.target.value)} placeholder="පන්සලේ නම (සිංහල)" className="p-3 bg-slate-950 border border-amber-500/30 rounded-xl text-xs" />
                <input type="text" value={templeNameEn} onChange={e => setTempleNameEn(e.target.value)} placeholder="Temple Name (English)" className="p-3 bg-slate-950 border border-amber-500/30 rounded-xl text-xs" />
                <input type="text" value={templeLocationSi} onChange={e => setTempleLocationSi(e.target.value)} placeholder="ස්ථානය (සිංහල)" className="p-3 bg-slate-950 border border-amber-500/30 rounded-xl text-xs" />
                <input type="text" value={templeLocationEn} onChange={e => setTempleLocationEn(e.target.value)} placeholder="Location (English)" className="p-3 bg-slate-950 border border-amber-500/30 rounded-xl text-xs" />
              </div>
            </div>

            {/* 2. EVENT COUNTDOWN & TIMER */}
            <div className="space-y-4 p-5 bg-slate-900 rounded-2xl border border-amber-500/30">
              <h3 className="text-sm font-black text-amber-300">⏱️ 2. Event Countdown & Timer Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" value={eventTitleSi} onChange={e => setEventTitleSi(e.target.value)} placeholder="උත්සවයේ මාතෘකාව (සිංහල)" className="p-3 bg-slate-950 border border-amber-500/30 rounded-xl text-xs" />
                <input type="text" value={eventTitleEn} onChange={e => setEventTitleEn(e.target.value)} placeholder="Event Title (English)" className="p-3 bg-slate-950 border border-amber-500/30 rounded-xl text-xs" />
              </div>
              <input type="datetime-local" value={eventTargetDate} onChange={e => setEventTargetDate(e.target.value)} className="w-full p-3 bg-slate-950 border border-amber-500/30 rounded-xl text-xs text-white" />
            </div>

            {/* 3. BANK DETAILS */}
            <div className="space-y-4 p-5 bg-slate-900 rounded-2xl border border-amber-500/30">
              <h3 className="text-sm font-black text-amber-300">🏦 3. Bank & Donation Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="Bank Name" className="p-3 bg-slate-950 border border-amber-500/30 rounded-xl text-xs" />
                <input type="text" value={bankAccountName} onChange={e => setBankAccountName(e.target.value)} placeholder="Account Name" className="p-3 bg-slate-950 border border-amber-500/30 rounded-xl text-xs" />
                <input type="text" value={bankAccountNumber} onChange={e => setBankAccountNumber(e.target.value)} placeholder="Account Number" className="p-3 bg-slate-950 border border-amber-500/30 rounded-xl text-xs" />
                <input type="text" value={bankBranch} onChange={e => setBankBranch(e.target.value)} placeholder="Branch Name" className="p-3 bg-slate-950 border border-amber-500/30 rounded-xl text-xs" />
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/30 space-y-2">
                <label className="text-xs font-bold text-amber-400 block">📱 Bank QR Code Image</label>
                <input type="file" accept="image/*" onChange={e => handleFileUpload(e, setBankQrImage)} className="text-xs text-slate-300 w-full" />
              </div>
            </div>

            {/* 4. POST CREATOR / EDITOR */}
            <div className="space-y-4 p-5 bg-slate-900 rounded-2xl border border-amber-500/30">
              <div className="flex justify-between items-center border-b border-amber-500/20 pb-2">
                <h3 className="text-sm font-black text-amber-300">
                  {editingPostId ? '✏️ Edit & Update Post' : '✏️ 4. Post Creator'}
                </h3>
                {editingPostId && (
                  <button onClick={cancelPostEdit} className="text-xs px-3 py-1 bg-slate-800 text-slate-300 rounded-lg">Cancel Edit</button>
                )}
              </div>
              <form onSubmit={savePost} className="space-y-4">
                <select value={postCat} onChange={e => setPostCat(e.target.value)} className="w-full p-3 bg-slate-950 border border-amber-500/30 rounded-xl text-xs text-white">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.labelSi}</option>)}
                </select>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="text" value={postTitleSi} onChange={e => setPostTitleSi(e.target.value)} placeholder="සිංහල මාතෘකාව" className="p-3 bg-slate-950 border border-amber-500/40 rounded-xl text-xs text-amber-300 font-bold" />
                  <input type="text" value={postTitleEn} onChange={e => setPostTitleEn(e.target.value)} placeholder="English Title" className="p-3 bg-slate-950 border border-amber-500/40 rounded-xl text-xs text-amber-200" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <textarea rows={3} value={postDescSi} onChange={e => setPostDescSi(e.target.value)} placeholder="සිංහල විස්තරය" className="p-3 bg-slate-950 border border-amber-500/40 rounded-xl text-xs text-slate-200" />
                  <textarea rows={3} value={postDescEn} onChange={e => setPostDescEn(e.target.value)} placeholder="English Description" className="p-3 bg-slate-950 border border-amber-500/40 rounded-xl text-xs text-slate-200" />
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-amber-500/20">
                  <label className="text-xs font-bold text-amber-400 block mb-1">🖼️ Upload Post Photo</label>
                  <input type="file" accept="image/*" onChange={e => handleFileUpload(e, setPostImg)} className="text-xs text-slate-300 w-full" />
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="flex-1 p-3 bg-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-lg">
                    {editingPostId ? '💾 Save & Update Post' : '📢 Publish Post'}
                  </button>
                  {editingPostId && (
                    <button type="button" onClick={cancelPostEdit} className="p-3 bg-slate-800 text-slate-300 rounded-xl text-xs">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* 5. SECTIONS / CATEGORIES MANAGER */}
            <div className="space-y-4 p-5 bg-slate-900 rounded-2xl border border-amber-500/30">
              <div className="flex justify-between items-center border-b border-amber-500/20 pb-2">
                <h3 className="text-sm font-black text-amber-300">🗂️ 5. Categories Manager</h3>
                {editingCatId && <button onClick={cancelCatEdit} className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded">Cancel Edit</button>}
              </div>

              <div className="space-y-2">
                {categories.map(c => (
                  <div key={c.id} className="flex justify-between items-center p-2.5 bg-slate-950 rounded-xl border border-amber-500/20 text-xs">
                    <span>{c.icon} {c.labelSi} ({c.labelEn})</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditCategory(c)} className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded">Edit</button>
                      <button onClick={() => deleteCategory(c.id)} className="px-2 py-1 bg-red-500/20 text-red-300 rounded">Delete</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
                <input type="text" value={catIcon} onChange={e => setCatIcon(e.target.value)} placeholder="Icon (e.g. 🪷)" className="p-2.5 bg-slate-950 border border-amber-500/30 rounded-xl text-xs text-center" />
                <input type="text" value={catSi} onChange={e => setCatSi(e.target.value)} placeholder="අංශයේ නම (සිංහල)" className="p-2.5 bg-slate-950 border border-amber-500/30 rounded-xl text-xs" />
                <input type="text" value={catEn} onChange={e => setCatEn(e.target.value)} placeholder="Section Name (English)" className="p-2.5 bg-slate-950 border border-amber-500/30 rounded-xl text-xs" />
                <button onClick={handleSaveCategory} className="bg-amber-500 text-slate-950 font-black rounded-xl text-xs p-2.5">
                  {editingCatId ? 'Update Section' : 'Add Section'}
                </button>
              </div>
            </div>

            {/* 6. CUSTOM PAGES MANAGER */}
            <div className="space-y-4 p-5 bg-slate-900 rounded-2xl border border-amber-500/30">
              <div className="flex justify-between items-center border-b border-amber-500/20 pb-2">
                <h3 className="text-sm font-black text-amber-300">📄 6. Dynamic Custom Pages Manager</h3>
                {editingPageId && <button onClick={cancelPageEdit} className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded">Cancel Edit</button>}
              </div>

              {customPages.length > 0 && (
                <div className="space-y-2">
                  {customPages.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-2.5 bg-slate-950 rounded-xl border border-amber-500/20 text-xs">
                      <span>📄 {p.titleSi}</span>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditPage(p)} className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded">Edit</button>
                        <button onClick={() => deleteCustomPage(p.id)} className="px-2 py-1 bg-red-500/20 text-red-300 rounded">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input type="text" value={pageTitleSi} onChange={e => setPageTitleSi(e.target.value)} placeholder="පිටුවේ මාතෘකාව (සිංහල)" className="p-3 bg-slate-950 border border-amber-500/30 rounded-xl text-xs" />
                  <input type="text" value={pageTitleEn} onChange={e => setPageTitleEn(e.target.value)} placeholder="Page Title (English)" className="p-3 bg-slate-950 border border-amber-500/30 rounded-xl text-xs" />
                </div>
                <textarea rows={3} value={pageContentSi} onChange={e => setPageContentSi(e.target.value)} placeholder="විස්තරය (සිංහල)" className="w-full p-3 bg-slate-950 border border-amber-500/30 rounded-xl text-xs" />
                <textarea rows={3} value={pageContentEn} onChange={e => setPageContentEn(e.target.value)} placeholder="Content (English)" className="w-full p-3 bg-slate-950 border border-amber-500/30 rounded-xl text-xs" />
                <button onClick={handleSavePage} className="w-full p-3 bg-amber-500 text-slate-950 font-black rounded-xl text-xs">
                  {editingPageId ? 'Update Page' : 'Save Custom Page'}
                </button>
              </div>
            </div>

            {/* Global System Save Button */}
            <button onClick={saveAdminConfigs} className="w-full py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-sm rounded-2xl shadow-2xl">
              💾 Save All Global System Settings
            </button>
          </div>
        )}
      </main>

      {/* Fullscreen Lightbox Modal */}
      {lightboxImage && (
        <div onClick={() => setLightboxImage(null)} className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <img src={lightboxImage} alt="Fullscreen" className="max-w-full max-h-[90vh] rounded-2xl border border-amber-500/40" />
        </div>
      )}

      {/* Bank Donation Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-amber-500/40 p-6 rounded-3xl max-w-md w-full space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-amber-500/20 pb-3">
              <h3 className="text-base font-black text-amber-400">🙏 {lang === 'si' ? 'ආධාර / දායකත්ව' : 'Donations'}</h3>
              <button onClick={() => setShowDonateModal(false)} className="text-slate-400">✕</button>
            </div>
            {bankQrImage && <img src={bankQrImage} alt="Bank QR" className="w-32 h-32 mx-auto rounded-xl border border-amber-500/30" />}
            <div className="space-y-2 text-xs bg-slate-950 p-4 rounded-2xl border border-amber-500/20">
              <div><b>බැංකුව:</b> {bankName}</div>
              <div><b>ගිණුම් නම:</b> {bankAccountName}</div>
              <div><b>ගිණුම් අංකය:</b> {bankAccountNumber}</div>
              <div><b>ශාඛාව:</b> {bankBranch}</div>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(bankAccountNumber); alert('ගිණුම් අංකය Copied!'); }} className="w-full py-3 bg-amber-500 text-slate-950 font-black text-xs rounded-xl">
              📋 Copy Account Number
            </button>
          </div>
        </div>
      )}
    </div>
  );
}