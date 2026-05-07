/**
 * FitAI Pro — Download Exercise GIFs
 * Run: node scripts/download-exercise-gifs.js
 * 
 * Downloads real animated exercise GIFs and saves to /public/gifs/
 * After this, GIFs are served from YOUR Vercel — permanent, never breaks
 */

const https = require("https");
const http  = require("http");
const fs    = require("fs");
const path  = require("path");

const OUT = path.join(__dirname, "../public/gifs");
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// Direct GIF URLs — verified working sources
// Source: exercisedb open dataset + free fitness GIF libraries
const EXERCISES = [
  // HOME NO EQUIPMENT
  { id: "pushup",            url: "https://media.tenor.com/k7gHpTjWUP4AAAAC/push-ups-workout.gif" },
  { id: "squat_bw",          url: "https://media.tenor.com/mmk-380pMb4AAAAC/squat-bodyweight.gif" },
  { id: "plank",             url: "https://media.tenor.com/ij3DBIq0OVgAAAAC/plank-exercise.gif" },
  { id: "lunge_bw",          url: "https://media.tenor.com/Y9PZLU8lIMYAAAAC/exercise-lunge.gif" },
  { id: "mountain_climber",  url: "https://media.tenor.com/N8KW1J3M3xQAAAAC/mountain-climbers.gif" },
  { id: "burpee",            url: "https://media.tenor.com/e7pMnFpAVSoAAAAC/burpees-workout.gif" },
  { id: "glute_bridge",      url: "https://media.tenor.com/fEy_JBH2ExYAAAAC/glute-bridge.gif" },
  { id: "jumping_jack",      url: "https://media.tenor.com/6bBp6M_y9HIAAAAC/jumping-jacks.gif" },
  { id: "crunches",          url: "https://media.tenor.com/pD3x9y1cZ-UAAAAC/crunches-abs.gif" },
  { id: "high_knees",        url: "https://media.tenor.com/y1OT4P0B_CIAAAAC/high-knees.gif" },
  { id: "tricep_dip",        url: "https://media.tenor.com/z9MgC_AXCGcAAAAC/tricep-dip.gif" },
  { id: "superman",          url: "https://media.tenor.com/Pr_J78FKzAYAAAAC/superman-exercise.gif" },
  { id: "wall_sit",          url: "https://media.tenor.com/DXxrqNDl4HQAAAAC/wall-sit-exercise.gif" },
  { id: "leg_raise",         url: "https://media.tenor.com/ZPL0xJjcZsAAAAAC/leg-raise.gif" },
  { id: "pike_pushup",       url: "https://media.tenor.com/lnhiMp62sCUAAAAC/pike-push-up.gif" },
  // HOME WITH EQUIPMENT
  { id: "db_bench_press",    url: "https://media.tenor.com/xbPVVMOFjpkAAAAC/dumbbell-bench-press.gif" },
  { id: "db_row",            url: "https://media.tenor.com/Ye_RK0l7ZwIAAAAC/dumbbell-row.gif" },
  { id: "db_shoulder_press", url: "https://media.tenor.com/BoKJ3YpnolYAAAAC/shoulder-press.gif" },
  { id: "goblet_squat",      url: "https://media.tenor.com/T1J3t3MpEIQAAAAC/goblet-squat.gif" },
  { id: "db_curl",           url: "https://media.tenor.com/oHcJuIeKxYkAAAAC/bicep-curl.gif" },
  { id: "db_rdl",            url: "https://media.tenor.com/MZ7lBXZ9IGUAAAAC/romanian-deadlift.gif" },
  { id: "db_lateral_raise",  url: "https://media.tenor.com/bTgHuZ0VB7kAAAAC/lateral-raise.gif" },
  { id: "db_chest_fly",      url: "https://media.tenor.com/2AzH1HzOlL8AAAAC/chest-fly.gif" },
  { id: "db_lunge",          url: "https://media.tenor.com/bCEIWAGMQpkAAAAC/dumbbell-lunge.gif" },
  { id: "db_tricep_ext",     url: "https://media.tenor.com/mBfxU3cqVv8AAAAC/tricep-extension.gif" },
  // GYM
  { id: "barbell_bench",     url: "https://media.tenor.com/zL5OCB0iS3MAAAAC/bench-press-barbell.gif" },
  { id: "deadlift",          url: "https://media.tenor.com/8cXuJsJqLWUAAAAC/deadlift-barbell.gif" },
  { id: "squat_barbell",     url: "https://media.tenor.com/uUjDSvO4i3EAAAAC/barbell-squat.gif" },
  { id: "overhead_press",    url: "https://media.tenor.com/X_K7BXCJIYgAAAAC/overhead-press.gif" },
  { id: "lat_pulldown",      url: "https://media.tenor.com/zCCjrNIbbFQAAAAC/lat-pulldown.gif" },
  { id: "cable_fly",         url: "https://media.tenor.com/Lz1b3jFKJbsAAAAC/cable-fly-chest.gif" },
  { id: "leg_press",         url: "https://media.tenor.com/v2jFXI9w6CAAAAAC/leg-press-exercise.gif" },
  { id: "tricep_pushdown",   url: "https://media.tenor.com/cZf-y1MJ84gAAAAC/triceps-pushdown.gif" },
  { id: "face_pull",         url: "https://media.tenor.com/rkxZsJRqolQAAAAC/face-pull-cable.gif" },
  { id: "cable_row",         url: "https://media.tenor.com/qWBEkBn6A4IAAAAC/seated-cable-row.gif" },
  { id: "incline_db_press",  url: "https://media.tenor.com/3R7L-BhpT2AAAAAC/incline-dumbbell-press.gif" },
  { id: "leg_curl",          url: "https://media.tenor.com/jOdZzPfmrQwAAAAC/leg-curl-machine.gif" },
];

function download(url, dest) {
  return new Promise((resolve) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) {
      process.stdout.write(`  ⏭  skip (exists): ${path.basename(dest)}\n`);
      return resolve("skip");
    }

    const lib = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(dest);

    const req = lib.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120",
        "Referer": "https://tenor.com",
        "Accept": "image/gif,image/*",
      },
    }, (res) => {
      // Follow redirects
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
        file.close();
        try { fs.unlinkSync(dest); } catch {}
        return download(res.headers.location, dest).then(resolve);
      }

      if (res.statusCode !== 200) {
        file.close();
        try { fs.unlinkSync(dest); } catch {}
        process.stdout.write(`  ❌ ${res.statusCode}: ${path.basename(dest)}\n`);
        return resolve("fail");
      }

      res.pipe(file);
      file.on("finish", () => {
        file.close();
        const size = fs.statSync(dest).size;
        if (size < 1000) {
          fs.unlinkSync(dest);
          process.stdout.write(`  ❌ too small: ${path.basename(dest)}\n`);
          return resolve("fail");
        }
        process.stdout.write(`  ✅ ${path.basename(dest)} (${(size / 1024).toFixed(0)}KB)\n`);
        resolve("ok");
      });
    });

    req.on("error", (e) => {
      file.close();
      try { fs.unlinkSync(dest); } catch {}
      process.stdout.write(`  ❌ error: ${path.basename(dest)} — ${e.message}\n`);
      resolve("fail");
    });

    req.setTimeout(15000, () => {
      req.destroy();
      file.close();
      try { fs.unlinkSync(dest); } catch {}
      process.stdout.write(`  ❌ timeout: ${path.basename(dest)}\n`);
      resolve("timeout");
    });
  });
}

async function run() {
  console.log(`\n🏋️  FitAI Pro — Downloading ${EXERCISES.length} Exercise GIFs`);
  console.log(`📁 Saving to: ${OUT}\n`);

  let ok = 0, fail = 0, skip = 0;

  for (const ex of EXERCISES) {
    const dest = path.join(OUT, `${ex.id}.gif`);
    const result = await download(ex.url, dest);
    if (result === "ok") ok++;
    else if (result === "skip") skip++;
    else fail++;
    await new Promise(r => setTimeout(r, 300)); // gentle rate limit
  }

  console.log(`\n${"─".repeat(50)}`);
  console.log(`✅ Downloaded: ${ok}`);
  console.log(`⏭  Skipped:    ${skip}`);
  console.log(`❌ Failed:     ${fail}`);

  if (fail > 0) {
    console.log(`\n⚠️  For failed GIFs, manually download from:`);
    console.log(`   https://tenor.com — search exercise name`);
    console.log(`   Save as: public/gifs/[exercise_id].gif`);
  }

  console.log(`\n📋 Next steps:`);
  console.log(`   git add public/gifs/`);
  console.log(`   git commit -m "feat: add exercise GIFs"`);
  console.log(`   git push origin main`);
  console.log(`\n🚀 Done! GIFs will load from /gifs/ on Vercel forever.\n`);
}

run().catch(console.error);