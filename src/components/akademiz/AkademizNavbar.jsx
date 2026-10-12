import React, { useState, useEffect } from 'react';
import { BookOpen, Menu, X, ArrowLeft, Globe, Smartphone, ChevronRight } from 'lucide-react';

export default function AkademizNavbar({ lang = 'tr' }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isTr = lang === 'tr';

    const switchLangHref = isTr ? '/en/akademiz' : '/akademiz';
    const brandHref = isTr ? '/akademiz' : '/en/akademiz';
    const downloadHref = '#download';
    const nortixHref = isTr ? '/tr' : '/';

    const t = {
        features: isTr ? 'Özellikler' : 'Features',
        howItWorks: isTr ? 'Nasıl Çalışır?' : 'How it works',
        community: isTr ? 'Topluluk' : 'Community',
        getApp: isTr ? 'Uygulamayı İndir' : 'Get the app',
        byNortix: isTr ? 'NortixLabs girişimi' : 'by NortixLabs',
        backToHome: isTr ? 'Ana Siteye Dön' : 'Back to Nortix',
        langName: isTr ? 'EN' : 'TR',
        langFull: isTr ? 'English' : 'Türkçe'
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled
                    ? 'bg-slate-950/85 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/40 py-3'
                    : 'bg-transparent py-5'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <a
                            href={brandHref}
                            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-xl"
                            aria-label="AkademiZ Home"
                        >
                            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-blue-500/25 group-hover:shadow-cyan-400/30 transition-all duration-300">
                                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-cyan-300 group-hover:scale-110 transition-transform duration-300" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-1.5 font-display">
                                    Akademi<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300">Z</span>
                                </span>
                                <span className="text-[10px] tracking-wide text-slate-400 uppercase font-medium -mt-1 hidden sm:block">
                                    {t.byNortix}
                                </span>
                            </div>
                        </a>

                        <div className="h-4 w-px bg-white/15 hidden lg:block mx-1"></div>

                        <a
                            href={nortixHref}
                            className="hidden lg:flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-300 transition-colors px-2 py-1 rounded-md hover:bg-white/5"
                            title={t.backToHome}
                        >
                            <ArrowLeft className="w-3 h-3" />
                            <span>NortixLabs</span>
                        </a>
                    </div>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-1 lg:gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
                        <a
                            href="#features"
                            className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-full transition-all duration-200"
                        >
                            {t.features}
                        </a>
                        <a
                            href="#how-it-works"
                            className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-full transition-all duration-200"
                        >
                            {t.howItWorks}
                        </a>
                        <a
                            href="#community"
                            className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-full transition-all duration-200"
                        >
                            {t.community}
                        </a>
                    </nav>

                    {/* Right Action buttons */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Language Switcher */}
                        <a
                            href={switchLangHref}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-200"
                            title={`Switch to ${t.langFull}`}
                        >
                            <Globe className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{t.langName}</span>
                        </a>

                        {/* CTA Button (Scrolls directly to download section) */}
                        <a
                            href={downloadHref}
                            className="relative group inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white overflow-hidden shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 transition-all duration-500 group-hover:opacity-90"></span>
                            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 transition-opacity duration-300"></span>
                            <Smartphone className="relative z-10 w-4 h-4 text-white" />
                            <span className="relative z-10">{t.getApp}</span>
                        </a>

                        {/* Mobile hamburger button */}
                        <button
                            type="button"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                            aria-label="Toggle navigation menu"
                            aria-expanded={mobileOpen}
                        >
                            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Drawer */}
                {mobileOpen && (
                    <div className="md:hidden mt-3 p-4 rounded-2xl bg-slate-900/95 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-3 animate-fade-in-up">
                        <div className="flex flex-col space-y-1">
                            <a
                                href="#features"
                                onClick={() => setMobileOpen(false)}
                                className="px-3 py-2 text-sm font-medium text-slate-200 hover:text-cyan-300 hover:bg-white/5 rounded-xl transition-colors flex items-center justify-between"
                            >
                                <span>{t.features}</span>
                                <ChevronRight className="w-4 h-4 text-slate-500" />
                            </a>
                            <a
                                href="#how-it-works"
                                onClick={() => setMobileOpen(false)}
                                className="px-3 py-2 text-sm font-medium text-slate-200 hover:text-cyan-300 hover:bg-white/5 rounded-xl transition-colors flex items-center justify-between"
                            >
                                <span>{t.howItWorks}</span>
                                <ChevronRight className="w-4 h-4 text-slate-500" />
                            </a>
                            <a
                                href="#community"
                                onClick={() => setMobileOpen(false)}
                                className="px-3 py-2 text-sm font-medium text-slate-200 hover:text-cyan-300 hover:bg-white/5 rounded-xl transition-colors flex items-center justify-between"
                            >
                                <span>{t.community}</span>
                                <ChevronRight className="w-4 h-4 text-slate-500" />
                            </a>
                            <a
                                href="#download"
                                onClick={() => setMobileOpen(false)}
                                className="px-3 py-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 hover:bg-white/5 rounded-xl transition-colors flex items-center justify-between"
                            >
                                <span>{t.getApp}</span>
                                <ChevronRight className="w-4 h-4 text-cyan-500" />
                            </a>
                        </div>

                        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                            <a
                                href={nortixHref}
                                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>NortixLabs</span>
                            </a>
                            <a
                                href={switchLangHref}
                                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                            >
                                <Globe className="w-3.5 h-3.5" />
                                <span>{t.langFull}</span>
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
