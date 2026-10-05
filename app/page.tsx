'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { SiteImage } from '@/lib/site-image';
import { getAdminRole, type AdminRole } from '@/lib/admin-auth';


// Types & Interfaces
interface Category {
  id: string;
  labelSi: string;
  labelEn: string;
  icon: string;
  showOnHome?: boolean;
}

interface CustomPage {
  id: string;
  titleSi: string;
  titleEn: string;
  contentSi: string;
  contentEn: string;
  bannerImage?: string;
  logoImage?: string;
}

interface Post {
  id: string;
  category: string;
  topic?: string;
  showOnHome?: boolean;
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

interface GalleryItem {
  id: number;
  title: string;
  category: string | null;
  description?: string;
  pageKey?: string | null;
  image_url: string;
  created_at: string;
}

interface SiteTheme {
  id: string;
  name: string;
  background: string;
  accent: string;
  text: string;
}

interface DhammaWinner {
  id: string;
  name: string;
  achievement: string;
  place?: string;
  grade: string;
  year: string;
  image: string;
}

interface PeopleCard {
  id: string;
  name: string;
  role: string;
  image: string;
  description: string;
  section: string;
  showOnHome?: boolean;
  pageKey?: string;
}

interface UpcomingEvent {
  id: string;
  date: string;
  titleSi: string;
  titleEn: string;
  tagSi: string;
  tagEn: string;
}

type WallpaperSection = 'dhamma' | 'countdown' | 'puja' | 'posts';
type SectionPhotoKey = WallpaperSection | 'winners' | 'leaders' | 'characters' | 'history' | 'monks' | 'videos' | 'pinkam' | 'social' | 'religious' | 'memorial' | 'development';

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= items.length) return items;

  const reordered = [...items];
  [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
  return reordered;
}

const DEFAULT_THEMES: SiteTheme[] = [
  { id: 'temple-night', name: 'Temple Night', background: '#030712', accent: '#f59e0b', text: '#f8fafc' },
  { id: 'lotus-dawn', name: 'Lotus Dawn', background: '#fff7ed', accent: '#c2410c', text: '#431407' },
  { id: 'forest-dhamma', name: 'Forest Dhamma', background: '#052e16', accent: '#facc15', text: '#f0fdf4' },
];

const DEFAULT_UPCOMING_EVENTS: UpcomingEvent[] = [
  { id: 'poya-2026-10', date: '2026-10-25', titleSi: 'වප් පෝය', titleEn: 'Vap Poya', tagSi: 'පෝය', tagEn: 'Poya' },
  { id: 'katina-2026-11', date: '2026-11-09', titleSi: 'කඨින පිංකම', titleEn: 'Katina Pinkama', tagSi: 'පිංකම', tagEn: 'Pinkama' },
  { id: 'sil-2026-11', date: '2026-11-15', titleSi: 'සීල සමාදාන වැඩසටහන', titleEn: 'Sil Samadana Program', tagSi: 'සේවාව', tagEn: 'Service' },
  { id: 'sermon-2026-12', date: '2026-12-05', titleSi: 'ධර්ම දේශනා මණ්ඩලය', titleEn: 'Dhamma Sermon Gathering', tagSi: 'දේශනාව', tagEn: 'Sermon' },
];

type SiteContent = Partial<{
  categories: Category[];
  galleryItems: GalleryItem[];
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
  upcomingEvents: UpcomingEvent[];
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
  backgroundVideo: string;
  sectionWallpapers: Partial<Record<WallpaperSection, string>>;
  sectionPhotos: Partial<Record<SectionPhotoKey, string[]>>;
  peopleBySection: Record<string, PeopleCard[]>;
  winners: DhammaWinner[];
  showWinnersOnHome: boolean;
  winnerTopic: string;
  winnerTopicPlacement: 'above' | 'below';
  winnerDisplayCount: number;
  postDisplayCount: number;
  postGridColumns: number;
  dailyVerseSi: string;
  dailyVerseMeaningSi: string;
  pujaMorning: string;
  pujaNoon: string;
  pujaEvening: string;
  pujaMorningImg: string;
  pujaNoonImg: string;
  pujaEveningImg: string;
  musicTracks: MusicTrack[];
  themes: SiteTheme[];
  selectedThemeId: string;
  loadingEnabled: boolean;
  loadingDuration: number;
  welcomeThemeVersion?: number;
  loadingTextSi: string;
  loadingTitleSi: string;
  loadingSubtitleSi: string;
  welcomeBackgroundColor: string;
  welcomeAccentColor: string;
  splashImage: string;
  background3dEnabled: boolean;
}>;

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'history', labelSi: 'ඉතිහාසය සහ තොරතුරු', labelEn: 'History & Overview', icon: '🏛️' },
  { id: 'dhamma', labelSi: 'ශ්‍රී උපනන්ද දහම් පාසල', labelEn: 'Dhamma School', icon: '🪷' },
  { id: 'monks', labelSi: 'වැඩවසන ස්වාමීන් වහන්සේලා', labelEn: 'Resident Monks', icon: '🧘‍♂️' },
  { id: 'videos', labelSi: 'ධර්ම දේශනා සහ වීඩියෝ', labelEn: 'Sermons & Videos', icon: '🎥' },
  { id: 'pinkam', labelSi: 'පින්කම් මාලාව', labelEn: 'Religious Events', icon: '🪔' },
];

const DEFAULT_LOADING_DURATION_MS = 10000;
const WELCOME_THEME_VERSION = 2;
const DEFAULT_WELCOME_TITLE_SI = 'පබස්සර';
const DEFAULT_WELCOME_SUBTITLE_SI = 'ශ්‍රී බෝධිරුක්ඛාරාමය ගණිහිමුල්ල දෙවලපොල';
const DEFAULT_WELCOME_GREETING_SI = 'සාදරයෙන් පිළිගනිමු';
const DEFAULT_WELCOME_BACKGROUND = '#071715';
const DEFAULT_WELCOME_ACCENT = '#f5c451';
const formatEventDate = (value: string, language: 'si' | 'en', format: 'date' | 'month' | 'weekday' = 'date') => {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return value;

  const englishMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const englishShortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const sinhalaMonths = ['ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'];
  const sinhalaShortMonths = ['ජන', 'පෙබ', 'මාර්', 'අප්‍රේ', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝ', 'සැප්', 'ඔක්', 'නොවැ', 'දෙසැ'];
  const englishWeekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const sinhalaWeekdays = ['ඉරිදා', 'සඳුදා', 'අඟහරුවාදා', 'බදාදා', 'බ්‍රහස්පතින්දා', 'සිකුරාදා', 'සෙනසුරාදා'];
  const monthName = (language === 'si' ? sinhalaMonths : englishMonths)[month - 1];
  const shortMonthName = (language === 'si' ? sinhalaShortMonths : englishShortMonths)[month - 1];
  if (format === 'month') return shortMonthName;

  const dateText = language === 'si' ? `${year} ${monthName} ${day}` : `${monthName} ${day}, ${year}`;
  if (format !== 'weekday') return dateText;

  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const weekdayName = (language === 'si' ? sinhalaWeekdays : englishWeekdays)[weekday];
  return language === 'si' ? `${weekdayName}, ${dateText}` : `${weekdayName}, ${dateText}`;
};

export default function CompleteTempleApp() {
  const [lang, setLang] = useState<'si' | 'en'>('si');
  const [activeTab, setActiveTab] = useState('history');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showEventsCalendar, setShowEventsCalendar] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [selectedPostModal, setSelectedPostModal] = useState<Post | null>(null);

  // Admin Auth & Role System
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentRole, setCurrentRole] = useState<AdminRole>('super_admin');
  const [inputPassword, setInputPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [adminSubTab, setAdminSubTab] = useState<'general' | 'gallery' | 'roles' | 'posts' | 'pages' | 'slips' | 'students' | 'winners'>('general');

  // Dynamic Branding
  const [splashImage, setSplashImage] = useState('/temple-logo.svg');
  const [templeNameSi, setTempleNameSi] = useState('ශ්‍රී බෝධිරුක්ඛාරාමය ගණිහිමුල්ල දෙවලපොල');
  const [templeNameEn, setTempleNameEn] = useState('Sri Bodhirukkharamaya Ganihimulla Devalapola');
  const [templeLocationSi, setTempleLocationSi] = useState('ගණිහිමුල්ල, දෙවලපොල');
  const [templeLocationEn, setTempleLocationEn] = useState('Ganihimulla, Devalapola');
  const [themes, setThemes] = useState<SiteTheme[]>(DEFAULT_THEMES);
  const [selectedThemeId, setSelectedThemeId] = useState('temple-night');
  const [loadingEnabled, setLoadingEnabled] = useState(true);
  const [loadingDuration, setLoadingDuration] = useState(DEFAULT_LOADING_DURATION_MS);
  const [loadingTextSi, setLoadingTextSi] = useState('සාදරයෙන් පිළිගනිමු');
  const [loadingTitleSi, setLoadingTitleSi] = useState(DEFAULT_WELCOME_TITLE_SI);
  const [loadingSubtitleSi, setLoadingSubtitleSi] = useState(DEFAULT_WELCOME_SUBTITLE_SI);
  const [welcomeBackgroundColor, setWelcomeBackgroundColor] = useState(DEFAULT_WELCOME_BACKGROUND);
  const [welcomeAccentColor, setWelcomeAccentColor] = useState(DEFAULT_WELCOME_ACCENT);
    const [background3dEnabled, setBackground3dEnabled] = useState(true);
  const [isWelcomeSettingsReady, setIsWelcomeSettingsReady] = useState(false);
  const [isLoadingScreenVisible, setIsLoadingScreenVisible] = useState(false);
  const [isWelcomePreviewForced, setIsWelcomePreviewForced] = useState(false);
  const [themeName, setThemeName] = useState('');
  const [themeBackground, setThemeBackground] = useState('#030712');
  const [themeAccent, setThemeAccent] = useState('#f59e0b');
  const [themeText, setThemeText] = useState('#f8fafc');
  const loadingStartedAtRef = useRef<number | null>(null);
  const hasAutoStartedWelcomeRef = useRef(false);

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
  const [backgroundVideo, setBackgroundVideo] = useState('');
  const [backgroundVideoUploadStatus, setBackgroundVideoUploadStatus] = useState('');
  const [sectionWallpapers, setSectionWallpapers] = useState<Partial<Record<WallpaperSection, string>>>({});
  const [sectionPhotos, setSectionPhotos] = useState<Partial<Record<SectionPhotoKey, string[]>>>({});
  const [heroCover, setHeroCover] = useState('');
  const [badgeLogo, setBadgeLogo] = useState('/temple-logo.svg');
  const [timerCover, setTimerCover] = useState('');

  // Event & Timer Configurations
  const [eventTitleSi, setEventTitleSi] = useState('වාර්ෂික මහා කඨින පූජෝත්සවය');
  const [eventTitleEn, setEventTitleEn] = useState('Annual Great Katina Ceremony');
  const [eventTargetDate, setEventTargetDate] = useState('2026-11-15T08:00');
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>(DEFAULT_UPCOMING_EVENTS);
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

  // Shared photo album state
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [editingGalleryId, setEditingGalleryId] = useState<number | null>(null);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryCategory, setGalleryCategory] = useState('');
  const [galleryDescription, setGalleryDescription] = useState('');
  const [galleryPageKey, setGalleryPageKey] = useState('all');
  const [galleryImage, setGalleryImage] = useState('');

  // Categories, Pages & Posts
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [winners, setWinners] = useState<DhammaWinner[]>([]);
  const [peopleBySection, setPeopleBySection] = useState<Record<string, PeopleCard[]>>({
    leaders: [],
    winners: [],
    characters: [],
  });
  const [selectedWinner, setSelectedWinner] = useState<DhammaWinner | null>(null);
  const [showWinnersOnHome, setShowWinnersOnHome] = useState(true);
  const [winnerTopic, setWinnerTopic] = useState('දහම් පාසල් දක්ෂතා ඇගයීම');
  const [winnerTopicPlacement, setWinnerTopicPlacement] = useState<'above' | 'below'>('above');
  const [winnerDisplayCount, setWinnerDisplayCount] = useState(6);
  const [personSection, setPersonSection] = useState('');
  const [personShowOnHome, setPersonShowOnHome] = useState(true);
  const [personPageKey, setPersonPageKey] = useState('');
  const [personName, setPersonName] = useState('');
  const [personRole, setPersonRole] = useState('');
  const [personImage, setPersonImage] = useState('');
  const [personDescription, setPersonDescription] = useState('');
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [postDisplayCount, setPostDisplayCount] = useState(9);
  const [postGridColumns, setPostGridColumns] = useState(3);
  const [editingWinnerId, setEditingWinnerId] = useState<string | null>(null);
  const [winnerName, setWinnerName] = useState('');
  const [winnerAchievement, setWinnerAchievement] = useState('');
  const [winnerPlace, setWinnerPlace] = useState('');
  const [winnerGrade, setWinnerGrade] = useState('');
  const [winnerYear, setWinnerYear] = useState(String(new Date().getFullYear()));
  const [winnerImage, setWinnerImage] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categorySi, setCategorySi] = useState('');
  const [categoryEn, setCategoryEn] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('📌');
  const [categoryShowOnHome, setCategoryShowOnHome] = useState(true);

  // Page Form State (Create & Edit)
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [pageTitleSi, setPageTitleSi] = useState('');
  const [pageTitleEn, setPageTitleEn] = useState('');
  const [pageContentSi, setPageContentSi] = useState('');
  const [pageContentEn, setPageContentEn] = useState('');
  const [pageBanner, setPageBanner] = useState('');
  const [pageLogo, setPageLogo] = useState('');

  // Pirith Audio Player State
  const pirithUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

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
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'loading' | 'saved' | 'error'>('idle');
  const [cloudSyncError, setCloudSyncError] = useState('');
  const [isSavingSiteContent, setIsSavingSiteContent] = useState(false);
  const [savedSiteContentSnapshot, setSavedSiteContentSnapshot] = useState('');

  // Ticker
  const [tickerText, setTickerText] = useState('2026 වසර සඳහා දහම් පාසලට නවක සිසුන් ඇතුළත් කරගැනීම දැනට සිදුකෙරේ.');

  // Editing States for Posts
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postCat, setPostCat] = useState('history');
  const [postTopic, setPostTopic] = useState('');
  const [postShowOnHome, setPostShowOnHome] = useState(true);
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
  const imageEditorPreviewRef = useRef<HTMLCanvasElement | null>(null);
  const [isImageProcessing, setIsImageProcessing] = useState(false);
  const [imageProcessingError, setImageProcessingError] = useState('');
  const [imgRotation, setImgRotation] = useState(0);
  const [imgBrightness, setImgBrightness] = useState(100);
  const [imgContrast, setImgContrast] = useState(100);
  const [imgFlipH, setImgFlipH] = useState(false);
  const [imgGrayscale, setImgGrayscale] = useState(false);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropWidth, setCropWidth] = useState(100);
  const [cropHeight, setCropHeight] = useState(100);
  const cloudReadyRef = useRef(false);
  const allowPageUnloadRef = useRef(false);
  const saveInProgressRef = useRef(false);
  const savedSiteContentSnapshotRef = useRef('');

  const applySiteContent = (content: SiteContent) => {
    if (content.categories) setCategories(content.categories);
    if (content.galleryItems) setGalleryItems(content.galleryItems.slice(0, 100));
    if (content.customPages) setCustomPages(content.customPages);
    if (content.posts) setPosts(content.posts);
    if (typeof content.templeNameSi === 'string') setTempleNameSi(content.templeNameSi);
    if (typeof content.templeNameEn === 'string') setTempleNameEn(content.templeNameEn);
    if (typeof content.templeLocationSi === 'string') setTempleLocationSi(content.templeLocationSi);
    if (typeof content.templeLocationEn === 'string') setTempleLocationEn(content.templeLocationEn);
    if (typeof content.tickerText === 'string') setTickerText(content.tickerText);
    if (typeof content.eventTitleSi === 'string') setEventTitleSi(content.eventTitleSi);
    if (typeof content.eventTitleEn === 'string') setEventTitleEn(content.eventTitleEn);
    if (typeof content.eventTargetDate === 'string') setEventTargetDate(content.eventTargetDate);
    if (content.upcomingEvents) setUpcomingEvents(content.upcomingEvents);
    if (typeof content.bankName === 'string') setBankName(content.bankName);
    if (typeof content.bankAccountName === 'string') setBankAccountName(content.bankAccountName);
    if (typeof content.bankAccountNumber === 'string') setBankAccountNumber(content.bankAccountNumber);
    if (typeof content.bankBranch === 'string') setBankBranch(content.bankBranch);
    if (typeof content.isLiveStreaming === 'boolean') setIsLiveStreaming(content.isLiveStreaming);
    if (typeof content.liveStreamUrl === 'string') setLiveStreamUrl(content.liveStreamUrl);
    if (typeof content.bgWallpaper === 'string') setBgWallpaper(content.bgWallpaper);
    if (typeof content.backgroundVideo === 'string') setBackgroundVideo(content.backgroundVideo);
    if (content.sectionWallpapers) setSectionWallpapers(content.sectionWallpapers);
    if (content.sectionPhotos) setSectionPhotos(content.sectionPhotos);
    if (content.peopleBySection) setPeopleBySection(content.peopleBySection);
    if (typeof content.heroCover === 'string') setHeroCover(content.heroCover);
    if (typeof content.badgeLogo === 'string') setBadgeLogo(content.badgeLogo);
    if (typeof content.timerCover === 'string') setTimerCover(content.timerCover);
    if (content.winners) setWinners(content.winners);
    if (typeof content.showWinnersOnHome === 'boolean') setShowWinnersOnHome(content.showWinnersOnHome);
    if (typeof content.winnerTopic === 'string') setWinnerTopic(content.winnerTopic);
    if (content.winnerTopicPlacement) setWinnerTopicPlacement(content.winnerTopicPlacement);
    if (typeof content.winnerDisplayCount === 'number') setWinnerDisplayCount(content.winnerDisplayCount);
    if (typeof content.postDisplayCount === 'number') setPostDisplayCount(content.postDisplayCount);
    if (typeof content.postGridColumns === 'number') setPostGridColumns(content.postGridColumns);
    if (typeof content.dailyVerseSi === 'string') setDailyVerseSi(content.dailyVerseSi);
    if (typeof content.dailyVerseMeaningSi === 'string') setDailyVerseMeaningSi(content.dailyVerseMeaningSi);
    if (typeof content.pujaMorning === 'string') setPujaMorning(content.pujaMorning);
    if (typeof content.pujaNoon === 'string') setPujaNoon(content.pujaNoon);
    if (typeof content.pujaEvening === 'string') setPujaEvening(content.pujaEvening);
    if (typeof content.pujaMorningImg === 'string') setPujaMorningImg(content.pujaMorningImg);
    if (typeof content.pujaNoonImg === 'string') setPujaNoonImg(content.pujaNoonImg);
    if (typeof content.pujaEveningImg === 'string') setPujaEveningImg(content.pujaEveningImg);
    if (content.musicTracks) {
      setMusicTracks(content.musicTracks);
      setActiveMusicId(content.musicTracks[0]?.id || '');
    }
    if (content.themes) setThemes(content.themes);
    if (typeof content.selectedThemeId === 'string') setSelectedThemeId(content.selectedThemeId);
    if (typeof content.loadingEnabled === 'boolean') setLoadingEnabled(content.loadingEnabled);
    if (typeof content.loadingDuration === 'number') {
      setLoadingDuration(content.welcomeThemeVersion === WELCOME_THEME_VERSION ? content.loadingDuration : DEFAULT_LOADING_DURATION_MS);
    }
    if (typeof content.loadingTextSi === 'string') setLoadingTextSi(content.loadingTextSi);
    if (typeof content.loadingTitleSi === 'string') setLoadingTitleSi(content.loadingTitleSi);
    if (typeof content.loadingSubtitleSi === 'string') setLoadingSubtitleSi(content.loadingSubtitleSi);
    if (typeof content.welcomeBackgroundColor === 'string') setWelcomeBackgroundColor(content.welcomeBackgroundColor);
    if (typeof content.welcomeAccentColor === 'string') setWelcomeAccentColor(content.welcomeAccentColor);
    if (typeof content.splashImage === 'string') setSplashImage(content.splashImage);
    if (typeof content.background3dEnabled === 'boolean') setBackground3dEnabled(content.background3dEnabled);
  };

  // Load Storage Configurations
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const savedCats = localStorage.getItem('temple_categories_v20');
    if (savedCats) setCategories(JSON.parse(savedCats));

    const savedPosts = localStorage.getItem('temple_posts_v20');
    if (savedPosts) setPosts(JSON.parse(savedPosts));

    const savedWinners = localStorage.getItem('temple_winners_v20');
    if (savedWinners) {
      const parsedWinners = JSON.parse(savedWinners);
      if (Array.isArray(parsedWinners)) setWinners(parsedWinners);
    }

    const savedPeople = localStorage.getItem('temple_people_v20');
    if (savedPeople) {
      const parsedPeople = JSON.parse(savedPeople);
      if (parsedPeople && typeof parsedPeople === 'object') setPeopleBySection(parsedPeople);
    }

    const savedPages = localStorage.getItem('temple_pages_v20');
    if (savedPages) setCustomPages(JSON.parse(savedPages));

    const savedWinnerSettings = localStorage.getItem('temple_winner_settings_v20');
    if (savedWinnerSettings) {
      const winnerSettings = JSON.parse(savedWinnerSettings);
      if (typeof winnerSettings.showWinnersOnHome === 'boolean') setShowWinnersOnHome(winnerSettings.showWinnersOnHome);
      if (winnerSettings.winnerTopic) setWinnerTopic(winnerSettings.winnerTopic);
      if (winnerSettings.winnerTopicPlacement) setWinnerTopicPlacement(winnerSettings.winnerTopicPlacement);
      if (winnerSettings.winnerDisplayCount) setWinnerDisplayCount(Number(winnerSettings.winnerDisplayCount));
    }

    const savedBranding = localStorage.getItem('temple_branding_v20');
    if (savedBranding) {
      const b = JSON.parse(savedBranding);
      if (b.nameSi) setTempleNameSi(b.nameSi);
      if (b.nameEn) setTempleNameEn(b.nameEn);
      if (b.locSi) setTempleLocationSi(b.locSi);
      if (b.locEn) setTempleLocationEn(b.locEn);
      if (b.ticker) setTickerText(b.ticker);
    }

    const savedEvent = localStorage.getItem('temple_event_v20');
    if (savedEvent) {
      const e = JSON.parse(savedEvent);
      if (e.titleSi) setEventTitleSi(e.titleSi);
      if (e.titleEn) setEventTitleEn(e.titleEn);
      if (e.date) setEventTargetDate(e.date);
      if (Array.isArray(e.upcomingEvents)) setUpcomingEvents(e.upcomingEvents);
    }

    const savedBank = localStorage.getItem('temple_bank_v20');
    if (savedBank) {
      const b = JSON.parse(savedBank);
      if (b.name) setBankName(b.name);
      if (b.accountName) setBankAccountName(b.accountName);
      if (b.accountNumber) setBankAccountNumber(b.accountNumber);
      if (b.branch) setBankBranch(b.branch);
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
      setBackgroundVideo(m.backgroundVideo || '');
      setSectionWallpapers(m.sectionWallpapers || {});
      setSectionPhotos(m.sectionPhotos || {});
      setHeroCover(m.heroCover || '');
      setBadgeLogo(m.badgeLogo || '');
      setTimerCover(m.timerCover || '');
      if (m.splashImage) setSplashImage(m.splashImage);
      setBackground3dEnabled(m.background3dEnabled !== false);
    }

    const savedSectionPhotos = localStorage.getItem('temple_section_photos_v20');
    if (savedSectionPhotos) {
      const parsed = JSON.parse(savedSectionPhotos);
      if (parsed && typeof parsed === 'object') setSectionPhotos(parsed);
    }

    const savedTheme = localStorage.getItem('temple_theme_v20');
    if (savedTheme) {
      const theme = JSON.parse(savedTheme);
      if (theme.themes?.length) setThemes(theme.themes);
      setSelectedThemeId(theme.selectedThemeId || 'temple-night');
      setLoadingEnabled(theme.loadingEnabled !== false);
      setLoadingDuration(theme.welcomeThemeVersion === WELCOME_THEME_VERSION
        ? Number(theme.loadingDuration) || DEFAULT_LOADING_DURATION_MS
        : DEFAULT_LOADING_DURATION_MS);
      setLoadingTextSi(theme.loadingTextSi || 'සාදරයෙන් පිළිගනිමු');
      setLoadingTitleSi(typeof theme.loadingTitleSi === 'string' ? theme.loadingTitleSi : DEFAULT_WELCOME_TITLE_SI);
      setLoadingSubtitleSi(typeof theme.loadingSubtitleSi === 'string' ? theme.loadingSubtitleSi : DEFAULT_WELCOME_SUBTITLE_SI);
      setWelcomeBackgroundColor(theme.welcomeBackgroundColor || DEFAULT_WELCOME_BACKGROUND);
      setWelcomeAccentColor(theme.welcomeAccentColor || DEFAULT_WELCOME_ACCENT);
      if (typeof theme.splashImage === 'string') setSplashImage(theme.splashImage);
    }

    const savedVerse = localStorage.getItem('temple_verse_v20');
    if (savedVerse) {
      const v = JSON.parse(savedVerse);
      if (v.verse) setDailyVerseSi(v.verse);
      if (v.meaning) setDailyVerseMeaningSi(v.meaning);
    }

    const savedPuja = localStorage.getItem('temple_puja_v20');
    if (savedPuja) {
      const p = JSON.parse(savedPuja);
      if (p.morning) setPujaMorning(p.morning);
      if (p.noon) setPujaNoon(p.noon);
      if (p.evening) setPujaEvening(p.evening);
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

    if (supabase) {
      let siteContentLoaded = false;
      void (async () => {
        const client = supabase;
        const { data: sessionData, error: sessionError } = await client.auth.getSession();
        if (sessionError) throw sessionError;
        let adminRole: AdminRole | null = null;
        if (sessionData.session) {
          adminRole = getAdminRole(sessionData.session.user);
          if (adminRole) {
            setIsAdmin(true);
            setCurrentRole(adminRole);
            setAdminEmail(sessionData.session.user.email || '');
          } else {
            const { error } = await client.auth.signOut();
            if (error) throw error;
          }
        }
        const { data: cloudRow, error: cloudError } = await client
          .from('site_content')
          .select('content')
          .eq('id', 'main')
          .maybeSingle();
        siteContentLoaded = !cloudError;
        if (cloudRow?.content) applySiteContent(cloudRow.content as SiteContent);
        if (cloudError) {
          setCloudSyncStatus('error');
          setCloudSyncError(cloudError.message);
        }
        const { data: galleryRows, error: galleryError } = await client
          .from('gallery')
          .select('id, title, category, image_url, description, page_key, created_at')
          .order('created_at', { ascending: false });
        if (adminRole === 'super_admin' || adminRole === 'dhamma_admin') {
          const { data: enrollmentRows, error: enrollmentError } = await client
            .from('student_enrollments')
            .select('*')
            .order('created_at', { ascending: false });
          if (enrollmentError) {
            setCloudSyncStatus('error');
            setCloudSyncError(enrollmentError.message);
          } else {
            setStudentEnrollments((enrollmentRows || []).map(row => ({
              id: row.id,
              studentName: row.student_name,
              guardianName: row.guardian_name,
              phone: row.phone,
              grade: row.grade,
              address: row.address,
              status: row.status,
              submittedAt: row.submitted_at,
            })));
          }
        }
        if (adminRole === 'super_admin') {
          const { data: slipRows, error: slipError } = await client
            .from('donation_slips')
            .select('*')
            .order('created_at', { ascending: false });
          if (slipError) {
            setCloudSyncStatus('error');
            setCloudSyncError(slipError.message);
          } else {
            const signedSlips = await Promise.all((slipRows || []).map(row => client.storage
              .from('donation-slips')
              .createSignedUrl(row.slip_image_path, 86400)));
            const signingError = signedSlips.find(result => result.error)?.error;
            if (signingError || signedSlips.some(result => !result.data)) {
              setCloudSyncStatus('error');
              setCloudSyncError(signingError?.message || 'Donation slip image URL was not returned.');
            } else {
              setDonationSlips((slipRows || []).map((row, index) => ({
                id: row.id,
                donorName: row.donor_name,
                amount: row.amount,
                phone: row.phone,
                slipImage: signedSlips[index].data!.signedUrl,
                status: row.status,
                submittedAt: row.submitted_at,
              } satisfies DonationSlip)));
            }
          }
        }
        if (!galleryError && galleryRows) {
          setGalleryItems(galleryRows.map(row => ({
            ...(row as GalleryItem),
            description: row.description || '',
            pageKey: row.page_key || 'all',
          })).slice(0, 100));
        } else if (galleryError) {
          setCloudSyncStatus('error');
          setCloudSyncError(galleryError.message);
        }
      })().catch(error => {
        setCloudSyncStatus('error');
        setCloudSyncError(error instanceof Error ? error.message : 'Could not load site settings.');
      }).finally(() => {
        cloudReadyRef.current = siteContentLoaded;
        setIsWelcomeSettingsReady(true);
      });
    } else {
      cloudReadyRef.current = true;
      setIsWelcomeSettingsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    const channel = client
      .channel('site-content-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'site_content', filter: 'id=eq.main' },
        payload => {
          const nextContent = payload.new?.content;
          if (nextContent && typeof nextContent === 'object') {
            applySiteContent(nextContent as SiteContent);
          }
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!isWelcomeSettingsReady || hasAutoStartedWelcomeRef.current) return;
    hasAutoStartedWelcomeRef.current = true;
    if (loadingEnabled) {
      loadingStartedAtRef.current = Date.now();
      setIsLoadingScreenVisible(true);
    }
  }, [isWelcomeSettingsReady, loadingEnabled]);

  useEffect(() => {
    if (!isWelcomeSettingsReady && !isWelcomePreviewForced) return;
    if ((!loadingEnabled && !isWelcomePreviewForced) || !isLoadingScreenVisible) {
      if (!loadingEnabled && !isWelcomePreviewForced) {
        loadingStartedAtRef.current = null;
        setIsLoadingScreenVisible(false);
      }
      return;
    }
    const now = Date.now();
    if (loadingStartedAtRef.current === null) loadingStartedAtRef.current = now;
    const deadline = loadingStartedAtRef.current + Math.max(1000, loadingDuration);
    const timer = window.setTimeout(() => {
      loadingStartedAtRef.current = null;
      setIsLoadingScreenVisible(false);
      setIsWelcomePreviewForced(false);
    }, Math.max(0, deadline - now));
    return () => window.clearTimeout(timer);
  }, [isWelcomeSettingsReady, loadingEnabled, loadingDuration, isLoadingScreenVisible, isWelcomePreviewForced]);
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
    setIsImageProcessing(false);
    setImageProcessingError('');
    setImgRotation(0);
    setImgBrightness(100);
    setImgContrast(100);
    setImgFlipH(false);
    setImgGrayscale(false);
    setCropX(0);
    setCropY(0);
    setCropWidth(100);
    setCropHeight(100);
  };

  const renderEditedImage = useCallback((img: HTMLImageElement, maxDimension: number) => {
    const cropLeft = Math.max(0, Math.min(img.width - 1, Math.round((cropX / 100) * img.width)));
    const cropTop = Math.max(0, Math.min(img.height - 1, Math.round((cropY / 100) * img.height)));
    const cropRight = Math.max(cropLeft + 1, Math.min(img.width, Math.round(((cropX + cropWidth) / 100) * img.width)));
    const cropBottom = Math.max(cropTop + 1, Math.min(img.height, Math.round(((cropY + cropHeight) / 100) * img.height)));
    const cropWidthPx = Math.max(1, cropRight - cropLeft);
    const cropHeightPx = Math.max(1, cropBottom - cropTop);
    const outputScale = Math.min(1, maxDimension / Math.max(cropWidthPx, cropHeightPx));

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = Math.max(1, Math.round(cropWidthPx * outputScale));
    croppedCanvas.height = Math.max(1, Math.round(cropHeightPx * outputScale));
    const croppedContext = croppedCanvas.getContext('2d');
    if (!croppedContext) throw new Error('Could not process this image.');
    croppedContext.filter = `brightness(${imgBrightness}%) contrast(${imgContrast}%) ${imgGrayscale ? 'grayscale(100%)' : ''}`;
    croppedContext.drawImage(img, cropLeft, cropTop, cropWidthPx, cropHeightPx, 0, 0, croppedCanvas.width, croppedCanvas.height);

    const isRotated = imgRotation % 180 !== 0;
    const canvas = document.createElement('canvas');
    canvas.width = isRotated ? croppedCanvas.height : croppedCanvas.width;
    canvas.height = isRotated ? croppedCanvas.width : croppedCanvas.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not process this image.');
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate((imgRotation * Math.PI) / 180);
    context.scale(imgFlipH ? -1 : 1, 1);
    context.drawImage(croppedCanvas, -croppedCanvas.width / 2, -croppedCanvas.height / 2);
    return canvas;
  }, [cropX, cropY, cropWidth, cropHeight, imgRotation, imgBrightness, imgContrast, imgFlipH, imgGrayscale]);

  useEffect(() => {
    if (!rawImageForEdit) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const rendered = renderEditedImage(img, 600);
        const preview = imageEditorPreviewRef.current;
        if (!preview) return;
        preview.width = rendered.width;
        preview.height = rendered.height;
        const context = preview.getContext('2d');
        if (!context) throw new Error('Could not show this image preview.');
        context.drawImage(rendered, 0, 0);
        setImageProcessingError('');
      } catch (error) {
        setImageProcessingError(error instanceof Error ? error.message : 'Could not show this image preview.');
      }
    };
    img.onerror = () => setImageProcessingError('Could not load this image for preview.');
    img.src = rawImageForEdit;
  }, [rawImageForEdit, renderEditedImage]);

  const applyImageEdits = () => {
    if (!rawImageForEdit || !onImageEditedCallback) return;
    setIsImageProcessing(true);
    setImageProcessingError('');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = renderEditedImage(img, 960);
        const processedBase64 = canvas.toDataURL('image/jpeg', 0.75);
        void (async () => {
          try {
            if (!supabase) throw new Error('Supabase is not configured. Image upload is unavailable.');
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;
            if (!sessionData.session) throw new Error('Admin login is required to upload images.');
            const imageBlob = await fetch(processedBase64).then(response => response.blob());
            const filePath = `admin/${crypto.randomUUID()}.jpg`;
            const { error: uploadError } = await supabase.storage
              .from('temple-media')
              .upload(filePath, imageBlob, { contentType: 'image/jpeg', upsert: false });
            if (uploadError) throw uploadError;
            const imageUrl = supabase.storage.from('temple-media').getPublicUrl(filePath).data.publicUrl;
            onImageEditedCallback(imageUrl);
            setRawImageForEdit(null);
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Image upload failed.';
            setImageProcessingError(message);
            setCloudSyncError(message);
            setCloudSyncStatus('error');
          } finally {
            setIsImageProcessing(false);
          }
        })();
      } catch (error) {
        setImageProcessingError(error instanceof Error ? error.message : 'Could not process this image.');
        setIsImageProcessing(false);
      }
    };
    img.onerror = () => {
      setImageProcessingError('Could not read this image. Please choose another file.');
      setIsImageProcessing(false);
    };
    img.src = rawImageForEdit;
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

  const handleBackgroundVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!['video/mp4', 'video/webm'].includes(file.type)) return alert('MP4 හෝ WebM video file එකක් තෝරන්න.');
    if (file.size > 25 * 1024 * 1024) return alert('Video file එක 25 MB ට වඩා කුඩා විය යුතුයි.');

    const previewUrl = URL.createObjectURL(file);
    let duration: number;
    try {
      duration = await new Promise<number>((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => resolve(video.duration);
        video.onerror = () => reject(new Error('Video file එක කියවීමට නොහැක.'));
        video.src = previewUrl;
      });
    } catch (error) {
      return alert(error instanceof Error ? error.message : 'Video file එක කියවීමට නොහැක.');
    } finally {
      URL.revokeObjectURL(previewUrl);
    }
    if (duration > 5.05) return alert('Background video එක තත්පර 5ක් හෝ ඊට අඩු විය යුතුයි.');
    if (!supabase) return alert('Video upload සඳහා Supabase සම්බන්ධතාවය සකසන්න.');

    setBackgroundVideoUploadStatus('Video upload වෙමින්...');
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error('Video upload කිරීමට admin login වන්න.');
      const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'mp4';
      const filePath = `backgrounds/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from('temple-media').upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;
      setBackgroundVideo(supabase.storage.from('temple-media').getPublicUrl(filePath).data.publicUrl);
      setBackgroundVideoUploadStatus('5-second video එක සුරකින ලදී.');
    } catch (error) {
      setBackgroundVideoUploadStatus('');
      alert(error instanceof Error ? error.message : 'Video upload අසාර්ථකයි.');
    }
  };

  // Auth & Permissions Check
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = adminEmail.trim();
    if (!supabase) {
      alert('Admin login is unavailable because Supabase is not configured.');
      return;
    }

    if (!trimmedEmail) {
      alert('Admin login සඳහා email ලිපිනයක් ඇතුළත් කරන්න.');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail.toLowerCase(),
      password: inputPassword,
    });

    if (!error) {
      const role = getAdminRole(data.user);
      if (!role) {
        const { error: signOutError } = await supabase.auth.signOut();
        alert(signOutError
          ? `මෙම ගිණුමට admin permission එකක් ලබා දී නැත. Logout වීමත් අසාර්ථකයි: ${signOutError.message}`
          : 'මෙම ගිණුමට admin permission එකක් ලබා දී නැත. Supabase App Metadata හි admin_role එක සකසන්න.');
        return;
      }
      setIsAdmin(true);
      setCurrentRole(role);
      setShowLoginModal(false);
      setInputPassword('');
      return;
    }
    alert(`Login failed: ${error.message}`);
  };

  const finishAdminLogout = async (reloadPage = false) => {
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        alert(`Logout අසාර්ථකයි: ${error.message}`);
        return;
      }
    }
    setIsAdmin(false);
    setCurrentRole('super_admin');
    setAdminEmail('');
    setInputPassword('');
    setShowExitConfirmation(false);
    if (reloadPage) {
      allowPageUnloadRef.current = true;
      window.location.reload();
    }
  };

  const canAccess = (feature: 'general' | 'gallery' | 'roles' | 'posts' | 'pages' | 'slips' | 'students' | 'winners') => {
    if (!isAdmin) return false;
    if (currentRole === 'super_admin') return true;
    if (currentRole === 'editor') return ['posts', 'pages', 'general', 'gallery'].includes(feature);
    if (currentRole === 'dhamma_admin') return ['posts', 'pages', 'students', 'winners', 'general', 'gallery'].includes(feature);
    return false;
  };

  const saveCategory = () => {
    if (!categorySi || !categoryEn) {
      alert('කාණ්ඩයේ නම සහ ඉංග්‍රීසි නම ඇතුළත් කරන්න.');
      return;
    }

    let updated: Category[];
    if (editingCategoryId) {
      updated = categories.map(c => c.id === editingCategoryId ? { ...c, labelSi: categorySi, labelEn: categoryEn, icon: categoryIcon || '📌', showOnHome: categoryShowOnHome } : c);
      setEditingCategoryId(null);
    } else {
      updated = [...categories, { id: `cat_${crypto.randomUUID()}`, labelSi: categorySi, labelEn: categoryEn, icon: categoryIcon || '📌', showOnHome: categoryShowOnHome }];
    }

    setCategories(updated);
    cancelCategoryEdit();
  };

  const editCategory = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setCategorySi(cat.labelSi);
    setCategoryEn(cat.labelEn);
    setCategoryIcon(cat.icon);
    setCategoryShowOnHome(cat.showOnHome !== false);
  };

  const deleteCategory = (id: string) => {
    if (!confirm('මෙම කාණ්ඩය මකා දැමීමට අවශ්‍යද?')) return;
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    if (activeTab === id) setActiveTab('history');
  };

  const cancelCategoryEdit = () => {
    setEditingCategoryId(null);
    setCategorySi('');
    setCategoryEn('');
    setCategoryIcon('📌');
    setCategoryShowOnHome(true);
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

  const persistPosts = (updated: Post[]) => {
    setPosts(updated);
    return true;
  };

  // Post Handlers
  const savePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitleSi || !postDescSi) return alert('මාතෘකාව සහ විස්තරය ඇතුළත් කිරීම අනිවාර්ය වේ.');

    if (editingPostId) {
      const updated = posts.map(p => p.id === editingPostId ? {
        ...p, category: postCat, topic: postTopic.trim() || postTitleSi, showOnHome: postShowOnHome, titleSi: postTitleSi, titleEn: postTitleEn || postTitleSi, descriptionSi: postDescSi, descriptionEn: postDescEn || postDescSi, image: postImg, youtubeUrl: postYt, status: postStatus
      } : p);
      if (!persistPosts(updated)) return;
    } else {
      const updated: Post[] = [{
        id: `post_${crypto.randomUUID()}`,
        category: postCat,
        topic: postTopic.trim() || postTitleSi,
        showOnHome: postShowOnHome,
        titleSi: postTitleSi,
        titleEn: postTitleEn || postTitleSi,
        descriptionSi: postDescSi,
        descriptionEn: postDescEn || postDescSi,
        image: postImg,
        youtubeUrl: postYt,
        status: postStatus,
        createdAt: new Date().toLocaleDateString('si-LK'),
      }, ...posts];
      if (!persistPosts(updated)) return;
    }
    cancelPostEdit();
    alert('වෙනස්කම් සකස් කළා. වෙබ් අඩවියේ පෙන්වීමට Admin dashboard එකේ Save website changes ඔබන්න.');
  };

  const cancelPostEdit = () => {
    setEditingPostId(null);
    setPostTopic(''); setPostShowOnHome(true); setPostTitleSi(''); setPostTitleEn(''); setPostDescSi(''); setPostDescEn(''); setPostImg(''); setPostYt(''); setPostStatus('published');
  };

  const deletePost = (id: string) => {
    if (confirm('මෙම ලිපිය පද්ධතියෙන් මකා දැමීමට තහවුරු කරන්න?')) {
      const updated = posts.filter(p => p.id !== id);
      setPosts(updated);
    }
  };

  const resetWinnerForm = () => {
    setEditingWinnerId(null);
    setWinnerName('');
    setWinnerAchievement('');
    setWinnerPlace('');
    setWinnerGrade('');
    setWinnerYear(String(new Date().getFullYear()));
    setWinnerImage('');
  };

  const resetPeopleForm = () => {
    setEditingPersonId(null);
    setPersonSection('');
    setPersonShowOnHome(true);
    setPersonPageKey('');
    setPersonName('');
    setPersonRole('');
    setPersonImage('');
    setPersonDescription('');
  };

  const movePersonCard = (section: string, index: number, direction: -1 | 1) => {
    const nextPeopleBySection = {
      ...peopleBySection,
      [section]: moveItem(peopleBySection[section] || [], index, direction),
    };
    setPeopleBySection(nextPeopleBySection);
  };

  const moveWinnerCard = (index: number, direction: -1 | 1) => {
    const nextWinners = moveItem(winners, index, direction);
    setWinners(nextWinners);
  };

  const savePersonCard = (e: React.FormEvent) => {
    e.preventDefault();
    const section = personSection.trim();
    if (!section || !personName.trim() || !personRole.trim() || !personImage) {
      return alert('අංශයේ නම, නම, පිහිටීම/භූමිකාව සහ ඡායාරූපය ඇතුළත් කරන්න.');
    }

    const person: PeopleCard = {
      id: editingPersonId || `person_${crypto.randomUUID()}`,
      name: personName.trim(),
      role: personRole.trim(),
      image: personImage,
      description: personDescription.trim(),
      section,
      showOnHome: personShowOnHome,
      pageKey: personPageKey || undefined,
    };

    const nextPeopleBySection = Object.fromEntries(
      Object.entries(peopleBySection).map(([key, items]) => [
        key,
        editingPersonId ? items.filter(item => item.id !== editingPersonId) : items,
      ]),
    ) as Record<string, PeopleCard[]>;
    nextPeopleBySection[section] = [person, ...(nextPeopleBySection[section] || [])];
    setPeopleBySection(nextPeopleBySection);
    setPeopleBySection(nextPeopleBySection);
    resetPeopleForm();
  };

  const editPersonCard = (person: PeopleCard) => {
    setEditingPersonId(person.id);
    setPersonSection(person.section);
    setPersonShowOnHome(person.showOnHome !== false);
    setPersonPageKey(person.pageKey || '');
    setPersonName(person.name);
    setPersonRole(person.role);
    setPersonImage(person.image);
    setPersonDescription(person.description);
  };

  const deletePersonCard = (id: string, section: string) => {
    if (!confirm('මෙම person card එක මකා දැමීමට අවශ්‍යද?')) return;
    const nextList = (peopleBySection[section] || []).filter(person => person.id !== id);
    setPeopleBySection(current => ({ ...current, [section]: nextList }));
    if (editingPersonId === id) resetPeopleForm();
  };

  const saveWinner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!winnerName.trim() || !winnerAchievement.trim() || !winnerImage) {
      return alert('ජයග්‍රාහකයාගේ නම, ජයග්‍රහණය සහ ඡායාරූපය ඇතුළත් කරන්න.');
    }

    const winner: DhammaWinner = {
      id: editingWinnerId || `winner_${crypto.randomUUID()}`,
      name: winnerName.trim(),
      achievement: winnerAchievement.trim(),
      place: winnerPlace.trim(),
      grade: winnerGrade.trim(),
      year: winnerYear.trim(),
      image: winnerImage,
    };

    const nextWinners = editingWinnerId
      ? winners.map(item => item.id === editingWinnerId ? winner : item)
      : [winner, ...winners];
    setWinners(nextWinners);
    setWinners(nextWinners);
    resetWinnerForm();
  };

  const editWinner = (winner: DhammaWinner) => {
    setEditingWinnerId(winner.id);
    setWinnerName(winner.name);
    setWinnerAchievement(winner.achievement);
    setWinnerPlace(winner.place || '');
    setWinnerGrade(winner.grade);
    setWinnerYear(winner.year);
    setWinnerImage(winner.image);
  };

  const deleteWinner = (id: string) => {
    if (!confirm('මෙම ජයග්‍රාහකයාගේ තොරතුරු මකා දමන්නද?')) return;
    const nextWinners = winners.filter(winner => winner.id !== id);
    setWinners(nextWinners);
    if (editingWinnerId === id) resetWinnerForm();
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
        logoImage: pageLogo,
      } : p);
      setCustomPages(updated);
      alert('පිටුවේ වෙනස්කම් සකස් කළා. වෙබ් අඩවියේ පෙන්වීමට Admin dashboard එකේ Save website changes ඔබන්න.');
    } else {
      const newPage: CustomPage = {
        id: `page_${crypto.randomUUID()}`,
        titleSi: pageTitleSi,
        titleEn: pageTitleEn || pageTitleSi,
        contentSi: pageContentSi,
        contentEn: pageContentEn || pageContentSi,
        bannerImage: pageBanner,
        logoImage: pageLogo,
      };
      const updated = [...customPages, newPage];
      setCustomPages(updated);
      alert('නව පිටුව සකස් කළා. වෙබ් අඩවියේ පෙන්වීමට Admin dashboard එකේ Save website changes ඔබන්න.');
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
    setPageLogo(page.logoImage || '');
    setAdminSubTab('pages');
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const cancelPageEdit = () => {
    setEditingPageId(null);
    setPageTitleSi(''); setPageTitleEn(''); setPageContentSi(''); setPageContentEn(''); setPageBanner(''); setPageLogo('');
  };

  const deleteCustomPage = (id: string) => {
    if (confirm('මෙම පිටුව මකා දැමීමට අවශ්‍යද?')) {
      const updated = customPages.filter(p => p.id !== id);
      setCustomPages(updated);
      if (activeTab === id) setActiveTab('history');
    }
  };

  // Save General Settings
  const saveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !isAdmin) return alert('සැකසුම් Supabase එකට save කිරීමට admin login සහ cloud සම්බන්ධතාවය අවශ්‍යයි.');
    void saveSiteContent();
  };

  const resetWelcomeTheme = () => {
    setLoadingEnabled(true);
    setLoadingDuration(DEFAULT_LOADING_DURATION_MS);
    setLoadingTextSi(DEFAULT_WELCOME_GREETING_SI);
    setLoadingTitleSi(DEFAULT_WELCOME_TITLE_SI);
    setLoadingSubtitleSi(DEFAULT_WELCOME_SUBTITLE_SI);
    setWelcomeBackgroundColor(DEFAULT_WELCOME_BACKGROUND);
    setWelcomeAccentColor(DEFAULT_WELCOME_ACCENT);
    setSplashImage('/temple-logo.svg');
  };

  const previewWelcomeTheme = () => {
    loadingStartedAtRef.current = Date.now();
    setIsWelcomePreviewForced(true);
    setIsLoadingScreenVisible(true);
  };

  const addTheme = () => {
    if (!themeName.trim()) return alert('Theme නමක් ඇතුළත් කරන්න.');
    const theme: SiteTheme = {
      id: `theme_${crypto.randomUUID()}`,
      name: themeName.trim(),
      background: themeBackground,
      accent: themeAccent,
      text: themeText,
    };
    setThemes(current => [...current, theme]);
    setSelectedThemeId(theme.id);
    setThemeName('');
  };

  const deleteTheme = (id: string) => {
    if (DEFAULT_THEMES.some(theme => theme.id === id)) return alert('Default theme මකා දැමිය නොහැක.');
    setThemes(current => current.filter(theme => theme.id !== id));
    if (selectedThemeId === id) setSelectedThemeId(DEFAULT_THEMES[0].id);
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

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!supabase) return alert('Audio upload සඳහා Supabase සම්බන්ධතාවය අවශ්‍යයි.');
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData.session) throw new Error('Audio upload කිරීමට admin login වන්න.');
      const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'mp3';
      const filePath = `music/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from('temple-media').upload(filePath, file, {
        contentType: file.type || 'audio/mpeg',
        upsert: false,
      });
      if (error) throw error;
      setMusicUrl(supabase.storage.from('temple-media').getPublicUrl(filePath).data.publicUrl);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Audio upload failed.');
    }
  };

  const resetGalleryForm = () => {
    setEditingGalleryId(null);
    setGalleryTitle('');
    setGalleryCategory('');
    setGalleryDescription('');
    setGalleryPageKey('all');
    setGalleryImage('');
  };

  const saveGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return alert('Gallery manage කිරීමට admin login අවශ්‍යයි.');
    if (!supabase) return alert('Gallery changes require a Supabase connection.');
    if (!galleryTitle.trim() || !galleryImage) return alert('Title සහ image එක ඇතුළත් කරන්න.');

    if (!editingGalleryId && galleryItems.length >= 100) {
      alert('ඡායාරූප 100ක් දක්වා පමණක් එකතු කළ හැක.');
      return;
    }

    const values = {
      title: galleryTitle.trim(),
      category: galleryCategory.trim() || null,
      image_url: galleryImage,
      description: galleryDescription.trim(),
      page_key: galleryPageKey || 'all',
    };
    const client = supabase;
    const dbValues = values;
    const result = editingGalleryId
      ? await client.from('gallery').update(dbValues).eq('id', editingGalleryId).select().single()
      : await client.from('gallery').insert(dbValues).select().single();
    if (result.error || !result.data) {
      alert(`Gallery save failed: ${result.error?.message || 'Unknown error'}`);
      return;
    }
    const savedItem: GalleryItem = {
      ...(result.data as GalleryItem),
      description: values.description,
      pageKey: values.page_key,
    };

    const updatedGallery = editingGalleryId
      ? galleryItems.map(item => item.id === savedItem.id ? savedItem : item)
      : [savedItem, ...galleryItems].slice(0, 100);
    setGalleryItems(updatedGallery);
    resetGalleryForm();
  };

  const editGalleryItem = (item: GalleryItem) => {
    setEditingGalleryId(item.id);
    setGalleryTitle(item.title);
    setGalleryCategory(item.category || '');
    setGalleryDescription(item.description || '');
    setGalleryPageKey(item.pageKey || 'all');
    setGalleryImage(item.image_url);
    setAdminSubTab('gallery');
  };

  const deleteGalleryItem = async (id: number) => {
    if (!isAdmin || !confirm('මෙම photo එක gallery එකෙන් මකා දමන්නද?')) return;
    if (!supabase) return alert('Gallery changes require a Supabase connection.');
    const { error } = await supabase.from('gallery').delete().eq('id', id);
    if (error) {
      alert(`Gallery delete failed: ${error.message}`);
      return;
    }
    const updatedGallery = galleryItems.filter(item => item.id !== id);
    setGalleryItems(updatedGallery);
    if (editingGalleryId === id) resetGalleryForm();
  };

  // Donation Slips Status Update
  const updateSlipStatus = async (id: string, status: 'approved' | 'rejected') => {
    if (!isAdmin || !canAccess('slips') || !supabase) return alert('මෙම ක්‍රියාවට admin permission සහ Supabase සම්බන්ධතාවය අවශ්‍යයි.');
    const { data, error } = await supabase.from('donation_slips').update({ status }).eq('id', id).select('id').single();
    if (error || !data) return alert(`රිසිට්පතේ තත්ත්වය cloud එකට සුරැකිය නොහැක: ${error?.message || 'Record not found.'}`);
    const updated = donationSlips.map(s => s.id === id ? { ...s, status } : s);
    setDonationSlips(updated);
  };

  // Student Enrollment Status Update
  const updateEnrollmentStatus = async (id: string, status: 'approved' | 'rejected') => {
    if (!isAdmin || !canAccess('students') || !supabase) return alert('මෙම ක්‍රියාවට admin permission සහ Supabase සම්බන්ධතාවය අවශ්‍යයි.');
    const { data, error } = await supabase.from('student_enrollments').update({ status }).eq('id', id).select('id').single();
    if (error || !data) return alert(`ලියාපදිංචි තත්ත්වය cloud එකට සුරැකිය නොහැක: ${error?.message || 'Record not found.'}`);
    const updated = studentEnrollments.map(s => s.id === id ? { ...s, status } : s);
    setStudentEnrollments(updated);
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
  const handleDonationSlipFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return alert('JPG, PNG හෝ WebP රිසිට්පතක් තෝරන්න.');
    }
    if (file.size > 5 * 1024 * 1024) return alert('රිසිට්පත 5 MB ට වඩා කුඩා විය යුතුයි.');
    const reader = new FileReader();
    reader.onerror = () => alert('රිසිට්පත කියවීමට නොහැකි විය. නැවත උත්සාහ කරන්න.');
    reader.onload = () => {
      if (typeof reader.result === 'string') setDonorSlipImg(reader.result);
      else alert('රිසිට්පත කියවීමට නොහැකි විය. නැවත උත්සාහ කරන්න.');
    };
    reader.readAsDataURL(file);
  };

  const submitDonationSlip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName || !donorPhone || !donorSlipImg) return alert('කරුණාකර සියලු විස්තර සහ රිසිට්පත ඇතුළත් කරන්න.');
    if (!supabase) return alert('රිසිට්පත යැවීමට Supabase සම්බන්ධතාවය සකසා තිබිය යුතුයි.');
    const client = supabase;
    let filePath = '';
    try {
      const imageBlob = await fetch(donorSlipImg).then(response => response.blob());
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(imageBlob.type)) {
        throw new Error('JPG, PNG හෝ WebP රිසිට්පතක් තෝරන්න.');
      }
      if (imageBlob.size > 5 * 1024 * 1024) throw new Error('රිසිට්පත 5 MB ට වඩා කුඩා විය යුතුයි.');
      const extension = imageBlob.type.split('/')[1];
      filePath = `submissions/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await client.storage
        .from('donation-slips')
        .upload(filePath, imageBlob, { contentType: imageBlob.type, upsert: false });
      if (uploadError) throw uploadError;
    } catch (error) {
      return alert(error instanceof Error ? error.message : 'රිසිට්පත upload කළ නොහැක.');
    }

    const newSlip: DonationSlip = {
      id: crypto.randomUUID(),
      donorName,
      amount: donorAmount || 'නොදක්වා ඇත',
      phone: donorPhone,
      slipImage: donorSlipImg,
      status: 'pending',
      submittedAt: new Date().toLocaleDateString('si-LK'),
    };
    const { error } = await client.from('donation_slips').insert({
      id: newSlip.id,
      donor_name: newSlip.donorName,
      amount: newSlip.amount,
      phone: newSlip.phone,
      slip_image_path: filePath,
      status: newSlip.status,
      submitted_at: newSlip.submittedAt,
    });
    if (error) {
      const { error: cleanupError } = await client.storage.from('donation-slips').remove([filePath]);
      return alert(cleanupError
        ? `රිසිට්පත සුරැකීම අසාර්ථකයි: ${error.message}. Upload cleanup අසාර්ථකයි: ${cleanupError.message}`
        : `රිසිට්පත සුරැකීම අසාර්ථකයි: ${error.message}`);
    }
    setDonationSlips(current => [newSlip, ...current]);
    alert('ඔබගේ බැංකු රිසිට්පත සාර්ථකව යොමු කෙරිණි!');
    setDonorName(''); setDonorAmount(''); setDonorPhone(''); setDonorSlipImg(''); setShowDonateModal(false);
  };

  // Student Enrollment Handler
  const submitStudentEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentPhone) return alert('ශිෂ්‍යයාගේ නම සහ දුරකථන අංකය ඇතුළත් කරන්න.');
    if (!supabase) return alert('අයදුම්පත යැවීමට Supabase සම්බන්ධතාවය සකසා තිබිය යුතුයි.');
    const newEnrollment: StudentEnrollment = {
      id: crypto.randomUUID(),
      studentName,
      guardianName,
      phone: studentPhone,
      grade: studentGrade,
      address: studentAddress,
      status: 'pending',
      submittedAt: new Date().toLocaleDateString('si-LK'),
    };
    const { error } = await supabase.from('student_enrollments').insert({
      id: newEnrollment.id,
      student_name: newEnrollment.studentName,
      guardian_name: newEnrollment.guardianName,
      phone: newEnrollment.phone,
      grade: newEnrollment.grade,
      address: newEnrollment.address,
      status: newEnrollment.status,
      submitted_at: newEnrollment.submittedAt,
    });
    if (error) return alert(`අයදුම්පත cloud එකට යැවිය නොහැක: ${error.message}`);
    setStudentEnrollments(current => [newEnrollment, ...current]);
    alert('දහම් පාසල් ලියාපදිංචි වීමේ අයදුම්පත සාර්ථකව භාරගන්නා ලදී!');
    setStudentName(''); setGuardianName(''); setStudentPhone(''); setStudentAddress(''); setShowEnrollModal(false);
  };

  // Filters
  const activeCategory = categories.find(c => c.id === activeTab);
  const activeCustomPage = customPages.find(p => p.id === activeTab);
  const activeSectionIcon = activeCategory?.icon || '📄';
  const activeSectionTitleSi = activeCategory?.labelSi || activeCustomPage?.titleSi || '';
  const activeSectionTitleEn = activeCategory?.labelEn || activeCustomPage?.titleEn || '';

  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      const matchTab = p.category === activeTab;
      const matchSearch = p.titleSi.toLowerCase().includes(searchTerm.toLowerCase()) || p.descriptionSi.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = isAdmin ? true : p.status === 'published';
      const matchHomeVisibility = isAdmin ? true : p.showOnHome !== false;
      return matchTab && matchSearch && matchStatus && matchHomeVisibility;
    });
  }, [posts, activeTab, searchTerm, isAdmin]);

  const visiblePosts = filteredPosts.slice(0, postDisplayCount);
  const visibleWinners = winners.slice(0, winnerDisplayCount);
  const winnerSectionPhotos = (sectionPhotos.winners || []).slice(0, 5);
  const normalizeSectionPhotoList = (value: string) => value.split(/\n|,/).map(item => item.trim()).filter(Boolean).slice(0, 8);
  const handleSectionPhotoUpload = (sectionKey: SectionPhotoKey, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('කරුණාකර image file එකක් තෝරන්න.');
      return;
    }
    if ((sectionPhotos[sectionKey] || []).length >= 8) {
      alert('මෙම section එකට photos 8ක් දැනටමත් එකතු කර ඇත.');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => alert('මෙම photo එක කියවීමට නොහැකි විය. වෙනත් photo එකක් උත්සාහ කරන්න.');
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        alert('මෙම photo එක කියවීමට නොහැකි විය. වෙනත් photo එකක් උත්සාහ කරන්න.');
        return;
      }
      openImageEditor(reader.result, url => {
        setSectionPhotos(current => ({
          ...current,
          [sectionKey]: normalizeSectionPhotoList([...(current[sectionKey] || []), url].join('\n')),
        }));
      });
    };
    reader.readAsDataURL(file);
  };
  const sectionPhotoConfig = useMemo(() => {
    const builtIn = [
      { key: 'winners' as const, label: 'Winners / Main page' },
      { key: 'dhamma' as const, label: 'Dhamma school' },
      { key: 'countdown' as const, label: 'Countdown / events' },
      { key: 'puja' as const, label: 'Puja / worship' },
      { key: 'posts' as const, label: 'Posts / articles' },
    ];
    const categoryExtras = categories.map(cat => ({
      key: cat.id as SectionPhotoKey,
      label: `${cat.labelSi} / ${cat.labelEn}`,
    }));
    return [...builtIn, ...categoryExtras.filter(item => !builtIn.some(existing => existing.key === item.key))];
  }, [categories]);
  const renderSectionPhotoStrip = (photos: string[], className = '') => {
    if (!photos.length) return null;
    const gridColumnsClass = [
      'grid-cols-1',
      'grid-cols-2',
      'grid-cols-3',
      'grid-cols-3 sm:grid-cols-4',
      'grid-cols-3 sm:grid-cols-4 lg:grid-cols-5',
    ][Math.min(photos.length, 5) - 1];
    return (
      <div className={`grid ${gridColumnsClass} gap-2 ${className}`}>
        {photos.slice(0, 5).map((photo, index) => (
          <div key={`${photo}-${index}`} className="overflow-hidden rounded-2xl border border-amber-500/20 bg-slate-900 shadow-lg">
            <SiteImage src={photo} alt="Section gallery" loading="lazy" decoding="async" className="h-16 w-full bg-slate-950 object-contain sm:h-24" onClick={() => setLightboxImage(photo)} />
          </div>
        ))}
      </div>
    );
  };

  const peopleSectionLabels: Record<string, string> = {
    leaders: 'Leaders',
    winners: 'Winners',
    characters: 'Characters',
  };

  const renderPeopleCards = (section: string, placement: 'home' | 'page', pageKey?: string, compact = false) => {
    const people = (peopleBySection[section] || []).filter(person =>
      placement === 'home' ? person.showOnHome !== false : person.pageKey === pageKey,
    );
    if (!people.length) return null;

    return (
      <div key={`${placement}-${section}-${pageKey || ''}`} className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-xl font-black text-amber-300">{peopleSectionLabels[section] || section}</h3>
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-200">{people.length} item(s)</span>
        </div>
        <div className={`grid gap-2 sm:gap-4 ${people.length === 1 ? 'grid-cols-1' : people.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} ${compact ? 'sm:grid-cols-2 xl:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
          {people.map((person) => (
            <article key={person.id} className="overflow-hidden rounded-3xl border border-amber-500/20 bg-slate-950/70 shadow-lg">
              <div className="flex h-20 justify-center overflow-hidden sm:h-28">
                <div className="relative h-full w-20 overflow-hidden rounded-xl bg-slate-900 sm:w-24">
                  <SiteImage src={person.image} alt={person.name} loading="lazy" decoding="async" className="h-full w-full object-contain" />
                </div>
              </div>
              <div className="space-y-1 p-2 sm:space-y-2 sm:p-4">
                <span className="inline-flex max-w-full rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-1 text-[8px] font-black uppercase text-amber-200 sm:px-2 sm:text-[10px] sm:tracking-[0.18em]">{person.role}</span>
                <h4 className="line-clamp-2 text-xs font-black text-white sm:text-lg">{person.name}</h4>
                {person.description && <p className="line-clamp-3 text-[10px] leading-relaxed text-slate-300 sm:text-xs">{person.description}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  };

  const filteredSlips = useMemo(() => {
    if (slipFilter === 'all') return donationSlips;
    return donationSlips.filter(s => s.status === slipFilter);
  }, [donationSlips, slipFilter]);

  const filteredStudents = useMemo(() => {
    if (studentFilter === 'all') return studentEnrollments;
    return studentEnrollments.filter(s => s.status === studentFilter);
  }, [studentEnrollments, studentFilter]);

  const selectedTheme = themes.find(theme => theme.id === selectedThemeId) || DEFAULT_THEMES[0];

  const visibleUpcomingEvents = useMemo(() => {
    return [...upcomingEvents]
      .filter(event => event.date && event.titleSi.trim())
      .sort((first, second) => first.date.localeCompare(second.date))
      .slice(0, 4);
  }, [upcomingEvents]);

  const allUpcomingEvents = useMemo(() => {
    return [...upcomingEvents]
      .filter(event => event.date && event.titleSi.trim())
      .sort((first, second) => first.date.localeCompare(second.date));
  }, [upcomingEvents]);

  const hiddenUpcomingEventCount = Math.max(0, upcomingEvents.length - visibleUpcomingEvents.length);

  const activePageGallery = galleryItems
    .filter(item => !item.pageKey || item.pageKey === 'all' || item.pageKey === activeTab)
    .slice(0, 100);

  const saveWelcomeThemeSettings = () => {
    if (!supabase || !isAdmin) return alert('Welcome theme එක Supabase එකට save කිරීමට admin login සහ cloud සම්බන්ධතාවය අවශ්‍යයි.');
    void saveSiteContent();
  };

  const siteContent = useMemo<SiteContent>(() => ({
    categories,
    galleryItems,
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
    upcomingEvents,
    bankName,
    bankAccountName,
    bankAccountNumber,
    bankBranch,
    isLiveStreaming,
    liveStreamUrl,
    bgWallpaper,
    backgroundVideo,
    sectionWallpapers,
    sectionPhotos,
    heroCover,
    badgeLogo,
    timerCover,
    winners,
    peopleBySection,
    showWinnersOnHome,
    winnerTopic,
    winnerTopicPlacement,
    winnerDisplayCount,
    postDisplayCount,
    postGridColumns,
    dailyVerseSi,
    dailyVerseMeaningSi,
    pujaMorning,
    pujaNoon,
    pujaEvening,
    pujaMorningImg,
    pujaNoonImg,
    pujaEveningImg,
    musicTracks,
    themes,
    selectedThemeId,
    loadingEnabled,
    loadingDuration,
    welcomeThemeVersion: WELCOME_THEME_VERSION,
    loadingTextSi,
    loadingTitleSi,
    loadingSubtitleSi,
    welcomeBackgroundColor,
    welcomeAccentColor,
    splashImage,
    background3dEnabled,
  }), [
    categories, galleryItems, customPages, posts, templeNameSi, templeNameEn, templeLocationSi,
    templeLocationEn, tickerText, eventTitleSi, eventTitleEn, eventTargetDate, upcomingEvents,
    bankName, bankAccountName, bankAccountNumber, bankBranch, isLiveStreaming,
    liveStreamUrl, bgWallpaper, backgroundVideo, sectionWallpapers, sectionPhotos, heroCover, badgeLogo, timerCover,
    winners, peopleBySection, showWinnersOnHome, winnerTopic, winnerTopicPlacement, winnerDisplayCount,
    postDisplayCount, postGridColumns, dailyVerseSi,
    dailyVerseMeaningSi, pujaMorning, pujaNoon, pujaEvening, pujaMorningImg,
    pujaNoonImg, pujaEveningImg, musicTracks, themes, selectedThemeId,
    loadingEnabled, loadingDuration, loadingTextSi, loadingTitleSi, loadingSubtitleSi,
    welcomeBackgroundColor, welcomeAccentColor, splashImage, background3dEnabled,
  ]);

  const currentSiteContentSnapshot = useMemo(() => JSON.stringify(siteContent), [siteContent]);
  const hasUnsavedChanges = savedSiteContentSnapshot !== ''
    && currentSiteContentSnapshot !== savedSiteContentSnapshot;

  useEffect(() => {
    if (!isWelcomeSettingsReady || savedSiteContentSnapshotRef.current) return;
    const initialSnapshot = JSON.stringify(siteContent);
    savedSiteContentSnapshotRef.current = initialSnapshot;
    setSavedSiteContentSnapshot(initialSnapshot);
  }, [isWelcomeSettingsReady, siteContent]);

  useEffect(() => {
    if (!isAdmin || !hasUnsavedChanges) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      if (allowPageUnloadRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [hasUnsavedChanges, isAdmin]);

  const saveSiteContent = async (): Promise<boolean> => {
    if (!supabase || !isAdmin) {
      setCloudSyncStatus('error');
      setCloudSyncError('Admin login and Supabase connection are required to save website changes.');
      return false;
    }
    if (saveInProgressRef.current) return false;

    saveInProgressRef.current = true;
    setIsSavingSiteContent(true);
    setCloudSyncStatus('loading');
    const snapshot = JSON.stringify(siteContent);
    try {
      const client = supabase;
      const { data: sessionData, error: sessionError } = await client.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData.session) throw new Error('Admin Supabase session is missing. Login again.');
      const { error } = await client.from('site_content').upsert({
        id: 'main',
        content: siteContent,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;

      savedSiteContentSnapshotRef.current = snapshot;
      setSavedSiteContentSnapshot(snapshot);
      setCloudSyncStatus('saved');
      setCloudSyncError('');
      return true;
    } catch (error) {
      setCloudSyncStatus('error');
      setCloudSyncError(error instanceof Error ? error.message : 'Could not save site content to Supabase.');
      return false;
    } finally {
      saveInProgressRef.current = false;
      setIsSavingSiteContent(false);
    }
  };

  const requestAdminExit = () => {
    if (hasUnsavedChanges) {
      setShowExitConfirmation(true);
      return;
    }
    void finishAdminLogout();
  };

  const saveAndExitAdmin = async () => {
    if (await saveSiteContent()) await finishAdminLogout();
  };

  const discardAndExitAdmin = () => {
    void finishAdminLogout(true);
  };

  return (
    <div
      className={`temple-app min-h-screen font-sans pb-32 transition-colors duration-300 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}
      style={{
        backgroundColor: backgroundVideo ? 'rgba(3, 7, 18, 0.76)' : isDarkMode ? selectedTheme.background : '#f8fafc',
        color: isDarkMode ? selectedTheme.text : undefined,
        backgroundImage: bgWallpaper ? `linear-gradient(to bottom, rgba(3, 7, 18, 0.88), rgba(3, 7, 18, 0.95)), url(${bgWallpaper})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {backgroundVideo && (
        <video className="temple-background-video" autoPlay muted loop playsInline preload="auto" aria-hidden="true">
          <source src={backgroundVideo} />
        </video>
      )}
      {bgWallpaper && background3dEnabled && (
        <div
          className="temple-3d-wallpaper pointer-events-none fixed inset-0 -z-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${bgWallpaper})` }}
        />
      )}
      {(isLoadingScreenVisible || (!isWelcomeSettingsReady && loadingEnabled)) && (
          <div
            className="welcome-screen fixed inset-0 z-[100] flex items-center justify-center overflow-hidden px-5 text-center"
          style={{
            backgroundColor: isWelcomeSettingsReady || isWelcomePreviewForced ? welcomeBackgroundColor : '#020706',
            backgroundImage: isWelcomeSettingsReady || isWelcomePreviewForced ? undefined : 'none',
          }}
          >
          {(isWelcomeSettingsReady || isWelcomePreviewForced) && <div className="welcome-rays" style={{ color: welcomeAccentColor }} aria-hidden="true" />}
          {(isWelcomeSettingsReady || isWelcomePreviewForced) ? <div className="welcome-content relative z-10 flex w-full max-w-3xl flex-col items-center">
              <div className="welcome-image-frame relative mb-7 flex h-40 w-40 items-center justify-center sm:mb-9 sm:h-52 sm:w-52">
                <div className="welcome-image-halo absolute inset-0 rounded-full" style={{ borderColor: `${welcomeAccentColor}88`, boxShadow: `0 0 42px ${welcomeAccentColor}55, inset 0 0 28px ${welcomeAccentColor}33` }} />
                {splashImage && <SiteImage src={splashImage} alt="Buddha image" className="relative z-10 h-[82%] w-[82%] rounded-full border-2 object-cover shadow-2xl" style={{ borderColor: welcomeAccentColor }} />}
              </div>
              {loadingTitleSi && <h1 className="welcome-title text-4xl font-black sm:text-6xl" style={{ color: welcomeAccentColor }}>{loadingTitleSi}</h1>}
              {loadingSubtitleSi && <p className="welcome-subtitle mt-3 max-w-2xl text-lg font-bold text-white sm:text-2xl">{loadingSubtitleSi}</p>}
              {loadingTextSi && <p className="welcome-greeting mt-3 text-sm text-white/75 sm:text-base">{loadingTextSi}</p>}
              <div className="welcome-progress mt-8 h-1 w-40 overflow-hidden rounded-full bg-white/15 sm:w-56">
                <div className="welcome-progress-fill h-full rounded-full" style={{ backgroundColor: welcomeAccentColor, animationDuration: `${Math.max(1000, loadingDuration)}ms` }} />
              </div>
            </div> : <div className="welcome-rays-loading" style={{ color: welcomeAccentColor }} role="status" aria-label="Loading welcome theme" />}
          </div>
        )}
      {/* Top Header Notice Bar */}
      <div className={`py-2.5 px-4 sm:px-12 flex flex-col sm:flex-row sm:flex-wrap justify-between items-stretch sm:items-center gap-3 border-b backdrop-blur-md text-xs ${isDarkMode ? 'bg-slate-950/90 border-amber-500/20' : 'bg-white/90 border-slate-200'}`}>
        <div className="flex items-center gap-2 font-semibold text-amber-400 overflow-hidden">
          <span className="animate-pulse">📢</span>
          <span className="truncate">{tickerText}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
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
          <button onClick={() => { if (isAdmin) requestAdminExit(); else setShowLoginModal(true); }} className={`px-3 py-1 rounded-full text-[11px] font-bold ${isAdmin ? 'bg-red-500 text-white' : 'bg-slate-800 text-amber-300 border border-amber-500/30'}`}>
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
              <SiteImage src={badgeLogo} alt="Temple Logo" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <span className="temple-wheel-mark text-6xl p-2 block" aria-label="ධර්ම චක්‍රය">☸</span>
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

      {/* Active page photo album */}
      {activePageGallery.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 mt-5">
          <div className="rounded-2xl border border-amber-500/25 bg-slate-950/85 p-3 shadow-xl backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400">🖼️ {lang === 'si' ? 'මෙම පිටුවට අදාල ඡායාරූප' : 'Photos for this page'}</span>
                <h3 className="text-sm font-black text-amber-100">{lang === 'si' ? 'අදාල මාතෘකාවේ ඡායාරූප' : 'Topic photo album'}</h3>
              </div>
              <span className="text-[10px] text-slate-400">{activePageGallery.length}/100</span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {activePageGallery.map(item => (
                <button key={item.id} type="button" onClick={() => setLightboxImage(item.image_url)} className="group overflow-hidden rounded-xl border border-amber-500/15 bg-slate-900 text-left">
                  <SiteImage src={item.image_url} alt={item.title} loading="lazy" decoding="async" className="aspect-[4/3] w-full bg-slate-950 object-contain transition duration-300" />
                  <div className="p-2">
                    <p className="truncate text-[10px] font-black text-amber-200">{item.title}</p>
                    {item.description && <p className="mt-1 line-clamp-2 text-[9px] leading-relaxed text-slate-400">{item.description}</p>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NEW FEATURE: Premium Temple Music Player */}
      {activeMusicTrack && (
      <section className="max-w-5xl mx-auto px-4 mt-6">
        <div className="rounded-[28px] border border-amber-500/30 bg-gradient-to-br from-slate-950/95 via-amber-950/40 to-slate-950/95 p-4 shadow-[0_20px_80px_rgba(245,158,11,0.18)] backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row items-center gap-5">
            <div className="relative w-full max-w-[190px]">
              <div className="aspect-square overflow-hidden rounded-3xl border border-amber-500/30 bg-slate-900 shadow-2xl">
                <SiteImage
                  src={activeMusicTrack?.coverImage || splashImage}
                  alt={activeMusicTrack?.title || 'Temple music'}
                  className="h-full w-full bg-slate-950 object-contain"
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

      {/* Poya / Event Calendar & Upcoming List */}
      <section className="hidden max-w-4xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-4">
          <div className="rounded-[28px] border border-amber-500/30 bg-slate-950/90 p-4 sm:p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-400">📅 {lang === 'si' ? 'දින දර්ශනය' : 'Calendar'}</span>
                <h3 className="mt-1 text-lg font-black text-amber-200">{lang === 'si' ? 'ඉදිරි පෝය හා සිදුවීම්' : 'Upcoming Poya & Events'}</h3>
              </div>
              <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-amber-300">2026</span>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-slate-400">
              {['ඉ', 'ස', 'අ', 'බ', 'බ්', 'සි', 'සෙ'].map((day) => (
                <div key={day} className="py-2">{day}</div>
              ))}

              {Array.from({ length: 35 }, (_, index) => {
                const dayNumber = index + 1;
                const eventDay = upcomingEvents.find((event) => Number(event.date.slice(-2)) === dayNumber);
                const isCurrentMonthCell = dayNumber <= 31;

                return (
                  <div
                    key={`day-${dayNumber}`}
                    className={`flex aspect-square items-center justify-center rounded-xl border text-[10px] font-black transition ${
                      eventDay
                        ? 'border-amber-500/60 bg-amber-500/15 text-amber-200 shadow-lg shadow-amber-500/15'
                        : isCurrentMonthCell
                          ? 'border-slate-700/60 bg-slate-900/70 text-slate-300'
                          : 'border-transparent bg-transparent text-slate-600'
                    }`}
                    title={eventDay ? (lang === 'si' ? eventDay.titleSi : eventDay.titleEn) : undefined}
                  >
                    {dayNumber}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-slate-300">
              {upcomingEvents.map((event) => (
                <span key={event.date} className="rounded-full border border-amber-500/30 bg-slate-900/80 px-2 py-1 font-bold text-amber-300">
                  {Number(event.date.slice(-2))} • {lang === 'si' ? event.titleSi : event.titleEn}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-amber-500/30 bg-gradient-to-br from-amber-950/30 via-slate-950/90 to-slate-950/95 p-4 sm:p-5 shadow-[0_18px_60px_rgba(245,158,11,0.12)] backdrop-blur-xl">
            <div className="mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-400">🪔 {lang === 'si' ? 'ඉදිරි සිදුවීම්' : 'Upcoming'}</span>
              <h3 className="mt-1 text-lg font-black text-amber-200">{lang === 'si' ? 'පෝය දින සහ වැඩසටහන්' : 'Poya days & program schedule'}</h3>
            </div>

            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.date} className="rounded-2xl border border-amber-500/20 bg-slate-900/70 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">{lang === 'si' ? event.tagSi : event.tagEn}</p>
                      <h4 className="mt-1 text-sm font-black text-amber-100">{lang === 'si' ? event.titleSi : event.titleEn}</h4>
                    </div>
                    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-black text-amber-300">
                      {Number(event.date.slice(-2))} {lang === 'si' ? 'දින' : 'day'}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-300">
                    <span>📅</span>
                    <span>{formatEventDate(event.date, lang)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Daily Dhamma Thought / Verse Section */}
      <section className="section-wallpaper max-w-4xl mx-auto px-4 mt-6" style={sectionWallpapers.dhamma ? { backgroundImage: `linear-gradient(90deg, rgba(3, 7, 18, .86), rgba(3, 7, 18, .72)), url(${sectionWallpapers.dhamma})` } : undefined}>
        <div className="p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-amber-950/40 backdrop-blur-xl shadow-xl text-center space-y-4">
          {renderSectionPhotoStrip(sectionPhotos.dhamma || [], 'mb-2')}
          <span className="text-[11px] font-black uppercase text-amber-400 tracking-widest block">🪷 දවසේ ධර්ම චින්තාව 🪷</span>
          <p className="text-sm sm:text-base font-bold text-amber-200 italic font-serif">&quot;{dailyVerseSi}&quot;</p>
          <p className="text-xs text-slate-300 max-w-2xl mx-auto">{dailyVerseMeaningSi}</p>
        </div>
      </section>

      {/* Event Countdown Banner Section */}
      <section className="max-w-4xl mx-auto px-4 mt-6 relative z-10">
        <div
          className="p-6 sm:p-8 rounded-3xl border-2 border-amber-500/40 shadow-2xl text-center relative overflow-hidden backdrop-blur-2xl bg-slate-950/90"
          style={sectionWallpapers.countdown || timerCover ? { backgroundImage: `linear-gradient(to bottom, rgba(3, 7, 18, 0.8), rgba(3, 7, 18, 0.95)), url(${sectionWallpapers.countdown || timerCover})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        >
          {renderSectionPhotoStrip(sectionPhotos.countdown || [], 'mb-4')}
          <span className="text-xs font-black uppercase text-amber-400 tracking-widest block mb-1">🪔 {lang === 'si' ? 'ඉදිරි විශේෂ පින්කම් මාලාව' : 'Upcoming Event'} 🪔</span>
          <h2 className="text-xl sm:text-2xl font-black text-amber-200 mb-6 py-1 leading-snug">{lang === 'si' ? eventTitleSi : eventTitleEn}</h2>
          {timeLeft ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md mx-auto">
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

      {/* Compact Poya / Event Calendar - placed below the main countdown */}
      <section className="max-w-4xl mx-auto px-4 mt-5">
        <div className="rounded-2xl border border-amber-500/25 bg-slate-950/90 p-3 sm:p-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 mb-3">
            <button type="button" onClick={() => setShowEventsCalendar(true)} className="flex items-center gap-2 text-left rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/60">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-lg transition hover:bg-amber-500/25">📅</span>
              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400">{lang === 'si' ? 'ඉදිරි දින දර්ශනය' : 'Upcoming calendar'}</span>
                <h3 className="text-sm font-black text-amber-100">{lang === 'si' ? 'පෝය සහ විශේෂ වැඩසටහන්' : 'Poya & special programs'}</h3>
              </div>
            </button>
            {hiddenUpcomingEventCount > 0 && <span className="text-[10px] font-bold text-slate-400">+{hiddenUpcomingEventCount} {lang === 'si' ? 'තවත්' : 'more'}</span>}
          </div>

          {visibleUpcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
              {visibleUpcomingEvents.map(event => (
                <div key={event.id} className="flex items-center gap-2 rounded-xl border border-amber-500/15 bg-slate-900/75 px-2.5 py-2">
                  <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg bg-amber-500/15 text-amber-300">
                    <span className="text-sm font-black leading-none">{Number(event.date.slice(-2))}</span>
                    <span className="text-[8px] uppercase">{formatEventDate(event.date, lang, 'month')}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[9px] font-bold uppercase tracking-wider text-amber-300">{lang === 'si' ? event.tagSi : event.tagEn}</p>
                    <h4 className="truncate text-xs font-black text-slate-100">{lang === 'si' ? event.titleSi : event.titleEn}</h4>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-2 text-center text-xs text-slate-400">{lang === 'si' ? 'දැනට ඉදිරි සිදුවීම් නැත.' : 'No upcoming events.'}</p>
          )}
        </div>
      </section>

      {/* Daily Worship Schedule / Puja Timings WITH IMAGES */}
      <section className="max-w-4xl mx-auto px-4 mt-6">
        <div className="section-wallpaper p-5 rounded-2xl bg-slate-900/80 border border-amber-500/20 text-xs" style={sectionWallpapers.puja ? { backgroundImage: `linear-gradient(90deg, rgba(3, 7, 18, .88), rgba(3, 7, 18, .74)), url(${sectionWallpapers.puja})` } : undefined}>
          {renderSectionPhotoStrip(sectionPhotos.puja || [], 'mb-4')}
          <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>🕯️</span> <span>දෛනික වන්දනා සහ පූජා වේලාවන්</span>
          </h3>
          <div className="grid grid-cols-3 gap-2 text-slate-300 sm:gap-4">
            {/* Morning Puja */}
            <div className="flex flex-col justify-between space-y-2 rounded-2xl border border-amber-500/15 bg-slate-950/80 p-2 sm:p-3">
              <div>
                {pujaMorningImg && (
                  <div className="mb-2 h-16 w-full cursor-pointer overflow-hidden rounded-xl border border-amber-500/20 sm:h-28" onClick={() => setLightboxImage(pujaMorningImg)}>
                    <SiteImage src={pujaMorningImg} alt="Morning Puja" loading="lazy" decoding="async" className="h-full w-full bg-slate-950 object-contain" />
                  </div>
                )}
                <span className="block text-[10px] font-bold leading-tight text-slate-200 sm:text-xs">🌅 උදෑසන බුද්ධ පූජාව</span>
              </div>
              <span className="block text-xs font-black text-amber-300 sm:text-sm">{pujaMorning}</span>
            </div>

            {/* Noon Puja */}
            <div className="flex flex-col justify-between space-y-2 rounded-2xl border border-amber-500/15 bg-slate-950/80 p-2 sm:p-3">
              <div>
                {pujaNoonImg && (
                  <div className="mb-2 h-16 w-full cursor-pointer overflow-hidden rounded-xl border border-amber-500/20 sm:h-28" onClick={() => setLightboxImage(pujaNoonImg)}>
                    <SiteImage src={pujaNoonImg} alt="Noon Puja" loading="lazy" decoding="async" className="h-full w-full bg-slate-950 object-contain" />
                  </div>
                )}
                <span className="block text-[10px] font-bold leading-tight text-slate-200 sm:text-xs">☀️ දවල් සම්බුද්ධ පූජාව</span>
              </div>
              <span className="block text-xs font-black text-amber-300 sm:text-sm">{pujaNoon}</span>
            </div>

            {/* Evening Puja */}
            <div className="flex flex-col justify-between space-y-2 rounded-2xl border border-amber-500/15 bg-slate-950/80 p-2 sm:p-3">
              <div>
                {pujaEveningImg && (
                  <div className="mb-2 h-16 w-full cursor-pointer overflow-hidden rounded-xl border border-amber-500/20 sm:h-28" onClick={() => setLightboxImage(pujaEveningImg)}>
                    <SiteImage src={pujaEveningImg} alt="Evening Puja" loading="lazy" decoding="async" className="h-full w-full bg-slate-950 object-contain" />
                  </div>
                )}
                <span className="block text-[10px] font-bold leading-tight text-slate-200 sm:text-xs">🌙 සන්ධ්‍යා ගිලන්පස පූජාව</span>
              </div>
              <span className="block text-xs font-black text-amber-300 sm:text-sm">{pujaEvening}</span>
            </div>
          </div>
        </div>
      </section>

      {showWinnersOnHome && visibleWinners.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 mt-10" aria-labelledby="home-winners-title">
          <div className="winner-showcase overflow-hidden rounded-3xl border border-amber-300/30 shadow-2xl">
            {winnerSectionPhotos.length > 0 && (
              <div className="grid grid-cols-2 gap-2 border-b border-amber-200/20 p-3 sm:grid-cols-3 sm:p-4 lg:grid-cols-5">
                {winnerSectionPhotos.map((photo, index) => (
                  <div key={`${photo}-${index}`} className="overflow-hidden rounded-2xl border border-amber-500/20 bg-slate-900">
                    <SiteImage src={photo} alt="Winner showcase" loading="lazy" decoding="async" className="h-16 w-full bg-slate-950 object-contain sm:h-24" />
                  </div>
                ))}
              </div>
            )}
            <div className="winner-showcase-header flex flex-wrap items-end justify-between gap-4 border-b border-amber-200/20 px-6 py-5 sm:px-8">
              <div className={winnerTopicPlacement === 'below' ? 'order-2 w-full' : ''}>
                <h2 id="home-winners-title" className="text-2xl font-black leading-tight text-amber-300 drop-shadow-[0_2px_16px_rgba(251,191,36,0.2)] sm:text-3xl md:text-4xl">
                  {lang === 'si' ? 'ශ්‍රී උපනන්ද දහම් පාසල' : 'Sri Upananda Dhamma School'}
                </h2>
                <p className="mt-2 text-xs font-semibold text-amber-100/80 sm:text-sm">{winnerTopic}</p>
              </div>
              <span className="text-xs font-bold text-amber-100/80">ජයග්‍රාහකයන් {visibleWinners.length} දෙනෙක්</span>
            </div>
            <div className="winner-card-grid grid grid-cols-2 justify-items-center gap-3 p-3 sm:gap-5 sm:p-6 md:grid-cols-2 xl:grid-cols-3">
              {visibleWinners.map((winner, index) => (
                <article
                  key={winner.id}
                  onClick={() => setSelectedWinner(winner)}
                  className="winner-card group relative flex h-full w-full max-w-sm min-w-0 cursor-pointer flex-col items-center overflow-hidden rounded-2xl border border-white/15 bg-slate-950/65 p-3 text-center transition hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-500/10 sm:p-4"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <div className="relative mb-3 h-40 w-full overflow-hidden rounded-xl bg-slate-900 sm:h-56">
                    <SiteImage src={winner.image} alt={winner.name} loading="lazy" decoding="async" className="h-full w-full object-contain object-center" />
                    <span className="absolute left-2 top-2 rounded-full border border-amber-100/40 bg-slate-950/80 px-3 py-1 text-[10px] font-black text-amber-100 backdrop-blur">{winner.year}</span>
                  </div>
                  <div className="flex w-full flex-1 flex-col items-center space-y-2">
                    {winner.place && <p className="text-xs font-black text-amber-300">{winner.place}</p>}
                    <h3 className="break-words text-sm font-black text-white sm:text-lg">{winner.name}</h3>
                    <p className="break-words text-[11px] leading-relaxed text-slate-200 sm:text-sm">{winner.achievement}</p>
                    {winner.grade && <p className="pt-1 text-[10px] font-bold text-amber-100/70 sm:text-xs">ශ්‍රේණිය {winner.grade}</p>}
                    {isAdmin && canAccess('winners') && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          editWinner(winner);
                          setAdminSubTab('winners');
                        }}
                        className="mt-auto rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300"
                      >
                        Edit Winner
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {Object.keys(peopleBySection).map(section => renderPeopleCards(section, 'home'))}

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
            {categories.filter(cat => cat.showOnHome !== false).map(cat => (
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
                {page.logoImage ? <SiteImage src={page.logoImage} alt="" className="h-5 w-5 rounded-full object-cover" /> : <span>📄</span>}
                <span>{lang === 'si' ? page.titleSi : page.titleEn}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Display Area (GRID CARDS LAYOUT) */}
      <main className="max-w-5xl mx-auto px-4 mt-10">
        {(activeCategory || activeCustomPage) && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-amber-500/20 pb-3">
              <h2 className="text-xl font-black text-amber-400 flex items-center gap-2">
                <span>{activeSectionIcon}</span> <span>{lang === 'si' ? activeSectionTitleSi : activeSectionTitleEn}</span>
              </h2>
              <span className="text-xs text-slate-400 font-bold">{filteredPosts.length} {lang === 'si' ? 'ලිපි සංඛ්‍යාවක්' : 'Posts'}</span>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs bg-slate-900/40 rounded-3xl border border-dashed border-amber-500/20">
                තවමත් මෙම අංශයට අදාළ තොරතුරු හෝ ලිපි ඇතුළත් කර නොමැත.
              </div>
            ) : (
              <div className="section-wallpaper rounded-3xl p-2 sm:p-4" style={sectionWallpapers.posts ? { backgroundImage: `linear-gradient(90deg, rgba(3, 7, 18, .82), rgba(3, 7, 18, .7)), url(${sectionWallpapers.posts})` } : undefined}>
                {renderSectionPhotoStrip(sectionPhotos[activeTab as SectionPhotoKey] || sectionPhotos.posts || [], 'mb-4')}
              <div className={`grid grid-cols-1 ${postGridColumns >= 2 ? 'md:grid-cols-2' : ''} ${postGridColumns >= 3 ? 'xl:grid-cols-3' : ''} ${postGridColumns >= 4 ? '2xl:grid-cols-4' : ''} gap-5`}>
                {visiblePosts.map(post => {
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
                            <SiteImage
                              src={displayImg}
                              alt={post.titleSi}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full bg-slate-950 object-contain"
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
                            {categories.find(c => c.id === post.category)?.labelSi || customPages.find(page => page.id === post.category)?.titleSi || 'තොරතුරු'}
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
                                  setPostTopic(post.topic || '');
                                  setPostShowOnHome(post.showOnHome !== false);
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
              {filteredPosts.length > visiblePosts.length && (
                <p className="mt-4 text-center text-xs font-bold text-amber-100/80">තවත් {filteredPosts.length - visiblePosts.length} ලිපි පවතී</p>
              )}
              </div>
            )}
            {activeCategory && Object.keys(peopleBySection).map(section => renderPeopleCards(section, 'page', activeCategory.id))}
          </div>
        )}

        {/* Custom Pages Render Area WITH EDIT & DELETE */}
        {activeCustomPage && (
          <div className="p-6 sm:p-10 rounded-3xl border border-amber-500/30 bg-slate-900/80 backdrop-blur-2xl shadow-2xl space-y-6">
            {activeCustomPage.bannerImage && (
              <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-amber-500/20 shadow-lg cursor-pointer" onClick={() => setLightboxImage(activeCustomPage.bannerImage!)}>
                <SiteImage src={activeCustomPage.bannerImage} alt="Page Banner" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex flex-wrap justify-between items-center border-b border-amber-500/20 pb-4 gap-4">
              <h2 className="flex items-center gap-3 text-2xl sm:text-3xl font-black text-amber-400">
                {activeCustomPage.logoImage && <SiteImage src={activeCustomPage.logoImage} alt="" className="h-12 w-12 rounded-full border border-amber-500/30 object-cover" />}
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
            {Object.keys(peopleBySection).map(section => renderPeopleCards(section, 'page', activeCustomPage.id))}
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
                {supabase && (
                  <p className={`text-[10px] mt-2 ${cloudSyncStatus === 'error' ? 'text-red-300' : cloudSyncStatus === 'saved' ? 'text-emerald-300' : 'text-slate-400'}`}>
                    {cloudSyncStatus === 'loading' ? 'වෙබ් අඩවියට save වෙමින්...' : cloudSyncStatus === 'saved' ? 'වෙබ් අඩවියට save වුණා' : cloudSyncStatus === 'error' ? `Save error: ${cloudSyncError}` : 'වෙනස්කම් කළ පසු Save කරන්න'}
                    {cloudSyncStatus === 'error' && (
                      <button type="button" onClick={() => void saveSiteContent()} className="ml-2 underline text-amber-300">
                        නැවත save කරන්න
                      </button>
                    )}
                  </p>
                )}
                {hasUnsavedChanges && (
                  <p className="mt-1 text-[10px] font-bold text-amber-300">වෙබ් අඩවියට තවම save නොකළ වෙනස්කම් ඇත.</p>
                )}
                {!supabase && (
                  <p className="text-[10px] mt-2 text-red-300">
                    Cloud sync අක්‍රියයි: Supabase URL එක නිවැරදිව සකසන්න.
                  </p>
                )}
              </div>
              <button
                onClick={requestAdminExit}
                className="px-4 py-2 rounded-full text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-md"
              >
                💾 Save & Exit
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
              {canAccess('gallery') && (
                <button
                  onClick={() => setAdminSubTab('gallery')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${adminSubTab === 'gallery' ? 'bg-amber-500 text-slate-950 font-black shadow-lg' : 'bg-slate-900 text-slate-300 border border-amber-500/20 hover:text-amber-300'}`}
                >
                  🖼️ ඡායාරූප ඇල්බමය ({galleryItems.length})
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
              {canAccess('winners') && (
                <button
                  onClick={() => setAdminSubTab('winners')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${adminSubTab === 'winners' ? 'bg-amber-500 text-slate-950 font-black shadow-lg' : 'bg-slate-900 text-slate-300 border border-amber-500/20 hover:text-amber-300'}`}
                >
                  🏆 ප්‍රියතම දක්ෂතා / Winners
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
            </div>

            {['general', 'posts', 'winners', 'pages'].includes(adminSubTab) && (
              <div className="sticky bottom-2 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-400/40 bg-slate-900/95 p-3 shadow-xl backdrop-blur">
                <p className={`text-xs font-bold ${hasUnsavedChanges ? 'text-amber-300' : 'text-emerald-300'}`}>
                  {hasUnsavedChanges ? 'මෙම සැකසුම්වල වෙනස්කම් save කර නැත.' : 'Save කිරීමට pending වෙනස්කම් නැත.'}
                </p>
                <button
                  type="button"
                  onClick={() => void saveSiteContent()}
                  disabled={!hasUnsavedChanges || isSavingSiteContent || !isWelcomeSettingsReady || !supabase}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white enabled:hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSavingSiteContent ? 'Saving...' : '💾 Save website changes'}
                </button>
              </div>
            )}

            {/* Admin Photo Album */}
            {adminSubTab === 'gallery' && canAccess('gallery') && (
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] gap-6 text-xs">
                <form onSubmit={saveGalleryItem} className="space-y-4 rounded-2xl bg-slate-900/60 border border-amber-500/20 p-4 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-bold text-sm text-amber-400">🖼️ {editingGalleryId ? 'ඡායාරූපය සංස්කරණය' : 'අලුත් ඡායාරූපයක් එකතු කරන්න'}</h3>
                    {editingGalleryId && <button type="button" onClick={resetGalleryForm} className="text-[10px] text-slate-400 underline">Cancel</button>}
                  </div>
                  <label className="block text-slate-300">Title
                    <input type="text" value={galleryTitle} onChange={e => setGalleryTitle(e.target.value)} required className="mt-1 w-full min-w-0 p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                  </label>
                  <label className="block text-slate-300">Category
                    <input type="text" value={galleryCategory} onChange={e => setGalleryCategory(e.target.value)} placeholder="පින්කම් / උත්සව" className="mt-1 w-full min-w-0 p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                  </label>
                  <label className="block text-slate-300">අදාල පිටුව / Section
                    <select value={galleryPageKey} onChange={e => setGalleryPageKey(e.target.value)} className="mt-1 w-full min-w-0 p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white">
                      <option value="all">සියලු පිටු</option>
                      {categories.filter(category => category.id !== 'all').map(category => <option key={category.id} value={category.id}>{category.labelSi}</option>)}
                      {customPages.map(page => <option key={page.id} value={page.id}>{page.titleSi}</option>)}
                    </select>
                  </label>
                  <label className="block text-slate-300">ඡායාරූප විස්තරය
                    <textarea rows={3} value={galleryDescription} onChange={e => setGalleryDescription(e.target.value)} placeholder="මෙම ඡායාරූපය ගැන කෙටි විස්තරයක්..." className="mt-1 w-full min-w-0 p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                  </label>
                  <label className="block text-slate-300">Image URL
                    <input type="url" value={galleryImage.startsWith('data:') ? '' : galleryImage} onChange={e => setGalleryImage(e.target.value)} placeholder="https://..." className="mt-1 w-full min-w-0 p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                  </label>
                  <label className="block text-slate-300">නැත්නම් image file එක තෝරන්න
                    <input type="file" accept="image/*" onChange={e => handleFileUploadWithEditor(e, setGalleryImage)} className="mt-1 w-full text-[10px] text-slate-400" />
                  </label>
                  {galleryImage && <SiteImage src={galleryImage} alt="Gallery preview" className="w-full aspect-video rounded-xl border border-amber-500/20 bg-slate-950 object-contain" />}
                  <button type="submit" className="w-full rounded-xl bg-amber-500 px-4 py-2.5 font-bold text-slate-950">
                    {editingGalleryId ? '💾 Update photo' : '➕ Add to album'}
                  </button>
                  <p className="text-[10px] text-slate-400">{galleryItems.length}/100 photos භාවිතා කර ඇත. Photo එක save කළ පසු තෝරාගත් page එකේ ඉහළින් පෙන්වයි.</p>
                </form>

                <div className="min-w-0 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-bold text-sm text-amber-400">ඇල්බමයේ ඡායාරූප</h3>
                    <a href="/gallery" target="_blank" rel="noreferrer" className="text-[10px] text-amber-300 underline">Public gallery බලන්න</a>
                  </div>
                  {galleryItems.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-amber-500/20 p-8 text-center text-slate-500">තවම photos නැහැ.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {galleryItems.map(item => (
                        <div key={item.id} className="min-w-0 overflow-hidden rounded-2xl bg-slate-900 border border-amber-500/20">
                          <SiteImage src={item.image_url} alt={item.title} className="w-full aspect-video bg-slate-950 object-contain" />
                          <div className="p-3 space-y-2">
                            <div className="min-w-0">
                              <p className="font-bold text-amber-200 break-words">{item.title}</p>
                              {item.category && <p className="text-[10px] text-slate-400 break-words">{item.category}</p>}
                              {item.description && <p className="text-[10px] leading-relaxed text-slate-300 break-words">{item.description}</p>}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button type="button" onClick={() => editGalleryItem(item)} className="rounded-lg bg-emerald-600/30 px-3 py-1.5 text-emerald-300">✏️ Edit</button>
                              <button type="button" onClick={() => deleteGalleryItem(item.id)} className="rounded-lg bg-red-600/30 px-3 py-1.5 text-red-300">🗑️ Delete</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Admin Sub Tab 1: General Settings */}
            {adminSubTab === 'general' && canAccess('general') && (
              <form onSubmit={saveGeneralSettings} className="space-y-6 text-xs">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-amber-500/20 space-y-4">
                  <h3 className="font-bold text-amber-400">🏛️ Welcome Theme & Front Banner</h3>
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
                </div>

                <div className="rounded-2xl border border-amber-500/30 bg-slate-900/70 p-4 sm:p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-amber-400">☸ Welcome Theme Editor</h3>
                      <p className="mt-1 text-[10px] text-slate-400">Manage the Buddha welcome screen, animation, text, image, and duration.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={previewWelcomeTheme} className="rounded-lg bg-amber-500 px-3 py-2 text-[10px] font-black text-slate-950">Preview welcome screen</button>
                      <button type="button" onClick={saveWelcomeThemeSettings} className="rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-black text-white">Save welcome changes</button>
                      <button type="button" onClick={resetWelcomeTheme} className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[10px] font-bold text-red-200">Restore defaults</button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/15 bg-slate-950/60 p-3">
                    <label className="flex items-center gap-2 font-bold text-slate-200">
                      <input type="checkbox" checked={loadingEnabled} onChange={e => setLoadingEnabled(e.target.checked)} className="h-4 w-4 accent-amber-500" />
                      Enable welcome theme on page load
                    </label>
                    <label className="flex items-center gap-2 text-slate-300">
                      Duration (seconds)
                      <input type="number" min="1" max="15" step="1" value={Math.round(loadingDuration / 1000)} onChange={e => setLoadingDuration(Math.min(15000, Math.max(1000, Number(e.target.value || 1) * 1000)))} className="w-20 rounded-lg border border-amber-500/30 bg-slate-950 p-2 text-white" />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <label className="block text-slate-300">Main title
                      <input type="text" value={loadingTitleSi} onChange={e => setLoadingTitleSi(e.target.value)} placeholder="පබස්සර" className="mt-1 w-full rounded-xl border border-amber-500/30 bg-slate-950 p-2.5 text-white" />
                    </label>
                    <label className="block text-slate-300">Temple subtitle
                      <input type="text" value={loadingSubtitleSi} onChange={e => setLoadingSubtitleSi(e.target.value)} placeholder="ශ්‍රී බෝධිරුක්ඛාරාමය ගණිහිමුල්ල දෙවලපොල" className="mt-1 w-full rounded-xl border border-amber-500/30 bg-slate-950 p-2.5 text-white" />
                    </label>
                    <label className="block text-slate-300">Welcome text
                      <input type="text" value={loadingTextSi} onChange={e => setLoadingTextSi(e.target.value)} placeholder="සාදරයෙන් පිළිගනිමු" className="mt-1 w-full rounded-xl border border-amber-500/30 bg-slate-950 p-2.5 text-white" />
                    </label>
                    <label className="block text-slate-300">Buddha image URL
                      <input type="url" value={splashImage} onChange={e => setSplashImage(e.target.value)} placeholder="https://..." className="mt-1 w-full rounded-xl border border-amber-500/30 bg-slate-950 p-2.5 text-white" />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/15 bg-slate-950/60 p-3 text-slate-300">Background color
                      <input type="color" value={welcomeBackgroundColor} onChange={e => setWelcomeBackgroundColor(e.target.value)} className="h-9 w-12 cursor-pointer rounded bg-transparent" />
                    </label>
                    <label className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/15 bg-slate-950/60 p-3 text-slate-300">Radiance / title color
                      <input type="color" value={welcomeAccentColor} onChange={e => setWelcomeAccentColor(e.target.value)} className="h-9 w-12 cursor-pointer rounded bg-transparent" />
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <label className="cursor-pointer rounded-lg border border-amber-500/25 bg-slate-950 px-3 py-2 text-[10px] font-bold text-amber-200">
                      Upload / adjust Buddha image
                      <input type="file" accept="image/*" onChange={e => handleFileUploadWithEditor(e, setSplashImage)} className="sr-only" />
                    </label>
                    {splashImage && <button type="button" onClick={() => setSplashImage('')} className="rounded-lg border border-red-500/30 px-3 py-2 text-[10px] font-bold text-red-200">Remove image</button>}
                    {splashImage && <SiteImage src={splashImage} alt="Welcome theme image preview" className="h-14 w-14 rounded-full border border-amber-500/30 object-cover" />}
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

                {/* Upcoming Calendar Events */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-amber-500/20 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-amber-400">📅 පෝය / ඉදිරි සිදුවීම් දින දර්ශනය ({upcomingEvents.length})</h3>
                      <p className="mt-1 text-[10px] text-slate-400">Main page එකේ countdown එකට පහළින් පෙන්වන සිදුවීම් මෙතැනින් වෙනස් කරන්න.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUpcomingEvents(events => [...events, { id: `event-${Date.now()}`, date: new Date().toISOString().slice(0, 10), titleSi: '', titleEn: '', tagSi: 'සිදුවීම', tagEn: 'Event' }])}
                      className="rounded-xl bg-amber-500 px-3 py-2 text-[10px] font-black text-slate-950 hover:bg-amber-400"
                    >
                      + සිදුවීමක් එක් කරන්න
                    </button>
                  </div>

                  <div className="max-h-72 space-y-3 overflow-y-auto overscroll-contain pr-1">
                    {upcomingEvents.map((event, index) => (
                      <div key={event.id} className="rounded-2xl border border-amber-500/20 bg-slate-950/70 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">Event {index + 1}</span>
                          <button type="button" onClick={() => setUpcomingEvents(events => events.filter(item => item.id !== event.id))} className="rounded-lg bg-red-600/30 px-2 py-1 text-[10px] font-bold text-red-300">මකන්න</button>
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
                          <input type="date" value={event.date} onChange={e => setUpcomingEvents(events => events.map(item => item.id === event.id ? { ...item, date: e.target.value } : item))} className="rounded-xl border border-amber-500/30 bg-slate-900 p-2.5 text-white" />
                          <input type="text" value={event.titleSi} onChange={e => setUpcomingEvents(events => events.map(item => item.id === event.id ? { ...item, titleSi: e.target.value } : item))} placeholder="සිංහල නම" className="rounded-xl border border-amber-500/30 bg-slate-900 p-2.5 text-white" />
                          <input type="text" value={event.titleEn} onChange={e => setUpcomingEvents(events => events.map(item => item.id === event.id ? { ...item, titleEn: e.target.value } : item))} placeholder="English name" className="rounded-xl border border-amber-500/30 bg-slate-900 p-2.5 text-white" />
                          <input type="text" value={event.tagSi} onChange={e => setUpcomingEvents(events => events.map(item => item.id === event.id ? { ...item, tagSi: e.target.value } : item))} placeholder="වර්ගය" className="rounded-xl border border-amber-500/30 bg-slate-900 p-2.5 text-white" />
                          <input type="text" value={event.tagEn} onChange={e => setUpcomingEvents(events => events.map(item => item.id === event.id ? { ...item, tagEn: e.target.value } : item))} placeholder="Tag" className="rounded-xl border border-amber-500/30 bg-slate-900 p-2.5 text-white" />
                        </div>
                      </div>
                    ))}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                    <div>
                      <label className="block text-slate-300 mb-1">Background video (5 sec max, 25 MB max)</label>
                      <input type="file" accept="video/mp4,video/webm" onChange={handleBackgroundVideoUpload} className="w-full text-[10px] text-slate-400" />
                      {backgroundVideoUploadStatus && <p role="status" className="mt-2 text-[10px] text-amber-200">{backgroundVideoUploadStatus}</p>}
                      {backgroundVideo && <button type="button" onClick={() => setBackgroundVideo('')} className="mt-2 text-[10px] text-red-300 underline">Remove background video</button>}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-slate-300 font-semibold">
                    <input type="checkbox" checked={background3dEnabled} onChange={e => setBackground3dEnabled(e.target.checked)} className="accent-amber-500" />
                    3D wallpaper depth effect
                  </label>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-300">Section photo galleries (up to 8 photos each)</h4>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {sectionPhotoConfig.map(section => (
                        <div key={section.key} className="rounded-xl border border-amber-500/20 bg-slate-950/60 p-3">
                          <label className="block text-[11px] text-slate-300">
                            {section.label} photo URLs
                            <textarea
                              rows={3}
                              value={(sectionPhotos[section.key] || []).join('\n')}
                              onChange={e => setSectionPhotos(current => ({
                                ...current,
                                [section.key]: normalizeSectionPhotoList(e.target.value),
                              }))}
                              className="mt-1 w-full rounded-xl border border-amber-500/30 bg-slate-950 p-2 text-white"
                              placeholder="One image URL per line"
                            />
                          </label>
                          <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-slate-400">
                            <span>
                              Add photo · {(sectionPhotos[section.key] || []).length}/8
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={e => handleSectionPhotoUpload(section.key, e)}
                              disabled={(sectionPhotos[section.key] || []).length >= 8}
                              className="max-w-[180px] text-[10px] text-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                        <div className="p-4 rounded-2xl bg-slate-900/60 border border-amber-500/20 space-y-4">
                          <h3 className="font-bold text-amber-400">🎨 Website Themes ({themes.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-slate-300 mb-1">Active theme</label>
                      <select value={selectedThemeId} onChange={e => setSelectedThemeId(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white">
                        {themes.map(theme => <option key={theme.id} value={theme.id}>{theme.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <input type="text" value={themeName} onChange={e => setThemeName(e.target.value)} placeholder="New theme name" className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                    <label className="text-slate-300">
                      Background
                      <div className="mt-1 flex items-center gap-2">
                        <input type="text" value={themeBackground} onChange={e => setThemeBackground(e.target.value)} className="w-20 p-2 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                        <input type="color" value={themeBackground} onChange={e => setThemeBackground(e.target.value)} className="h-10 w-10 rounded bg-slate-950" />
                      </div>
                    </label>
                    <label className="text-slate-300">
                      Accent
                      <div className="mt-1 flex items-center gap-2">
                        <input type="text" value={themeAccent} onChange={e => setThemeAccent(e.target.value)} className="w-20 p-2 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                        <input type="color" value={themeAccent} onChange={e => setThemeAccent(e.target.value)} className="h-10 w-10 rounded bg-slate-950" />
                      </div>
                    </label>
                    <label className="text-slate-300">
                      Text
                      <div className="mt-1 flex items-center gap-2">
                        <input type="text" value={themeText} onChange={e => setThemeText(e.target.value)} className="w-20 p-2 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                        <input type="color" value={themeText} onChange={e => setThemeText(e.target.value)} className="h-10 w-10 rounded bg-slate-950" />
                      </div>
                    </label>
                    <button type="button" onClick={addTheme} className="self-end rounded-xl bg-amber-500 px-4 py-2.5 font-bold text-slate-950">Add theme</button>
                  </div>
                  <div className="max-h-24 overflow-y-auto overscroll-contain pr-1">
                    <div className="flex flex-wrap gap-2">
                      {themes.filter(theme => !DEFAULT_THEMES.some(defaultTheme => defaultTheme.id === theme.id)).map(theme => (
                        <button key={theme.id} type="button" onClick={() => deleteTheme(theme.id)} className="rounded-lg border border-red-500/30 bg-red-600/20 px-3 py-1.5 text-[10px] text-red-300">
                          Delete {theme.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-amber-500/20 space-y-4">
                  <h3 className="font-bold text-amber-400">🎵 Music Player Controls ({musicTracks.length})</h3>
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
                  <div className="max-h-72 space-y-2 overflow-y-auto overscroll-contain pr-1">
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
                  <h3 className="font-bold text-amber-400">🗂️ කාණ්ඩ (Categories) කළමනාකරණය ({categories.length})</h3>
                  <div className="max-h-72 space-y-3 overflow-y-auto overscroll-contain pr-1">
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
                    <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-slate-950 px-3 py-2">
                      <input type="checkbox" checked={categoryShowOnHome} onChange={e => setCategoryShowOnHome(e.target.checked)} className="h-4 w-4 accent-amber-500" />
                      <span className="text-[10px] font-bold text-amber-200">Home page එකේ පෙන්වන්න</span>
                    </div>
                    <button type="button" onClick={saveCategory} className="px-4 py-2.5 rounded-xl font-bold bg-amber-500 text-slate-950 md:col-span-4">
                      {editingCategoryId ? 'Update section' : 'Add section'}
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
                        {customPages.length > 0 && <option disabled>──────── පිටු ────────</option>}
                        {customPages.map(page => <option key={page.id} value={page.id}>📄 {page.titleSi}</option>)}
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
                      {postImg && (
                        <div className="mt-3 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-slate-950/70 p-2">
                          <SiteImage src={postImg} alt="Post image preview" className="h-16 w-20 rounded-lg bg-slate-950 object-contain" />
                          <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => setLightboxImage(postImg)} className="rounded-lg bg-slate-800 px-3 py-1.5 text-[10px] font-bold text-slate-200">View</button>
                            <button type="button" onClick={() => openImageEditor(postImg, setPostImg)} className="rounded-lg bg-amber-500/15 px-3 py-1.5 text-[10px] font-bold text-amber-200">Adjust</button>
                          </div>
                        </div>
                      )}
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

            {/* Admin Sub Tab 3: Winners / Achievements */}
            {adminSubTab === 'winners' && canAccess('winners') && (
              <div className="space-y-8 text-xs">
                <div className="p-4 rounded-2xl bg-slate-900/70 border border-amber-500/20 space-y-4">
                  <h3 className="font-bold text-sm text-amber-400 border-b border-amber-500/20 pb-2">🏆 Main page winner section controls</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-2 font-bold text-slate-300">
                      <input type="checkbox" checked={showWinnersOnHome} onChange={e => setShowWinnersOnHome(e.target.checked)} className="accent-amber-500" />
                      Show winner section on home page
                    </label>
                    <label className="block text-slate-300">
                      Winner display count
                      <input type="number" min="1" max="20" value={winnerDisplayCount} onChange={e => setWinnerDisplayCount(Math.max(1, Number(e.target.value) || 1))} className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                    </label>
                    <label className="block text-slate-300 md:col-span-2">
                      Section topic
                      <input type="text" value={winnerTopic} onChange={e => setWinnerTopic(e.target.value)} className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                    </label>
                    <label className="block text-slate-300">
                      Topic placement
                      <select value={winnerTopicPlacement} onChange={e => setWinnerTopicPlacement(e.target.value as 'above' | 'below')} className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white">
                        <option value="above">Above cards</option>
                        <option value="below">Below cards</option>
                      </select>
                    </label>
                  </div>
                </div>

                <form onSubmit={saveWinner} className="p-5 rounded-2xl bg-slate-900/70 border border-amber-500/20 space-y-4">
                  <h3 className="font-bold text-sm text-amber-400 border-b border-amber-500/20 pb-2">
                    {editingWinnerId ? '✏️ Winners update' : '➕ Add winner'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Winner name</label>
                      <input type="text" value={winnerName} onChange={e => setWinnerName(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Place / ස්ථානය</label>
                      <input type="text" value={winnerPlace} onChange={e => setWinnerPlace(e.target.value)} placeholder="උදා: 1 වන ස්ථානය" className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Grade</label>
                      <input type="text" value={winnerGrade} onChange={e => setWinnerGrade(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Year</label>
                      <input type="text" value={winnerYear} onChange={e => setWinnerYear(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Image URL</label>
                      <input type="url" value={winnerImage} onChange={e => setWinnerImage(e.target.value)} placeholder="https://..." className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Achievement</label>
                    <textarea rows={3} value={winnerAchievement} onChange={e => setWinnerAchievement(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Or upload image</label>
                    <input type="file" accept="image/*" onChange={e => handleFileUploadWithEditor(e, setWinnerImage)} className="text-[10px] text-slate-400" />
                  </div>
                  {winnerImage && <SiteImage src={winnerImage} alt="Winner preview" className="w-full max-h-56 rounded-xl border border-amber-500/20 bg-slate-950 object-contain" />}
                  <div className="flex gap-3">
                    <button type="submit" className="px-6 py-2.5 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition">
                      {editingWinnerId ? '💾 Save winner' : '➕ Add winner'}
                    </button>
                    {editingWinnerId && (
                      <button type="button" onClick={resetWinnerForm} className="px-4 py-2.5 rounded-xl font-bold bg-slate-800 text-slate-300 hover:bg-slate-700">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                <div className="space-y-3">
                  <h4 className="font-bold text-amber-300">Saved winners ({winners.length})</h4>
                  <p className="text-[10px] text-slate-400">↑ ↓ භාවිතයෙන් homepage එකේ පෙන්වන අනුපිළිවෙළ වෙනස් කර, වෙබ් අඩවියේ තහවුරු කිරීමට Save website changes ඔබන්න.</p>
                  {winners.length === 0 ? (
                    <p className="text-slate-500">No winners added yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {winners.map((winner, index) => (
                        <div key={winner.id} className="flex items-center gap-3 rounded-xl bg-slate-900 border border-amber-500/20 p-3">
                          <SiteImage src={winner.image} alt={winner.name} className="h-14 w-14 rounded-xl border border-amber-500/20 bg-slate-950 object-contain" />
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-white block truncate">{winner.name}</span>
                            {winner.place && <span className="text-[10px] text-amber-300 block break-words">{winner.place}</span>}
                            <span className="text-[10px] text-amber-400 block break-words">{winner.achievement}</span>
                          </div>
                          <div className="flex flex-wrap justify-end gap-2">
                            <button type="button" onClick={() => moveWinnerCard(index, -1)} disabled={index === 0} aria-label={`Move ${winner.name} up`} className="rounded-lg border border-slate-600 px-2 py-1.5 text-slate-200 enabled:hover:bg-slate-700 disabled:opacity-40">↑</button>
                            <button type="button" onClick={() => moveWinnerCard(index, 1)} disabled={index === winners.length - 1} aria-label={`Move ${winner.name} down`} className="rounded-lg border border-slate-600 px-2 py-1.5 text-slate-200 enabled:hover:bg-slate-700 disabled:opacity-40">↓</button>
                            <button type="button" onClick={() => editWinner(winner)} className="px-3 py-1.5 rounded-lg bg-emerald-600/30 text-emerald-300 border border-emerald-500/30">Edit</button>
                            <button type="button" onClick={() => deleteWinner(winner.id)} className="px-3 py-1.5 rounded-lg bg-red-600/30 text-red-300 border border-red-500/30">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <form onSubmit={savePersonCard} className="p-5 rounded-2xl bg-slate-900/70 border border-amber-500/20 space-y-4">
                  <h3 className="font-bold text-sm text-amber-400 border-b border-amber-500/20 pb-2">
                    {editingPersonId ? '✏️ Leader / Winner / Character update' : '➕ Add leader / winner / character'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block text-slate-300">
                      Section name
                      <input type="text" value={personSection} onChange={e => setPersonSection(e.target.value)} required className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" placeholder="e.g. Committee members" />
                    </label>
                    <label className="block text-slate-300">
                      Position / Role
                      <input type="text" value={personRole} onChange={e => setPersonRole(e.target.value)} required className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" placeholder="Chairman / Mentor / Character" />
                    </label>
                    <label className="block text-slate-300">
                      Name
                      <input type="text" value={personName} onChange={e => setPersonName(e.target.value)} required className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" placeholder="Name" />
                    </label>
                    <label className="block text-slate-300">
                      Image URL
                      <input type="url" value={personImage} onChange={e => setPersonImage(e.target.value)} required className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" placeholder="https://..." />
                    </label>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Short description / message</label>
                    <textarea rows={3} value={personDescription} onChange={e => setPersonDescription(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white" placeholder="Small note about this leader / character" />
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="flex items-center gap-2 text-slate-300">
                      <input type="checkbox" checked={personShowOnHome} onChange={e => setPersonShowOnHome(e.target.checked)} className="h-4 w-4 accent-amber-500" />
                      Show on home page
                    </label>
                    <label className="block text-slate-300">
                      Display on page
                      <select value={personPageKey} onChange={e => setPersonPageKey(e.target.value)} className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-white">
                        <option value="">Do not assign to a page</option>
                        <optgroup label="Sections">
                          {categories.map(category => <option key={category.id} value={category.id}>{category.labelSi} / {category.labelEn}</option>)}
                        </optgroup>
                        <optgroup label="Custom pages">
                          {customPages.map(page => <option key={page.id} value={page.id}>{page.titleSi} / {page.titleEn}</option>)}
                        </optgroup>
                      </select>
                    </label>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Or upload image</label>
                    <input type="file" accept="image/*" onChange={e => handleFileUploadWithEditor(e, setPersonImage)} className="text-[10px] text-slate-400" />
                  </div>
                  {personImage && <SiteImage src={personImage} alt="Person preview" className="w-full max-h-60 rounded-xl border border-amber-500/20 bg-slate-950 object-contain" />}
                  <div className="flex gap-3">
                    <button type="submit" className="px-6 py-2.5 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition">
                      {editingPersonId ? '💾 Save card' : '➕ Add card'}
                    </button>
                    {editingPersonId && (
                      <button type="button" onClick={resetPeopleForm} className="px-4 py-2.5 rounded-xl font-bold bg-slate-800 text-slate-300 hover:bg-slate-700">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                {Object.entries(peopleBySection).map(([section, list]) => {
                  if (!list.length) return null;
                  return (
                    <div key={section} className="space-y-3">
                      <h4 className="font-bold text-amber-300">Saved {peopleSectionLabels[section] || section} ({list.length})</h4>
                      <p className="text-[10px] text-slate-400">↑ ↓ මඟින් අනුපිළිවෙළ වෙනස් කරන්න. Edit මඟින් section/page එක වෙනස් කළ හැකියි.</p>
                      <div className="space-y-2">
                        {list.map((person, index) => (
                          <div key={person.id} className="flex items-center gap-3 rounded-xl bg-slate-900 border border-amber-500/20 p-3">
                            <SiteImage src={person.image} alt={person.name} className="h-14 w-14 rounded-xl border border-amber-500/20 bg-slate-950 object-contain" />
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-white block truncate">{person.name}</span>
                              <span className="text-[10px] text-amber-400 block truncate">{person.role}</span>
                            </div>
                            <div className="flex flex-wrap justify-end gap-2">
                              <button type="button" onClick={() => movePersonCard(section, index, -1)} disabled={index === 0} aria-label={`Move ${person.name} up`} className="rounded-lg border border-slate-600 px-2 py-1.5 text-slate-200 enabled:hover:bg-slate-700 disabled:opacity-40">↑</button>
                              <button type="button" onClick={() => movePersonCard(section, index, 1)} disabled={index === list.length - 1} aria-label={`Move ${person.name} down`} className="rounded-lg border border-slate-600 px-2 py-1.5 text-slate-200 enabled:hover:bg-slate-700 disabled:opacity-40">↓</button>
                              <button type="button" onClick={() => editPersonCard(person)} className="px-3 py-1.5 rounded-lg bg-emerald-600/30 text-emerald-300 border border-emerald-500/30">Edit</button>
                              <button type="button" onClick={() => deletePersonCard(person.id, section)} className="px-3 py-1.5 rounded-lg bg-red-600/30 text-red-300 border border-red-500/30">Delete</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
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
                  <div className="space-y-2">
                    <label className="block font-bold text-slate-300">Page logo URL or Upload</label>
                    <input type="url" value={pageLogo} onChange={e => setPageLogo(e.target.value)} placeholder="https://example.com/logo.png" className="w-full rounded-xl border border-amber-500/30 bg-slate-950 p-2.5 text-white" />
                    <div className="flex flex-wrap items-center gap-3">
                      <input type="file" accept="image/*" onChange={e => handleFileUploadWithEditor(e, setPageLogo)} className="text-[10px] text-slate-400" />
                      {pageLogo && <SiteImage src={pageLogo} alt="Page logo preview" className="h-12 w-12 rounded-full border border-amber-500/30 object-cover" />}
                      {pageLogo && <button type="button" onClick={() => setPageLogo('')} className="rounded-lg border border-red-500/30 px-3 py-1.5 text-[10px] font-bold text-red-200">Remove logo</button>}
                    </div>
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

          </div>
        )}
      </main>

      {showExitConfirmation && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div role="dialog" aria-modal="true" aria-labelledby="admin-exit-title" className="w-full max-w-md space-y-4 rounded-3xl border-2 border-amber-500/40 bg-slate-900 p-6 shadow-2xl">
            <h3 id="admin-exit-title" className="text-lg font-black text-amber-300">වෙනස්කම් save කර exit වෙන්නද?</h3>
            <p className="text-sm leading-relaxed text-slate-300">
              Yes තෝරලා save කළොත් වෙනස්කම් වෙබ් අඩවියේ පෙන්වයි. No තෝරලා save නොකර exit වුණොත්, අවසන් වරට save කළ තොරතුරු නැවත පෙන්වයි.
            </p>
            {cloudSyncStatus === 'error' && <p className="text-xs text-red-300">Save error: {cloudSyncError}</p>}
            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setShowExitConfirmation(false)} className="rounded-xl border border-slate-600 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800">
                ඉන්න
              </button>
              <button type="button" onClick={discardAndExitAdmin} className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500">
                No — save නොකර exit
              </button>
              <button type="button" onClick={() => void saveAndExitAdmin()} disabled={isSavingSiteContent} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white hover:bg-emerald-500 disabled:opacity-50">
                {isSavingSiteContent ? 'Saving...' : 'Yes — Save & Exit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border-2 border-amber-500/40 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-amber-500/20 pb-3">
              <h3 className="text-base font-black text-amber-400">⚙️ පරිපාලන පද්ධතියට ප්‍රවේශ වීම</h3>
              <button onClick={() => setShowLoginModal(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
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
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleDonationSlipFile} required className="text-[10px] text-slate-400" />
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
              <h3 className="text-base font-black text-emerald-400">🎓 ශ්‍රී උපනන්ද දහම් පාසල - නවක සිසු ඇතුළත් වීම</h3>
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
                <SiteImage src={selectedPostModal.image} alt={selectedPostModal.titleSi} className="w-full h-full bg-slate-950 object-contain" />
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

      {/* WINNER DETAIL MODAL */}
      {selectedWinner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto" onClick={() => setSelectedWinner(null)}>
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-amber-500/40 bg-slate-900 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <SiteImage src={selectedWinner.image} alt={selectedWinner.name} className="max-h-[70vh] w-full bg-slate-950 object-contain" />
              <button onClick={() => setSelectedWinner(null)} className="absolute right-4 top-4 rounded-full bg-slate-950/80 px-3 py-1 text-sm text-white">✕</button>
            </div>
            <div className="space-y-4 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">{selectedWinner.year}</span>
                {selectedWinner.grade && <span className="text-xs font-bold text-amber-100/80">ශ්‍රේණිය {selectedWinner.grade}</span>}
              </div>
              {selectedWinner.place && <p className="text-sm font-black text-amber-300">{selectedWinner.place}</p>}
              <h3 className="text-2xl font-black text-amber-400">{selectedWinner.name}</h3>
              <p className="text-sm leading-relaxed text-slate-200">{selectedWinner.achievement}</p>
              {isAdmin && canAccess('winners') && (
                <button
                  type="button"
                  onClick={() => {
                    editWinner(selectedWinner);
                    setAdminSubTab('winners');
                    setSelectedWinner(null);
                  }}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-300"
                >
                  ✏️ Edit this winner
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FULL EVENTS CALENDAR MODAL */}
      {showEventsCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md" onClick={() => setShowEventsCalendar(false)}>
          <div className="w-full max-w-2xl rounded-3xl border border-amber-500/40 bg-slate-950 p-5 shadow-2xl" onClick={event => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-400">📅 {lang === 'si' ? 'සම්පූර්ණ දින දර්ශනය' : 'Full event calendar'}</p>
                <h3 className="mt-1 text-xl font-black text-amber-100">{lang === 'si' ? 'පෝය සහ විශේෂ වැඩසටහන්' : 'Poya & special programs'}</h3>
              </div>
              <button type="button" onClick={() => setShowEventsCalendar(false)} className="rounded-xl bg-slate-800 px-3 py-2 text-lg text-slate-300 hover:bg-slate-700">✕</button>
            </div>

            {allUpcomingEvents.length > 0 ? (
              <div className="max-h-[65vh] space-y-2 overflow-y-auto pr-1">
                {allUpcomingEvents.map(event => (
                  <div key={event.id} className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-slate-900/80 p-3">
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-amber-500/15 text-amber-300">
                      <span className="text-lg font-black leading-none">{Number(event.date.slice(-2))}</span>
                      <span className="text-[9px] uppercase">{formatEventDate(event.date, lang, 'month')}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-amber-300">{lang === 'si' ? event.tagSi : event.tagEn}</p>
                      <h4 className="truncate text-sm font-black text-white">{lang === 'si' ? event.titleSi : event.titleEn}</h4>
                      <p className="mt-1 text-[10px] text-slate-400">{formatEventDate(event.date, lang, 'weekday')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-slate-400">{lang === 'si' ? 'දැනට ඉදිරි සිදුවීම් නැත.' : 'No upcoming events.'}</p>
            )}
          </div>
        </div>
      )}

      {/* LIGHTBOX IMAGE MODAL */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl" onClick={() => setLightboxImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh]">
            <SiteImage src={lightboxImage} alt="Enlarged view" className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
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
              <canvas ref={imageEditorPreviewRef} aria-label="Edited image preview" className="max-h-56 max-w-full object-contain" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">කපනය (Crop) X: {cropX}%</label>
                <input type="range" min="0" max="50" value={cropX} onChange={e => setCropX(Number(e.target.value))} className="w-full accent-amber-500" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">කපනය (Crop) Y: {cropY}%</label>
                <input type="range" min="0" max="50" value={cropY} onChange={e => setCropY(Number(e.target.value))} className="w-full accent-amber-500" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">පළල (Width): {cropWidth}%</label>
                <input type="range" min="30" max="100" value={cropWidth} onChange={e => setCropWidth(Number(e.target.value))} className="w-full accent-amber-500" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">උස (Height): {cropHeight}%</label>
                <input type="range" min="30" max="100" value={cropHeight} onChange={e => setCropHeight(Number(e.target.value))} className="w-full accent-amber-500" />
              </div>
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
              {imageProcessingError && <p role="alert" className="mr-auto text-xs text-red-300">{imageProcessingError}</p>}
              {isImageProcessing && <p role="status" className="mr-auto text-xs text-amber-200">Image processing...</p>}
              <button type="button" disabled={isImageProcessing} onClick={() => setRawImageForEdit(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs disabled:opacity-50">අවලංගු කරන්න</button>
              <button type="button" disabled={isImageProcessing} onClick={applyImageEdits} className="px-6 py-2 rounded-xl font-bold bg-amber-500 text-slate-950 text-xs hover:bg-amber-400 disabled:cursor-wait disabled:opacity-60">{isImageProcessing ? 'Processing...' : '✨ වෙනස්කම් යොදන්න'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}