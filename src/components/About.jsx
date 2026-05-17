import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function About({ lang = 'en' }) {
    const images = ['/main.webp', '/main_2.webp'];
    const [currentIndex, setCurrentIndex] = useState(0);

    const content = {
        en: {
            title: "The Architects of Virtual",
            nortix: "Realities",
            alt: "The Architects of Virtual Realities",
            p1: "Founded with a vision to revolutionize digital interaction, Nortixlabs stands as the creative powerhouse behind the acclaimed Nortix Launcher.",
            p2: "We are more than just a software company; we are a collective of engineers, designers, and visionaries dedicated to pushing the boundaries of what's possible on the web and desktop.",
            p3: "From maintaining the robust infrastructure that supports thousands of concurrent users on Nortix, to developing bespoke SaaS solutions for enterprise clients, our mission remains the same:",
            mission: "Code with purpose, design with passion."
        },
        tr: {
            title: "Nortix'in",
            nortix: "Mimarları",
            alt: "Nortix Mimarları",
            p1: "Dijital etkileşimde devrim yaratma vizyonuyla kurulan Nortixlabs, beğeni toplayan Nortix Launcher'ın arkasındaki yaratıcı güçtür.",
            p2: "Sadece bir yazılım şirketi değiliz; web ve masaüstünde sınırları zorlamaya kendini adamış mühendisler, tasarımcılar ve vizyonerlerden oluşan bir kolektifiz.",
            p3: "Nortix'te binlerce eş zamanlı kullanıcıyı destekleyen sağlam altyapıyı korumaktan, kurumsal müşteriler için özel SaaS çözümleri geliştirmeye kadar misyonumuz aynı kalıyor:",
            mission: "Amaçla kodla, tutkuyla tasarla."
        }
    };

    const t = content[lang] || content.en;

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    return (
        <section id="about" className="py-16 md:py-24 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1/2 h-full bg-gradient-to-l from-violet-900/10 to-transparent -z-10" />

            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-10 md:gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:w-1/2 w-full"
                    >
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-2xl opacity-20 blur-xl animate-pulse"></div>
                            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                                <div className="aspect-video bg-slate-900 relative overflow-hidden group">
                                    <AnimatePresence mode="wait">
                                        <motion.img
                                            key={currentIndex}
                                            src={images[currentIndex]}
                                            alt={t.alt}
                                            initial={{ opacity: 0, scale: 1.1 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.5, ease: "easeInOut" }}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                    </AnimatePresence>
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:w-1/2 w-full text-left"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold font-display text-white mb-6">
                            {lang === 'tr' ? <>{t.nortix} <span className="text-violet-400">{t.title}</span></> : <>{t.title} <span className="text-violet-400">{t.nortix}</span></>}
                        </h2>
                        <div className="space-y-4 md:space-y-6 text-slate-400 text-base md:text-lg leading-relaxed">
                            <p>
                                {t.p1}
                            </p>
                            <p>
                                {t.p2}
                            </p>
                            <p>
                                {t.p3} <span className="text-white italic font-medium">{t.mission}</span>
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
