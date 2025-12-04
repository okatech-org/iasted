import React, { useMemo, useState, useEffect } from 'react';
import { IAstedChatModal } from '@/components/iasted/IAstedChatModal';
import IAstedButtonFull from "@/components/iasted/IAstedButtonFull";
import { useRealtimeVoiceWebRTC } from '@/hooks/useRealtimeVoiceWebRTC';
import { IASTED_SYSTEM_PROMPT } from '@/config/iasted-config';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from 'next-themes';
import { useNavigate, useLocation } from 'react-router-dom';
import { resolveRoute } from '@/utils/route-mapping';

interface IAstedInterfaceProps {
    userRole?: string;
    defaultOpen?: boolean;
    isOpen?: boolean;
    onClose?: () => void;
    onToolCall?: (toolName: string, args: any) => void;
}

/**
 * Complete IAsted Agent Interface.
 * Includes the floating button and the chat modal.
 */
export default function IAstedInterface({ userRole = 'user', defaultOpen = false, isOpen: controlledIsOpen, onClose: controlledOnClose, onToolCall }: IAstedInterfaceProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);

    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
    const setIsOpen = controlledOnClose ? (value: boolean) => {
        if (!value) controlledOnClose();
    } : setInternalIsOpen;

    const [selectedVoice, setSelectedVoice] = useState<'echo' | 'ash' | 'shimmer'>('ash');
    const [pendingDocument, setPendingDocument] = useState<any>(null);
    const { setTheme, theme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const savedVoice = localStorage.getItem('iasted-voice-selection');
        const validVoices = ['ash', 'shimmer', 'echo', 'alloy', 'ballad', 'coral', 'sage', 'verse'];

        if (savedVoice && validVoices.includes(savedVoice)) {
            setSelectedVoice(savedVoice as any);
        } else if (savedVoice) {
            console.warn(`⚠️ [IAstedInterface] Invalid voice '${savedVoice}' found in storage. Resetting to 'ash'.`);
            localStorage.setItem('iasted-voice-selection', 'ash');
            setSelectedVoice('ash');
        }
    }, []);

    const timeOfDay = useMemo(() => {
        const hour = new Date().getHours();
        return hour >= 5 && hour < 18 ? "Bonjour" : "Bonsoir";
    }, []);

    const userTitle = useMemo(() => {
        switch (userRole) {
            case 'president':
                return 'Excellence Monsieur le Président';
            case 'admin':
                return 'Administrateur';
            case 'moderator':
                return 'Modérateur';
            default:
                return 'Monsieur';
        }
    }, [userRole]);

    const formattedSystemPrompt = useMemo(() => {
        return IASTED_SYSTEM_PROMPT
            .replace(/{USER_TITLE}/g, userTitle)
            .replace(/{CURRENT_TIME_OF_DAY}/g, timeOfDay)
            .replace(/{APPELLATION_COURTE}/g, userTitle.split(' ').slice(-1)[0] || 'Monsieur');
    }, [timeOfDay, userTitle]);

    const openaiRTC = useRealtimeVoiceWebRTC(async (toolName, args) => {
        console.log(`🔧 [IAstedInterface] Tool call: ${toolName}`, args);

        if (toolName === 'change_voice') {
            console.log('🎙️ [IAstedInterface] Changement de voix demandé');

            if (args.voice_id) {
                setSelectedVoice(args.voice_id as any);
                toast.success(`Voix modifiée : ${args.voice_id === 'ash' ? 'Homme (Ash)' : args.voice_id === 'shimmer' ? 'Femme (Shimmer)' : 'Standard (Echo)'}`);
            } else {
                const currentVoice = selectedVoice;
                const isCurrentlyMale = currentVoice === 'ash' || currentVoice === 'echo';
                const newVoice = isCurrentlyMale ? 'shimmer' : 'ash';

                console.log(`🎙️ [IAstedInterface] Alternance voix: ${currentVoice} -> ${newVoice}`);
                setSelectedVoice(newVoice);
                toast.success(`Voix changée : ${newVoice === 'shimmer' ? 'Femme (Shimmer)' : 'Homme (Ash)'}`);
            }

            return { success: true, message: `Voix modifiée` };
        }

        if (toolName === 'logout_user') {
            console.log('👋 [IAstedInterface] Déconnexion demandée');
            toast.info("Déconnexion en cours...");
            setTimeout(async () => {
                await supabase.auth.signOut();
                window.location.href = '/';
            }, 1500);
        }

        if (toolName === 'open_chat') {
            setIsOpen(true);
        }

        if (toolName === 'close_chat') {
            setIsOpen(false);
        }

        if (toolName === 'generate_document') {
            console.log('📝 [IAstedInterface] Génération document:', args);
            setPendingDocument({
                type: args.type,
                recipient: args.recipient,
                subject: args.subject,
                contentPoints: args.content_points || [],
                format: args.format || 'pdf'
            });
            setIsOpen(true);
            toast.success(`Génération de ${args.type} pour ${args.recipient}...`);
        }

        if (toolName === 'control_ui') {
            console.log('🎨 [IAstedInterface] Contrôle UI:', args);

            if (args.action === 'set_theme_dark') {
                setTheme('dark');
                setTimeout(() => toast.success("Mode sombre activé"), 100);
                return { success: true, message: 'Mode sombre activé' };
            } else if (args.action === 'set_theme_light') {
                setTheme('light');
                setTimeout(() => toast.success("Mode clair activé"), 100);
                return { success: true, message: 'Mode clair activé' };
            } else if (args.action === 'toggle_theme') {
                const newTheme = theme === 'dark' ? 'light' : 'dark';
                setTheme(newTheme);
                setTimeout(() => toast.success(`Thème basculé vers ${newTheme === 'dark' ? 'sombre' : 'clair'}`), 100);
                return { success: true, message: `Thème basculé` };
            }

            if (args.action === 'toggle_sidebar') {
                window.dispatchEvent(new CustomEvent('iasted-sidebar-toggle'));
                return { success: true, message: 'Sidebar basculée' };
            }

            if (args.action === 'set_speech_rate') {
                const rate = parseFloat(args.value || '1.0');
                const clampedRate = Math.max(0.5, Math.min(2.0, rate));
                openaiRTC.setSpeechRate(clampedRate);
                setTimeout(() => toast.success(`Vitesse ajustée (${clampedRate}x)`), 100);
                return { success: true, message: `Vitesse ajustée à ${clampedRate}x` };
            }
        }

        if (toolName === 'navigate_to_section') {
            console.log('📍 [IAstedInterface] Navigation locale:', args);
            const sectionId = args.section_id;
            if (sectionId) {
                const element = document.getElementById(sectionId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    toast.success(`Section ${sectionId} affichée`);
                    return { success: true, message: `Section ${sectionId} affichée` };
                }

                const navEvent = new CustomEvent('iasted-navigate-section', { detail: { sectionId } });
                window.dispatchEvent(navEvent);
                return { success: true, message: `Navigation vers ${sectionId} demandée` };
            }
        }

        if (toolName === 'navigate_app') {
            console.log('🌍 [IAstedInterface] Navigation:', args);
            if (args.route) {
                navigate(args.route);
                toast.success(`Navigation vers ${args.route}`);

                if (args.module_id) {
                    setTimeout(() => {
                        const element = document.getElementById(args.module_id);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }, 500);
                }
            }
        }

        if (toolName === 'global_navigate') {
            console.log('🌍 [IAstedInterface] Navigation Globale:', args);
            const resolvedPath = resolveRoute(args.query);

            if (resolvedPath) {
                navigate(resolvedPath);
                toast.success(`Navigation vers ${resolvedPath}`);
                return { success: true, message: `Navigation vers ${resolvedPath} effectuée` };
            } else {
                toast.error(`Impossible de trouver la route pour "${args.query}"`);
                return { success: false, message: `Route "${args.query}" introuvable` };
            }
        }

        if (toolName === 'browse_url' || toolName === 'search_web') {
            const event = new CustomEvent('iasted-agent-action', {
                detail: { action: 'browse_url', data: { url: args.url || 'https://google.com' } }
            });
            window.dispatchEvent(event);
        }

        if (toolName === 'preview_component' || toolName === 'generate_ui') {
            const event = new CustomEvent('iasted-agent-action', {
                detail: { action: 'preview_component', data: { componentName: args.component_name || 'New Component' } }
            });
            window.dispatchEvent(event);
        }

        if (onToolCall) {
            onToolCall(toolName, args);
        }
    });

    const handleButtonClick = async () => {
        if (openaiRTC.isConnected) {
            openaiRTC.disconnect();
        } else {
            await openaiRTC.connect(selectedVoice, formattedSystemPrompt);
        }
    };

    return (
        <>
            <IAstedButtonFull
                voiceListening={openaiRTC.voiceState === 'listening'}
                voiceSpeaking={openaiRTC.voiceState === 'speaking'}
                voiceProcessing={openaiRTC.voiceState === 'connecting' || openaiRTC.voiceState === 'thinking'}
                audioLevel={openaiRTC.audioLevel}
                onClick={handleButtonClick}
                onDoubleClick={() => setIsOpen(true)}
            />

            <IAstedChatModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                openaiRTC={openaiRTC}
                currentVoice={selectedVoice}
                systemPrompt={formattedSystemPrompt}
                pendingDocument={pendingDocument}
                onClearPendingDocument={() => setPendingDocument(null)}
            />
        </>
    );
}
