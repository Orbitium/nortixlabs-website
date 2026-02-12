import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Box, Cpu, Play } from 'lucide-react';

export default function SaaSPage({ lang = 'en' }) {
    const content = {
        en: {
            title: "Enterprise-Grade",
            highlight: "Commerce & Integration",
            subtitle: "Full-featured transaction processing and seamless API integrations built for modern SaaS platforms",
            b2bTitle: "Business Transactions",
            b2bDesc: "Robust B2B transaction processing with enterprise-level features including bulk licensing, custom pricing tiers, invoicing systems, and multi-tenant account management for corporate clients.",
            b2cTitle: "Consumer Transactions",
            b2cDesc: "Seamless B2C payment processing with support for multiple payment providers, subscription management, one-click purchases, and real-time transaction notifications for end-users.",
            headlessTitle: "Docker & Headless API Integration",
            headlessDesc: "Fully containerized microservices architecture with Docker support and comprehensive RESTful headless APIs. Deploy anywhere, integrate with anything - from cloud platforms to on-premise infrastructure. Our APIs provide complete control over authentication, data management, and business logic.",
            tags: ["Docker Compose Ready", "RESTful APIs", "Kubernetes Compatible", "Auto-Scaling"],
            caseStudyBadge: "Case Study",
            caseStudyTitle: "NortixClient ×",
            caseStudySubtitle: "A comprehensive integration powering in-game commerce",
            marketplaceTitle: "Cosmetics Marketplace",
            marketplaceDesc: "Real-time cosmetic item sales with instant delivery, utilizing fungies.io's headless API for inventory management and secure transactions.",
            advertisingTitle: "Server Advertising",
            advertisingDesc: "Dynamic server promotion system allowing server owners to purchase featured listings and boost visibility to thousands of players.",
            marketFeaturesTitle: "Server Market Features",
            marketFeaturesDesc: "Complete marketplace for server upgrades, player slots, and premium features - all powered by fungies.io's commerce engine.",
            techTitle: "Technical Architecture",
            techDesc: "The NortixClient leverages fungies.io's containerized microservices through secure RESTful endpoints. All transactions are processed in real-time with webhook notifications, automated fulfillment pipelines, and comprehensive analytics. The integration showcases the power of our headless API approach - complete separation of frontend and backend enabling rapid feature deployment and seamless scaling.",
            imgAlt: "Nortix Market Interface Integration"
        },
        tr: {
            title: "Kurumsal Düzeyde",
            highlight: "Ticaret ve Entegrasyon",
            subtitle: "Modern SaaS platformları için tasarlanmış tam özellikli işlem işleme ve kusursuz API entegrasyonları",
            b2bTitle: "Ticari İşlemler",
            b2bDesc: "Kurumsal müşteriler için toplu lisanslama, özel fiyatlandırma kademeleri, faturalandırma sistemleri ve çok kiracılı hesap yönetimi dahil olmak üzere kurumsal düzeyde özelliklere sahip sağlam B2B işlem işleme.",
            b2cTitle: "Tüketici İşlemleri",
            b2cDesc: "Birden fazla ödeme sağlayıcısı desteği, abonelik yönetimi, tek tıkla satın alma ve son kullanıcılar için gerçek zamanlı işlem bildirimleri ile kusursuz B2C ödeme işleme.",
            headlessTitle: "Docker ve Headless API Entegrasyonu",
            headlessDesc: "Docker desteği ve kapsamlı RESTful headless API'ler ile tam konteynerize edilmiş mikro hizmet mimarisi. Her yere dağıtın, her şeyle entegre edin - bulut platformlarından yerel altyapıya kadar. API'lerimiz kimlik doğrulama, veri yönetimi ve iş mantığı üzerinde tam kontrol sağlar.",
            tags: ["Docker Compose Hazır", "RESTful API'ler", "Kubernetes Uyumlu", "Otomatik Ölçeklendirme"],
            caseStudyBadge: "Vaka Çalışması",
            caseStudyTitle: "NortixClient ×",
            caseStudySubtitle: "Oyun içi ticareti güçlendiren kapsamlı bir entegrasyon",
            marketplaceTitle: "Kozmetik Pazaryeri",
            marketplaceDesc: "Stok yönetimi ve güvenli işlemler için fungies.io'nun headless API'sini kullanan, anında teslimatlı gerçek zamanlı kozmetik ürün satışları.",
            advertisingTitle: "Sunucu Reklamcılığı",
            advertisingDesc: "Sunucu sahiplerinin öne çıkan listelemeler satın almasına ve binlerce oyuncuya görünürlüğünü artırmasına olanak tanıyan dinamik sunucu tanıtım sistemi.",
            marketFeaturesTitle: "Sunucu Market Özellikleri",
            marketFeaturesDesc: "Sunucu yükseltmeleri, oyuncu slotları ve premium özellikler için eksiksiz bir pazaryeri - tamamı fungies.io'nun ticaret motoru tarafından desteklenmektedir.",
            techTitle: "Teknik Mimari",
            techDesc: "NortixClient, güvenli RESTful uç noktalar aracılığıyla fungies.io'nun konteynerize edilmiş mikro hizmetlerinden yararlanır. Tüm işlemler webhook bildirimleri, otomatik tamamlama boru hatları ve kapsamlı analitiklerle gerçek zamanlı olarak işlenir. Entegrasyon, headless API yaklaşımımızın gücünü sergiliyor - ön uç ve arka ucun tamamen ayrılması, hızlı özellik dağıtımı ve kusursuz ölçeklendirme sağlar.",
            imgAlt: "Nortix Market Arayüz Entegrasyonu"
        }
    };

    const t = content[lang] || content.en;

    return (
        <section className="relative min-h-screen pt-20 md:pt-24 pb-12 overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-violet-600/10 blur-[120px] -z-10 rounded-full" />
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-cyan-600/10 blur-[120px] -z-10 rounded-full" />

            <div className="container mx-auto px-6">
                <div className="mb-16 md:mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12 md:mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold font-display text-white mb-6">
                            {t.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">{t.highlight}</span>
                        </h2>
                        <p className="text-slate-400 text-base md:text-lg max-w-3xl mx-auto px-4 md:px-0">
                            {t.subtitle}
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-10 md:mb-12">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-cyan-900/20 to-cyan-900/5 border border-cyan-500/20 hover:border-cyan-500/40 transition-all"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                    <span className="text-xl md:text-2xl font-bold text-cyan-400">B2B</span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-white">{t.b2bTitle}</h3>
                            </div>
                            <p className="text-sm md:text-base text-slate-400 leading-relaxed">
                                {t.b2bDesc}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-violet-900/20 to-violet-900/5 border border-violet-500/20 hover:border-violet-500/40 transition-all"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                    <span className="text-xl md:text-2xl font-bold text-violet-400">B2C</span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-white">{t.b2cTitle}</h3>
                            </div>
                            <p className="text-sm md:text-base text-slate-400 leading-relaxed">
                                {t.b2cDesc}
                            </p>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-pink-900/20 to-pink-900/5 border border-pink-500/20 hover:border-pink-500/40 transition-all"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                                <Box className="w-6 h-6 text-pink-400" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-white">{t.headlessTitle}</h3>
                        </div>
                        <p className="text-sm md:text-base text-slate-400 leading-relaxed mb-6">
                            {t.headlessDesc}
                        </p>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                            {t.tags.map((tag, i) => (
                                <span key={i} className="px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs md:text-sm font-medium">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Case Study Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16 md:mb-24"
                >
                    <div className="p-6 md:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-white/10 relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row items-start gap-4 mb-8 md:mb-10">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                                    <Rocket className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                </div>
                                <div>
                                    <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-wider uppercase mb-3">
                                        {t.caseStudyBadge}
                                    </span>
                                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                                        {t.caseStudyTitle} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">fungies.io</span>
                                    </h3>
                                    <p className="text-slate-400 text-base md:text-lg">
                                        {t.caseStudySubtitle}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                                <div className="p-5 md:p-6 rounded-xl bg-white/5 border border-white/10">
                                    <div className="text-cyan-400 font-bold text-xs md:text-sm mb-2 uppercase tracking-wide">{t.marketplaceTitle}</div>
                                    <p className="text-sm md:text-base text-slate-300">
                                        {t.marketplaceDesc}
                                    </p>
                                </div>
                                <div className="p-5 md:p-6 rounded-xl bg-white/5 border border-white/10">
                                    <div className="text-violet-400 font-bold text-xs md:text-sm mb-2 uppercase tracking-wide">{t.advertisingTitle}</div>
                                    <p className="text-sm md:text-base text-slate-300">
                                        {t.advertisingDesc}
                                    </p>
                                </div>
                                <div className="p-5 md:p-6 rounded-xl bg-white/5 border border-white/10">
                                    <div className="text-pink-400 font-bold text-xs md:text-sm mb-2 uppercase tracking-wide">{t.marketFeaturesTitle}</div>
                                    <p className="text-sm md:text-base text-slate-300">
                                        {t.marketFeaturesDesc}
                                    </p>
                                </div>
                            </div>

                            <div className="p-5 md:p-6 rounded-xl bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-white/10">
                                <div className="flex items-start gap-3 md:gap-4">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <Cpu className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm md:text-base text-white font-bold mb-2">{t.techTitle}</h4>
                                        <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                                            {t.techDesc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Market Interface Preview */}
                        <div className="mt-8 rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900/50">
                            <img
                                src="/market.webp"
                                alt={t.imgAlt}
                                className="w-full h-auto opacity-90 hover:opacity-100 transition-opacity duration-500"
                            />
                        </div>
                    </div>
                </motion.div>
            </div >
        </section >
    );
}
