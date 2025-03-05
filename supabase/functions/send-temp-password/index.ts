
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Initialize Resend with API key
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  tempPassword: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { email, tempPassword }: PasswordResetRequest = await req.json();

    if (!email || !tempPassword) {
      throw new Error("Email and temporary password are required");
    }

    console.log(`Processing password reset request for: ${email}`);

    // Send email with the temporary password
    const emailResponse = await resend.emails.send({
      from: "BirdieBoard <onboarding@resend.dev>",
      to: [email],
      subject: "Your Temporary Password for BirdieBoard",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a; margin-bottom: 24px;">BirdieBoard Password Reset</h2>
          <p>You requested a password reset. Here is your temporary password:</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 4px; margin: 20px 0; font-family: monospace; font-size: 18px;">
            ${tempPassword}
          </div>
          <p>Please use this temporary password to log in to your account. You will be prompted to create a new password after logging in.</p>
          <p>If you did not request this password reset, please contact support or secure your account immediately.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
            <p>The BirdieBoard Team</p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-temp-password function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
