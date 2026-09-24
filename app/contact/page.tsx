'use client';

import { useState, useEffect, useMemo } from 'react';

interface Post {
  id: string;
  category: string;
  title: string;
  description: string;
  image?: string;
  youtubeUrl?: string;
}

const CATEGORIES = [
  { id: 'all', label: 'සියල්ල', icon: '✨' },
  { id: 'history', label: 'ඉතිහාසය', icon: '🏛️' },
  { id: 'dhamma', label: 'දහම් පාසල', icon: '🪷' },
  { id: 'monks', label: 'වැඩසිටින හිමිවරුන්', icon: '🧘‍♂️' },
  { id: 'videos', label: 'ධර්ම දේශනා & වීඩියෝ', icon: '🎥' },
  { id: 'social', label: 'සමාජ සේවා / ප්‍රජා සේවා', icon: '🤝' },
  { id: 'religious', label: 'ආගමික සේවා', icon: '☸️' },
  { id: 'pinkam', label: 'පිංකම්', icon: '🪔' },
  { id: 'memorial', label: 'ගුණ අනුස්මරණ', icon: '🙏' },
  { id: 'development', label: 'සංවර්ධන', icon: '🏗️' },
];

const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    category: 'history',
    title: 'විහාරස්ථානයේ ඓතිහාසික පසුබිම',
    description:
      'ශ්‍රී බෝධිරුක්ඛාරාමය, ගණිහිමුල්ල දෙවලපොල ප්‍රදේශයේ බෞද්ධ ජනතාවගේ මුදුන්මල්කඩ බඳු වූ පූජනීය ස්ථානයකි. අනුරාධපුර ශ්‍රී මහා බෝධීන් වහන්සේගේ ශාඛාවක් ලෙස රෝපණය කර ඇති බෝධීන් වහන්සේත්, සර්වඥ ධාතූන් නිධන් කළ චෛත්‍ය රාජයාණන් වහන්සේත්, පැරණි බුදු මැදුරත් මෙහි අතීත ශ්‍රී විභූතිය කියා පායි.',
  },
  {
    id: '2',
    category: 'monks',
    title: 'පූජ්‍ය ගණිහිමුල්ලේ ධම්මරතන නායක හිමි',
    description:
      'විහාරාධිපති, ශ්‍රී බෝධිරුක්ඛාරාමය. උන්වහන්සේ වසර 25 කට අධික කාලයක් විහාරස්ථානයේ සහ ප්‍රදේශයේ ශාසනික හා සාමාජික සේවයේ නිරත වී සිටිති.',
  },
  {
    id: '3',
    category: 'videos',
    title: 'සතිපට්ඨාන සුත්‍ර ධර්ම දේශනාව',
    description: 'විහාරස්ථානයේ පැවැත්වූ විශේෂ පෝදා ධර්ම දේශනාව නරඹන්න.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
];

// Enhanced YouTube ID extraction (Supports Shorts, Embeds, Standard URLs)
function getYouTubeId(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & Audio
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Ticker State
  const [tickerText, setTickerText] = useState(
    '2026 වසර සඳහා දහම් පාසලට නවක සිසුන් ඇතුළත් කිරීම ආරම්භ වේ. ✦ ධර්මාචාර්ය විභාග ප්‍රතිඵල නිකුත් වී ඇත. ✦ වාර්ෂික කඨින පිංකම පිළිබඳ විස්තර යාවත්කාලීන කර ඇත.'
  );
  const [tempTickerText, setTempTickerText] = useState('');

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('history');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const changeTheme = (newTheme: string) => {
    localStorage.setItem('temple_theme', newTheme);
    if (newTheme === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  // Load Saved Data & Theme on Mount
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const savedPosts = localStorage.getItem('temple_posts_v3');
      if (savedPosts) {
        setPosts(JSON.parse(savedPosts));
      } else {
        setPosts(INITIAL_POSTS);
        localStorage.setItem('temple_posts_v3', JSON.stringify(INITIAL_POSTS));
      }

      const savedTicker = localStorage.getItem('temple_ticker_v3');
      if (savedTicker) {
        setTickerText(savedTicker);
        setTempTickerText(savedTicker);
      } else {
        setTempTickerText(tickerText);
      }

      const savedTheme = localStorage.getItem('temple_theme');
      if (savedTheme) {
        changeTheme(savedTheme);
      }
    } catch (e) {
      console.error('Error loading data from localStorage:', e);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Keyboard Navigation for Modals (Escape key listener)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedImg(null);
        setShowDonateModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const savePosts = (updatedPosts: Post[]) => {
    setPosts(updatedPosts);
    try {
      localStorage.setItem('temple_posts_v3', JSON.stringify(updatedPosts));
    } catch (error) {
      alert('ලබාදුන් පින්තූරය විශාල වැඩියි. කරුණාකර කුඩා පින්තූරයක් භාවිත කරන්න.');
    }
  };

  const handleTickerSave = (e: React.FormEvent) => {
    e.preventDefault();
    setTickerText(tempTickerText);
    localStorage.setItem('temple_ticker_v3', tempTickerText);
    alert('පුවත් පුවරුවේ විස්තර සාර්ථකව යාවත්කාලීන විය!');
  };

  const toggleAdmin = () => {
    if (isAdmin) {
      setIsAdmin(false);
      alert('Admin Mode එකෙන් ඉවත් විය.');
    } else {
      const pwd = prompt('ඇඩ්මින් මුරපදය (Password: 1234):');
      if (pwd === '1234') {
        setIsAdmin(true);
        alert('Admin Mode එක Activate විය!');
      } else if (pwd !== null) {
        alert('මුරපදය වැරදියි!');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('කරුණාකර මාතෘකාව සහ විස්තරය ඇතුළත් කරන්න!');
      return;
    }

    if (editingId) {
      const updated = posts.map((p) =>
        p.id === editingId
          ? { ...p, category: selectedCategory, title, description, image, youtubeUrl }
          : p
      );
      savePosts(updated);
      alert('Post එක වෙනස් කරන ලදී!');
      setEditingId(null);
    } else {
      const newPost: Post = {
        id: Date.now().toString(),
        category: selectedCategory,
        title,
        description,
        image,
        youtubeUrl,
      };
      savePosts([newPost, ...posts]);
      alert('නව Post එක එකතු කරන ලදී!');
    }

    setTitle('');
    setDescription('');
    setImage('');
    setYoutubeUrl('');
    setActiveTab(selectedCategory);
  };

  const startEdit = (post: Post) => {
    setEditingId(post.id);
    setSelectedCategory(post.category);
    setTitle(post.title);
    setDescription(post.description);
    setImage(post.image || '');
    setYoutubeUrl(post.youtubeUrl || '');
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm('මෙම Post එක මකා දැමීමට විශ්වාසද?')) {
      const updated = posts.filter((p) => p.id !== id);
      savePosts(updated);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('ඡායාරූපයේ ප්‍රමාණය 2MB වලට වඩා අඩු විය යුතුය.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesTab = activeTab === 'all' || p.category === activeTab;
      const matchesSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [posts, activeTab, searchTerm]);

  const activeCategoryObj = CATEGORIES.find((c) => c.id === activeTab);

  return (
    <div className="min-h-screen pb-20 font-sans selection:bg-amber-500 selection:text-white">
      {/* Top Buddhist Flag Strip */}
      <div className="buddhist-flag-bar"></div>

      {/* Top Bar: Poya Notice & Donation Button */}
      <div className="bg-slate-900/95 text-amber-300 text-xs py-2 px-4 flex justify-between items-center border-b border-amber-500/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="hidden sm:inline">ඊළඟ පෝය දිනය:</span>
          <b className="text-amber-200">වප් පෝය (2026 ඔක්තෝබර් 25)</b>
        </div>
        <button
          onClick={() => setShowDonateModal(true)}
          className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white px-3.5 py-1 rounded-full border border-amber-300/30 shadow-md transition flex items-center gap-1.5 font-bold cursor-pointer"
        >
          <span>🙏</span> පිංකම් දායකත්වය / ආධාර
        </button>
      </div>

      {/* News Ticker */}
      <div className="bg-gradient-to-r from-amber-800 via-orange-600 to-amber-800 text-white px-4 py-2.5 text-xs md:text-sm font-medium flex items-center shadow-lg">
        <div className="font-bold pr-3 border-r border-amber-300/40 whitespace-nowrap flex items-center gap-1.5 text-amber-200">
          <span className="animate-pulse">🔔</span> පුවත් පුවරුව
        </div>
        <div className="overflow-hidden w-full pl-3">
          <span className="animate-scroll inline-block whitespace-nowrap">{tickerText}</span>
        </div>
      </div>

      {/* Hero Header */}
      <header className="relative py-14 px-4 text-center bg-[var(--header-bg)] border-b border-amber-500/20 shadow-sm overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-block mb-3 text-5xl animate-pulse">☸️</div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--primary-accent)] tracking-tight drop-shadow-md">
            ශ්‍රී බෝධිරුක්ඛාරාමය
          </h1>
          <div className="text-base md:text-xl font-medium opacity-90 mt-2 text-amber-900/90 dark:text-amber-200 tracking-wide">
            ගණිහිමුල්ල, දෙවලපොල
          </div>

          {/* Quick Counter Cards */}
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto mt-8">
            <div className="glass-card p-3 rounded-2xl text-center border border-amber-500/20 shadow-sm hover:scale-105 transition">
              <div className="text-xl md:text-2xl font-black text-amber-800 dark:text-amber-300">150+</div>
              <div className="text-[11px] md:text-xs opacity-80 font-medium">දහම් සිසුන්</div>
            </div>
            <div className="glass-card p-3 rounded-2xl text-center border border-amber-500/20 shadow-sm hover:scale-105 transition">
              <div className="text-xl md:text-2xl font-black text-amber-800 dark:text-amber-300">25+</div>
              <div className="text-[11px] md:text-xs opacity-80 font-medium">වසරක සේවය</div>
            </div>
            <div className="glass-card p-3 rounded-2xl text-center border border-amber-500/20 shadow-sm hover:scale-105 transition">
              <div className="text-xl md:text-2xl font-black text-amber-800 dark:text-amber-300">400+</div>
              <div className="text-[11px] md:text-xs opacity-80 font-medium">දායක පවුල්</div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation & Live Search Bar */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-b border-amber-500/15 shadow-md py-3.5 px-3">
        <div className="max-w-6xl mx-auto space-y-3">
          {/* Live Search Field */}
          <div className="max-w-md mx-auto relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 ලිපි, ධර්ම දේශනා හෝ තොරතුරු සොයන්න..."
              className="w-full pl-10 pr-10 py-2 text-sm rounded-full border border-amber-300/80 dark:border-slate-700 bg-white/90 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Navigation Category Tabs */}
          <div className="flex justify-center flex-wrap gap-1.5 p-1">
            {CATEGORIES.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full font-bold text-xs transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[var(--primary-accent)] text-white shadow-lg scale-105 ring-2 ring-amber-400/50'
                      : 'bg-white/80 dark:bg-slate-800/80 text-[var(--text-color)] hover:bg-amber-100/50 dark:hover:bg-slate-700 shadow-sm'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Display Area */}
      <main className="max-w-4xl mx-auto px-4 mt-8">
        {/* Section Title & Pirith Audio Controller */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-amber-500/20">
          <h2 className="text-xl md:text-2xl font-bold text-[var(--primary-accent)] flex items-center gap-2">
            <span>{activeCategoryObj?.icon || '📌'}</span>
            <span>{activeCategoryObj?.label}</span>
          </h2>

          {/* Audio Chanting Player */}
          <button
            onClick={() => setIsAudioPlaying(!isAudioPlaying)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer ${
              isAudioPlaying
                ? 'bg-emerald-600 text-white animate-pulse'
                : 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 hover:bg-amber-200'
            }`}
          >
            <span>{isAudioPlaying ? '🔊' : '🔈'}</span>
            <span>{isAudioPlaying ? 'පිරිත් වාදනය වේ' : 'පිරිත් ශ්‍රවණය'}</span>
          </button>
        </div>

        {/* Live Audio Streaming Player */}
        {isAudioPlaying && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-950/10 border border-emerald-500/30 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-spin">🪷</span>
              <div>
                <div className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  මහා පිරිත ශ්‍රවණය (Seth Pirith)
                </div>
                <div className="text-xs opacity-75">ශ්‍රී බෝධිරුක්ඛාරාම ශ්‍රව්‍ය පද්ධතිය</div>
              </div>
            </div>
            <audio controls autoPlay className="h-8 max-w-[180px] sm:max-w-[220px]">
              <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
            </audio>
          </div>
        )}

        {/* Posts Display List */}
        <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 glass-card">
              <div className="text-4xl mb-2">🪷</div>
              <div className="text-base font-semibold opacity-70">තොරතුරු සොයා ගැනීමට නොහැකි විය.</div>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const ytId = post.youtubeUrl ? getYouTubeId(post.youtubeUrl) : null;

              return (
                <article
                  key={post.id}
                  className="glass-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden group border border-amber-500/10"
                >
                  {/* Admin Controls */}
                  {isAdmin && (
                    <div className="flex justify-end gap-2 mb-3">
                      <button
                        onClick={() => startEdit(post)}
                        className="bg-amber-500 hover:bg-amber-600 text-white text-xs px-3 py-1 rounded-lg font-medium transition shadow-sm cursor-pointer"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-lg font-medium transition shadow-sm cursor-pointer"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}

                  <h3 className="text-xl md:text-2xl font-bold text-[var(--primary-accent)] mb-3 leading-snug">
                    {post.title}
                  </h3>

                  {/* YouTube Video Thumbnail View */}
                  {ytId ? (
                    <a
                      href={post.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative overflow-hidden rounded-2xl mb-4 group/yt shadow-md border border-red-500/30"
                    >
                      <img
                        src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                        alt={post.title}
                        className="w-full h-64 md:h-80 object-cover group-hover/yt:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover/yt:bg-black/20 transition flex items-center justify-center">
                        <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl group-hover/yt:scale-110 transition duration-300">
                          <span className="text-2xl ml-1">▶</span>
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-md shadow">
                        YouTube හි බලන්න ↗
                      </div>
                    </a>
                  ) : (
                    post.image && (
                      <div
                        onClick={() => setSelectedImg(post.image || null)}
                        className="overflow-hidden rounded-2xl mb-4 border border-black/5 shadow-inner max-h-96 cursor-pointer relative group/img"
                      >
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover/img:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                          🔍 පින්තූරය විශාල කර බලන්න
                        </div>
                      </div>
                    )
                  )}

                  <p className="leading-relaxed opacity-95 text-base md:text-lg whitespace-pre-line">
                    {post.description}
                  </p>
                </article>
              );
            })
          )}
        </div>

        {/* Admin Form Panel */}
        {isAdmin && (
          <div className="mt-12 space-y-8">
            {/* 1. Edit News Ticker Panel */}
            <div className="bg-orange-50 dark:bg-slate-800/90 p-6 rounded-2xl border-2 border-orange-400 shadow-xl">
              <h3 className="text-xl font-bold text-orange-700 dark:text-orange-400 mb-3 flex items-center gap-2">
                <span>🔔</span> පුවත් පුවරුවේ ලිපිය වෙනස් කිරීම
              </h3>
              <form onSubmit={handleTickerSave} className="space-y-3">
                <input
                  type="text"
                  value={tempTickerText}
                  onChange={(e) => setTempTickerText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-orange-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="පුවත් පුවරුවේ පෙනිය යුතු විස්තරය..."
                />
                <button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2.5 rounded-xl transition shadow cursor-pointer"
                >
                  පුවත් පුවරුව Save කරන්න
                </button>
              </form>
            </div>

            {/* 2. Add / Edit Post Panel */}
            <div className="bg-amber-50/90 dark:bg-slate-800/90 p-6 md:p-8 rounded-2xl border-2 border-amber-500/30 shadow-xl backdrop-blur">
              <div className="flex items-center gap-2 mb-4 border-b border-amber-500/20 pb-3">
                <span className="text-2xl">⚙️</span>
                <h2 className="text-xl md:text-2xl font-bold text-[var(--primary-accent)]">
                  {editingId ? 'Post එක Edit කරන්න' : 'අලුත් Post / වීඩියෝ / හාමුදුරුවන්ගේ විස්තර එකතු කරන්න'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1.5">Section (කොටස) තෝරන්න:</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-3 rounded-xl border border-amber-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1.5">මාතෘකාව (Title / නම):</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 rounded-xl border border-amber-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="මාතෘකාව / හාමුදුරුවන්ගේ නම ඇතුළත් කරන්න..."
                  />
                </div>

                {/* YouTube Link Field */}
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-red-600 flex items-center gap-1">
                    <span>🎥</span> YouTube Video Link එක (Optional):
                  </label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full p-3 rounded-xl border border-red-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <span className="text-xs text-gray-500 mt-1 block">
                    * YouTube Link එකක් දැමූ විට එහි Thumbnail එක ස්වයංක්‍රීයව වෙබ් අඩවියේ පෙනෙනු ඇත.
                  </span>
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-bold mb-1.5">ඡායාරූපයක් (Photo - Optional, Max 2MB):</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full p-2.5 rounded-xl border border-amber-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm"
                  />
                  {image && (
                    <div className="mt-2 relative w-32 h-20 rounded-lg overflow-hidden border">
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1.5">විස්තරය (Description):</label>
                  <textarea
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 rounded-xl border border-amber-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="විස්තරය මෙහි ලියන්න..."
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition cursor-pointer"
                  >
                    {editingId ? 'වෙනස්කම් Save කරන්න' : 'Post එක පළ කරන්න'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setTitle('');
                        setDescription('');
                        setImage('');
                        setYoutubeUrl('');
                      }}
                      className="bg-gray-500 text-white font-bold px-6 py-3.5 rounded-xl hover:bg-gray-600 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Lightbox Photo View Modal */}
      {selectedImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedImg(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImg} alt="Enlarged" className="w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" />
            <button
              onClick={() => setSelectedImg(null)}
              className="absolute -top-10 right-0 text-white text-sm font-bold bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-full cursor-pointer"
            >
              ✕ වසන්න (Esc)
            </button>
          </div>
        </div>
      )}

      {/* Donation & Pinkam Modal */}
      {showDonateModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowDonateModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 max-w-md w-full rounded-3xl p-6 shadow-2xl border border-amber-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-xl font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <span>🙏</span> පිංකම් දායකත්වය & ආධාර
              </h3>
              <button
                onClick={() => setShowDonateModal(false)}
                className="text-gray-400 hover:text-black dark:hover:text-white font-bold text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-sm opacity-85 mb-4 leading-relaxed">
              විහාරස්ථානයේ සංවර්ධන කටයුතු සහ පිංකම් සඳහා ඔබගේ දායකත්වය පහත බැංකු ගිණුම ඔස්සේ ලබා දිය හැක.
            </p>

            <div className="bg-amber-50 dark:bg-slate-900 p-4 rounded-2xl space-y-2 text-sm border border-amber-200 dark:border-slate-700">
              <div>
                <b>බැංකුව:</b> ලංකා බැංකුව (Bank of Ceylon)
              </div>
              <div>
                <b>ගිණුම් නම:</b> ශ්‍රී බෝධිරුක්ඛාරාම සංවර්ධන සභාව
              </div>
              <div>
                <b>ගිණුම් අංකය:</b> 1234567890
              </div>
              <div>
                <b>ශාඛාව:</b> මීගමුව
              </div>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText('1234567890');
                alert('ගිණුම් අංකය Copy කරගන්නා ලදී!');
              }}
              className="mt-5 w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl transition shadow-lg cursor-pointer"
            >
              📋 ගිණුම් අංකය Copy කරන්න
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2.5 z-50">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="ඉහළට යන්න"
          className="w-12 h-12 rounded-full bg-amber-600 text-white shadow-2xl flex items-center justify-center text-xl hover:scale-110 active:scale-95 transition cursor-pointer"
        >
          ⬆️
        </button>
        <button
          onClick={() => changeTheme('default')}
          title="සාමාන්‍ය තේමාව"
          className="w-12 h-12 rounded-full bg-white text-amber-600 shadow-xl flex items-center justify-center text-xl hover:scale-110 active:scale-95 transition border border-amber-200 cursor-pointer"
        >
          ☀️
        </button>
        <button
          onClick={() => changeTheme('vesak')}
          title="වෙසක් තේමාව"
          className="w-12 h-12 rounded-full bg-[#1a0b2e] text-amber-400 border border-amber-400 shadow-xl flex items-center justify-center text-xl hover:scale-110 active:scale-95 transition cursor-pointer"
        >
          🏮
        </button>
        <button
          onClick={() => changeTheme('poson')}
          title="පොසොන් තේමාව"
          className="w-12 h-12 rounded-full bg-[#eaf2f8] text-sky-600 border border-sky-300 shadow-xl flex items-center justify-center text-xl hover:scale-110 active:scale-95 transition cursor-pointer"
        >
          🌙
        </button>
        <button
          onClick={toggleAdmin}
          title="Admin Mode"
          className={`w-12 h-12 rounded-full shadow-2xl flex items-center justify-center text-xl hover:scale-110 active:scale-95 transition cursor-pointer ${
            isAdmin ? 'bg-emerald-600 text-white ring-4 ring-emerald-300' : 'bg-red-600 text-white'
          }`}
        >
          ⚙️
        </button>
      </div>
    </div>
  );
}