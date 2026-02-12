import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send, HelpCircle, Users } from 'lucide-react';

export default function Contact({ lang = 'en' }) {
    const content = {
        en: {
            title: "Let's Build the Future",
            desc: "Have a project in mind? Whether it's a new SaaS platform, a game concept, or a mobile app, Nortixlabs is ready to bring your vision to life.",
            emailTitle: "Email Us",
            locTitle: "Location",
            locDesc: "Samsun, Turkey (Digital Office)",
            communityTitle: "Nortix Community",
            communityDesc: "Direct access to the dev and real-time project updates",
            discord: "Join our Discord →",
            nameLabel: "Name",
            namePlaceholder: "Your Name",
            emailLabel: "Email",
            emailPlaceholder: "you@company.com",
            messageLabel: "Message",
            messagePlaceholder: "Tell us about your project...",
            send: "Send Message",
            sending: "Sending...",
            success: "Thanks for reaching out! We'll be in touch soon.",
            error: "Something went wrong. Please try again.",
            connError: "Failed to send message. Please check your connection."
        },
        tr: {
            title: "Geleceği Birlikte İnşa Edelim",
            desc: "Aklınızda bir proje mi var? Yeni bir SaaS platformu, oyun konsepti veya mobil uygulama olsun, Nortixlabs vizyonunuzu hayata geçirmeye hazır.",
            emailTitle: "Bize E-posta Gönderin",
            locTitle: "Konum",
            locDesc: "Samsun, Türkiye (Dijital Ofis)",
            communityTitle: "Nortix Topluluğu",
            communityDesc: "Geliştiriciye doğrudan erişim ve gerçek zamanlı proje güncellemeleri",
            discord: "Discord'umuza Katılın →",
            nameLabel: "İsim",
            namePlaceholder: "Adınız",
            emailLabel: "E-posta",
            emailPlaceholder: "siz@sirket.com",
            messageLabel: "Mesaj",
            messagePlaceholder: "Projenizden bahsedin...",
            send: "Mesaj Gönder",
            sending: "Gönderiliyor...",
            success: "Bizimle iletişime geçtiğiniz için teşekkürler! Yakında dönüş yapacağız.",
            error: "Bir şeyler yanlış gitti. Lütfen tekrar deneyin.",
            connError: "Mesaj gönderilemedi. Lütfen bağlantınızı kontrol edin."
        }
    };

    const t = content[lang] || content.en;

    const [formState, setFormState] = useState({ name: '', email: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('name', formState.name);
            formData.append('email', formState.email);
            formData.append('message', formState.message);

            const response = await fetch('/api/contact', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                alert(t.success);
                setFormState({ name: '', email: '', message: '' });
            } else {
                alert(result.message || t.error);
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert(t.connError);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="py-24 relative">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Contact Info */}
                    <div>
                        <h2 className="text-3xl md:text-5xl font-bold font-display text-white mb-6">{t.title}</h2>
                        <p className="text-slate-400 text-lg mb-12">
                            {t.desc}
                        </p>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-violet-600/10 border border-violet-600/20">
                                    <Mail className="w-6 h-6 text-violet-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold text-lg">{t.emailTitle}</h4>
                                    <a href="mailto:hello@nortixlabs.com" className="text-slate-400 hover:text-white transition-colors">hello@nortixlabs.com</a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-cyan-600/10 border border-cyan-600/20">
                                    <MapPin className="w-6 h-6 text-cyan-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold text-lg">{t.locTitle}</h4>
                                    <p className="text-slate-400">{t.locDesc}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-emerald-600/10 border border-emerald-600/20">
                                    <Users className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold text-lg">{t.communityTitle}</h4>
                                    <p className="text-slate-400 mb-2">{t.communityDesc}</p>
                                    <a href="https://discord.gg/EHPTMYNANq" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                                        {t.discord}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="glass p-8 rounded-2xl border border-white/10"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">{t.nameLabel}</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={formState.name}
                                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-600"
                                    placeholder={t.namePlaceholder}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">{t.emailLabel}</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={formState.email}
                                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-600"
                                    placeholder={t.emailPlaceholder}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">{t.messageLabel}</label>
                                <textarea
                                    id="message"
                                    rows={4}
                                    value={formState.message}
                                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-600 resize-none"
                                    placeholder={t.messagePlaceholder}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? t.sending : (
                                    <> {t.send} <Send className="w-4 h-4" /> </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
