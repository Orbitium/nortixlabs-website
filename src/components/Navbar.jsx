import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';

export default function Navbar({ lang = 'en' }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'tr', name: 'TÃ¼rkÃ§e' }
    ];

    const currentLang = languages.find((language) => language.code === lang) || languages[0];
    const contactHref = lang === 'en' ? '/#contact' : '/tr#contact';

    const localizedLinks = {
        en: [
            { name: 'Home', href: '/' },
            { name: 'Services', href: '/#services' },
            { name: 'About', href: '/#about' },
            { name: 'Shop', href: '/shop' },
            { name: 'Careers', href: '/careers' },
            { name: 'Contact', href: '/#contact' },
        ],
        tr: [
            { name: 'Ana Sayfa', href: '/tr' },
            { name: 'Hizmetler', href: '/tr#services' },
            { name: 'HakkÄ±mÄ±zda', href: '/tr#about' },
            { name: 'Shop', href: '/tr/shop' },
            { name: 'Kariyer', href: '/tr/careers' },
            { name: 'Ä°letiÅŸim', href: '/tr#contact' },
        ]
    };

    const navLinks = localizedLinks[lang] || localizedLinks.en;

    const changeLang = (newLangCode) => {
        const currentPath = window.location.pathname;
        const pathSegments = currentPath.split('/').filter(Boolean);
        const firstSegment = pathSegments[0];
        const existingLang = languages.find((language) => language.code === firstSegment);

        let newPath;
        if (existingLang) {
            const remainingPath = pathSegments.slice(1).join('/');
            newPath = newLangCode === 'en' ? `/${remainingPath}` : `/${newLangCode}/${remainingPath}`;
        } else {
            newPath = newLangCode === 'en' ? currentPath : `/${newLangCode}${currentPath === '/' ? '' : currentPath}`;
        }

        newPath = '/' + newPath.split('/').filter(Boolean).join('/');
        window.location.href = newPath;
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'py-4 backdrop-blur-xl bg-slate-950/70 shadow-lg shadow-violet-900/10'
                : 'py-6 bg-transparent'
                }`}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <a href={lang === 'en' ? '/' : '/tr'} className="flex items-center gap-2 group">
                    <div className="p-1 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-shadow duration-300">
                        <img src="/favicon.png" alt="Nortixlabs Logo" className="w-7 h-7 transform group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="text-xl font-bold font-display tracking-wide text-white">
                        Nortix<span className="text-cyan-400">labs</span>
                    </span>
                </a>

                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium hover:text-glow"
                        >
                            {link.name}
                        </a>
                    ))}

                    <div className="relative">
                        <button
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:text-white hover:border-cyan-500/50 transition-all duration-300 uppercase"
                        >
                            <Globe className="w-3.5 h-3.5" />
                            <span>{currentLang.code}</span>
                            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isLangOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsLangOpen(false)}></div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-2 w-32 bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-20"
                                    >
                                        {languages.map((language) => (
                                            <button
                                                key={language.code}
                                                onClick={() => {
                                                    changeLang(language.code);
                                                    setIsLangOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-200 ${language.code === lang ? 'bg-violet-600/20 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                                            >
                                                <span className="text-sm">{language.name}</span>
                                            </button>
                                        ))}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    <a
                        href={contactHref}
                        className="px-5 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/50 transition-all duration-300 text-sm font-medium text-white"
                    >
                        {lang === 'en' ? 'Get in Touch' : 'Ä°letiÅŸime GeÃ§'}
                    </a>
                </div>

                <button
                    className="md:hidden text-slate-300 hover:text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden glass border-t border-white/5 overflow-hidden"
                    >
                        <div className="flex flex-col p-6 gap-4">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="text-slate-300 hover:text-white text-lg font-medium"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </a>
                            ))}

                            <div className="pt-4 mt-4 border-t border-white/5">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 block">
                                    {lang === 'en' ? 'Language' : 'Dil'}
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                    {languages.map((language) => (
                                        <button
                                            key={language.code}
                                            onClick={() => {
                                                changeLang(language.code);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all duration-300 ${language.code === lang
                                                ? 'bg-violet-600/20 border-violet-500/50 text-white'
                                                : 'bg-white/5 border-white/10 text-slate-400'}`}
                                        >
                                            {language.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
