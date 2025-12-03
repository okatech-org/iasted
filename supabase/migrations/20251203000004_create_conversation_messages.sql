-- Create conversation_messages table
CREATE TABLE public.conversation_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.conversation_sessions(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view messages from own sessions" ON public.conversation_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversation_sessions WHERE conversation_sessions.id = conversation_messages.session_id AND conversation_sessions.user_id = auth.uid())
);

CREATE POLICY "Users can create messages in own sessions" ON public.conversation_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.conversation_sessions WHERE conversation_sessions.id = conversation_messages.session_id AND conversation_sessions.user_id = auth.uid())
);

CREATE POLICY "Users can update messages in own sessions" ON public.conversation_messages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.conversation_sessions WHERE conversation_sessions.id = conversation_messages.session_id AND conversation_sessions.user_id = auth.uid())
);

CREATE POLICY "Users can delete messages in own sessions" ON public.conversation_messages FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.conversation_sessions WHERE conversation_sessions.id = conversation_messages.session_id AND conversation_sessions.user_id = auth.uid())
);
