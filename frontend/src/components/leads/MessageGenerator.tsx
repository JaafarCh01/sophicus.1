"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { leadApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
    Sparkles,
    MessageSquare,
    Copy,
    Check,
    Loader2,
    RefreshCw,
    Send,
} from "lucide-react";

interface MessageGeneratorProps {
    leadId: string;
    leadName: string;
}

type MessageType = 'outreach' | 'follow_up' | 'property_pitch';
type Language = 'english' | 'spanish';
type Tone = 'professional' | 'friendly' | 'enthusiastic';
type Platform = 'whatsapp' | 'email' | 'instagram';

export function MessageGenerator({ leadId, leadName }: MessageGeneratorProps) {
    const [messageType, setMessageType] = useState<MessageType>('outreach');
    const [language, setLanguage] = useState<Language>('english');
    const [tone, setTone] = useState<Tone>('professional');
    const [platform, setPlatform] = useState<Platform>('whatsapp');
    const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        setCopied(false);

        try {
            const result = await leadApi.generateMessage(leadId, {
                type: messageType,
                language,
                tone,
                platform,
            });

            if (result.success) {
                setGeneratedMessage(result.message);
            } else {
                setError(result.error || 'Failed to generate message');
            }
        } catch (err) {
            console.error('Failed to generate message:', err);
            setError('Failed to generate message. Check if OpenAI API key is configured.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!generatedMessage) return;

        try {
            await navigator.clipboard.writeText(generatedMessage);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <Card>
            <div className="flex items-center gap-2 mb-4">
                <Sparkles size={20} className="text-accent" />
                <h3 className="font-semibold text-foreground">AI Message Generator</h3>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <Select
                    label="Message Type"
                    value={messageType}
                    onChange={(e) => setMessageType(e.target.value as MessageType)}
                >
                    <option value="outreach">First Outreach</option>
                    <option value="follow_up">Follow Up</option>
                    <option value="property_pitch">Property Pitch</option>
                </Select>

                <Select
                    label="Language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                >
                    <option value="english">English</option>
                    <option value="spanish">Español</option>
                </Select>

                <Select
                    label="Tone"
                    value={tone}
                    onChange={(e) => setTone(e.target.value as Tone)}
                >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="enthusiastic">Enthusiastic</option>
                </Select>

                <Select
                    label="Platform"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as Platform)}
                >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="instagram">Instagram DM</option>
                </Select>
            </div>

            {/* Generate Button */}
            <Button
                onClick={handleGenerate}
                disabled={loading}
                leftIcon={loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                className="w-full mb-4"
            >
                {loading ? 'Generating...' : 'Generate Message'}
            </Button>

            {/* Error */}
            {error && (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm mb-4">
                    {error}
                </div>
            )}

            {/* Generated Message */}
            {generatedMessage && (
                <div className="space-y-3">
                    <div className="relative">
                        <div className={cn(
                            "p-4 rounded-lg bg-surface border border-border",
                            "text-foreground text-sm whitespace-pre-wrap"
                        )}>
                            {generatedMessage}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-3">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleCopy}
                                leftIcon={copied ? <Check size={14} /> : <Copy size={14} />}
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </Button>

                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleGenerate}
                                leftIcon={<RefreshCw size={14} />}
                                disabled={loading}
                            >
                                Regenerate
                            </Button>
                        </div>
                    </div>

                    {/* Quick Send (placeholder) */}
                    <div className="pt-3 border-t border-border">
                        <p className="text-xs text-muted mb-2">Quick Actions</p>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<MessageSquare size={14} />}
                                onClick={() => {
                                    // Open WhatsApp with message
                                    window.open(`https://wa.me/?text=${encodeURIComponent(generatedMessage)}`, '_blank');
                                }}
                            >
                                Open WhatsApp
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* First time hint */}
            {!generatedMessage && !loading && !error && (
                <div className="text-center py-4 text-muted text-sm">
                    <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                    <p>Generate a personalized message for {leadName.split(' ')[0]}</p>
                </div>
            )}
        </Card>
    );
}
