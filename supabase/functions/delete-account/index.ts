import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import { Resend } from 'npm:resend@2.1.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const resend = new Resend('re_Gcht35Bu_95bRGX6dR7HBwgQA7hgX9viG');

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user's session
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid user session');
    }

    // Get user's profile data for the email
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('email, name')
      .eq('id', user.id)
      .single();

    // Delete the user's avatar if it exists
    const { data: avatarData } = await supabaseClient
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single();

    if (avatarData?.avatar_url) {
      const avatarPath = avatarData.avatar_url.split('/').pop();
      if (avatarPath) {
        await supabaseClient.storage
          .from('avatars')
          .remove([`avatars/${avatarPath}`]);
      }
    }

    // Delete the user's profile (this will cascade to all other data)
    await supabaseClient
      .from('profiles')
      .delete()
      .eq('id', user.id);

    // Delete the user's account
    const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) {
      throw deleteError;
    }

    // Send confirmation email
    await resend.emails.send({
      from: 'Gifta <noreply@gifta.com>',
      to: profile?.email || user.email,
      subject: 'Account eliminato con successo',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Account eliminato</title>
          </head>
          <body style="font-family: system-ui, -apple-system, sans-serif; padding: 40px 20px; background-color: #f3f4f6;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <img src="https://gifta.com/logo.png" alt="Gifta" style="display: block; margin: 0 auto 30px; width: 120px;">
              <h2 style="margin: 0 0 20px; color: #111827; text-align: center; font-size: 24px;">Account eliminato con successo</h2>
              <p style="margin: 0 0 20px; color: #4b5563; line-height: 1.5; text-align: center;">
                Abbiamo eliminato con successo il tuo account. Ci dispiace vederti andare via. Speriamo di rivederti presto!
              </p>
            </div>
          </body>
        </html>
      `
    });

    return new Response(
      JSON.stringify({ message: 'Account deleted successfully' }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});