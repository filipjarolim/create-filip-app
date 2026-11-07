// Deploy with: supabase functions deploy report-content
// Apply supabase/migrations before the first report. The service-role key stays on the server.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const reasons = new Set(['harassment', 'sexual', 'violence', 'other']);

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const authorization = request.headers.get('Authorization');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!authorization || !supabaseUrl || !anonKey || !serviceKey) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data, error } = await userClient.auth.getUser();
  if (error || !data.user) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }

  const body = await request.json();
  const reason = String(body.reason ?? '');
  const details = String(body.details ?? '').slice(0, 2000);
  const targetUserId = body.targetUserId ? String(body.targetUserId) : null;
  if (!reasons.has(reason)) {
    return new Response('Unsupported reason', { status: 400, headers: corsHeaders });
  }

  const admin = createClient(supabaseUrl, serviceKey);
  const { error: insertError } = await admin.from('reports').insert({
    reporter_id: data.user.id,
    target_user_id: targetUserId,
    reason,
    details,
  });
  if (insertError) {
    return new Response(insertError.message, { status: 500, headers: corsHeaders });
  }

  if (body.action === 'block' && targetUserId) {
    const { error: blockError } = await admin.from('blocks').upsert({
      blocker_id: data.user.id,
      blocked_id: targetUserId,
    });
    if (blockError) {
      return new Response(blockError.message, { status: 500, headers: corsHeaders });
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
