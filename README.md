# GTA Leaks — Flezen-ready Cloudflare Pages starter

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

## 1. Configure Supabase

1. Create a project at https://supabase.com/.
2. Open **SQL Editor** and open `supabase.sql` from this package.
3. Replace every `REPLACE_WITH_ADMIN_EMAIL` with the exact email address you will use for admin login. Run the SQL.
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

## 4. Deploy to Cloudflare Pages

1. Upload the contents of `gta-leaks-starter/` to the root of a GitHub repository.
2. In Cloudflare Dashboard, open **Workers & Pages → Create → Pages → Connect to Git**.
3. Select the repository. Choose **None** for framework preset, leave the build command blank, and set the build output directory to `/` (repository root).
4. Deploy. The `_redirects` file routes `/admin` to the app shell. The route is hidden from public navigation, but authentication and database RLS—not obscurity—protect the admin operations.
5. Add your custom domain in Cloudflare Pages and verify HTTPS.

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

`https://YOUR-DOMAIN/admin`

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
