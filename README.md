# Caliki Store — Next.js + Stripe + PayU/Przelewy24

## Local
1. `npm i`
2. Copy `.env.local.example` to `.env.local` and fill values
3. `npm run dev` → http://localhost:3000

## Deploy (HTTPS)
- Push this folder to a GitHub repo
- Vercel → New Project → Import → set the same env vars
- Deploy → you'll get https://<project>.vercel.app
- Set `NEXT_PUBLIC_URL` to that exact URL and redeploy
