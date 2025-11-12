# Ujian SMA — Netlify React-ready Demo

Repo ini siap di-deploy ke Netlify dengan build step (Vite React frontend + Netlify Functions).

## Struktur
- frontend/                : Vite React app (build -> frontend/dist)
- netlify/functions/       : Netlify Functions (grade)
- shared/score.js          : scoring logic used by functions
- netlify.toml             : Netlify config (build & publish)

## Menjalankan secara lokal
1. Install dependencies:
   - root: `npm i -D netlify-cli` (opsional jika ingin `netlify dev`)
   - frontend: `cd frontend && npm install`
2. Jalankan dev (serves functions & frontend): `npx netlify dev`
3. Atau build frontend: `cd frontend && npm run build` -> hasil ada di `frontend/dist`
4. Untuk test fungsi lokal tanpa netlify-cli, Anda dapat build dan gunakan `netlify` production deploy.

## Deploy ke Netlify (via GitHub)
1. Push repo ini ke GitHub.
2. Import repo di Netlify → Netlify akan menjalankan `npm run build --prefix frontend` dan publish `frontend/dist`.
3. Endpoint grading tersedia di `https://<site>.netlify.app/.netlify/functions/grade`.
