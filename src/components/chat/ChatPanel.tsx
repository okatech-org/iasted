import { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (content: string) => {
    const userMessage: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke('chat', {
        body: { messages: [...messages, userMessage] }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Handle streaming response
      const reader = response.data.getReader?.();
      if (reader) {
        let assistantContent = '';
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const text = decoder.decode(value, { stream: true });
          const lines = text.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                const delta = data.choices?.[0]?.delta?.content;
                if (delta) {
                  assistantContent += delta;
                  setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                    return updated;
                  });
                }
              } catch {}
            }
          }
        }
      } else {
        // Non-streaming response
        const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        const assistantMessage = data.choices?.[0]?.message?.content || data.message || "Désolé, je n'ai pas pu générer une réponse.";
        setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de communiquer avec l'IA. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border border-border overflow-hidden card-shadow">
      <div className="p-4 border-b border-border flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Chat avec iAsted</h2>
          <p className="text-sm text-muted-foreground">Décrivez votre projet pour commencer</p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center mb-6 animate-float">
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Bienvenue sur iAsted</h3>
            <p className="text-muted-foreground max-w-md">
              Je suis votre assistant IA pour créer des projets web. Décrivez-moi votre idée et je vous aiderai à générer un cahier des charges complet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <ChatMessage key={index} {...message} />
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-3 p-4 rounded-2xl bg-muted/50 mr-8">
                <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center animate-pulse">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex items-center">
                  <span className="text-muted-foreground">iAsted réfléchit...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <ChatInput onSend={sendMessage} isLoading={isLoading} />
    </div>
  );
}
