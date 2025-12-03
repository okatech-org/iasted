import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { provider, key } = await req.json();

        if (!key) {
            throw new Error('Key is required');
        }

        let isValid = false;
        let message = '';

        switch (provider) {
            case 'openai':
                const openaiRes = await fetch('https://api.openai.com/v1/models', {
                    headers: { 'Authorization': `Bearer ${key}` }
                });
                isValid = openaiRes.ok;
                message = isValid ? 'OpenAI Key is valid' : `OpenAI Error: ${openaiRes.statusText}`;
                break;

            case 'anthropic':
                const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'x-api-key': key,
                        'anthropic-version': '2023-06-01',
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'claude-3-haiku-20240307',
                        max_tokens: 1,
                        messages: [{ role: 'user', content: 'Hi' }]
                    })
                });
                isValid = anthropicRes.ok;
                if (!isValid && anthropicRes.status !== 401 && anthropicRes.status !== 403) {
                    const err = await anthropicRes.text();
                    console.log('Anthropic error:', err);
                }
                message = isValid ? 'Anthropic Key is valid' : `Anthropic Error: ${anthropicRes.statusText}`;
                break;

            case 'gemini':
                const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
                isValid = geminiRes.ok;
                message = isValid ? 'Gemini Key is valid' : `Gemini Error: ${geminiRes.statusText}`;
                break;

            case 'github':
                const githubRes = await fetch('https://api.github.com/user', {
                    headers: {
                        'Authorization': `Bearer ${key}`,
                        'User-Agent': 'iAsted-Verifier'
                    }
                });
                isValid = githubRes.ok;
                message = isValid ? 'GitHub Token is valid' : `GitHub Error: ${githubRes.statusText}`;
                break;

            case 'mapbox':
                const mapboxRes = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/Paris.json?access_token=${key}&limit=1`);
                isValid = mapboxRes.ok;
                message = isValid ? 'Mapbox Key is valid' : `Mapbox Error: ${mapboxRes.statusText}`;
                break;

            default:
                throw new Error('Unknown provider');
        }

        return new Response(
            JSON.stringify({ valid: isValid, message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return new Response(
            JSON.stringify({ valid: false, message: errorMessage }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }
});