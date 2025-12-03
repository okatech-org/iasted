import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-openai-key, x-anthropic-key, x-gemini-key',
};

const SYSTEM_PROMPT = `Tu es iAsted, l'Architecte de Solution Automatisé.
Ton rôle est de transformer une idée brute en un plan d'exécution technique complet, divisé en 3 phases distinctes.
Tu ne produis pas le code final toi-même, mais tu génères les "Méta-Prompts" parfaits pour que d'autres IA spécialisées le fassent.

### TES 3 PHASES DE TRAVAIL :

1. **PHASE LOVABLE (No-Code / Frontend Rapide)**
   - Cible : Lovable.dev / GPT-4o
   - Objectif : Créer l'interface visuelle, les transitions, et l'UX.
   - Contenu à générer : Un prompt narratif et visuel décrivant chaque page (Accueil, Auth, Dashboard, Admin), le style (couleurs, ambiance), et les interactions clés.

2. **PHASE ANTIGRAVITY FRONTEND (Code React/Vite)**
   - Cible : Antigravity (Mode Agent) / Claude 3.5 Sonnet
   - Objectif : Transformer le prototype Lovable en code de production propre.
   - Contenu à générer : Un prompt technique spécifiant la stack (React, Vite, Shadcn UI, Tailwind), l'architecture des composants, la gestion d'état (Zustand/Context), et les bonnes pratiques TypeScript.

3. **PHASE CURSOR & ANTIGRAVITY BACKEND (Logique, BDD & Optimisation)**
   - Cible : Cursor (Mode Agent) / Antigravity / Opus 4.5 Thinking Max
   - Objectif : Construire le cerveau de l'application avec une architecture robuste et sécurisée.
   - Contenu à générer : Un prompt d'architecture backend complet incluant le schéma Supabase (SQL), les Edge Functions, les règles de sécurité (RLS), les API endpoints, ET les directives d'optimisation Antigravity (Performance, Sécurité, Scalabilité).

### FORMAT DE RÉPONSE OBLIGATOIRE :

Pour chaque demande utilisateur, analyse le besoin et structure ta réponse ainsi :

## 1. ANALYSE & LOGIQUE
[Analyse succincte du projet, des entités principales et des défis techniques]

## 2. PROMPT LOVABLE (Interface)
\`\`\`markdown
[Ton prompt pour Lovable ici...]
\`\`\`

## 3. PROMPT ANTIGRAVITY FRONTEND (Architecture UI)
\`\`\`markdown
[Ton prompt pour l'expert Frontend ici...]
\`\`\`

## 4. PROMPT CURSOR & ANTIGRAVITY BACKEND (Architecture Serveur)
\`\`\`markdown
[Ton prompt pour l'expert Backend & Antigravity ici...]
\`\`\`

Reste concis dans l'analyse, mais EXTRÊMEMENT DÉTAILLÉ dans les prompts générés. Agis comme un CTO qui délègue à des développeurs seniors et des experts en sécurité.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, mode = 'auto-power', model: manualModel } = await req.json();

    // Get API Keys from headers
    const openaiKey = req.headers.get('x-openai-key');
    const anthropicKey = req.headers.get('x-anthropic-key');
    const geminiKey = req.headers.get('x-gemini-key') || Deno.env.get("GOOGLE_API_KEY");

    // Initialize Supabase Client for logging
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // --- SMART ROUTER LOGIC ---
    let selectedProvider = 'openai';
    let selectedModel = 'gpt-4o';
    let activeKey: string | null = openaiKey;

    if (mode === 'manual' && manualModel) {
      if (manualModel.startsWith('gpt')) { selectedProvider = 'openai'; selectedModel = manualModel; activeKey = openaiKey; }
      else if (manualModel.startsWith('claude')) { selectedProvider = 'anthropic'; selectedModel = manualModel; activeKey = anthropicKey; }
      else if (manualModel.startsWith('gemini')) { selectedProvider = 'gemini'; selectedModel = manualModel; activeKey = geminiKey ?? null; }
    } else if (mode === 'auto-cost') {
      // Budget Friendly: Prefer Gemini Flash -> GPT-4o-mini
      if (geminiKey) { selectedProvider = 'gemini'; selectedModel = 'gemini-1.5-flash'; activeKey = geminiKey; }
      else if (openaiKey) { selectedProvider = 'openai'; selectedModel = 'gpt-4o-mini'; activeKey = openaiKey; }
      else if (anthropicKey) { selectedProvider = 'anthropic'; selectedModel = 'claude-3-haiku-20240307'; activeKey = anthropicKey; }
    } else {
      // Auto Power (Default): Prefer Claude 3.5 Sonnet -> GPT-4o -> Gemini Pro
      if (anthropicKey) { selectedProvider = 'anthropic'; selectedModel = 'claude-3-5-sonnet-20240620'; activeKey = anthropicKey; }
      else if (openaiKey) { selectedProvider = 'openai'; selectedModel = 'gpt-4o'; activeKey = openaiKey; }
      else if (geminiKey) { selectedProvider = 'gemini'; selectedModel = 'gemini-1.5-pro'; activeKey = geminiKey; }
    }

    if (!activeKey) {
      throw new Error(`No API key available for provider ${selectedProvider}. Please configure keys in Settings.`);
    }

    console.log(`[Smart Router] Mode: ${mode}, Selected: ${selectedProvider}/${selectedModel}`);

    // --- HYBRID BRAIN EXECUTION ---
    let stream: ReadableStream<Uint8Array> | null = null;
    let inputTokens = 0; // Estimated

    if (selectedProvider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${activeKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages
          ],
          stream: true
        })
      });
      if (!res.ok) throw new Error(`OpenAI Error: ${await res.text()}`);
      stream = res.body;
      inputTokens = JSON.stringify(messages).length / 4; // Rough estimate

    } else if (selectedProvider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': activeKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: selectedModel,
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
          stream: true
        })
      });
      if (!res.ok) throw new Error(`Anthropic Error: ${await res.text()}`);

      // Transform Anthropic stream to OpenAI format
      const reader = res.body?.getReader();
      stream = new ReadableStream({
        async start(controller) {
          if (!reader) return controller.close();
          const decoder = new TextDecoder();
          const encoder = new TextEncoder();

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = JSON.parse(line.slice(6));
                  if (data.type === 'content_block_delta' && data.delta.text) {
                    const sse = { choices: [{ delta: { content: data.delta.text } }] };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(sse)}\n\n`));
                  }
                }
              }
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          } catch (e) { controller.error(e); }
          finally { controller.close(); }
        }
      });
      inputTokens = JSON.stringify(messages).length / 4;

    } else if (selectedProvider === 'gemini') {
      // Gemini Logic (Existing but adapted)
      const googleMessages = messages.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:streamGenerateContent?key=${activeKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: googleMessages,
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
        }),
      });
      if (!res.ok) throw new Error(`Gemini Error: ${await res.text()}`);

      // Transform Gemini stream to OpenAI format
      const reader = res.body?.getReader();
      stream = new ReadableStream({
        async start(controller) {
          if (!reader) return controller.close();
          const decoder = new TextDecoder();
          const encoder = new TextEncoder();
          let buffer = ""; // Buffer for partial JSON

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });

              while (true) {
                const openBrace = buffer.indexOf('{');
                if (openBrace === -1) break;
                let balance = 0;
                let endBrace = -1;
                let inStr = false;
                for (let i = openBrace; i < buffer.length; i++) {
                  if (buffer[i] === '"' && buffer[i - 1] !== '\\') inStr = !inStr;
                  if (!inStr) {
                    if (buffer[i] === '{') balance++;
                    else if (buffer[i] === '}') {
                      balance--;
                      if (balance === 0) { endBrace = i; break; }
                    }
                  }
                }
                if (endBrace !== -1) {
                  const jsonStr = buffer.substring(openBrace, endBrace + 1);
                  buffer = buffer.substring(endBrace + 1);
                  try {
                    const json = JSON.parse(jsonStr);
                    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) {
                      const sse = { choices: [{ delta: { content: text } }] };
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify(sse)}\n\n`));
                    }
                  } catch (e) { }
                } else break;
              }
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          } catch (e) { controller.error(e); }
          finally { controller.close(); }
        }
      });
      inputTokens = JSON.stringify(messages).length / 4;
    }

    // --- FINOPS LOGGING (Async) ---
    const estimatedCost = (inputTokens / 1000) * 0.01; // Dummy cost calculation

    // Fire and forget logging
    supabase.from('usage_logs').insert({
      provider: selectedProvider,
      model: selectedModel,
      tokens_in: Math.round(inputTokens),
      cost: estimatedCost,
      mode: mode
    }).then(({ error }) => {
      if (error) console.error('FinOps Log Error:', error);
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error: unknown) {
    console.error("Chat error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});