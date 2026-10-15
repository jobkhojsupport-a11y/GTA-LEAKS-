import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

const CONFIGURED = SUPABASE_URL.startsWith("https://") && !SUPABASE_URL.includes("YOUR-PROJECT") && !SUPABASE_ANON_KEY.includes("YOUR_");
const supabase = CONFIGURED ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
let posts = [], editing = null;
const $ = id => document.getElementById(id);
const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const validHttps = value => { try { const u = new URL(value); return u.protocol === "https:" ? u : null; } catch { return null; } };
function resolveVideoLink(raw) {
  // Flezen provides a watch/share page rather than an embeddable player.
  // Keep the original HTTPS URL and open it on Flezen in a new tab.
  return validHttps(String(raw || "").trim());
}
function getScreenshots(post) { return Array.isArray(post.screenshots) ? post.screenshots.filter(x => validHttps(String(x))) : []; }
function renderPosts() {
  const items = posts.filter(p => p.status === "published");
  $("empty-state").hidden = items.length > 0;
  $("video-grid").innerHTML = items.map(p => `<article class="video-card" tabindex="0" role="button" data-video="${esc(p.id)}" aria-label="Open ${esc(p.title)}">
    <div class="thumb-wrap"><img src="${esc(p.thumbnail_url || "")}" alt="${esc(p.title)} thumbnail" loading="lazy" referrerpolicy="no-referrer"><span class="duration-label">▶ OPEN POST</span></div>
    <span class="tag ${p.category === "Rumor" ? "rumor" : ""}">${esc(p.category)} · ${p.is_confirmed ? "Verified" : "Unverified / fan content"}</span>
    <h3>${esc(p.title)}</h3><p class="description">${esc(p.description)}</p>
  </article>`).join("");
}
async function loadPosts() {
  if (supabase) {
    const {data,error} = await supabase.from("videos").select("*").eq("status","published").order("created_at",{ascending:false});
    if (!error && data) posts = data;
    else { posts = []; console.warn("Could not load database posts.", error?.message); }
  }
  renderPosts();
}
function openPost(id) {
  const p = posts.find(item => String(item.id) === String(id));
  if (!p) return;
  const videoLink = resolveVideoLink(p.video_url);
  const media = videoLink
    ? `<div class="watch-panel"><p class="watch-note">VIDEO HOSTED ON FLEZEN</p><a class="watch-now-btn" href="${esc(videoLink.href)}" target="_blank" rel="noopener noreferrer">WATCH NOW <span aria-hidden="true">↗</span></a><p class="video-link-label">Video link</p><a class="video-link-text" href="${esc(videoLink.href)}" target="_blank" rel="noopener noreferrer">${esc(videoLink.href)}</a></div>`
    : `<p class="admin-note">This video link is invalid. Add a full HTTPS Flezen share/watch URL in the admin panel.</p>`;
  const shots = getScreenshots(p);
  const gallery = shots.length ? `<section class="screenshot-gallery"><h3>SCREENSHOTS</h3><div class="screenshot-grid">${shots.map((url,i)=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer"><img src="${esc(url)}" alt="${esc(p.title)} screenshot ${i+1}" loading="lazy"></a>`).join("")}</div></section>` : "";
  $("video-detail").innerHTML = `<span class="tag ${p.category === "Rumor" ? "rumor" : ""}">${esc(p.category)} · ${p.is_confirmed ? "Verified" : "Unverified / fan content"}</span>
    <h2 class="detail-title">${esc(p.title)}</h2>${media}
    <p class="detail-meta">Published ${p.created_at ? new Date(p.created_at).toLocaleDateString() : ""} · ${p.is_confirmed ? "Official / verified label" : "Not independently verified"}</p>
    <p class="detail-description">${esc(p.description)}</p>${gallery}`;
  $("video-dialog").showModal();
  document.title = `${p.title} | GTA Leaks`;
  const desc = document.querySelector('meta[name="description"]'); if (desc) desc.content = p.description.slice(0,155);
  location.hash = `/post/${encodeURIComponent(id)}`;
}
function resetMeta() { document.title="GTA Leaks — Fan Archive"; const d=document.querySelector('meta[name="description"]'); if(d)d.content="GTA Leaks — an independent fan archive for GTA videos, community discoveries, screenshots, and gaming updates."; }
function closePost() { if ($("video-dialog").open) $("video-dialog").close(); $("video-detail").innerHTML=""; if(location.hash.startsWith("#/post/")) history.replaceState(null,"",location.pathname); resetMeta(); }
$("video-grid").addEventListener("click",e=>{const c=e.target.closest("[data-video]");if(c)openPost(c.dataset.video)});
$("video-grid").addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches("[data-video]")){e.preventDefault();openPost(e.target.dataset.video)}});
document.querySelector('[data-close="video"]').addEventListener("click",closePost);
$("video-dialog").addEventListener("click",e=>{if(e.target===$("video-dialog"))closePost()});
document.querySelector('[data-close="admin"]').addEventListener("click",()=>$ ("admin-dialog").close());
function showAdminEditor(signedIn){$("admin-login-view").hidden=signedIn;$("admin-editor-view").hidden=!signedIn;if(signedIn){renderAdminList();refreshAdminPosts();}}
async function checkAdminSession(){if(!supabase){$("login-message").textContent="Setup required: add your Supabase URL and publishable/anon key in config.js, then run supabase.sql.";showAdminEditor(false);return;}const {data}=await supabase.auth.getSession();showAdminEditor(!!data.session);}
$("login-form").addEventListener("submit",async e=>{e.preventDefault();if(!supabase)return;const {error}=await supabase.auth.signInWithPassword({email:$("admin-email").value,password:$("admin-password").value});$("login-message").textContent=error?error.message:"Signed in.";if(!error)showAdminEditor(true);});
$("logout-btn").addEventListener("click",async()=>{await supabase?.auth.signOut();showAdminEditor(false);});
function renderAdminList(){const list=posts;$("admin-list").innerHTML=list.length?list.map(p=>`<div class="admin-list-item"><div><strong>${esc(p.title)}</strong><small>${esc(p.category)} · ${esc(p.status)}</small></div><div class="item-actions"><button data-edit="${esc(p.id)}">Edit</button><button class="delete" data-delete="${esc(p.id)}">Delete</button></div></div>`).join(""):`<p class="admin-note">No posts yet. Add your first post using the form above.</p>`;}
function resetPostForm(){$("video-form").reset();$("edit-id").value="";editing=null;$("editor-message").textContent="";}
$("cancel-edit").addEventListener("click",resetPostForm);
$("admin-list").addEventListener("click",async e=>{
  const edit=e.target.closest("[data-edit]"),del=e.target.closest("[data-delete]");
  if(edit){const p=posts.find(x=>String(x.id)===edit.dataset.edit);if(!p)return;editing=p;$("edit-id").value=p.id;$("video-title").value=p.title;$("video-thumbnail").value=p.thumbnail_url;$("video-url").value=p.video_url;$("video-screenshots").value=getScreenshots(p).join("\n");$("video-description").value=p.description;$("video-category").value=p.category;$("video-status").value=p.status;$("video-confirmed").checked=!!p.is_confirmed;window.scrollTo({top:0,behavior:"smooth"});}
  if(del&&confirm("Delete this post?")){const {error}=await supabase.from("videos").delete().eq("id",del.dataset.delete);if(error){$("editor-message").textContent=error.message;return;}await refreshAdminPosts();}
});
async function refreshAdminPosts(){const {data,error}=await supabase.from("videos").select("*").order("created_at",{ascending:false});if(error){$("editor-message").textContent=error.message;return;}posts=data||[];renderAdminList();renderPosts();}
$("video-form").addEventListener("submit",async e=>{
  e.preventDefault();if(!supabase){$("editor-message").textContent="Configure Supabase first.";return;}
  const video_url=$("video-url").value.trim(),source=resolveVideoLink(video_url);
  if(!source){$("editor-message").textContent="Enter the full HTTPS Flezen watch/share link. This site opens Flezen in a new tab and does not embed its player.";return;}
  const thumbnail_url=$("video-thumbnail").value.trim();if(!validHttps(thumbnail_url)){$("editor-message").textContent="Thumbnail must be a valid HTTPS image URL.";return;}
  const screenshots=$("video-screenshots").value.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  if(screenshots.some(s=>!validHttps(s))){$("editor-message").textContent="Every screenshot must be a valid HTTPS image URL, one per line.";return;}
  const payload={title:$("video-title").value.trim(),thumbnail_url,video_url, screenshots,description:$("video-description").value.trim(),category:$("video-category").value,status:$("video-status").value,is_confirmed:$("video-confirmed").checked};
  const query=editing?supabase.from("videos").update(payload).eq("id",editing.id):supabase.from("videos").insert(payload);
  const {error}=await query;if(error){$("editor-message").textContent=error.message;return;}
  $("editor-message").textContent="Saved successfully.";resetPostForm();await refreshAdminPosts();
});
window.addEventListener("hashchange",()=>{const m=location.hash.match(/^#\/post\/(.+)$/);if(m){const id=decodeURIComponent(m[1]);if(!$("video-dialog").open)openPost(id);}else{if($("video-dialog").open)$("video-dialog").close();resetMeta();}});
async function handleRoute(){const path=window.location.pathname.replace(/\/+$/,"")||"/";if(path==="/admin"){$("admin-dialog").showModal();await checkAdminSession();}else if(path==="/"){if($("admin-dialog").open)$("admin-dialog").close();}}
window.addEventListener("popstate",handleRoute);handleRoute();loadPosts();
