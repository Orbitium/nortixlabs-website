import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from '../../lib/firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import {
    LogOut, ShieldAlert, GraduationCap, LayoutDashboard,
    Settings, Users, MessageSquare, Calendar, Plus,
    X, Upload, Image as ImageIcon, Send, Loader2
} from 'lucide-react';

const API_BASE_URL = 'https://akademiz-api.nortixlabs.com';
const SCHEDULE_STORAGE_KEY = 'akademiz_fake_schedule_admin_v1';

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'schedule', label: 'Schedules', icon: Settings },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'news', label: 'News Feed', icon: MessageSquare }
];

const GRADE_OPTIONS = [
    { key: 'grade1', label: '1. Sinif' },
    { key: 'grade2', label: '2. Sinif' }
];

const SCHEDULE_DAYS = [
    { key: 'PAZARTESI', label: 'Pazartesi' },
    { key: 'SALI', label: 'Sali' },
    { key: 'CARSAMBA', label: 'Carsamba' },
    { key: 'PERSEMBE', label: 'Persembe' },
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
        programName: 'Siber Guvenlik Teknolojileri',
        className: '1. Grup',
        academicYear: '2025-2026',
        semester: 'Bahar',
        generated: {
            grade1: {
                PAZARTESI: [
                    createSeedLesson('sgt-a-g1-1', '08:30', 'SGT101', 'Ag Temelleri', 'Ogretim Gorevlisi A', 'Lab 3'),
                    createSeedLesson('sgt-a-g1-2', '10:30', 'SGT103', 'Linux Uygulamalari', 'Ogretim Gorevlisi C', 'Lab 1')
                ],
                SALI: [
                    createSeedLesson('sgt-a-g1-3', '09:30', 'SGT105', 'Temel Programlama', 'Dr. B', 'Derslik 12')
                ],
                PERSEMBE: [
                    createSeedLesson('sgt-a-g1-4', '13:30', 'SGT109', 'Siber Hijyen', 'Ogretim Gorevlisi D', 'Atolye 2')
                ]
            },
            grade2: {
                PAZARTESI: [
                    createSeedLesson('sgt-a-g2-1', '09:30', 'SGT204', 'Web Guvenligi', 'Ogretim Gorevlisi F', 'Lab 2')
                ],
                SALI: [
                    createSeedLesson('sgt-a-g2-2', '13:30', 'SGT208', 'Zafiyet Analizi', 'Dr. G', 'Lab 4')
                ],
                PERSEMBE: [
                    createSeedLesson('sgt-a-g2-3', '10:30', 'SGT210', 'Adli Bilisim', 'Ogretim Gorevlisi H', 'Derslik 8')
                ]
            }
        }
    },
    {
        id: 'sgt-b',
        programName: 'Siber Guvenlik Teknolojileri',
        className: '2. Grup',
        academicYear: '2025-2026',
        semester: 'Bahar',
        generated: {
            grade1: {
                PAZARTESI: [
                    createSeedLesson('sgt-b-g1-1', '08:30', 'SGT101', 'Ag Temelleri', 'Ogretim Gorevlisi N', 'Lab 5')
                ],
                CARSAMBA: [
                    createSeedLesson('sgt-b-g1-2', '11:30', 'SGT111', 'Temel Kriptografi', 'Dr. P', 'B-204')
                ]
            },
            grade2: {
                SALI: [
                    createSeedLesson('sgt-b-g2-1', '08:30', 'SGT206', 'SIEM Operasyonlari', 'Ogretim Gorevlisi R', 'SOC Lab')
                ],
                CUMA: [
                    createSeedLesson('sgt-b-g2-2', '13:30', 'SGT214', 'Pentest Lab', 'Dr. S', 'Lab 7')
                ]
            }
        }
    },
    {
        id: 'bpr-a',
        programName: 'Bilgisayar Programciligi',
        className: '1. Grup',
        academicYear: '2025-2026',
        semester: 'Bahar',
        generated: {
            grade1: {
                PAZARTESI: [
                    createSeedLesson('bpr-a-g1-1', '08:30', 'BPR101', 'Algoritma Mantigi', 'Dr. I', 'B-101')
                ],
                SALI: [
                    createSeedLesson('bpr-a-g1-2', '10:30', 'BPR103', 'Veritabani Temelleri', 'Ogretim Gorevlisi J', 'Lab 5')
                ],
                CARSAMBA: [
                    createSeedLesson('bpr-a-g1-3', '13:30', 'BPR107', 'Nesne Tabanli Programlama', 'Dr. K', 'Lab 6')
                ]
            },
            grade2: {
                SALI: [
                    createSeedLesson('bpr-a-g2-1', '08:30', 'BPR202', 'Mobil Programlama', 'Dr. L', 'Lab 2')
                ],
                CARSAMBA: [
                    createSeedLesson('bpr-a-g2-2', '11:30', 'BPR204', 'API Gelistirme', 'Ogretim Gorevlisi M', 'Lab 3')
                ],
                PERSEMBE: [
                    createSeedLesson('bpr-a-g2-3', '09:30', 'BPR206', 'Bulut Tabanli Sistemler', 'Dr. N', 'A-303')
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
    const [modalType, setModalType] = useState(''); // 'event' or 'post'
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
                            setError('Access denied. Your account does not have administrator privileges.');
                            // We don't sign out automatically here so they can see the error, 
                            // but we don't set the user state.
                            setUser(null);
                        }
                    } else {
                        setError('Access denied. Only .edu email addresses are allowed.');
                        signOut(auth);
                        setUser(null);
                    }
                } catch (err) {
                    console.error("Auth check failed", err);
                    setError("Interal authentication error.");
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleGoogleSignIn = async () => {
        try {
            setError(null);
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            setError('Failed to sign in with Google. Please try again.');
            console.error(err);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (err) {
            console.error(err);
        }
    };

    const openModal = (type) => {
        setModalType(type);
        setIsModalOpen(true);
    };

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
                        <h1 className="text-3xl font-bold text-white mb-2">AkademiZ Admin</h1>
                        <p className="text-slate-400">Sign in to manage your university platform</p>
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
                            Sign in with Google
                        </button>

                        <p className="mt-8 text-center text-xs text-slate-500">
                            Only authorized <span className="text-cyan-400 font-semibold">.edu</span> email addresses are permitted.
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

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-20 border-b border-white/5 bg-slate-950/30 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
                    <h2 className="text-xl font-semibold text-white">{activeNavItem?.label || activeTab}</h2>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-medium text-white">{user.displayName}</div>
                            <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                        <img
                            src={user.photoURL}
                            alt={user.displayName}
                            className="w-10 h-10 rounded-full border border-cyan-500/20"
                        />
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
                                <StatCard title="Total Students" value="0" change="0 from last week" />
                                <StatCard title="Active Events" value="0" change="0 starting today" />
                                <StatCard title="News Published" value="0" change="0 pending approval" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                                        <button className="text-cyan-400 text-sm hover:underline">View all</button>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="text-center py-8 text-slate-500 italic text-sm">
                                            No recent activity to show
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6">
                                    <h3 className="text-lg font-semibold text-white mb-6">Quick Actions</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <QuickActionButton
                                            label="Edit Schedules"
                                            color="bg-cyan-500/20 text-cyan-400"
                                            icon={<Settings size={20} />}
                                            onClick={() => setActiveTab('schedule')}
                                        />
                                        <QuickActionButton
                                            label="Create News"
                                            color="bg-violet-500/20 text-violet-400"
                                            icon={<Plus size={20} />}
                                        />
                                        <QuickActionButton
                                            label="Add Event"
                                            color="bg-cyan-500/20 text-cyan-400"
                                            icon={<Plus size={20} />}
                                            onClick={() => openModal('event')}
                                        />
                                        <QuickActionButton
                                            label="New Post"
                                            color="bg-emerald-500/20 text-emerald-400"
                                            icon={<Plus size={20} />}
                                            onClick={() => openModal('post')}
                                        />
                                        <QuickActionButton
                                            label="Reports"
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
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-bold text-white">Events Management</h3>
                                <button
                                    onClick={() => openModal('event')}
                                    className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-900/20"
                                >
                                    <Plus size={20} />
                                    Create Event
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {/* Placeholder for events list */}
                                <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex items-center justify-center h-48 italic text-slate-500">
                                    Events data will be loaded here...
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'community' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-bold text-white">Community Posts</h3>
                                <button
                                    onClick={() => openModal('post')}
                                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20"
                                >
                                    <Plus size={20} />
                                    New Post
                                </button>
                            </div>
                            <div className="max-w-3xl mx-auto space-y-6">
                                {/* Placeholder for community list */}
                                <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex items-center justify-center h-48 italic text-slate-500">
                                    Community posts will be loaded here...
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'news' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-bold text-white">News Feed</h3>
                                <button className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-900/20">
                                    <Plus size={20} />
                                    Create News
                                </button>
                            </div>
                            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex items-center justify-center h-48 italic text-slate-500">
                                News management tools will appear here...
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Modals */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
                        {modalType === 'event' ? (
                            <EventForm onClose={() => setIsModalOpen(false)} user={user} />
                        ) : (
                            <PostForm onClose={() => setIsModalOpen(false)} user={user} />
                        )}
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
                    setError(err.message || 'Schedule admin verisi yuklenemedi.');
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
            setError(err.message || 'Schedule verisi guncellenemedi.');
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

    const updateEditorField = (field, value) => {
        setEditorState((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

    const handleSaveLesson = async (e) => {
        e.preventDefault();
        if (!selectedSchedule || !editorState) return;

        if (!editorState.courseName.trim()) {
            setError('Ders adi zorunlu.');
            return;
        }

        if (!isValidTime(editorState.time)) {
            setError('Saat hucre verisi gecersiz. Lutfen farkli bir kutu sec.');
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
                    ? 'Hucredeki manuel ders guncellendi.'
                    : 'Hucreye manuel ders eklendi.'
            });
            setEditorState(null);
        } catch (err) {
            setError(err.message || 'Hucre kaydi guncellenemedi.');
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
                    ? 'Yalnizca kaydedilen dersler gosterilecek.'
                    : 'Tum ders akisi tekrar gosterilecek.'
            });
        } catch (err) {
            setError(err.message || 'Gorunum modu guncellenemedi.');
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

            await loadSchedules({ successMessage: 'Hucredeki manuel ders kaldirildi.' });
            setEditorState(null);
        } catch (err) {
            setError(err.message || 'Manuel ders silinemedi.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-10 flex items-center justify-center min-h-[320px]">
                <div className="flex items-center gap-3 text-slate-400">
                    <Loader2 className="animate-spin text-cyan-400" />
                    Program yukleniyor...
                </div>
            </div>
        );
    }

    if (!selectedSchedule || !selectedGrade) {
        return (
            <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-10 text-center text-slate-400">
                Schedule kaydi bulunamadi.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <section className="rounded-[2rem] border border-cyan-500/15 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_rgba(15,23,42,0.92)_55%)] p-6 md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Schedule Editor</p>
                <h3 className="mt-3 text-3xl font-bold text-white">Select a class, pick a grade, click a slot</h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                    Haftalik tabloyu dogrudan duzenlemek icin kutuya tikla. Secilen grade icin sag tarafta sadece son gorunecek program akisini gorursun.
                </p>
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)]">
                <div className="space-y-6">
                    <div className="rounded-[2rem] border border-white/5 bg-slate-900/50 p-6 backdrop-blur-xl">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Class Selection</p>
                            <h4 className="text-xl font-bold text-white">Choose the class you want to edit</h4>
                            <p className="text-sm leading-7 text-slate-400">
                                Sinif secimini daha belirgin hale getirdim. Kartlardan birine tiklayip programi degistirebilirsin.
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
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Selected View</p>
                                <h4 className="mt-2 text-xl font-bold text-white">
                                    {selectedSchedule.programName} • {selectedSchedule.className}
                                </h4>
                                <p className="mt-2 text-sm leading-7 text-slate-400">
                                    Grade sec, sonra tabloda bir kutuya tiklayip dersi doldur. Sag panel secili grade icin son akisi gosterir.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 xl:items-end">
                                <div className="space-y-2">
                                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Grade</span>
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
                                    {selectedGrade.overrideEnabled ? 'Yalnizca Kaydedilen Dersler' : 'Tum Gecerli Dersler'}
                                </button>
                            </div>
                        </div>

                        {selectedGrade.overrideEnabled && selectedGrade.counts.manual === 0 && (
                            <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-4 text-sm leading-6 text-amber-100">
                                Bu mod acik ama bu grade icin henuz kaydedilmis ders yok.
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

                    <ScheduleBoardCard
                        board={scheduleBoard}
                        onCellClick={openEditor}
                        saving={saving}
                    />
                </div>

                <div className="space-y-6">
                    <SchedulePreviewCard
                        title="Secili Grade Akisi"
                        description="Sagdaki liste secili grade icin son gorunecek akistir."
                        lessonMap={selectedGrade.effectiveLessons}
                        emptyText="Bu secim icin gosterilecek ders yok."
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
        </div>
    );
};

// Forms
const EventForm = ({ onClose, user }) => {
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        description: '',
        location: '',
        eventLength: '',
        maxJoiners: '',
        tags: '',
        thumbnailUrl: '',
        carouselImages: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const handleImageUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        const token = await auth.currentUser.getIdToken(true);
        const data = new FormData();
        data.append('image', file);

        try {
            const res = await fetch(`${API_BASE_URL}/upload/image`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Upload failed: ${res.status} ${text}`);
            }

            const result = await res.json();
            if (type === 'thumbnail') {
                setFormData(prev => ({ ...prev, thumbnailUrl: result.url }));
            }
        } catch (err) {
            console.error('Upload failed', err);
            alert(err.message);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = await auth.currentUser.getIdToken(true);
            const res = await fetch(`${API_BASE_URL}/events/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    eventLength: parseFloat(formData.eventLength),
                    maxJoiners: parseInt(formData.maxJoiners),
                    tags: JSON.stringify(formData.tags.split(',').map(t => t.trim())),
                    carouselImages: JSON.stringify([])
                })
            });
            if (res.ok) {
                onClose();
            }
        } catch (err) {
            console.error('Event creation failed', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-white">Create New Event</h3>
                <button type="button" onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400">
                    <X size={24} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Event Title</label>
                    <input
                        required
                        type="text"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500/50 transition-colors"
                        placeholder="Grand Annual Tech Fair"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Date & Time</label>
                    <input
                        required
                        type="datetime-local"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Location</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500/50 transition-colors"
                            placeholder="Main Campus Hall"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Duration (Hrs)</label>
                        <input
                            type="number"
                            step="0.5"
                            value={formData.eventLength}
                            onChange={e => setFormData({ ...formData, eventLength: e.target.value })}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500/50 transition-colors"
                            placeholder="3.5"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Max Joiners</label>
                        <input
                            type="number"
                            value={formData.maxJoiners}
                            onChange={e => setFormData({ ...formData, maxJoiners: e.target.value })}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500/50 transition-colors"
                            placeholder="500"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Description</label>
                <textarea
                    required
                    rows="3"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                    placeholder="Describe the event details..."
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Tags (comma separated)</label>
                <input
                    type="text"
                    value={formData.tags}
                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    placeholder="tag1, tag2, tag3"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Thumbnail Image</label>
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative group">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'thumbnail')}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex items-center gap-3 bg-slate-950/50 border-2 border-dashed border-white/10 group-hover:border-cyan-500/30 rounded-xl px-4 py-6 transition-all">
                            {uploadingImage ? (
                                <Loader2 className="w-6 h-6 text-cyan-500 animate-spin mx-auto" />
                            ) : formData.thumbnailUrl ? (
                                <div className="flex items-center gap-3 text-cyan-400 overflow-hidden">
                                    <ImageIcon className="shrink-0" />
                                    <span className="text-sm truncate">{formData.thumbnailUrl}</span>
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-6 h-6 text-slate-500" />
                                    <span className="text-slate-500 font-medium">Click to upload thumbnail</span>
                                </>
                            )}
                        </div>
                    </div>
                    {formData.thumbnailUrl && (
                        <div className="w-20 h-20 rounded-xl border border-white/10 overflow-hidden bg-slate-950 shrink-0">
                            <img src={formData.thumbnailUrl.startsWith('/') ? `${API_BASE_URL}${formData.thumbnailUrl}` : formData.thumbnailUrl} className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting || uploadingImage}
                className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-xl shadow-cyan-900/20 flex items-center justify-center gap-3"
            >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                Create Event
            </button>
        </form>
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
                throw new Error(`Upload failed: ${res.status} ${text}`);
            }

            const result = await res.json();
            setFormData(prev => ({ ...prev, imageUrl: result.url }));
        } catch (err) {
            console.error('Upload failed', err);
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
            console.error('Post creation failed', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-white">New Community Post</h3>
                <button type="button" onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400">
                    <X size={24} />
                </button>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <img src={user.photoURL} className="w-12 h-12 rounded-full border border-white/10" />
                    <div>
                        <div className="font-bold text-white">{user.displayName}</div>
                        <div className="text-xs text-slate-500">Posting as Admin</div>
                    </div>
                </div>

                <textarea
                    required
                    rows="4"
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    className="w-full bg-slate-950/30 border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:border-emerald-500/30 transition-all text-lg resize-none"
                    placeholder="What's on your mind? Share an update with the campus..."
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
                        <span className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">Poll Creation</span>
                        <button type="button" onClick={() => setShowPoll(false)} className="text-xs text-slate-500 hover:text-white transition-colors">Cancel Poll</button>
                    </div>
                    <input
                        type="text"
                        placeholder="Ask a question..."
                        value={formData.poll.question}
                        onChange={e => setFormData({ ...formData, poll: { ...formData.poll, question: e.target.value } })}
                        className="w-full bg-transparent border-b border-white/10 py-2 focus:outline-none focus:border-emerald-500 transition-colors text-white font-medium"
                    />
                    <div className="space-y-3">
                        {formData.poll.options.map((opt, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <input
                                    type="text"
                                    placeholder={`Option ${idx + 1}`}
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
                                <Plus size={14} /> Add Option
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between border-t border-white/5 pt-6">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <button type="button" className={`p-3 rounded-xl transition-all ${formData.imageUrl ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}>
                            {uploadingImage ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />}
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowPoll(true)}
                        className={`p-3 rounded-xl transition-all ${showPoll ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
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
                    Post Update
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

const ScheduleClassPicker = ({ schedules, selectedScheduleId, onSelect }) => (
    <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {schedules.map((schedule) => {
            const selected = schedule.id === selectedScheduleId;

            return (
                <button
                    key={schedule.id}
                    type="button"
                    onClick={() => onSelect(schedule.id)}
                    className={`rounded-[1.5rem] border px-5 py-5 text-left transition ${selected
                        ? 'border-cyan-400/30 bg-cyan-400/10 shadow-[0_18px_40px_rgba(34,211,238,0.08)]'
                        : 'border-white/8 bg-slate-950/50 hover:border-white/15 hover:bg-white/[0.04]'
                        }`}
                >
                    <div className="flex items-center justify-between gap-4">
                        <div className="text-base font-bold text-white">{schedule.className}</div>
                        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${selected
                            ? 'bg-cyan-300/15 text-cyan-100'
                            : 'bg-white/5 text-slate-400'
                            }`}>
                            {selected ? 'Secili' : 'Sec'}
                        </span>
                    </div>

                    <div className="mt-3 text-sm leading-6 text-slate-300">{schedule.programName}</div>
                    <div className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                        {schedule.academicYear} • {schedule.semester}
                    </div>
                </button>
            );
        })}
    </div>
);

const ScheduleBoardCard = ({ board, onCellClick, saving }) => {
    const template = {
        gridTemplateColumns: `92px repeat(${SCHEDULE_DAYS.length}, minmax(152px, 1fr))`
    };

    return (
        <div className="rounded-[2rem] border border-white/5 bg-slate-900/50 p-6 backdrop-blur-xl">
            <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Weekly Grid</p>
                <h4 className="mt-2 text-xl font-bold text-white">Click a cell to add or edit class data</h4>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
                    Omusiber'deki haftalik gorunume benzer sekilde saatler solda, gunler ustte. Bos kutu yeni ders icin hazir, dolu kutu ise o slottaki mevcut kaydi aciyor.
                </p>
            </div>

            <div className="overflow-x-auto pb-2">
                <div className="min-w-[1220px]">
                    <div className="grid gap-3" style={template}>
                        <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/8 px-4 py-4">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">Saat</div>
                            <div className="mt-2 text-sm font-semibold text-slate-200">Gun</div>
                        </div>

                        {SCHEDULE_DAYS.map((day) => (
                            <div
                                key={day.key}
                                className="rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-4"
                            >
                                <div className="text-base font-bold text-white">{day.label}</div>
                                <div className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    Duzenle
                                </div>
                            </div>
                        ))}

                        {board.timeSlots.map((slot) => (
                            <React.Fragment key={slot.time}>
                                <div className="rounded-2xl border border-white/8 bg-slate-950/70 px-3 py-4">
                                    <div className="text-sm font-bold text-white">{slot.time}</div>
                                    <div className="mt-2 text-xs text-slate-500">{slot.endTime}</div>
                                </div>

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
        ? 'Yeni ders eklemek icin tikla'
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
                            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Edit Slot</div>
                            <h4 className="mt-2 text-2xl font-bold text-white">{getDayLabel(state.dayKey)} • {state.time}</h4>
                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                Bu kutu icin dersi kaydet, guncelle veya istersen temizle.
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
                            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Selected Day</div>
                            <div className="mt-2 text-lg font-bold text-white">{getDayLabel(state.dayKey)}</div>
                        </div>
                        <div className="rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-4">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Selected Time</div>
                            <div className="mt-2 text-lg font-bold text-white">{state.time}</div>
                        </div>
                    </div>

                    {cell.totalLessons > 1 && (
                        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-4 text-sm leading-6 text-amber-100">
                            Bu saat diliminde birden fazla ders gorunuyor. Grid, ilk dersi kartta gosterir ama ogrenci tarafinda efektif toplam {cell.totalLessons} ders var.
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <ScheduleField label="Course Code">
                            <input
                                type="text"
                                value={state.courseCode}
                                onChange={(e) => onFieldChange('courseCode', e.target.value)}
                                placeholder="SGT301"
                                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
                            />
                        </ScheduleField>

                        <ScheduleField label="Course Name">
                            <input
                                type="text"
                                value={state.courseName}
                                onChange={(e) => onFieldChange('courseName', e.target.value)}
                                placeholder="Siber Tatbikat"
                                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
                            />
                        </ScheduleField>

                        <ScheduleField label="Instructor">
                            <input
                                type="text"
                                value={state.instructor}
                                onChange={(e) => onFieldChange('instructor', e.target.value)}
                                placeholder="Dr. Example"
                                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
                            />
                        </ScheduleField>

                        <ScheduleField label="Classroom">
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
                                Clear Saved Change
                            </button>
                        ) : (
                            <div className="text-sm text-slate-500">
                                Bu slot henuz kaydedilmemis.
                            </div>
                        )}

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                Save Cell
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
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Timeline</p>
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
    }
};

const buildScheduleSnapshot = () => {
    const storage = readScheduleStorage();

    return SCHEDULE_SEED_DATA.map((schedule) => {
        const storedSchedule = storage[schedule.id] || {};
        const grades = Object.fromEntries(
            GRADE_OPTIONS.map(({ key }) => {
                const generatedLessons = normalizeLessonMap(schedule.generated[key] || {});
                const manualLessons = normalizeLessonMap(storedSchedule[key]?.manualLessons || {});
                const overrideEnabled = storedSchedule[key]?.overrideEnabled === true;
                const effectiveLessons = overrideEnabled
                    ? normalizeLessonMap(markLessonsAsManual(manualLessons))
                    : mergeLessonMaps(generatedLessons, manualLessons);

                return [key, {
                    overrideEnabled,
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

const normalizeLessonMap = (lessonMap = {}) => {
    const result = {};

    Object.entries(lessonMap || {}).forEach(([dayKey, lessons]) => {
        result[dayKey] = [...lessons]
            .map((lesson) => ({ ...lesson }))
            .sort((left, right) => timeToMinutes(left.time) - timeToMinutes(right.time));
    });

    return result;
};

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

const buildScheduleBoard = (grade) => {
    if (!grade) {
        return {
            timeSlots: DEFAULT_SCHEDULE_TIMES.map((time) => ({
                time,
                endTime: addMinutesToTime(time, 50)
            })),
            cellMap: {},
            filledCells: 0
        };
    }

    const generatedByCell = indexLessonsByCell(grade.generatedLessons);
    const manualByCell = indexLessonsByCell(grade.manualLessons);
    const effectiveByCell = indexLessonsByCell(grade.effectiveLessons);
    const uniqueTimes = new Set(DEFAULT_SCHEDULE_TIMES);

    [generatedByCell, manualByCell, effectiveByCell].forEach((cellMap) => {
        Object.values(cellMap).forEach((lessons) => {
            lessons.forEach((lesson) => {
                if (isValidTime(lesson.time)) {
                    uniqueTimes.add(lesson.time);
                }
            });
        });
    });

    const orderedTimes = [...uniqueTimes].sort((left, right) => timeToMinutes(left) - timeToMinutes(right));
    const cellMap = {};

    orderedTimes.forEach((time) => {
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
        timeSlots: orderedTimes.map((time) => ({
            time,
            endTime: addMinutesToTime(time, 50)
        })),
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
