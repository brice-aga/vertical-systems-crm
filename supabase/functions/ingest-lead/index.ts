import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface LeadPayload {
  firstName: string;
  lastName: string;
  email: string;
  LinkedinUrl?: string;
  source?: string;
  companyName?: string;
  jobTitle?: string;
  WebsiteURL?: string;
  notes?: string;
  phone?: string;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
}

function validateLeadPayload(payload: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!payload.firstName || typeof payload.firstName !== 'string' || payload.firstName.trim() === '') {
    errors.push('firstName is required and must be a non-empty string');
  }

  if (!payload.lastName || typeof payload.lastName !== 'string' || payload.lastName.trim() === '') {
    errors.push('lastName is required and must be a non-empty string');
  }

  if (!payload.email || typeof payload.email !== 'string' || payload.email.trim() === '') {
    errors.push('email is required and must be a non-empty string');
  } else if (!validateEmail(payload.email)) {
    errors.push('email must be a valid email address');
  }

  if (payload.firstName && payload.firstName.length > 100) {
    errors.push('firstName must not exceed 100 characters');
  }

  if (payload.lastName && payload.lastName.length > 100) {
    errors.push('lastName must not exceed 100 characters');
  }

  if (payload.email && payload.email.length > 255) {
    errors.push('email must not exceed 255 characters');
  }

  if (payload.LinkedinUrl && payload.LinkedinUrl.length > 255) {
    errors.push('LinkedinUrl must not exceed 255 characters');
  }

  if (payload.companyName && payload.companyName.length > 200) {
    errors.push('companyName must not exceed 200 characters');
  }

  if (payload.jobTitle && payload.jobTitle.length > 150) {
    errors.push('jobTitle must not exceed 150 characters');
  }

  if (payload.WebsiteURL && payload.WebsiteURL.length > 255) {
    errors.push('WebsiteURL must not exceed 255 characters');
  }

  if (payload.source && payload.source.length > 100) {
    errors.push('source must not exceed 100 characters');
  }

  return { valid: errors.length === 0, errors };
}

async function getSystemUserId(supabase: any): Promise<string | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('role', 'admin')
    .maybeSingle();

  if (error || !data) {
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    if (!usersError && users && users.users.length > 0) {
      return users.users[0].id;
    }
    return null;
  }

  return data.id;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed. Use POST.' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: LeadPayload = await req.json();

    const validation = validateLeadPayload(payload);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.errors }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const systemUserId = await getSystemUserId(supabase);
    if (!systemUserId) {
      return new Response(
        JSON.stringify({ error: 'System configuration error: No admin user found' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: existingLead, error: checkError } = await supabase
      .from('leads')
      .select('id')
      .eq('email', payload.email.trim())
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing lead:', checkError);
      return new Response(
        JSON.stringify({ error: 'Database error', details: checkError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const leadData = {
      first_name: payload.firstName.trim(),
      last_name: payload.lastName.trim(),
      email: payload.email.trim().toLowerCase(),
      linkedin_url: payload.LinkedinUrl?.trim() || null,
      lead_source: payload.source?.trim() || 'webhook',
      company: payload.companyName?.trim() || null,
      job_title: payload.jobTitle?.trim() || null,
      website: payload.WebsiteURL?.trim() || null,
      notes: payload.notes?.trim() || null,
      phone: payload.phone?.trim() || null,
      status: 'new',
      priority: 'medium',
      updated_at: new Date().toISOString(),
    };

    if (existingLead) {
      const { data: updatedLead, error: updateError } = await supabase
        .from('leads')
        .update(leadData)
        .eq('id', existingLead.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating lead:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update lead', details: updateError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          action: 'updated',
          lead: updatedLead,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      const newLeadData = {
        ...leadData,
        created_by: systemUserId,
        created_at: new Date().toISOString(),
      };

      const { data: newLead, error: insertError } = await supabase
        .from('leads')
        .insert(newLeadData)
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting lead:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to create lead', details: insertError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          action: 'created',
          lead: newLead,
        }),
        {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
