import React from 'react';
import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

export default function ComingSoon({ title, description, lang = 'en' }) {
    const t = {
        en: {
            return: 'Return to Homepage',
            defaultDesc: 'We are currently hard at work building this division. Stay tuned for groundbreaking updates.'
        },
        tr: {
            return: 'Ana Sayfaya Dön',
            defaultDesc: 'Bu bölümü inşa etmek için yoğun bir şekilde çalışıyoruz. Çığır açan güncellemeler için takipte kalın.'
        }
    };

    const currentT = t[lang] || t.en;

    return (
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">

            <div className="text-center z-10 px-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-24 h-24 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/10"
                >
                    <Construction className="w-12 h-12 text-yellow-400" />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl md:text-5xl font-bold font-display text-white mb-4"
                >
                    {title}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-slate-400 text-lg max-w-xl mx-auto mb-10"
                >
                    {description || currentT.defaultDesc}
                </motion.p>

                <motion.a
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    href={lang === 'en' ? '/' : '/tr'}
                    className="text-cyan-400 hover:text-cyan-300 font-medium underline decoration-cyan-500/30 hover:decoration-cyan-500 transition-all"
                >
                    {currentT.return}
                </motion.a>
            </div>
        </section>
    );
}
