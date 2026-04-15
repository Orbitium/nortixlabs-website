import React, { useState, useEffect, useRef } from 'react';
import { auth, googleProvider } from '../../lib/firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import {
    LogOut, ShieldAlert, GraduationCap, LayoutDashboard,
    Settings, Users, MessageSquare, Calendar, Plus,
    X, Upload, Image as ImageIcon, Send, Loader2, Pencil, Trash2,
    ChevronDown, RefreshCw
} from 'lucide-react';

const API_BASE_URL = import.meta.env.PUBLIC_AKADEMIZ_API_URL || 'https://akademiz-api.nortixlabs.com';
const ADMIN_TAB_ROUTES = {
    dashboard: '/akademiz/admin',
    schedule: '/akademiz/admin/ders-programlari',
    'class-management': '/akademiz/admin/sinif-yonetimi'
};

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'class-management', label: 'Sınıf Yönetimi', icon: Users },
    { id: 'schedule', label: 'Ders Programları', icon: Settings },
    { id: 'events', label: 'Etkinlikler', icon: Calendar },
    { id: 'community', label: 'Topluluk', icon: Users },
    { id: 'news', label: 'Haberler', icon: MessageSquare }
];

const SCHEDULE_DAYS = [
    { key: 'PAZARTESI', label: 'Pazartesi' },
    { key: 'SALI', label: 'Salı' },
    { key: 'CARSAMBA', label: 'Çarşamba' },
    { key: 'PERSEMBE', label: 'Perşembe' },
    { key: 'CUMA', label: 'Cuma' },
    { key: 'CUMARTESI', label: 'Cumartesi' },
    { key: 'PAZAR', label: 'Pazar' }
];

const DEFAULT_SCHEDULE_TIMES = [
    '08:30',
    '09:30',
    '10:30',
    '11:30',
    '13:30',
    '14:30',
    '15:30',
    '16:30'
];
const DEFAULT_LESSON_DURATION_MINUTES = 45;

const AdminPanel = ({ initialTab = 'dashboard' }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(initialTab);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(''); // 'post'
    const [eventView, setEventView] = useState('list');
    const [eventNotice, setEventNotice] = useState('');
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const [communityPosts, setCommunityPosts] = useState([]);
    const [communityLoading, setCommunityLoading] = useState(false);
    const [communityError, setCommunityError] = useState('');
    const [communityLoaded, setCommunityLoaded] = useState(false);
    const [deletingPostId, setDeletingPostId] = useState(null);
    const [newsItems, setNewsItems] = useState([]);
    const [newsLoading, setNewsLoading] = useState(false);
    const [newsError, setNewsError] = useState('');
    const [newsLoaded, setNewsLoaded] = useState(false);
    const accountMenuRef = useRef(null);
    const activeNavItem = NAV_ITEMS.find((item) => item.id === activeTab);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    const tokenResult = await currentUser.getIdTokenResult();
                    const [_, domain] = currentUser.email.split('@');

                    if (domain && domain.toLowerCase().includes('.edu')) {
                        if (tokenResult.claims.admin) {
                            setUser(currentUser);
                            setError(null);
                        } else {
                            setError('Erişim reddedildi. Hesabınızda yönetici yetkisi bulunmuyor.');
                            // We don't sign out automatically here so they can see the error, 
                            // but we don't set the user state.
                            setUser(null);
                        }
                    } else {
                        setError('Erişim reddedildi. Yalnızca .edu uzantılı e-posta adreslerine izin verilir.');
                        signOut(auth);
                        setUser(null);
                    }
                } catch (err) {
                    console.error("Auth check failed", err);
                    setError("İç kimlik doğrulama hatası.");
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    useEffect(() => {
        const handlePointerDown = (event) => {
            if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
                setIsAccountMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        return () => document.removeEventListener('mousedown', handlePointerDown);
    }, []);

    useEffect(() => {
        setIsAccountMenuOpen(false);
    }, [activeTab]);

    useEffect(() => {
        if (activeTab !== 'events') {
            setEventView('list');
        }
    }, [activeTab]);

    useEffect(() => {
        if (!user || activeTab !== 'community' || communityLoaded) {
            return;
        }

        loadCommunityPosts();
    }, [user, activeTab, communityLoaded]);

    useEffect(() => {
        if (!user || activeTab !== 'news' || newsLoaded) {
            return;
        }

        loadNewsItems();
    }, [user, activeTab, newsLoaded]);

    const handleGoogleSignIn = async () => {
        try {
            setError(null);
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            setError('Google ile giriş yapılamadı. Lütfen tekrar deneyin.');
            console.error(err);
        }
    };

    const handleSwitchAccount = async () => {
        try {
            setError(null);
            setIsAccountMenuOpen(false);
            googleProvider.setCustomParameters({ prompt: 'select_account' });
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            setError('Hesap değiştirilemedi. Lütfen tekrar deneyin.');
            console.error(err);
        }
    };

    const handleSignOut = async () => {
        try {
            setIsAccountMenuOpen(false);
            await signOut(auth);
        } catch (err) {
            console.error(err);
        }
    };

    const openModal = (type) => {
        setModalType(type);
        setIsModalOpen(true);
    };

    const openEventCreator = () => {
        setActiveTab('events');
        setEventView('create');
        setEventNotice('');
    };

    const loadCommunityPosts = async () => {
        try {
            setCommunityLoading(true);
            setCommunityError('');
            const posts = await communityApi.listPosts();
            setCommunityPosts(posts);
            setCommunityLoaded(true);
        } catch (err) {
            setCommunityError(err.message || 'Topluluk gönderileri yüklenemedi.');
        } finally {
            setCommunityLoading(false);
        }
    };

    const handleEventCreated = () => {
        setEventView('list');
        setEventNotice('Etkinlik taslağı oluşturuldu. Liste bağlantısı geldiğinde burada görünecek.');
    };

    const loadNewsItems = async () => {
        try {
            setNewsLoading(true);
            setNewsError('');
            const items = await newsApi.listItems();
            setNewsItems(items);
            setNewsLoaded(true);
        } catch (err) {
            setNewsError(err.message || 'Haberler yüklenemedi.');
        } finally {
            setNewsLoading(false);
        }
    };

    const handlePostCreated = async () => {
        setIsModalOpen(false);
        setActiveTab('community');
        await loadCommunityPosts();
    };

    const handleDeletePost = async (postId) => {
        const confirmed = window.confirm('Bu gönderiyi silmek istediğinizden emin misiniz?');
        if (!confirmed) return;

        try {
            setDeletingPostId(postId);
            setCommunityError('');
            await communityApi.deletePost(postId);
            setCommunityPosts((prev) => prev.filter((post) => String(post.id) !== String(postId)));
        } catch (err) {
            setCommunityError(err.message || 'Gönderi silinemedi.');
        } finally {
            setDeletingPostId(null);
        }
    };

    const avatarInitial = (user?.displayName || user?.email || 'A').charAt(0).toUpperCase();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center px-6">
                <div className="max-w-md w-full">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center p-3 bg-cyan-500/10 rounded-2xl mb-4 border border-cyan-500/20">
                            <GraduationCap className="w-10 h-10 text-cyan-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">AkademiZ Yönetim</h1>
                        <p className="text-slate-400">Üniversite platformunu yönetmek için giriş yapın</p>
                    </div>

                    <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleGoogleSignIn}
                            className="w-full py-4 px-6 bg-white hover:bg-slate-100 text-slate-950 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                            Google ile giriş yap
                        </button>

                        <p className="mt-8 text-center text-xs text-slate-500">
                            Yalnızca yetkili <span className="text-cyan-400 font-semibold">.edu</span> e-posta adreslerine izin verilir.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 flex">
            {/* Sidebar */}
            <div className="w-64 border-r border-white/5 bg-slate-950/50 backdrop-blur-xl hidden md:flex flex-col">
                <div className="p-6 flex items-center gap-3 border-b border-white/5">
                    <GraduationCap className="w-8 h-8 text-cyan-400" />
                    <span className="font-bold text-xl tracking-tight text-white">AkademiZ</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {NAV_ITEMS.map((item) => (
                        <NavItem
                            key={item.id}
                            icon={<item.icon size={20} />}
                            label={item.label}
                            active={activeTab === item.id}
                            onClick={() => setActiveTab(item.id)}
                        />
                    ))}
                </nav>

            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="relative z-40 h-20 overflow-visible border-b border-white/5 bg-slate-950/30 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
                    <h2 className="text-xl font-semibold text-white">{activeNavItem?.label || activeTab}</h2>
                    <div className="relative" ref={accountMenuRef}>
                        <button
                            type="button"
                            onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                            className={`flex items-center gap-3 rounded-2xl border px-3 py-2 text-left transition ${isAccountMenuOpen
                                ? 'border-cyan-400/30 bg-cyan-400/10'
                                : 'border-white/10 bg-white/5 hover:border-white/15 hover:bg-white/[0.07]'
                                }`}
                        >
                            {user.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt={user.displayName}
                                    className="h-10 w-10 rounded-full border border-cyan-500/20 object-cover"
                                />
                            ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10 text-sm font-bold text-cyan-200">
                                    {avatarInitial}
                                </div>
                            )}

                            <div className="hidden min-w-0 sm:block">
                                <div className="truncate text-sm font-medium text-white">{user.displayName || 'Yönetici Hesabı'}</div>
                                <div className="truncate text-xs text-slate-500">{user.email}</div>
                            </div>

                            <ChevronDown
                                size={16}
                                className={`text-slate-400 transition ${isAccountMenuOpen ? 'rotate-180 text-white' : ''}`}
                            />
                        </button>

                        {isAccountMenuOpen && (
                            <div className="absolute right-0 z-[70] mt-3 w-72 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-[0_24px_60px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                                <div className="border-b border-white/5 px-4 py-4">
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">Hesap</div>
                                    <div className="mt-3 flex items-center gap-3">
                                        {user.photoURL ? (
                                            <img
                                                src={user.photoURL}
                                                alt={user.displayName}
                                                className="h-11 w-11 rounded-full border border-cyan-500/20 object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10 text-sm font-bold text-cyan-200">
                                                {avatarInitial}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <div className="truncate text-sm font-semibold text-white">{user.displayName || 'Yönetici Hesabı'}</div>
                                            <div className="truncate text-xs text-slate-500">{user.email}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-2">
                                    <button
                                        type="button"
                                        onClick={handleSwitchAccount}
                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                                    >
                                        <RefreshCw size={16} />
                                        <span>Hesap Değiştir</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSignOut}
                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                                    >
                                        <LogOut size={16} />
                                        <span>Çıkış Yap</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                <div className="md:hidden border-b border-white/5 bg-slate-950/40 px-4 py-3 overflow-x-auto">
                    <div className="flex gap-2 min-w-max">
                        {NAV_ITEMS.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${activeTab === item.id
                                    ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
                                    : 'border-white/10 bg-white/5 text-slate-400'
                                    }`}
                            >
                                <item.icon size={16} />
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                <main className="flex-1 overflow-y-auto p-8">
                    {activeTab === 'dashboard' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <StatCard title="Toplam Öğrenci" value="0" change="Geçen haftaya göre 0" />
                                <StatCard title="Aktif Etkinlik" value="0" change="Bugün başlayan 0" />
                                <StatCard title="Yayınlanan Haber" value="0" change="Onay bekleyen 0" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-semibold text-white">Son Etkinlikler</h3>
                                        <button className="text-cyan-400 text-sm hover:underline">Tümünü Gör</button>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="text-center py-8 text-slate-500 italic text-sm">
                                            Gösterilecek son etkinlik bulunmuyor
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6">
                                    <h3 className="text-lg font-semibold text-white mb-6">Hızlı İşlemler</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <QuickActionButton
                                            label="Sınıf Yönetimi"
                                            color="bg-cyan-500/20 text-cyan-400"
                                            icon={<Users size={20} />}
                                            onClick={() => setActiveTab('class-management')}
                                        />
                                        <QuickActionButton
                                            label="Programları Düzenle"
                                            color="bg-cyan-500/20 text-cyan-400"
                                            icon={<Settings size={20} />}
                                            onClick={() => setActiveTab('schedule')}
                                        />
                                        <QuickActionButton
                                            label="Etkinlik Ekle"
                                            color="bg-cyan-500/20 text-cyan-400"
                                            icon={<Plus size={20} />}
                                            onClick={openEventCreator}
                                        />
                                        <QuickActionButton
                                            label="Yeni Gönderi"
                                            color="bg-emerald-500/20 text-emerald-400"
                                            icon={<Plus size={20} />}
                                            onClick={() => openModal('post')}
                                        />
                                        <QuickActionButton
                                            label="Raporlar"
                                            color="bg-amber-500/20 text-amber-400"
                                            icon={<LayoutDashboard size={20} />}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'class-management' && <ClassManagementManager />}

                    {activeTab === 'schedule' && <ScheduleManager />}

                    {activeTab === 'events' && (
                        <div className="space-y-6">
                            {eventView === 'create' ? (
                                <EventForm
                                    user={user}
                                    onBack={() => setEventView('list')}
                                    onCreated={handleEventCreated}
                                />
                            ) : (
                                <>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-2xl font-bold text-white">Etkinlik Yönetimi</h3>
                                            <p className="mt-2 text-sm text-slate-500">Temel bilgileri hızlıca girin, kalan ayrıntıları isterseniz sonradan zenginleştirin.</p>
                                        </div>
                                        <button
                                            onClick={openEventCreator}
                                            className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-900/20"
                                        >
                                            <Plus size={20} />
                                            Etkinlik Oluştur
                                        </button>
                                    </div>

                                    {eventNotice && (
                                        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-100">
                                            {eventNotice}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex items-center justify-center h-48 italic text-slate-500">
                                            Etkinlik verileri burada yüklenecek...
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'community' && (
                        <div className="space-y-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <h3 className="text-2xl font-bold text-white">Topluluk Gönderileri</h3>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={loadCommunityPosts}
                                        disabled={communityLoading}
                                        className="flex items-center gap-2 px-4 py-3 border border-white/10 bg-white/5 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 text-slate-200 rounded-xl font-semibold transition-all"
                                    >
                                        <RefreshCw size={18} className={communityLoading ? 'animate-spin' : ''} />
                                        Yenile
                                    </button>
                                    <button
                                        onClick={() => openModal('post')}
                                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20"
                                    >
                                        <Plus size={20} />
                                        Yeni Gönderi
                                    </button>
                                </div>
                            </div>
                            <div className="max-w-3xl mx-auto space-y-6">
                                {communityError && (
                                    <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-100">
                                        {communityError}
                                    </div>
                                )}

                                {communityLoading && communityPosts.length === 0 && (
                                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex items-center justify-center h-48 italic text-slate-500">
                                        Gönderiler yükleniyor...
                                    </div>
                                )}

                                {!communityLoading && communityPosts.length === 0 && !communityError && (
                                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex items-center justify-center h-48 italic text-slate-500">
                                        Henüz topluluk gönderisi bulunmuyor.
                                    </div>
                                )}

                                {communityPosts.map((post) => (
                                    <article key={post.id} className="overflow-hidden rounded-3xl border border-white/5 bg-slate-900/45 backdrop-blur-xl">
                                        <div className="flex items-start gap-4 border-b border-white/5 px-6 py-5">
                                            {post.authorImage ? (
                                                <img
                                                    src={post.authorImage}
                                                    alt={post.authorName || 'Yazar'}
                                                    className="h-12 w-12 rounded-full border border-white/10 object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-sm font-bold text-emerald-200">
                                                    {(post.authorName || 'A').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <div className="text-base font-semibold text-white">{post.authorName || 'İsimsiz kullanıcı'}</div>
                                                <div className="mt-1 text-xs text-slate-500">{formatAdminDateTime(post.createdAt)}</div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleDeletePost(post.id)}
                                                disabled={deletingPostId === post.id}
                                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                {deletingPostId === post.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                                Sil
                                            </button>
                                        </div>

                                        <div className="space-y-5 px-6 py-5">
                                            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-200">{post.content}</p>

                                            {post.imageUrl && (
                                                <div className="overflow-hidden rounded-2xl border border-white/8 bg-slate-950/60">
                                                    <img
                                                        src={post.imageUrl.startsWith('/') ? `${API_BASE_URL}${post.imageUrl}` : post.imageUrl}
                                                        alt="Topluluk gönderisi görseli"
                                                        className="w-full object-cover"
                                                    />
                                                </div>
                                            )}

                                            {post.poll && (
                                                <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-5">
                                                    <div className="text-sm font-semibold text-white">{post.poll.question}</div>
                                                    <div className="mt-4 space-y-3">
                                                        {post.poll.options?.map((option) => (
                                                            <div key={option.id} className="rounded-2xl border border-white/5 bg-slate-950/50 px-4 py-3">
                                                                <div className="flex items-center justify-between gap-3">
                                                                    <span className="text-sm text-slate-200">{option.text}</span>
                                                                    <span className="text-xs font-semibold text-emerald-300">{option.votes ?? 0} oy</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-6 border-t border-white/5 pt-4 text-sm text-slate-400">
                                                <span>{post.likes ?? 0} beğeni</span>
                                                <span>{post.comments ?? 0} yorum</span>
                                                {post.poll && <span>{post.poll.isClosed ? 'Anket kapalı' : 'Anket açık'}</span>}
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'news' && (
                        <div className="space-y-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <h3 className="text-2xl font-bold text-white">Haber Akışı</h3>
                                <button
                                    onClick={loadNewsItems}
                                    disabled={newsLoading}
                                    className="flex items-center gap-2 px-4 py-3 border border-white/10 bg-white/5 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 text-slate-200 rounded-xl font-semibold transition-all"
                                >
                                    <RefreshCw size={18} className={newsLoading ? 'animate-spin' : ''} />
                                    Yenile
                                </button>
                            </div>

                            <div className="max-w-5xl mx-auto space-y-6">
                                {newsError && (
                                    <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-100">
                                        {newsError}
                                    </div>
                                )}

                                {newsLoading && newsItems.length === 0 && (
                                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex items-center justify-center h-48 italic text-slate-500">
                                        Haberler yükleniyor...
                                    </div>
                                )}

                                {!newsLoading && newsItems.length === 0 && !newsError && (
                                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex items-center justify-center h-48 italic text-slate-500">
                                        Henüz haber bulunmuyor.
                                    </div>
                                )}

                                {newsItems.map((item) => (
                                    <article key={item.id} className="overflow-hidden rounded-3xl border border-white/5 bg-slate-900/45 backdrop-blur-xl">
                                        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
                                            <div className="space-y-5 px-6 py-6">
                                                <div className="space-y-2">
                                                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                                                        {item.authorName || 'AkademiZ Haber Kaynağı'}
                                                    </div>
                                                    <h4 className="text-2xl font-bold text-white">{item.title || 'Başlıksız haber'}</h4>
                                                    <div className="text-sm text-slate-500">
                                                        {item.publishedAtText || formatAdminDateTime(item.publishedAt || item.createdAt)}
                                                    </div>
                                                </div>

                                                <p className="text-sm leading-7 text-slate-300">
                                                    {item.summary || item.fullText || 'Özet içeriği bulunmuyor.'}
                                                </p>

                                                {parseJsonArray(item.tags).length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {parseJsonArray(item.tags).map((tag) => (
                                                            <span key={`${item.id}-${tag}`} className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex flex-wrap items-center gap-6 border-t border-white/5 pt-4 text-sm text-slate-400">
                                                    <span>{item.views ?? 0} görüntülenme</span>
                                                    <span>{item.likes ?? 0} beğeni</span>
                                                    {item.detailUrl && (
                                                        <a
                                                            href={item.detailUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-cyan-300 transition hover:text-cyan-200 hover:underline"
                                                        >
                                                            Kaynağı Aç
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="border-t border-white/5 bg-slate-950/40 lg:border-l lg:border-t-0">
                                                {item.heroImage ? (
                                                    <img
                                                        src={item.heroImage}
                                                        alt={item.title || 'Haber görseli'}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full min-h-56 items-center justify-center px-6 text-sm italic text-slate-500">
                                                        Haber görseli bulunmuyor.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Modals */}
            {isModalOpen && modalType === 'post' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
                        <PostForm onClose={() => setIsModalOpen(false)} onSubmitted={handlePostCreated} user={user} />
                    </div>
                </div>
            )}
        </div>
    );
};

const useScheduleWorkspace = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [selectedScheduleId, setSelectedScheduleId] = useState('');
    const [selectedClassKey, setSelectedClassKey] = useState('');
    const [classes, setClasses] = useState([]);

    const loadSchedules = async () => {
        try {
            setLoading(true);
            setLoadError('');
            const [scheduleResponse, classResponse] = await Promise.all([
                scheduleApi.listSchedules(),
                classApi.listAdminClasses()
            ]);
            setSchedules(scheduleResponse);
            setClasses(classResponse);
            return scheduleResponse;
        } catch (err) {
            setLoadError(err.message || 'Ders programı yönetim verisi yüklenemedi.');
            return [];
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSchedules();
    }, []);

    useEffect(() => {
        if (schedules.length === 0) return;
        const selectedExists = schedules.some((schedule) => schedule.id === selectedScheduleId);
        if (!selectedExists) {
            setSelectedScheduleId(schedules[0].id);
        }
    }, [schedules, selectedScheduleId]);

    const selectedSchedule = schedules.find((schedule) => schedule.id === selectedScheduleId) || schedules[0];
    const availableClassKeys = selectedSchedule?.availableClassKeys || [];

    useEffect(() => {
        if (availableClassKeys.length === 0) return;
        if (!availableClassKeys.includes(selectedClassKey)) {
            setSelectedClassKey(availableClassKeys[0]);
        }
    }, [availableClassKeys, selectedClassKey]);

    return {
        schedules,
        loading,
        loadError,
        selectedScheduleId,
        setSelectedScheduleId,
        selectedClassKey,
        setSelectedClassKey,
        selectedSchedule,
        availableClassKeys,
        classes,
        reloadSchedules: loadSchedules
    };
};

const ClassManagementManager = () => {
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [selectedStep, setSelectedStep] = useState('faculties');
    const [selectedFacultyKey, setSelectedFacultyKey] = useState('');
    const [selectedDepartmentKey, setSelectedDepartmentKey] = useState('');
    const [gradeForm, setGradeForm] = useState({
        gradeNumber: ''
    });
    const [facultyForm, setFacultyForm] = useState(createEmptyFacultyFormState());
    const [facultyFormMode, setFacultyFormMode] = useState('create');
    const [departmentForm, setDepartmentForm] = useState(createEmptyDepartmentConfig());
    const [departmentFormMode, setDepartmentFormMode] = useState('edit');
    const [submittingAction, setSubmittingAction] = useState('');
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        const loadManagementData = async () => {
            try {
                setLoading(true);
                setError('');
                const [classResponse, facultyResponse] = await Promise.all([
                    classApi.listAdminClasses(),
                    academicFacultyApi.listFaculties()
                ]);
                if (!cancelled) {
                    setClasses(classResponse);
                    setFaculties(facultyResponse);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || 'Sınıf ve fakülte verileri yüklenemedi.');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadManagementData();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (faculties.length === 0) {
            setSelectedFacultyKey('');
            return;
        }

        const selectedExists = faculties.some((faculty) => faculty.key === selectedFacultyKey);
        if (!selectedExists) {
            setSelectedFacultyKey(faculties[0].key);
        }
    }, [faculties, selectedFacultyKey]);

    const selectedFaculty = faculties.find((faculty) => faculty.key === selectedFacultyKey) || null;
    const selectedDepartment = selectedFaculty?.departments.find((department) => department.key === selectedDepartmentKey) || null;
    const selectedDepartmentGrades = selectedDepartment?.grades || [];
    const canOpenDepartmentStep = Boolean(selectedFaculty);
    const canOpenGradeStep = Boolean(selectedFaculty && selectedDepartment);
    const facultyFormHasInvalidDepartment = facultyForm.departments.some((department) => !department.name.trim());
    const facultyFormHasInvalidGrade = facultyForm.departments.some((department) => {
        const levels = department.grades.map((grade) => Number(grade.level));
        const hasInvalidLevel = levels.some((level) => !Number.isInteger(level) || level < 1 || level > 6);
        return hasInvalidLevel || new Set(levels).size !== levels.length;
    });

    useEffect(() => {
        if (!selectedFaculty || selectedFaculty.departments.length === 0) {
            setSelectedDepartmentKey('');
            setDepartmentFormMode('create');
            setDepartmentForm(createEmptyDepartmentConfig());
            return;
        }

        const selectedExists = selectedFaculty.departments.some((department) => department.key === selectedDepartmentKey);
        const nextDepartment = selectedExists
            ? selectedFaculty.departments.find((department) => department.key === selectedDepartmentKey)
            : selectedFaculty.departments[0];

        if (nextDepartment && nextDepartment.key !== selectedDepartmentKey) {
            setSelectedDepartmentKey(nextDepartment.key);
        }
    }, [selectedFaculty, selectedDepartmentKey]);

    useEffect(() => {
        if (!selectedDepartment) {
            setDepartmentFormMode('create');
            setDepartmentForm(createEmptyDepartmentConfig());
            return;
        }

        setDepartmentFormMode('edit');
        setDepartmentForm({
            key: selectedDepartment.key,
            name: selectedDepartment.name,
            sortOrder: selectedDepartment.sortOrder ?? 0
        });
    }, [selectedDepartment]);

    const reloadManagementData = async ({ nextFacultyKey, nextDepartmentKey } = {}) => {
        const [classResponse, facultyResponse] = await Promise.all([
            classApi.listAdminClasses(),
            academicFacultyApi.listFaculties()
        ]);

        setClasses(classResponse);
        setFaculties(facultyResponse);

        const resolvedFaculty = nextFacultyKey
            ? facultyResponse.find((faculty) => faculty.key === nextFacultyKey)
            : facultyResponse.find((faculty) => faculty.key === selectedFacultyKey) || facultyResponse[0] || null;

        setSelectedFacultyKey(resolvedFaculty?.key || '');

        const resolvedDepartment = nextDepartmentKey
            ? resolvedFaculty?.departments.find((department) => department.key === nextDepartmentKey)
            : resolvedFaculty?.departments.find((department) => department.key === selectedDepartmentKey) || resolvedFaculty?.departments[0] || null;

        setSelectedDepartmentKey(resolvedDepartment?.key || '');
        return { classResponse, facultyResponse };
    };

    const handleGradeFormField = (field, value) => {
        setGradeForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleCreateGrade = async (e) => {
        e.preventDefault();

        const gradeNumber = Number(gradeForm.gradeNumber);
        if (!selectedDepartment) {
            setError('Önce bir departman seçin.');
            return;
        }

        if (!Number.isInteger(gradeNumber) || gradeNumber < 1 || gradeNumber > 6) {
            setError('Grade yalnızca 1 ile 6 arasında bir sayı olabilir.');
            return;
        }

        try {
            setSubmittingAction('create-grade');
            setError('');
            setNotice('');
            await classApi.createClass({
                departmentKey: selectedDepartment.key,
                level: gradeNumber,
                name: `${gradeNumber}. Grade`,
                key: `grade${gradeNumber}`,
                sortOrder: gradeNumber - 1
            });
            await reloadManagementData({
                nextFacultyKey: selectedFaculty?.key,
                nextDepartmentKey: selectedDepartment.key
            });
            setGradeForm({
                gradeNumber: ''
            });
            setNotice('Grade departman altında oluşturuldu.');
        } catch (err) {
            setError(err.message || 'Grade kaydı oluşturulamadı.');
        } finally {
            setSubmittingAction('');
        }
    };

    const handleDeleteGrade = async (grade) => {
        const confirmed = window.confirm('Bu grade silinirse öğrenci gradeKey alanı temizlenir ve ilgili manuel schedule blokları kaldırılır. Devam etmek istiyor musunuz?');
        if (!confirmed) return;

        try {
            setSubmittingAction(`delete-grade-${grade.key}`);
            setError('');
            setNotice('');
            await classApi.deleteClass(grade.key || grade.id);
            await reloadManagementData({
                nextFacultyKey: selectedFaculty?.key,
                nextDepartmentKey: selectedDepartment?.key
            });
            setNotice('Grade kaydı silindi.');
        } catch (err) {
            setError(err.message || 'Grade kaydı silinemedi.');
        } finally {
            setSubmittingAction('');
        }
    };

    const resetFacultyForm = () => {
        setFacultyFormMode('create');
        setFacultyForm(createEmptyFacultyFormState());
    };

    const handleFacultyFieldChange = (field, value) => {
        setFacultyForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleFacultyDepartmentFieldChange = (localId, field, value) => {
        setFacultyForm((prev) => ({
            ...prev,
            departments: prev.departments.map((department) => (
                department.localId === localId ? { ...department, [field]: value } : department
            ))
        }));
    };

    const handleFacultyDepartmentGradeFieldChange = (departmentLocalId, gradeLocalId, field, value) => {
        setFacultyForm((prev) => ({
            ...prev,
            departments: prev.departments.map((department) => {
                if (department.localId !== departmentLocalId) return department;
                return {
                    ...department,
                    grades: department.grades.map((grade) => (
                        grade.localId === gradeLocalId ? { ...grade, [field]: value } : grade
                    ))
                };
            })
        }));
    };

    const addFacultyDepartmentGradeRow = (departmentLocalId) => {
        setFacultyForm((prev) => ({
            ...prev,
            departments: prev.departments.map((department) => (
                department.localId === departmentLocalId
                    ? { ...department, grades: [...department.grades, createFacultyGradeDraft()] }
                    : department
            ))
        }));
    };

    const removeFacultyDepartmentGradeRow = (departmentLocalId, gradeLocalId) => {
        setFacultyForm((prev) => ({
            ...prev,
            departments: prev.departments.map((department) => (
                department.localId === departmentLocalId
                    ? { ...department, grades: department.grades.filter((grade) => grade.localId !== gradeLocalId) }
                    : department
            ))
        }));
    };

    const addFacultyDepartmentRow = () => {
        setFacultyForm((prev) => ({
            ...prev,
            departments: [...prev.departments, createFacultyDepartmentDraft()]
        }));
    };

    const removeFacultyDepartmentRow = (localId) => {
        setFacultyForm((prev) => ({
            ...prev,
            departments: prev.departments.filter((department) => department.localId !== localId)
        }));
    };

    const openFacultyCreate = () => {
        resetFacultyForm();
        setSelectedStep('faculties');
    };

    const openFacultyEdit = (faculty) => {
        setFacultyFormMode('edit');
        setFacultyForm(createFacultyFormStateFromFaculty(faculty));
        setSelectedFacultyKey(faculty.key);
        setSelectedStep('faculties');
    };

    const handleSubmitFaculty = async (e) => {
        e.preventDefault();

        if (!facultyForm.name.trim()) {
            setError('Fakülte adı zorunludur.');
            return;
        }

        if (facultyFormHasInvalidDepartment) {
            setError('Her departman satırında ad alanı zorunludur.');
            return;
        }

        const payload = serializeFacultyPayload(facultyForm);
        const nextFacultyKey = payload.key || facultyForm.originalKey;
        const nextDepartmentKey = payload.departments[0]?.key || '';

        try {
            setSubmittingAction(facultyFormMode === 'edit' ? 'update-faculty' : 'create-faculty');
            setError('');
            setNotice('');
            let response;

            if (facultyFormMode === 'edit' && facultyForm.originalKey) {
                response = await academicFacultyApi.updateFaculty(facultyForm.originalKey, payload);
            } else {
                response = await academicFacultyApi.createFaculty(payload);
            }

            await reloadManagementData({
                nextFacultyKey: response?.key || nextFacultyKey,
                nextDepartmentKey: response?.departments?.[0]?.key || nextDepartmentKey
            });
            setNotice(facultyFormMode === 'edit' ? 'Fakülte ağacı güncellendi.' : 'Fakülte oluşturuldu.');
            resetFacultyForm();
        } catch (err) {
            setError(err.message || 'Fakülte kaydı kaydedilemedi.');
        } finally {
            setSubmittingAction('');
        }
    };

    const handleDeleteFaculty = async (faculty) => {
        const confirmed = window.confirm('Bu fakülte silinirse öğrenci facultyKey, departmentKey, department ve gradeKey alanları temizlenir. Devam etmek istiyor musunuz?');
        if (!confirmed) return;

        try {
            setSubmittingAction(`delete-faculty-${faculty.key}`);
            setError('');
            setNotice('');
            await academicFacultyApi.deleteFaculty(faculty.key || faculty.id);
            await reloadManagementData();
            setNotice('Fakülte silindi.');
        } catch (err) {
            setError(err.message || 'Fakülte silinemedi.');
        } finally {
            setSubmittingAction('');
        }
    };

    const startDepartmentCreate = () => {
        setDepartmentFormMode('create');
        setDepartmentForm(createEmptyDepartmentConfig());
        setSelectedStep('departments');
    };

    const handleDepartmentFieldChange = (field, value) => {
        setDepartmentForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSaveDepartment = async (e) => {
        e.preventDefault();

        if (!selectedFaculty) {
            setError('Önce bir fakülte seçin.');
            return;
        }

        if (!departmentForm.name.trim()) {
            setError('Departman adı zorunludur.');
            return;
        }

        const nextDepartment = {
            key: departmentForm.key.trim() || undefined,
            name: departmentForm.name.trim(),
            sortOrder: departmentForm.sortOrder === '' ? undefined : Number(departmentForm.sortOrder),
            grades: departmentFormMode === 'edit' ? (selectedDepartment?.grades || []) : []
        };

        const nextDepartments = departmentFormMode === 'edit'
            ? selectedFaculty.departments.map((department) => (
                department.key === selectedDepartment?.key
                    ? { ...department, ...nextDepartment, key: nextDepartment.key || department.key }
                    : department
            ))
            : [...selectedFaculty.departments, nextDepartment];

        const payload = buildFacultyPayload(selectedFaculty, nextDepartments);
        const nextDepartmentKey = nextDepartment.key || selectedDepartment?.key || '';

        try {
            setSubmittingAction(departmentFormMode === 'edit' ? 'update-department' : 'create-department');
            setError('');
            setNotice('');
            const response = await academicFacultyApi.updateFaculty(selectedFaculty.key || selectedFaculty.id, payload);
            await reloadManagementData({
                nextFacultyKey: response?.key || payload.key,
                nextDepartmentKey: response?.departments?.find((department) => department.key === nextDepartmentKey)?.key || nextDepartmentKey
            });
            setNotice(departmentFormMode === 'edit' ? 'Departman ayarları güncellendi.' : 'Departman eklendi.');
        } catch (err) {
            setError(err.message || 'Departman kaydı kaydedilemedi.');
        } finally {
            setSubmittingAction('');
        }
    };

    const handleDeleteDepartment = async () => {
        if (!selectedFaculty || !selectedDepartment) return;

        const confirmed = window.confirm('Bu departman silinirse o departmana bağlı öğrencilerin departmentKey, department ve gradeKey alanları temizlenir. Devam etmek istiyor musunuz?');
        if (!confirmed) return;

        const nextDepartments = selectedFaculty.departments.filter((department) => department.key !== selectedDepartment.key);
        const payload = buildFacultyPayload(selectedFaculty, nextDepartments);

        try {
            setSubmittingAction('delete-department');
            setError('');
            setNotice('');
            const response = await academicFacultyApi.updateFaculty(selectedFaculty.key || selectedFaculty.id, payload);
            await reloadManagementData({
                nextFacultyKey: response?.key || payload.key,
                nextDepartmentKey: response?.departments?.[0]?.key || nextDepartments[0]?.key || ''
            });
            setNotice('Departman kaldırıldı.');
        } catch (err) {
            setError(err.message || 'Departman silinemedi.');
        } finally {
            setSubmittingAction('');
        }
    };

    if (loading) {
        return (
            <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-10 flex items-center justify-center min-h-[320px]">
                <div className="flex items-center gap-3 text-slate-400">
                    <Loader2 className="animate-spin text-cyan-400" />
                    Yönetim verileri yükleniyor...
                </div>
            </div>
        );
    }

    const stepItems = [
        { id: 'faculties', number: '1', label: 'Faculty', enabled: true },
        { id: 'departments', number: '2', label: 'Department', enabled: canOpenDepartmentStep },
        { id: 'grades', number: '3', label: 'Grades', enabled: canOpenGradeStep }
    ];

    return (
        <div className="space-y-6">
            <section className="rounded-[2rem] border border-cyan-500/15 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_rgba(15,23,42,0.92)_55%)] p-6 md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Sınıf Yönetimi</p>
                <h3 className="mt-3 text-3xl font-bold text-white">Faculty, department ve grade akışını adım adım yönetin</h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                    Önce fakülteyi seçin, sonra departmana inin. Grade seçimi departmanın içinde yapılır; ayrı bir mapping ekranı yoktur.
                </p>

                <div className="mt-6 grid gap-3 md:grid-cols-4">
                    {stepItems.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            disabled={!item.enabled}
                            onClick={() => setSelectedStep(item.id)}
                            className={`rounded-2xl border px-4 py-4 text-left transition ${selectedStep === item.id
                                ? 'border-cyan-400/35 bg-cyan-400/12'
                                : 'border-white/8 bg-slate-950/30'
                                } ${!item.enabled ? 'cursor-not-allowed opacity-40' : 'hover:border-cyan-300/20 hover:bg-cyan-400/8'}`}
                        >
                            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">Adım {item.number}</div>
                            <div className="mt-2 text-sm font-bold text-white">{item.label}</div>
                        </button>
                    ))}
                </div>
            </section>

            {(error || notice) && (
                <div className={`rounded-[2rem] border px-5 py-4 text-sm ${error
                    ? 'border-red-400/20 bg-red-400/10 text-red-100'
                    : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100'
                    }`}>
                    {error || notice}
                </div>
            )}

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div className="space-y-6">
                    {selectedStep === 'faculties' && (
                        <div className="space-y-6">
                            <div className="rounded-[2rem] border border-white/5 bg-slate-900/50 p-6 backdrop-blur-xl">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Adım 1</p>
                                        <h4 className="mt-2 text-xl font-bold text-white">Faculty Tree</h4>
                                        <p className="mt-2 text-sm leading-7 text-slate-400">
                                            Önce binayı yani fakülteyi seçin. Her fakülte kendi departmanlarını taşır.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={openFacultyCreate}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
                                    >
                                        <Plus size={18} />
                                        Create Faculty
                                    </button>
                                </div>

                                <div className="mt-6 space-y-4">
                                    {faculties.map((faculty) => (
                                        <div
                                            key={faculty.id}
                                            className={`rounded-[1.75rem] border p-5 transition ${selectedFaculty?.key === faculty.key
                                                ? 'border-cyan-400/25 bg-cyan-400/10'
                                                : 'border-white/8 bg-slate-950/50'
                                                }`}
                                        >
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedFacultyKey(faculty.key);
                                                        setSelectedStep('departments');
                                                    }}
                                                    className="flex-1 text-left"
                                                >
                                                    <div className="text-lg font-bold text-white">{faculty.name}</div>
                                                    <div className="mt-1 text-xs text-slate-500">{faculty.key} • sıra {faculty.sortOrder ?? 0}</div>
                                                </button>

                                                <div className="flex flex-wrap gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => openFacultyEdit(faculty)}
                                                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                                                    >
                                                        <Pencil size={16} />
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={submittingAction === `delete-faculty-${faculty.key}`}
                                                        onClick={() => handleDeleteFaculty(faculty)}
                                                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        {submittingAction === `delete-faculty-${faculty.key}` ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                                        Sil
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-4 space-y-3">
                                                {faculty.departments.map((department) => (
                                                    <button
                                                        key={department.key}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedFacultyKey(faculty.key);
                                                            setSelectedDepartmentKey(department.key);
                                                            setSelectedStep('departments');
                                                        }}
                                                        className="flex w-full flex-col gap-2 rounded-2xl border border-white/8 bg-slate-900/60 px-4 py-4 text-left transition hover:border-cyan-300/20 hover:bg-cyan-400/6"
                                                    >
                                                        <div className="text-sm font-semibold text-white">{department.name}</div>
                                                        <div className="text-xs text-slate-500">{department.key} • sıra {department.sortOrder ?? 0}</div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {(department.grades || []).map((grade) => (
                                                                <span key={grade.key} className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">
                                                                    {formatGradeLabel(grade)}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </button>
                                                ))}
                                                {faculty.departments.length === 0 && (
                                                    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 px-4 py-6 text-sm text-slate-500">
                                                        Bu fakülte altında henüz departman yok.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-[2rem] border border-white/5 bg-slate-900/50 p-6 backdrop-blur-xl">
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{facultyFormMode === 'edit' ? 'Edit Faculty' : 'Create Faculty'}</p>
                                    <h4 className="text-xl font-bold text-white">{facultyFormMode === 'edit' ? 'Fakülte ağacını güncelle' : 'Yeni fakülte oluştur'}</h4>
                                </div>

                                <form className="mt-6 grid gap-4" onSubmit={handleSubmitFaculty}>
                                    <ScheduleField label="Faculty Name">
                                        <input
                                            type="text"
                                            value={facultyForm.name}
                                            onChange={(e) => handleFacultyFieldChange('name', e.target.value)}
                                            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                                            placeholder="Engineering Faculty"
                                        />
                                    </ScheduleField>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <ScheduleField label="Opsiyonel Faculty Key">
                                            <input
                                                type="text"
                                                value={facultyForm.key}
                                                onChange={(e) => handleFacultyFieldChange('key', e.target.value)}
                                                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                                                placeholder="engineering"
                                            />
                                        </ScheduleField>
                                        <ScheduleField label="Opsiyonel Faculty Sort Order">
                                            <input
                                                type="number"
                                                value={facultyForm.sortOrder}
                                                onChange={(e) => handleFacultyFieldChange('sortOrder', e.target.value)}
                                                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                                                placeholder="0"
                                            />
                                        </ScheduleField>
                                    </div>

                                    <div className="space-y-4 rounded-[1.75rem] border border-white/8 bg-slate-950/40 p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-semibold text-white">Departments</div>
                                            <button
                                                type="button"
                                                onClick={addFacultyDepartmentRow}
                                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/15"
                                            >
                                                <Plus size={16} />
                                                Departman Satırı Ekle
                                            </button>
                                        </div>

                                        {facultyForm.departments.map((department) => (
                                            <div key={department.localId} className="rounded-[1.5rem] border border-white/8 bg-slate-900/60 p-4">
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <ScheduleField label="Departman Adı">
                                                        <input
                                                            type="text"
                                                            value={department.name}
                                                            onChange={(e) => handleFacultyDepartmentFieldChange(department.localId, 'name', e.target.value)}
                                                            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                                                            placeholder="Computer Programming"
                                                        />
                                                    </ScheduleField>
                                                    <ScheduleField label="Opsiyonel Key">
                                                        <input
                                                            type="text"
                                                            value={department.key}
                                                            onChange={(e) => handleFacultyDepartmentFieldChange(department.localId, 'key', e.target.value)}
                                                            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                                                            placeholder="computer-programming"
                                                        />
                                                    </ScheduleField>
                                                </div>

                                                <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,180px)_1fr]">
                                                    <ScheduleField label="Sort Order">
                                                        <input
                                                            type="number"
                                                            value={department.sortOrder}
                                                            onChange={(e) => handleFacultyDepartmentFieldChange(department.localId, 'sortOrder', e.target.value)}
                                                            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                                                            placeholder="0"
                                                        />
                                                    </ScheduleField>
                                                    <ScheduleField label="Grade Kayıtları">
                                                        <div className="space-y-3">
                                                            {department.grades.map((grade) => (
                                                                <div key={grade.localId} className="grid gap-3 rounded-2xl border border-white/8 bg-slate-950/50 p-4 sm:grid-cols-[110px_minmax(0,1fr)_minmax(0,1fr)_auto]">
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        max="6"
                                                                        value={grade.level}
                                                                        onChange={(e) => handleFacultyDepartmentGradeFieldChange(department.localId, grade.localId, 'level', e.target.value)}
                                                                        className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                                                                        placeholder="1"
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        value={grade.name}
                                                                        onChange={(e) => handleFacultyDepartmentGradeFieldChange(department.localId, grade.localId, 'name', e.target.value)}
                                                                        className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                                                                        placeholder="1. Grade"
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        value={grade.key}
                                                                        onChange={(e) => handleFacultyDepartmentGradeFieldChange(department.localId, grade.localId, 'key', e.target.value)}
                                                                        className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                                                                        placeholder="grade1"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeFacultyDepartmentGradeRow(department.localId, grade.localId)}
                                                                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-400/15"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                        Sil
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            <button
                                                                type="button"
                                                                onClick={() => addFacultyDepartmentGradeRow(department.localId)}
                                                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/15"
                                                            >
                                                                <Plus size={16} />
                                                                Grade Satırı Ekle
                                                            </button>
                                                        </div>
                                                    </ScheduleField>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removeFacultyDepartmentRow(department.localId)}
                                                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-400/15"
                                                >
                                                    <Trash2 size={16} />
                                                    Satırı Kaldır
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <button
                                            type="submit"
                                            disabled={facultyFormHasInvalidDepartment || facultyFormHasInvalidGrade || submittingAction === 'create-faculty' || submittingAction === 'update-faculty'}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {(submittingAction === 'create-faculty' || submittingAction === 'update-faculty') ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                            {facultyFormMode === 'edit' ? 'Faculty Tree Kaydet' : 'Faculty Oluştur'}
                                        </button>
                                        {facultyFormMode === 'edit' && (
                                            <button
                                                type="button"
                                                onClick={resetFacultyForm}
                                                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:text-white"
                                            >
                                                Formu Sıfırla
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {selectedStep === 'departments' && (
                        <div className="space-y-6">
                            <div className="rounded-[2rem] border border-white/5 bg-slate-900/50 p-6 backdrop-blur-xl">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Adım 2</p>
                                        <h4 className="mt-2 text-xl font-bold text-white">Department Selection</h4>
                                        <p className="mt-2 text-sm leading-7 text-slate-400">
                                            Seçili fakültenin departman metadata'sını yönetin. Grade kayıtları bir sonraki adımda departmanın altında oluşturulur.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={startDepartmentCreate}
                                        disabled={!selectedFaculty}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Plus size={18} />
                                        Yeni Departman
                                    </button>
                                </div>

                                {!selectedFaculty ? (
                                    <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-slate-950/40 px-4 py-8 text-center text-sm text-slate-500">
                                        Önce Adım 2'den bir fakülte seçin.
                                    </div>
                                ) : (
                                    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
                                        <div className="space-y-3">
                                            {selectedFaculty.departments.map((department) => (
                                                <button
                                                    key={department.key}
                                                    type="button"
                                                    onClick={() => setSelectedDepartmentKey(department.key)}
                                                    className={`flex w-full flex-col gap-2 rounded-2xl border px-4 py-4 text-left transition ${selectedDepartment?.key === department.key
                                                        ? 'border-cyan-400/25 bg-cyan-400/10'
                                                        : 'border-white/8 bg-slate-950/50 hover:border-cyan-300/20 hover:bg-cyan-400/6'
                                                        }`}
                                                >
                                                    <span className="text-sm font-semibold text-white">{department.name}</span>
                                                    <span className="text-xs text-slate-500">{department.key} • sıra {department.sortOrder ?? 0}</span>
                                                </button>
                                            ))}
                                            {selectedFaculty.departments.length === 0 && (
                                                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 px-4 py-6 text-sm text-slate-500">
                                                    Bu fakülte altında henüz departman yok.
                                                </div>
                                            )}
                                        </div>

                                        <form className="grid gap-4 rounded-[1.75rem] border border-white/8 bg-slate-950/40 p-5" onSubmit={handleSaveDepartment}>
                                            <ScheduleField label="Departman Adı">
                                                <input
                                                    type="text"
                                                    value={departmentForm.name}
                                                    onChange={(e) => handleDepartmentFieldChange('name', e.target.value)}
                                                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                                                    placeholder="Computer Programming"
                                                />
                                            </ScheduleField>

                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <ScheduleField label="Opsiyonel Key">
                                                    <input
                                                        type="text"
                                                        value={departmentForm.key}
                                                        onChange={(e) => handleDepartmentFieldChange('key', e.target.value)}
                                                        className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                                                        placeholder="computer-programming"
                                                    />
                                                </ScheduleField>
                                                <ScheduleField label="Opsiyonel Sort Order">
                                                    <input
                                                        type="number"
                                                        value={departmentForm.sortOrder}
                                                        onChange={(e) => handleDepartmentFieldChange('sortOrder', e.target.value)}
                                                        className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                                                        placeholder="0"
                                                    />
                                                </ScheduleField>
                                            </div>

                                            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-4 text-sm leading-7 text-amber-100">
                                                Departman key değişirse aynı key'e bağlı öğrenci kayıtları korunmaz. Mümkünse mevcut key'i koruyun.
                                            </div>

                                            <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 px-4 py-4 text-sm leading-7 text-cyan-100">
                                                Bu adım sadece departman kaydını günceller. Grade ekleme ve silme işlemleri Adım 3'te seçili departman altında yapılır.
                                            </div>

                                            <div className="flex flex-col gap-3 sm:flex-row">
                                                <button
                                                    type="submit"
                                                    disabled={!selectedFaculty || submittingAction === 'create-department' || submittingAction === 'update-department'}
                                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {(submittingAction === 'create-department' || submittingAction === 'update-department') ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                                    {departmentFormMode === 'edit' ? 'Departmanı Kaydet' : 'Departman Oluştur'}
                                                </button>
                                                {departmentFormMode === 'edit' && selectedDepartment && (
                                                    <button
                                                        type="button"
                                                        disabled={submittingAction === 'delete-department'}
                                                        onClick={handleDeleteDepartment}
                                                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        {submittingAction === 'delete-department' ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                                                        Departmanı Sil
                                                    </button>
                                                )}
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {selectedStep === 'grades' && (
                        <div className="rounded-[2rem] border border-white/5 bg-slate-900/50 p-6 backdrop-blur-xl">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Adım 3</p>
                                <h4 className="text-xl font-bold text-white">Grades</h4>
                                <p className="text-sm leading-7 text-slate-400">
                                    Grade kayıtları departmana bağlıdır. Anahtar backend tarafından `{departmentKey}-{gradeKey}` formatına genişletilir ve aynı departman içinde level tekrar edemez.
                                </p>
                            </div>

                            <form className="mt-6 grid gap-4" onSubmit={handleCreateGrade}>
                                <div className="rounded-2xl border border-white/8 bg-slate-950/50 px-4 py-4 text-sm text-slate-300">
                                    Hedef departman: <span className="font-semibold text-white">{selectedDepartment?.name || 'Seçilmedi'}</span>
                                    <span className="ml-2 text-xs text-slate-500">{selectedDepartment?.key || ''}</span>
                                </div>
                                <ScheduleField label="Grade Numarası">
                                    <input
                                        type="number"
                                        min="1"
                                        max="6"
                                        value={gradeForm.gradeNumber}
                                        onChange={(e) => handleGradeFormField('gradeNumber', e.target.value)}
                                        className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                                        placeholder="1"
                                    />
                                </ScheduleField>

                                <button
                                    type="submit"
                                    disabled={!selectedDepartment || submittingAction === 'create-grade'}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submittingAction === 'create-grade' ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                    Grade Oluştur
                                </button>
                            </form>

                            <div className="mt-8 space-y-3">
                                {selectedDepartmentGrades.map((item) => (
                                    <div
                                        key={item.id || item.key}
                                        className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-slate-950/50 px-4 py-4 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold text-white">{formatGradeLabel(item)}</div>
                                            <div className="mt-1 text-xs text-slate-500">{item.key} • level {item.level ?? '-'}</div>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={submittingAction === `delete-grade-${item.key}`}
                                            onClick={() => handleDeleteGrade(item)}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            {submittingAction === `delete-grade-${item.key}` ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                            Sil
                                        </button>
                                    </div>
                                ))}
                                {selectedDepartmentGrades.length === 0 && (
                                    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 px-4 py-6 text-sm text-slate-500">
                                        Seçili departman altında henüz grade yok.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="rounded-[2rem] border border-white/5 bg-slate-900/50 p-6 backdrop-blur-xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Seçim Özeti</p>
                        <div className="mt-4 space-y-4 text-sm">
                            <div>
                                <div className="text-slate-500">Faculty</div>
                                <div className="mt-1 font-semibold text-white">{selectedFaculty?.name || 'Seçilmedi'}</div>
                                <div className="mt-1 text-xs text-slate-500">{selectedFaculty?.key || 'Anahtar yok'}</div>
                            </div>
                            <div>
                                <div className="text-slate-500">Department</div>
                                <div className="mt-1 font-semibold text-white">{selectedDepartment?.name || 'Seçilmedi'}</div>
                                <div className="mt-1 text-xs text-slate-500">{selectedDepartment?.key || 'Anahtar yok'}</div>
                            </div>
                            <div>
                                <div className="text-slate-500">Department Grades</div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {selectedDepartmentGrades.length === 0 ? (
                                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">Grade yok</span>
                                    ) : (
                                        selectedDepartmentGrades.map((item) => (
                                            <span key={item.key} className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">
                                                {formatGradeLabel(item)}
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-white/5 bg-slate-900/50 p-6 backdrop-blur-xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Silme Uyarıları</p>
                        <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                            <p>Grade silmek öğrenci `gradeKey` alanını temizler ve ilgili manuel schedule bloklarını kaldırır.</p>
                            <p>Faculty silmek öğrenci `facultyKey`, `departmentKey`, `department` ve `gradeKey` alanlarını temizler.</p>
                            <p>PATCH fakülte ağacını bütünüyle değiştirir; request içinde yer almayan departmanlar ve departman içi grade kayıtları kaldırılır.</p>
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-white/5 bg-slate-900/50 p-6 backdrop-blur-xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Hızlı Geçiş</p>
                        <h4 className="mt-2 text-xl font-bold text-white">Program düzenleyicisini aç</h4>
                        <p className="mt-2 text-sm leading-7 text-slate-400">
                            Grade kayıtları tamamlandığında ders programı tarafına geçip departmana ait scoped grade anahtarının akışını düzenleyin.
                        </p>
                        <a
                            href={ADMIN_TAB_ROUTES.schedule}
                            className="mt-5 inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
                        >
                            Ders Programları Sayfasına Git
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

const ScheduleManager = () => {
    const {
        loading,
        loadError,
        selectedSchedule,
        schedules,
        selectedScheduleId,
        setSelectedScheduleId,
        selectedClassKey,
        setSelectedClassKey,
        classes,
        reloadSchedules
    } = useScheduleWorkspace();
    const [editorDrafts, setEditorDrafts] = useState({});
    const [loadedScheduleIds, setLoadedScheduleIds] = useState({});
    const [dirtyScheduleIds, setDirtyScheduleIds] = useState({});
    const [editorLoading, setEditorLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [editorState, setEditorState] = useState(null);
    const [timeSlotState, setTimeSlotState] = useState(null);
    const [quickAddState, setQuickAddState] = useState(null);
    const editorPayload = selectedSchedule ? editorDrafts[selectedSchedule.id] || null : null;
    const selectedClassInfo = classes.find((item) => item.key === selectedClassKey) || null;
    const selectedClassState = buildEditorClassState(editorPayload, selectedClassKey);
    const scheduleBoard = buildScheduleBoard(selectedClassState);
    const isEditorRefreshing = Boolean(selectedSchedule && editorLoading && !editorPayload);
    const selectedCell = editorState
        ? scheduleBoard.cellMap[makeScheduleCellKey(editorState.dayKey, editorState.time)] || createEmptyScheduleCell(editorState.dayKey, editorState.time)
        : null;
    const hasUnsavedChanges = Boolean(selectedSchedule && dirtyScheduleIds[selectedSchedule.id]);

    useEffect(() => {
        let cancelled = false;

        const loadEditor = async () => {
            if (!selectedSchedule) {
                setEditorLoading(false);
                return;
            }
            if (loadedScheduleIds[selectedSchedule.id]) {
                setEditorLoading(false);
                return;
            }
            try {
                setEditorLoading(true);
                const response = await scheduleApi.getScheduleEditor(selectedSchedule.id);
                if (!cancelled) {
                    setEditorDrafts((prev) => ({ ...prev, [selectedSchedule.id]: response }));
                    setLoadedScheduleIds((prev) => ({ ...prev, [selectedSchedule.id]: true }));
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || 'Ders programı düzenleyici verisi yüklenemedi.');
                }
            } finally {
                if (!cancelled) {
                    setEditorLoading(false);
                }
            }
        };

        setEditorState(null);
        setTimeSlotState(null);
        setQuickAddState(null);
        setError('');
        setNotice('');
        loadEditor();

        return () => {
            cancelled = true;
        };
    }, [selectedSchedule?.id, loadedScheduleIds]);

    const openEditor = (cell) => {
        const existingLesson = cell.manualLessons[0] || cell.effectiveLessons[0] || null;
        setError('');
        setNotice('');
        setEditorState({
            dayKey: cell.dayKey,
            time: cell.time,
            manualLessonId: cell.manualLessons[0]?.id || '',
            courseCode: existingLesson?.courseCode || '',
            courseName: existingLesson?.courseName || '',
            instructor: existingLesson?.instructor || '',
            classroom: existingLesson?.classroom || ''
        });
    };

    const closeEditor = () => {
        if (saving) return;
        setEditorState(null);
    };

    const openNewTimeSlotEditor = () => {
        setEditorState(null);
        setError('');
        setNotice('');
        setTimeSlotState({
            isNew: true,
            previousTime: '',
            startTime: '',
            endTime: ''
        });
    };

    const openTimeSlotEditor = (slot) => {
        setEditorState(null);
        setError('');
        setNotice('');
        setTimeSlotState({
            isNew: false,
            previousTime: slot.time,
            startTime: slot.time,
            endTime: slot.endTime || addMinutesToTime(slot.time, DEFAULT_LESSON_DURATION_MINUTES)
        });
    };

    const closeTimeSlotEditor = () => {
        if (saving) return;
        setTimeSlotState(null);
    };

    const openQuickAddEditor = () => {
        setEditorState(null);
        setTimeSlotState(null);
        setError('');
        setNotice('');
        setQuickAddState({
            dayKey: SCHEDULE_DAYS[0]?.key || 'PAZARTESI',
            rawText: ''
        });
    };

    const closeQuickAddEditor = () => {
        if (saving) return;
        setQuickAddState(null);
    };

    const updateEditorField = (field, value) => {
        setEditorState((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

    const updateTimeSlotField = (field, value) => {
        setTimeSlotState((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

    const updateQuickAddField = (field, value) => {
        setQuickAddState((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

    const handleSaveLesson = (e) => {
        e.preventDefault();
        if (!selectedSchedule || !editorState) return;

        if (!editorState.courseName.trim()) {
            setError('Ders adı zorunludur.');
            return;
        }

        if (!isValidTime(editorState.time)) {
            setError('Saat hücresi verisi geçersiz. Lütfen farklı bir kutu seçin.');
            return;
        }

        const nextClassSchedule = upsertLessonInSchedule(
            selectedClassState.manualSchedule,
            {
                id: editorState.manualLessonId || undefined,
                dayKey: editorState.dayKey,
                time: editorState.time.trim(),
                courseCode: editorState.courseCode.trim(),
                courseName: editorState.courseName.trim(),
                instructor: editorState.instructor.trim(),
                classroom: editorState.classroom.trim()
            }
        );

        setEditorDrafts((prev) => ({
            ...prev,
            [selectedSchedule.id]: applyLocalClassScheduleToPayload(prev[selectedSchedule.id], selectedClassKey, nextClassSchedule)
        }));
        setDirtyScheduleIds((prev) => ({ ...prev, [selectedSchedule.id]: true }));
        setError('');
        setNotice('Program taslağı güncellendi. API isteği için sayfadaki kaydet butonunu kullanın.');
        setEditorState(null);
    };

    const handleDeleteLesson = () => {
        if (!selectedSchedule || !editorState?.manualLessonId) return;

        const nextClassSchedule = deleteLessonFromSchedule(
            selectedClassState.manualSchedule,
            editorState.dayKey,
            editorState.manualLessonId,
            editorState.time
        );

        setEditorDrafts((prev) => ({
            ...prev,
            [selectedSchedule.id]: applyLocalClassScheduleToPayload(prev[selectedSchedule.id], selectedClassKey, nextClassSchedule)
        }));
        setDirtyScheduleIds((prev) => ({ ...prev, [selectedSchedule.id]: true }));
        setError('');
        setNotice('Program taslağından manuel ders kaldırıldı. API isteği için sayfadaki kaydet butonunu kullanın.');
        setEditorState(null);
    };

    const handleSaveTimeSlot = (e) => {
        e.preventDefault();
        if (!selectedSchedule || !timeSlotState) return;

        if (!isValidTime(timeSlotState.startTime)) {
            setError('Başlangıç saati geçersiz.');
            return;
        }

        if (!isValidTime(timeSlotState.endTime)) {
            setError('Bitiş saati geçersiz.');
            return;
        }

        if (timeToMinutes(timeSlotState.endTime) <= timeToMinutes(timeSlotState.startTime)) {
            setError('Bitiş saati başlangıç saatinden sonra olmalıdır.');
            return;
        }

        let nextClassSchedule;

        if (timeSlotState.isNew) {
            nextClassSchedule = upsertEmptySlotInSchedule(
                selectedClassState.manualSchedule,
                timeSlotState.startTime
            );
        } else {
            nextClassSchedule = renameTimeInSchedule(
                selectedClassState.manualSchedule,
                timeSlotState.previousTime,
                timeSlotState.startTime
            );
        }

        setEditorDrafts((prev) => ({
            ...prev,
            [selectedSchedule.id]: applyLocalClassScheduleToPayload(prev[selectedSchedule.id], selectedClassKey, nextClassSchedule)
        }));
        setDirtyScheduleIds((prev) => ({ ...prev, [selectedSchedule.id]: true }));
        setError('');
        setNotice(timeSlotState.isNew
            ? 'Saat satırı taslağa eklendi. API isteği için sayfadaki kaydet butonunu kullanın.'
            : 'Saat satırı taslakta güncellendi. API isteği için sayfadaki kaydet butonunu kullanın.');
        setTimeSlotState(null);
    };

    const handleDeleteTimeSlot = () => {
        if (!selectedSchedule || !timeSlotState?.previousTime) return;

        const nextClassSchedule = deleteTimeFromSchedule(
            selectedClassState.manualSchedule,
            timeSlotState.previousTime
        );

        setEditorDrafts((prev) => ({
            ...prev,
            [selectedSchedule.id]: applyLocalClassScheduleToPayload(prev[selectedSchedule.id], selectedClassKey, nextClassSchedule)
        }));
        setDirtyScheduleIds((prev) => ({ ...prev, [selectedSchedule.id]: true }));
        setError('');
        setNotice('Saat satırı ve bu saate bağlı manuel kayıtlar taslaktan kaldırıldı. API isteği için sayfadaki kaydet butonunu kullanın.');
        setTimeSlotState(null);
    };

    const handleApplyQuickAdd = (e) => {
        e.preventDefault();
        if (!selectedSchedule || !quickAddState) return;

        const parsedLessons = parseQuickAddScheduleText(quickAddState.rawText);
        if (parsedLessons.length === 0) {
            setError('Yapıştırılan metinden ders satırı çözülemedi.');
            return;
        }

        const nextClassSchedule = replaceDayInSchedule(
            selectedClassState.manualSchedule,
            quickAddState.dayKey,
            parsedLessons
        );

        setEditorDrafts((prev) => ({
            ...prev,
            [selectedSchedule.id]: applyLocalClassScheduleToPayload(prev[selectedSchedule.id], selectedClassKey, nextClassSchedule)
        }));
        setDirtyScheduleIds((prev) => ({ ...prev, [selectedSchedule.id]: true }));
        setError('');
        setNotice(`${getDayLabel(quickAddState.dayKey)} günü için hızlı ekleme taslağa uygulandı. API isteği için sayfadaki kaydet butonunu kullanın.`);
        setQuickAddState(null);
    };

    const handleSaveSchedule = async () => {
        if (!selectedSchedule || !editorPayload || !hasUnsavedChanges) return;

        try {
            setSaving(true);
            setError('');
            setNotice('');

            const response = await scheduleApi.saveManualSchedule({
                scheduleId: selectedSchedule.id,
                manualSchedule: editorPayload.manualSchedule || {}
            });

            setEditorDrafts((prev) => ({ ...prev, [selectedSchedule.id]: response }));
            setDirtyScheduleIds((prev) => ({ ...prev, [selectedSchedule.id]: false }));
            await reloadSchedules();
            setNotice('Ders programı değişiklikleri kaydedildi.');
        } catch (err) {
            setError(err.message || 'Program kaydedilemedi.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-10 flex items-center justify-center min-h-[320px]">
                <div className="flex items-center gap-3 text-slate-400">
                    <Loader2 className="animate-spin text-cyan-400" />
                    Program yükleniyor...
                </div>
            </div>
        );
    }

    if (!selectedSchedule || !selectedClassState) {
        return (
            <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-10 text-center text-slate-400">
                Düzenlenebilir ders programı bulunamadı.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <section className="rounded-[2rem] border border-cyan-500/15 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_rgba(15,23,42,0.92)_55%)] p-6 md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Ders Programı Düzenleyici</p>
                <h3 className="mt-3 text-3xl font-bold text-white">{selectedSchedule.programName}</h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                    Aktif grade anahtarı {formatClassKeyLabel(selectedClassKey, selectedClassInfo)} olarak seçildi. Hücre düzenlemeleri önce taslakta tutulur, ardından tek kaydet işlemiyle backend'e gönderilir.
                </p>
                <a
                    href={ADMIN_TAB_ROUTES['class-management']}
                    className="mt-5 inline-flex items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/30 hover:bg-cyan-400/15"
                >
                    Sınıf Yönetimine Git
                </a>
                <button
                    type="button"
                    onClick={handleSaveSchedule}
                    disabled={saving || isEditorRefreshing || !hasUnsavedChanges}
                    className="mt-5 ml-3 inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                    Değişiklikleri Kaydet
                </button>
            </section>

            {(loadError || error || notice) && (
                <div className={`rounded-[2rem] border px-5 py-4 text-sm ${(loadError || error)
                    ? 'border-red-400/20 bg-red-400/10 text-red-100'
                    : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100'
                    }`}>
                    {loadError || error || notice}
                </div>
            )}

            <section className="grid gap-6">
                <div className="space-y-6">
                    <div className="rounded-[2rem] border border-white/5 bg-slate-900/50 p-6 backdrop-blur-xl">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Program Seçimi</p>
                            <h4 className="text-xl font-bold text-white">Düzenlenecek ders programı</h4>
                        </div>
                        <ScheduleClassPicker
                            schedules={schedules}
                            selectedScheduleId={selectedScheduleId}
                            onSelect={setSelectedScheduleId}
                            disabled={editorLoading}
                        />
                    </div>

                    <div className="rounded-[2rem] border border-white/5 bg-slate-900/50 p-6 backdrop-blur-xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Grade Anahtarı</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            {(selectedSchedule?.availableClassKeys || []).map((classKey) => (
                                <button
                                    key={classKey}
                                    type="button"
                                    onClick={() => setSelectedClassKey(classKey)}
                                    disabled={editorLoading}
                                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${selectedClassKey === classKey
                                        ? 'bg-cyan-500 text-slate-950'
                                        : 'border border-white/10 bg-white/5 text-slate-300 hover:text-white'
                                        } ${editorLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                                >
                                    {formatClassKeyLabel(classKey, classes.find((item) => item.key === classKey))}
                                </button>
                            ))}
                        </div>
                        {selectedClassInfo && (
                            <div className="mt-4 rounded-2xl border border-white/8 bg-slate-950/50 px-4 py-4 text-sm text-slate-300">
                                <div className="font-semibold text-white">{selectedClassInfo.departmentName || selectedClassInfo.departmentKey}</div>
                                <div className="mt-1 text-xs text-slate-500">
                                    {selectedClassInfo.facultyName || selectedClassInfo.facultyKey} • level {selectedClassInfo.level ?? '-'}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    {isEditorRefreshing ? (
                        <div className="rounded-[2rem] border border-white/5 bg-slate-900/50 p-10 backdrop-blur-xl">
                            <div className="flex min-h-[320px] items-center justify-center gap-3 text-slate-400">
                                <Loader2 className="animate-spin text-cyan-400" />
                                Program bileşenleri güncelleniyor...
                            </div>
                        </div>
                    ) : (
                        <ScheduleBoardCard
                            board={scheduleBoard}
                            onCellClick={openEditor}
                            onAddTimeSlot={openNewTimeSlotEditor}
                            onQuickAdd={openQuickAddEditor}
                            onTimeSlotClick={openTimeSlotEditor}
                            saving={saving}
                        />
                    )}
                </div>
            </section>

            {editorState && selectedCell && (
                <ScheduleLessonModal
                    state={editorState}
                    cell={selectedCell}
                    saving={saving}
                    error={error}
                    onClose={closeEditor}
                    onFieldChange={updateEditorField}
                    onDelete={handleDeleteLesson}
                    onSubmit={handleSaveLesson}
                />
            )}

            {timeSlotState && (
                <ScheduleTimeSlotModal
                    state={timeSlotState}
                    saving={saving}
                    error={error}
                    onClose={closeTimeSlotEditor}
                    onFieldChange={updateTimeSlotField}
                    onDelete={handleDeleteTimeSlot}
                    onSubmit={handleSaveTimeSlot}
                />
            )}

            {quickAddState && (
                <ScheduleQuickAddModal
                    state={quickAddState}
                    saving={saving}
                    error={error}
                    onClose={closeQuickAddEditor}
                    onFieldChange={updateQuickAddField}
                    onSubmit={handleApplyQuickAdd}
                />
            )}
        </div>
    );
};

// Forms
const EventForm = ({ onBack, onCreated, user }) => {
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        location: '',
        description: '',
        thumbnailUrl: '',
        creatorName: user?.displayName || 'AkademiZ Admin',
        eventLength: '',
        maxJoiners: '',
        tags: '',
        carouselImages: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingTarget, setUploadingTarget] = useState('');
    const [submitError, setSubmitError] = useState('');

    const handleImageUpload = async (e, type) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploadingTarget(type);
        const token = await auth.currentUser.getIdToken(true);

        try {
            const uploadedUrls = [];

            for (const file of files) {
                const data = new FormData();
                data.append('image', file);

                const res = await fetch(`${API_BASE_URL}/upload/image`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: data
                });

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Yükleme başarısız oldu: ${res.status} ${text}`);
                }

                const result = await res.json();
                uploadedUrls.push(result.url);
            }

            if (type === 'thumbnail') {
                setFormData((prev) => ({ ...prev, thumbnailUrl: uploadedUrls[0] || '' }));
            } else {
                setFormData((prev) => ({
                    ...prev,
                    carouselImages: [...prev.carouselImages, ...uploadedUrls]
                }));
            }
        } catch (err) {
            console.error('Yükleme başarısız oldu', err);
            alert(err.message);
        } finally {
            setUploadingTarget('');
            e.target.value = '';
        }
    };

    const removeGalleryImage = (index) => {
        setFormData((prev) => ({
            ...prev,
            carouselImages: prev.carouselImages.filter((_, imageIndex) => imageIndex !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError('');
        try {
            const token = await auth.currentUser.getIdToken(true);
            const parsedEventLength = parseFloat(formData.eventLength);
            const parsedMaxJoiners = parseInt(formData.maxJoiners, 10);
            const parsedTags = formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean);

            const payload = {
                title: formData.title.trim(),
                date: formData.date,
                description: formData.description.trim(),
                location: formData.location.trim(),
                thumbnailUrl: formData.thumbnailUrl,
                creatorName: formData.creatorName.trim() || user?.displayName || 'AkademiZ Admin',
                tags: JSON.stringify(parsedTags),
                carouselImages: JSON.stringify(formData.carouselImages),
                saveAsDraft: true,
                status: 'draft'
            };

            if (Number.isFinite(parsedEventLength)) {
                payload.eventLength = parsedEventLength;
            }

            if (Number.isFinite(parsedMaxJoiners)) {
                payload.maxJoiners = parsedMaxJoiners;
            }

            const res = await fetch(`${API_BASE_URL}/events/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setFormData({
                    title: '',
                    date: '',
                    location: '',
                    description: '',
                    thumbnailUrl: '',
                    creatorName: user?.displayName || 'AkademiZ Admin',
                    eventLength: '',
                    maxJoiners: '',
                    tags: '',
                    carouselImages: []
                });
                onCreated?.();
            } else {
                const text = await res.text();
                throw new Error(text || 'Etkinlik oluşturulamadı.');
            }
        } catch (err) {
            console.error('Etkinlik oluşturma başarısız oldu', err);
            setSubmitError(err.message || 'Etkinlik oluşturma başarısız oldu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <section className="rounded-[2rem] border border-cyan-500/15 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_rgba(15,23,42,0.92)_58%)] p-6 md:p-8">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Etkinlik Oluşturucu</p>
                        <h3 className="mt-3 text-2xl font-bold text-white">Yeni Etkinlik</h3>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                            Oluşturma adımı artık kısa tutuldu. Yalnızca başlık, konum, tarih, açıklama ve kapak görseli istenir; yeni kayıt doğrudan taslak olarak açılır.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onBack}
                        className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:text-white"
                    >
                        Listeye Dön
                    </button>
                </div>
            </section>

            <form onSubmit={handleSubmit} className="space-y-6">
                <section className="rounded-[2rem] border border-white/5 bg-slate-900/50 p-6 backdrop-blur-xl">
                    <div className="mb-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Gerekli Alanlar</p>
                        <h4 className="mt-2 text-xl font-bold text-white">Tek ekranda temel etkinlik kaydı</h4>
                        <p className="mt-2 text-sm leading-7 text-slate-400">
                            Taslağı oluşturmak için gereken her şey burada. İkincil veriler aşağıdaki açılır bölümde kaldı.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-slate-300">Etkinlik Başlığı</label>
                            <input
                                required
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-500/50"
                                placeholder="Büyük Yıllık Teknoloji Fuarı"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Tarih ve Saat</label>
                            <input
                                required
                                type="datetime-local"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-500/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Konum</label>
                            <input
                                required
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-500/50"
                                placeholder="Ana yerleşke konferans salonu"
                            />
                        </div>

                        <div className="space-y-3 md:col-span-2">
                            <label className="text-sm font-medium text-slate-300">Kapak Görseli</label>
                            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                <div className="relative flex-1 group">
                                    <input
                                        required={!formData.thumbnailUrl}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'thumbnail')}
                                        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                                    />
                                    <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-white/10 bg-slate-950/50 px-4 py-6 transition-all group-hover:border-cyan-500/30">
                                        {uploadingTarget === 'thumbnail' ? (
                                            <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
                                        ) : formData.thumbnailUrl ? (
                                            <>
                                                <ImageIcon className="shrink-0 text-cyan-400" />
                                                <span className="truncate text-sm text-cyan-200">{formData.thumbnailUrl}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-6 w-6 text-slate-400" />
                                                <span className="text-sm font-medium text-slate-300">Kapak görseli yüklemek için tıklayın</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shrink-0">
                                    {formData.thumbnailUrl ? (
                                        <img src={formData.thumbnailUrl.startsWith('/') ? `${API_BASE_URL}${formData.thumbnailUrl}` : formData.thumbnailUrl} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full items-center justify-center px-3 text-center text-xs text-slate-500">Görsel gerekli</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-slate-300">Açıklama</label>
                            <textarea
                                required
                                rows="5"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-500/50"
                                placeholder="Etkinliğin amacı, içeriği ve kimler için olduğu gibi temel bilgileri yazın."
                            />
                        </div>
                    </div>
                </section>

                <details className="rounded-[2rem] border border-dashed border-white/10 bg-slate-950/35 p-6 backdrop-blur-xl">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-slate-300">
                        İsteğe bağlı ayrıntılar
                    </summary>
                    <p className="mt-3 text-sm leading-7 text-slate-500">
                        Etiket, süre, maksimum katılımcı ve galeri gibi alanlar gerekli değil. Taslağı oluşturduktan sonra da ekleyebilirsiniz.
                    </p>

                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-500">Oluşturan</label>
                            <input
                                type="text"
                                value={formData.creatorName}
                                onChange={(e) => setFormData({ ...formData, creatorName: e.target.value })}
                                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-slate-200 outline-none transition focus:border-cyan-500/40"
                                placeholder="AkademiZ Admin"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-500">Süre (Saat)</label>
                            <input
                                type="number"
                                step="0.5"
                                value={formData.eventLength}
                                onChange={(e) => setFormData({ ...formData, eventLength: e.target.value })}
                                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-slate-200 outline-none transition focus:border-cyan-500/40"
                                placeholder="3.5"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-500">Maksimum Katılımcı</label>
                            <input
                                type="number"
                                value={formData.maxJoiners}
                                onChange={(e) => setFormData({ ...formData, maxJoiners: e.target.value })}
                                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-slate-200 outline-none transition focus:border-cyan-500/40"
                                placeholder="500"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-slate-500">Etiketler</label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-slate-200 outline-none transition focus:border-cyan-500/40"
                                placeholder="teknoloji, kampüs, atölye"
                            />
                        </div>

                        <div className="space-y-3 md:col-span-2">
                            <div className="flex items-center justify-between gap-3">
                                <label className="text-sm font-medium text-slate-500">Galeri Görselleri</label>
                                <span className="text-xs text-slate-500">{formData.carouselImages.length} görsel</span>
                            </div>

                            <div className="relative group rounded-2xl border-2 border-dashed border-white/10 bg-slate-950/30 px-4 py-6 transition-all hover:border-cyan-500/30">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => handleImageUpload(e, 'gallery')}
                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                />
                                <div className="flex items-center gap-3 text-slate-500">
                                    {uploadingTarget === 'gallery' ? (
                                        <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
                                    ) : (
                                        <Upload className="h-5 w-5" />
                                    )}
                                    <span className="text-sm">Galeri için bir veya birden fazla görsel ekleyin</span>
                                </div>
                            </div>

                            {formData.carouselImages.length > 0 && (
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                    {formData.carouselImages.map((imageUrl, index) => (
                                        <div key={`${imageUrl}-${index}`} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
                                            <img src={imageUrl.startsWith('/') ? `${API_BASE_URL}${imageUrl}` : imageUrl} className="aspect-square w-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeGalleryImage(index)}
                                                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </details>

                {submitError && (
                    <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-100">
                        {submitError}
                    </div>
                )}

                <div className="rounded-[2rem] border border-white/5 bg-slate-900/45 p-6 backdrop-blur-xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Önizleme</p>
                    <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-white/8 bg-slate-950/70">
                        <div className="aspect-[4/3] w-full bg-slate-900">
                            {formData.thumbnailUrl ? (
                                <img src={formData.thumbnailUrl.startsWith('/') ? `${API_BASE_URL}${formData.thumbnailUrl}` : formData.thumbnailUrl} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full items-center justify-center text-sm text-slate-600">Kapak görseli eklenmedi</div>
                            )}
                        </div>

                        <div className="space-y-4 p-5">
                            <div>
                                <div className="text-lg font-bold text-white">{formData.title || 'Etkinlik başlığı burada görünecek'}</div>
                                <div className="mt-2 text-sm text-slate-500">{formData.date ? new Date(formData.date).toLocaleString('tr-TR') : 'Tarih seçilmedi'}</div>
                            </div>

                            <div className="text-sm text-slate-400">
                                {formData.location || 'Konum belirtilmedi'}
                            </div>

                            <div className="text-sm leading-6 text-slate-400">
                                {formData.description || 'Açıklama burada görünecek.'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onBack}
                        className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:text-white"
                    >
                        Vazgeç
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || uploadingTarget !== ''}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                        Taslak Etkinlik Oluştur
                    </button>
                </div>
            </form>
        </div>
    );
};

const PostForm = ({ onClose, onSubmitted, user }) => {
    const [formData, setFormData] = useState({
        authorName: user?.displayName || 'AkademiZ Admin',
        content: '',
        imageUrl: '',
        poll: {
            question: '',
            options: ['', '']
        }
    });
    const [showPoll, setShowPoll] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        const token = await auth.currentUser.getIdToken(true);
        const data = new FormData();
        data.append('image', file);

        try {
            const res = await fetch(`${API_BASE_URL}/community/upload/image`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Yükleme başarısız oldu: ${res.status} ${text}`);
            }

            const result = await res.json();
            setFormData(prev => ({ ...prev, imageUrl: result.url }));
        } catch (err) {
            console.error('Yükleme başarısız oldu', err);
            alert(err.message);
        } finally {
            setUploadingImage(false);
        }
    };

    const addOption = () => {
        if (formData.poll.options.length < 5) {
            setFormData({
                ...formData,
                poll: { ...formData.poll, options: [...formData.poll.options, ''] }
            });
        }
    };

    const removeOption = (idx) => {
        if (formData.poll.options.length > 2) {
            const newOptions = formData.poll.options.filter((_, i) => i !== idx);
            setFormData({
                ...formData,
                poll: { ...formData.poll, options: newOptions }
            });
        }
    };

    const updateOption = (idx, val) => {
        const newOptions = [...formData.poll.options];
        newOptions[idx] = val;
        setFormData({
            ...formData,
            poll: { ...formData.poll, options: newOptions }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError('');
        try {
            const token = await auth.currentUser.getIdToken(true);
            const trimmedAuthorName = formData.authorName.trim() || user?.displayName || 'AkademiZ Admin';
            const trimmedContent = formData.content.trim();
            const pollQuestion = formData.poll.question.trim();
            const pollOptions = formData.poll.options.map((option) => option.trim()).filter(Boolean);

            if (!trimmedContent) {
                throw new Error('Gönderi metni zorunludur.');
            }

            const body = {
                authorName: trimmedAuthorName,
                content: trimmedContent,
                imageUrl: formData.imageUrl
            };

            if (showPoll) {
                if (!pollQuestion) {
                    throw new Error('Anket sorusu zorunludur.');
                }

                if (pollOptions.length < 2) {
                    throw new Error('Anket için en az 2 seçenek girin.');
                }

                body.poll = {
                    question: pollQuestion,
                    options: pollOptions,
                    closesAt: null
                };
            }

            const res = await fetch(`${API_BASE_URL}/community/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                if (onSubmitted) {
                    await onSubmitted();
                } else {
                    onClose();
                }
            } else {
                const text = await res.text();
                throw new Error(text || 'Gönderi oluşturulamadı.');
            }
        } catch (err) {
            console.error('Gönderi oluşturma başarısız oldu', err);
            setSubmitError(err.message || 'Gönderi oluşturulamadı.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-white">Yeni Topluluk Gönderisi</h3>
                <button type="button" onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400">
                    <X size={24} />
                </button>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <img src={user.photoURL} className="w-12 h-12 rounded-full border border-white/10" />
                    <div className="min-w-0 flex-1">
                        <div className="font-bold text-white">{formData.authorName.trim() || user.displayName}</div>
                        <div className="text-xs text-slate-500">Yönetici olarak paylaşılıyor</div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Yazar</label>
                    <input
                        type="text"
                        value={formData.authorName}
                        onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-slate-200 outline-none transition focus:border-emerald-500/40"
                        placeholder="AkademiZ Admin"
                    />
                </div>

                <textarea
                    required
                    rows="4"
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    className="w-full bg-slate-950/30 border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:border-emerald-500/30 transition-all text-lg resize-none"
                    placeholder="Aklınızda ne var? Kampüsle bir güncelleme paylaşın..."
                />
            </div>

            {formData.imageUrl && (
                <div className="relative group rounded-2xl overflow-hidden border border-white/10">
                    <img src={formData.imageUrl.startsWith('/') ? `${API_BASE_URL}${formData.imageUrl}` : formData.imageUrl} className="w-full aspect-video object-cover" />
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {showPoll && (
                <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">Anket Oluşturma</span>
                        <button type="button" onClick={() => setShowPoll(false)} className="text-xs text-slate-500 hover:text-white transition-colors">Anketi İptal Et</button>
                    </div>
                    <input
                        type="text"
                        placeholder="Bir soru sorun..."
                        value={formData.poll.question}
                        onChange={e => setFormData({ ...formData, poll: { ...formData.poll, question: e.target.value } })}
                        className="w-full bg-transparent border-b border-white/10 py-2 focus:outline-none focus:border-emerald-500 transition-colors text-white font-medium"
                    />
                    <div className="space-y-3">
                        {formData.poll.options.map((opt, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <input
                                    type="text"
                                    placeholder={`Seçenek ${idx + 1}`}
                                    value={opt}
                                    onChange={e => updateOption(idx, e.target.value)}
                                    className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                                />
                                {formData.poll.options.length > 2 && (
                                    <button type="button" onClick={() => removeOption(idx)} className="text-slate-500 hover:text-red-400">
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {formData.poll.options.length < 5 && (
                            <button
                                type="button"
                                onClick={addOption}
                                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                            >
                                <Plus size={14} /> Seçenek Ekle
                            </button>
                        )}
                    </div>
                </div>
            )}

            {submitError && (
                <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-100">
                    {submitError}
                </div>
            )}

            <div className="rounded-2xl border border-white/8 bg-slate-950/50 px-4 py-4 text-xs leading-6 text-slate-500">
                `authorName` alanı frontend tarafından gönderilir. Backend create endpointi şu an bunu resmi olarak dokümante etmiyor; kayıt yanıtında yine oturum sahibinin adı dönüyorsa backend tarafında ayrıca destek eklenmesi gerekir.
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-6">
                <div className="flex items-center gap-4">
                    <label className="relative h-12 w-12 shrink-0 cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                        />
                        <span className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${formData.imageUrl ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}>
                            {uploadingImage ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />}
                        </span>
                    </label>
                    <button
                        type="button"
                        onClick={() => setShowPoll((prev) => !prev)}
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all ${showPoll ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
                    >
                        <MessageSquare size={20} />
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || uploadingImage || !formData.content}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-xl shadow-emerald-900/20 flex items-center gap-3"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    Gönderiyi Paylaş
                </button>
            </div>
        </form>
    );
};

// Sub-components
const NavItem = ({ icon, label, active = false, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}>
        {icon}
        <span className="font-medium">{label}</span>
    </button>
);

const StatCard = ({ title, value, change }) => (
    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 hover:border-cyan-500/20 transition-colors group">
        <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">{title}</h4>
        <div className="text-3xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{value}</div>
        <p className="text-xs text-cyan-500/80 font-medium">{change}</p>
    </div>
);

const ActivityItem = ({ title, time, type }) => (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 uppercase">
            {type.charAt(0)}
        </div>
        <div className="flex-1">
            <div className="text-sm font-medium text-slate-200">{title}</div>
            <div className="text-xs text-slate-500">{time}</div>
        </div>
    </div>
);

const QuickActionButton = ({ label, color, icon, onClick }) => (
    <button
        onClick={onClick}
        className={`p-4 rounded-2xl font-semibold transition-transform hover:scale-105 active:scale-95 flex flex-col items-center gap-2 ${color}`}
    >
        {icon}
        <span className="text-sm">{label}</span>
    </button>
);

const ScheduleMetricCard = ({ title, value, detail, accent = 'cyan' }) => {
    const accentClass = accent === 'amber'
        ? 'border-amber-400/20 bg-amber-400/10 text-amber-100'
        : 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100';

    return (
        <div className={`rounded-2xl border px-4 py-4 backdrop-blur-sm ${accentClass}`}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] opacity-80">{title}</div>
            <div className="mt-2 text-3xl font-bold">{value}</div>
            <div className="mt-2 text-xs opacity-75">{detail}</div>
        </div>
    );
};

const ScheduleSummaryTile = ({ title, value, description, accent }) => {
    const styles = {
        cyan: 'border-cyan-400/15 bg-cyan-400/10 text-cyan-100',
        emerald: 'border-emerald-400/15 bg-emerald-400/10 text-emerald-100',
        amber: 'border-amber-400/15 bg-amber-400/10 text-amber-100'
    };

    return (
        <div className={`rounded-2xl border px-4 py-4 ${styles[accent] || styles.cyan}`}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] opacity-80">{title}</div>
            <div className="mt-2 text-2xl font-bold">{value}</div>
            <div className="mt-2 text-xs opacity-75">{description}</div>
        </div>
    );
};

const ScheduleField = ({ label, children }) => (
    <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</span>
        {children}
    </label>
);

const ScheduleClassPicker = ({ schedules, selectedScheduleId, onSelect, disabled = false }) => {
    const selectedSchedule = schedules.find((schedule) => schedule.id === selectedScheduleId) || schedules[0];

    return (
        <div className="mt-6 rounded-[1.5rem] border border-white/8 bg-slate-950/50 p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Programlar</div>
            <select
                value={selectedScheduleId}
                disabled={disabled}
                onChange={(e) => onSelect(e.target.value)}
                className="mt-3 block w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {schedules.map((schedule) => (
                    <option key={schedule.id} value={schedule.id}>
                        {schedule.programName}
                    </option>
                ))}
            </select>

            {selectedSchedule && (
                <>
                    <div className="mt-3 text-sm text-slate-400">
                        {selectedSchedule.academicYear} • {selectedSchedule.semester}
                    </div>
                    <div className="mt-1 text-sm text-slate-300">
                        {(selectedSchedule.availableClassKeys || []).length} grade anahtarı
                    </div>
                </>
            )}
        </div>
    );
};

const ScheduleBoardCard = ({ board, onCellClick, onAddTimeSlot, onQuickAdd, onTimeSlotClick, saving }) => {
    const template = {
        gridTemplateColumns: `92px repeat(${SCHEDULE_DAYS.length}, minmax(152px, 1fr))`
    };

    return (
        <div className="rounded-[2rem] border border-white/5 bg-slate-900/50 p-6 backdrop-blur-xl">
            <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Haftalık Tablo</p>
                <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <h4 className="text-xl font-bold text-white">Ders bilgisi eklemek veya düzenlemek için bir hücreye tıklayın</h4>
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            disabled={saving}
                            onClick={onQuickAdd}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/30 hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Upload size={16} />
                            Quick Add
                        </button>
                        <button
                            type="button"
                            disabled={saving}
                            onClick={onAddTimeSlot}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/30 hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Plus size={16} />
                            Saat Ekle
                        </button>
                    </div>
                </div>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
                    Haftalık görünüm backend'den gelen veri üstünde yerel taslak olarak düzenlenir. Sayfadan kaydetmeden API'ye istek gönderilmez.
                </p>
            </div>

            <div className="overflow-x-auto pb-2">
                <div className="min-w-[1220px]">
                    <div className="grid gap-3" style={template}>
                        <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/8 px-4 py-4">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">Saat</div>
                            <div className="mt-2 text-sm font-semibold text-slate-200">Gün</div>
                        </div>

                        {SCHEDULE_DAYS.map((day) => (
                            <div
                                key={day.key}
                                className="rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-4"
                            >
                                <div className="text-base font-bold text-white">{day.label}</div>
                                <div className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    Düzenle
                                </div>
                            </div>
                        ))}

                        {board.timeSlots.map((slot) => (
                            <React.Fragment key={slot.id}>
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={() => onTimeSlotClick(slot)}
                                    className="rounded-2xl border border-white/8 bg-slate-950/70 px-3 py-4 text-left transition hover:border-cyan-300/25 hover:bg-cyan-400/8 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="text-sm font-bold text-white">{slot.time}</div>
                                            <div className="mt-2 text-xs text-slate-500">{slot.endTime}</div>
                                        </div>
                                        <div className="rounded-full border border-white/10 bg-white/5 p-1.5 text-slate-400">
                                            <Pencil size={12} />
                                        </div>
                                    </div>
                                </button>

                                {SCHEDULE_DAYS.map((day) => {
                                    const cell = board.cellMap[makeScheduleCellKey(day.key, slot.time)] || createEmptyScheduleCell(day.key, slot.time);
                                    return (
                                        <ScheduleBoardCell
                                            key={`${day.key}-${slot.time}`}
                                            cell={cell}
                                            saving={saving}
                                            onClick={onCellClick}
                                        />
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ScheduleBoardCell = ({ cell, saving, onClick }) => {
    const isEmpty = cell.mode === 'empty';
    const styles = {
        empty: 'border-white/8 bg-slate-950/40 hover:border-cyan-400/20 hover:bg-cyan-400/6',
        generated: 'border-cyan-400/18 bg-cyan-400/10 hover:border-cyan-300/35 hover:bg-cyan-400/14',
        manual: 'border-cyan-400/18 bg-cyan-400/10 hover:border-cyan-300/35 hover:bg-cyan-400/14',
        mixed: 'border-cyan-400/18 bg-cyan-400/10 hover:border-cyan-300/35 hover:bg-cyan-400/14',
        override: 'border-cyan-400/18 bg-cyan-400/10 hover:border-cyan-300/35 hover:bg-cyan-400/14'
    };

    const subtitle = isEmpty
        ? 'Yeni ders eklemek için tıklayın'
        : formatLessonMeta(cell.primaryLesson);

    return (
        <button
            type="button"
            disabled={saving}
            onClick={() => onClick(cell)}
            className={`flex min-h-[122px] flex-col rounded-2xl border px-4 py-4 text-left transition ${styles[cell.mode] || styles.empty} ${saving ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
        >
            <div className={`text-sm font-bold leading-5 ${isEmpty ? 'text-slate-300' : 'text-white'}`}>
                {isEmpty ? '+' : cell.primaryLesson?.courseName || 'Ders'}
            </div>

            <div className="mt-auto pt-3 text-xs leading-5 text-slate-400">
                {subtitle}
                {!isEmpty && cell.totalLessons > 1 && <div className="mt-2">{cell.totalLessons} ders</div>}
            </div>
        </button>
    );
};

const ScheduleLessonModal = ({
    state,
    cell,
    saving,
    error,
    onClose,
    onFieldChange,
    onDelete,
    onSubmit
}) => {
    const manualLesson = cell.manualLessons[0];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-2xl">
                <div className="border-b border-white/5 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_rgba(15,23,42,0.92)_60%)] px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Ders Saati Düzenle</div>
                            <h4 className="mt-2 text-2xl font-bold text-white">{getDayLabel(state.dayKey)} • {state.time}</h4>
                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                Bu kutu için dersi taslağa ekleyin, güncelleyin veya temizleyin. Sayfa kaydetmesi yapılana kadar backend değişmez.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-6 p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-4">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Seçili Gün</div>
                            <div className="mt-2 text-lg font-bold text-white">{getDayLabel(state.dayKey)}</div>
                        </div>
                        <div className="rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-4">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Seçili Saat</div>
                            <div className="mt-2 text-lg font-bold text-white">{state.time}</div>
                        </div>
                    </div>

                    {cell.totalLessons > 1 && (
                        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-4 text-sm leading-6 text-amber-100">
                            Bu saat diliminde birden fazla ders görünüyor. Tablo ilk dersi kartta gösterir ancak öğrenci tarafında efektif olarak toplam {cell.totalLessons} ders vardır.
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <ScheduleField label="Ders Kodu">
                            <input
                                type="text"
                                value={state.courseCode}
                                onChange={(e) => onFieldChange('courseCode', e.target.value)}
                                placeholder="SGT301"
                                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
                            />
                        </ScheduleField>

                        <ScheduleField label="Ders Adı">
                            <input
                                type="text"
                                value={state.courseName}
                                onChange={(e) => onFieldChange('courseName', e.target.value)}
                                placeholder="Siber Tatbikat"
                                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
                            />
                        </ScheduleField>

                        <ScheduleField label="Öğretim Elemanı">
                            <input
                                type="text"
                                value={state.instructor}
                                onChange={(e) => onFieldChange('instructor', e.target.value)}
                                placeholder="Dr. Örnek"
                                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
                            />
                        </ScheduleField>

                        <ScheduleField label="Derslik">
                            <input
                                type="text"
                                value={state.classroom}
                                onChange={(e) => onFieldChange('classroom', e.target.value)}
                                placeholder="Lab 7"
                                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
                            />
                        </ScheduleField>
                    </div>

                    <div className="min-h-6 text-sm">
                        {error && <p className="text-red-300">{error}</p>}
                    </div>

                    <div className="flex flex-col gap-3 border-t border-white/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        {manualLesson ? (
                            <button
                                type="button"
                                disabled={saving}
                                onClick={onDelete}
                                className="inline-flex items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Taslaktaki Değişikliği Temizle
                            </button>
                        ) : (
                            <div className="text-sm text-slate-500">
                                Bu hücre için henüz manuel taslak yok.
                            </div>
                        )}

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:text-white"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                Taslağa Uygula
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ScheduleTimeSlotModal = ({
    state,
    saving,
    error,
    onClose,
    onFieldChange,
    onDelete,
    onSubmit
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-slate-900/95 p-6 shadow-[0_30px_80px_rgba(2,6,23,0.65)]">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Saat Satırı</p>
                        <h4 className="mt-2 text-2xl font-bold text-white">
                            {state.isNew ? 'Yeni saat satırı oluştur' : `${state.previousTime} saatini düzenle`}
                        </h4>
                        <p className="mt-2 text-sm leading-7 text-slate-400">
                            Başlangıç ve bitiş saatini güncelleyin. Satır silinirse bu saate bağlı manuel kayıtlar da temizlenir.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-white/10 p-2 text-slate-400 transition hover:text-white"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form className="mt-6 space-y-5" onSubmit={onSubmit}>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <ScheduleField label="Başlangıç Saati">
                            <input
                                type="time"
                                value={state.startTime}
                                onChange={(e) => onFieldChange('startTime', e.target.value)}
                                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                            />
                        </ScheduleField>

                        <ScheduleField label="Bitiş Saati">
                            <input
                                type="time"
                                value={state.endTime}
                                onChange={(e) => onFieldChange('endTime', e.target.value)}
                                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                            />
                        </ScheduleField>
                    </div>

                    <div className="min-h-6 text-sm">
                        {error && <p className="text-red-300">{error}</p>}
                    </div>

                    <div className="flex flex-col gap-3 border-t border-white/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        {!state.isNew ? (
                            <button
                                type="button"
                                disabled={saving}
                                onClick={onDelete}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Trash2 size={16} />
                                Satırı Sil
                            </button>
                        ) : (
                            <div className="text-sm text-slate-500">
                                Yeni satır kaydedildikten sonra tabloya eklenir.
                            </div>
                        )}

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:text-white"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Pencil size={18} />}
                                Satırı Kaydet
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ScheduleQuickAddModal = ({
    state,
    saving,
    error,
    onClose,
    onFieldChange,
    onSubmit
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8 backdrop-blur-sm">
            <div className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-slate-900/95 p-6 shadow-[0_30px_80px_rgba(2,6,23,0.65)]">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Quick Add</p>
                        <h4 className="mt-2 text-2xl font-bold text-white">Metinden günü hızlıca doldur</h4>
                        <p className="mt-2 text-sm leading-7 text-slate-400">
                            Bir gün seçin ve tabloyu yapıştırın. Saat ilk sütundan, derslik son 4 karakterden alınır; kalan metin ders kodu, ders adı ve öğretim görevlisi olarak çözümlenir.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-white/10 p-2 text-slate-400 transition hover:text-white"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form className="mt-6 space-y-5" onSubmit={onSubmit}>
                    <ScheduleField label="Gün">
                        <select
                            value={state.dayKey}
                            onChange={(e) => onFieldChange('dayKey', e.target.value)}
                            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                        >
                            {SCHEDULE_DAYS.map((day) => (
                                <option key={day.key} value={day.key}>
                                    {day.label}
                                </option>
                            ))}
                        </select>
                    </ScheduleField>

                    <ScheduleField label="Ders Metni">
                        <textarea
                            rows="12"
                            value={state.rawText}
                            onChange={(e) => onFieldChange('rawText', e.target.value)}
                            className="w-full resize-y rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 font-mono text-sm text-white outline-none transition focus:border-cyan-400/40"
                            placeholder={'Saat\tDers Kodu\tDers Adı\tÖğretim Görevlisi\tDerslik\n9:15\tSGP216\tMüşteri İlişkileri Yönetimi\tÖğr. Gör. Elif ATAMAN ERDOĞDU\tD102'}
                        />
                    </ScheduleField>

                    <div className="rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-4 text-sm leading-7 text-slate-400">
                        Başlık satırı otomatik atlanır. Boş satırlar yok sayılır. Yalnızca saat olan satırlar boş ders satırı olarak eklenir.
                    </div>

                    <div className="min-h-6 text-sm">
                        {error && <p className="text-red-300">{error}</p>}
                    </div>

                    <div className="flex flex-col gap-3 border-t border-white/5 pt-4 sm:flex-row sm:items-center sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:text-white"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                            Taslağa Uygula
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const createEmptyWeekSchedule = () => Object.fromEntries(
    SCHEDULE_DAYS.map((day) => [day.key, []])
);

const getAuthHeaders = async (authRequired = false) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        if (authRequired) {
            throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
        }
        return {};
    }

    const token = await currentUser.getIdToken();
    return { Authorization: `Bearer ${token}` };
};

const apiFetch = async (path, { method = 'GET', body, authRequired = false } = {}) => {
    const headers = await getAuthHeaders(authRequired);
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: body === undefined ? headers : {
            ...headers,
            'Content-Type': 'application/json'
        },
        body: body === undefined ? undefined : JSON.stringify(body)
    });

    const rawText = response.status === 204 ? '' : await response.text();

    if (!response.ok) {
        let message = 'İstek başarısız oldu.';
        if (rawText) {
            try {
                const payload = JSON.parse(rawText);
                message = payload.error || payload.message || rawText || message;
            } catch {
                message = rawText;
            }
        }
        throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    if (!rawText) {
        return null;
    }

    return JSON.parse(rawText);
};

const communityApi = {
    async listPosts(limit = 20) {
        return apiFetch(`/community/posts?limit=${limit}`);
    },

    async deletePost(postId) {
        const encodedId = encodeURIComponent(postId);

        try {
            return await apiFetch(`/community/posts/${encodedId}`, {
                method: 'DELETE',
                authRequired: true
            });
        } catch (error) {
            const message = error?.message || '';

            if (!/404|405|Cannot DELETE/i.test(message)) {
                throw error;
            }

            // Some admin actions in this API use explicit action endpoints instead of DELETE.
            return apiFetch(`/community/posts/${encodedId}/delete`, {
                method: 'POST',
                authRequired: true
            });
        }
    }
};

const newsApi = {
    async listItems() {
        return apiFetch('/news');
    }
};

const scheduleApi = {
    async listSchedules() {
        const data = await apiFetch('/schedules');
        return data.map(normalizeScheduleSummary);
    },

    async createSchedule(payload) {
        const data = await apiFetch('/schedules', {
            method: 'POST',
            body: payload,
            authRequired: true
        });
        return normalizeScheduleEditor(data);
    },

    async deleteSchedule(scheduleId) {
        return apiFetch(`/schedules/${scheduleId}`, {
            method: 'DELETE',
            authRequired: true
        });
    },

    async getScheduleEditor(scheduleId) {
        const data = await apiFetch(`/schedules/${scheduleId}/manual`, { authRequired: true });
        return normalizeScheduleEditor(data);
    },

    async saveManualSchedule({ scheduleId, manualSchedule }) {
        const data = await apiFetch(`/schedules/${scheduleId}/manual`, {
            method: 'PUT',
            body: { manualSchedule },
            authRequired: true
        });
        return normalizeScheduleEditor(data);
    },

    async saveClassSchedule({ scheduleId, classKey, schedule }) {
        const data = await apiFetch(`/schedules/${scheduleId}/manual/${encodeURIComponent(classKey)}`, {
            method: 'PUT',
            body: { schedule },
            authRequired: true
        });
        return normalizeScheduleEditor(data);
    },

    async deleteClassSchedule({ scheduleId, classKey }) {
        const data = await apiFetch(`/schedules/${scheduleId}/manual/${encodeURIComponent(classKey)}`, {
            method: 'DELETE',
            authRequired: true
        });
        return normalizeScheduleEditor(data);
    },

    async setOverride({ scheduleId, enabled }) {
        const data = await apiFetch(`/schedules/${scheduleId}/manual-override`, {
            method: 'PATCH',
            body: { enabled },
            authRequired: true
        });
        return normalizeScheduleEditor(data);
    }
};

const classApi = {
    async listAdminClasses() {
        const data = await apiFetch('/admin/classes', { authRequired: true });
        return data
            .map(normalizeAdminClass)
            .sort((left, right) => (left.sortOrder - right.sortOrder) || left.name.localeCompare(right.name, 'tr'));
    },

    async createClass(payload) {
        const data = await apiFetch('/admin/classes', {
            method: 'POST',
            body: payload,
            authRequired: true
        });
        return normalizeAdminClass(data);
    },

    async deleteClass(idOrKey) {
        return apiFetch(`/admin/classes/${encodeURIComponent(idOrKey)}`, {
            method: 'DELETE',
            authRequired: true
        });
    }
};

const academicFacultyApi = {
    async listFaculties() {
        const data = await apiFetch('/academic-faculties', { authRequired: true });
        return data
            .map(normalizeAcademicFaculty)
            .sort((left, right) => (left.sortOrder - right.sortOrder) || left.name.localeCompare(right.name, 'tr'));
    },

    async createFaculty(payload) {
        const data = await apiFetch('/academic-faculties', {
            method: 'POST',
            body: payload,
            authRequired: true
        });
        return normalizeAcademicFaculty(data);
    },

    async updateFaculty(idOrKey, payload) {
        const data = await apiFetch(`/academic-faculties/${encodeURIComponent(idOrKey)}`, {
            method: 'PATCH',
            body: payload,
            authRequired: true
        });
        return normalizeAcademicFaculty(data);
    },

    async deleteFaculty(idOrKey) {
        return apiFetch(`/academic-faculties/${encodeURIComponent(idOrKey)}`, {
            method: 'DELETE',
            authRequired: true
        });
    }
};

const createFacultyGradeDraft = (grade = {}) => ({
    localId: grade.localId || `grade-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    key: grade.key || '',
    level: grade.level ?? '',
    name: grade.name || ''
});

const createFacultyDepartmentDraft = (department = {}) => ({
    localId: department.localId || `department-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    key: department.key || '',
    name: department.name || '',
    sortOrder: department.sortOrder ?? '',
    grades: (Array.isArray(department.grades) ? department.grades : []).map((grade) => createFacultyGradeDraft(grade))
});

const createEmptyFacultyFormState = () => ({
    originalKey: '',
    key: '',
    name: '',
    sortOrder: '',
    departments: []
});

const createFacultyFormStateFromFaculty = (faculty) => ({
    originalKey: faculty.key || '',
    key: faculty.key || '',
    name: faculty.name || '',
    sortOrder: faculty.sortOrder ?? '',
    departments: (faculty.departments || []).map((department) => createFacultyDepartmentDraft(department))
});

const createEmptyDepartmentConfig = () => ({
    key: '',
    name: '',
    sortOrder: ''
});

const serializeFacultyPayload = (facultyForm) => ({
    key: facultyForm.key.trim() || undefined,
    name: facultyForm.name.trim(),
    sortOrder: facultyForm.sortOrder === '' ? undefined : Number(facultyForm.sortOrder),
    departments: facultyForm.departments.map((department) => ({
        key: department.key.trim() || undefined,
        name: department.name.trim(),
        sortOrder: department.sortOrder === '' ? undefined : Number(department.sortOrder),
        grades: department.grades.map((grade) => {
            const level = Number(grade.level);
            return {
                level,
                name: grade.name.trim() || `${level}. Grade`,
                key: grade.key.trim() || `grade${level}`
            };
        })
    }))
});

const buildFacultyPayload = (faculty, departments) => ({
    key: faculty.key || undefined,
    name: faculty.name,
    sortOrder: faculty.sortOrder ?? undefined,
    departments: departments.map((department) => ({
        key: department.key || undefined,
        name: department.name,
        sortOrder: department.sortOrder ?? undefined,
        grades: (Array.isArray(department.grades) ? department.grades : []).map((grade) => ({
            level: Number(grade.level),
            name: grade.name,
            key: grade.key
        }))
    }))
});

const flattenDepartmentOptions = (faculties = []) => faculties.flatMap((faculty) => (
    (faculty.departments || []).map((department) => ({
        facultyKey: faculty.key,
        facultyName: faculty.name,
        departmentKey: department.key,
        departmentName: department.name
    }))
));

const normalizeAdminClass = (item = {}) => ({
    ...item,
    id: String(item.id ?? item.key ?? ''),
    key: String(item.key || item.id || ''),
    name: item.name || item.key || 'İsimsiz grade',
    sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : 0,
    level: Number.isFinite(Number(item.level)) ? Number(item.level) : null,
    facultyKey: item.facultyKey ? String(item.facultyKey) : '',
    facultyName: item.facultyName || '',
    departmentKey: item.departmentKey ? String(item.departmentKey) : '',
    departmentName: item.departmentName || '',
    departmentKeys: Array.isArray(item.departmentKeys) ? item.departmentKeys.map(String) : []
});

const normalizeAcademicFaculty = (faculty = {}) => ({
    ...faculty,
    id: String(faculty.id ?? faculty.key ?? ''),
    key: String(faculty.key || faculty.id || ''),
    name: faculty.name || faculty.key || 'İsimsiz fakülte',
    sortOrder: Number.isFinite(Number(faculty.sortOrder)) ? Number(faculty.sortOrder) : 0,
    departments: (Array.isArray(faculty.departments) ? faculty.departments : [])
        .map((department) => ({
            ...department,
            id: String(department.id ?? department.key ?? ''),
            key: String(department.key || department.id || ''),
            name: department.name || department.key || 'İsimsiz departman',
            sortOrder: Number.isFinite(Number(department.sortOrder)) ? Number(department.sortOrder) : 0,
            grades: (Array.isArray(department.grades) ? department.grades : [])
                .map((grade) => ({
                    ...grade,
                    id: String(grade.id ?? grade.key ?? `${department.key}-${grade.level ?? ''}`),
                    key: String(grade.key || grade.id || ''),
                    level: Number.isFinite(Number(grade.level)) ? Number(grade.level) : null,
                    name: grade.name || (Number.isFinite(Number(grade.level)) ? `${grade.level}. Grade` : grade.key || 'İsimsiz grade'),
                    facultyKey: String(faculty.key || faculty.id || ''),
                    facultyName: faculty.name || faculty.key || '',
                    departmentKey: String(department.key || department.id || ''),
                    departmentName: department.name || department.key || ''
                }))
                .sort((left, right) => (Number(left.level ?? 99) - Number(right.level ?? 99)) || left.name.localeCompare(right.name, 'tr'))
        }))
        .sort((left, right) => (left.sortOrder - right.sortOrder) || left.name.localeCompare(right.name, 'tr'))
});

const normalizeLessonMap = (lessonMap = {}) => {
    const result = {};

    SCHEDULE_DAYS.forEach((day) => {
        const lessons = lessonMap?.[day.key] || [];
        result[day.key] = [...lessons]
            .map((lesson, index) => ({
                id: lesson.id || `${day.key}-${lesson.time || '00:00'}-${index}`,
                time: normalizeTimeValue(lesson.time || ''),
                courseCode: lesson.courseCode || '',
                courseName: lesson.courseName || '',
                instructor: lesson.instructor || '',
                classroom: lesson.classroom || '',
                source: lesson.source,
                isEmpty: lesson.isEmpty === true || (!lesson.courseName && Boolean(lesson.time))
            }))
            .filter((lesson) => isValidTime(lesson.time) && (lesson.courseName || lesson.isEmpty))
            .sort((left, right) => timeToMinutes(left.time) - timeToMinutes(right.time));
    });

    return result;
};

const addSourceToLessonMap = (lessonMap = {}, source) => Object.fromEntries(
    Object.entries(normalizeLessonMap(lessonMap)).map(([dayKey, lessons]) => [
        dayKey,
        lessons.map((lesson) => ({ ...lesson, source }))
    ])
);

const countLessons = (lessonMap = {}) => Object.values(lessonMap).reduce(
    (total, lessons) => total + lessons.filter((lesson) => !lesson.isEmpty).length,
    0
);

const timeToMinutes = (value = '') => {
    const parts = value.split(':');
    if (parts.length !== 2) return 9999;

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);
    return Number.isNaN(hours) || Number.isNaN(minutes) ? 9999 : (hours * 60) + minutes;
};

const isValidTime = (value = '') => {
    const parts = value.trim().split(':');
    if (parts.length !== 2) return false;

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);
    return Number.isInteger(hours) && Number.isInteger(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
};

const formatLessonMeta = (lesson) => {
    return [lesson.courseCode, lesson.classroom, lesson.instructor].filter(Boolean).join(' • ') || 'Detay belirtilmedi';
};

const getDayLabel = (dayKey) => SCHEDULE_DAYS.find((day) => day.key === dayKey)?.label || dayKey;
const formatGradeLabel = (grade = {}) => {
    if (Number.isFinite(Number(grade.level))) {
        return `${grade.level}. Sınıf`;
    }

    return grade.name || grade.key || 'İsimsiz grade';
};

const formatClassKeyLabel = (classKey = '', classInfo = null) => {
    if (classInfo) {
        const gradeLabel = formatGradeLabel(classInfo);
        return classInfo.departmentName ? `${gradeLabel} • ${classInfo.departmentName}` : gradeLabel;
    }

    const gradeMatch = /(?:^|-)grade(\d+)$/i.exec(classKey);
    if (gradeMatch) {
        return `${gradeMatch[1]}. Sınıf`;
    }
    return classKey;
};

const formatAdminDateTime = (value) => {
    if (!value) return 'Tarih bilgisi yok';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('tr-TR', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(date);
};

const parseJsonArray = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string' || value.trim() === '') return [];

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const normalizeTimeValue = (value = '') => {
    const normalizedValue = value.trim().replace('.', ':');
    const [hours, minutes] = normalizedValue.split(':');
    if (!Number.isInteger(Number(hours)) || !Number.isInteger(Number(minutes))) return value;
    return `${String(Number(hours)).padStart(2, '0')}:${String(Number(minutes)).padStart(2, '0')}`;
};

const makeScheduleCellKey = (dayKey, time) => `${dayKey}__${time}`;

const createEmptyScheduleCell = (dayKey, time) => ({
    key: makeScheduleCellKey(dayKey, time),
    dayKey,
    time,
    generatedLessons: [],
    manualLessons: [],
    effectiveLessons: [],
    primaryLesson: null,
    totalLessons: 0,
    mode: 'empty'
});

const indexLessonsByCell = (lessonMap = {}) => {
    const result = {};

    Object.entries(lessonMap || {}).forEach(([dayKey, lessons]) => {
        lessons.forEach((lesson) => {
            const key = makeScheduleCellKey(dayKey, lesson.time);
            if (!result[key]) {
                result[key] = [];
            }

            result[key].push({ ...lesson, dayKey });
        });
    });

    return result;
};

const addMinutesToTime = (time, minutesToAdd) => {
    const minutes = timeToMinutes(time);
    if (minutes === 9999) return '';

    const totalMinutes = minutes + minutesToAdd;
    const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const minutePart = (totalMinutes % 60).toString().padStart(2, '0');
    return `${hours}:${minutePart}`;
};

const deriveBoardTimes = (classState) => {
    const times = new Set();
    [classState?.autoLessons, classState?.manualLessons, classState?.effectiveLessons].forEach((lessonMap) => {
        Object.values(lessonMap || {}).forEach((lessons) => {
            lessons.forEach((lesson) => {
                if (isValidTime(lesson.time)) {
                    times.add(lesson.time);
                }
            });
        });
    });

    if (times.size === 0) {
        DEFAULT_SCHEDULE_TIMES.forEach((time) => times.add(time));
    }

    return [...times]
        .sort((left, right) => timeToMinutes(left) - timeToMinutes(right))
        .map((time) => ({
            id: `slot-${time}`,
            time,
            endTime: addMinutesToTime(time, DEFAULT_LESSON_DURATION_MINUTES)
        }));
};

const buildScheduleBoard = (classState) => {
    if (!classState) {
        return {
            timeSlots: deriveBoardTimes({
                autoLessons: createEmptyWeekSchedule(),
                manualLessons: createEmptyWeekSchedule(),
                effectiveLessons: createEmptyWeekSchedule()
            }),
            cellMap: {},
            filledCells: 0
        };
    }

    const generatedByCell = indexLessonsByCell(classState.autoLessons);
    const manualByCell = indexLessonsByCell(classState.manualLessons);
    const effectiveByCell = indexLessonsByCell(classState.effectiveLessons);
    const normalizedTimeSlots = deriveBoardTimes(classState);
    const cellMap = {};

    normalizedTimeSlots.forEach(({ time }) => {
        SCHEDULE_DAYS.forEach((day) => {
            const key = makeScheduleCellKey(day.key, time);
            const generatedLessons = (generatedByCell[key] || []).filter((lesson) => !lesson.isEmpty);
            const manualLessons = (manualByCell[key] || []).filter((lesson) => !lesson.isEmpty);
            const effectiveLessons = (effectiveByCell[key] || []).filter((lesson) => !lesson.isEmpty);
            const primaryLesson = manualLessons[0] || effectiveLessons[0] || generatedLessons[0] || null;
            const mode = manualLessons.length > 0
                ? (classState.overrideEnabled ? 'override' : generatedLessons.length > 0 ? 'mixed' : 'manual')
                : generatedLessons.length > 0
                    ? 'generated'
                    : 'empty';

            cellMap[key] = {
                key,
                dayKey: day.key,
                time,
                generatedLessons,
                manualLessons,
                effectiveLessons,
                primaryLesson,
                totalLessons: effectiveLessons.length || manualLessons.length || generatedLessons.length,
                mode
            };
        });
    });

    return {
        timeSlots: normalizedTimeSlots,
        cellMap,
        filledCells: Object.values(cellMap).filter((cell) => cell.mode !== 'empty').length
    };
};

const normalizeClassSchedule = (schedule = {}) => normalizeLessonMap(schedule);

const normalizeScheduleSummary = (schedule) => ({
    ...schedule,
    id: String(schedule.id),
    availableClassKeys: Array.isArray(schedule.availableClassKeys) ? schedule.availableClassKeys : Object.keys(schedule.schedule || {}),
    manualClassKeys: Array.isArray(schedule.manualClassKeys) ? schedule.manualClassKeys : [],
    schedule: Object.fromEntries(
        Object.entries(schedule.schedule || {}).map(([classKey, dayMap]) => [classKey, normalizeClassSchedule(dayMap)])
    )
});

const normalizeScheduleEditor = (schedule) => ({
    ...normalizeScheduleSummary(schedule),
    autoSchedule: Object.fromEntries(
        Object.entries(schedule.autoSchedule || {}).map(([classKey, dayMap]) => [classKey, normalizeClassSchedule(dayMap)])
    ),
    manualSchedule: Object.fromEntries(
        Object.entries(schedule.manualSchedule || {}).map(([classKey, dayMap]) => [classKey, normalizeClassSchedule(dayMap)])
    ),
    effectiveSchedule: Object.fromEntries(
        Object.entries((schedule.effectiveSchedule || schedule.schedule || {})).map(([classKey, dayMap]) => [classKey, normalizeClassSchedule(dayMap)])
    )
});

const mergeClassSchedules = (autoSchedule, manualSchedule, overrideEnabled) => {
    const normalizedAuto = normalizeClassSchedule(autoSchedule || createEmptyWeekSchedule());
    const normalizedManual = normalizeClassSchedule(manualSchedule || createEmptyWeekSchedule());

    if (!overrideEnabled) {
        return normalizedAuto;
    }

    const merged = { ...createEmptyWeekSchedule() };

    Object.keys(merged).forEach((dayKey) => {
        merged[dayKey] = Object.prototype.hasOwnProperty.call(normalizedManual, dayKey)
            ? normalizedManual[dayKey]
            : normalizedAuto[dayKey] || [];
    });

    Object.entries(normalizedAuto).forEach(([dayKey, lessons]) => {
        if (!Object.prototype.hasOwnProperty.call(merged, dayKey)) {
            merged[dayKey] = lessons;
        }
    });

    Object.entries(normalizedManual).forEach(([dayKey, lessons]) => {
        if (!Object.prototype.hasOwnProperty.call(merged, dayKey)) {
            merged[dayKey] = lessons;
        }
    });

    return merged;
};

const applyLocalClassScheduleToPayload = (payload, classKey, nextClassSchedule) => {
    if (!payload || !classKey) return payload;

    const nextManualSchedule = {
        ...(payload.manualSchedule || {}),
        [classKey]: normalizeClassSchedule(nextClassSchedule)
    };
    const nextEffectiveClassSchedule = mergeClassSchedules(
        payload.autoSchedule?.[classKey],
        nextManualSchedule[classKey],
        payload.manualOverrideEnabled === true
    );

    return normalizeScheduleEditor({
        ...payload,
        manualSchedule: nextManualSchedule,
        effectiveSchedule: {
            ...(payload.effectiveSchedule || {}),
            [classKey]: nextEffectiveClassSchedule
        },
        schedule: {
            ...(payload.schedule || {}),
            [classKey]: nextEffectiveClassSchedule
        }
    });
};

const buildEditorClassState = (editorPayload, classKey) => {
    if (!editorPayload || !classKey) return null;

    const autoSchedule = normalizeClassSchedule(editorPayload.autoSchedule?.[classKey] || createEmptyWeekSchedule());
    const manualSchedule = normalizeClassSchedule(editorPayload.manualSchedule?.[classKey] || createEmptyWeekSchedule());
    const effectiveSchedule = normalizeClassSchedule(editorPayload.effectiveSchedule?.[classKey] || editorPayload.schedule?.[classKey] || createEmptyWeekSchedule());

    return {
        overrideEnabled: editorPayload.manualOverrideEnabled === true,
        autoLessons: addSourceToLessonMap(autoSchedule, 'generated'),
        manualLessons: addSourceToLessonMap(manualSchedule, 'manual'),
        effectiveLessons: normalizeLessonMap(effectiveSchedule),
        manualSchedule
    };
};

const upsertLessonInSchedule = (schedule, lesson) => {
    const normalized = normalizeClassSchedule(schedule);
    const dayLessons = normalized[lesson.dayKey] || [];
    const nextDayLessons = [
        ...dayLessons.filter((item) => item.id !== lesson.id && item.time !== lesson.time),
        {
            id: lesson.id || `manual-${Date.now()}`,
            time: normalizeTimeValue(lesson.time),
            courseCode: lesson.courseCode || '',
            courseName: lesson.courseName || '',
            instructor: lesson.instructor || '',
            classroom: lesson.classroom || '',
            source: 'manual',
            isEmpty: false
        }
    ].sort((left, right) => timeToMinutes(left.time) - timeToMinutes(right.time));

    return {
        ...createEmptyWeekSchedule(),
        ...normalized,
        [lesson.dayKey]: nextDayLessons.map(({ id, source, ...rest }) => rest)
    };
};

const deleteLessonFromSchedule = (schedule, dayKey, lessonId, time) => {
    const normalized = normalizeClassSchedule(schedule);
    return {
        ...createEmptyWeekSchedule(),
        ...normalized,
        [dayKey]: (normalized[dayKey] || [])
            .filter((lesson) => lesson.id !== lessonId && lesson.time !== time)
            .map(({ id, source, ...rest }) => rest)
    };
};

const TIME_SLOT_ANCHOR_DAY = SCHEDULE_DAYS[0].key;

const upsertEmptySlotInSchedule = (schedule, time, anchorDay = TIME_SLOT_ANCHOR_DAY) => {
    const normalized = normalizeClassSchedule(schedule);
    const dayLessons = normalized[anchorDay] || [];
    const nextDayLessons = [
        ...dayLessons.filter((lesson) => lesson.time !== time),
        {
            time: normalizeTimeValue(time),
            courseCode: '',
            courseName: '',
            instructor: '',
            classroom: '',
            isEmpty: true
        }
    ].sort((left, right) => timeToMinutes(left.time) - timeToMinutes(right.time));

    return {
        ...createEmptyWeekSchedule(),
        ...normalized,
        [anchorDay]: nextDayLessons
    };
};

const renameTimeInSchedule = (schedule, previousTime, nextTime) => {
    const normalized = normalizeClassSchedule(schedule);
    let changed = false;
    const nextSchedule = Object.fromEntries(
        Object.entries({ ...createEmptyWeekSchedule(), ...normalized }).map(([dayKey, lessons]) => [
            dayKey,
            lessons
                .map((lesson) => {
                    if (lesson.time !== previousTime) return lesson;
                    changed = true;
                    return { ...lesson, time: normalizeTimeValue(nextTime) };
                })
                .sort((left, right) => timeToMinutes(left.time) - timeToMinutes(right.time))
        ])
    );

    if (!changed) {
        return upsertEmptySlotInSchedule(normalized, nextTime);
    }

    return nextSchedule;
};

const deleteTimeFromSchedule = (schedule, time) => {
    const normalized = normalizeClassSchedule(schedule);
    return Object.fromEntries(
        Object.entries({ ...createEmptyWeekSchedule(), ...normalized }).map(([dayKey, lessons]) => [
            dayKey,
            lessons.filter((lesson) => lesson.time !== time)
        ])
    );
};

const replaceDayInSchedule = (schedule, dayKey, lessons) => {
    const normalized = normalizeClassSchedule(schedule);
    return {
        ...createEmptyWeekSchedule(),
        ...normalized,
        [dayKey]: normalizeClassSchedule({ [dayKey]: lessons })[dayKey] || []
    };
};

const INSTRUCTOR_MARKERS = [
    'Öğr. Gör. Dr.',
    'Dr. Öğr. Üyesi',
    'Öğr. Gör.',
    'Doç. Dr.',
    'Prof. Dr.',
    'Arş. Gör.',
    'Dr.',
    'Öğr. Üyesi'
];

const parseQuickAddScheduleText = (rawText) => {
    return rawText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => !/^saat\b/i.test(line))
        .map(parseQuickAddLine)
        .filter(Boolean)
        .sort((left, right) => timeToMinutes(left.time) - timeToMinutes(right.time));
};

const parseQuickAddLine = (line) => {
    const timeMatch = line.match(/^(\d{1,2}[:.]\d{2})/);
    if (!timeMatch) return null;

    const time = normalizeTimeValue(timeMatch[1]);
    if (!isValidTime(time)) return null;

    const remainder = line.slice(timeMatch[0].length).trim();
    if (!remainder) {
        return createEmptyParsedLesson(time);
    }

    const tabParts = remainder
        .split('\t')
        .map((part) => part.trim())
        .filter(Boolean);

    if (tabParts.length >= 4) {
        return {
            time,
            courseCode: tabParts[0] || '',
            courseName: tabParts[1] || '',
            instructor: tabParts[2] || '',
            classroom: (tabParts[3] || '').slice(-4),
            isEmpty: false
        };
    }

    const classroom = remainder.slice(-4).trim();
    const withoutClassroom = remainder.slice(0, Math.max(0, remainder.length - 4)).trim();

    if (!withoutClassroom) {
        return createEmptyParsedLesson(time);
    }

    const instructorIndex = findInstructorStartIndex(withoutClassroom);
    const instructor = instructorIndex >= 0 ? withoutClassroom.slice(instructorIndex).trim() : '';
    const beforeInstructor = instructorIndex >= 0 ? withoutClassroom.slice(0, instructorIndex).trim() : withoutClassroom;

    const firstSpaceIndex = beforeInstructor.indexOf(' ');
    if (firstSpaceIndex === -1) {
        return {
            time,
            courseCode: beforeInstructor,
            courseName: '',
            instructor,
            classroom,
            isEmpty: false
        };
    }

    const courseCode = beforeInstructor.slice(0, firstSpaceIndex).trim();
    const courseName = beforeInstructor.slice(firstSpaceIndex + 1).trim();

    if (!courseCode && !courseName && !instructor && !classroom) {
        return createEmptyParsedLesson(time);
    }

    return {
        time,
        courseCode,
        courseName,
        instructor,
        classroom,
        isEmpty: false
    };
};

const createEmptyParsedLesson = (time) => ({
    time,
    courseCode: '',
    courseName: '',
    instructor: '',
    classroom: '',
    isEmpty: true
});

const findInstructorStartIndex = (value) => {
    const indexes = INSTRUCTOR_MARKERS
        .map((marker) => value.indexOf(marker))
        .filter((index) => index >= 0);

    if (indexes.length === 0) return -1;
    return Math.min(...indexes);
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default AdminPanel;
