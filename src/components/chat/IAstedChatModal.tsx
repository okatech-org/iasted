import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { generateOfficialPDFWithURL } from '@/utils/generateOfficialPDF';
import { documentGenerationService } from '@/services/documentGenerationService';
import {
    Send,
    Loader2,
    X,
    Bot,
    User,
    FileText,
    Download,
    Brain,
    Mic,
    MicOff,
    Navigation,
    Settings,
    FileCheck,
    Trash2,
    Edit,
    Copy,
    MoreVertical,
    RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealtimeVoiceWebRTC, UseRealtimeVoiceWebRTC } from '@/hooks/useRealtimeVoiceWebRTC';
import { DocumentUploadZone } from '@/components/iasted/DocumentUploadZone';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    metadata?: {
        responseStyle?: string;
        documents?: Array<{
            id: string;
            name: string;
            url: string;
            type: string;
        }>;
    };
}

interface IAstedChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    openaiRTC: UseRealtimeVoiceWebRTC;
    pendingDocument?: any;
    onClearPendingDocument?: () => void;
    currentVoice?: 'echo' | 'ash' | 'shimmer';
    systemPrompt?: string;
}

const MessageBubble: React.FC<{
    message: Message;
    onDelete?: (id: string) => void;
    onEdit?: (id: string, newContent: string) => void;
    onCopy?: (content: string) => void;
}> = ({ message, onDelete, onEdit, onCopy }) => {
    const isUser = message.role === 'user';
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(message.content);
    const [showActions, setShowActions] = useState(false);
    const [fullscreenDoc, setFullscreenDoc] = useState<any>(null);
    const [pdfZoom, setPdfZoom] = useState(100);
    const [pdfPage, setPdfPage] = useState(1);
    const { toast } = useToast();

    const handleSaveEdit = () => {
        if (onEdit && editedContent.trim() !== message.content) {
            onEdit(message.id, editedContent.trim());
        }
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditedContent(message.content);
        setIsEditing(false);
    };

    const handleDownloadDocument = (doc: any) => {
        const link = document.createElement('a');
        link.href = doc.url;
        link.download = doc.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({
            title: "📥 Téléchargement",
            description: `${doc.name} téléchargé`,
        });
    };

    const handlePrintDocument = (doc: any) => {
        const printWindow = window.open(doc.url, '_blank');
        if (printWindow) {
            printWindow.onload = () => {
                printWindow.print();
            };
            toast({
                title: "🖨️ Impression",
                description: `Ouverture de ${doc.name} pour impression`,
            });
        } else {
            toast({
                title: "❌ Erreur",
                description: "Impossible d'ouvrir la fenêtre d'impression. Veuillez autoriser les pop-ups.",
                variant: "destructive",
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 group`}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'} relative`}>
                <div className="flex items-start gap-2">
                    {!isUser && (
                        <div className="neu-raised w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-success/10">
                            <Bot className="w-4 h-4 text-success" />
                        </div>
                    )}
                    <div className="flex-1">
                        <div
                            className={`rounded-2xl px-4 py-3 ${isUser
                                ? 'neu-raised bg-primary/10 text-foreground rounded-br-none'
                                : 'neu-inset text-foreground rounded-bl-none'
                                }`}
                        >
                            {isEditing ? (
                                <div className="space-y-2">
                                    <textarea
                                        value={editedContent}
                                        onChange={(e) => setEditedContent(e.target.value)}
                                        className="w-full min-h-[80px] p-2 bg-background/50 border border-border rounded text-sm resize-none"
                                        autoFocus
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={handleCancelEdit}
                                            className="px-3 py-1 text-xs rounded bg-background/50 hover:bg-background transition-colors"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={handleSaveEdit}
                                            className="px-3 py-1 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                        >
                                            Enregistrer
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                            )}

                            {/* Documents attachés avec prévisualisation PDF */}
                            {message.metadata?.documents && message.metadata.documents.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-border/20 space-y-3">
                                    {message.metadata.documents.map((doc) => (
                                        <div key={doc.id} className="space-y-2">
                                            {/* Nom et boutons d'action */}
                                            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-background/50">
                                                <div className="flex items-center gap-2 flex-1">
                                                    <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                                                    <span className="text-xs font-medium truncate">{doc.name}</span>
                                                </div>
                                                <div className="flex gap-1.5">
                                                    <button
                                                        onClick={() => setFullscreenDoc(doc)}
                                                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-background/70 hover:bg-background text-foreground transition-colors"
                                                        title="Plein écran"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5v4m0-4h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownloadDocument(doc)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                        <span className="text-xs font-medium">Télécharger</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Modale plein écran pour PDF */}
                            <AnimatePresence>
                                {fullscreenDoc && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-sm flex flex-col"
                                        onClick={() => setFullscreenDoc(null)}
                                    >
                                        {/* Header */}
                                        <div className="flex items-center justify-between p-4 border-b border-border bg-background/50">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-primary" />
                                                <span className="text-sm font-medium">{fullscreenDoc.name}</span>
                                            </div>

                                            {/* Contrôles */}
                                            <div className="flex items-center gap-4">
                                                {/* Zoom */}
                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/70 border border-border">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setPdfZoom(prev => Math.max(50, prev - 25));
                                                        }}
                                                        className="p-1 hover:bg-muted rounded transition-colors"
                                                        title="Zoom arrière"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                                                        </svg>
                                                    </button>
                                                    <span className="text-xs font-medium min-w-[3rem] text-center">{pdfZoom}%</span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setPdfZoom(prev => Math.min(200, prev + 25));
                                                        }}
                                                        className="p-1 hover:bg-muted rounded transition-colors"
                                                        title="Zoom avant"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setPdfZoom(100);
                                                        }}
                                                        className="p-1 hover:bg-muted rounded transition-colors ml-1"
                                                        title="Réinitialiser"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                {/* Pagination */}
                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/70 border border-border">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setPdfPage(prev => Math.max(1, prev - 1));
                                                        }}
                                                        className="p-1 hover:bg-muted rounded transition-colors"
                                                        title="Page précédente"
                                                        disabled={pdfPage === 1}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                        </svg>
                                                    </button>
                                                    <span className="text-xs font-medium min-w-[4rem] text-center">Page {pdfPage}</span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setPdfPage(prev => prev + 1);
                                                        }}
                                                        className="p-1 hover:bg-muted rounded transition-colors"
                                                        title="Page suivante"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePrintDocument(fullscreenDoc);
                                                    }}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background hover:bg-muted transition-colors"
                                                    title="Imprimer"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                    </svg>
                                                    <span className="text-sm font-medium">Imprimer</span>
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDownloadDocument(fullscreenDoc);
                                                    }}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    <span className="text-sm font-medium">Télécharger</span>
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setFullscreenDoc(null);
                                                        setPdfZoom(100);
                                                        setPdfPage(1);
                                                    }}
                                                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-background hover:bg-muted transition-colors"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* PDF Viewer avec object au lieu d'iframe */}
                                        <div className="flex-1 p-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                                            <object
                                                data={`${fullscreenDoc.url}#page=${pdfPage}&zoom=${pdfZoom}`}
                                                type="application/pdf"
                                                className="w-full h-full rounded-lg border border-border bg-background"
                                                style={{ transform: `scale(${pdfZoom / 100})`, transformOrigin: 'top center' }}
                                            >
                                                <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
                                                    <FileText className="w-16 h-16 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-lg font-medium mb-2">Prévisualisation non disponible</p>
                                                        <p className="text-sm text-muted-foreground mb-4">
                                                            Votre navigateur ne peut pas afficher ce PDF directement.
                                                        </p>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDownloadDocument(fullscreenDoc);
                                                            }}
                                                            className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                                        >
                                                            Télécharger le PDF
                                                        </button>
                                                    </div>
                                                </div>
                                            </object>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/20">
                                <span className="text-xs opacity-70">
                                    {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                        </div>

                        {/* Actions au survol */}
                        <AnimatePresence>
                            {showActions && !isEditing && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="absolute -top-2 right-0 flex gap-1 bg-background border border-border rounded-lg shadow-lg p-1"
                                >
                                    {isUser && onEdit && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="p-1.5 hover:bg-primary/10 rounded transition-colors"
                                            title="Éditer"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                        </button>
                                    )}

                                    {onCopy && (
                                        <button
                                            onClick={() => onCopy(message.content)}
                                            className="p-1.5 hover:bg-primary/10 text-primary rounded transition-colors"
                                            title="Copier"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={() => onDelete(message.id)}
                                            className="p-1.5 hover:bg-destructive/10 text-destructive rounded transition-colors"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    {isUser && (
                        <div className="neu-raised w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10">
                            <User className="w-4 h-4 text-primary" />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export const IAstedChatModal: React.FC<IAstedChatModalProps> = ({
    isOpen,
    onClose,
    openaiRTC,
    pendingDocument,
    onClearPendingDocument,
    currentVoice,
    systemPrompt
}) => {
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [selectedVoice, setSelectedVoice] = useState<'echo' | 'ash' | 'shimmer'>(() => {
        return currentVoice || (localStorage.getItem('iasted-voice-selection') as 'echo' | 'ash' | 'shimmer') || 'ash';
    });

    useEffect(() => {
        if (currentVoice && currentVoice !== selectedVoice) {
            setSelectedVoice(currentVoice);
        }
    }, [currentVoice]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const navigate = useNavigate();
    const { setTheme } = useTheme();

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                if (!openaiRTC.isConnected) {
                    openaiRTC.connect(selectedVoice);
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isOpen, selectedVoice]);

    useEffect(() => {
        if (openaiRTC.messages.length > 0) {
            const lastMsg = openaiRTC.messages[openaiRTC.messages.length - 1];
            setMessages(prev => {
                const existing = prev.find(m => m.id === lastMsg.id);
                if (!existing) {
                    return [...prev, lastMsg];
                }
                return prev.map(m => m.id === lastMsg.id ? lastMsg : m);
            });
        }
    }, [openaiRTC.messages]);

    const handleDeleteMessage = async (messageId: string) => {
        try {
            setMessages(prev => prev.filter(m => m.id !== messageId));
            if (sessionId) {
                const { error } = await supabase
                    .from('conversation_messages')
                    .delete()
                    .eq('id', messageId);
                if (error) console.error('Erreur suppression message:', error);
            }
            toast({ title: "Message supprimé", duration: 2000 });
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const handleEditMessage = async (messageId: string, newContent: string) => {
        try {
            setMessages(prev => prev.map(m =>
                m.id === messageId ? { ...m, content: newContent } : m
            ));
            if (sessionId) {
                const { error } = await supabase
                    .from('conversation_messages')
                    .update({ content: newContent })
                    .eq('id', messageId);
                if (error) console.error('Erreur modification message:', error);
            }
            toast({ title: "Message modifié", duration: 2000 });
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const handleCopyMessage = (content: string) => {
        navigator.clipboard.writeText(content);
        toast({ title: "📋 Copié", description: "Message copié dans le presse-papiers", duration: 2000 });
    };

    const handleClearConversation = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer toute la conversation ?')) {
            setMessages([]);
            openaiRTC.clearSession();
            if (sessionId) {
                const { error: deleteError } = await supabase
                    .from('conversation_messages')
                    .delete()
                    .eq('session_id', sessionId);
                if (deleteError) console.error('Erreur suppression messages:', deleteError);

                const { error: updateError } = await supabase
                    .from('conversation_sessions')
                    .update({
                        ended_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', sessionId);
                if (updateError) console.error('Erreur mise à jour session:', updateError);
            }
            toast({ title: "Conversation effacée", duration: 2000 });
        }
    };

    const handleNewConversation = async () => {
        setMessages([]);
        const newSessionId = crypto.randomUUID();
        setSessionId(newSessionId);
        await supabase.from('conversation_sessions').insert({
            session_id: newSessionId,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            started_at: new Date().toISOString(),
        });
        toast({ title: "✨ Nouvelle conversation", duration: 2000 });
    };

    useEffect(() => {
        if (isOpen) {
            initializeSession();
        }
    }, [isOpen]);

    useEffect(() => {
        if (pendingDocument && onClearPendingDocument) {
            console.log('📄 [IAstedChatModal] Génération de document depuis voix:', pendingDocument);
            const toolCall = {
                function: {
                    name: 'generate_document',
                    arguments: JSON.stringify({
                        type: pendingDocument.type,
                        recipient: pendingDocument.recipient,
                        subject: pendingDocument.subject,
                        content_points: pendingDocument.contentPoints,
                        format: pendingDocument.format || 'pdf',
                        service_context: pendingDocument.serviceContext
                    })
                }
            };
            executeToolCall(toolCall);
            onClearPendingDocument();
        }
    }, [pendingDocument, onClearPendingDocument]);

    useEffect(() => {
        const handleClearEvent = () => {
            handleClearConversation();
        };
        window.addEventListener('iasted-clear-history', handleClearEvent);
        return () => window.removeEventListener('iasted-clear-history', handleClearEvent);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const initializeSession = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // Fallback for demo/dev if no user
                console.warn('Utilisateur non authentifié, mode démo');
                setSessionId('demo-session');
                return;
            }

            const { data: existingSession } = await supabase
                .from('conversation_sessions')
                .select('*')
                .eq('user_id', user.id)
                .is('ended_at', null)
                .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
                .order('updated_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (existingSession) {
                setSessionId(existingSession.id);
                await loadSessionMessages(existingSession.id);
            } else {
                const { data: newSession, error } = await supabase
                    .from('conversation_sessions')
                    .insert({
                        user_id: user.id,
                        settings: { mode: 'text' },
                        focus_mode: null,
                    })
                    .select()
                    .single();

                if (error) throw error;
                setSessionId(newSession.id);

                const greetingMessage: Message = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: `Bonjour Monsieur le Président,\n\nJe suis iAsted, votre assistant stratégique. Comment puis-je vous aider aujourd'hui ?`,
                    timestamp: new Date().toISOString(),
                    metadata: { responseStyle: 'strategique' },
                };
                setMessages([greetingMessage]);
                await saveMessage(newSession.id, greetingMessage);
            }
        } catch (error) {
            console.error('❌ [IAstedChatModal] Erreur initialisation:', error);
        }
    };

    const loadSessionMessages = async (sessionId: string) => {
        const { data: msgs, error } = await supabase
            .from('conversation_messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });

        if (!error && msgs) {
            setMessages(msgs.map(m => ({
                id: m.id,
                role: m.role as 'user' | 'assistant',
                content: m.content,
                timestamp: m.created_at,
            })));
        }
    };

    const executeToolCall = async (toolCall: any) => {
        try {
            const args = JSON.parse(toolCall.function.arguments);
            switch (toolCall.function.name) {
                case 'navigate_app':
                    toast({ title: "Navigation", description: `Redirection vers ${args.route}...`, duration: 2000 });
                    navigate(args.route);
                    break;
                case 'generate_document':
                    const requestedFormat = args.format || 'pdf';
                    try {
                        let blob: Blob, url: string, filename: string;
                        if (requestedFormat === 'docx') {
                            const { Document, Paragraph, AlignmentType, HeadingLevel, Packer } = await import('docx');
                            const doc = new Document({
                                sections: [{
                                    properties: {},
                                    children: [
                                        new Paragraph({ text: "RÉPUBLIQUE GABONAISE", heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
                                        new Paragraph({ text: args.subject, heading: HeadingLevel.HEADING_2, alignment: AlignmentType.CENTER }),
                                    ],
                                }],
                            });
                            blob = await Packer.toBlob(doc);
                            filename = `${args.type}_${args.recipient}_${Date.now()}.docx`;
                            url = URL.createObjectURL(blob);
                        } else {
                            const pdfResult = await generateOfficialPDFWithURL({ ...args });
                            blob = pdfResult.blob;
                            url = pdfResult.url;
                            filename = pdfResult.filename;
                        }
                        const docPreview = {
                            id: crypto.randomUUID(),
                            name: filename,
                            url: url,
                            type: requestedFormat === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf',
                        };
                        const docMessage: Message = {
                            id: crypto.randomUUID(),
                            role: 'assistant',
                            content: `Document généré : ${filename}`,
                            timestamp: new Date().toISOString(),
                            metadata: { responseStyle: 'strategique', documents: [docPreview] },
                        };
                        setMessages(prev => [...prev, docMessage]);
                        toast({ title: "📄 Document généré", duration: 3000 });
                    } catch (error) {
                        console.error('❌ [generatePDF] Erreur:', error);
                        toast({ title: "Erreur de génération", variant: "destructive" });
                    }
                    break;
                case 'manage_system_settings':
                    if (args.setting === 'theme') {
                        setTheme(args.value);
                        toast({ title: "Thème changé", description: `Nouveau thème: ${args.value}` });
                    }
                    break;
                default:
                    console.warn('⚠️ [executeToolCall] Outil non reconnu:', toolCall.function.name);
            }
        } catch (error) {
            console.error('❌ [executeToolCall] Erreur:', error);
        }
    };

    const saveMessage = async (sessionId: string, message: Message) => {
        try {
            const { error } = await supabase
                .from('conversation_messages')
                .insert({
                    session_id: sessionId,
                    role: message.role,
                    content: message.content,
                    metadata: message.metadata || {},
                });
            if (error) throw error;
        } catch (error) {
            console.error('❌ [saveMessage] Erreur:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!inputText.trim() || isProcessing) return;

        const userContent = inputText.trim();
        setInputText('');
        setIsProcessing(true);

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: userContent,
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMessage]);
        if (sessionId) await saveMessage(sessionId, userMessage);

        const assistantMessageId = crypto.randomUUID();
        const assistantMessage: Message = {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMessage]);

        try {
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({
                    messages: [
                        ...messages.map(m => ({ role: m.role, content: m.content })),
                        { role: 'user', content: userContent }
                    ]
                }),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (reader) {
                let accumulatedContent = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const dataStr = line.slice(6);
                            if (dataStr === '[DONE]') continue;

                            try {
                                const data = JSON.parse(dataStr);
                                const content = data.choices?.[0]?.delta?.content || '';
                                if (content) {
                                    accumulatedContent += content;
                                    setMessages(prev => prev.map(m =>
                                        m.id === assistantMessageId
                                            ? { ...m, content: accumulatedContent }
                                            : m
                                    ));
                                }
                            } catch (e) {
                                console.error('Error parsing SSE data:', e);
                            }
                        }
                    }
                }

                if (sessionId) {
                    await saveMessage(sessionId, { ...assistantMessage, content: accumulatedContent });
                }
            }

        } catch (error) {
            console.error('Error chat:', error);
            toast({ title: "Erreur", description: "Impossible d'envoyer le message", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    useEffect(() => {
        return () => {
            if (openaiRTC.isConnected) {
                openaiRTC.disconnect();
            }
        };
    }, [openaiRTC.isConnected]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="neu-card w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden bg-background rounded-2xl shadow-xl"
            >
                {/* Header */}
                <div className="neu-card p-6 rounded-t-2xl rounded-b-none border-b border-border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="neu-raised w-14 h-14 rounded-full flex items-center justify-center p-3 bg-primary/10">
                                <Brain className="w-7 h-7 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-foreground">iAsted - Chat Stratégique</h2>
                                <p className="text-sm text-muted-foreground">Agent de Commande Totale</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={handleNewConversation} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-primary/10 transition-colors rounded-md">
                                <RefreshCw className="w-4 h-4" /> <span className="hidden sm:inline">Nouvelle</span>
                            </button>
                            <button onClick={handleClearConversation} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-destructive/10 text-destructive transition-colors rounded-md">
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-all">
                                <X className="w-5 h-5 text-foreground" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <AnimatePresence>
                        {messages.map((message) => (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                onDelete={handleDeleteMessage}
                                onEdit={handleEditMessage}
                                onCopy={handleCopyMessage}
                            />
                        ))}
                    </AnimatePresence>
                    {isProcessing && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">iAsted réfléchit...</span>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-border bg-background/50 backdrop-blur-md flex items-end gap-2">
                    <button
                        onClick={() => openaiRTC.toggleConversation(selectedVoice)}
                        className={`p-4 rounded-xl hover:shadow-lg transition-all ${openaiRTC.isConnected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                        title={openaiRTC.isConnected ? 'Arrêter le mode vocal' : 'Activer le mode vocal'}
                    >
                        {openaiRTC.isConnected ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6 text-primary" />}
                    </button>

                    <div className="flex-1 relative">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder={openaiRTC.isConnected ? `🎙️ Mode vocal actif` : "Posez votre question à iAsted..."}
                            className="w-full rounded-xl p-4 pr-12 bg-background border border-border resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[60px] max-h-[120px]"
                            rows={1}
                            disabled={isProcessing || openaiRTC.isConnected}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputText.trim() || isProcessing || openaiRTC.isConnected}
                            className="absolute right-2 bottom-2 p-2 rounded-lg hover:bg-primary/10 text-primary disabled:opacity-50 transition-colors"
                        >
                            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
