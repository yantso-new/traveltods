"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button, Input } from '@/components/ui';
import { X, Sparkles, Rocket, Users } from 'lucide-react';

interface WaitlistModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [mounted, setMounted] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Ensure portal only renders on client
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
        }
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Close on backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);
        // Simulate API call - replace with actual waitlist API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSubmitting(false);
        setIsSubmitted(true);
    };

    const handleClose = () => {
        onClose();
        // Reset state after animation
        setTimeout(() => {
            setEmail('');
            setIsSubmitted(false);
        }, 300);
    };

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="waitlist-modal-title"
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" />

            {/* Modal */}
            <div
                ref={modalRef}
                className="relative w-full max-w-md bg-surface-light rounded-3xl shadow-2xl animate-scaleIn overflow-hidden"
            >
                {/* Decorative gradient header */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-primary via-primary-dark to-secondary opacity-90" />

                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all text-white"
                    aria-label="Close modal"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="relative pt-16 px-8 pb-8">
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                            <Users className="w-10 h-10 text-primary" />
                        </div>
                    </div>

                    {!isSubmitted ? (
                        <>
                            {/* Header */}
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/40 border border-white/20 backdrop-blur-md text-xs font-extrabold mb-3">
                                    <Sparkles className="w-3 h-3" />
                                    Coming Soon
                                </div>
                                <h2
                                    id="waitlist-modal-title"
                                    className="text-2xl md:text-3xl font-black text-text-main-light mb-2"
                                >
                                    Join the Waitlist
                                </h2>
                                <p className="text-text-sub-light text-sm leading-relaxed">
                                    Our community is launching soon! Be among the first{' '}
                                    <span className="font-bold text-primary">Pioneer Members</span>{' '}
                                    to get exclusive early access when we start rolling out invites.
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Input
                                        type="email"
                                        placeholder="Enter your email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-14 text-base rounded-2xl border-orange-100 focus:border-primary bg-white"
                                        aria-label="Email address"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full h-14 rounded-2xl text-base font-bold"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Joining...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <Rocket className="w-5 h-5" />
                                            Join the Pioneers
                                        </span>
                                    )}
                                </Button>
                            </form>

                            {/* Footer note */}
                            <p className="text-center text-xs text-text-sub-light mt-4">
                                We&apos;ll send you an invite once we start rolling out access. No spam, ever.
                            </p>
                        </>
                    ) : (
                        /* Success State */
                        <div className="text-center py-4">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/20 flex items-center justify-center">
                                <svg className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-text-main-light mb-2">
                                You&apos;re on the list!
                            </h3>
                            <p className="text-text-sub-light text-sm mb-6">
                                We&apos;ll send an exclusive invite to <span className="font-semibold text-primary">{email}</span> when we start rolling out access to Pioneer Members.
                            </p>
                            <Button
                                variant="outline"
                                className="rounded-2xl"
                                onClick={handleClose}
                            >
                                Got it, thanks!
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
