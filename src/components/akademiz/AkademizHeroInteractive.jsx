import React, { useState, useEffect } from 'react';
import { Calendar, Megaphone, Users, ChevronRight, Bell, Wifi, Battery, BookOpen } from 'lucide-react';

export default function AkademizHeroInteractive({ lang = 'tr' }) {
    const [activeTab, setActiveTab] = useState(0); // 0: News, 1: Events, 2: Notifications
    const [isHovered, setIsHovered] = useState(false);

    const isTr = lang === 'tr';

    const screens = [
        {
            id: 'news',
            label: isTr ? 'Haberler' : 'News',
            image: '/akademiz/news.png',
            alt: 'AkademiZ Campus News Feed',
        },
        {
            id: 'events',
            label: isTr ? 'Etkinlikler' : 'Events',
            image: '/akademiz/events.png',
            alt: 'AkademiZ Campus Events Calendar',
        },
        {
            id: 'notifications',
            label: isTr ? 'Bildirimler' : 'Alerts',
            image: '/akademiz/notifications.png',
            alt: 'AkademiZ Real-time Notifications',
        },
    ];

    // Subtle auto-advance screen when not hovered
    useEffect(() => {
        if (isHovered) return;
        const timer = setInterval(() => {
            setActiveTab((prev) => (prev + 1) % screens.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [isHovered, screens.length]);

    return (
        <div 
            className="relative w-full max-w-lg mx-auto lg:max-w-none flex items-center justify-center py-6 select-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Ambient Cosmic Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[460px] h-[340px] sm:h-[460px] bg-gradient-to-tr from-blue-600/35 via-sky-500/25 to-indigo-700/30 rounded-full blur-[90px] sm:blur-[120px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '6s' }}></div>
            <div className="absolute top-1/4 right-0 w-64 h-64 bg-cyan-400/20 rounded-full blur-[80px] pointer-events-none -z-10"></div>

            {/* Central Phone Mockup Container */}
            <div className="relative group perspective-1000">
                {/* Smartphone Chassis */}
                <div className="relative w-[280px] sm:w-[310px] md:w-[325px] aspect-[9/19.2] bg-slate-950 rounded-[44px] sm:rounded-[48px] p-2.5 sm:p-3 shadow-[0_25px_70px_rgba(3,15,45,0.85),0_0_40px_rgba(56,189,248,0.25)] border-[5px] sm:border-[6px] border-slate-800/90 ring-1 ring-white/20 transition-all duration-500 group-hover:scale-[1.01] group-hover:shadow-[0_30px_90px_rgba(14,165,233,0.35)]">
                    
                    {/* Inner Bezel & Screen */}
                    <div className="relative w-full h-full bg-slate-950 rounded-[34px] sm:rounded-[38px] overflow-hidden flex flex-col border border-white/10">
                        
                        {/* Dynamic Island & Status Bar */}
                        <div className="relative pt-2.5 px-5 pb-1 flex items-center justify-between z-30 bg-slate-950/80 backdrop-blur-md">
                            {/* Time */}
                            <span className="text-[11px] font-semibold tracking-tight text-white/90">9:41</span>
                            
                            {/* Dynamic Island pill */}
                            <div className="w-20 h-4 bg-black rounded-full flex items-center justify-end px-2 gap-1.5 shadow-inner">
                                <span className="w-2 h-2 rounded-full bg-cyan-950 border border-cyan-500/60"></span>
                            </div>

                            {/* Status icons */}
                            <div className="flex items-center gap-1.5 text-white/80">
                                <Wifi className="w-3 h-3" />
                                <Battery className="w-3.5 h-3.5 text-emerald-400" />
                            </div>
                        </div>

                        {/* Top In-App Brand Header */}
                        <div className="px-4 py-2 flex items-center justify-between border-b border-white/[0.07] bg-slate-950/60 backdrop-blur-md z-20">
                            <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center p-0.5">
                                    <BookOpen className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-xs font-bold tracking-tight text-white font-display">AkademiZ</span>
                            </div>

                            <button 
                                type="button"
                                onClick={() => setActiveTab(2)}
                                className="relative p-1 text-slate-300 hover:text-cyan-300 transition-colors"
                                title={isTr ? "Bildirimler" : "Alerts"}
                            >
                                <Bell className="w-3.5 h-3.5" />
                                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                            </button>
                        </div>

                        {/* In-App Interactive Tab Bar */}
                        <div className="px-3 py-1.5 flex items-center gap-1 bg-slate-900/70 border-b border-white/[0.06] z-20">
                            {screens.map((screen, idx) => (
                                <button
                                    key={screen.id}
                                    type="button"
                                    onClick={() => setActiveTab(idx)}
                                    className={`flex-1 py-1 rounded-full text-[10px] font-medium transition-all duration-300 ${
                                        activeTab === idx
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 font-semibold'
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                                    }`}
                                >
                                    {screen.label}
                                </button>
                            ))}
                        </div>

                        {/* Screen Content / Screenshot Stage */}
                        <div className="relative flex-1 bg-slate-950 overflow-hidden">
                            {screens.map((screen, idx) => (
                                <div
                                    key={screen.id}
                                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                                        activeTab === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                                    }`}
                                >
                                    <img
                                        src={screen.image}
                                        alt={screen.alt}
                                        loading={idx === 0 ? 'eager' : 'lazy'}
                                        className="w-full h-full object-cover object-top"
                                    />
                                    {/* Subtle gradient vignette to blend top/bottom */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30 pointer-events-none"></div>
                                </div>
                            ))}
                        </div>

                        {/* In-App Bottom Navigation Mockup */}
                        <div className="px-4 py-2 bg-slate-950/90 backdrop-blur-md border-t border-white/[0.08] flex items-center justify-around z-20">
                            <button
                                type="button"
                                onClick={() => setActiveTab(0)}
                                className={`flex flex-col items-center gap-0.5 text-[9px] transition-colors ${
                                    activeTab === 0 ? 'text-cyan-400 font-semibold' : 'text-slate-400'
                                }`}
                            >
                                <div className={`w-3.5 h-3.5 rounded-sm ${activeTab === 0 ? 'text-cyan-400' : 'text-slate-400'}`}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                                </div>
                                <span>{isTr ? 'Haberler' : 'Home'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab(1)}
                                className={`flex flex-col items-center gap-0.5 text-[9px] transition-colors ${
                                    activeTab === 1 ? 'text-cyan-400 font-semibold' : 'text-slate-400'
                                }`}
                            >
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{isTr ? 'Etkinlik' : 'Events'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab(2)}
                                className={`flex flex-col items-center gap-0.5 text-[9px] transition-colors ${
                                    activeTab === 2 ? 'text-cyan-400 font-semibold' : 'text-slate-400'
                                }`}
                            >
                                <Users className="w-3.5 h-3.5" />
                                <span>{isTr ? 'Topluluk' : 'Clubs'}</span>
                            </button>
                        </div>

                        {/* Bottom Home Indicator Bar */}
                        <div className="py-1 flex justify-center bg-slate-950 z-20">
                            <div className="w-24 h-1 bg-white/20 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Floating Orbit Glass Card 1 (Top Left): Event Reminder */}
                <div 
                    onClick={() => setActiveTab(1)}
                    className="cursor-pointer absolute -top-4 -left-6 sm:-left-12 lg:-left-20 z-40 w-52 sm:w-60 p-2.5 sm:p-3 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 shadow-[0_15px_35px_rgba(2,12,30,0.6)] hover:border-cyan-400/60 hover:bg-slate-900/95 transition-all duration-300 hover:scale-105 group/card"
                    style={{ animation: 'floatSlow 4s ease-in-out infinite' }}
                >
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/30 flex-shrink-0">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                                    {isTr ? 'Etkinlik Hatırlatması' : 'Event Reminder'}
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/card:text-cyan-300 group-hover/card:translate-x-0.5 transition-all" />
                            </div>
                            <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                                {isTr ? 'Kampüs Bahar Şenliği' : 'Campus Spring Fest'}
                            </h4>
                            <p className="text-[10px] text-slate-400">
                                {isTr ? '22 Nisan · 10:00' : 'April 22 · 10:00'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Floating Orbit Glass Card 2 (Right): Campus Alert */}
                <div 
                    onClick={() => setActiveTab(0)}
                    className="cursor-pointer absolute top-1/3 -right-6 sm:-right-12 lg:-right-20 z-40 w-56 sm:w-64 p-2.5 sm:p-3 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-blue-500/30 shadow-[0_15px_35px_rgba(2,12,30,0.6)] hover:border-blue-400/60 hover:bg-slate-900/95 transition-all duration-300 hover:scale-105 group/card"
                    style={{ animation: 'floatSlowReverse 4.5s ease-in-out infinite' }}
                >
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/30 flex-shrink-0">
                            <Megaphone className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-300">
                                    {isTr ? 'Yeni Duyuru' : 'Campus Alert'}
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/card:text-sky-300 group-hover/card:translate-x-0.5 transition-all" />
                            </div>
                            <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                                {isTr ? 'Kütüphane Saatleri Güncellendi' : 'Library Hours Updated'}
                            </h4>
                            <p className="text-[10px] text-slate-400">
                                {isTr ? '1 saat önce · Rektörlük' : '1h ago · Administration'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Floating Orbit Glass Card 3 (Bottom Left): Student Communities Badge */}
                <div 
                    onClick={() => setActiveTab(1)}
                    className="cursor-pointer absolute -bottom-4 -left-4 sm:-left-8 lg:-left-12 z-40 w-48 sm:w-56 p-2.5 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-indigo-500/30 shadow-[0_15px_35px_rgba(2,12,30,0.6)] hover:border-indigo-400/60 hover:bg-slate-900/95 transition-all duration-300 hover:scale-105 group/card hidden sm:block"
                    style={{ animation: 'floatSlow 5s ease-in-out infinite' }}
                >
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
                            <Users className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h5 className="text-xs font-bold text-white truncate">
                                {isTr ? '18+ Kampüs Kulübü' : '18+ Student Clubs'}
                            </h5>
                            <p className="text-[10px] text-slate-400">
                                {isTr ? 'Mühendislik, Müzik, Sanat...' : 'Engineering, Music, Arts...'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes floatSlow {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-7px); }
                }
                @keyframes floatSlowReverse {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(7px); }
                }
            `}</style>
        </div>
    );
}
