"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Send,
    Paperclip,
    Smile,
    MoreVertical,
    Phone,
    Video,
    Star,
    Archive,
    Trash2,
    Filter,
    Plus,
    Check,
    CheckCheck,
    Sparkles,
    MessageSquare,
    Clock,
} from "lucide-react";
import Image from "next/image";

// Mock conversations data
const conversations = [
    {
        id: "1",
        lead: {
            name: "Sarah Johnson",
            avatar: null,
            status: "online",
        },
        lastMessage: "I'm very interested in the beachfront property in Playa del Carmen. Can we schedule a viewing?",
        timestamp: "2 min ago",
        unread: 2,
        source: "whatsapp",
        starred: true,
    },
    {
        id: "2",
        lead: {
            name: "Michael Chen",
            avatar: null,
            status: "offline",
        },
        lastMessage: "Thanks for the brochure. I'll review it with my partner and get back to you.",
        timestamp: "1 hour ago",
        unread: 0,
        source: "instagram",
        starred: false,
    },
    {
        id: "3",
        lead: {
            name: "Emma Williams",
            avatar: null,
            status: "online",
        },
        lastMessage: "What's the expected ROI for the Tulum pre-sale properties?",
        timestamp: "3 hours ago",
        unread: 1,
        source: "whatsapp",
        starred: true,
    },
    {
        id: "4",
        lead: {
            name: "David Martinez",
            avatar: null,
            status: "offline",
        },
        lastMessage: "I'll be in Cancun next week. Would love to see some properties.",
        timestamp: "Yesterday",
        unread: 0,
        source: "email",
        starred: false,
    },
    {
        id: "5",
        lead: {
            name: "Lisa Anderson",
            avatar: null,
            status: "away",
        },
        lastMessage: "Can you send me more information about financing options?",
        timestamp: "2 days ago",
        unread: 0,
        source: "website",
        starred: false,
    },
];

// Mock messages for selected conversation
const mockMessages = [
    {
        id: "1",
        sender: "lead",
        content: "Hi! I saw your listing for the beachfront condo in Playa del Carmen. It looks amazing!",
        timestamp: "10:30 AM",
        status: "read",
    },
    {
        id: "2",
        sender: "agent",
        content: "Hello Sarah! Thank you for your interest. Yes, it's one of our most popular properties. Would you like me to send you more details?",
        timestamp: "10:32 AM",
        status: "read",
    },
    {
        id: "3",
        sender: "lead",
        content: "Yes please! I'm particularly interested in the investment potential. What's the rental income like?",
        timestamp: "10:35 AM",
        status: "read",
    },
    {
        id: "4",
        sender: "agent",
        content: "Great question! This unit generates approximately $2,500-3,500 USD per month in rental income during high season. The annual ROI is around 8-10%. I can send you the detailed financial projections.",
        timestamp: "10:38 AM",
        status: "read",
    },
    {
        id: "5",
        sender: "lead",
        content: "That sounds promising! I'm very interested in the beachfront property in Playa del Carmen. Can we schedule a viewing?",
        timestamp: "10:45 AM",
        status: "delivered",
    },
];

// Quick reply suggestions
const quickReplies = [
    "I'd be happy to schedule a viewing!",
    "Let me send you the property brochure",
    "What's your budget range?",
    "When are you planning to visit?",
];

// Message templates
const messageTemplates = [
    { id: "1", name: "Welcome Message", preview: "Welcome! I'm excited to help you find..." },
    { id: "2", name: "Property Info Request", preview: "Thank you for your interest! To better assist..." },
    { id: "3", name: "Viewing Confirmation", preview: "Your viewing is confirmed for..." },
    { id: "4", name: "Follow-up", preview: "I wanted to follow up on our conversation..." },
];

export default function MessagesPage() {
    const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
    const [messageInput, setMessageInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showTemplates, setShowTemplates] = useState(false);
    const [filter, setFilter] = useState<"all" | "unread" | "starred">("all");

    const filteredConversations = conversations.filter((conv) => {
        if (filter === "unread" && conv.unread === 0) return false;
        if (filter === "starred" && !conv.starred) return false;
        if (searchQuery && !conv.lead.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const handleSendMessage = () => {
        if (!messageInput.trim()) return;
        // In real implementation, this would send the message
        console.log("Sending message:", messageInput);
        setMessageInput("");
    };

    const getSourceIcon = (source: string) => {
        switch (source) {
            case "whatsapp":
                return "🟢";
            case "instagram":
                return "📸";
            case "email":
                return "📧";
            default:
                return "💬";
        }
    };

    return (
        <MainLayout title="Messages" subtitle="Unified inbox for all lead communications">
            <div className="flex gap-4 h-[calc(100vh-200px)] min-h-[500px] overflow-hidden">
                {/* Conversations List */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-72 flex-shrink-0 flex flex-col min-w-0"
                >
                    <Card padding="none" className="h-full flex flex-col">
                        {/* Search & Filter */}
                        <div className="p-4 border-b border-border space-y-3">
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-surface rounded-lg border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-brand"
                                />
                            </div>
                            <div className="flex gap-2">
                                {(["all", "unread", "starred"] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={cn(
                                            "px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize",
                                            filter === f
                                                ? "bg-brand text-white"
                                                : "bg-surface text-muted hover:text-foreground"
                                        )}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Conversations List */}
                        <div className="flex-1 overflow-y-auto min-h-0">
                            {filteredConversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    onClick={() => setSelectedConversation(conv)}
                                    className={cn(
                                        "p-4 border-b border-border cursor-pointer transition-colors",
                                        selectedConversation.id === conv.id
                                            ? "bg-brand/10 border-l-2 border-l-brand"
                                            : "hover:bg-surface-elevated"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="relative">
                                            <Avatar name={conv.lead.name} size="md" />
                                            <span
                                                className={cn(
                                                    "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface",
                                                    conv.lead.status === "online" ? "bg-success" :
                                                        conv.lead.status === "away" ? "bg-warning" : "bg-muted"
                                                )}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-foreground truncate">
                                                    {conv.lead.name}
                                                </span>
                                                <span className="text-xs text-muted flex-shrink-0 ml-2">
                                                    {conv.timestamp}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted truncate flex-1">
                                                    {conv.lastMessage}
                                                </span>
                                                {conv.unread > 0 && (
                                                    <Badge variant="brand" className="flex-shrink-0">
                                                        {conv.unread}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs">{getSourceIcon(conv.source)}</span>
                                                {conv.starred && <Star size={12} className="text-warning fill-warning" />}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </motion.div>

                {/* Chat Area */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex-1 flex flex-col min-w-0 overflow-hidden"
                >
                    <Card padding="none" className="h-full flex flex-col">
                        {/* Chat Header */}
                        <div className="p-4 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar name={selectedConversation.lead.name} size="md" />
                                <div>
                                    <h3 className="font-semibold text-foreground">
                                        {selectedConversation.lead.name}
                                    </h3>
                                    <p className="text-xs text-muted flex items-center gap-1">
                                        <span className={cn(
                                            "w-2 h-2 rounded-full",
                                            selectedConversation.lead.status === "online" ? "bg-success" : "bg-muted"
                                        )} />
                                        {selectedConversation.lead.status === "online" ? "Online" : "Offline"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" leftIcon={<Phone size={16} />} />
                                <Button variant="ghost" size="sm" leftIcon={<Video size={16} />} />
                                <Button variant="ghost" size="sm" leftIcon={<Star size={16} className={selectedConversation.starred ? "fill-warning text-warning" : ""} />} />
                                <Button variant="ghost" size="sm" leftIcon={<MoreVertical size={16} />} />
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                            {mockMessages.map((message) => (
                                <div
                                    key={message.id}
                                    className={cn(
                                        "flex",
                                        message.sender === "agent" ? "justify-end" : "justify-start"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "max-w-[70%] p-3 rounded-2xl",
                                            message.sender === "agent"
                                                ? "bg-brand text-white rounded-br-md"
                                                : "bg-surface-elevated text-foreground rounded-bl-md"
                                        )}
                                    >
                                        <p className="text-sm">{message.content}</p>
                                        <div className={cn(
                                            "flex items-center justify-end gap-1 mt-1",
                                            message.sender === "agent" ? "text-white/70" : "text-muted"
                                        )}>
                                            <span className="text-xs">{message.timestamp}</span>
                                            {message.sender === "agent" && (
                                                message.status === "read" ? (
                                                    <CheckCheck size={14} />
                                                ) : (
                                                    <Check size={14} />
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Quick Replies */}
                        <div className="px-4 py-2 border-t border-border flex gap-2 overflow-x-auto">
                            <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<Sparkles size={14} />}
                                className="flex-shrink-0"
                            >
                                AI Suggest
                            </Button>
                            {quickReplies.map((reply, i) => (
                                <button
                                    key={i}
                                    onClick={() => setMessageInput(reply)}
                                    className="px-3 py-1 bg-surface rounded-full text-xs text-muted hover:text-foreground hover:bg-surface-elevated transition-colors whitespace-nowrap flex-shrink-0"
                                >
                                    {reply}
                                </button>
                            ))}
                        </div>

                        {/* Message Input */}
                        <div className="p-4 border-t border-border">
                            <div className="flex items-end gap-3">
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" leftIcon={<Paperclip size={18} />} />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        leftIcon={<MessageSquare size={18} />}
                                        onClick={() => setShowTemplates(!showTemplates)}
                                    />
                                </div>
                                <div className="flex-1 relative">
                                    <textarea
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder="Type your message..."
                                        rows={1}
                                        className="w-full px-4 py-3 bg-surface rounded-xl border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-brand resize-none"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                    />
                                </div>
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={!messageInput.trim()}
                                    leftIcon={<Send size={18} />}
                                >
                                    Send
                                </Button>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Templates Panel */}
                <AnimatePresence>
                    {showTemplates && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="w-72 flex-shrink-0"
                        >
                            <Card className="h-full">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-foreground">Templates</h3>
                                    <Button variant="ghost" size="sm" leftIcon={<Plus size={14} />}>
                                        New
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {messageTemplates.map((template) => (
                                        <button
                                            key={template.id}
                                            onClick={() => {
                                                setMessageInput(template.preview);
                                                setShowTemplates(false);
                                            }}
                                            className="w-full p-3 text-left bg-surface rounded-lg hover:bg-surface-elevated transition-colors"
                                        >
                                            <p className="font-medium text-foreground text-sm">{template.name}</p>
                                            <p className="text-xs text-muted truncate mt-1">{template.preview}</p>
                                        </button>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </MainLayout>
    );
}
