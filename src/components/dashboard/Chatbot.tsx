'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MessageCircle, X, Send, Bot, Sparkles, Loader2 } from 'lucide-react';

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
};

const INITIAL_MESSAGE: Message = {
    id: '1',
    role: 'assistant',
    content: "Bonjour ! 👋 Je suis votre assistant DropTrend IA. Je peux vous aider à:\n\n🏆 Trouver des produits gagnants\n📊 Analyser des niches\n🎯 Conseils marketing TikTok/Facebook\n💰 Optimiser vos marges\n\nComment puis-je vous aider ?",
    timestamp: new Date()
};

const PREDEFINED_QUESTIONS = [
    "🏆 Produit gagnant",
    "📊 Analyser une niche",
    "💡 Idées TikTok",
    "💰 Calculer ma marge"
];

export default function Chatbot({ userSubscription = 'free' }: { userSubscription?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || isTyping) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            // Build message history for API
            const messageHistory = [...messages, userMsg].map(m => ({
                role: m.role,
                content: m.content
            }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: messageHistory })
            });

            if (!response.ok) {
                throw new Error('Erreur API');
            }

            const data = await response.json();

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.message || "Désolé, je n'ai pas pu répondre.",
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "❌ Désolé, une erreur s'est produite. Veuillez réessayer.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        sendMessage(inputValue);
    };

    const handleQuickQuestion = (question: string) => {
        const fullQuestions: Record<string, string> = {
            "🏆 Produit gagnant": "Quels sont les critères d'un produit gagnant en dropshipping ? Donne-moi des exemples de niches tendance.",
            "📊 Analyser une niche": "Comment analyser une niche pour savoir si elle est rentable ? Quels indicateurs regarder ?",
            "💡 Idées TikTok": "Donne-moi des idées de contenus TikTok pour promouvoir mes produits en dropshipping.",
            "💰 Calculer ma marge": "Comment calculer correctement ma marge en dropshipping ? Quel multiplicateur utiliser ?"
        };
        sendMessage(fullQuestions[question] || question);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isOpen && (
                <Card className="w-96 h-[500px] mb-4 flex flex-col overflow-hidden shadow-2xl shadow-primary/20 animate-in slide-in-from-bottom-10 fade-in duration-200 bg-card border-border">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Sparkles size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                                    DropTrend AI
                                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">GPT-4</span>
                                </h3>
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    <span className="text-white/80 text-xs">En ligne</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/50">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mr-2 shrink-0">
                                        <Bot size={16} className="text-white" />
                                    </div>
                                )}
                                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                                    : 'bg-card text-foreground rounded-tl-none border border-border shadow-sm'
                                    }`}>
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mr-2">
                                    <Bot size={16} className="text-white" />
                                </div>
                                <div className="bg-card rounded-2xl rounded-tl-none px-4 py-3 border border-border flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin text-blue-500" />
                                    <span className="text-sm text-muted-foreground">Réflexion...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Questions */}
                    <div className="px-4 py-2 bg-muted flex gap-2 overflow-x-auto no-scrollbar border-t border-border">
                        {PREDEFINED_QUESTIONS.map((q, i) => (
                            <button
                                key={i}
                                onClick={() => handleQuickQuestion(q)}
                                disabled={isTyping}
                                className="whitespace-nowrap px-3 py-1.5 bg-card hover:bg-muted-foreground/10 border border-border rounded-full text-xs text-muted-foreground transition-colors shadow-sm disabled:opacity-50"
                            >
                                {q}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-card border-t border-border flex gap-2">
                        <input
                            type="text"
                            className="flex-1 bg-muted border border-border rounded-full px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                            placeholder="Posez une question..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={isTyping}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className="rounded-full w-10 h-10 shrink-0"
                            disabled={!inputValue.trim() || isTyping}
                        >
                            {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        </Button>
                    </form>
                </Card>
            )}

            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={`rounded-full w-14 h-14 shadow-lg shadow-blue-600/30 transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 ${isOpen ? 'rotate-90 scale-0 opacity-0 hidden' : 'scale-100 opacity-100'}`}
            >
                <MessageCircle size={28} />
            </Button>
        </div>
    );
}
