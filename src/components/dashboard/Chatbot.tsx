'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
};

const INITIAL_MESSAGES: Message[] = [
    {
        id: '1',
        text: "Bonjour ! Je suis votre assistant DropTrend IA. Je peux vous aider à trouver des produits gagnants, analyser des boutiques ou rédiger des descriptions. Comment puis-je vous aider aujourd'hui ?",
        sender: 'ai',
        timestamp: new Date()
    }
];

export default function Chatbot({ userSubscription = 'free' }: { userSubscription?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const PREDEFINED_QUESTIONS = [
        "🏆 Trouver un produit gagnant",
        "🛒 Analyser une boutique",
        "📹 Idées de vidéos TikTok",
        "📝 Rédiger une fiche produit"
    ];

    const generateResponse = (input: string): string => {
        const lowerInput = input.toLowerCase();

        // Intelligent Responses based on Subscription
        if (lowerInput.includes('produit') || lowerInput.includes('winner')) {
            if (userSubscription === 'free') {
                return "J'ai détecté plusieurs produits potentiels dans la niche 'Maison' aujourd'hui. Note : En tant que membre Starter, vous avez accès à 3 winners par jour. Passez Pro pour voir les 20+ produits quotidiens et l'analyse complète.";
            }
            return "Voici le Top 3 du jour : 1. Correcteur de Posture (ROI 3.5), 2. Lampe Galaxie (Viral TikTok), 3. Brosse Vapeur Chat. Voulez-vous que j'analyse l'un d'eux ?";
        }

        if (lowerInput.includes('marge') || lowerInput.includes('prix')) {
            return "Pour une stratégie saine, visez une marge brute d'au moins 20€ ou un x3 sur le prix d'achat. Utilisez notre calculateur de profit intégré dans la fiche produit.";
        }

        if (lowerInput.includes('pub') || lowerInput.includes('ads') || lowerInput.includes('tiktok')) {
            return "Sur TikTok, le 'hook' (les 3 premières secondes) est crucial. Essayez de montrer le problème AVANT la solution. Exemple pour un correcteur de dos : montrez quelqu'un voûté qui a mal, puis le soulagement immédiat.";
        }

        return "Je suis spécialisé en e-commerce. Posez-moi des questions sur le sourcing, le marketing ou l'optimisation de votre boutique.";
    };

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: text,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        setTimeout(() => {
            const responseText = generateResponse(text);
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: responseText,
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1500);
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        sendMessage(inputValue);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isOpen && (
                <Card className="w-80 h-96 mb-4 flex flex-col overflow-hidden shadow-2xl shadow-primary/20 animate-in slide-in-from-bottom-10 fade-in duration-200 bg-card border-border">
                    <div className="bg-primary p-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-white/20 rounded-full">
                                <Bot size={20} className="text-primary-foreground" />
                            </div>
                            <div>
                                <h3 className="font-bold text-primary-foreground text-sm">DropTrend AI</h3>
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    <span className="text-primary-foreground/80 text-xs">En ligne</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/50">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${msg.sender === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                                        : 'bg-card text-foreground rounded-tl-none border border-border shadow-sm'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-card rounded-2xl rounded-tl-none px-4 py-3 border border-border flex gap-1">
                                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="px-4 py-2 bg-muted flex gap-2 overflow-x-auto no-scrollbar border-t border-border">
                        {PREDEFINED_QUESTIONS.map((q, i) => (
                            <button
                                key={i}
                                onClick={() => sendMessage(q)}
                                className="whitespace-nowrap px-3 py-1.5 bg-card hover:bg-muted-foreground/10 border border-border rounded-full text-xs text-muted-foreground transition-colors shadow-sm"
                            >
                                {q}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSendMessage} className="p-3 bg-card border-t border-border flex gap-2">
                        <input
                            type="text"
                            className="flex-1 bg-muted border border-border rounded-full px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                            placeholder="Posez une question..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                        <Button type="submit" size="icon" className="rounded-full w-10 h-10 shrink-0" disabled={!inputValue.trim() || isTyping}>
                            <Send size={16} />
                        </Button>
                    </form>
                </Card>
            )}

            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={`rounded-full w-14 h-14 shadow-lg shadow-blue-600/20 transition-all duration-300 ${isOpen ? 'rotate-90 scale-0 opacity-0 hidden' : 'scale-100 opacity-100'}`}
            >
                <MessageCircle size={28} />
            </Button>
        </div>
    );
}
