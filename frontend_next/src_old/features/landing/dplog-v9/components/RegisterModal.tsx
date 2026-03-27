'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const RegisterModal = ({ isOpen, onClose }: RegisterModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                    />

                    {/* Modal Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-neutral-900 z-[70] border-l border-white/10 flex flex-col"
                    >
                        <div className="flex items-center justify-between p-8 border-b border-white/10">
                            <h2 className="text-2xl font-serif text-white">REGISTER</h2>
                            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            <p className="text-white/60 font-light text-sm leading-relaxed">
                                관심고객으로 등록하시면 분양 일정 및 상품 관련 정보를<br/>
                                가장 먼저 받아보실 수 있습니다.
                            </p>

                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div className="space-y-2">
                                    <label className="text-xs text-gold-400 tracking-widest uppercase">Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-black/50 border border-white/20 px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors"
                                        placeholder="이름을 입력해주세요"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-gold-400 tracking-widest uppercase">Phone</label>
                                    <input 
                                        type="tel" 
                                        className="w-full bg-black/50 border border-white/20 px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors"
                                        placeholder="휴대폰 번호를 입력해주세요"
                                    />
                                </div>

                                <div className="space-y-4 pt-4">
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input type="checkbox" className="peer sr-only" />
                                            <div className="w-5 h-5 border border-white/30 peer-checked:bg-gold-500 peer-checked:border-gold-500 transition-all" />
                                        </div>
                                        <span className="text-xs text-white/50 group-hover:text-white/80 transition-colors leading-tight">
                                            개인정보 수집 및 이용에 동의합니다. (필수)
                                        </span>
                                    </label>
                                </div>

                                <button className="w-full bg-white text-black font-bold py-4 hover:bg-gold-500 hover:text-white transition-all duration-300 mt-8 tracking-widest text-sm">
                                    SUBMIT
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
