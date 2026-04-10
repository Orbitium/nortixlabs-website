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
const SCHEDULE_STORAGE_KEY = 'akademiz_fake_schedule_admin_v1';

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'schedule', label: 'Ders Programları', icon: Settings },
    { id: 'events', label: 'Etkinlikler', icon: Calendar },
    { id: 'community', label: 'Topluluk', icon: Users },
    { id: 'news', label: 'Haberler', icon: MessageSquare }
];

const GRADE_OPTIONS = [
    { key: 'grade1', label: '1. Sınıf' },
    { key: 'grade2', label: '2. Sınıf' }
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

const createSeedLesson = (id, time, courseCode, courseName, instructor, classroom) => ({
    id,
    time,
    courseCode,
    courseName,
    instructor,
    classroom,
    source: 'generated'
});

const SCHEDULE_SEED_DATA = [
    {
        id: 'sgt-a',
        programName: 'Siber Güvenlik Teknolojileri',
        className: '1. Grup',
        academicYear: '2025-2026',
        semester: 'Bahar',
        generated: {
            grade1: {
                PAZARTESI: [
                    createSeedLesson('sgt-a-g1-1', '08:30', 'SGT101', 'Ağ Temelleri', 'Öğretim Görevlisi A', 'Lab 3'),
                    createSeedLesson('sgt-a-g1-2', '10:30', 'SGT103', 'Linux Uygulamaları', 'Öğretim Görevlisi C', 'Lab 1')
                ],
                SALI: [
                    createSeedLesson('sgt-a-g1-3', '09:30', 'SGT105', 'Temel Programlama', 'Dr. B', 'Derslik 12')
                ],
                PERSEMBE: [
                    createSeedLesson('sgt-a-g1-4', '13:30', 'SGT109', 'Siber Hijyen', 'Öğretim Görevlisi D', 'Atölye 2')
                ]
            },
            grade2: {
                PAZARTESI: [
                    createSeedLesson('sgt-a-g2-1', '09:30', 'SGT204', 'Web Güvenliği', 'Öğretim Görevlisi F', 'Lab 2')
                ],
                SALI: [
                    createSeedLesson('sgt-a-g2-2', '13:30', 'SGT208', 'Zafiyet Analizi', 'Dr. G', 'Lab 4')
                ],
                PERSEMBE: [
                    createSeedLesson('sgt-a-g2-3', '10:30', 'SGT210', 'Adli Bilişim', 'Öğretim Görevlisi H', 'Derslik 8')
                ]
            }
        }
    },
    {
        id: 'sgt-b',
        programName: 'Siber Güvenlik Teknolojileri',
        className: '2. Grup',
        academicYear: '2025-2026',
        semester: 'Bahar',
        generated: {
            grade1: {
                PAZARTESI: [
                    createSeedLesson('sgt-b-g1-1', '08:30', 'SGT101', 'Ağ Temelleri', 'Öğretim Görevlisi N', 'Lab 5')
                ],
                CARSAMBA: [
                    createSeedLesson('sgt-b-g1-2', '11:30', 'SGT111', 'Temel Kriptografi', 'Dr. P', 'B-204')
                ]
            },
            grade2: {
                SALI: [
                    createSeedLesson('sgt-b-g2-1', '08:30', 'SGT206', 'SIEM Operasyonları', 'Öğretim Görevlisi R', 'SOC Lab')
                ],
                CUMA: [
                    createSeedLesson('sgt-b-g2-2', '13:30', 'SGT214', 'Pentest Lab', 'Dr. S', 'Lab 7')
                ]
            }
        }
    },
    {
        id: 'bpr-a',
        programName: 'Bilgisayar Programcılığı',
        className: '1. Grup',
        academicYear: '2025-2026',
        semester: 'Bahar',
        generated: {
            grade1: {
                PAZARTESI: [
                    createSeedLesson('bpr-a-g1-1', '08:30', 'BPR101', 'Algoritma Mantığı', 'Dr. I', 'B-101')
                ],
                SALI: [
                    createSeedLesson('bpr-a-g1-2', '10:30', 'BPR103', 'Veritabanı Temelleri', 'Öğretim Görevlisi J', 'Lab 5')
                ],
                CARSAMBA: [
                    createSeedLesson('bpr-a-g1-3', '13:30', 'BPR107', 'Nesne Tabanlı Programlama', 'Dr. K', 'Lab 6')
                ]
            },
            grade2: {
                SALI: [
                    createSeedLesson('bpr-a-g2-1', '08:30', 'BPR202', 'Mobil Programlama', 'Dr. L', 'Lab 2')
                ],
                CARSAMBA: [
                    createSeedLesson('bpr-a-g2-2', '11:30', 'BPR204', 'API Geliştirme', 'Öğretim Görevlisi M', 'Lab 3')
                ],
                PERSEMBE: [
                    createSeedLesson('bpr-a-g2-3', '09:30', 'BPR206', 'Bulut Tabanlı Sistemler', 'Dr. N', 'A-303')
                ]
            }
        }
    }
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

    const handleEventCreated = () => {
        setEventView('list');
        setEventNotice('Etkinlik taslağı oluşturuldu. Liste bağlantısı geldiğinde burada görünecek.');
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
                                            label="Haber Oluştur"
                                            color="bg-violet-500/20 text-violet-400"
                                            icon={<Plus size={20} />}
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

                    {activeTab === 'news' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-bold text-white">Haber Akışı</h3>
                                <button className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-900/20">
                                    <Plus size={20} />
                                    Haber Oluştur
                                </button>
                            </div>
                            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex items-center justify-center h-48 italic text-slate-500">
                                Haber yönetim araçları burada görünecek...
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
                        <PostForm onClose={() => setIsModalOpen(false)} user={user} />
                    </div>
                </div>
            )}
        </div>
    );
};

const ScheduleManager = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [selectedScheduleId, setSelectedScheduleId] = useState('');
    const [selectedGradeKey, setSelectedGradeKey] = useState('grade1');
    const [editorState, setEditorState] = useState(null);
    const [timeSlotEditor, setTimeSlotEditor] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const initialLoad = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await fakeScheduleApi.listSchedules();
                if (cancelled) return;
                setSchedules(response);
                if (!selectedScheduleId && response.length > 0) {
                    setSelectedScheduleId(response[0].id);
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
        const selectedExists = schedules.some((schedule) => schedule.id === selectedScheduleId);
        if (!selectedExists) {
            setSelectedScheduleId(schedules[0].id);
        }
    }, [schedules, selectedScheduleId]);

    useEffect(() => {
        setEditorState(null);
        setTimeSlotEditor(null);
        setError('');
        setNotice('');
    }, [selectedScheduleId, selectedGradeKey]);

    const selectedSchedule = schedules.find((schedule) => schedule.id === selectedScheduleId) || schedules[0];
    const selectedGrade = selectedSchedule?.grades?.[selectedGradeKey];
    const scheduleBoard = buildScheduleBoard(selectedGrade);
    const selectedCell = editorState
        ? scheduleBoard.cellMap[makeScheduleCellKey(editorState.dayKey, editorState.time)] || createEmptyScheduleCell(editorState.dayKey, editorState.time)
        : null;

    const loadSchedules = async ({ successMessage = '' } = {}) => {
        try {
            const response = await fakeScheduleApi.listSchedules();
            setSchedules(response);
            if (response.length > 0 && !response.some((schedule) => schedule.id === selectedScheduleId)) {
                setSelectedScheduleId(response[0].id);
            }
            if (successMessage) {
                setNotice(successMessage);
            }
        } catch (err) {
            setError(err.message || 'Ders programı verisi güncellenemedi.');
        }
    };

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

    const openTimeSlotEditor = (slot) => {
        setError('');
        setNotice('');
        setTimeSlotEditor({
            slotId: slot.id,
            previousTime: slot.time,
            sourceTime: slot.originalTime,
            startTime: slot.time,
            endTime: slot.endTime,
            isNew: false
        });
    };

    const openCreateTimeSlot = () => {
        const lastSlot = scheduleBoard.timeSlots[scheduleBoard.timeSlots.length - 1];
        const defaultStart = lastSlot?.endTime || lastSlot?.time || '17:30';
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
        if (!selectedSchedule || !editorState) return;

        if (!editorState.courseName.trim()) {
            setError('Ders adı zorunludur.');
            return;
        }

        if (!isValidTime(editorState.time)) {
            setError('Saat hücresi verisi geçersiz. Lütfen farklı bir kutu seçin.');
            return;
        }

        try {
            setSaving(true);
            setError('');
            setNotice('');

            await fakeScheduleApi.upsertManualLesson({
                scheduleId: selectedSchedule.id,
                gradeKey: selectedGradeKey,
                lesson: {
                    id: editorState.manualLessonId || undefined,
                    dayKey: editorState.dayKey,
                    time: editorState.time.trim(),
                    courseCode: editorState.courseCode.trim(),
                    courseName: editorState.courseName.trim(),
                    instructor: editorState.instructor.trim(),
                    classroom: editorState.classroom.trim()
                }
            });

            await loadSchedules({
                successMessage: editorState.manualLessonId
                    ? 'Hücredeki manuel ders güncellendi.'
                    : 'Hücreye manuel ders eklendi.'
            });
            setEditorState(null);
        } catch (err) {
            setError(err.message || 'Hücre kaydı güncellenemedi.');
        } finally {
            setSaving(false);
        }
    };

    const handleOverrideToggle = async () => {
        if (!selectedSchedule || !selectedGrade) return;

        try {
            setSaving(true);
            setError('');
            setNotice('');

            await fakeScheduleApi.setOverride({
                scheduleId: selectedSchedule.id,
                gradeKey: selectedGradeKey,
                enabled: !selectedGrade.overrideEnabled
            });

            await loadSchedules({
                successMessage: !selectedGrade.overrideEnabled
                    ? 'Yalnızca kaydedilen dersler gösterilecek.'
                    : 'Tüm ders akışı tekrar gösterilecek.'
            });
        } catch (err) {
            setError(err.message || 'Görünüm modu güncellenemedi.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteLesson = async () => {
        if (!selectedSchedule || !editorState?.manualLessonId) return;

        try {
            setSaving(true);
            setError('');
            setNotice('');

            await fakeScheduleApi.deleteManualLesson({
                scheduleId: selectedSchedule.id,
                gradeKey: selectedGradeKey,
                lessonId: editorState.manualLessonId
            });

            await loadSchedules({ successMessage: 'Hücredeki manuel ders kaldırıldı.' });
            setEditorState(null);
        } catch (err) {
            setError(err.message || 'Manuel ders silinemedi.');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveTimeSlot = async (e) => {
        e.preventDefault();
        if (!selectedSchedule || !timeSlotEditor) return;

        if (!isValidTime(timeSlotEditor.startTime) || !isValidTime(timeSlotEditor.endTime)) {
            setError('Saat aralığı HH:MM formatında olmalıdır.');
            return;
        }

        if (timeToMinutes(timeSlotEditor.endTime) <= timeToMinutes(timeSlotEditor.startTime)) {
            setError('Bitiş saati başlangıç saatinden sonra olmalıdır.');
            return;
        }

        const hasDuplicate = scheduleBoard.timeSlots.some((slot) => (
            slot.time === timeSlotEditor.startTime && slot.id !== timeSlotEditor.slotId
        ));
        if (hasDuplicate) {
            setError('Bu başlangıç saati zaten kullanılıyor.');
            return;
        }

        try {
            setSaving(true);
            setError('');
            setNotice('');

            await fakeScheduleApi.upsertTimeSlot({
                scheduleId: selectedSchedule.id,
                gradeKey: selectedGradeKey,
                slot: {
                    id: timeSlotEditor.slotId || undefined,
                    previousTime: timeSlotEditor.previousTime || undefined,
                    sourceTime: timeSlotEditor.sourceTime || undefined,
                    startTime: timeSlotEditor.startTime.trim(),
                    endTime: timeSlotEditor.endTime.trim()
                }
            });

            await loadSchedules({
                successMessage: timeSlotEditor.isNew
                    ? 'Yeni saat satırı eklendi.'
                    : 'Saat satırı güncellendi.'
            });
            setEditorState(null);
            setTimeSlotEditor(null);
        } catch (err) {
            setError(err.message || 'Saat satırı kaydedilemedi.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTimeSlot = async () => {
        if (!selectedSchedule || !timeSlotEditor?.slotId) return;

        try {
            setSaving(true);
            setError('');
            setNotice('');

            await fakeScheduleApi.deleteTimeSlot({
                scheduleId: selectedSchedule.id,
                gradeKey: selectedGradeKey,
                slotId: timeSlotEditor.slotId
            });

            await loadSchedules({ successMessage: 'Saat satırı silindi.' });
            setEditorState(null);
            setTimeSlotEditor(null);
        } catch (err) {
            setError(err.message || 'Saat satırı silinemedi.');
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

    if (!selectedSchedule || !selectedGrade) {
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
                <h3 className="mt-3 text-3xl font-bold text-white">Bir sınıf seçin, kademe belirleyin ve bir hücreye tıklayın</h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                    Haftalık tabloyu doğrudan düzenlemek için kutuya tıklayın. Seçilen sınıf düzeyi için sağ tarafta yalnızca son görünecek program akışını görürsünüz.
                </p>
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
                <div className="space-y-6">
                    <div className="rounded-[2rem] border border-white/5 bg-slate-900/50 p-6 backdrop-blur-xl">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Sınıf Seçimi</p>
                            <h4 className="text-xl font-bold text-white">Düzenlemek istediğiniz sınıfı seçin</h4>
                            <p className="text-sm leading-7 text-slate-400">
                                Açılır listeden sınıfı seçerek program görünümünü değiştirebilirsiniz.
                            </p>
                        </div>

                        <ScheduleClassPicker
                            schedules={schedules}
                            selectedScheduleId={selectedSchedule.id}
                            onSelect={setSelectedScheduleId}
                        />
                    </div>

                    <div className="rounded-[2rem] border border-white/5 bg-slate-900/50 p-6 backdrop-blur-xl">
                        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Seçili Görünüm</p>
                                <h4 className="mt-2 text-xl font-bold text-white">
                                    {selectedSchedule.programName} • {selectedSchedule.className}
                                </h4>
                                <p className="mt-2 text-sm leading-7 text-slate-400">
                                    Sınıf düzeyini seçin, sonra tabloda bir kutuya tıklayıp dersi girin. Sağ panel seçili düzey için son akışı gösterir.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 xl:items-end">
                                <div className="space-y-2">
                                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Sınıf Düzeyi</span>
                                    <div className="flex rounded-2xl border border-white/10 bg-slate-950/60 p-1">
                                        {GRADE_OPTIONS.map((grade) => (
                                            <button
                                                type="button"
                                                key={grade.key}
                                                onClick={() => setSelectedGradeKey(grade.key)}
                                                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${selectedGradeKey === grade.key
                                                    ? 'bg-cyan-500 text-slate-950'
                                                    : 'text-slate-400 hover:text-white'
                                                    }`}
                                            >
                                                {grade.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleOverrideToggle}
                                    disabled={saving}
                                    className={`inline-flex items-center justify-center rounded-2xl border px-5 py-3 text-sm font-bold transition ${selectedGrade.overrideEnabled
                                        ? 'border-amber-400/30 bg-amber-400/15 text-amber-200'
                                        : 'border-white/10 bg-white/5 text-slate-300'
                                        } ${saving ? 'cursor-not-allowed opacity-60' : 'hover:scale-[1.01]'}`}
                                >
                                    {selectedGrade.overrideEnabled ? 'Yalnızca Kaydedilen Dersler' : 'Tüm Geçerli Dersler'}
                                </button>
                            </div>
                        </div>

                        {selectedGrade.overrideEnabled && selectedGrade.counts.manual === 0 && (
                            <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-4 text-sm leading-6 text-amber-100">
                                Bu mod açık ancak bu sınıf düzeyi için henüz kaydedilmiş ders yok.
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
                        title="Seçili Sınıf Düzeyi Akışı"
                        description="Sağdaki liste, seçili sınıf düzeyi için son görünecek akışı gösterir."
                        lessonMap={selectedGrade.effectiveLessons}
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
                creatorName: formData.creatorName.trim() || 'AkademiZ Admin',
                location: formData.location.trim(),
                thumbnailUrl: formData.thumbnailUrl,
                tags: JSON.stringify(parsedTags),
                carouselImages: JSON.stringify(formData.carouselImages)
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
                    description: '',
                    creatorName: 'AkademiZ Admin',
                    location: '',
                    eventLength: '',
                    maxJoiners: '',
                    tags: '',
                    thumbnailUrl: '',
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
                        <h4 className="mt-2 text-xl font-bold text-white">Gerekli olan kısım kısa tutuldu</h4>
                        <p className="mt-2 text-sm leading-7 text-slate-400">Yalnızca başlık ve tarih zorunlu. Açıklamayı kısa bırakabilirsiniz.</p>
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
                        <h4 className="mt-2 text-xl font-bold text-slate-200">Detay isteyenler için hafif ikinci katman</h4>
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

                <section className="rounded-[2rem] border border-white/5 bg-slate-900/45 p-6 backdrop-blur-xl">
                    <div className="mb-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Medya</p>
                        <h4 className="mt-2 text-xl font-bold text-white">Kaybolan görsel seçeneklerini geri getirdim</h4>
                        <p className="mt-2 text-sm leading-7 text-slate-500">Kapak görseli ekleyebilir, ayrıca etkinlik sayfası için küçük bir galeri oluşturabilirsiniz.</p>
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
                        disabled={isSubmitting || uploadingTarget !== ''}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                        Etkinliği Oluştur
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
                                <div className="mt-2 text-sm text-slate-500">{formData.date ? new Date(formData.date).toLocaleString('tr-TR') : 'Tarih seçilmedi'}</div>
                            </div>

                            <div className="text-sm leading-6 text-slate-400">
                                {formData.description || 'Kısa açıklama girerseniz burada önizlemesini göreceksiniz.'}
                            </div>

                            <div className="space-y-2 text-sm text-slate-500">
                                <div>Oluşturan: <span className="text-slate-300">{formData.creatorName || 'AkademiZ Admin'}</span></div>
                                <div>Konum: <span className="text-slate-300">{formData.location || 'Belirtilmedi'}</span></div>
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
    const template = {
        gridTemplateColumns: `92px repeat(${SCHEDULE_DAYS.length}, minmax(152px, 1fr))`
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

const SchedulePreviewCard = ({ title, description, lessonMap, emptyText }) => {
    const entries = getOrderedLessonEntries(lessonMap);

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

const fakeScheduleApi = {
    async listSchedules() {
        await wait(180);
        return buildScheduleSnapshot();
    },

    async upsertManualLesson({ scheduleId, gradeKey, lesson }) {
        await wait(180);
        const storage = readScheduleStorage();
        const currentGrade = storage[scheduleId]?.[gradeKey] || {
            overrideEnabled: false,
            manualLessons: {}
        };
        const currentDayLessons = (currentGrade.manualLessons || {})[lesson.dayKey] || [];

        const nextLesson = {
            id: lesson.id || `manual-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            time: lesson.time,
            courseCode: lesson.courseCode,
            courseName: lesson.courseName,
            instructor: lesson.instructor,
            classroom: lesson.classroom,
            source: 'manual'
        };
        const nextDayLessons = [
            ...currentDayLessons.filter((item) => item.id !== lesson.id && item.time !== lesson.time),
            nextLesson
        ].sort((left, right) => timeToMinutes(left.time) - timeToMinutes(right.time));

        const nextStorage = {
            ...storage,
            [scheduleId]: {
                ...(storage[scheduleId] || {}),
                [gradeKey]: {
                    ...currentGrade,
                    manualLessons: {
                        ...(currentGrade.manualLessons || {}),
                        [lesson.dayKey]: nextDayLessons
                    }
                }
            }
        };

        writeScheduleStorage(nextStorage);
        return buildScheduleSnapshot();
    },

    async setOverride({ scheduleId, gradeKey, enabled }) {
        await wait(120);
        const storage = readScheduleStorage();
        const currentGrade = storage[scheduleId]?.[gradeKey] || {
            overrideEnabled: false,
            manualLessons: {}
        };

        writeScheduleStorage({
            ...storage,
            [scheduleId]: {
                ...(storage[scheduleId] || {}),
                [gradeKey]: {
                    ...currentGrade,
                    overrideEnabled: enabled
                }
            }
        });

        return buildScheduleSnapshot();
    },

    async deleteManualLesson({ scheduleId, gradeKey, lessonId }) {
        await wait(120);
        const storage = readScheduleStorage();
        const currentGrade = storage[scheduleId]?.[gradeKey] || {
            overrideEnabled: false,
            manualLessons: {}
        };

        const nextManualLessons = Object.fromEntries(
            Object.entries(currentGrade.manualLessons || {}).map(([dayKey, lessons]) => [
                dayKey,
                lessons.filter((lesson) => lesson.id !== lessonId)
            ]).filter(([, lessons]) => lessons.length > 0)
        );

        writeScheduleStorage({
            ...storage,
            [scheduleId]: {
                ...(storage[scheduleId] || {}),
                [gradeKey]: {
                    ...currentGrade,
                    manualLessons: nextManualLessons
                }
            }
        });

        return buildScheduleSnapshot();
    },

    async upsertTimeSlot({ scheduleId, gradeKey, slot }) {
        await wait(120);
        const storage = readScheduleStorage();
        const currentGrade = getStoredGradeState(storage, scheduleId, gradeKey);
        const timeSlots = normalizeStoredTimeSlots(currentGrade.timeSlots);
        const slotId = slot.id || `slot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const sourceTime = slot.sourceTime || slot.startTime;

        const nextTimeSlots = [...timeSlots.filter((item) => item.id !== slotId), {
            id: slotId,
            originalTime: sourceTime,
            startTime: slot.startTime,
            endTime: slot.endTime
        }].sort((left, right) => timeToMinutes(left.startTime) - timeToMinutes(right.startTime));

        writeScheduleStorage({
            ...storage,
            [scheduleId]: {
                ...(storage[scheduleId] || {}),
                [gradeKey]: {
                    ...currentGrade,
                    timeSlots: nextTimeSlots,
                    manualLessons: slot.previousTime && slot.previousTime !== slot.startTime
                        ? moveManualLessonsToNewTime(currentGrade.manualLessons, slot.previousTime, slot.startTime)
                        : currentGrade.manualLessons
                }
            }
        });

        return buildScheduleSnapshot();
    },

    async deleteTimeSlot({ scheduleId, gradeKey, slotId }) {
        await wait(120);
        const storage = readScheduleStorage();
        const currentGrade = getStoredGradeState(storage, scheduleId, gradeKey);
        const timeSlots = normalizeStoredTimeSlots(currentGrade.timeSlots);
        const targetSlot = timeSlots.find((slot) => slot.id === slotId);
        if (!targetSlot) {
            return buildScheduleSnapshot();
        }

        writeScheduleStorage({
            ...storage,
            [scheduleId]: {
                ...(storage[scheduleId] || {}),
                [gradeKey]: {
                    ...currentGrade,
                    timeSlots: timeSlots.filter((slot) => slot.id !== slotId),
                    manualLessons: removeManualLessonsForTime(currentGrade.manualLessons, targetSlot.startTime)
                }
            }
        });

        return buildScheduleSnapshot();
    }
};

const buildScheduleSnapshot = () => {
    const storage = readScheduleStorage();

    return SCHEDULE_SEED_DATA.map((schedule) => {
        const storedSchedule = storage[schedule.id] || {};
        const grades = Object.fromEntries(
            GRADE_OPTIONS.map(({ key }) => {
                const gradeState = getStoredGradeState(storedSchedule, '', key);
                const timeSlots = normalizeStoredTimeSlots(gradeState.timeSlots);
                const generatedLessons = mapGeneratedLessonsToTimeSlots(schedule.generated[key] || {}, timeSlots);
                const manualLessons = normalizeLessonMap(gradeState.manualLessons || {});
                const overrideEnabled = gradeState.overrideEnabled === true;
                const effectiveLessons = overrideEnabled
                    ? normalizeLessonMap(markLessonsAsManual(manualLessons))
                    : mergeLessonMaps(generatedLessons, manualLessons);

                return [key, {
                    overrideEnabled,
                    timeSlots,
                    generatedLessons,
                    manualLessons: normalizeLessonMap(markLessonsAsManual(manualLessons)),
                    effectiveLessons,
                    counts: {
                        generated: countLessons(generatedLessons),
                        manual: countLessons(manualLessons),
                        effective: countLessons(effectiveLessons)
                    }
                }];
            })
        );

        return {
            ...schedule,
            grades
        };
    });
};

const readScheduleStorage = () => {
    if (typeof window === 'undefined') return {};

    try {
        const raw = window.localStorage.getItem(SCHEDULE_STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (err) {
        console.error('Failed to read fake schedule storage', err);
        return {};
    }
};

const writeScheduleStorage = (value) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(value));
};

const getDefaultGradeState = () => ({
    overrideEnabled: false,
    manualLessons: {},
    timeSlots: createDefaultTimeSlots()
});

const getStoredGradeState = (storage, scheduleId, gradeKey) => {
    if (scheduleId) {
        return {
            ...getDefaultGradeState(),
            ...(storage[scheduleId]?.[gradeKey] || {})
        };
    }

    return {
        ...getDefaultGradeState(),
        ...(storage[gradeKey] || {})
    };
};

const createDefaultTimeSlots = () => DEFAULT_SCHEDULE_TIMES.map((time) => ({
    id: `slot-${time}`,
    originalTime: time,
    startTime: time,
    endTime: addMinutesToTime(time, 50)
}));

const normalizeStoredTimeSlots = (timeSlots = []) => {
    const source = timeSlots.length > 0 ? timeSlots : createDefaultTimeSlots();
    return [...source]
        .map((slot) => ({
            id: slot.id || `slot-${slot.originalTime || slot.startTime}`,
            originalTime: slot.originalTime || slot.startTime,
            startTime: slot.startTime,
            endTime: slot.endTime || addMinutesToTime(slot.startTime, 50)
        }))
        .filter((slot) => isValidTime(slot.startTime) && isValidTime(slot.endTime))
        .sort((left, right) => timeToMinutes(left.startTime) - timeToMinutes(right.startTime));
};

const normalizeLessonMap = (lessonMap = {}) => {
    const result = {};

    Object.entries(lessonMap || {}).forEach(([dayKey, lessons]) => {
        result[dayKey] = [...lessons]
            .map((lesson) => ({ ...lesson }))
            .sort((left, right) => timeToMinutes(left.time) - timeToMinutes(right.time));
    });

    return result;
};

const moveManualLessonsToNewTime = (lessonMap = {}, previousTime, nextTime) => {
    const result = {};

    Object.entries(lessonMap || {}).forEach(([dayKey, lessons]) => {
        const nextLessons = lessons
            .map((lesson) => (
                lesson.time === previousTime
                    ? { ...lesson, time: nextTime }
                    : { ...lesson }
            ))
            .sort((left, right) => timeToMinutes(left.time) - timeToMinutes(right.time));

        if (nextLessons.length > 0) {
            result[dayKey] = nextLessons;
        }
    });

    return result;
};

const removeManualLessonsForTime = (lessonMap = {}, removedTime) => Object.fromEntries(
    Object.entries(lessonMap || {})
        .map(([dayKey, lessons]) => [
            dayKey,
            lessons.filter((lesson) => lesson.time !== removedTime).map((lesson) => ({ ...lesson }))
        ])
        .filter(([, lessons]) => lessons.length > 0)
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

const countLessonsAcrossSchedules = (schedules, key) => schedules.reduce(
    (total, schedule) => total + GRADE_OPTIONS.reduce(
        (gradeTotal, grade) => gradeTotal + (schedule.grades?.[grade.key]?.counts?.[key === 'manualLessons' ? 'manual' : 'effective'] || 0),
        0
    ),
    0
);

const countOverridesAcrossSchedules = (schedules) => schedules.reduce(
    (total, schedule) => total + GRADE_OPTIONS.reduce(
        (gradeTotal, grade) => gradeTotal + (schedule.grades?.[grade.key]?.overrideEnabled ? 1 : 0),
        0
    ),
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

const buildScheduleBoard = (grade) => {
    if (!grade) {
        return {
            timeSlots: createDefaultTimeSlots().map((slot) => ({
                id: slot.id,
                originalTime: slot.originalTime,
                time: slot.startTime,
                endTime: slot.endTime
            })),
            cellMap: {},
            filledCells: 0
        };
    }

    const generatedByCell = indexLessonsByCell(grade.generatedLessons);
    const manualByCell = indexLessonsByCell(grade.manualLessons);
    const effectiveByCell = indexLessonsByCell(grade.effectiveLessons);
    const normalizedTimeSlots = normalizeStoredTimeSlots(grade.timeSlots).map((slot) => ({
        id: slot.id,
        originalTime: slot.originalTime,
        time: slot.startTime,
        endTime: slot.endTime
    }));
    const cellMap = {};

    normalizedTimeSlots.forEach(({ time }) => {
        SCHEDULE_DAYS.forEach((day) => {
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
        timeSlots: normalizedTimeSlots,
        cellMap,
        filledCells: Object.values(cellMap).filter((cell) => cell.mode !== 'empty').length
    };
};

const getOrderedLessonEntries = (lessonMap = {}) => {
    const usedKeys = new Set();
    const ordered = [];

    SCHEDULE_DAYS.forEach((day) => {
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
