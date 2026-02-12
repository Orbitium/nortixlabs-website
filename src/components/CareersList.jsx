import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Code, TrendingUp, Scale, ArrowRight } from 'lucide-react';

const localizedPositions = {
    en: [
        {
            title: 'UI/UX Artist',
            type: 'Half Time',
            compensation: 'Revenue Share',
            description: 'We need a creative visionary to design intuitive and beautiful interfaces for the Nortix Launcher and our ecosystem of apps.',
            requirements: [
                'Proficiency in Figma or Adobe Suite',
                'Experience with modern, dark-mode aesthetics',
                'Understanding of user flows and interactive states',
                'Ability to create game-ready assets is a plus'
            ],
            icon: Palette,
            color: 'from-pink-500 to-rose-500',
        },
        {
            title: 'Minecraft Modder',
            subtitle: 'Nortix Client',
            type: 'Contract / Project Based',
            compensation: 'Revenue Share',
            description: 'Join the team building the Nortix Client. You will be working deep within the Minecraft codebase to create smooth, feature-rich experiences.',
            requirements: [
                'Extensive experience with Fabric API',
                'Strong knowledge of Java and Mixins',
                'Understanding of client-side rendering & optimization',
                'Previous public mods or contributions are required'
            ],
            icon: Code,
            color: 'from-emerald-400 to-cyan-500',
        },
        {
            title: 'Marketing Specialist',
            type: 'Flexible',
            compensation: 'Revenue Share',
            description: 'Help us grow the Nortix community. You will be the voice of Nortix, reaching out to new players, creators, and partners.',
            requirements: [
                'Experience managing social media (Twitter/Discord)',
                'Ability to create engaging content and copy',
                'Networking skills to reach influencers and communities',
                'Basic understanding of analytics and growth strategies'
            ],
            icon: TrendingUp,
            color: 'from-amber-400 to-orange-500',
        },
        {
            title: 'Business & Legal Manager',
            type: 'Part Time',
            compensation: 'Revenue Share',
            description: 'Handle the operational backbone of Nortixlabs. We need someone organized to manage the "boring" but critical stuff.',
            requirements: [
                'Experience with digital goods & software compliance',
                'Drafting & managing ToS, Privacy Policies, EULAs',
                'Handling tax obligations and financial structuring',
                'Managing refund policies and disputes'
            ],
            icon: Scale,
            color: 'from-violet-500 to-purple-500',
        },
    ],
    tr: [
        {
            title: 'UI/UX Sanatçısı',
            type: 'Yarı Zamanlı',
            compensation: 'Gelir Paylaşımı',
            description: 'Nortix Launcher ve uygulama ekosistemimiz için sezgisel ve güzel arayüzler tasarlayacak yaratıcı bir vizyoner arıyoruz.',
            requirements: [
                'Figma veya Adobe Suite yetkinliği',
                'Modern, karanlık mod estetiği deneyimi',
                'Kullanıcı akışları ve etkileşimli durumlar hakkında anlayış',
                'Oyun varlıkları oluşturma yeteneği artı puandır'
            ],
            icon: Palette,
            color: 'from-pink-500 to-rose-500',
        },
        {
            title: 'Minecraft Mod Geliştirici',
            subtitle: 'Nortix Client',
            type: 'Sözleşmeli / Proje Bazlı',
            compensation: 'Gelir Paylaşımı',
            description: 'Nortix Client\'ı inşa eden ekibe katılın. Pürüzsüz ve özellik açısından zengin deneyimler yaratmak için Minecraft kod tabanında derinlemesine çalışacaksınız.',
            requirements: [
                'Fabric API ile kapsamlı deneyim',
                'Güçlü Java ve Mixin bilgisi',
                'İstemci tarafı oluşturma ve optimizasyon anlayışı',
                'Önceki halka açık modlar veya katkılar gereklidir'
            ],
            icon: Code,
            color: 'from-emerald-400 to-cyan-500',
        },
        {
            title: 'Pazarlama Uzmanı',
            type: 'Esnek',
            compensation: 'Gelir Paylaşımı',
            description: 'Nortix topluluğunu büyütmemize yardımcı olun. Yeni oyunculara, içerik üreticilerine ve ortaklara ulaşarak Nortix\'in sesi olacaksınız.',
            requirements: [
                'Sosyal medya yönetimi deneyimi (Twitter/Discord)',
                'Etkileyici içerik ve metin oluşturma yeteneği',
                'Influencer\'lara ve topluluklara ulaşmak için ağ kurma becerileri',
                'Analitik ve büyüme stratejileri hakkında temel anlayış'
            ],
            icon: TrendingUp,
            color: 'from-amber-400 to-orange-500',
        },
        {
            title: 'İş ve Hukuk Yöneticisi',
            type: 'Yarı Zamanlı',
            compensation: 'Gelir Paylaşımı',
            description: 'Nortixlabs\'ın operasyonel omurgasını yönetin. "Sıkıcı" ama kritik işleri yönetecek düzenli birine ihtiyacımız var.',
            requirements: [
                'Dijital ürünler ve yazılım uyumluluğu deneyimi',
                'Hizmet Şartları, Gizlilik Politikaları ve EULA hazırlama/yönetme',
                'Vergi yükümlülükleri ve finansal yapılandırma yönetimi',
                'İade politikaları ve uyuşmazlık yönetimi'
            ],
            icon: Scale,
            color: 'from-violet-500 to-purple-500',
        },
    ]
};

const labels = {
    en: {
        badge: 'Join the Team',
        title: 'Build the Future of',
        desc: 'We are looking for passionate individuals to join us on a revenue-share basis. Help us build the next generation of launcher technology.',
        requirements: 'Requirements',
        apply: 'Apply Now'
    },
    tr: {
        badge: 'Ekibe Katılın',
        title: 'Geleceği Birlikte',
        nortixSuffix: 'İnşa Edelim',
        desc: 'Gelir paylaşımı esasına göre aramıza katılacak tutkulu bireyler arıyoruz. Gelecek nesil launcher teknolojisini geliştirmemize yardımcı olun.',
        requirements: 'Gereksinimler',
        apply: 'Hemen Başvur'
    }
};

export default function CareersList({ lang = 'en' }) {
    const positions = localizedPositions[lang] || localizedPositions.en;
    const t = labels[lang] || labels.en;

    return (
        <section className="py-24 relative min-h-screen">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16 pt-10">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-block py-1 px-3 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold tracking-wider uppercase mb-4"
                    >
                        {t.badge}
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl md:text-6xl font-bold font-display text-white mb-6"
                    >
                        {lang === 'tr' ? (
                            <>{t.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Nortix</span>'i {t.nortixSuffix}</>
                        ) : (
                            <>{t.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Nortix</span></>
                        )}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-slate-400 max-w-2xl mx-auto text-lg"
                    >
                        {t.desc}
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {positions.map((job, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group relative p-8 rounded-2xl bg-slate-900/50 border border-white/5 hover:bg-slate-800/50 transition-colors duration-300 flex flex-col h-full"
                        >
                            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${job.color} opacity-50 group-hover:opacity-100 transition-opacity duration-300`} />

                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">{job.title}</h3>
                                    {job.subtitle && <span className="text-cyan-400 text-sm font-medium block mb-1">{job.subtitle}</span>}
                                    <div className="flex gap-2 mt-2">
                                        <span className="text-xs font-medium px-2 py-1 rounded bg-white/5 text-slate-300 border border-white/5">
                                            {job.type}
                                        </span>
                                        <span className="text-xs font-medium px-2 py-1 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
                                            {job.compensation}
                                        </span>
                                    </div>
                                </div>
                                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${job.color} p-[1px] shrink-0`}>
                                    <div className="w-full h-full rounded-lg bg-slate-950 flex items-center justify-center">
                                        <job.icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            <p className="text-slate-300 leading-relaxed mb-6">
                                {job.description}
                            </p>

                            <div className="mt-auto">
                                <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider opacity-80">{t.requirements}</h4>
                                <ul className="space-y-2 mb-8">
                                    {job.requirements.map((req, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                                            <span className="mt-1.5 w-1 h-1 rounded-full bg-cyan-500 shrink-0" />
                                            {req}
                                        </li>
                                    ))}
                                </ul>

                                <a
                                    href={`/apply?position=${encodeURIComponent(job.title)}`}
                                    className="w-full py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 text-white font-medium transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-cyan-900/10"
                                >
                                    {t.apply} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
