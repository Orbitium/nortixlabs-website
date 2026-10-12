import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Newspaper, Calendar, Users, Check, Sparkles } from 'lucide-react';

export default function AkademizCarousel({ lang = 'tr' }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const isTr = lang === 'tr';

    const features = [
        {
            id: 'news',
            icon: Newspaper,
            badgeColor: 'from-blue-600 to-cyan-500',
            textColor: 'text-cyan-400',
            title: isTr ? 'Haberdar Kalın' : 'Stay informed',
            description: isTr
                ? 'Önemli duyurulardan, bölüm haberlerinden ve rektörlük duyurularından anında haberdar olun.'
                : 'Get the latest news, announcements, and important updates directly from your university.',
            bullets: isTr
                ? [
                      'Fakülte ve bölümlere özel filtrelenmiş akış',
                      'Acil duyurular için anlık anons bildirimleri',
                      'Daha sonra okumak için haberleri kaydetme',
                  ]
                : [
                      'Major-tailored academic & faculty feed',
                      'Instant push notifications for urgent alerts',
                      'Bookmark important articles for later',
                  ],
            image: '/akademiz/news.png',
            imageAlt: 'AkademiZ News Feed Screen',
            highlight: isTr ? 'Güncel Haber Akışı' : 'Live Campus Feed',
        },
        {
            id: 'events',
            icon: Calendar,
            badgeColor: 'from-cyan-500 to-sky-600',
            textColor: 'text-sky-400',
            title: isTr ? 'Hiçbir Şeyi Kaçırmayın' : 'Never miss out',
            description: isTr
                ? 'Kampüsteki tüm seminerleri, kulüp buluşmalarını ve festivalleri keşfedin, takviminize ekleyin.'
                : 'Discover events, join communities, and make the most of your vibrant campus life.',
            bullets: isTr
                ? [
                      'İnteraktif kampüs etkinlik takvimi ve mekan bilgisi',
                      'Tek tıkla Google ve Apple Takvim senkronizasyonu',
                      'Tek dokunuşla katılım (RSVP) ve başlama hatırlatıcısı',
                  ]
                : [
                      'Interactive campus event map & venue info',
                      'One-click Google & Apple Calendar sync',
                      'One-tap RSVP & 15-minute start reminders',
                  ],
            image: '/akademiz/events.png',
            imageAlt: 'AkademiZ Events Calendar Screen',
            highlight: isTr ? 'Etkinlik Takvimi' : 'Interactive Calendar',
        },
        {
            id: 'community',
            icon: Users,
            badgeColor: 'from-indigo-600 to-blue-500',
            textColor: 'text-indigo-400',
            title: isTr ? 'Topluluğunu Bul' : 'Find your people',
            description: isTr
                ? 'İlgi alanına uygun öğrenci kulüplerine katıl, yeni insanlarla tanış ve kampüsün bir parçası ol.'
                : 'Join communities, meet new friends, and be part of something truly great on campus.',
            bullets: isTr
                ? [
                      '18+ onaylı OMÜ öğrenci kulübü ve topluluk ağı',
                      'Kulüp duyuru panosu ve doğrudan mesajlaşma',
                      'Kampüs içi projeler ve ortak atölye çalışmaları',
                  ]
                : [
                      '18+ verified campus clubs & student associations',
                      'Direct club announcements and event feeds',
                      'Student networking & collaborative projects',
                  ],
            image: '/akademiz/news_2.png',
            imageAlt: 'AkademiZ Communities Screen',
            highlight: isTr ? '18+ Kampüs Kulübü' : '18+ Verified Clubs',
        },
        {
            id: 'utilities',
            icon: Sparkles,
            badgeColor: 'from-violet-600 to-cyan-500',
            textColor: 'text-cyan-300',
            title: isTr ? 'Akıllı Kampüs Araçları' : 'Smart campus tools',
            description: isTr
                ? 'Ders programları, sınav takvimleri, sınıf konumları ve bildirimler cebinizde tek bir yerde.'
                : 'Course timetables, exam schedules, classroom maps, and alerts in one unified super-app.',
            bullets: isTr
                ? [
                      'Haftalık interaktif ders programı görüntüleyici',
                      'Sınav günleri ve derslik konum göstergesi',
                      'Sessiz saatler ve kişiselleştirilmiş bildirim ayarı',
                  ]
                : [
                      'Interactive weekly course timetable viewer',
                      'Exam countdown & classroom directory',
                      'Quiet hours and custom notification filters',
                  ],
            image: '/akademiz/notifications.png',
            imageAlt: 'AkademiZ Notifications & Utilities Screen',
            highlight: isTr ? 'Hızlı Ders & Sınav Takibi' : 'Course & Exam Assistant',
        },
    ];

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? features.length - 1 : prev - 1));
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === features.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="relative w-full">
            {/* Navigation Controls & Indicators */}
            <div className="flex items-center justify-between mb-8">
                {/* Tabs switcher for desktop */}
                <div className="hidden md:flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl">
                    {features.map((feature, idx) => {
                        const Icon = feature.icon;
                        const isActive = currentIndex === idx;
                        return (
                            <button
                                key={feature.id}
                                type="button"
                                onClick={() => setCurrentIndex(idx)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                                    isActive
                                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                <span>{feature.title}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Arrow buttons */}
                <div className="flex items-center gap-3 ml-auto">
                    <button
                        type="button"
                        onClick={prevSlide}
                        aria-label="Previous feature"
                        className="w-11 h-11 rounded-full bg-slate-900/90 border border-white/15 hover:border-cyan-400/50 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200 shadow-lg active:scale-95"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        onClick={nextSlide}
                        aria-label="Next feature"
                        className="w-11 h-11 rounded-full bg-slate-900/90 border border-white/15 hover:border-cyan-400/50 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200 shadow-lg active:scale-95"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Carousel Active Feature Card */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900/70 border border-cyan-500/20 backdrop-blur-2xl p-6 sm:p-10 shadow-[0_20px_60px_rgba(2,10,30,0.7)]">
                {/* Ambient backglow */}
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    {/* Left: Device Mockup Showcase */}
                    <div className="lg:col-span-5 flex justify-center order-2 lg:order-1">
                        <div className="relative group/mockup">
                            {/* Device Frame */}
                            <div className="relative w-[230px] sm:w-[260px] aspect-[9/19.5] bg-slate-950 rounded-[38px] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(56,189,248,0.2)] border-4 border-slate-800/90 ring-1 ring-white/15 overflow-hidden">
                                
                                {/* Dynamic Island */}
                                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-black rounded-full z-20"></div>

                                {/* Screen Image with fade */}
                                <div className="relative w-full h-full rounded-[30px] overflow-hidden bg-slate-950">
                                    <img
                                        key={features[currentIndex].image}
                                        src={features[currentIndex].image}
                                        alt={features[currentIndex].imageAlt}
                                        loading="lazy"
                                        className="w-full h-full object-cover object-top transition-all duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/20 pointer-events-none"></div>
                                </div>
                            </div>

                            {/* Floating Highlight Pill */}
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-3.5 py-1 rounded-full bg-slate-950/90 border border-cyan-500/40 backdrop-blur-md shadow-lg shadow-black/60 flex items-center gap-1.5 z-30">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                                <span className="text-[11px] font-semibold text-cyan-300">
                                    {features[currentIndex].highlight}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Feature Content & Highlights */}
                    <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${features[currentIndex].badgeColor} flex items-center justify-center text-white shadow-lg shadow-blue-500/25`}>
                                {React.createElement(features[currentIndex].icon, { className: 'w-6 h-6' })}
                            </div>
                            <div>
                                <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                                    {isTr ? `Özellik 0${currentIndex + 1}` : `Feature 0${currentIndex + 1}`}
                                </span>
                                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight font-display">
                                    {features[currentIndex].title}
                                </h3>
                            </div>
                        </div>

                        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                            {features[currentIndex].description}
                        </p>

                        <div className="space-y-3 pt-2">
                            {features[currentIndex].bullets.map((bullet, bIdx) => (
                                <div key={bIdx} className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5">
                                        <Check className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-sm sm:text-base text-slate-200 font-medium">
                                        {bullet}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Interactive dots row */}
                        <div className="pt-4 flex items-center gap-2">
                            {features.map((_, dotIdx) => (
                                <button
                                    key={dotIdx}
                                    type="button"
                                    onClick={() => setCurrentIndex(dotIdx)}
                                    aria-label={`Jump to feature ${dotIdx + 1}`}
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                        currentIndex === dotIdx
                                            ? 'w-8 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-md shadow-cyan-500/40'
                                            : 'w-2 bg-slate-700 hover:bg-slate-500'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid preview cards for desktop visitors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {features.map((feature, idx) => {
                    const Icon = feature.icon;
                    const isSelected = currentIndex === idx;
                    return (
                        <div
                            key={feature.id}
                            onClick={() => setCurrentIndex(idx)}
                            className={`cursor-pointer p-4 rounded-2xl border transition-all duration-300 flex items-center gap-3.5 ${
                                isSelected
                                    ? 'bg-slate-900/90 border-cyan-500/50 shadow-lg shadow-cyan-500/15 ring-1 ring-cyan-500/30'
                                    : 'bg-slate-900/40 border-white/5 hover:border-white/15 hover:bg-slate-900/60'
                            }`}
                        >
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${feature.badgeColor} flex items-center justify-center text-white flex-shrink-0`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-semibold text-white truncate">
                                    {feature.title}
                                </h4>
                                <p className="text-xs text-slate-400 truncate">
                                    {feature.highlight}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
