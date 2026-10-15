# GTA Leaks — Supabase-configured Cloudflare Workers package

A responsive dark-navy / electric-blue GTA fan archive with a custom logo, a latest-post feed, Flezen watch links, thumbnail and screenshot galleries, a private `/admin` route, Supabase authentication and Row Level Security, and reserved ad positions.

## Included

- Original GTA Leaks SVG logo and favicon.
- No public Home, Category, Search, or Admin navigation.
- Latest posts feed ordered newest first from Supabase.
- Admin-managed post title, thumbnail, video source, description, type, status, verification label, and screenshot gallery.
- Flezen watch/share links shown as a **WATCH NOW** button plus the full clickable video URL; videos open on Flezen in a new tab rather than being embedded.
- Draft/published workflow; public visitors can read published posts only.
- Top and bottom ad placements in `index.html`.
- Responsive layout and basic SEO metadata.

Demo cards are placeholders for preview only, not claims that any actual leak is authentic. Replace them with content you own or are authorized to share.

## 1. Supabase configuration (partially preconfigured)

The browser-safe `config.js` is already filled with the supplied Project URL and publishable key. The REST URL was normalized to the base Project URL by removing `/rest/v1/`. No Supabase secret/service-role key is included.

1. Open **Supabase → SQL Editor** and open `supabase.sql` from this package.
2. Before running it, replace every `REPLACE_WITH_ADMIN_EMAIL` with the exact email address you will use to sign in to `/admin`. Use the same email in all occurrences.
3. Run the SQL. It creates the `videos` table, enables Row Level Security, and creates policies for published public posts and the configured admin.
4. In **Authentication → Users**, create the admin user with that email (or invite the user). Set a strong password. For a single-admin site, disable public sign-ups if they are not needed.
5. Confirm the table and policies exist before testing the admin panel.

**Still needed:** your admin login email. It is intentionally not guessed or hard-coded into SQL. Until you replace the SQL placeholder with that email and run the SQL, admin CRUD operations will not work.
   - The script is safe for the earlier starter table: it adds the `screenshots` column and updates the allowed post types.
4. In Supabase Authentication, create an account for that admin email. For a single-admin site, disable public sign-ups.
5. Copy the project URL and publishable key (or legacy anon key) from the project's API settings.
6. Put them in `config.js`:
   - `SUPABASE_URL` = your Project URL
   - `SUPABASE_ANON_KEY` = your publishable/anon key
7. Never put a Supabase `service_role` key in browser code or GitHub.

## 2. Add Flezen watch links, thumbnails, and screenshots

Flezen does not support embedding for this site, so the website does **not** try to load a Flezen player. Each post shows a **WATCH NOW** button and the full clickable video URL; clicking either opens the original Flezen page in a new tab.

1. Upload only content you own or have permission to distribute to Flezen.
2. Copy the normal Flezen watch/share URL and paste it into **Flezen video watch/share link** in `/admin`. Use the full `https://` URL.
3. For **Thumbnail image URL**, upload a thumbnail to an image host you control and paste its direct HTTPS image URL. This image appears on the post card.
4. For **Video screenshots**, paste one direct HTTPS image URL per line. These images appear in the screenshot gallery below the post.
5. Save as **Draft** first, open the post, and test the WATCH NOW link and image gallery before publishing.

This starter stores image URLs, not image files. The image files must be hosted somewhere that permits public viewing. The website does not scrape Flezen, bypass access restrictions, or download/rehost other people's videos.

## 3. Run locally

Run a local web server from the project directory:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`. JavaScript modules require a web server; do not open `index.html` directly as a file.

No demo posts are included. The public feed stays empty until you publish real posts through `/admin`.

## 4. Deploy to Cloudflare Workers

This package includes `wrangler.jsonc` for a static site on Workers. It serves the files from the ZIP root and enables SPA fallback so the `/admin` route can load. `.assetsignore` prevents the SQL setup and deployment documentation from being uploaded as public static assets.

### Deploy from your terminal

1. Extract the ZIP and open a terminal in the extracted folder.
2. Install Wrangler if needed: `npm install --save-dev wrangler`.
3. Sign in: `npx wrangler login`.
4. Deploy: `npx wrangler deploy`.
5. Open the `workers.dev` URL shown by Wrangler, then visit `/admin`.

If you deploy through a Git-connected Worker, make sure the project uses this `wrangler.jsonc` and `npx wrangler deploy` as its deploy command. Do not overwrite a different existing Wrangler configuration without merging its required settings.

## 5. Add advertising

There are reserved top and bottom ad positions in `index.html`:

```html
<div class="ad-slot ad-slot-top" aria-label="Advertisement"><!-- TOP AD CODE --></div>
<div class="ad-slot ad-slot-bottom" aria-label="Advertisement"><!-- BOTTOM AD CODE --></div>
```

After your ad provider approves the site, replace the comments with the **official ad code supplied by that provider**. Keep each provider's required script and container together. Do not paste untrusted scripts into a post description or database field. Test that ads don't cover the player or block mobile controls, and follow the provider's rules for copyrighted content and ad placement. The package reserves placement but does not activate an ad network automatically.

## 6. Publish a post

1. Open `https://YOUR-DOMAIN/admin`.
2. Sign in with the Supabase admin account.
3. Enter a title, HTTPS thumbnail URL, Flezen watch/share URL, thumbnail image URL, optional screenshot image URLs (one per line), and description/source notes.
4. Select the post type and status. Save as **Draft** to test privately, or **Published** to show it publicly.
5. Mark **Verified / official information** only when you have reliable evidence. Label rumors as unverified in the title or description.
6. Use Edit/Delete to manage posts.

## 7. Security, copyright, and SEO notes

- Public database access is limited to rows with `status = 'published'`; write policies match the configured admin email. Test both signed-out visitor and admin sessions after setup.
- Only use content you own, licensed content, or material you have permission to publish. Do not publish private, stolen, or unlawfully obtained files. Respond to valid copyright and privacy complaints.
- This is an independent fan project and is not affiliated with Rockstar Games or Take-Two Interactive.
- This starter uses a client-side post dialog/hash route, so individual posts are not as SEO-friendly as separate prerendered pages. For stronger indexing, migrate to real static post pages or a framework with prerendering and add a sitemap/canonical URLs for the actual domain.
- Update the title, description, social preview, privacy policy, and any required legal pages before monetizing.

## Admin route

`https://YOUR-WORKER-URL.workers.dev/admin` (or your custom domain plus `/admin`)

There is no public Admin link. A hidden route is not a security boundary by itself; keep Supabase Auth enabled and preserve the RLS policies.


## Latest update
- Desktop layout now uses the available screen width, with a responsive 2–3 column post grid.
- Post detail and admin dialogs fill the browser viewport for a full-screen experience.
- Removed all hard-coded demo/sample posts. An empty database shows an empty state instead of fake content.


## Cloudflare Pages deployment (important)
This ZIP is packaged with `index.html`, `_redirects`, and all site assets at the ZIP root. For Direct Upload, extract this ZIP and upload the files in this folder directly; do not upload an outer parent folder that contains another `gta-leaks-starter` folder. For Git integration, set the Pages build output directory to the directory containing `index.html` and `_redirects` (the repository root if these files are at its root). The `_redirects` file routes `/admin` to `index.html`, allowing the app's admin route to load.

Before publishing, replace the placeholder Supabase URL and public publishable/anon key in `config.js`. Do not put a service-role key in client-side code.


## Local testing at `/admin`
Some simple local static servers return 404 for extensionless paths such as `/admin` and do not apply Cloudflare's `_redirects` file. This package includes `admin/index.html` as a fallback for static servers that support directory indexes. If your local server still returns 404 at `/admin`, open `/admin/` (with a trailing slash) or run a development server with SPA fallback enabled. Cloudflare Pages uses `_redirects` to serve the main app at `/admin`.


## Supabase credential safety

The publishable key is designed to be present in browser code. Security must come from Row Level Security and correct policies. Never add an `sb_secret_...` or legacy `service_role` key to `config.js`, GitHub, or static assets. If a secret key has ever been committed publicly, rotate it in Supabase.
