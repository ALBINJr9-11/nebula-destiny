# NEBULA DESTINY — Setup guide

This folder contains the website frontend, Supabase database security schema, and a server-side AI function. The frontend is ready to connect, but live services do not work until you create/configure your own accounts and keys.

## Free services
- **Supabase**: authentication, Postgres database, and Edge Functions. The free plan has quotas and inactive projects may pause. Check the current limits: https://supabase.com/pricing
- **Gemini API**: AI responses through Google AI Studio. Free access has model/rate limits and terms; check current limits: https://ai.google.dev/gemini-api/docs/billing
- **Static hosting**: publish `index.html` on any static host that supports HTTPS. Supabase and AI secrets are configured separately.

## 1. Create Supabase project
1. Create a project at https://supabase.com/
2. In Project Settings → API, copy the Project URL and the publishable/anon key.
3. Open `index.html` and replace:
   - `YOUR_SUPABASE_PROJECT_URL`
   - `YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
   Only the publishable/anon key belongs in frontend code. **Never put a service-role key or Gemini API key in `index.html`.**

## 2. Create tables and row security
1. In Supabase Dashboard → SQL Editor, open a new query.
2. Paste the contents of `supabase/schema.sql` and run it.
3. Authentication → URL Configuration: set your local/deployed website URL in Site URL and add it to Redirect URLs as appropriate.
4. Authentication → Providers / Email: configure email confirmation to suit your launch. Keep confirmation enabled for public production sites.

The schema uses Row Level Security (RLS) so signed-in users can only access rows belonging to their own user ID. Keep RLS enabled.

## 3. Turn on real AI safely
1. Install the Supabase CLI and sign in, or use the Supabase dashboard's supported Edge Function editor/deploy workflow.
2. Create a Gemini API key at https://aistudio.google.com/app/apikey
3. From the project directory, link the project and set the secret:
   `supabase login`
   `supabase link --project-ref YOUR_PROJECT_REF`
   `supabase secrets set GEMINI_API_KEY=YOUR_GEMINI_API_KEY`
4. Deploy the function:
   `supabase functions deploy ai-assistant`
5. Test after signing in. The frontend invokes the function with the user's session. The function checks the session before forwarding the prompt to Gemini.

If your Supabase project requires JWT verification at the gateway, keep it enabled; the function also validates the user's session. Add per-user rate limiting and usage quotas before inviting lots of users.

## 4. Run or publish
For local testing, serve the folder through a local web server (ES modules may not work when opening the file as `file://`). For example, with Python installed:
`python -m http.server 8000`
Then open `http://localhost:8000`.

To publish, upload `index.html` to your chosen static hosting service and add the hosted URL to Supabase Auth URL Configuration. The SQL and Edge Function are deployed to Supabase separately.

## Included
- `index.html`: responsive light-theme website, auth screen, AI Studio, cloud tasks and notes, account dashboard and mini tools.
- `supabase/schema.sql`: profiles, tasks and notes tables plus RLS policies.
- `supabase/functions/ai-assistant/index.ts`: authenticated server-side Gemini API proxy.

## Important limitations
- This is a starter implementation, not a fully audited production app.
- Chat Room is currently a local preview, not multi-user real-time chat.
- Password reset, OAuth sign-in, file uploads, admin controls, and live messaging still need to be added.
- Free plans and API quotas can change. Gemini free-tier data handling may differ from paid services; review provider terms before sending private or sensitive data.
