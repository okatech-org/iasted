import { useState, useEffect, useCallback } from 'react';

export interface UseRealtimeVoiceWebRTC {
    isConnected: boolean;
    connect: (voice: 'echo' | 'ash' | 'shimmer', systemPrompt?: string) => Promise<void>;
    disconnect: () => Promise<void>;
    toggleConversation: (voice: 'echo' | 'ash' | 'shimmer') => void;
    messages: any[];
    clearSession: () => void;
    voiceState: 'idle' | 'listening' | 'speaking' | 'connecting' | 'thinking';
    audioLevel: number;
    setSpeechRate: (rate: number) => void;
}

export const useRealtimeVoiceWebRTC = (onToolCall?: (toolName: string, args: any) => Promise<any> | void): UseRealtimeVoiceWebRTC => {
    const [isConnected, setIsConnected] = useState(false);
    const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'speaking' | 'connecting' | 'thinking'>('idle');
    const [audioLevel, setAudioLevel] = useState(0);
    const [messages, setMessages] = useState<any[]>([]);

    const connect = useCallback(async (voice: 'echo' | 'ash' | 'shimmer', systemPrompt?: string) => {
        console.log('Connecting to voice:', voice);
        setVoiceState('connecting');
        setTimeout(() => {
            setIsConnected(true);
            setVoiceState('listening');
        }, 1000);
    }, []);

    const disconnect = useCallback(async () => {
        console.log('Disconnecting voice');
        setIsConnected(false);
        setVoiceState('idle');
    }, []);

    const toggleConversation = useCallback((voice: 'echo' | 'ash' | 'shimmer') => {
        if (isConnected) {
            disconnect();
        } else {
            connect(voice);
        }
    }, [isConnected, connect, disconnect]);

    const clearSession = useCallback(() => {
        setMessages([]);
    }, []);

    const setSpeechRate = useCallback((rate: number) => {
        console.log('Setting speech rate:', rate);
    }, []);

    // Simulate audio level changes when connected
    useEffect(() => {
        if (!isConnected) {
            setAudioLevel(0);
            return;
        }

        const interval = setInterval(() => {
            setAudioLevel(Math.random());
        }, 100);

        return () => clearInterval(interval);
    }, [isConnected]);

    return {
        isConnected,
        connect,
        disconnect,
        toggleConversation,
        messages,
        clearSession,
        voiceState,
        audioLevel,
        setSpeechRate
    };
};
