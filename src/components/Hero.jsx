import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Code2, Gamepad2, Smartphone } from 'lucide-react';

export default function Hero({ lang = 'en' }) {
    const content = {
        en: {
            badge: 'The Engine Behind Innovation',
            title: 'We Build',
            dynamic: 'Digital Realities',
            desc: 'Nortixlabs is the creative force and legal entity driving the Nortix ecosystem. We specialize in high-performance SaaS, immersive Game Development, and next-gen Mobile Apps.',
            ctaPrimary: 'Explore Our Work',
            ctaSecondary: 'Contact Us',
            saas: 'SaaS Solutions',
            saasDesc: 'Scalable enterprise benchmarks',
            game: 'Game Development',
            gameDesc: 'Immersive interactive worlds',
            mobile: 'Mobile Apps',
            mobileDesc: 'Seamless cross-platform experiences'
        },
        tr: {
            badge: 'İnovasyonun Arkasındaki Güç',
            title: 'İnşa Ediyoruz:',
            dynamic: 'Dijital Gerçeklikler',
            desc: 'Nortixlabs, Nortix ekosistemini yönlendiren yaratıcı güç ve yasal kuruluştur. Yüksek performanslı SaaS, sürükleyici Oyun Geliştirme ve yeni nesil Mobil Uygulamalar konusunda uzmanız.',
            ctaPrimary: 'Çalışmalarımızı Keşfedin',
            ctaSecondary: 'İletişime Geçin',
            saas: 'SaaS Çözümleri',
            saasDesc: 'Ölçeklenebilir kurumsal standartlar',
            game: 'Oyun Geliştirme',
            gameDesc: 'Sürükleyici etkileşimli dünyalar',
            mobile: 'Mobil Uygulamalar',
            mobileDesc: 'Kusursuz çapraz platform deneyimleri'
        }
    };

    const t = content[lang] || content.en;

    return (
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-900/20 via-slate-950/0 to-slate-950/0 -z-10" />

            <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-wider uppercase mb-6">
                        {t.badge}
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-4xl sm:text-5xl md:text-7xl font-bold font-display text-white mb-6 leading-tight"
                >
                    {t.title} <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 text-glow">
                        {t.dynamic}
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-base md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed px-4 md:px-0"
                >
                    {t.desc}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    <a
                        href={lang === 'en' ? '#services' : '#services'}
                        className="px-8 py-4 rounded-full bg-primary-gradient bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        {t.ctaPrimary} <ArrowRight className="w-4 h-4" />
                    </a>
                    <a
                        href="#contact"
                        className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                    >
                        {t.ctaSecondary}
                    </a>
                </motion.div>

                {/* Feature Highlights */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full max-w-4xl"
                >
                    {[
                        { icon: Code2, label: t.saas, desc: t.saasDesc },
                        { icon: Gamepad2, label: t.game, desc: t.gameDesc },
                        { icon: Smartphone, label: t.mobile, desc: t.mobileDesc },
                    ].map((item, idx) => (
                        <div key={idx} className="glass-card p-6 rounded-2xl flex flex-col items-center text-center group">
                            <div className="p-3 rounded-xl bg-white/5 mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:bg-violet-500/20">
                                <item.icon className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">{item.label}</h3>
                            <p className="text-sm text-slate-500">{item.desc}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
