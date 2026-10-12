import React, { useState, useEffect, useRef } from 'react';
import { Users, Calendar, MessageSquare } from 'lucide-react';

export default function AkademizStatsCounter({
    studentsTarget = 450,
    eventsTarget = 20,
    postsTarget = 10,
    lang = 'tr',
    duration = 5000,
}) {
    const isTr = lang === 'tr';
    const [counts, setCounts] = useState({
        students: 0,
        events: 0,
        posts: 0,
    });
    const [hasAnimated, setHasAnimated] = useState(false);
    const containerRef = useRef(null);

    // Labels
    const labels = {
        students: isTr ? 'Aktif öğrenci' : 'Active students',
        events: isTr ? 'Paylaşılan etkinlik' : 'Published events',
        posts: isTr ? 'Topluluk paylaşımı' : 'Community posts',
    };

    const formatNumber = (num) => {
        return isTr ? num.toLocaleString('tr-TR') : num.toLocaleString('en-US');
    };

    useEffect(() => {
        // Trigger animation when component enters viewport
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                }
            },
            { threshold: 0.15 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [hasAnimated]);

    useEffect(() => {
        if (!hasAnimated) return;

        let startTime = null;
        let animationFrameId = null;

        // Smooth cubic ease-out function
        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutCubic(progress);

            setCounts({
                students: Math.round(easedProgress * studentsTarget),
                events: Math.round(easedProgress * eventsTarget),
                posts: Math.round(easedProgress * postsTarget),
            });

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [hasAnimated, studentsTarget, eventsTarget, postsTarget, duration]);

    return (
        <div ref={containerRef} className="relative rounded-2xl sm:rounded-3xl bg-slate-900/60 border border-cyan-500/25 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(2,12,30,0.6)]">
            {/* Subtle top cyan glow border */}
            <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 items-center divide-y sm:divide-y-0 sm:divide-x divide-white/10">
                {/* 1. Students Count */}
                <div className="flex items-center gap-4 pt-4 sm:pt-0 pl-0 sm:pl-4 first:pt-0 first:pl-0">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-cyan-400 flex-shrink-0 shadow-lg shadow-blue-500/10">
                        <Users className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display tabular-nums">
                            {formatNumber(counts.students)}+
                        </div>
                        <div className="text-xs sm:text-sm text-slate-300 font-medium">
                            {labels.students}
                        </div>
                    </div>
                </div>

                {/* 2. Events Count */}
                <div className="flex items-center gap-4 pt-4 sm:pt-0 pl-0 sm:pl-8">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400 flex-shrink-0 shadow-lg shadow-sky-500/10">
                        <Calendar className="w-6 h-6 text-sky-400" />
                    </div>
                    <div>
                        <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display tabular-nums">
                            {formatNumber(counts.events)}+
                        </div>
                        <div className="text-xs sm:text-sm text-slate-300 font-medium">
                            {labels.events}
                        </div>
                    </div>
                </div>

                {/* 3. Community Posts Count */}
                <div className="flex items-center gap-4 pt-4 sm:pt-0 pl-0 sm:pl-8">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 flex-shrink-0 shadow-lg shadow-cyan-500/10">
                        <MessageSquare className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display tabular-nums">
                            {formatNumber(counts.posts)}+
                        </div>
                        <div className="text-xs sm:text-sm text-slate-300 font-medium">
                            {labels.posts}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
