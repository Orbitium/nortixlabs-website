import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from '../../lib/firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import {
    LogOut, ShieldAlert, GraduationCap, LayoutDashboard,
    Settings, Users, MessageSquare, Calendar, Plus,
    X, Upload, Image as ImageIcon, Send, Loader2
} from 'lucide-react';

const API_BASE_URL = 'https://akademiz-api.nortixlabs.com';

const AdminPanel = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(''); // 'event' or 'post'
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                    <NavItem
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        active={activeTab === 'dashboard'}
                        onClick={() => setActiveTab('dashboard')}
                    />
                    <NavItem
                        icon={<Calendar size={20} />}
                        label="Events"
                        active={activeTab === 'events'}
                        onClick={() => setActiveTab('events')}
                    />
                    <NavItem
                        icon={<Users size={20} />}
                        label="Community"
                        active={activeTab === 'community'}
                        onClick={() => setActiveTab('community')}
                    />
                    <NavItem
                        icon={<MessageSquare size={20} />}
                        label="News Feed"
                        active={activeTab === 'news'}
                        onClick={() => setActiveTab('news')}
                    />
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
                    <h2 className="text-xl font-semibold text-white capitalize">{activeTab}</h2>
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

export default AdminPanel;
