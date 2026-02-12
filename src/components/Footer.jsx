import React from 'react';
import { Rocket, Twitter, Github, Linkedin } from 'lucide-react';

export default function Footer({ lang = 'en' }) {
    const labels = {
        en: {
            desc: 'Pioneering digital experiences through innovative software solutions.',
            products: 'Products',
            company: 'Company',
            services: 'Services',
            legal: 'Legal',
            about: 'About Us',
            careers: 'Careers',
            blog: 'Blog',
            contact: 'Contact',
            saas: 'SaaS Development',
            game: 'Game Design',
            mobile: 'Mobile Solutions',
            consulting: 'Consulting',
            privacy: 'Privacy Policy',
            terms: 'Terms of Service',
            cookies: 'Cookie Policy',
            accountDeletion: 'Account Deletion',
            rights: 'All rights reserved.',
            designed: 'Designed with',
            by: 'by Nortixlabs Team.'
        },
        tr: {
            desc: 'Yenilikçi yazılım çözümleriyle dijital deneyimlere öncülük ediyoruz.',
            products: 'Ürünler',
            company: 'Şirket',
            services: 'Hizmetler',
            legal: 'Yasal',
            about: 'Hakkımızda',
            careers: 'Kariyer',
            blog: 'Blog',
            contact: 'İletişim',
            saas: 'SaaS Geliştirme',
            game: 'Oyun Tasarımı',
            mobile: 'Mobil Çözümler',
            consulting: 'Danışmanlık',
            privacy: 'Gizlilik Politikası',
            terms: 'Kullanım Koşulları',
            cookies: 'Çerez Politikası',
            accountDeletion: 'Hesap Silme',
            rights: 'Tüm hakları saklıdır.',
            designed: 'Tasarım:',
            by: 'Nortixlabs Ekibi tarafından.'
        }
    };

    const t = labels[lang] || labels.en;
    const base = lang === 'en' ? '' : '/tr';

    return (
        <footer className="bg-slate-950 border-t border-white/5 pt-16 pb-8">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12 mb-12">

                    <div className="col-span-1 md:col-span-1">
                        <a href={base || '/'} className="flex items-center gap-2 mb-4 group">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500">
                                <Rocket className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold font-display tracking-wide text-white">
                                Nortix<span className="text-cyan-400">labs</span>
                            </span>
                        </a>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            {t.desc}
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-slate-400 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
                            <a href="#" className="text-slate-400 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
                            <a href="#" className="text-slate-400 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-6">{t.company}</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><a href={`${base}/#about`} className="hover:text-cyan-400 transition-colors">{t.about}</a></li>
                            <li><a href={`${base}/careers`} className="hover:text-cyan-400 transition-colors">{t.careers}</a></li>
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">{t.blog}</a></li>
                            <li><a href={`${base}/#contact`} className="hover:text-cyan-400 transition-colors">{t.contact}</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-6">{t.products}</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li>
                                <a href="https://nortixlauncher.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                                    Nortix
                                    <span className="text-[10px] bg-violet-600/20 text-violet-300 px-1.5 py-0.5 rounded border border-violet-600/30">External</span>
                                </a>
                            </li>
                            <li>
                                <a href={`${base}/akademiz`} className="hover:text-cyan-400 transition-colors">AkademiZ</a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-6">{t.services}</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><a href={`${base}/services/saas`} className="hover:text-cyan-400 transition-colors">{t.saas}</a></li>
                            <li><a href={`${base}/services/game-development`} className="hover:text-cyan-400 transition-colors">{t.game}</a></li>
                            <li><a href={`${base}/services/mobile-apps`} className="hover:text-cyan-400 transition-colors">{t.mobile}</a></li>
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">{t.consulting}</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-6">{t.legal}</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><a href={`${base}/legal/privacy`} className="hover:text-cyan-400 transition-colors">{t.privacy}</a></li>
                            <li><a href={`${base}/legal/terms`} className="hover:text-cyan-400 transition-colors">{t.terms}</a></li>
                            <li><a href={`${base}/legal/cookies`} className="hover:text-cyan-400 transition-colors">{t.cookies}</a></li>
                            <li><a href={`${base}/akademiz/delete`} className="hover:text-cyan-400 transition-colors">{t.accountDeletion}</a></li>
                        </ul>
                    </div>

                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} Nortixlabs LLC. {t.rights}
                    </p>
                    <p className="text-slate-600 text-xs">
                        {t.designed} <span className="text-red-500">♥</span> {t.by}
                    </p>
                </div>
            </div>
        </footer>
    );
}
