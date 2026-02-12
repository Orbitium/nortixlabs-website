import React, { useState } from 'react';
import { FileText, ExternalLink, BookOpen, MousePointerClick } from 'lucide-react';

const gameDesignDocs = [
    {
        id: 1,
        title: "Core Game Mechanics",
        description: "Detailed breakdown of core gameplay systems, player interactions, and fundamental game mechanics that drive the player experience.",
        url: "https://docs.google.com/document/d/1DmMPriJaxtK4q3Vo2LJ0_UclloNpj5YT3z3Bcx5gWoE/edit?usp=sharing",
        category: "Mechanics",
        color: "violet"
    },
    {
        id: 2,
        title: "World & Narrative Design",
        description: "Comprehensive world-building documentation including lore, storylines, character arcs, and narrative structure.",
        url: "https://docs.google.com/document/d/1r7qpVpjSoL7-gqEbVRQQ87fkCTcNEo55gJBTN26b6WY/edit?usp=sharing",
        category: "Narrative",
        color: "cyan"
    },
    {
        id: 3,
        title: "Level Design Guidelines",
        description: "Architectural principles, environmental storytelling strategies, and level progression frameworks for creating engaging spaces.",
        url: "https://docs.google.com/document/d/1h6swYYg3HpFLDRk6PilUu749N3auAPZIGXSBPCs8U94/edit?usp=sharing",
        category: "Design",
        color: "pink"
    },
    {
        id: 4,
        title: "Character & Ability Systems",
        description: "In-depth exploration of character classes, skill trees, progression systems, and ability balancing strategies.",
        url: "https://docs.google.com/document/d/1m6J89JjukrjMpwrFsYdJfvwaoJSqnXmpGMf7lKuLwSI/edit?usp=sharing",
        category: "Systems",
        color: "emerald"
    },
    {
        id: 5,
        title: "Economy & Progression",
        description: "Economic design principles, reward structures, monetization strategies, and player progression pathways.",
        url: "https://docs.google.com/document/d/1NakXFhSBIxp_r-TzKT1A-B7rbxamCA7d4Dek12PMcg4/edit?usp=sharing",
        category: "Economics",
        color: "amber"
    },
    {
        id: 6,
        title: "Technical Architecture",
        description: "System architecture overview, technical implementation details, optimization strategies, and engineering requirements.",
        url: "https://docs.google.com/document/d/1DmMPriJaxtK4q3Vo2LJ0_UclloNpj5YT3z3Bcx5gWoE/edit?tab=t.0#heading=h.njl53nwd7r26",
        category: "Technical",
        color: "blue"
    }
];

const categoryColors = {
    violet: {
        gradient: 'from-violet-600 to-purple-600',
        border: 'border-violet-500/30',
        bg: 'bg-violet-500/10',
        text: 'text-violet-400',
        glow: 'shadow-violet-500/20'
    },
    cyan: {
        gradient: 'from-cyan-600 to-blue-600',
        border: 'border-cyan-500/30',
        bg: 'bg-cyan-500/10',
        text: 'text-cyan-400',
        glow: 'shadow-cyan-500/20'
    },
    pink: {
        gradient: 'from-pink-600 to-rose-600',
        border: 'border-pink-500/30',
        bg: 'bg-pink-500/10',
        text: 'text-pink-400',
        glow: 'shadow-pink-500/20'
    },
    emerald: {
        gradient: 'from-emerald-600 to-teal-600',
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        glow: 'shadow-emerald-500/20'
    },
    amber: {
        gradient: 'from-amber-600 to-orange-600',
        border: 'border-amber-500/30',
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        glow: 'shadow-amber-500/20'
    },
    blue: {
        gradient: 'from-blue-600 to-indigo-600',
        border: 'border-blue-500/30',
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        glow: 'shadow-blue-500/20'
    }
};

export default function GameDesignDocs() {
    return (
        <section className="relative py-24 px-4 md:px-8 min-h-screen">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto mb-16">
                <div className="text-center space-y-6 animate-fade-in-up">
                    {/* Example Badge - More Prominent */}
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <div className="inline-flex items-center space-x-2 px-6 py-3 rounded-full border-2 border-violet-500 bg-violet-500/20 backdrop-blur-lg animate-pulse">
                            <MousePointerClick className="w-6 h-6 text-violet-300" />
                            <span className="text-lg font-bold text-violet-200">CLICK TO VIEW EXAMPLES</span>
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-violet-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent leading-tight">
                        Game Design <br className="sm:hidden" />Documents
                    </h1>

                    <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                        Dive into our comprehensive game design documentation. <span className="text-cyan-400 font-semibold">Click any card below</span> to
                        explore example documents from core mechanics to technical architecture.
                    </p>

                    {/* Clickable Indicator */}
                    <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800/60 border border-cyan-500/30">
                        <ExternalLink className="w-5 h-5 text-cyan-400 animate-bounce" />
                        <span className="text-sm font-medium text-cyan-300">All documents open in Google Docs</span>
                    </div>
                </div>
            </div>

            {/* Documents Grid */}
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gameDesignDocs.map((doc, index) => {
                        const colors = categoryColors[doc.color];
                        return (
                            <a
                                key={doc.id}
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative overflow-hidden rounded-2xl glass-card p-6 hover:scale-105 transition-all duration-300 hover:shadow-2xl cursor-pointer border-2 border-transparent hover:border-white/20"
                                style={{
                                    animationDelay: `${index * 100}ms`,
                                    animation: 'fadeInUp 0.6s ease-out forwards',
                                    opacity: 0
                                }}
                            >
                                {/* EXAMPLE Badge - Top Right */}
                                <div className="absolute top-3 right-3 z-10">
                                    <div className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${colors.gradient} text-white text-xs font-bold uppercase tracking-wider shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                                        Example
                                    </div>
                                </div>

                                {/* Gradient Background Overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>

                                {/* Top Border Accent */}
                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>

                                <div className="relative space-y-4">
                                    {/* Category Badge & Icon */}
                                    <div className="flex items-center justify-between">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`}>
                                            {doc.category}
                                        </span>
                                        <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border ${colors.border}`}>
                                            <FileText className={`w-6 h-6 ${colors.text}`} />
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3 className={`text-2xl font-bold text-slate-100 group-hover:text-white transition-colors duration-300`}>
                                        {doc.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 group-hover:text-slate-300 transition-colors duration-300">
                                        {doc.description}
                                    </p>

                                    {/* Click to Open Button - More Prominent */}
                                    <div className="pt-4">
                                        <div className={`flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r ${colors.gradient} rounded-lg text-white font-bold text-sm shadow-lg group-hover:shadow-2xl ${colors.glow} transform group-hover:translate-y-[-2px] transition-all duration-300`}>
                                            <ExternalLink className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                                            <span>CLICK TO OPEN DOCUMENT</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Hover Glow Effect - Stronger */}
                                <div className={`absolute -inset-1 bg-gradient-to-r ${colors.gradient} rounded-2xl blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300 -z-10`}></div>

                                {/* Cursor Hint - Pulse on Hover */}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                    <MousePointerClick className={`w-8 h-8 ${colors.text} animate-pulse`} />
                                </div>
                            </a>
                        );
                    })}
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="max-w-4xl mx-auto mt-20 text-center space-y-6">
                <div className="glass-card rounded-2xl p-8 md:p-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
                        Need Help?
                    </h2>
                    <p className="text-slate-400 text-lg mb-6">
                        Have questions about these examples or want to discuss your own game design ideas? Reach out to us and let's talk!
                    </p>
                    <a
                        href="/contact"
                        className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-violet-500/50 transition-all duration-300 hover:scale-105"
                    >
                        <span>Get In Touch</span>
                        <ExternalLink className="w-5 h-5" />
                    </a>
                </div>
            </div>
        </section>
    );
}
