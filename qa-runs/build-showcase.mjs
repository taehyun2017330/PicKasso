// Builds a self-contained, shareable HTML showcase of steering trajectories:
// image set --> action --> image set, per scenario.
// Usage: node qa-runs/build-showcase.mjs 02-coffee-moody 10-architecture-brutalist 08-surf-sunfaded
import fs from "node:fs";
import path from "node:path";

const ROOTS = [
  path.join(process.cwd(), "qa-runs", "real-exp", "campaign"),
  path.join(process.cwd(), "qa-runs", "real-exp", "diverse")
];
const OUT_DIR = path.join(process.cwd(), "qa-runs", "real-exp", "showcase");
const scenarios = process.argv.slice(2);

function resolveScenarioDir(key) {
  for (const r of ROOTS) {
    const d = path.join(r, key);
    if (fs.existsSync(d)) return d;
  }
  return null;
}
if (!scenarios.length) {
  console.error("pass scenario keys, e.g. 02-coffee-moody");
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function rel(p) {
  // showcase/index.html -> ../campaign/<...>
  return path.relative(OUT_DIR, p).split(path.sep).join("/");
}

function genDirs(scenarioDir) {
  return fs
    .readdirSync(scenarioDir)
    .filter((d) => /^gen-\d+$/.test(d))
    .sort((a, b) => Number(a.split("-")[1]) - Number(b.split("-")[1]));
}

let body = "";
for (const key of scenarios) {
  const scenarioDir = resolveScenarioDir(key);
  if (!scenarioDir) {
    console.warn(`skip ${key} (not found)`);
    continue;
  }
  const traj = JSON.parse(fs.readFileSync(path.join(scenarioDir, "trajectory.json"), "utf8"));
  body += `<section class="scenario"><h2>${esc(key)}</h2>`;
  if (traj.target) body += `<p class="target"><strong>Target:</strong> ${esc(traj.target)}</p>`;
  if (traj.pattern)
    body += `<p class="target"><strong>Pattern:</strong> ${esc(traj.pattern)} — recipes: ${esc(
      (traj.recipes || []).join(" → ")
    )}</p>`;

  const gens = genDirs(scenarioDir);
  gens.forEach((g, gi) => {
    const gDir = path.join(scenarioDir, g);
    const manifest = JSON.parse(fs.readFileSync(path.join(gDir, "manifest.json"), "utf8"));
    const allPngs = fs.readdirSync(gDir).filter((f) => f.endsWith(".png"));
    // Dirs can hold stale PNGs from earlier runs (ids differ, not
    // overwritten). Select strictly the variants in THIS run's manifest,
    // in manifest order, so the showcase shows only the current board.
    const pngs = manifest.variants
      .map((v) => allPngs.find((f) => f.replace(/\.png$/, "").endsWith(v.id.slice(-6))))
      .filter(Boolean);
    const actionPath = path.join(gDir, "action.json");
    const action = fs.existsSync(actionPath)
      ? JSON.parse(fs.readFileSync(actionPath, "utf8"))
      : null;
    const likedIds = new Set(
      action
        ? [
            ...(action.liked?.id ? [action.liked.id] : []),
            ...(action.likedA?.ids ?? []),
            ...(action.likedB?.ids ?? [])
          ]
        : []
    );
    const dislikedIds = new Set(action?.disliked?.ids ?? []);

    body += `<div class="board"><div class="board-head">Generation ${gi} · <span class="recipe">${esc(
      manifest.recipe || "?"
    )}</span></div><div class="grid">`;
    pngs.forEach((png) => {
      const id6 = png.replace(/\.png$/, "").split("-").slice(-1)[0];
      const v = manifest.variants.find((x) => x.id.slice(-6) === id6);
      const klass = v && likedIds.has(v.id) ? "liked" : v && dislikedIds.has(v?.id) ? "disliked" : "";
      const tag = klass === "liked" ? "👍 liked" : klass === "disliked" ? "👎 disliked" : "";
      body += `<figure class="${klass}"><img src="${rel(path.join(gDir, png))}" loading="lazy"/>${
        tag ? `<figcaption>${tag}</figcaption>` : ""
      }</figure>`;
    });
    body += `</div></div>`;

    if (action) {
      const mode = action.decision?.mode || "refine";
      const likeLines = action.liked
        ? [`<li><strong>Liked</strong> the closest image — keep: ${esc((action.liked.chips || []).join(", "))}</li>`]
        : [
            action.likedA
              ? `<li><strong>Liked ${action.likedA.ids.length}×</strong> — ${esc(action.likedA.facet)} (${esc((action.likedA.chips || []).join(", "))})</li>`
              : "",
            action.likedB && action.likedB.ids.length
              ? `<li><strong>Also liked ${action.likedB.ids.length}×</strong> — ${esc(action.likedB.facet)} (${esc((action.likedB.chips || []).join(", "))})</li>`
              : ""
          ];
      body += `<div class="action"><div class="arrow">▼ ACTION · <span class="mode">${esc(
        mode
      )}</span></div><ul>
        ${likeLines.filter(Boolean).join("\n        ")}
        <li><strong>Disliked</strong> ${action.disliked.ids.length} off-target — avoid: ${esc(
        (action.disliked.chips || []).join(", ")
      )}</li>
        <li><strong>${esc(mode)}</strong> → ${esc(action.decision.promptIntent)}</li>
      </ul></div>`;
    }
  });

  const lastRecipe = traj.trajectory
    ? traj.trajectory[traj.trajectory.length - 1].recipe
    : (traj.recipes || []).slice(-1)[0];
  body += `<p class="outcome">Final generation (${esc(lastRecipe)}) — converged board above is the steered result.</p>`;
  body += `</section>`;
}

const html = `<!doctype html><html><head><meta charset="utf-8"/>
<title>PicKasso steering trajectories</title>
<style>
  body{font:15px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;margin:0;background:#f5f5f4;color:#1c1917}
  header{padding:28px 40px;background:#1c1917;color:#fafaf9}
  header h1{margin:0 0 4px;font-size:22px}
  header p{margin:0;opacity:.7;font-size:13px}
  .scenario{max-width:1100px;margin:32px auto;background:#fff;border-radius:14px;padding:24px 28px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
  .scenario h2{margin:0 0 4px;font-size:18px;text-transform:capitalize}
  .target{margin:0 0 18px;color:#57534e;font-size:14px}
  .board-head{font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#78716c;margin:10px 0 8px}
  .recipe{color:#0d9488}
  .grid{display:flex;flex-wrap:wrap;gap:10px}
  figure{margin:0;width:150px;border-radius:10px;overflow:hidden;background:#e7e5e4;position:relative;border:3px solid transparent}
  figure img{width:100%;display:block;aspect-ratio:1;object-fit:cover}
  figure.liked{border-color:#16a34a}
  figure.disliked{border-color:#dc2626;opacity:.65}
  figcaption{position:absolute;bottom:0;left:0;right:0;font-size:11px;text-align:center;padding:2px;background:rgba(0,0,0,.6);color:#fff}
  .action{margin:14px 0 6px;padding:12px 16px;background:#f0fdfa;border-left:3px solid #0d9488;border-radius:8px}
  .action .arrow{font-size:12px;font-weight:700;color:#0d9488;letter-spacing:.06em}
  .action .mode{background:#0d9488;color:#fff;padding:1px 8px;border-radius:10px;font-size:11px;text-transform:uppercase}
  .action ul{margin:6px 0 0;padding-left:18px;font-size:13px;color:#374151}
  .outcome{margin:16px 0 0;font-size:13px;color:#16a34a;font-weight:600}
</style></head><body>
<header><h1>PicKasso — image steering trajectories</h1>
<p>Each scenario: a generated image set → the user action (like / dislike / refine) → the next set. Pipeline routes feedback into dedicated orchestration recipes; convergence shown across 5 real generations (live OpenAI: o4-mini prompts, gpt-image-1 images).</p></header>
${body}
</body></html>`;

fs.writeFileSync(path.join(OUT_DIR, "index.html"), html);
console.log(`showcase written: ${path.join(OUT_DIR, "index.html")} (${scenarios.length} scenarios)`);
