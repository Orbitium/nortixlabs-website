import React from 'react';
import { motion } from 'framer-motion';
import { Server, Gamepad, Smartphone, Globe, Shield, Zap } from 'lucide-react';

const services = [
    {
        title: 'SaaS Development',
        description: 'We build robust, scalable Software as a Service platforms that power businesses. From cloud infrastructure to intuitive front-ends, we deliver end-to-end solutions.',
        icon: Server,
        color: 'from-blue-500 to-cyan-500',
    },
    {
        title: 'Game Development',
        description: 'Creators of the Nortix Launcher and immersive gaming experiences. We push the boundaries of real-time rendering and multiplayer networking.',
        icon: Gamepad,
        color: 'from-purple-500 to-pink-500',
    },
    {
        title: 'Mobile Applications',
        description: 'Native and cross-platform mobile apps designed for the modern user. Fluid animations, offline capabilities, and perfect UI/UX.',
        icon: Smartphone,
        color: 'from-emerald-500 to-teal-500',
    },
    {
        title: 'Web Platforms',
        description: 'High-performance web applications using the latest modern stacks like Astro, React, and Next.js for blazing fast speeds.',
        icon: Globe,
        color: 'from-orange-500 to-red-500',
    },
    {
        title: 'Cybersecurity',
        description: 'Security first. We ensure all our digital products are hardened against threats, protecting user data and company assets.',
        icon: Shield,
        color: 'from-indigo-500 to-violet-500',
    },
    {
        title: 'Performance Tuning',
        description: 'Optimization is in our DNA. We refine code and infrastructure to ensure maximum efficiency and lowest latency.',
        icon: Zap,
        color: 'from-yellow-400 to-amber-500',
    },
];

export default function Services({ lang = 'en' }) {
    const content = {
        en: {
            title: 'Our Expertise',
            subtitle: "Delivering cutting-edge solutions across key digital verticals. We don't just write code; we engineer experiences.",
            saas: {
                name: 'SaaS Development',
                desc: 'We build robust, scalable Software as a Service platforms that power businesses. From cloud infrastructure to intuitive front-ends, we deliver end-to-end solutions.'
            },
            game: {
                name: 'Game Development',
                desc: 'Creators of the Nortix Launcher and immersive gaming experiences. We push the boundaries of real-time rendering and multiplayer networking.'
            },
            mobile: {
                name: 'Mobile Applications',
                desc: 'Native and cross-platform mobile apps designed for the modern user. Fluid animations, offline capabilities, and perfect UI/UX.'
            },
            web: {
                name: 'Web Platforms',
                desc: 'High-performance web applications using the latest modern stacks like Astro, React, and Next.js for blazing fast speeds.'
            },
            cyber: {
                name: 'Cybersecurity',
                desc: 'Security first. We ensure all our digital products are hardened against threats, protecting user data and company assets.'
            },
            tuning: {
                name: 'Performance Tuning',
                desc: 'Optimization is in our DNA. We refine code and infrastructure to ensure maximum efficiency and lowest latency.'
            }
        },
        tr: {
            title: 'Uzmanlık Alanlarımız',
            subtitle: 'Kritik dijital alanlarda son teknoloji çözümler sunuyoruz. Sadece kod yazmıyor; deneyimler tasarlıyoruz.',
            saas: {
                name: 'SaaS Geliştirme',
                desc: 'İşletmelere güç veren sağlam, ölçeklenebilir Hizmet Olarak Yazılım platformları inşa ediyoruz. Bulut altyapısından sezgisel ön yüzlere kadar uçtan uca çözümler sunuyoruz.'
            },
            game: {
                name: 'Oyun Geliştirme',
                desc: 'Nortix Launcher ve sürükleyici oyun deneyimlerinin yaratıcılarıyız. Gerçek zamanlı görselleştirme ve çok oyunculu ağ teknolojilerinin sınırlarını zorluyoruz.'
            },
            mobile: {
                name: 'Mobil Uygulamalar',
                desc: 'Modern kullanıcılar için tasarlanmış yerel ve çapraz platform mobil uygulamalar. Akıcı animasyonlar, çevrimdışı yetenekler ve kusursuz UI/UX.'
            },
            web: {
                name: 'Web Platformları',
                desc: 'Göz kamaştırıcı hızlar için Astro, React ve Next.js gibi en son modern teknoloji yığınlarını kullanan yüksek performanslı web uygulamaları.'
            },
            cyber: {
                name: 'Siber Güvenlik',
                desc: 'Önce güvenlik. Tüm dijital ürünlerimizin tehditlere karşı güçlendirilmesini sağlar, kullanıcı verilerini ve şirket varlıklarını koruruz.'
            },
            tuning: {
                name: 'Performans Optimizasyonu',
                desc: 'Optimizasyon bizim genlerimizde var. Maksimum verimlilik ve en düşük gecikme süresini sağlamak için kod ve altyapıyı geliştiriyoruz.'
            }
        }
    };

    const t = content[lang] || content.en;
    const base = lang === 'en' ? '' : '/tr';

    const services = [
        {
            title: t.saas.name,
            description: t.saas.desc,
            icon: Server,
            color: 'from-blue-500 to-cyan-500',
        },
        {
            title: t.game.name,
            description: t.game.desc,
            icon: Gamepad,
            color: 'from-purple-500 to-pink-500',
        },
        {
            title: t.mobile.name,
            description: t.mobile.desc,
            icon: Smartphone,
            color: 'from-emerald-500 to-teal-500',
        },
        {
            title: t.web.name,
            description: t.web.desc,
            icon: Globe,
            color: 'from-orange-500 to-red-500',
        },
        {
            title: t.cyber.name,
            description: t.cyber.desc,
            icon: Shield,
            color: 'from-indigo-500 to-violet-500',
        },
        {
            title: t.tuning.name,
            description: t.tuning.desc,
            icon: Zap,
            color: 'from-yellow-400 to-amber-500',
        },
    ];

    return (
        <section id="services" className="py-16 md:py-24 relative">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold font-display text-white mb-4">{t.title}</h2>
                    <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto px-4 md:px-0">
                        {t.subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {services.map((service, index) => (
                        <a
                            key={index}
                            href={
                                service.title === t.saas.name ? `${base}/services/saas` :
                                    service.title === t.game.name ? `${base}/services/game-development` :
                                        service.title === t.mobile.name ? `${base}/services/mobile-apps` : '#'
                            }
                            className={`block ${[t.saas.name, t.game.name, t.mobile.name].includes(service.title) ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group h-full relative p-8 rounded-2xl bg-slate-900/50 border border-white/5 hover:bg-slate-800/50 transition-colors duration-300 overflow-hidden"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${service.color} p-[1px] mb-6`}>
                                    <div className="w-full h-full rounded-lg bg-slate-950 flex items-center justify-center">
                                        <service.icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">{service.title}</h3>
                                <p className="text-slate-400 leading-relaxed text-sm">
                                    {service.description}
                                </p>
                            </motion.div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
