'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';

// Types & Interfaces
type AdminRole = 'super_admin' | 'editor' | 'dhamma_admin';

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
  status: 'published' | 'draft';
  createdAt: string;
}

interface StudentEnrollment {
  id: string;
  studentName: string;
  guardianName: string;
  phone: string;
  grade: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

interface DonationSlip {
  id: string;
  donorName: string;
  amount: string;
  phone: string;
  slipImage: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

interface MusicTrack {
  id: string;
  title: string;
  audioUrl: string;
  coverImage?: string;
  createdAt: string;
}

type SiteContent = Partial<{
  categories: Category[];
  customPages: CustomPage[];
  posts: Post[];
  templeNameSi: string;
  templeNameEn: string;
  templeLocationSi: string;
  templeLocationEn: string;
  tickerText: string;
  eventTitleSi: string;
  eventTitleEn: string;
  eventTargetDate: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankBranch: string;
  isLiveStreaming: boolean;
  liveStreamUrl: string;
  bgWallpaper: string;
  heroCover: string;
  badgeLogo: string;
  timerCover: string;
  dailyVerseSi: string;
  dailyVerseMeaningSi: string;
  pujaMorning: string;
  pujaNoon: string;
  pujaEvening: string;
  pujaMorningImg: string;
  pujaNoonImg: string;
  pujaEveningImg: string;
  musicTracks: MusicTrack[];
}>;

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'history', labelSi: 'ඉතිහාසය සහ තොරතුරු', labelEn: 'History & Overview', icon: '🏛️' },
  { id: 'dhamma', labelSi: 'ශ්‍රී ධර්මාරාම දහම් පාසල', labelEn: 'Dhamma School', icon: '🪷' },
  { id: 'monks', labelSi: 'වැඩවසන ස්වාමීන් වහන්සේලා', labelEn: 'Resident Monks', icon: '🧘‍♂️' },
  { id: 'videos', labelSi: 'ධර්ම දේශනා සහ වීඩියෝ', labelEn: 'Sermons & Videos', icon: '🎥' },
  { id: 'pinkam', labelSi: 'පින්කම් මාලාව', labelEn: 'Religious Events', icon: '🪔' },
];

export default function CompleteTempleApp() {
  const [lang, setLang] = useState<'si' | 'en'>('si');
  const [activeTab, setActiveTab] = useState('history');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [selectedPostModal, setSelectedPostModal] = useState<Post | null>(null);

  // Admin Auth & Role System
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentRole, setCurrentRole] = useState<AdminRole>('super_admin');
  const [adminPassword, setAdminPassword] = useState('1234');
  const [editorPassword, setEditorPassword] = useState('5678');
  const [dhammaPassword, setDhammaPassword] = useState('9012');
  const [loginRole, setLoginRole] = useState<AdminRole>('super_admin');
  const [inputPassword, setInputPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminSubTab, setAdminSubTab] = useState<'general' | 'roles' | 'posts' | 'pages' | 'slips' | 'students'>('general');

  // Dynamic Branding
  const [splashImage, setSplashImage] = useState('https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Dharmachakra.svg/512px-Dharmachakra.svg.png');
  const [templeNameSi, setTempleNameSi] = useState('ශ්‍රී බෝධිරුක්ඛාරාම මහා විහාරය');
  const [templeNameEn, setTempleNameEn] = useState('Sri Bodhirukkharamaya Maha Viharaya');
  const [templeLocationSi, setTempleLocationSi] = useState('ගණිහිමුල්ල, දෙවලපොල');
  const [templeLocationEn, setTempleLocationEn] = useState('Ganihimulla, Devalapola');

  // Daily Verse / Dhamma Thought State
  const [dailyVerseSi, setDailyVerseSi] = useState('නහි වේරේන වේරානි සම්මන්තීධ කුදාචනං | අවේරේන ච සම්මන්ති ඒස ධම්මෝ සනන්තනෝ.');
  const [dailyVerseMeaningSi, setDailyVerseMeaningSi] = useState('වෛරයෙන් වෛරය කිසිදිනෙක නොසංසිඳේ. අවෛරයෙන්ම වෛරය සංසිඳේ. මෙය සනාතන ධර්මතාවයයි.');

  // Daily Worship Schedule State & Images
  const [pujaMorning, setPujaMorning] = useState('පෙ.ව. 06:00');
  const [pujaNoon, setPujaNoon] = useState('පෙ.ව. 11:00');
  const [pujaEvening, setPujaEvening] = useState('ප.ව. 06:30');
  const [pujaMorningImg, setPujaMorningImg] = useState('');
  const [pujaNoonImg, setPujaNoonImg] = useState('');
  const [pujaEveningImg, setPujaEveningImg] = useState('');

  // Live Stream Link Status
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);
  const [liveStreamUrl, setLiveStreamUrl] = useState('');

  // Media & Backgrounds
  const [bgWallpaper, setBgWallpaper] = useState('');
  const [heroCover, setHeroCover] = useState('');
  const [badgeLogo, setBadgeLogo] = useState('');
  const [timerCover, setTimerCover] = useState('');

  // Event & Timer Configurations
  const [eventTitleSi, setEventTitleSi] = useState('වාර්ෂික මහා කඨින පූජෝත්සවය');
  const [eventTitleEn, setEventTitleEn] = useState('Annual Great Katina Ceremony');
  const [eventTargetDate, setEventTargetDate] = useState('2026-11-15T08:00');
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  // Bank Details & Slips
  const [bankName, setBankName] = useState('ලංකා බැංකුව (BOC)');
  const [bankAccountName, setBankAccountName] = useState('ශ්‍රී බෝධිරුක්ඛාරාම සංවර්ධන සභාව');
  const [bankAccountNumber, setBankAccountNumber] = useState('1234567890');
  const [bankBranch, setBankBranch] = useState('දෙවලපොල');
  const [donationSlips, setDonationSlips] = useState<DonationSlip[]>([]);
  const [slipFilter, setSlipFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Donation Submission Form State
  const [donorName, setDonorName] = useState('');
  const [donorAmount, setDonorAmount] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorSlipImg, setDonorSlipImg] = useState('');

  // Student Enrollments State
  const [studentEnrollments, setStudentEnrollments] = useState<StudentEnrollment[]>([]);
  const [studentName, setStudentName] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentGrade, setStudentGrade] = useState('1');
  const [studentAddress, setStudentAddress] = useState('');
  const [studentFilter, setStudentFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Categories, Pages & Posts
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categorySi, setCategorySi] = useState('');
  const [categoryEn, setCategoryEn] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('📌');

  // Page Form State (Create & Edit)
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [pageTitleSi, setPageTitleSi] = useState('');
  const [pageTitleEn, setPageTitleEn] = useState('');
  const [pageContentSi, setPageContentSi] = useState('');
  const [pageContentEn, setPageContentEn] = useState('');
  const [pageBanner, setPageBanner] = useState('');

  // Pirith Audio Player State
  const [isPlayingPirith, setIsPlayingPirith] = useState(false);
  const [pirithUrl, setPirithUrl] = useState('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');

  // Music Player State
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);
  const [activeMusicId, setActiveMusicId] = useState<string>('');
  const [editingMusicId, setEditingMusicId] = useState<string | null>(null);
  const [musicTitle, setMusicTitle] = useState('');
  const [musicUrl, setMusicUrl] = useState('');
  const [musicCover, setMusicCover] = useState('');
  const [musicVolume, setMusicVolume] = useState(0.8);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Ticker
  const [tickerText, setTickerText] = useState('2026 වසර සඳහා දහම් පාසලට නවක සිසුන් ඇතුළත් කරගැනීම දැනට සිදුකෙරේ.');

  // Editing States for Posts
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postCat, setPostCat] = useState('history');
  const [postTitleSi, setPostTitleSi] = useState('');
  const [postTitleEn, setPostTitleEn] = useState('');
  const [postDescSi, setPostDescSi] = useState('');
  const [postDescEn, setPostDescEn] = useState('');
  const [postImg, setPostImg] = useState('');
  const [postYt, setPostYt] = useState('');
  const [postStatus, setPostStatus] = useState<'published' | 'draft'>('published');

  // IMAGE EDITOR MODAL STATE
  const [rawImageForEdit, setRawImageForEdit] = useState<string | null>(null);
  const [onImageEditedCallback, setOnImageEditedCallback] = useState<((editedBase64: string) => void) | null>(null);
  const [imgRotation, setImgRotation] = useState(0);
  const [imgBrightness, setImgBrightness] = useState(100);
  const [imgContrast, setImgContrast] = useState(100);
  const [imgFlipH, setImgFlipH] = useState(false);
  const [imgGrayscale, setImgGrayscale] = useState(false);
  const cloudReadyRef = useRef(false);

  const applySiteContent = (content: SiteContent) => {
    if (content.categories) setCategories(content.categories);
    if (content.customPages) setCustomPages(content.customPages);
    if (content.posts) setPosts(content.posts);
    if (content.templeNameSi) setTempleNameSi(content.templeNameSi);
    if (content.templeNameEn) setTempleNameEn(content.templeNameEn);
    if (content.templeLocationSi) setTempleLocationSi(content.templeLocationSi);
    if (content.templeLocationEn) setTempleLocationEn(content.templeLocationEn);
    if (content.tickerText) setTickerText(content.tickerText);
    if (content.eventTitleSi) setEventTitleSi(content.eventTitleSi);
    if (content.eventTitleEn) setEventTitleEn(content.eventTitleEn);
    if (content.eventTargetDate) setEventTargetDate(content.eventTargetDate);
    if (content.bankName) setBankName(content.bankName);
    if (content.bankAccountName) setBankAccountName(content.bankAccountName);
    if (content.bankAccountNumber) setBankAccountNumber(content.bankAccountNumber);
    if (content.bankBranch) setBankBranch(content.bankBranch);
    if (typeof content.isLiveStreaming === 'boolean') setIsLiveStreaming(content.isLiveStreaming);
    if (content.liveStreamUrl) setLiveStreamUrl(content.liveStreamUrl);
    if (content.bgWallpaper) setBgWallpaper(content.bgWallpaper);
    if (content.heroCover) setHeroCover(content.heroCover);
    if (content.badgeLogo) setBadgeLogo(content.badgeLogo);
    if (content.timerCover) setTimerCover(content.timerCover);
    if (content.dailyVerseSi) setDailyVerseSi(content.dailyVerseSi);
    if (content.dailyVerseMeaningSi) setDailyVerseMeaningSi(content.dailyVerseMeaningSi);
    if (content.pujaMorning) setPujaMorning(content.pujaMorning);
    if (content.pujaNoon) setPujaNoon(content.pujaNoon);
    if (content.pujaEvening) setPujaEvening(content.pujaEvening);
    if (content.pujaMorningImg) setPujaMorningImg(content.pujaMorningImg);
    if (content.pujaNoonImg) setPujaNoonImg(content.pujaNoonImg);
    if (content.pujaEveningImg) setPujaEveningImg(content.pujaEveningImg);
    if (content.musicTracks) {
      setMusicTracks(content.musicTracks);
      setActiveMusicId(content.musicTracks[0]?.id || '');
    }
  };

  // Load Storage Configurations
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const savedCats = localStorage.getItem('temple_categories_v20');
    if (savedCats) setCategories(JSON.parse(savedCats));

    const savedPosts = localStorage.getItem('temple_posts_v20');
    if (savedPosts) setPosts(JSON.parse(savedPosts));

    const savedPages = localStorage.getItem('temple_pages_v20');
    if (savedPages) setCustomPages(JSON.parse(savedPages));

    const savedBranding = localStorage.getItem('temple_branding_v20');
    if (savedBranding) {
      const b = JSON.parse(savedBranding);
      setTempleNameSi(b.nameSi || templeNameSi);
      setTempleNameEn(b.nameEn || templeNameEn);
      setTempleLocationSi(b.locSi || templeLocationSi);
      setTempleLocationEn(b.locEn || templeLocationEn);
      setTickerText(b.ticker || tickerText);
    }

    const savedEvent = localStorage.getItem('temple_event_v20');
    if (savedEvent) {
      const e = JSON.parse(savedEvent);
      setEventTitleSi(e.titleSi || eventTitleSi);
      setEventTitleEn(e.titleEn || eventTitleEn);
      setEventTargetDate(e.date || eventTargetDate);
    }

    const savedBank = localStorage.getItem('temple_bank_v20');
    if (savedBank) {
      const b = JSON.parse(savedBank);
      setBankName(b.name || bankName);
      setBankAccountName(b.accountName || bankAccountName);
      setBankAccountNumber(b.accountNumber || bankAccountNumber);
      setBankBranch(b.branch || bankBranch);
    }

    const savedLive = localStorage.getItem('temple_live_v20');
    if (savedLive) {
      const live = JSON.parse(savedLive);
      setIsLiveStreaming(Boolean(live.enabled));
      setLiveStreamUrl(live.url || '');
    }

    const savedMedia = localStorage.getItem('temple_media_v20');
    if (savedMedia) {
      const m = JSON.parse(savedMedia);
      setBgWallpaper(m.bgWallpaper || '');
      setHeroCover(m.heroCover || '');
      setBadgeLogo(m.badgeLogo || '');
      setTimerCover(m.timerCover || '');
    }

    const savedVerse = localStorage.getItem('temple_verse_v20');
    if (savedVerse) {
      const v = JSON.parse(savedVerse);
      setDailyVerseSi(v.verse || dailyVerseSi);
      setDailyVerseMeaningSi(v.meaning || dailyVerseMeaningSi);
    }

    const savedPuja = localStorage.getItem('temple_puja_v20');
    if (savedPuja) {
      const p = JSON.parse(savedPuja);
      setPujaMorning(p.morning || pujaMorning);
      setPujaNoon(p.noon || pujaNoon);
      setPujaEvening(p.evening || pujaEvening);
      setPujaMorningImg(p.morningImg || '');
      setPujaNoonImg(p.noonImg || '');
      setPujaEveningImg(p.eveningImg || '');
    }

    const savedMusic = localStorage.getItem('temple_music_v20');
    if (savedMusic) {
      const storedTracks = JSON.parse(savedMusic);
      const tracks = Array.isArray(storedTracks)
        ? storedTracks.filter((track: MusicTrack) => track.id !== 'default-track' && track.audioUrl)
        : [];
      setMusicTracks(tracks);
      setActiveMusicId(tracks[0]?.id || '');
    }

    // Load Saved Passwords
    const savedPasswords = localStorage.getItem('temple_passwords_v20');
    if (savedPasswords) {
      const p = JSON.parse(savedPasswords);
      if (p.admin) setAdminPassword(p.admin);
      if (p.editor) setEditorPassword(p.editor);
      if (p.dhamma) setDhammaPassword(p.dhamma);
    }

    const savedSlips = localStorage.getItem('temple_slips_v20');
    if (savedSlips) setDonationSlips(JSON.parse(savedSlips));

    const savedEnrollments = localStorage.getItem('temple_enrollments_v20');
    if (savedEnrollments) setStudentEnrollments(JSON.parse(savedEnrollments));

    if (supabase) {
      void (async () => {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          setIsAdmin(true);
          setAdminEmail(sessionData.session.user.email || '');
        }
        const { data: cloudRow } = await supabase
          .from('site_content')
          .select('content')
          .eq('id', 'main')
          .maybeSingle();
        if (cloudRow?.content) applySiteContent(cloudRow.content as SiteContent);
        cloudReadyRef.current = true;
      })();
    } else {
      cloudReadyRef.current = true;
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

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

  // Image Processing Handler using Canvas
  const openImageEditor = (imageSrc: string, callback: (edited: string) => void) => {
    setRawImageForEdit(imageSrc);
    setOnImageEditedCallback(() => callback);
    setImgRotation(0);
    setImgBrightness(100);
    setImgContrast(100);
    setImgFlipH(false);
    setImgGrayscale(false);
  };

  const applyImageEdits = () => {
    if (!rawImageForEdit || !onImageEditedCallback) return;
    const img = new Image();
    img.src = rawImageForEdit;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      if (imgRotation % 180 !== 0) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      ctx.filter = `brightness(${imgBrightness}%) contrast(${imgContrast}%) ${imgGrayscale ? 'grayscale(100%)' : ''}`;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((imgRotation * Math.PI) / 180);
      ctx.scale(imgFlipH ? -1 : 1, 1);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const processedBase64 = canvas.toDataURL('image/jpeg', 0.9);
      onImageEditedCallback(processedBase64);
      setRawImageForEdit(null);
    };
  };

  const handleFileUploadWithEditor = (e: React.ChangeEvent<HTMLInputElement>, callback: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        openImageEditor(reader.result as string, callback);
      };
      reader.readAsDataURL(file);
    }
  };

  // Auth & Permissions Check
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (supabase && adminEmail) {
      const { error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: inputPassword,
      });

      if (!error) {
        setIsAdmin(true);
        setCurrentRole(loginRole);
        setShowLoginModal(false);
        setInputPassword('');
        return;
      }
    }

    let valid = false;
    if (loginRole === 'super_admin' && inputPassword === adminPassword) valid = true;
    if (loginRole === 'editor' && inputPassword === editorPassword) valid = true;
    if (loginRole === 'dhamma_admin' && inputPassword === dhammaPassword) valid = true;

    if (valid) {
      setIsAdmin(true);
      setCurrentRole(loginRole);
      setShowLoginModal(false);
      setInputPassword('');
    } else {
      alert('ඇතුළත් කළ මුරපදය වැරදියි. නැවත උත්සාහ කරන්න.');
    }
  };

  const handleAdminLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setIsAdmin(false);
    setAdminEmail('');
  };

  const canAccess = (feature: 'general' | 'roles' | 'posts' | 'pages' | 'slips' | 'students') => {
    if (!isAdmin) return false;
    if (currentRole === 'super_admin') return true;
    if (currentRole === 'editor') return ['posts', 'pages', 'general'].includes(feature);
    if (currentRole === 'dhamma_admin') return ['posts', 'pages', 'students'].includes(feature);
    return false;
  };

  const saveCategory = () => {
    if (!categorySi || !categoryEn) {
      alert('කාණ්ඩයේ නම සහ ඉංග්‍රීසි නම ඇතුළත් කරන්න.');
      return;
    }

    let updated: Category[];
    if (editingCategoryId) {
      updated = categories.map(c => c.id === editingCategoryId ? { ...c, labelSi: categorySi, labelEn: categoryEn, icon: categoryIcon || '📌' } : c);
      setEditingCategoryId(null);
    } else {
      updated = [...categories, { id: `cat_${crypto.randomUUID()}`, labelSi: categorySi, labelEn: categoryEn, icon: categoryIcon || '📌' }];
    }

    setCategories(updated);
    localStorage.setItem('temple_categories_v20', JSON.stringify(updated));
    cancelCategoryEdit();
  };

  const editCategory = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setCategorySi(cat.labelSi);
    setCategoryEn(cat.labelEn);
    setCategoryIcon(cat.icon);
  };

  const deleteCategory = (id: string) => {
    if (!confirm('මෙම කාණ්ඩය මකා දැමීමට අවශ්‍යද?')) return;
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    localStorage.setItem('temple_categories_v20', JSON.stringify(updated));
    if (activeTab === id) setActiveTab('history');
  };

  const cancelCategoryEdit = () => {
    setEditingCategoryId(null);
    setCategorySi('');
    setCategoryEn('');
    setCategoryIcon('📌');
  };

  // Save Passwords Functionality
  const savePasswords = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('temple_passwords_v20', JSON.stringify({
      admin: adminPassword,
      editor: editorPassword,
      dhamma: dhammaPassword,
    }));
    alert('සියලුම මුරපද (Passwords) සාර්ථකව යාවත්කාලීන කර Save කරන ලදී!');
  };

  // YouTube Helpers
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const getYouTubeThumbnail = (url: string) => {
    const id = getYouTubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
  };

  // Post Handlers
  const savePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitleSi || !postDescSi) return alert('මාතෘකාව සහ විස්තරය ඇතුළත් කිරීම අනිවාර්ය වේ.');

    if (editingPostId) {
      const updated = posts.map(p => p.id === editingPostId ? {
        ...p, category: postCat, titleSi: postTitleSi, titleEn: postTitleEn || postTitleSi, descriptionSi: postDescSi, descriptionEn: postDescEn || postDescSi, image: postImg, youtubeUrl: postYt, status: postStatus
      } : p);
      setPosts(updated);
      localStorage.setItem('temple_posts_v20', JSON.stringify(updated));
    } else {
      const updated: Post[] = [{
        id: `post_${crypto.randomUUID()}`,
        category: postCat,
        titleSi: postTitleSi,
        titleEn: postTitleEn || postTitleSi,
        descriptionSi: postDescSi,
        descriptionEn: postDescEn || postDescSi,
        image: postImg,
        youtubeUrl: postYt,
        status: postStatus,
        createdAt: new Date().toLocaleDateString('si-LK'),
      }, ...posts];
      setPosts(updated);
      localStorage.setItem('temple_posts_v20', JSON.stringify(updated));
    }
    cancelPostEdit();
    alert('ලිපිය සාර්ථකව සුරකියි!');
  };

  const cancelPostEdit = () => {
    setEditingPostId(null);
    setPostTitleSi(''); setPostTitleEn(''); setPostDescSi(''); setPostDescEn(''); setPostImg(''); setPostYt(''); setPostStatus('published');
  };

  const deletePost = (id: string) => {
    if (confirm('මෙම ලිපිය පද්ධතියෙන් මකා දැමීමට තහවුරු කරන්න?')) {
      const updated = posts.filter(p => p.id !== id);
      setPosts(updated);
      localStorage.setItem('temple_posts_v20', JSON.stringify(updated));
    }
  };

  // Custom Page Creator & Editor
  const saveCustomPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageTitleSi || !pageContentSi) return alert('පිටුවේ මාතෘකාව සහ අන්තර්ගතය ඇතුළත් කරන්න.');

    if (editingPageId) {
      const updated = customPages.map(p => p.id === editingPageId ? {
        ...p,
        titleSi: pageTitleSi,
        titleEn: pageTitleEn || pageTitleSi,
        contentSi: pageContentSi,
        contentEn: pageContentEn || pageContentSi,
        bannerImage: pageBanner,
      } : p);
      setCustomPages(updated);
      localStorage.setItem('temple_pages_v20', JSON.stringify(updated));
      alert('පිටුව සාර්ථකව යාවත්කාලීන විය!');
    } else {
      const newPage: CustomPage = {
        id: `page_${crypto.randomUUID()}`,
        titleSi: pageTitleSi,
        titleEn: pageTitleEn || pageTitleSi,
        contentSi: pageContentSi,
        contentEn: pageContentEn || pageContentSi,
        bannerImage: pageBanner,
      };
      const updated = [...customPages, newPage];
      setCustomPages(updated);
      localStorage.setItem('temple_pages_v20', JSON.stringify(updated));
      alert('අලුත් පිටුව සාර්ථකව එකතු කරන ලදී!');
    }
    cancelPageEdit();
  };

  const editCustomPage = (page: CustomPage) => {
    setEditingPageId(page.id);
    setPageTitleSi(page.titleSi);
    setPageTitleEn(page.titleEn);
    setPageContentSi(page.contentSi);
    setPageContentEn(page.contentEn);
    setPageBanner(page.bannerImage || '');
    setAdminSubTab('pages');
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const cancelPageEdit = () => {
    setEditingPageId(null);
    setPageTitleSi(''); setPageTitleEn(''); setPageContentSi(''); setPageContentEn(''); setPageBanner('');
  };

  const deleteCustomPage = (id: string) => {
    if (confirm('මෙම පිටුව මකා දැමීමට අවශ්‍යද?')) {
      const updated = customPages.filter(p => p.id !== id);
      setCustomPages(updated);
      localStorage.setItem('temple_pages_v20', JSON.stringify(updated));
      if (activeTab === id) setActiveTab('history');
    }
  };

  // Save General Settings
  const saveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('temple_branding_v20', JSON.stringify({
      nameSi: templeNameSi, nameEn: templeNameEn, locSi: templeLocationSi, locEn: templeLocationEn, ticker: tickerText
    }));
    localStorage.setItem('temple_event_v20', JSON.stringify({
      titleSi: eventTitleSi, titleEn: eventTitleEn, date: eventTargetDate
    }));
    localStorage.setItem('temple_bank_v20', JSON.stringify({
      name: bankName, accountName: bankAccountName, accountNumber: bankAccountNumber, branch: bankBranch
    }));
    localStorage.setItem('temple_live_v20', JSON.stringify({
      enabled: isLiveStreaming, url: liveStreamUrl
    }));
    localStorage.setItem('temple_categories_v20', JSON.stringify(categories));
    localStorage.setItem('temple_media_v20', JSON.stringify({
      bgWallpaper, heroCover, badgeLogo, timerCover
    }));
    localStorage.setItem('temple_verse_v20', JSON.stringify({
      verse: dailyVerseSi, meaning: dailyVerseMeaningSi
    }));
    localStorage.setItem('temple_puja_v20', JSON.stringify({
      morning: pujaMorning, noon: pujaNoon, evening: pujaEvening,
      morningImg: pujaMorningImg, noonImg: pujaNoonImg, eveningImg: pujaEveningImg
    }));
    localStorage.setItem('temple_music_v20', JSON.stringify(musicTracks));
    alert('සියලුම සැකසුම් සාර්ථකව යාවත්කාලීන විය!');
  };

  const saveMusicTrack = () => {
    if (!musicTitle || !musicUrl) {
      alert('ගීතයේ නම සහ ශ්‍රව්‍ය ලින්ක් ඇතුළත් කරන්න.');
      return;
    }

    if (editingMusicId) {
      const updated = musicTracks.map(track => track.id === editingMusicId ? {
        ...track,
        title: musicTitle,
        audioUrl: musicUrl,
        coverImage: musicCover || track.coverImage || splashImage,
      } : track);
      setMusicTracks(updated);
      localStorage.setItem('temple_music_v20', JSON.stringify(updated));
      setEditingMusicId(null);
    } else {
      const newTrack: MusicTrack = {
        id: `music_${Date.now()}`,
        title: musicTitle,
        audioUrl: musicUrl,
        coverImage: musicCover || splashImage,
        createdAt: new Date().toLocaleDateString('si-LK'),
      };
      const updated = [...musicTracks, newTrack];
      setMusicTracks(updated);
      setActiveMusicId(newTrack.id);
      localStorage.setItem('temple_music_v20', JSON.stringify(updated));
    }

    setMusicTitle('');
    setMusicUrl('');
    setMusicCover('');
  };

  const editMusicTrack = (track: MusicTrack) => {
    setEditingMusicId(track.id);
    setMusicTitle(track.title);
    setMusicUrl(track.audioUrl);
    setMusicCover(track.coverImage || '');
  };

  const deleteMusicTrack = (id: string) => {
    if (!confirm('මෙම ගීතය මකා දැමීමට අවශ්‍යද?')) return;
    const updated = musicTracks.filter(track => track.id !== id);
    setMusicTracks(updated);
    localStorage.setItem('temple_music_v20', JSON.stringify(updated));
    if (editingMusicId === id) {
      setEditingMusicId(null);
      setMusicTitle('');
      setMusicUrl('');
      setMusicCover('');
    }
    if (activeMusicId === id) {
      setIsMusicPlaying(false);
      setActiveMusicId(updated[0]?.id || '');
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
      }
    }
  };

  const activeMusicTrack = musicTracks.find(track => track.id === activeMusicId) || musicTracks[0] || null;

  useEffect(() => {
    if (!audioRef.current) return;
    if (!activeMusicTrack) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
      return;
    }
    audioRef.current.src = activeMusicTrack.audioUrl;
    audioRef.current.load();
  }, [activeMusicTrack]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = musicVolume;
  }, [musicVolume]);

  const handleSelectMusic = (trackId: string) => {
    setActiveMusicId(trackId);
    setIsMusicPlaying(false);
  };

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio || !activeMusicTrack) return;

    if (isMusicPlaying) {
      audio.pause();
      setIsMusicPlaying(false);
      return;
    }

    audio.src = activeMusicTrack.audioUrl;
    try {
      await audio.play();
      setIsMusicPlaying(true);
    } catch {
      setIsMusicPlaying(false);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setMusicUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Donation Slips Status Update
  const updateSlipStatus = (id: string, status: 'approved' | 'rejected') => {
    const updated = donationSlips.map(s => s.id === id ? { ...s, status } : s);
    setDonationSlips(updated);
    localStorage.setItem('temple_slips_v20', JSON.stringify(updated));
  };

  // Student Enrollment Status Update
  const updateEnrollmentStatus = (id: string, status: 'approved' | 'rejected') => {
    const updated = studentEnrollments.map(s => s.id === id ? { ...s, status } : s);
    setStudentEnrollments(updated);
    localStorage.setItem('temple_enrollments_v20', JSON.stringify(updated));
  };

  // Export Data to CSV (New Feature)
  const exportStudentsToCSV = () => {
    if (studentEnrollments.length === 0) return alert('Export කිරීමට දත්ත නොමැත.');
    const headers = ['ID,Student Name,Guardian Name,Phone,Grade,Address,Status,Submitted At\n'];
    const rows = studentEnrollments.map(s => `"${s.id}","${s.studentName}","${s.guardianName}","${s.phone}","${s.grade}","${s.address}","${s.status}","${s.submittedAt}"\n`);
    const blob = new Blob([...headers, ...rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Student_Enrollments_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sharePost = (post: Post) => {
    if (navigator.share) {
      navigator.share({
        title: post.titleSi,
        text: post.descriptionSi.slice(0, 100) + '...',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('ලිපියේ සබැඳිය Copy කරගන්නා ලදී!');
    }
  };

  // Donation Submission Form State
  const submitDonationSlip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName || !donorPhone || !donorSlipImg) return alert('කරුණාකර සියලු විස්තර සහ රිසිට්පත ඇතුළත් කරන්න.');
    const newSlip: DonationSlip = {
      id: `slip_${Date.now()}`,
      donorName,
      amount: donorAmount || 'නොදක්වා ඇත',
      phone: donorPhone,
      slipImage: donorSlipImg,
      status: 'pending',
      submittedAt: new Date().toLocaleDateString('si-LK'),
    };
    const updated = [newSlip, ...donationSlips];
    setDonationSlips(updated);
    localStorage.setItem('temple_slips_v20', JSON.stringify(updated));
    alert('ඔබගේ බැංකු රිසිට්පත සාර්ථකව යොමු කෙරිණි!');
    setDonorName(''); setDonorAmount(''); setDonorPhone(''); setDonorSlipImg(''); setShowDonateModal(false);
  };

  // Student Enrollment Handler
  const submitStudentEnrollment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentPhone) return alert('ශිෂ්‍යයාගේ නම සහ දුරකථන අංකය ඇතුළත් කරන්න.');
    const newEnrollment: StudentEnrollment = {
      id: `std_${Date.now()}`,
      studentName,
      guardianName,
      phone: studentPhone,
      grade: studentGrade,
      address: studentAddress,
      status: 'pending',
      submittedAt: new Date().toLocaleDateString('si-LK'),
    };
    const updated = [newEnrollment, ...studentEnrollments];
    setStudentEnrollments(updated);
    localStorage.setItem('temple_enrollments_v20', JSON.stringify(updated));
    alert('දහම් පාසල් ලියාපදිංචි වීමේ අයදුම්පත සාර්ථකව භාරගන්නා ලදී!');
    setStudentName(''); setGuardianName(''); setStudentPhone(''); setStudentAddress(''); setShowEnrollModal(false);
  };

  // Filters
  const activeCategory = categories.find(c => c.id === activeTab);
  const activeCustomPage = customPages.find(p => p.id === activeTab);

  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      const matchTab = p.category === activeTab;
      const matchSearch = p.titleSi.toLowerCase().includes(searchTerm.toLowerCase()) || p.descriptionSi.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = isAdmin ? true : p.status === 'published';
      return matchTab && matchSearch && matchStatus;
    });
  }, [posts, activeTab, searchTerm, isAdmin]);

  const filteredSlips = useMemo(() => {
    if (slipFilter === 'all') return donationSlips;
    return donationSlips.filter(s => s.status === slipFilter);
  }, [donationSlips, slipFilter]);

  const filteredStudents = useMemo(() => {
    if (studentFilter === 'all') return studentEnrollments;
    return studentEnrollments.filter(s => s.status === studentFilter);
  }, [studentEnrollments, studentFilter]);

  const siteContent = useMemo<SiteContent>(() => ({
    categories,
    customPages,
    posts,
    templeNameSi,
    templeNameEn,
    templeLocationSi,
    templeLocationEn,
    tickerText,
    eventTitleSi,
    eventTitleEn,
    eventTargetDate,
    bankName,
    bankAccountName,
    bankAccountNumber,
    bankBranch,
    isLiveStreaming,
    liveStreamUrl,
    bgWallpaper,
    heroCover,
    badgeLogo,
    timerCover,
    dailyVerseSi,
    dailyVerseMeaningSi,
    pujaMorning,
    pujaNoon,
    pujaEvening,
    pujaMorningImg,
    pujaNoonImg,
    pujaEveningImg,
    musicTracks,
  }), [
    categories, customPages, posts, templeNameSi, templeNameEn, templeLocationSi,
    templeLocationEn, tickerText, eventTitleSi, eventTitleEn, eventTargetDate,
    bankName, bankAccountName, bankAccountNumber, bankBranch, isLiveStreaming,
    liveStreamUrl, bgWallpaper, heroCover, badgeLogo, timerCover, dailyVerseSi,
    dailyVerseMeaningSi, pujaMorning, pujaNoon, pujaEvening, pujaMorningImg,
    pujaNoonImg, pujaEveningImg, musicTracks,
  ]);

  useEffect(() => {
    if (!supabase || !isAdmin || !cloudReadyRef.current) return;
    const client = supabase;
    const syncTimer = window.setTimeout(async () => {
      const { data: sessionData } = await client.auth.getSession();
      if (!sessionData.session) return;
      await client.from('site_content').upsert({
        id: 'main',
        content: siteContent,
        updated_at: new Date().toISOString(),
      });
    }, 700);
    return () => window.clearTimeout(syncTimer);
  }, [isAdmin, siteContent]);

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
      {/* Top Header Notice Bar */}
      <div className={`py-2.5 px-4 sm:px-12 flex flex-wrap justify-between items-center gap-3 border-b backdrop-blur-md text-xs ${isDarkMode ? 'bg-slate-950/90 border-amber-500/20' : 'bg-white/90 border-slate-200'}`}>
        <div className="flex items-center gap-2 font-semibold text-amber-400 overflow-hidden">
          <span className="animate-pulse">📢</span>
          <span className="truncate">{tickerText}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isLiveStreaming && (
            <a href={liveStreamUrl} target="_blank" rel="noreferrer" className="px-3 py-1 rounded-full text-[11px] font-black bg-red-600 text-white animate-bounce flex items-center gap-1">
              <span>🔴</span> <span>සජීවී විකාශය (Live)</span>
            </a>
          )}
          <button onClick={() => setLang(lang === 'si' ? 'en' : 'si')} className="px-3 py-1 rounded-full text-[11px] font-black bg-amber-500 text-slate-950 hover:bg-amber-400 transition">
            {lang === 'si' ? 'English' : 'සිංහල'}
          </button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="px-3 py-1 rounded-full text-[11px] border border-amber-500/30 hover:border-amber-400 transition">
            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button onClick={() => setShowDonateModal(true)} className="px-3.5 py-1 rounded-full text-[11px] font-black bg-amber-500 text-slate-950 shadow-md hover:bg-amber-400 transition">
            🙏 {lang === 'si' ? 'ආධාර සහ සම්මාදම්' : 'Donations'}
          </button>
          <button onClick={() => setShowEnrollModal(true)} className="px-3.5 py-1 rounded-full text-[11px] font-black bg-emerald-600 text-white shadow-md hover:bg-emerald-500 transition">
            🎓 {lang === 'si' ? 'දහම් පාසල් ඇතුළත් වීම' : 'Enrollment'}
          </button>
          <button onClick={() => { if (isAdmin) handleAdminLogout(); else setShowLoginModal(true); }} className={`px-3 py-1 rounded-full text-[11px] font-bold ${isAdmin ? 'bg-red-500 text-white' : 'bg-slate-800 text-amber-300 border border-amber-500/30'}`}>
            {isAdmin ? `🔒 Exit (${currentRole})` : '⚙️ පරිපාලන පුවරුව'}
          </button>
        </div>
      </div>

      {/* Main Temple Banner */}
      <header
        className="relative py-16 px-4 text-center border-b border-amber-500/20 overflow-hidden"
        style={heroCover ? { backgroundImage: `linear-gradient(to bottom, rgba(3, 7, 18, 0.75), rgba(3, 7, 18, 0.95)), url(${heroCover})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <div className="inline-block p-2 rounded-full border-2 border-amber-500/40 bg-slate-950/70 shadow-2xl backdrop-blur-md">
            {badgeLogo ? (
              <img src={badgeLogo} alt="Temple Logo" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <span className="text-5xl p-2 block">🪷</span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-amber-400 py-2 leading-snug tracking-wide drop-shadow-[0_4px_20px_rgba(245,158,11,0.5)]">
            {lang === 'si' ? templeNameSi : templeNameEn}
          </h1>

          <p className="text-xs sm:text-sm font-bold text-amber-200/90 tracking-widest uppercase">
            📍 {lang === 'si' ? templeLocationSi : templeLocationEn}
          </p>
        </div>
      </header>

      {/* NEW FEATURE: Premium Temple Music Player */}
      {activeMusicTrack && (
      <section className="max-w-5xl mx-auto px-4 mt-6">
        <div className="rounded-[28px] border border-amber-500/30 bg-gradient-to-br from-slate-950/95 via-amber-950/40 to-slate-950/95 p-4 shadow-[0_20px_80px_rgba(245,158,11,0.18)] backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row items-center gap-5">
            <div className="relative w-full max-w-[190px]">
              <div className="aspect-square overflow-hidden rounded-3xl border border-amber-500/30 bg-slate-900 shadow-2xl">
                <img
                  src={activeMusicTrack?.coverImage || splashImage}
                  alt={activeMusicTrack?.title || 'Temple music'}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1 w-full space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-amber-300/80">Temple Audio</p>
                  <h3 className="text-xl font-black text-amber-200">{activeMusicTrack?.title || 'පිරිත් ගීත'}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMusic}
                    className="h-12 w-12 rounded-full bg-amber-500 text-slate-950 text-xl font-black shadow-lg shadow-amber-500/30 transition hover:scale-105"
                  >
                    {isMusicPlaying ? '❚❚' : '▶'}
                  </button>
                </div>
              </div>

              <audio
                ref={audioRef}
                key={activeMusicTrack?.audioUrl || pirithUrl}
                controls
                className="w-full h-10 rounded-xl accent-amber-500"
                onPlay={() => setIsMusicPlaying(true)}
                onPause={() => setIsMusicPlaying(false)}
                preload="metadata"
              >
                <source src={activeMusicTrack?.audioUrl || pirithUrl} type="audio/mpeg" />
              </audio>

              <div className="flex items-center gap-3 text-[10px] text-slate-300">
                <span>Volume</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(Number(e.target.value))}
                  className="w-28 accent-amber-500"
                />
                <span>{Math.round(musicVolume * 100)}%</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {musicTracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => handleSelectMusic(track.id)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition ${
                      activeMusicId === track.id
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-lg shadow-amber-500/25'
                        : 'bg-slate-900/70 text-slate-300 border-amber-500/20 hover:border-amber-500/50'
                    }`}
                  >
                    {track.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Daily Dhamma Thought / Verse Section */}
      <section className="max-w-4xl mx-auto px-4 mt-6">
        <div className="p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-amber-950/40 backdrop-blur-xl shadow-xl text-center space-y-2">
          <span className="text-[11px] font-black uppercase text-amber-400 tracking-widest block">🪷 දවසේ ධර්ම චින්තාව 🪷</span>
          <p className="text-sm sm:text-base font-bold text-amber-200 italic font-serif">&quot;{dailyVerseSi}&quot;</p>
          <p className="text-xs text-slate-300 max-w-2xl mx-auto">{dailyVerseMeaningSi}</p>
        </div>
      </section>

      {/* Event Countdown Banner Section */}
      <section className="max-w-4xl mx-auto px-4 mt-6 relative z-10">
        <div
          className="p-6 sm:p-8 rounded-3xl border-2 border-amber-500/40 shadow-2xl text-center relative overflow-hidden backdrop-blur-2xl bg-slate-950/90"
          style={timerCover ? { backgroundImage: `linear-gradient(to bottom, rgba(3, 7, 18, 0.8), rgba(3, 7, 18, 0.95)), url(${timerCover})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        >
          <span className="text-xs font-black uppercase text-amber-400 tracking-widest block mb-1">🪔 {lang === 'si' ? 'ඉදිරි විශේෂ පින්කම් මාලාව' : 'Upcoming Event'} 🪔</span>
          <h2 className="text-xl sm:text-2xl font-black text-amber-200 mb-6 py-1 leading-snug">{lang === 'si' ? eventTitleSi : eventTitleEn}</h2>
          {timeLeft ? (
            <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl backdrop-blur-md"><span className="block text-2xl font-black text-amber-400">{timeLeft.days}</span><span className="text-[10px] text-slate-300 uppercase">දින</span></div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl backdrop-blur-md"><span className="block text-2xl font-black text-amber-400">{timeLeft.hours}</span><span className="text-[10px] text-slate-300 uppercase">පැය</span></div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl backdrop-blur-md"><span className="block text-2xl font-black text-amber-400">{timeLeft.minutes}</span><span className="text-[10px] text-slate-300 uppercase">මිනිත්තු</span></div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl backdrop-blur-md"><span className="block text-2xl font-black text-amber-400">{timeLeft.seconds}</span><span className="text-[10px] text-slate-300 uppercase">තත්පර</span></div>
            </div>
          ) : (
            <div className="text-xs text-amber-400 font-bold p-3 bg-amber-500/10 rounded-xl border border-amber-500/30">පින්කම් මාලාව දැනට පැවැත්වේ හෝ අවසන් වී ඇත!</div>
          )}
        </div>
      </section>

      {/* Daily Worship Schedule / Puja Timings WITH IMAGES */}
      <section className="max-w-4xl mx-auto px-4 mt-6">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/20 text-xs">
          <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>🕯️</span> <span>දෛනික වන්දනා සහ පූජා වේලාවන්</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-300">
            {/* Morning Puja */}
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-amber-500/15 space-y-2 flex flex-col justify-between">
              <div>
                {pujaMorningImg && (
                  <div className="h-28 w-full rounded-xl overflow-hidden mb-2 cursor-pointer border border-amber-500/20" onClick={() => setLightboxImage(pujaMorningImg)}>
                    <img src={pujaMorningImg} alt="Morning Puja" className="w-full h-full object-cover hover:scale-105 transition" />
                  </div>
                )}
                <span className="block font-bold text-slate-200">🌅 උදෑසන බුද්ධ පූජාව</span>
              </div>
              <span className="font-black text-amber-300 text-sm block">{pujaMorning}</span>
            </div>

            {/* Noon Puja */}
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-amber-500/15 space-y-2 flex flex-col justify-between">
              <div>
                {pujaNoonImg && (
                  <div className="h-28 w-full rounded-xl overflow-hidden mb-2 cursor-pointer border border-amber-500/20" onClick={() => setLightboxImage(pujaNoonImg)}>
                    <img src={pujaNoonImg} alt="Noon Puja" className="w-full h-full object-cover hover:scale-105 transition" />
                  </div>
                )}
                <span className="block font-bold text-slate-200">☀️ දවල් සම්බුද්ධ පූජාව</span>
              </div>
              <span className="font-black text-amber-300 text-sm block">{pujaNoon}</span>
            </div>

            {/* Evening Puja */}
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-amber-500/15 space-y-2 flex flex-col justify-between">
              <div>
                {pujaEveningImg && (
                  <div className="h-28 w-full rounded-xl overflow-hidden mb-2 cursor-pointer border border-amber-500/20" onClick={() => setLightboxImage(pujaEveningImg)}>
                    <img src={pujaEveningImg} alt="Evening Puja" className="w-full h-full object-cover hover:scale-105 transition" />
                  </div>
                )}
                <span className="block font-bold text-slate-200">🌙 සන්ධ්‍යා ගිලන්පස පූජාව</span>
              </div>
              <span className="font-black text-amber-300 text-sm block">{pujaEvening}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs Bar */}
      <div className="sticky top-0 z-30 backdrop-blur-2xl py-4 px-4 border-b border-amber-500/20 bg-slate-950/90 mt-8">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder={lang === 'si' ? 'ලිපි සහ තොරතුරු සොයන්න...' : 'Search articles...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-900 border border-amber-500/30 text-white outline-none pl-10 focus:border-amber-400 transition"
            />
            <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeTab === cat.id ? 'bg-amber-500 text-slate-950 font-black shadow-lg scale-105' : 'bg-slate-900 text-slate-300 border border-amber-500/20 hover:text-amber-300 hover:border-amber-500/40'}`}
              >
                <span>{cat.icon}</span> <span>{lang === 'si' ? cat.labelSi : cat.labelEn}</span>
              </button>
            ))}
            {customPages.map(page => (
              <button
                key={page.id}
                onClick={() => setActiveTab(page.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeTab === page.id ? 'bg-amber-500 text-slate-950 font-black shadow-lg scale-105' : 'bg-slate-900 text-amber-300/80 border border-amber-500/30 hover:border-amber-400'}`}
              >
                <span>📄</span> <span>{lang === 'si' ? page.titleSi : page.titleEn}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Display Area (GRID CARDS LAYOUT) */}
      <main className="max-w-5xl mx-auto px-4 mt-10">
        {activeCategory && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-amber-500/20 pb-3">
              <h2 className="text-xl font-black text-amber-400 flex items-center gap-2">
                <span>{activeCategory.icon}</span> <span>{lang === 'si' ? activeCategory.labelSi : activeCategory.labelEn}</span>
              </h2>
              <span className="text-xs text-slate-400 font-bold">{filteredPosts.length} {lang === 'si' ? 'ලිපි සංඛ්‍යාවක්' : 'Posts'}</span>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs bg-slate-900/40 rounded-3xl border border-dashed border-amber-500/20">
                තවමත් මෙම අංශයට අදාළ තොරතුරු හෝ ලිපි ඇතුළත් කර නොමැත.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map(post => {
                  const ytId = getYouTubeId(post.youtubeUrl || '');
                  const displayImg = post.image || (ytId ? getYouTubeThumbnail(post.youtubeUrl || '') : null);

                  return (
                    <div
                      key={post.id}
                      className="group flex flex-col justify-between rounded-3xl bg-slate-900/80 border border-amber-500/20 hover:border-amber-500/50 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition duration-300"
                    >
                      <div>
                        {displayImg && (
                          <div className="relative h-48 w-full overflow-hidden bg-slate-950 cursor-pointer" onClick={() => setSelectedPostModal(post)}>
                            <img
                              src={displayImg}
                              alt={post.titleSi}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            />
                            {ytId && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="text-4xl filter drop-shadow-lg animate-pulse">▶️</span>
                              </div>
                            )}
                            {post.status === 'draft' && (
                              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                                📝 කෙටුම්පත (Draft)
                              </span>
                            )}
                          </div>
                        )}

                        <div className="p-5 space-y-3">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                            {categories.find(c => c.id === post.category)?.labelSi || 'තොරතුරු'}
                          </span>
                          <h3 className="text-base font-bold text-amber-100 group-hover:text-amber-400 transition line-clamp-2">
                            {lang === 'si' ? post.titleSi : post.titleEn}
                          </h3>
                          <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                            {lang === 'si' ? post.descriptionSi : post.descriptionEn}
                          </p>
                        </div>
                      </div>

                      <div className="p-5 pt-0 flex items-center justify-between border-t border-amber-500/10 mt-3 text-xs">
                        <span className="text-[10px] text-slate-400 font-medium">📅 {post.createdAt}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => sharePost(post)}
                            className="p-1.5 rounded-lg bg-slate-800 text-amber-300 hover:bg-slate-700 transition"
                            title="බෙදාහරින්න"
                          >
                            🔗
                          </button>
                          <button
                            onClick={() => setSelectedPostModal(post)}
                            className="px-3 py-1.5 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition text-[11px]"
                          >
                            {lang === 'si' ? 'තව කියවන්න' : 'Read More'}
                          </button>
                          {isAdmin && canAccess('posts') && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingPostId(post.id);
                                  setPostCat(post.category);
                                  setPostTitleSi(post.titleSi);
                                  setPostTitleEn(post.titleEn);
                                  setPostDescSi(post.descriptionSi);
                                  setPostDescEn(post.descriptionEn);
                                  setPostImg(post.image || '');
                                  setPostYt(post.youtubeUrl || '');
                                  setPostStatus(post.status);
                                  setAdminSubTab('posts');
                                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                                }}
                                className="p-1.5 rounded-lg bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/50"
                                title="සංස්කරණය"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => deletePost(post.id)}
                                className="p-1.5 rounded-lg bg-red-600/30 text-red-300 border border-red-500/30 hover:bg-red-600/50"
                                title="මකා දමන්න"
                              >
                                🗑️
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Custom Pages Render Area WITH EDIT & DELETE */}
        {activeCustomPage && (
          <div className="p-6 sm:p-10 rounded-3xl border border-amber-500/30 bg-slate-900/80 backdrop-blur-2xl shadow-2xl space-y-6">
            {activeCustomPage.bannerImage && (
              <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-amber-500/20 shadow-lg cursor-pointer" onClick={() => setLightboxImage(activeCustomPage.bannerImage!)}>
                <img src={activeCustomPage.bannerImage} alt="Page Banner" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex flex-wrap justify-between items-center border-b border-amber-500/20 pb-4 gap-4">
              <h2 className="text-2xl sm:text-3xl font-black text-amber-400">
                {lang === 'si' ? activeCustomPage.titleSi : activeCustomPage.titleEn}
              </h2>
              {isAdmin && canAccess('pages') && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => editCustomPage(activeCustomPage)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/50 transition"
                  >
                    ✏️ සංස්කරණය කරන්න (Edit)
                  </button>
                  <button
                    onClick={() => deleteCustomPage(activeCustomPage.id)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600/30 text-red-300 border border-red-500/30 hover:bg-red-600/50 transition"
                  >
                    🗑️ මකා දමන්න (Delete)
                  </button>
                </div>
              )}
            </div>
            <div className="text-sm leading-relaxed text-slate-200 whitespace-pre-line space-y-4">
              {lang === 'si' ? activeCustomPage.contentSi : activeCustomPage.contentEn}
            </div>
          </div>
        )}

        {/* ADMIN DASHBOARD CONTROL PANEL */}
        {isAdmin && (
          <div className="mt-16 p-6 sm:p-8 rounded-3xl border-2 border-amber-500/40 bg-slate-950/95 shadow-2xl backdrop-blur-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/30 pb-4">
              <div>
                <h2 className="text-xl font-black text-amber-400 flex items-center gap-2">
                  <span>⚙️</span> <span>පරිපාලන පාලන පුවරුව (Admin Dashboard)</span>
                </h2>
                <p className="text-xs text-amber-200/70 mt-1">
                  වත්මන් භූමිකාව: <span className="font-bold text-amber-400 uppercase">{currentRole}</span>
                </p>
              </div>
              <button
                onClick={handleAdminLogout}
                className="px-4 py-1.5 rounded-full text-xs font-bold bg-red-600 text-white hover:bg-red-500 transition shadow-md"
              >
                🔒 පාලන පුවරුවෙන් ඉවත් වන්න
              </button>
            </div>

            {/* Admin Sub Navigation Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-amber-500/20 pb-4">
              {canAccess('general') && (
                <button
                  onClick={() => setAdminSubTab('general')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${adminSubTab === 'general' ? 'bg-amber-500 text-slate-950 font-black shadow-lg' : 'bg-slate-900 text-slate-300 border border-amber-500/20 hover:text-amber-300'}`}
                >
                  🛠️ සාමාන්‍ය සැකසුම්
                </button>
              )}
              {canAccess('posts') && (
                <button
                  onClick={() => setAdminSubTab('posts')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${adminSubTab === 'posts' ? 'bg-amber-500 text-slate-950 font-black shadow-lg' : 'bg-slate-900 text-slate-300 border border-amber-500/20 hover:text-amber-300'}`}
                >
                  📝 ලිපි කළමනාකරණය
                </button>
              )}
              {canAccess('pages') && (
                <button
                  onClick={() => setAdminSubTab('pages')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${adminSubTab === 'pages' ? 'bg-amber-500 text-slate-950 font-black shadow-lg' : 'bg-slate-900 text-slate-300 border border-amber-500/20 hover:text-amber-300'}`}
                >
                  📄 අලුත් පිටු එකතු / සංස්කරණය
                </button>
              )}
              {canAccess('slips') && (
                <button
                  onClick={() => setAdminSubTab('slips')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${adminSubTab === 'slips' ? 'bg-amber-500 text-slate-950 font-black shadow-lg' : 'bg-slate-900 text-slate-300 border border-amber-500/20 hover:text-amber-300'}`}
                >
                  💳 ආධාර රිසිට්පත් ({donationSlips.filter(s => s.status === 'pending').length})
                </button>
              )}
              {canAccess('students') && (
                <button
                  onClick={() => setAdminSubTab('students')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${adminSubTab === 'students' ? 'bg-amber-500 text-slate-950 font-black shadow-lg' : 'bg-slate-900 text-slate-300 border border-amber-500/20 hover:text-amber-300'}`}
                >
                  🎓 දහම් පාසල් අයදුම්පත් ({studentEnrollments.filter(s => s.status === 'pending').length})
                </button>
              )}
              {canAccess('roles') && (
                <button
                  onClick={() => setAdminSubTab('roles')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${adminSubTab === 'roles' ? 'bg-amber-500 text-slate-950 font-black shadow-lg' : 'bg-slate-900 text-slate-300 border border-amber-500/20 hover:text-amber-300'}`}
                >
                  🔑 මුරපද (Passwords)
                </button>
              )}
            </div>

            {/* Admin Sub Tab 1: General Settings */}
            {adminSubTab === 'general' && canAccess('general') && (
              <form onSubmit={saveGeneralSettings} className="space-y-6 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-bold text-amber-300">විහාරස්ථානයේ නම (සිංහල)</label>
                    <input type="text" value={templeNameSi} onChange={e => setTempleNameSi(e.target.value)} className="w-full p-3 rounded-xl bg-slate-900 border border-amber-500/30 text-white outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-bold text-amber-300">Temple Name (English)</label>
                    <input type="text" value={templeNameEn} onChange={e => setTempleNameEn(e.target.value)} className="w-full p-3 rounded-xl bg-slate-900 border border-amber-500/30 text-white outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-bold text-amber-300">ලිපිනය / ස්ථානය (සිංහල)</label>
                    <input type="text" value={templeLocationSi} onChange={e => setTempleLocationSi(e.target.value)} className="w-full p-3 rounded-xl bg-slate-900 border border-amber-500/30 text-white outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-bold text-amber-300">Location (English)</label>
                    <input type="text" value={templeLocationEn} onChange={e => setTempleLocationEn(e.target.value)} className="w-full p-3 rounded-xl bg-slate-900 border border-amber-500/30 text-white outline-none" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="font-bold text-amber-300">උඩින් ගමන් කරන නිවේදන පටිය (Notice Bar Text)</label>
                    <input type="text" value={tickerText} onChange={e => setTickerText(e.target.value)} className="w-full p-3 rounded-xl bg-slate-900 border border-amber-500/30 text-white outline-none" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-amber-500/20 space-y-4">
                  <h3 className="font-bold text-amber-400">💳 ආධාර සඳහා බැංකු විස්තර (Bank Details)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-1">බැංකුවේ නම (Bank Name)</label>
                      <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">ගිණුම් නම (Account Name)</label>
                      <input type="text" value={bankAccountName} onChange={e => setBankAccountName(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">ගිණුම් අංකය (Account Number)</label>
                      <input type="text" value={bankAccountNumber} onChange={e => setBankAccountNumber(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">ශාඛාව (Branch)</label>
                      <input type="text" value={bankBranch} onChange={e => setBankBranch(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                    </div>
                  </div>
                </div>

                {/* Event Timer Config */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-amber-500/20 space-y-4">
                  <h3 className="font-bold text-amber-400">🪔 ඉදිරි විශේෂ පින්කම් කවුන්ට්ඩවුන් සැකසුම්</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-1">පින්කමේ නම (සිංහල)</label>
                      <input type="text" value={eventTitleSi} onChange={e => setEventTitleSi(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">Event Name (English)</label>
                      <input type="text" value={eventTitleEn} onChange={e => setEventTitleEn(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">දිනය සහ වේලාව (Date & Time)</label>
                      <input type="datetime-local" value={eventTargetDate} onChange={e => setEventTargetDate(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                    </div>
                  </div>
                </div>

                {/* Daily Dhamma Thought & Puja Timings WITH IMAGES EDIT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-amber-500/20 space-y-3">
                    <h3 className="font-bold text-amber-400">🪷 දවසේ ධර්ම චින්තාව</h3>
                    <textarea rows={2} value={dailyVerseSi} onChange={e => setDailyVerseSi(e.target.value)} placeholder="ගාථාව හෝ ධර්ම පාඨය..." className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                    <textarea rows={2} value={dailyVerseMeaningSi} onChange={e => setDailyVerseMeaningSi(e.target.value)} placeholder="අර්ථය..." className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-amber-500/20 space-y-3">
                    <h3 className="font-bold text-amber-400">🕯️ දෛනික පූජා වේලාවන් සහ ඡායාරූප (Puja Times & Images)</h3>
                    
                    <div className="space-y-2">
                      <label className="block text-slate-300 font-semibold">උදෑසන පූජාව</label>
                      <div className="flex gap-2 items-center">
                        <input type="text" value={pujaMorning} onChange={e => setPujaMorning(e.target.value)} className="flex-1 p-2 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                        <input type="file" accept="image/*" onChange={e => handleFileUploadWithEditor(e, setPujaMorningImg)} className="text-[10px] text-slate-400 w-44" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-slate-300 font-semibold">දවල් පූජාව</label>
                      <div className="flex gap-2 items-center">
                        <input type="text" value={pujaNoon} onChange={e => setPujaNoon(e.target.value)} className="flex-1 p-2 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                        <input type="file" accept="image/*" onChange={e => handleFileUploadWithEditor(e, setPujaNoonImg)} className="text-[10px] text-slate-400 w-44" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-slate-300 font-semibold">සන්ධ්‍යා පූජාව</label>
                      <div className="flex gap-2 items-center">
                        <input type="text" value={pujaEvening} onChange={e => setPujaEvening(e.target.value)} className="flex-1 p-2 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                        <input type="file" accept="image/*" onChange={e => handleFileUploadWithEditor(e, setPujaEveningImg)} className="text-[10px] text-slate-400 w-44" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Media & Background Uploads */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-amber-500/20 space-y-4">
                  <h3 className="font-bold text-amber-400">🖼️ පසුබිම් සහ බැනර් ඡායාරූප (Media Covers)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-1">පසුබිම් Wallpaper</label>
                      <input type="url" value={bgWallpaper} onChange={e => setBgWallpaper(e.target.value)} placeholder="https://..." className="w-full p-2 rounded-xl bg-slate-950 border border-amber-500/30 text-white mb-2" />
                      <input type="file" accept="image/*" onChange={e => handleFileUploadWithEditor(e, setBgWallpaper)} className="text-[10px] text-slate-400" />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">ප්‍රධාන Header Cover</label>
                      <input type="url" value={heroCover} onChange={e => setHeroCover(e.target.value)} placeholder="https://..." className="w-full p-2 rounded-xl bg-slate-950 border border-amber-500/30 text-white mb-2" />
                      <input type="file" accept="image/*" onChange={e => handleFileUploadWithEditor(e, setHeroCover)} className="text-[10px] text-slate-400" />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">විහාර ලාංඡනය (Logo)</label>
                      <input type="url" value={badgeLogo} onChange={e => setBadgeLogo(e.target.value)} placeholder="https://..." className="w-full p-2 rounded-xl bg-slate-950 border border-amber-500/30 text-white mb-2" />
                      <input type="file" accept="image/*" onChange={e => handleFileUploadWithEditor(e, setBadgeLogo)} className="text-[10px] text-slate-400" />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">Timer Banner</label>
                      <input type="url" value={timerCover} onChange={e => setTimerCover(e.target.value)} placeholder="https://..." className="w-full p-2 rounded-xl bg-slate-950 border border-amber-500/30 text-white mb-2" />
                      <input type="file" accept="image/*" onChange={e => handleFileUploadWithEditor(e, setTimerCover)} className="text-[10px] text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-amber-500/20 space-y-4">
                  <h3 className="font-bold text-amber-400">🎵 Music Player Controls</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" value={musicTitle} onChange={e => setMusicTitle(e.target.value)} placeholder="Track title" className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                    <div>
                      <input type="url" value={musicUrl.startsWith('data:') ? '' : musicUrl} onChange={e => setMusicUrl(e.target.value)} placeholder="Audio URL or MP3 link" className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                      <input type="file" accept="audio/*" onChange={handleAudioUpload} className="mt-2 text-[10px] text-slate-400" />
                    </div>
                    <div>
                      <input type="url" value={musicCover.startsWith('data:') ? '' : musicCover} onChange={e => setMusicCover(e.target.value)} placeholder="Cover image URL" className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                      <input type="file" accept="image/*" onChange={e => handleFileUploadWithEditor(e, setMusicCover)} className="mt-2 text-[10px] text-slate-400" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={saveMusicTrack} className="px-4 py-2 rounded-xl font-bold bg-amber-500 text-slate-950">
                      {editingMusicId ? 'Update track' : 'Add track'}
                    </button>
                    {editingMusicId && (
                      <button type="button" onClick={() => { setEditingMusicId(null); setMusicTitle(''); setMusicUrl(''); setMusicCover(''); }} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">
                        Cancel
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {musicTracks.map(track => (
                      <div key={track.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-950 border border-amber-500/20 p-3">
                        <div>
                          <span className="font-bold text-amber-200 block">{track.title}</span>
                          <span className="text-[10px] text-slate-400">{track.audioUrl}</span>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => { setActiveMusicId(track.id); setIsMusicPlaying(false); }} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200">Select</button>
                          <button type="button" onClick={() => editMusicTrack(track)} className="px-2.5 py-1 rounded-lg bg-emerald-600/30 text-emerald-300 border border-emerald-500/30">Edit</button>
                          <button type="button" onClick={() => deleteMusicTrack(track.id)} className="px-2.5 py-1 rounded-lg bg-red-600/30 text-red-300 border border-red-500/30">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-amber-500/20 space-y-4">
                  <h3 className="font-bold text-amber-400">🗂️ කාණ්ඩ (Categories) කළමනාකරණය</h3>
                  <div className="space-y-3">
                    {categories.map(cat => (
                      <div key={cat.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-950 border border-amber-500/20 p-3">
                        <div className="font-bold text-amber-200">
                          <span>{cat.icon}</span> {cat.labelSi} / {cat.labelEn}
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => editCategory(cat)} className="px-3 py-1.5 rounded-lg bg-emerald-600/30 text-emerald-300 border border-emerald-500/30">Edit</button>
                          <button type="button" onClick={() => deleteCategory(cat.id)} className="px-3 py-1.5 rounded-lg bg-red-600/30 text-red-300 border border-red-500/30">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
                    <input type="text" value={categoryIcon} onChange={e => setCategoryIcon(e.target.value)} placeholder="📌" className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                    <input type="text" value={categorySi} onChange={e => setCategorySi(e.target.value)} placeholder="සිංහල නම" className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                    <input type="text" value={categoryEn} onChange={e => setCategoryEn(e.target.value)} placeholder="English name" className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                    <button type="button" onClick={saveCategory} className="px-4 py-2.5 rounded-xl font-bold bg-amber-500 text-slate-950">
                      {editingCategoryId ? 'Update' : 'Add'}
                    </button>
                  </div>
                </div>

                {/* Live Streaming Config */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-amber-500/20 flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-300">
                    <input type="checkbox" checked={isLiveStreaming} onChange={e => setIsLiveStreaming(e.target.checked)} className="w-4 h-4 accent-amber-500" />
                    <span>🔴 සජීවී විකාශය සක්‍රිය කරන්න (Live Streaming)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="YouTube Live Stream Link..."
                    value={liveStreamUrl}
                    onChange={e => setLiveStreamUrl(e.target.value)}
                    className="flex-1 p-2 rounded-xl bg-slate-950 border border-amber-500/30 text-white min-w-[200px]"
                  />
                </div>

                <button type="submit" className="w-full py-3.5 rounded-2xl font-black bg-amber-500 text-slate-950 text-sm hover:bg-amber-400 transition shadow-xl">
                  💾 සියලුම සාමාන්‍ය සැකසුම් සුරකින්න (Save Settings)
                </button>
              </form>
            )}

            {/* Admin Sub Tab 2: Posts Management */}
            {adminSubTab === 'posts' && canAccess('posts') && (
              <div className="space-y-8 text-xs">
                <form onSubmit={savePost} className="p-5 rounded-2xl bg-slate-900/70 border border-amber-500/20 space-y-4">
                  <h3 className="font-bold text-sm text-amber-400 border-b border-amber-500/20 pb-2">
                    {editingPostId ? '✏️ ලිපිය සංස්කරණය කරන්න' : '➕ අලුත් ලිපියක් / වීඩියෝවක් එකතු කරන්න'}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">කාණ්ඩය (Category)</label>
                      <select value={postCat} onChange={e => setPostCat(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white">
                        {categories.map(c => <option key={c.id} value={c.id}>{c.labelSi}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">මාතෘකාව (සිංහල)</label>
                      <input type="text" value={postTitleSi} onChange={e => setPostTitleSi(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Title (English)</label>
                      <input type="text" value={postTitleEn} onChange={e => setPostTitleEn(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">විස්තරය (සිංහල)</label>
                      <textarea rows={4} value={postDescSi} onChange={e => setPostDescSi(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Description (English)</label>
                      <textarea rows={4} value={postDescEn} onChange={e => setPostDescEn(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">ඡායාරූපය (Image URL or Upload)</label>
                      <input type="url" value={postImg} onChange={e => setPostImg(e.target.value)} placeholder="https://example.com/image.jpg" className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white mb-2" />
                      <input type="file" accept="image/*" onChange={e => handleFileUploadWithEditor(e, setPostImg)} className="text-[10px] text-slate-400" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">YouTube Video URL</label>
                      <input type="url" placeholder="https://www.youtube.com/watch?v=..." value={postYt} onChange={e => setPostYt(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">තත්ත්වය (Status)</label>
                      <select value={postStatus} onChange={e => setPostStatus(e.target.value as 'published' | 'draft')} className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white">
                        <option value="published">ප්‍රකාශිතයි (Published)</option>
                        <option value="draft">කෙටුම්පත (Draft)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="px-6 py-2.5 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition">
                      {editingPostId ? '💾 වෙනස්කම් සුරකින්න' : '➕ ලිපිය ඇතුළත් කරන්න'}
                    </button>
                    {editingPostId && (
                      <button type="button" onClick={cancelPostEdit} className="px-4 py-2.5 rounded-xl font-bold bg-slate-800 text-slate-300 hover:bg-slate-700">
                        අවලංගු කරන්න
                      </button>
                    )}
                  </div>
                </form>

                {/* Post List */}
                <div className="space-y-3">
                  <h4 className="font-bold text-amber-300">ඇතුළත් කර ඇති ලිපි ලැයිස්තුව ({posts.length})</h4>
                  <div className="space-y-2">
                    {posts.map(p => (
                      <div key={p.id} className="p-3 rounded-xl bg-slate-900 border border-amber-500/10 flex items-center justify-between gap-4">
                        <div className="truncate">
                          <span className="font-bold text-white block truncate">{p.titleSi}</span>
                          <span className="text-[10px] text-amber-400/80">{categories.find(c => c.id === p.category)?.labelSi} • {p.createdAt} • {p.status}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => deletePost(p.id)} className="px-2.5 py-1 rounded-lg bg-red-600/30 text-red-300 border border-red-500/30">මකා දමන්න</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Admin Sub Tab 3: Custom Pages (CREATE & EDIT) */}
            {adminSubTab === 'pages' && canAccess('pages') && (
              <div className="space-y-8 text-xs">
                <form onSubmit={saveCustomPage} className="p-5 rounded-2xl bg-slate-900/70 border border-amber-500/20 space-y-4">
                  <h3 className="font-bold text-sm text-amber-400 border-b border-amber-500/20 pb-2">
                    {editingPageId ? '✏️ පිටුව සංස්කරණය කරන්න (Edit Custom Page)' : '➕ නව අභිරුචි පිටුවක් නිර්මාණය කරන්න (Create Custom Page)'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">පිටුවේ මාතෘකාව (සිංහල)</label>
                      <input type="text" value={pageTitleSi} onChange={e => setPageTitleSi(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Page Title (English)</label>
                      <input type="text" value={pageTitleEn} onChange={e => setPageTitleEn(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">පිටුවේ අන්තර්ගතය (සිංහල)</label>
                    <textarea rows={6} value={pageContentSi} onChange={e => setPageContentSi(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Content (English)</label>
                    <textarea rows={4} value={pageContentEn} onChange={e => setPageContentEn(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Banner Image URL or Upload</label>
                    <input type="url" value={pageBanner} onChange={e => setPageBanner(e.target.value)} placeholder="https://example.com/banner.jpg" className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white mb-2" />
                    <input type="file" accept="image/*" onChange={e => handleFileUploadWithEditor(e, setPageBanner)} className="text-[10px] text-slate-400" />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="px-6 py-2.5 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition">
                      {editingPageId ? '💾 වෙනස්කම් සුරකින්න' : '📄 පිටුව සාදා පද්ධතියට එකතු කරන්න'}
                    </button>
                    {editingPageId && (
                      <button type="button" onClick={cancelPageEdit} className="px-4 py-2.5 rounded-xl font-bold bg-slate-800 text-slate-300 hover:bg-slate-700">
                        අවලංගු කරන්න
                      </button>
                    )}
                  </div>
                </form>

                {/* Custom Pages List */}
                <div className="space-y-3">
                  <h4 className="font-bold text-amber-300">සාදා ඇති පිටු ලැයිස්තුව ({customPages.length})</h4>
                  {customPages.map(page => (
                    <div key={page.id} className="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/20 flex justify-between items-center gap-4">
                      <span className="font-bold text-amber-200">{page.titleSi} ({page.titleEn})</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => editCustomPage(page)} className="px-3 py-1 rounded-xl bg-emerald-600/30 text-emerald-300 border border-emerald-500/30">
                          ✏️ සංස්කරණය
                        </button>
                        <button onClick={() => deleteCustomPage(page.id)} className="px-3 py-1 rounded-xl bg-red-600/30 text-red-300 border border-red-500/30">
                          🗑️ මකා දමන්න
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Sub Tab 4: Donation Slips */}
            {adminSubTab === 'slips' && canAccess('slips') && (
              <div className="space-y-4 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
                  <h3 className="font-bold text-sm text-amber-400">💳 ලැබුණු බැංකු තැන්පතු රිසිට්පත් ලැයිස්තුව</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-semibold">Filter:</span>
                    <select value={slipFilter} onChange={e => setSlipFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')} className="p-1.5 rounded-xl bg-slate-900 border border-amber-500/30 text-white">
                      <option value="all">සියල්ල (All)</option>
                      <option value="pending">පරීක්ෂා කරමින් (Pending)</option>
                      <option value="approved">අනුමතයි (Approved)</option>
                      <option value="rejected">ප්‍රතික්ෂේපිතයි (Rejected)</option>
                    </select>
                  </div>
                </div>

                {filteredSlips.length === 0 ? (
                  <p className="text-slate-500">කිසිදු රිසිට්පතක් හමු නොවුණි.</p>
                ) : (
                  <div className="space-y-3">
                    {filteredSlips.map(slip => (
                      <div key={slip.id} className="p-4 rounded-2xl bg-slate-900 border border-amber-500/20 flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="font-bold text-amber-200 text-sm block">{slip.donorName}</span>
                          <span className="text-slate-300 block">මුදල: Rs. {slip.amount} | දුරකථන: {slip.phone}</span>
                          <span className="text-[10px] text-slate-500 block">දිනය: {slip.submittedAt}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setLightboxImage(slip.slipImage)} className="px-3 py-1.5 rounded-xl bg-slate-800 text-amber-300 border border-amber-500/30">
                            🖼️ රිසිට්පත බලන්න
                          </button>
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${slip.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : slip.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                            {slip.status === 'approved' ? 'අනුමතයි' : slip.status === 'rejected' ? 'ප්‍රතික්ෂේපිතයි' : 'පරීක්ෂා කරමින්'}
                          </span>
                          <button onClick={() => updateSlipStatus(slip.id, 'approved')} className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold">
                            අනුමත කරන්න
                          </button>
                          <button onClick={() => updateSlipStatus(slip.id, 'rejected')} className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold">
                            ප්‍රතික්ෂේප කරන්න
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Admin Sub Tab 5: Student Enrollments */}
            {adminSubTab === 'students' && canAccess('students') && (
              <div className="space-y-4 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
                  <h3 className="font-bold text-sm text-amber-400">🎓 දහම් පාසල් නවක සිසු ලියාපදිංචි අයදුම්පත්</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={exportStudentsToCSV} className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-1">
                      <span>📥</span> <span>Excel / CSV Download</span>
                    </button>
                    <select value={studentFilter} onChange={e => setStudentFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')} className="p-1.5 rounded-xl bg-slate-900 border border-amber-500/30 text-white">
                      <option value="all">සියල්ල (All)</option>
                      <option value="pending">පරීක්ෂා කරමින් (Pending)</option>
                      <option value="approved">අනුමතයි (Approved)</option>
                      <option value="rejected">ප්‍රතික්ෂේපිතයි (Rejected)</option>
                    </select>
                  </div>
                </div>

                {filteredStudents.length === 0 ? (
                  <p className="text-slate-500">කිසිදු අයදුම්පතක් හමු නොවුණි.</p>
                ) : (
                  <div className="space-y-3">
                    {filteredStudents.map(std => (
                      <div key={std.id} className="p-4 rounded-2xl bg-slate-900 border border-amber-500/20 flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="font-bold text-amber-200 text-sm block">ශිෂ්‍යයා: {std.studentName} (ශ්‍රේණිය: {std.grade})</span>
                          <span className="text-slate-300 block">භාරකාර: {std.guardianName} | දුරකථන: {std.phone}</span>
                          <span className="text-slate-400 block">ලිපිනය: {std.address}</span>
                          <span className="text-[10px] text-slate-500 block">දිනය: {std.submittedAt}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${std.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : std.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                            {std.status === 'approved' ? 'ඇතුළත් කරගන්නා ලදී' : std.status === 'rejected' ? 'ප්‍රතික්ෂේපිතයි' : 'පරීක්ෂා කරමින්'}
                          </span>
                          <button onClick={() => updateEnrollmentStatus(std.id, 'approved')} className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold">
                            අනුමත කරන්න
                          </button>
                          <button onClick={() => updateEnrollmentStatus(std.id, 'rejected')} className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold">
                            ප්‍රතික්ෂේප කරන්න
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Admin Sub Tab 6: Password Roles Settings */}
            {adminSubTab === 'roles' && canAccess('roles') && (
              <form onSubmit={savePasswords} className="space-y-4 text-xs max-w-md">
                <h3 className="font-bold text-sm text-amber-400 border-b border-amber-500/20 pb-2">🔑 පරිපාලන මුරපද (Passwords) වෙනස් කිරීම</h3>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Super Admin Password</label>
                  <input type="text" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-900 border border-amber-500/30 text-white" />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Editor Password</label>
                  <input type="text" value={editorPassword} onChange={e => setEditorPassword(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-900 border border-amber-500/30 text-white" />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Dhamma Admin Password</label>
                  <input type="text" value={dhammaPassword} onChange={e => setDhammaPassword(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-900 border border-amber-500/30 text-white" />
                </div>
                <button type="submit" className="px-6 py-2.5 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition">
                  💾 මුරපද සුරකින්න (Save Passwords)
                </button>
              </form>
            )}
          </div>
        )}
      </main>

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border-2 border-amber-500/40 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-amber-500/20 pb-3">
              <h3 className="text-base font-black text-amber-400">⚙️ පරිපාලන පද්ධතියට ප්‍රවේශ වීම</h3>
              <button onClick={() => setShowLoginModal(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
              {supabase && (
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Admin email</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                    className="w-full p-3 rounded-xl bg-slate-950 border border-amber-500/30 text-white"
                  />
                </div>
              )}
              <div>
                <label className="block font-bold text-slate-300 mb-1">භූමිකාව තෝරන්න (Role)</label>
                <select value={loginRole} onChange={e => setLoginRole(e.target.value as AdminRole)} className="w-full p-3 rounded-xl bg-slate-950 border border-amber-500/30 text-white">
                  <option value="super_admin">Super Admin (ප්‍රධාන පරිපාලක)</option>
                  <option value="editor">Editor (ලිපි සංස්කාරක)</option>
                  <option value="dhamma_admin">Dhamma Admin (දහම් පාසල් පරිපාලක)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">මුරපදය (Password)</label>
                <input
                  type="password"
                  value={inputPassword}
                  onChange={e => setInputPassword(e.target.value)}
                  placeholder="Password ඇතුළත් කරන්න..."
                  required
                  className="w-full p-3 rounded-xl bg-slate-950 border border-amber-500/30 text-white"
                />
              </div>
              <button type="submit" className="w-full py-3 rounded-xl font-black bg-amber-500 text-slate-950 hover:bg-amber-400 transition">
                🔓 ප්‍රවේශ වන්න
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DONATION MODAL */}
      {showDonateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border-2 border-amber-500/40 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-amber-500/20 pb-3">
              <h3 className="text-base font-black text-amber-400">🙏 ආධාර සහ සම්මාදම් බැංකු විස්තර</h3>
              <button onClick={() => setShowDonateModal(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1 text-slate-200">
              <p className="font-bold text-amber-300 text-sm">{bankName}</p>
              <p>ගිණුම් නම: <span className="font-semibold text-white">{bankAccountName}</span></p>
              <p>ගිණුම් අංකය: <span className="font-mono text-amber-400 font-bold text-sm">{bankAccountNumber}</span></p>
              <p>ශාඛාව: <span className="font-semibold text-white">{bankBranch}</span></p>
            </div>

            <form onSubmit={submitDonationSlip} className="space-y-3 text-xs">
              <h4 className="font-bold text-amber-300">ඔබගේ බැංකු රිසිට්පත යොමු කරන්න</h4>
              <div>
                <label className="block text-slate-300 mb-1">ඔබගේ නම</label>
                <input type="text" value={donorName} onChange={e => setDonorName(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">පරිත්‍යාග කළ මුදල (Rs.)</label>
                  <input type="text" value={donorAmount} onChange={e => setDonorAmount(e.target.value)} placeholder="1000" className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">දුරකථන අංකය</label>
                  <input type="tel" value={donorPhone} onChange={e => setDonorPhone(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">රිසිට්පතෙහි ඡායාරූපය (Slip Image)</label>
                <input type="file" accept="image/*" onChange={e => handleFileUploadWithEditor(e, setDonorSlipImg)} required className="text-[10px] text-slate-400" />
              </div>
              <button type="submit" className="w-full py-3 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition">
                📤 රිසිට්පත යොමු කරන්න
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT ENROLLMENT MODAL */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border-2 border-emerald-500/40 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-emerald-500/20 pb-3">
              <h3 className="text-base font-black text-emerald-400">🎓 ශ්‍රී ධර්මාරාම දහම් පාසල - නවක සිසු ඇතුළත් වීම</h3>
              <button onClick={() => setShowEnrollModal(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={submitStudentEnrollment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">ශිෂ්‍යයාගේ සම්පූර්ණ නම</label>
                <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">මව්පිය / භාරකරුගේ නම</label>
                  <input type="text" value={guardianName} onChange={e => setGuardianName(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-white" />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">ඇතුළත් වන ශ්‍රේණිය</label>
                  <select value={studentGrade} onChange={e => setStudentGrade(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-white">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(g => <option key={g} value={g}>{g} ශ්‍රේණිය</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">දුරකථන අංකය</label>
                <input type="tel" value={studentPhone} onChange={e => setStudentPhone(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-white" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">ලිපිනය</label>
                <textarea rows={2} value={studentAddress} onChange={e => setStudentAddress(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-white" />
              </div>
              <button type="submit" className="w-full py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-lg">
                📝 ලියාපදිංචි අයදුම්පත යොමු කරන්න
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POST DETAIL VIEW MODAL */}
      {selectedPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-3xl p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-amber-500/40 shadow-2xl space-y-6 my-8">
            <div className="flex justify-between items-center border-b border-amber-500/20 pb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {categories.find(c => c.id === selectedPostModal.category)?.labelSi}
              </span>
              <button onClick={() => setSelectedPostModal(null)} className="text-slate-400 hover:text-white text-xl font-bold">✕</button>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-amber-400 leading-snug">
              {lang === 'si' ? selectedPostModal.titleSi : selectedPostModal.titleEn}
            </h2>

            {selectedPostModal.youtubeUrl && getYouTubeId(selectedPostModal.youtubeUrl) ? (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-amber-500/20">
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(selectedPostModal.youtubeUrl)}`}
                  title={selectedPostModal.titleSi}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            ) : selectedPostModal.image ? (
              <div className="w-full h-72 sm:h-96 rounded-2xl overflow-hidden border border-amber-500/20 cursor-pointer" onClick={() => setLightboxImage(selectedPostModal.image!)}>
                <img src={selectedPostModal.image} alt={selectedPostModal.titleSi} className="w-full h-full object-cover" />
              </div>
            ) : null}

            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line space-y-3 border-t border-amber-500/10 pt-4">
              {lang === 'si' ? selectedPostModal.descriptionSi : selectedPostModal.descriptionEn}
            </div>

            <div className="flex justify-between items-center border-t border-amber-500/20 pt-4 text-xs">
              <span className="text-slate-400">📅 දිනය: {selectedPostModal.createdAt}</span>
              <button onClick={() => sharePost(selectedPostModal)} className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold">
                🔗 බෙදාහරින්න (Share)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX IMAGE MODAL */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl" onClick={() => setLightboxImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={lightboxImage} alt="Enlarged view" className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
            <button onClick={() => setLightboxImage(null)} className="absolute -top-10 right-0 text-white font-bold text-xl">✕ වසන්න</button>
          </div>
        </div>
      )}

      {/* IMAGE CANVAS EDITOR MODAL */}
      {rawImageForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-xl p-6 rounded-3xl bg-slate-900 border-2 border-amber-500/40 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-amber-400 border-b border-amber-500/20 pb-2">🎨 ඡායාරූප සංස්කාරකය (Image Editor)</h3>

            <div className="flex justify-center bg-slate-950 p-4 rounded-2xl max-h-64 overflow-hidden border border-amber-500/20">
              <img
                src={rawImageForEdit}
                alt="Preview"
                style={{
                  transform: `rotate(${imgRotation}deg) scaleX(${imgFlipH ? -1 : 1})`,
                  filter: `brightness(${imgBrightness}%) contrast(${imgContrast}%) ${imgGrayscale ? 'grayscale(100%)' : ''}`,
                }}
                className="max-h-56 object-contain transition duration-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">භ්‍රමණය (Rotate): {imgRotation}°</label>
                <input type="range" min="0" max="360" step="90" value={imgRotation} onChange={e => setImgRotation(Number(e.target.value))} className="w-full accent-amber-500" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">දීප්තිය (Brightness): {imgBrightness}%</label>
                <input type="range" min="50" max="150" value={imgBrightness} onChange={e => setImgBrightness(Number(e.target.value))} className="w-full accent-amber-500" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">වෙනස (Contrast): {imgContrast}%</label>
                <input type="range" min="50" max="150" value={imgContrast} onChange={e => setImgContrast(Number(e.target.value))} className="w-full accent-amber-500" />
              </div>
              <div className="flex items-center gap-4 pt-3">
                <label className="flex items-center gap-1 cursor-pointer text-slate-300">
                  <input type="checkbox" checked={imgFlipH} onChange={e => setImgFlipH(e.target.checked)} className="accent-amber-500" /> Flip H
                </label>
                <label className="flex items-center gap-1 cursor-pointer text-slate-300">
                  <input type="checkbox" checked={imgGrayscale} onChange={e => setImgGrayscale(e.target.checked)} className="accent-amber-500" /> B&W
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setRawImageForEdit(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs">අවලංගු කරන්න</button>
              <button onClick={applyImageEdits} className="px-6 py-2 rounded-xl font-bold bg-amber-500 text-slate-950 text-xs hover:bg-amber-400">✨ වෙනස්කම් යොදන්න</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}