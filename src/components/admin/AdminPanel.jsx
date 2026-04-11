import React, { useState, useEffect, useRef } from 'react';
import { auth, googleProvider } from '../../lib/firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import {
    LogOut, ShieldAlert, GraduationCap, LayoutDashboard,
    Settings, Users, MessageSquare, Calendar, Plus,
    X, Upload, Image as ImageIcon, Send, Loader2, Pencil, Trash2,
    ChevronDown, RefreshCw
} from 'lucide-react';

const API_BASE_URL = 'https://akademiz-api.nortixlabs.com';

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
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

const AdminPanel = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(''); // 'post'
    const [eventView, setEventView] = useState('list');
    const [eventNotice, setEventNotice] = useState('');
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const accountMenuRef = useRef(null);
    const activeNavItem = NAV_ITEMS.find((item) => item.id === activeTab);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    const [_, domain] = currentUser.email.split('@');

                    if (domain && domain.toLowerCase().includes('.edu')) {
                        setUser(currentUser);
                        setError(null);
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

    const handleEventCreated = (createdEvent) => {
        setEventView('list');
        const status = createdEvent?.status || (createdEvent?.isActive === false ? 'draft' : 'active');
        setEventNotice(status === 'active' ? 'Etkinlik yayınlandı.' : 'Etkinlik taslak olarak kaydedildi.');
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
                                <EventManager notice={eventNotice} onCreate={openEventCreator} />

                            )}
                        </div>
                    )}

                    {activeTab === 'community' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-bold text-white">Topluluk Gönderileri</h3>
                                <button
                                    onClick={() => openModal('post')}
                                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20"
                                >
                                    <Plus size={20} />
                                    Yeni Gönderi
                                </button>
                            </div>
                            <div className="max-w-3xl mx-auto space-y-6">
                                {/* Placeholder for community list */}
                                <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex items-center justify-center h-48 italic text-slate-500">
                                    Topluluk gönderileri burada yüklenecek...
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'news' && <NewsManager />}
                </main>
            </div>

            {/* Modals */}
            {isModalOpen && modalType === 'post' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
                        <PostForm onClose={() => setIsModalOpen(false)} user={user} />
                    </div>
                </div>
            )}
        </div>
    );
};

const parseJsonArray = (value) => {
    if (Array.isArray(value)) return value;
    if (!value) return [];

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const getEventStatus = (event) => {
    if (event?.status === 'active' || event?.isActive === true) return 'active';
    return 'draft';
};

const getEventImageUrl = (event) => {
    const imageUrl = event?.thumbnailFullUrl || event?.thumbnailUrl || parseJsonArray(event?.carouselImageFullUrls)[0] || parseJsonArray(event?.carouselImages)[0];
    if (!imageUrl) return '';
    return imageUrl.startsWith('/') ? `${API_BASE_URL}${imageUrl}` : imageUrl;
};

const formatEventDate = (value) => {
    if (!value) return 'Tarih yok';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

const EventManager = ({ notice, onCreate }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [localNotice, setLocalNotice] = useState('');
    const [busyEventId, setBusyEventId] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;

        const loadEvents = async () => {
            try {
                setLoading(true);
                setError('');
                const token = await auth.currentUser.getIdToken(true);
                const response = await fetch(`${API_BASE_URL}/admin/events`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(`Etkinlikler yüklenemedi: ${response.status} ${text}`);
                }

                const result = await response.json();
                const items = Array.isArray(result) ? result : (result.events || result.data || []);

                if (!cancelled) {
                    setEvents(items);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('Etkinlikler yüklenemedi', err);
                    setError(err.message || 'Etkinlikler yüklenemedi.');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadEvents();

        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    const updateEventStatus = async (event) => {
        const nextStatus = getEventStatus(event) === 'active' ? 'draft' : 'active';

        try {
            setBusyEventId(event.id);
            setError('');
            setLocalNotice('');
            const token = await auth.currentUser.getIdToken(true);
            const response = await fetch(`${API_BASE_URL}/events/edit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: event.id, status: nextStatus })
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Etkinlik güncellenemedi: ${response.status} ${text}`);
            }

            const result = await response.json();
            const updatedEvent = result.event || result.data || result;
            setEvents((current) => current.map((item) => item.id === event.id
                ? { ...item, ...updatedEvent, isActive: nextStatus === 'active', status: nextStatus }
                : item
            ));
            setLocalNotice(nextStatus === 'active' ? 'Etkinlik yayına alındı.' : 'Etkinlik taslağa alındı.');
        } catch (err) {
            console.error('Etkinlik güncellenemedi', err);
            setError(err.message || 'Etkinlik güncellenemedi.');
        } finally {
            setBusyEventId(null);
        }
    };

    const deleteEvent = async (event) => {
        const confirmed = window.confirm(`"${event.title || 'Etkinlik'}" silinsin mi?`);
        if (!confirmed) return;

        try {
            setBusyEventId(event.id);
            setError('');
            setLocalNotice('');
            const token = await auth.currentUser.getIdToken(true);
            const response = await fetch(`${API_BASE_URL}/events/delete`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: event.id })
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Etkinlik silinemedi: ${response.status} ${text}`);
            }

            setEvents((current) => current.filter((item) => item.id !== event.id));
            setLocalNotice('Etkinlik silindi.');
        } catch (err) {
            console.error('Etkinlik silinemedi', err);
            setError(err.message || 'Etkinlik silinemedi.');
        } finally {
            setBusyEventId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-white">Etkinlik Yönetimi</h3>
                    <p className="mt-2 text-sm text-slate-500">Yayınlanan ve taslak etkinlikleri buradan yönetin.</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={() => setReloadKey((key) => key + 1)}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-300 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        Yenile
                    </button>
                    <button
                        type="button"
                        onClick={onCreate}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-900/20 transition hover:bg-cyan-500"
                    >
                        <Plus size={18} />
                        Etkinlik Oluştur
                    </button>
                </div>
            </div>

            {(notice || localNotice) && (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-100">
                    {localNotice || notice}
                </div>
            )}

            {error && (
                <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-100">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-10">
                    <div className="flex items-center justify-center gap-3 text-slate-400">
                        <Loader2 className="animate-spin text-cyan-400" />
                        Etkinlikler yükleniyor...
                    </div>
                </div>
            ) : events.length === 0 ? (
                <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-10 text-center text-sm italic text-slate-500">
                    Henüz etkinlik bulunmuyor.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    {events.map((event) => {
                        const status = getEventStatus(event);
                        const imageUrl = getEventImageUrl(event);
                        const isBusy = busyEventId === event.id;
                        const tags = parseJsonArray(event.tags);

                        return (
                            <article key={event.id} className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/45">
                                <div className="flex flex-col sm:flex-row">
                                    <div className="h-56 bg-slate-950 sm:h-auto sm:w-48 sm:shrink-0">
                                        {imageUrl ? (
                                            <img src={imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-slate-700">
                                                <ImageIcon size={34} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1 p-5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] ${status === 'active'
                                                ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200'
                                                : 'border-amber-400/25 bg-amber-400/10 text-amber-200'
                                                }`}>
                                                {status === 'active' ? 'Yayında' : 'Taslak'}
                                            </span>
                                            <span className="text-xs text-slate-500">{formatEventDate(event.date)}</span>
                                        </div>

                                        <h4 className="mt-3 line-clamp-2 text-lg font-bold leading-snug text-white">
                                            {event.title || 'Başlıksız etkinlik'}
                                        </h4>

                                        {event.description && (
                                            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
                                                {event.description}
                                            </p>
                                        )}

                                        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                                            {event.location && <span>{event.location}</span>}
                                            <span>{event.views || 0} görüntülenme</span>
                                            <span>{event.likes || 0} beğeni</span>
                                            {event.maxJoiners ? <span>{event.maxJoiners} kontenjan</span> : null}
                                        </div>

                                        {tags.length > 0 && (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {tags.slice(0, 5).map((tag) => (
                                                    <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="mt-5 flex flex-wrap gap-3">
                                            <button
                                                type="button"
                                                onClick={() => updateEventStatus(event)}
                                                disabled={isBusy}
                                                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${status === 'active'
                                                    ? 'border border-amber-400/20 bg-amber-400/10 text-amber-100 hover:bg-amber-400/15'
                                                    : 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/15'
                                                    }`}
                                            >
                                                {isBusy ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                                                {status === 'active' ? 'Taslağa Al' : 'Yayınla'}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => deleteEvent(event)}
                                                disabled={isBusy}
                                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm font-bold text-red-100 transition hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {isBusy ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                                Sil
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const NewsManager = () => {
    const [newsItems, setNewsItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;

        const loadNews = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await fetch(`${API_BASE_URL}/news`);
                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(`Haberler yüklenemedi: ${response.status} ${text}`);
                }

                const result = await response.json();
                const items = Array.isArray(result) ? result : (result.news || result.data || []);
                if (!cancelled) {
                    setNewsItems(items);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('Haberler yüklenemedi', err);
                    setError(err.message || 'Haberler yüklenemedi.');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadNews();

        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    const formatNewsDate = (item) => {
        if (item.publishedAtText) return item.publishedAtText;

        const rawDate = item.publishedAt || item.createdAt;
        if (!rawDate) return 'Tarih yok';

        const date = new Date(rawDate);
        if (Number.isNaN(date.getTime())) return rawDate;

        return new Intl.DateTimeFormat('tr-TR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getNewsImage = (item) => {
        if (item.heroImage) return item.heroImage;

        try {
            const images = typeof item.imageUrls === 'string' ? JSON.parse(item.imageUrls) : item.imageUrls;
            return Array.isArray(images) ? images[0] : '';
        } catch {
            return '';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-white">Haber Akışı</h3>
                    <p className="mt-2 text-sm text-slate-500">AkademiZ haber kaynağındaki son kayıtlar.</p>
                </div>
                <button
                    type="button"
                    onClick={() => setReloadKey((key) => key + 1)}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-300 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    Yenile
                </button>
            </div>

            {error && (
                <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-100">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-10">
                    <div className="flex items-center justify-center gap-3 text-slate-400">
                        <Loader2 className="animate-spin text-cyan-400" />
                        Haberler yükleniyor...
                    </div>
                </div>
            ) : newsItems.length === 0 ? (
                <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-10 text-center text-sm italic text-slate-500">
                    Gösterilecek haber bulunamadı.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    {newsItems.map((item) => {
                        const imageUrl = getNewsImage(item);

                        return (
                            <article key={item.id || item.detailUrl || item.title} className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/45">
                                <div className="flex flex-col sm:flex-row">
                                    <div className="h-48 bg-slate-950 sm:h-auto sm:w-44 sm:shrink-0">
                                        {imageUrl ? (
                                            <img src={imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-slate-700">
                                                <ImageIcon size={32} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1 p-5">
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                            {item.faculty && (
                                                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 font-semibold uppercase tracking-[0.12em] text-cyan-200">
                                                    {item.faculty}
                                                </span>
                                            )}
                                            <span>{formatNewsDate(item)}</span>
                                        </div>

                                        <h4 className="mt-3 line-clamp-2 text-lg font-bold leading-snug text-white">
                                            {item.title || 'Başlıksız haber'}
                                        </h4>

                                        {item.summary && (
                                            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
                                                {item.summary}
                                            </p>
                                        )}

                                        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                                            {item.authorName && <span>{item.authorName}</span>}
                                            <span>{item.views || 0} görüntülenme</span>
                                            <span>{item.likes || 0} beğeni</span>
                                            {item.detailUrl && (
                                                <a
                                                    href={item.detailUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="font-semibold text-cyan-300 transition hover:text-cyan-200"
                                                >
                                                    Kaynağı aç
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const ScheduleManager = () => {
    const [schedules, setSchedules] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [selectedScheduleId, setSelectedScheduleId] = useState('');
    const [selectedClassKey, setSelectedClassKey] = useState('');
    const [editorState, setEditorState] = useState(null);
    const [timeSlotEditor, setTimeSlotEditor] = useState(null);
    const [classForm, setClassForm] = useState({ name: '', key: '' });

    useEffect(() => {
        let cancelled = false;

        const initialLoad = async () => {
            try {
                setLoading(true);
                setError('');
                const token = await auth.currentUser.getIdToken(true);
                const [classResponse, scheduleResponse] = await Promise.all([
                    scheduleAdminApi.listClasses(token),
                    scheduleAdminApi.listSchedules(token)
                ]);
                if (cancelled) return;
                setClasses(classResponse);
                setSchedules(scheduleResponse);
                if (!selectedScheduleId && scheduleResponse.length > 0) {
                    setSelectedScheduleId(String(scheduleResponse[0].id));
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || 'Ders programı yönetim verisi yüklenemedi.');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        initialLoad();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (schedules.length === 0) return;
        const selectedExists = schedules.some((schedule) => String(schedule.id) === String(selectedScheduleId));
        if (!selectedExists) {
            setSelectedScheduleId(String(schedules[0].id));
        }
    }, [schedules, selectedScheduleId]);

    useEffect(() => {
        if (!selectedScheduleId || loading) return;
        let cancelled = false;

        const loadSelected = async () => {
            try {
                const token = await auth.currentUser.getIdToken(true);
                const detail = await scheduleAdminApi.getManualSchedule(selectedScheduleId, token);
                if (!cancelled) {
                    setSchedules((prev) => replaceScheduleInList(prev, detail));
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || 'Seçili ders programı yüklenemedi.');
                }
            }
        };

        loadSelected();

        return () => {
            cancelled = true;
        };
    }, [selectedScheduleId, loading]);

    useEffect(() => {
        setEditorState(null);
        setTimeSlotEditor(null);
        setError('');
        setNotice('');
    }, [selectedScheduleId, selectedClassKey]);

    const selectedSchedule = schedules.find((schedule) => String(schedule.id) === String(selectedScheduleId)) || schedules[0];
    const classOptions = getScheduleClassOptions(classes, selectedSchedule);
    const selectedClass = buildClassScheduleView(selectedSchedule, selectedClassKey, classOptions);
    const scheduleBoard = buildScheduleBoard(selectedClass);
    const selectedCell = editorState
        ? scheduleBoard.cellMap[makeScheduleCellKey(editorState.dayKey, editorState.time)] || createEmptyScheduleCell(editorState.dayKey, editorState.time)
        : null;

    useEffect(() => {
        if (classOptions.length === 0) {
            if (selectedClassKey) setSelectedClassKey('');
            return;
        }

        if (!classOptions.some((classItem) => classItem.key === selectedClassKey)) {
            setSelectedClassKey(classOptions[0].key);
        }
    }, [classOptions, selectedClassKey]);

    const loadSchedules = async ({ successMessage = '' } = {}) => {
        try {
            const token = await auth.currentUser.getIdToken(true);
            const [classResponse, scheduleResponse] = await Promise.all([
                scheduleAdminApi.listClasses(token),
                scheduleAdminApi.listSchedules(token)
            ]);
            const activeScheduleId = selectedScheduleId || scheduleResponse[0]?.id || '';
            const detailedSchedule = activeScheduleId
                ? await scheduleAdminApi.getManualSchedule(activeScheduleId, token)
                : null;
            const nextSchedules = detailedSchedule
                ? replaceScheduleInList(scheduleResponse, detailedSchedule)
                : scheduleResponse;
            setClasses(classResponse);
            setSchedules(nextSchedules);
            if (activeScheduleId) {
                setSelectedScheduleId(String(activeScheduleId));
            }
            if (nextSchedules.length > 0 && !nextSchedules.some((schedule) => String(schedule.id) === String(activeScheduleId))) {
                setSelectedScheduleId(String(nextSchedules[0].id));
            }
            if (successMessage) {
                setNotice(successMessage);
            }
        } catch (err) {
            setError(err.message || 'Ders programı verisi güncellenemedi.');
        }
    };

    const updateSelectedClassSchedule = async (nextClassSchedule, successMessage) => {
        if (!selectedSchedule || !selectedClassKey) return;
        const token = await auth.currentUser.getIdToken(true);
        const updatedSchedule = await scheduleAdminApi.updateManualClassSchedule({
            scheduleId: selectedSchedule.id,
            classKey: selectedClassKey,
            classSchedule: nextClassSchedule,
            token
        });
        setSchedules((prev) => replaceScheduleInList(prev, updatedSchedule));
        setNotice(successMessage);
    };

    const openEditor = (cell) => {
        const existingLesson = cell.manualLessons.find((lesson) => !lesson.isEmpty) || cell.effectiveLessons.find((lesson) => !lesson.isEmpty) || null;
        setError('');
        setNotice('');
        setEditorState({
            dayKey: cell.dayKey,
            time: cell.time,
            manualLessonId: cell.manualLessons[0]?.id || cell.manualLessons[0]?.time || '',
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

    const openTimeSlotEditor = (slot) => {
        setError('');
        setNotice('');
        setTimeSlotEditor({
            slotId: slot.id,
            previousTime: slot.time,
            sourceTime: slot.time,
            startTime: slot.startTime || extractStartTime(slot.time),
            endTime: slot.endTime || extractEndTime(slot.time),
            isNew: false
        });
    };

    const openCreateTimeSlot = () => {
        const lastSlot = scheduleBoard.timeSlots[scheduleBoard.timeSlots.length - 1];
        const defaultStart = lastSlot?.endTime || extractStartTime(lastSlot?.time) || '17:30';
        setError('');
        setNotice('');
        setTimeSlotEditor({
            slotId: '',
            previousTime: '',
            sourceTime: '',
            startTime: defaultStart,
            endTime: addMinutesToTime(defaultStart, 50) || '',
            isNew: true
        });
    };

    const closeTimeSlotEditor = () => {
        if (saving) return;
        setTimeSlotEditor(null);
    };

    const updateTimeSlotEditorField = (field, value) => {
        setTimeSlotEditor((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

    const updateEditorField = (field, value) => {
        setEditorState((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

    const handleSaveLesson = async (e) => {
        e.preventDefault();
        if (!selectedSchedule || !selectedClassKey || !editorState) return;

        if (!editorState.courseName.trim()) {
            setError('Ders adı zorunludur.');
            return;
        }

        try {
            setSaving(true);
            setError('');
            setNotice('');

            const nextClassSchedule = upsertManualLessonInClassSchedule(selectedClass.manualLessons, {
                dayKey: editorState.dayKey,
                time: editorState.time.trim(),
                courseCode: editorState.courseCode.trim(),
                courseName: editorState.courseName.trim(),
                instructor: editorState.instructor.trim(),
                classroom: editorState.classroom.trim()
            });

            await updateSelectedClassSchedule(nextClassSchedule, 'Hücre kaydedildi.');
            setEditorState(null);
        } catch (err) {
            setError(err.message || 'Hücre kaydı güncellenemedi.');
        } finally {
            setSaving(false);
        }
    };

    const handleOverrideToggle = async () => {
        if (!selectedSchedule) return;

        try {
            setSaving(true);
            setError('');
            setNotice('');

            const token = await auth.currentUser.getIdToken(true);
            const updatedSchedule = await scheduleAdminApi.setManualOverride({
                scheduleId: selectedSchedule.id,
                enabled: !selectedSchedule.manualOverrideEnabled,
                token
            });

            setSchedules((prev) => replaceScheduleInList(prev, updatedSchedule));
            setNotice(!selectedSchedule.manualOverrideEnabled
                ? 'Manuel ders programı yayına alındı.'
                : 'Otomatik ders programı tekrar yayına alındı.');
        } catch (err) {
            setError(err.message || 'Görünüm modu güncellenemedi.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteLesson = async () => {
        if (!selectedSchedule || !selectedClassKey || !editorState) return;

        try {
            setSaving(true);
            setError('');
            setNotice('');

            const nextClassSchedule = removeManualLessonsForTime(selectedClass.manualLessons, editorState.dayKey, editorState.time);
            await updateSelectedClassSchedule(nextClassSchedule, 'Hücredeki manuel kayıt kaldırıldı.');
            setEditorState(null);
        } catch (err) {
            setError(err.message || 'Manuel ders silinemedi.');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveTimeSlot = async (e) => {
        e.preventDefault();
        if (!selectedSchedule || !selectedClassKey || !timeSlotEditor) return;

        if (!isValidTime(timeSlotEditor.startTime) || !isValidTime(timeSlotEditor.endTime)) {
            setError('Saat aralığı HH:MM formatında olmalıdır.');
            return;
        }

        if (timeToMinutes(timeSlotEditor.endTime) <= timeToMinutes(timeSlotEditor.startTime)) {
            setError('Bitiş saati başlangıç saatinden sonra olmalıdır.');
            return;
        }

        try {
            setSaving(true);
            setError('');
            setNotice('');

            const nextTime = buildTimeLabel(timeSlotEditor.startTime.trim(), timeSlotEditor.endTime.trim());
            const nextClassSchedule = upsertManualTimeRow(selectedClass.manualLessons, {
                previousTime: timeSlotEditor.previousTime,
                nextTime,
                isNew: timeSlotEditor.isNew
            });

            await updateSelectedClassSchedule(nextClassSchedule, timeSlotEditor.isNew
                ? 'Yeni saat satırı eklendi.'
                : 'Saat satırı güncellendi.');
            setEditorState(null);
            setTimeSlotEditor(null);
        } catch (err) {
            setError(err.message || 'Saat satırı kaydedilemedi.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTimeSlot = async () => {
        if (!selectedSchedule || !selectedClassKey || !timeSlotEditor?.previousTime) return;

        try {
            setSaving(true);
            setError('');
            setNotice('');

            const nextClassSchedule = removeManualTimeRow(selectedClass.manualLessons, timeSlotEditor.previousTime);
            await updateSelectedClassSchedule(nextClassSchedule, 'Saat satırı silindi.');
            setEditorState(null);
            setTimeSlotEditor(null);
        } catch (err) {
            setError(err.message || 'Saat satırı silinemedi.');
        } finally {
            setSaving(false);
        }
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        if (!classForm.name.trim()) return;

        try {
            setSaving(true);
            setError('');
            setNotice('');
            const token = await auth.currentUser.getIdToken(true);
            const createdClass = await scheduleAdminApi.createClass({
                token,
                name: classForm.name.trim(),
                key: classForm.key.trim() || undefined
            });
            setClassForm({ name: '', key: '' });
            setSelectedClassKey(createdClass.key);
            await loadSchedules({ successMessage: 'Sınıf kaydı oluşturuldu.' });
        } catch (err) {
            setError(err.message || 'Sınıf kaydı oluşturulamadı.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClass = async (classItem) => {
        if (!classItem?.key) return;

        try {
            setSaving(true);
            setError('');
            setNotice('');
            const token = await auth.currentUser.getIdToken(true);
            await scheduleAdminApi.deleteClass({ token, idOrKey: classItem.id || classItem.key });
            if (selectedClassKey === classItem.key) {
                setSelectedClassKey('');
            }
            await loadSchedules({ successMessage: 'Sınıf kaydı silindi.' });
        } catch (err) {
            setError(err.message || 'Sınıf kaydı silinemedi.');
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

    if (!selectedSchedule) {
        return (
                <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-10 text-center text-slate-400">
                Ders programı kaydı bulunamadı.
                </div>
            );
        }

    return (
        <div className="space-y-6">
            <section className="rounded-[2rem] border border-cyan-500/15 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_rgba(15,23,42,0.92)_55%)] p-6 md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Ders Programı Düzenleyici</p>
                <h3 className="mt-3 text-3xl font-bold text-white">Sınıf kaydını seçin ve haftalık programı düzenleyin</h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                    Sınıflar artık backend kayıtlarından gelir. Manuel satırlar ve boş saatler seçili sınıf anahtarıyla kaydedilir.
                </p>
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
                <div className="space-y-6">
                    <div className="rounded-[2rem] border border-white/5 bg-slate-900/50 p-6 backdrop-blur-xl">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Program Seçimi</p>
                            <h4 className="text-xl font-bold text-white">Düzenlemek istediğiniz programı seçin</h4>
                            <p className="text-sm leading-7 text-slate-400">
                                Açılır listeden programı seçerek ders programı kaydını değiştirin.
                            </p>
                        </div>

                        <ScheduleClassPicker
                            schedules={schedules}
                            selectedScheduleId={selectedSchedule.id}
                            onSelect={setSelectedScheduleId}
                        />
                    </div>

                    <div className="rounded-[2rem] border border-white/5 bg-slate-900/50 p-6 backdrop-blur-xl">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Sınıf Kayıtları</p>
                            <h4 className="text-xl font-bold text-white">Backend sınıf listesini yönetin</h4>
                            <p className="text-sm leading-7 text-slate-400">
                                Anahtar, schedule içindeki sınıf anahtarıyla eşleşmelidir. Örnek: grade1.
                            </p>
                        </div>

                        <form onSubmit={handleCreateClass} className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                            <input
                                type="text"
                                value={classForm.name}
                                onChange={(e) => setClassForm((prev) => ({ ...prev, name: e.target.value }))}
                                placeholder="1. Sınıf"
                                className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
                            />
                            <input
                                type="text"
                                value={classForm.key}
                                onChange={(e) => setClassForm((prev) => ({ ...prev, key: e.target.value }))}
                                placeholder="grade1"
                                className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
                            />
                            <button
                                type="submit"
                                disabled={saving || !classForm.name.trim()}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Plus size={16} />
                                Sınıf Ekle
                            </button>
                        </form>

                        <div className="mt-5 flex flex-wrap gap-3">
                            {classOptions.length === 0 ? (
                                <span className="text-sm text-slate-500">Henüz sınıf kaydı yok. Programdaki availableClassKeys kullanılacak.</span>
                            ) : classOptions.map((classItem) => (
                                <div key={classItem.key} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedClassKey(classItem.key)}
                                        className={`text-sm font-semibold transition ${selectedClassKey === classItem.key ? 'text-cyan-200' : 'text-slate-300 hover:text-white'}`}
                                    >
                                        {classItem.name || classItem.key}
                                    </button>
                                    {classItem.id && (
                                        <button
                                            type="button"
                                            disabled={saving}
                                            onClick={() => handleDeleteClass(classItem)}
                                            className="rounded-full p-1 text-slate-500 transition hover:bg-red-400/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                                            aria-label={`${classItem.name || classItem.key} sınıfını sil`}
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-white/5 bg-slate-900/50 p-6 backdrop-blur-xl">
                        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Seçili Görünüm</p>
                                <h4 className="mt-2 text-xl font-bold text-white">
                                    {selectedSchedule.programName} {selectedSchedule.className ? `• ${selectedSchedule.className}` : ''}
                                </h4>
                                <p className="mt-2 text-sm leading-7 text-slate-400">
                                    Seçili sınıf: <span className="text-slate-200">{selectedClass.label || selectedClassKey || 'Sınıf seçilmedi'}</span>
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 xl:items-end">
                                <div className="space-y-2">
                                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Sınıf</span>
                                    <div className="flex rounded-2xl border border-white/10 bg-slate-950/60 p-1">
                                        {classOptions.map((grade) => (
                                            <button
                                                type="button"
                                                key={grade.key}
                                                onClick={() => setSelectedClassKey(grade.key)}
                                                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${selectedClassKey === grade.key
                                                    ? 'bg-cyan-500 text-slate-950'
                                                    : 'text-slate-400 hover:text-white'
                                                    }`}
                                            >
                                                {grade.name || grade.key}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleOverrideToggle}
                                    disabled={saving}
                                    className={`inline-flex items-center justify-center rounded-2xl border px-5 py-3 text-sm font-bold transition ${selectedSchedule.manualOverrideEnabled
                                        ? 'border-amber-400/30 bg-amber-400/15 text-amber-200'
                                        : 'border-white/10 bg-white/5 text-slate-300'
                                        } ${saving ? 'cursor-not-allowed opacity-60' : 'hover:scale-[1.01]'}`}
                                >
                                    {selectedSchedule.manualOverrideEnabled ? 'Manuel Program Yayında' : 'Otomatik Program Yayında'}
                                </button>
                            </div>
                        </div>

                        {selectedSchedule.manualOverrideEnabled && selectedClass.counts.manual === 0 && (
                            <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-4 text-sm leading-6 text-amber-100">
                                Manuel yayın açık ancak bu sınıf için henüz kaydedilmiş ders yok.
                            </div>
                        )}
                    </div>

                    {(error || notice) && (
                        <div className={`rounded-[2rem] border px-5 py-4 text-sm ${error
                            ? 'border-red-400/20 bg-red-400/10 text-red-100'
                            : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100'
                            }`}>
                            {error || notice}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <SchedulePreviewCard
                        title="Seçili Sınıf Akışı"
                        description="Sağdaki liste, seçili sınıf için öğrencinin göreceği son akışı gösterir."
                        lessonMap={selectedClass.effectiveLessons}
                        dayOptions={selectedClass.dayOptions}
                        emptyText="Bu seçim için gösterilecek ders yok."
                    />
                </div>

                <div className="xl:col-span-2">
                    <ScheduleBoardCard
                        board={scheduleBoard}
                        onCellClick={openEditor}
                        onTimeSlotClick={openTimeSlotEditor}
                        onAddTimeSlot={openCreateTimeSlot}
                        saving={saving}
                    />
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

            {timeSlotEditor && (
                <ScheduleTimeSlotModal
                    state={timeSlotEditor}
                    saving={saving}
                    error={error}
                    onClose={closeTimeSlotEditor}
                    onFieldChange={updateTimeSlotEditorField}
                    onDelete={handleDeleteTimeSlot}
                    onSubmit={handleSaveTimeSlot}
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
        dateTime: '',
        registrationEndDate: '',
        registrationEndTime: '',
        description: '',
        creatorName: 'AkademiZ Admin',
        location: '',
        eventLength: '',
        maxJoiners: '',
        tags: '',
        thumbnailUrl: '',
        carouselImages: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingTarget, setUploadingTarget] = useState('');
    const [submitError, setSubmitError] = useState('');

    const uploadImageFiles = async (files, type) => {
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
        }
    };

    const handleImageUpload = async (e, type) => {
        const files = Array.from(e.target.files || []);
        await uploadImageFiles(files, type);
        e.target.value = '';
    };

    const handleMediaPaste = async (e) => {
        const clipboardItems = Array.from(e.clipboardData?.items || []);
        const pastedFiles = clipboardItems
            .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
            .map((item) => item.getAsFile())
            .filter(Boolean);

        const fallbackFiles = Array.from(e.clipboardData?.files || [])
            .filter((file) => file.type.startsWith('image/'));

        const files = pastedFiles.length > 0 ? pastedFiles : fallbackFiles;
        if (files.length === 0 || uploadingTarget) return;

        e.preventDefault();
        await uploadImageFiles(files, 'gallery');
    };

    const removeGalleryImage = (index) => {
        setFormData((prev) => ({
            ...prev,
            carouselImages: prev.carouselImages.filter((_, imageIndex) => imageIndex !== index)
        }));
    };

    const buildDateTimeValue = (dateValue, timeValue) => (
        dateValue ? `${dateValue}T${timeValue || '00:00'}` : ''
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError('');
        try {
            const submitterStatus = e.nativeEvent?.submitter?.value;
            const isActive = submitterStatus !== 'draft';
            const draftDate = formData.date || new Date().toISOString().slice(0, 10);
            const token = await auth.currentUser.getIdToken(true);
            const parsedEventLength = parseFloat(formData.eventLength);
            const parsedMaxJoiners = parseInt(formData.maxJoiners, 10);
            const parsedTags = formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean);

            const payload = {
                title: formData.title.trim() || (isActive ? '' : 'Başlıksız Taslak'),
                date: buildDateTimeValue(isActive ? formData.date : draftDate, formData.dateTime),
                description: formData.description.trim() || (isActive ? '' : 'Taslak açıklaması daha sonra eklenecek.'),
                creatorName: formData.creatorName.trim() || 'AkademiZ Admin',
                location: formData.location.trim(),
                thumbnailUrl: formData.thumbnailUrl,
                tags: JSON.stringify(parsedTags),
                carouselImages: JSON.stringify(formData.carouselImages),
                isActive,
                status: isActive ? 'active' : 'draft'
            };

            if (formData.registrationEndDate) {
                payload.registrationEndDate = buildDateTimeValue(formData.registrationEndDate, formData.registrationEndTime);
            }

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
                const createdEvent = await res.json().catch(() => null);
                setFormData({
                    title: '',
                    date: '',
                    dateTime: '',
                    registrationEndDate: '',
                    registrationEndTime: '',
                    description: '',
                    creatorName: 'AkademiZ Admin',
                    location: '',
                    eventLength: '',
                    maxJoiners: '',
                    tags: '',
                    thumbnailUrl: '',
                    carouselImages: []
                });
                onCreated?.(createdEvent);
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
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
            <form onSubmit={handleSubmit} className="space-y-6">
                <section className="rounded-[2rem] border border-cyan-500/15 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_rgba(15,23,42,0.92)_58%)] p-6 md:p-8">
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Etkinlik Oluşturucu</p>
                            <h3 className="mt-3 text-2xl font-bold text-white">Yeni Etkinlik</h3>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                                Başlık ve tarih önde. Konum, medya ve diğer ayrıntılar opsiyonel olarak aşağıda duruyor.
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

                <section className="rounded-[2rem] border border-white/5 bg-slate-900/50 p-6 backdrop-blur-xl">
                    <div className="mb-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Temel Bilgiler</p>
                        <p className="mt-2 text-sm leading-7 text-slate-400">Başlık, tarih ve kısa açıklama yeterli. Diğer alanları sonra tamamlayabilirsiniz.</p>
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
                            <label className="text-sm font-medium text-slate-300">Tarih</label>
                            <input
                                required
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-500/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-500">Saat (Opsiyonel)</label>
                            <input
                                type="time"
                                value={formData.dateTime}
                                onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-slate-200 outline-none transition focus:border-cyan-500/40"
                            />
                            <p className="text-xs text-slate-600">Boş bırakılırsa 00:00 kullanılır.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-500">Kayıt Bitiş Tarihi</label>
                            <input
                                type="date"
                                value={formData.registrationEndDate}
                                onChange={(e) => setFormData({ ...formData, registrationEndDate: e.target.value })}
                                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-slate-200 outline-none transition focus:border-cyan-500/40"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-500">Kayıt Bitiş Saati (Opsiyonel)</label>
                            <input
                                type="time"
                                value={formData.registrationEndTime}
                                onChange={(e) => setFormData({ ...formData, registrationEndTime: e.target.value })}
                                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-slate-200 outline-none transition focus:border-cyan-500/40"
                            />
                            <p className="text-xs text-slate-600">Boş bırakılırsa 00:00 kullanılır.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-500">Konum</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-slate-200 outline-none transition focus:border-cyan-500/40"
                                placeholder="Ana yerleşke konferans salonu"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-slate-500">Kısa Açıklama</label>
                            <textarea
                                required
                                rows="4"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-slate-200 outline-none transition focus:border-cyan-500/40"
                                placeholder="İsterseniz kısa bir özet girin. Detayı sonradan da geliştirebilirsiniz."
                            />
                        </div>
                    </div>
                </section>

                <section className="rounded-[2rem] border border-dashed border-white/10 bg-slate-950/35 p-6 backdrop-blur-xl">
                    <div className="mb-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">İsteğe Bağlı Özelleştirmeler</p>
                        <p className="mt-2 text-sm leading-7 text-slate-500">Bu ayarlar zorunlu değil. Girmeden de etkinlik oluşturabilirsiniz.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                    </div>
                </section>

                <section
                    onPaste={handleMediaPaste}
                    tabIndex={0}
                    className="rounded-[2rem] border border-white/5 bg-slate-900/45 p-6 backdrop-blur-xl outline-none transition focus:border-cyan-500/30"
                >
                    <div className="mb-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Medya</p>
                        <p className="mt-2 text-sm leading-7 text-slate-500">Kapak görseli ekleyebilir, etkinlik galerisi için dosya seçebilir veya bu alana görsel yapıştırabilirsiniz.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-400">Kapak Görseli</label>
                            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                <div className="flex-1 relative group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'thumbnail')}
                                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 z-10"
                                    />
                                    <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-white/10 bg-slate-950/40 px-4 py-6 transition-all group-hover:border-cyan-500/30">
                                        {uploadingTarget === 'thumbnail' ? (
                                            <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
                                        ) : formData.thumbnailUrl ? (
                                            <>
                                                <ImageIcon className="shrink-0 text-cyan-400" />
                                                <span className="truncate text-sm text-cyan-200">{formData.thumbnailUrl}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-6 w-6 text-slate-500" />
                                                <span className="text-sm font-medium text-slate-500">Kapak görseli yüklemek için tıklayın</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {formData.thumbnailUrl && (
                                    <div className="h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shrink-0">
                                        <img src={formData.thumbnailUrl.startsWith('/') ? `${API_BASE_URL}${formData.thumbnailUrl}` : formData.thumbnailUrl} className="h-full w-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <label className="text-sm font-medium text-slate-400">Galeri Görselleri</label>
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
                                    <span className="text-sm">Galeri için bir veya birden fazla görsel ekleyin ya da bu alana yapıştırın</span>
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
                </section>

                {submitError && (
                    <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-100">
                        {submitError}
                    </div>
                )}

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
                        value="draft"
                        formNoValidate
                        disabled={isSubmitting || uploadingTarget !== ''}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-6 py-3 text-sm font-bold text-amber-100 transition hover:bg-amber-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Pencil size={18} />}
                        Taslak olarak Kaydet
                    </button>
                    <button
                        type="submit"
                        value="active"
                        disabled={isSubmitting || uploadingTarget !== ''}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                        Etkinliği Yayınla
                    </button>
                </div>
            </form>

            <aside className="space-y-6">
                <div className="rounded-[2rem] border border-white/5 bg-slate-900/50 p-6 backdrop-blur-xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Canlı Önizleme</p>
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
                                <div className="mt-2 text-sm text-slate-500">{formData.date ? new Date(buildDateTimeValue(formData.date, formData.dateTime)).toLocaleString('tr-TR') : 'Tarih seçilmedi'}</div>
                            </div>

                            <div className="text-sm leading-6 text-slate-400">
                                {formData.description || 'Kısa açıklama girerseniz burada önizlemesini göreceksiniz.'}
                            </div>

                            <div className="space-y-2 text-sm text-slate-500">
                                <div>Oluşturan: <span className="text-slate-300">{formData.creatorName || 'AkademiZ Admin'}</span></div>
                                <div>Konum: <span className="text-slate-300">{formData.location || 'Belirtilmedi'}</span></div>
                                <div>Kayıt Bitiş: <span className="text-slate-300">{formData.registrationEndDate ? new Date(buildDateTimeValue(formData.registrationEndDate, formData.registrationEndTime)).toLocaleString('tr-TR') : 'Belirtilmedi'}</span></div>
                                <div>Süre: <span className="text-slate-300">{formData.eventLength || 'Belirtilmedi'}</span></div>
                                <div>Katılımcı: <span className="text-slate-300">{formData.maxJoiners || 'Belirtilmedi'}</span></div>
                            </div>

                            {formData.tags && (
                                <div className="flex flex-wrap gap-2">
                                    {formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean).map((tag) => (
                                        <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="rounded-[2rem] border border-dashed border-white/10 bg-slate-950/35 p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Düzen Notu</p>
                    <p className="mt-3 text-sm leading-7 text-slate-500">
                        İkincil alanları özellikle daha gri tuttum. Böylece kullanıcı önce etkinliği yayına alır, detay seviyesini isterse sonra artırır.
                    </p>
                    <div className="mt-4 text-sm text-slate-400">
                        Varsayılan oluşturucu: <span className="text-white">{formData.creatorName || 'AkademiZ Admin'}</span>
                    </div>
                </div>
            </aside>
        </div>
    );
};

const PostForm = ({ onClose, user }) => {
    const [formData, setFormData] = useState({
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
        try {
            const token = await auth.currentUser.getIdToken(true);
            const body = {
                content: formData.content,
                imageUrl: formData.imageUrl
            };
            if (showPoll && formData.poll.question) {
                body.poll = {
                    question: formData.poll.question,
                    options: formData.poll.options.filter(o => o.trim())
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
                onClose();
            }
        } catch (err) {
            console.error('Gönderi oluşturma başarısız oldu', err);
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
                    <div>
                        <div className="font-bold text-white">{user.displayName}</div>
                        <div className="text-xs text-slate-500">Yönetici olarak paylaşılıyor</div>
                    </div>
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

            <div className="flex items-center justify-between border-t border-white/5 pt-6">
                <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 shrink-0">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                        />
                        <button type="button" className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${formData.imageUrl ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}>
                            {uploadingImage ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />}
                        </button>
                    </div>
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

const ScheduleClassPicker = ({ schedules, selectedScheduleId, onSelect }) => {
    const selectedSchedule = schedules.find((schedule) => schedule.id === selectedScheduleId) || schedules[0];

    return (
        <div className="mt-6 rounded-[1.5rem] border border-white/8 bg-slate-950/50 p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Sınıflar</div>
            <select
                value={selectedScheduleId}
                onChange={(e) => onSelect(e.target.value)}
                className="mt-3 block w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-cyan-400/40"
            >
                {schedules.map((schedule) => (
                    <option key={schedule.id} value={schedule.id}>
                        {schedule.programName} - {schedule.className}
                    </option>
                ))}
            </select>

            {selectedSchedule && (
                <>
                    <div className="mt-3 text-sm text-slate-400">
                        {selectedSchedule.academicYear} • {selectedSchedule.semester}
                    </div>
                    <div className="mt-1 text-sm text-slate-300">
                        {selectedSchedule.programName}
                    </div>
                </>
            )}
        </div>
    );
};

const ScheduleBoardCard = ({ board, onCellClick, onTimeSlotClick, onAddTimeSlot, saving }) => {
    const dayOptions = board.dayOptions?.length ? board.dayOptions : SCHEDULE_DAYS;
    const template = {
        gridTemplateColumns: `92px repeat(${dayOptions.length}, minmax(152px, 1fr))`
    };

    return (
        <div className="rounded-[2rem] border border-white/5 bg-slate-900/50 p-6 backdrop-blur-xl">
            <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Haftalık Tablo</p>
                <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <h4 className="text-xl font-bold text-white">Ders bilgisi eklemek veya düzenlemek için bir hücreye tıklayın</h4>
                    <button
                        type="button"
                        onClick={onAddTimeSlot}
                        disabled={saving}
                        className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${saving
                            ? 'cursor-not-allowed border-white/10 bg-white/5 text-slate-500 opacity-60'
                            : 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100 hover:border-cyan-300/30 hover:bg-cyan-400/15'
                            }`}
                    >
                        <Plus size={16} />
                        Yeni Saat Satırı
                    </button>
                </div>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
                    Omusiber'deki haftalık görünüme benzer şekilde saatler solda, günler üstte yer alır. Saat kutusuna tıklayarak aralığı düzenleyebilir, satır ekleyebilir veya silebilirsiniz.
                </p>
            </div>

            <div className="overflow-x-auto pb-2">
                <div className="min-w-[1220px]">
                    <div className="grid gap-3" style={template}>
                        <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/8 px-4 py-4">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">Saat</div>
                            <div className="mt-2 text-sm font-semibold text-slate-200">Gün</div>
                        </div>

                        {dayOptions.map((day) => (
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
                                    className={`rounded-2xl border border-white/8 bg-slate-950/70 px-3 py-4 text-left transition ${saving
                                        ? 'cursor-not-allowed opacity-60'
                                        : 'hover:border-cyan-300/25 hover:bg-cyan-400/8'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="text-sm font-bold text-white">{slot.time}</div>
                                            <div className="mt-2 text-xs text-slate-500">{slot.endTime}</div>
                                        </div>
                                        <Pencil size={15} className="text-slate-500" />
                                    </div>
                                </button>

                                {dayOptions.map((day) => {
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
    const isPersistentEmpty = cell.primaryLesson?.isEmpty;
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
                {isEmpty ? '+' : isPersistentEmpty ? 'Boş satır' : cell.primaryLesson?.courseName || 'Ders'}
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
                                Bu kutu için dersi kaydedin, güncelleyin veya isterseniz temizleyin.
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
                                Kaydedilen Değişikliği Temizle
                            </button>
                        ) : (
                            <div className="text-sm text-slate-500">
                                Bu hücre henüz kaydedilmemiş.
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
                                Hücreyi Kaydet
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

const SchedulePreviewCard = ({ title, description, lessonMap, dayOptions, emptyText }) => {
    const entries = getOrderedLessonEntries(lessonMap, dayOptions)
        .map(([dayKey, lessons]) => [dayKey, lessons.filter((lesson) => !lesson.isEmpty)])
        .filter(([, lessons]) => lessons.length > 0);

    return (
        <div className="rounded-[2rem] border border-white/5 bg-slate-900/50 p-6 backdrop-blur-xl">
            <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Akış</p>
                <h4 className="mt-2 text-xl font-bold text-white">{title}</h4>
                <p className="mt-2 text-sm leading-7 text-slate-400">{description}</p>
            </div>

            {entries.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/50 px-4 py-8 text-center text-sm text-slate-500">
                    {emptyText}
                </div>
            ) : (
                <div className="space-y-5">
                    {entries.map(([dayKey, lessons]) => (
                        <div key={dayKey}>
                            <div className="mb-3 flex items-center justify-between">
                                <h5 className="text-sm font-bold uppercase tracking-[0.24em] text-slate-400">{getDayLabel(dayKey)}</h5>
                                <span className="text-xs text-slate-500">{lessons.length} ders</span>
                            </div>

                            <div className="space-y-3">
                                {lessons.map((lesson) => (
                                    <div
                                        key={lesson.id}
                                        className="rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-4"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="min-w-[72px] rounded-2xl bg-white/5 px-3 py-2 text-center text-sm font-bold text-slate-200">
                                                {lesson.time}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-white">{lesson.courseName}</div>
                                                <div className="mt-1 text-sm text-slate-400">{formatLessonMeta(lesson)}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const scheduleAdminApi = {
    async listClasses(token) {
        return adminJsonFetch('/admin/classes', { token });
    },

    async createClass({ token, name, key }) {
        return adminJsonFetch('/admin/classes', {
            token,
            method: 'POST',
            body: { name, key }
        });
    },

    async deleteClass({ token, idOrKey }) {
        return adminJsonFetch(`/admin/classes/${encodeURIComponent(idOrKey)}`, {
            token,
            method: 'DELETE'
        });
    },

    async listSchedules(token) {
        return adminJsonFetch('/schedules', { token });
    },

    async getManualSchedule(scheduleId, token) {
        return adminJsonFetch(`/schedules/${encodeURIComponent(scheduleId)}/manual`, { token });
    },

    async updateManualClassSchedule({ scheduleId, classKey, classSchedule, token }) {
        return adminJsonFetch(`/schedules/${encodeURIComponent(scheduleId)}/manual/${encodeURIComponent(classKey)}`, {
            token,
            method: 'PUT',
            body: { schedule: stripLessonEditorFields(classSchedule) }
        });
    },

    async setManualOverride({ scheduleId, enabled, token }) {
        return adminJsonFetch(`/schedules/${encodeURIComponent(scheduleId)}/manual-override`, {
            token,
            method: 'PATCH',
            body: { enabled }
        });
    }
};

const adminJsonFetch = async (path, { token, method = 'GET', body } = {}) => {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            ...(body ? { 'Content-Type': 'application/json' } : {})
        },
        ...(body ? { body: JSON.stringify(body) } : {})
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `${path} isteği başarısız oldu: ${res.status}`);
    }

    if (res.status === 204) return null;
    return res.json();
};

const replaceScheduleInList = (schedules, nextSchedule) => {
    if (!nextSchedule) return schedules;
    const exists = schedules.some((schedule) => String(schedule.id) === String(nextSchedule.id));
    if (!exists) return [...schedules, nextSchedule];
    return schedules.map((schedule) => String(schedule.id) === String(nextSchedule.id) ? nextSchedule : schedule);
};

const getScheduleClassOptions = (classes = [], schedule) => {
    if (classes.length > 0) {
        return [...classes].sort((left, right) => (left.sortOrder || 0) - (right.sortOrder || 0));
    }

    const keys = schedule?.availableClassKeys?.length
        ? schedule.availableClassKeys
        : getClassKeysFromSchedule(schedule);

    return keys.map((key) => ({ key, name: key }));
};

const getClassKeysFromSchedule = (schedule) => {
    const keySet = new Set([
        ...Object.keys(schedule?.schedule || {}),
        ...Object.keys(schedule?.effectiveSchedule || {}),
        ...Object.keys(schedule?.manualSchedule || {}),
        ...Object.keys(schedule?.autoSchedule || {}),
        ...Object.keys(schedule?.autoScheduleRaw || {})
    ]);

    return [...keySet];
};

const buildClassScheduleView = (schedule, selectedClassKey, classOptions = []) => {
    const fallbackKey = classOptions[0]?.key || getClassKeysFromSchedule(schedule)[0] || '';
    const classKey = selectedClassKey || fallbackKey;
    const classMeta = classOptions.find((classItem) => classItem.key === classKey);
    const autoLessons = normalizeLessonMap((schedule?.autoSchedule?.[classKey] || schedule?.autoScheduleRaw?.[classKey] || {}), 'generated');
    const manualLessons = normalizeLessonMap(schedule?.manualSchedule?.[classKey] || {}, 'manual');
    const effectiveLessons = normalizeLessonMap((schedule?.effectiveSchedule?.[classKey] || schedule?.schedule?.[classKey] || {}), schedule?.manualOverrideEnabled ? 'manual' : 'generated');
    const dayOptions = getScheduleDayOptions(autoLessons, manualLessons, effectiveLessons);

    return {
        key: classKey,
        label: classMeta?.name || classKey,
        dayOptions,
        generatedLessons: autoLessons,
        manualLessons,
        effectiveLessons,
        counts: {
            generated: countLessons(autoLessons),
            manual: countLessons(manualLessons),
            effective: countLessons(effectiveLessons)
        }
    };
};

const getScheduleDayOptions = (...lessonMaps) => {
    const knownKeys = new Set(SCHEDULE_DAYS.map((day) => day.key));
    const customKeys = new Set();

    lessonMaps.forEach((lessonMap) => {
        Object.keys(lessonMap || {}).forEach((dayKey) => {
            if (!knownKeys.has(dayKey)) {
                customKeys.add(dayKey);
            }
        });
    });

    return [
        ...SCHEDULE_DAYS,
        ...[...customKeys].map((key) => ({ key, label: key }))
    ];
};

const createDefaultTimeSlots = () => DEFAULT_SCHEDULE_TIMES.map((time) => ({
    id: `slot-${time}`,
    originalTime: time,
    time,
    startTime: time,
    endTime: addMinutesToTime(time, 50)
}));

const normalizeLessonMap = (lessonMap = {}, source = '') => {
    const result = {};

    Object.entries(lessonMap || {}).forEach(([dayKey, lessons]) => {
        result[dayKey] = [...lessons]
            .filter((lesson) => lesson?.time)
            .map((lesson, index) => ({
                ...lesson,
                id: lesson.id || `${dayKey}-${lesson.time}-${index}`,
                ...(source ? { source } : {})
            }))
            .sort((left, right) => timeToMinutes(left.time) - timeToMinutes(right.time));
    });

    return result;
};

const upsertManualLessonInClassSchedule = (lessonMap = {}, lesson) => {
    const result = cloneLessonMap(lessonMap);
    const currentLessons = result[lesson.dayKey] || [];
    const nextLessons = [
        ...currentLessons.filter((item) => item.time !== lesson.time),
        { ...lesson, isEmpty: false }
    ].sort((left, right) => timeToMinutes(left.time) - timeToMinutes(right.time));

    result[lesson.dayKey] = nextLessons;
    return result;
};

const removeManualLessonsForTime = (lessonMap = {}, dayKey, removedTime) => {
    const result = cloneLessonMap(lessonMap);
    result[dayKey] = (result[dayKey] || []).filter((lesson) => lesson.time !== removedTime);
    if (result[dayKey].length === 0) {
        delete result[dayKey];
    }
    return result;
};

const upsertManualTimeRow = (lessonMap = {}, { previousTime, nextTime, isNew }) => {
    const result = cloneLessonMap(lessonMap);
    let movedAny = false;

    if (!isNew && previousTime) {
        Object.entries(result).forEach(([dayKey, lessons]) => {
            result[dayKey] = lessons.map((lesson) => {
                if (lesson.time !== previousTime) return lesson;
                movedAny = true;
                return { ...lesson, time: nextTime };
            });
        });
    }

    if (isNew || !movedAny) {
        const firstDayKey = SCHEDULE_DAYS[0].key;
        result[firstDayKey] = [
            ...(result[firstDayKey] || []).filter((lesson) => lesson.time !== nextTime),
            { time: nextTime, courseCode: '', courseName: '', instructor: '', classroom: '', isEmpty: true }
        ];
    }

    return sortLessonMap(result);
};

const removeManualTimeRow = (lessonMap = {}, removedTime) => Object.fromEntries(
    Object.entries(cloneLessonMap(lessonMap))
        .map(([dayKey, lessons]) => [
            dayKey,
            lessons.filter((lesson) => lesson.time !== removedTime)
        ])
        .filter(([, lessons]) => lessons.length > 0)
);

const cloneLessonMap = (lessonMap = {}) => Object.fromEntries(
    Object.entries(lessonMap || {}).map(([dayKey, lessons]) => [
        dayKey,
        (lessons || []).map((lesson) => ({ ...lesson }))
    ])
);

const sortLessonMap = (lessonMap = {}) => Object.fromEntries(
    Object.entries(lessonMap).map(([dayKey, lessons]) => [
        dayKey,
        [...lessons].sort((left, right) => timeToMinutes(left.time) - timeToMinutes(right.time))
    ])
);

const stripLessonEditorFields = (lessonMap = {}) => Object.fromEntries(
    Object.entries(lessonMap || {}).map(([dayKey, lessons]) => [
        dayKey,
        (lessons || []).map(({ id, source, dayKey: _dayKey, ...lesson }) => lesson)
    ])
);

const markLessonsAsManual = (lessonMap = {}) => Object.fromEntries(
    Object.entries(lessonMap).map(([dayKey, lessons]) => [
        dayKey,
        lessons.map((lesson) => ({ ...lesson, source: 'manual' }))
    ])
);

const mergeLessonMaps = (generatedLessons, manualLessons) => {
    const result = normalizeLessonMap(generatedLessons);

    Object.entries(markLessonsAsManual(manualLessons)).forEach(([dayKey, lessons]) => {
        const existingLessons = result[dayKey] || [];
        result[dayKey] = [...existingLessons, ...lessons]
            .sort((left, right) => timeToMinutes(left.time) - timeToMinutes(right.time));
    });

    return result;
};

const countLessons = (lessonMap = {}) => Object.values(lessonMap).reduce(
    (total, lessons) => total + lessons.length,
    0
);

const timeToMinutes = (value = '') => {
    const parts = extractStartTime(value).split(':');
    if (parts.length !== 2) return 9999;

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);
    return Number.isNaN(hours) || Number.isNaN(minutes) ? 9999 : (hours * 60) + minutes;
};

const extractStartTime = (value = '') => {
    const match = String(value).match(/(\d{1,2}):(\d{2})/);
    if (!match) return '';
    return `${match[1].padStart(2, '0')}:${match[2]}`;
};

const extractEndTime = (value = '') => {
    const matches = [...String(value).matchAll(/(\d{1,2}):(\d{2})/g)];
    if (matches.length < 2) return '';
    return `${matches[1][1].padStart(2, '0')}:${matches[1][2]}`;
};

const buildTimeLabel = (startTime, endTime) => (
    endTime ? `${startTime}-${endTime}` : startTime
);

const isValidTime = (value = '') => {
    const parts = value.trim().split(':');
    if (parts.length !== 2) return false;

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);
    return Number.isInteger(hours) && Number.isInteger(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
};

const formatLessonMeta = (lesson) => {
    if (lesson?.isEmpty) return 'Boş satır';
    return [lesson.courseCode, lesson.classroom, lesson.instructor].filter(Boolean).join(' • ') || 'Detay belirtilmedi';
};

const getDayLabel = (dayKey) => SCHEDULE_DAYS.find((day) => day.key === dayKey)?.label || dayKey;

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

const mapGeneratedLessonsToTimeSlots = (lessonMap = {}, timeSlots = []) => {
    const slotLookup = new Map(timeSlots.map((slot) => [slot.originalTime, slot]));
    const result = {};

    Object.entries(lessonMap || {}).forEach(([dayKey, lessons]) => {
        const mappedLessons = lessons
            .map((lesson) => {
                const slot = slotLookup.get(lesson.time);
                if (!slot) return null;
                return { ...lesson, time: slot.startTime };
            })
            .filter(Boolean)
            .sort((left, right) => timeToMinutes(left.time) - timeToMinutes(right.time));

        if (mappedLessons.length > 0) {
            result[dayKey] = mappedLessons;
        }
    });

    return result;
};

const createTimeSlotsFromLessonMaps = (...lessonMaps) => {
    const slotMap = new Map(createDefaultTimeSlots().map((slot) => [slot.time, slot]));

    lessonMaps.forEach((lessonMap) => {
        Object.values(lessonMap || {}).forEach((lessons) => {
            lessons.forEach((lesson) => {
                if (!lesson?.time || slotMap.has(lesson.time)) return;
                const startTime = extractStartTime(lesson.time);
                const endTime = extractEndTime(lesson.time);
                slotMap.set(lesson.time, {
                    id: `slot-${lesson.time}`,
                    originalTime: lesson.time,
                    time: lesson.time,
                    startTime,
                    endTime
                });
            });
        });
    });

    return [...slotMap.values()].sort((left, right) => timeToMinutes(left.time) - timeToMinutes(right.time));
};

const buildScheduleBoard = (grade) => {
    const dayOptions = grade?.dayOptions?.length ? grade.dayOptions : SCHEDULE_DAYS;

    if (!grade) {
        return {
            dayOptions,
            timeSlots: createDefaultTimeSlots(),
            cellMap: {},
            filledCells: 0
        };
    }

    const generatedByCell = indexLessonsByCell(grade.generatedLessons);
    const manualByCell = indexLessonsByCell(grade.manualLessons);
    const effectiveByCell = indexLessonsByCell(grade.effectiveLessons);
    const normalizedTimeSlots = createTimeSlotsFromLessonMaps(
        grade.generatedLessons,
        grade.manualLessons,
        grade.effectiveLessons
    );
    const cellMap = {};

    normalizedTimeSlots.forEach(({ time }) => {
        dayOptions.forEach((day) => {
            const key = makeScheduleCellKey(day.key, time);
            const generatedLessons = generatedByCell[key] || [];
            const manualLessons = manualByCell[key] || [];
            const effectiveLessons = effectiveByCell[key] || [];
            const primaryLesson = manualLessons[0] || effectiveLessons[0] || generatedLessons[0] || null;
            const mode = manualLessons.length > 0
                ? (grade.overrideEnabled ? 'override' : generatedLessons.length > 0 ? 'mixed' : 'manual')
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
        dayOptions,
        timeSlots: normalizedTimeSlots,
        cellMap,
        filledCells: Object.values(cellMap).filter((cell) => cell.mode !== 'empty').length
    };
};

const getOrderedLessonEntries = (lessonMap = {}, dayOptions = SCHEDULE_DAYS) => {
    const usedKeys = new Set();
    const ordered = [];

    dayOptions.forEach((day) => {
        const lessons = lessonMap[day.key];
        if (lessons && lessons.length > 0) {
            ordered.push([day.key, lessons]);
            usedKeys.add(day.key);
        }
    });

    Object.entries(lessonMap).forEach(([dayKey, lessons]) => {
        if (!usedKeys.has(dayKey) && lessons.length > 0) {
            ordered.push([dayKey, lessons]);
        }
    });

    return ordered;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default AdminPanel;
