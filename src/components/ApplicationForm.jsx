import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle, AlertCircle, Send } from 'lucide-react';

export default function ApplicationForm() {
    const [position, setPosition] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error

    // Get position from URL query param on mount
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const pos = searchParams.get('position');
        if (pos) {
            setPosition(pos);
        }
    }, []);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const formData = new FormData();
            formData.append('position', position);
            formData.append('firstName', e.target.firstName.value);
            formData.append('lastName', e.target.lastName.value);
            formData.append('email', e.target.email.value);
            formData.append('portfolio', e.target.portfolio.value);
            formData.append('message', e.target.message.value);

            if (file) {
                formData.append('file', file);
            }

            const response = await fetch('/api/submit-application', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setStatus('success');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                console.error("Submission failed: ", result);
                alert('Something went wrong. Please try again.');
                setStatus('error');
            }
        } catch (error) {
            console.error("Network error: ", error);
            alert('Unable to submit application. Please checking your connection.');
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass p-12 rounded-3xl text-center max-w-lg mx-6 border border-emerald-500/30"
                >
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Application Sent!</h2>
                    <p className="text-slate-400 mb-8 text-lg">
                        Thanks for applying to <strong className="text-white">Nortixlabs</strong>. We've received your application for <span className="text-cyan-400">{position}</span> and will review it shortly.
                    </p>
                    <a href="/" className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">
                        Return Home
                    </a>
                </motion.div>
            </div>
        );
    }

    return (
        <section className="py-24 relative min-h-screen flex items-center justify-center">
            <div className="container mx-auto px-6 max-w-3xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold font-display text-white mb-4">
                        Join the Mission
                    </h1>
                    <p className="text-slate-400">
                        Take the next step in your career. Fill out the form below to apply.
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-8 md:p-12 rounded-3xl border border-white/5 shadow-2xl shadow-violet-900/10"
                >
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Position Field (Auto-filled but editable) */}
                        <div className="space-y-2">
                            <label htmlFor="position" className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Applying For</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="position"
                                    value={position}
                                    onChange={(e) => setPosition(e.target.value)}
                                    placeholder="e.g. UI/UX Artist"
                                    className="w-full px-5 py-4 rounded-xl bg-slate-900/60 border border-white/10 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all outline-none font-medium text-lg"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="firstName" className="text-sm font-semibold text-slate-300 uppercase tracking-wider">First Name</label>
                                <input type="text" id="firstName" className="w-full px-5 py-3 rounded-xl bg-slate-900/60 border border-white/10 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all outline-none" required />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="lastName" className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Last Name</label>
                                <input type="text" id="lastName" className="w-full px-5 py-3 rounded-xl bg-slate-900/60 border border-white/10 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all outline-none" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Email Address</label>
                            <input type="email" id="email" className="w-full px-5 py-3 rounded-xl bg-slate-900/60 border border-white/10 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all outline-none" required />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="portfolio" className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Portfolio / LinkedIn URL</label>
                            <input type="url" id="portfolio" placeholder="https://" className="w-full px-5 py-3 rounded-xl bg-slate-900/60 border border-white/10 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all outline-none" />
                        </div>

                        {/* File Upload Area */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Resume / CV</label>
                            <div
                                className={`relative border-2 border-dashed rounded-xl p-8 transition-all text-center ${dragActive ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 hover:border-white/20 bg-slate-900/30'
                                    }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleChange}
                                    accept=".pdf,.doc,.docx"
                                />
                                <div className="flex flex-col items-center gap-3">
                                    {file ? (
                                        <>
                                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                                <CheckCircle className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{file.name}</p>
                                                <p className="text-sm text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); setFile(null); }}
                                                className="text-xs text-red-400 hover:text-red-300 underline z-10 relative"
                                            >
                                                Remove file
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                                <Upload className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-200">Click to upload or drag and drop</p>
                                                <p className="text-sm text-slate-500">PDF, DOCX (Max 5MB)</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="message" className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Start Note (Optional)</label>
                            <textarea
                                id="message"
                                rows={4}
                                className="w-full px-5 py-3 rounded-xl bg-slate-900/60 border border-white/10 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all outline-none resize-none"
                                placeholder="Tell us a bit about yourself..."
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'submitting'}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {status === 'submitting' ? 'Submitting...' : <>Submit Application <Send className="w-5 h-5" /></>}
                        </button>
                    </form>
                </motion.div>
            </div>
        </section>
    );
}
