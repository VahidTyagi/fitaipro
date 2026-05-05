/**
 * Downloads exercise GIFs from ExerciseDB and uploads to Cloudinary
 * Run once: node scripts/upload-gifs-cloudinary.js
 * All GIFs will be permanently hosted at:
 * https://res.cloudinary.com/YOUR_CLOUD/image/upload/fitaipro-gifs/EXERCISE_ID.gif
 */

require("dotenv").config({ path: ".env.local" });
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.error("❌ Missing Cloudinary env vars. Check .env.local");
  process.exit(1);
}

// ExerciseDB API - public, no auth needed for this endpoint
const EXERCISES = [
  // Format: { id: "our_exercise_id", exerciseDbId: "exercisedb_id" }
  { id: "pushup",            name: "Push Up",             bodyPart: "chest" },
  { id: "squat_bw",          name: "Squat",               bodyPart: "upper legs" },
  { id: "plank",             name: "Plank",               bodyPart: "waist" },
  { id: "lunge_bw",          name: "Lunge",               bodyPart: "upper legs" },
  { id: "mountain_climber",  name: "Mountain Climber",    bodyPart: "waist" },
  { id: "burpee",            name: "Burpee",              bodyPart: "cardio" },
  { id: "glute_bridge",      name: "Glute Bridge",        bodyPart: "upper legs" },
  { id: "jumping_jack",      name: "Jumping Jack",        bodyPart: "cardio" },
  { id: "crunches",          name: "Crunch",              bodyPart: "waist" },
  { id: "high_knees",        name: "High Knees",          bodyPart: "cardio" },
  { id: "tricep_dip",        name: "Dip",                 bodyPart: "upper arms" },
  { id: "superman",          name: "Superman",            bodyPart: "back" },
  { id: "wall_sit",          name: "Wall Sit",            bodyPart: "upper legs" },
  { id: "leg_raise",         name: "Leg Raise",           bodyPart: "waist" },
  { id: "db_bench_press",    name: "Bench Press",         bodyPart: "chest" },
  { id: "db_row",            name: "Bent Over Row",       bodyPart: "back" },
  { id: "db_shoulder_press", name: "Shoulder Press",      bodyPart: "shoulders" },
  { id: "goblet_squat",      name: "Goblet Squat",        bodyPart: "upper legs" },
  { id: "db_curl",           name: "Bicep Curl",          bodyPart: "upper arms" },
  { id: "db_lateral_raise",  name: "Lateral Raise",       bodyPart: "shoulders" },
  { id: "barbell_bench",     name: "Barbell Bench Press", bodyPart: "chest" },
  { id: "deadlift",          name: "Deadlift",            bodyPart: "upper legs" },
  { id: "squat_barbell",     name: "Barbell Squat",       bodyPart: "upper legs" },
  { id: "overhead_press",    name: "Overhead Press",      bodyPart: "shoulders" },
  { id: "lat_pulldown",      name: "Lat Pulldown",        bodyPart: "back" },
  { id: "leg_press",         name: "Leg Press",           bodyPart: "upper legs" },
  { id: "tricep_pushdown",   name: "Triceps Pushdown",    bodyPart: "upper arms" },
  { id: "face_pull",         name: "Face Pull",           bodyPart: "shoulders" },
  { id: "cable_row",         name: "Cable Row",           bodyPart: "back" },
];

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    lib.get(url, { headers: { "User-Agent": "FitAIPro/1.0", "x-rapidapi-host": "exercisedb.p.rapidapi.com" } }, (res) => {
      let data = "";
      res.on("data", (d) => (data += d));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error("JSON parse failed: " + data.slice(0, 100))); }
      });
    }).on("error", reject);
  });
}

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const chunks = [];
    lib.get(url, { headers: { "User-Agent": "FitAIPro/1.0" } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadBuffer(res.headers.location).then(resolve).catch(reject);
      }
      res.on("data", (d) => chunks.push(d));
      res.on("end", () => resolve(Buffer.concat(chunks)));
    }).on("error", reject);
  });
}

function uploadToCloudinary(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const crypto = require("crypto");
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const str = `folder=fitaipro-gifs&public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`;
    const signature = crypto.createHash("sha256").update(str).digest("hex");

    const boundary = "----FormBoundary" + Math.random().toString(36);
    const parts = [
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="gif.gif"\r\nContent-Type: image/gif\r\n\r\n`,
      buffer,
      `\r\n--${boundary}\r\nContent-Disposition: form-data; name="public_id"\r\n\r\n${publicId}`,
      `\r\n--${boundary}\r\nContent-Disposition: form-data; name="folder"\r\n\r\nfitaipro-gifs`,
      `\r\n--${boundary}\r\nContent-Disposition: form-data; name="timestamp"\r\n\r\n${timestamp}`,
      `\r\n--${boundary}\r\nContent-Disposition: form-data; name="api_key"\r\n\r\n${API_KEY}`,
      `\r\n--${boundary}\r\nContent-Disposition: form-data; name="signature"\r\n\r\n${signature}`,
      `\r\n--${boundary}--\r\n`,
    ];

    const bodyParts = parts.map((p) => (typeof p === "string" ? Buffer.from(p) : p));
    const body = Buffer.concat(bodyParts);

    const options = {
      hostname: "api.cloudinary.com",
      path: `/v1_1/${CLOUD_NAME}/image/upload`,
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": body.length,
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (d) => (data += d));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (json.secure_url) resolve(json.secure_url);
          else reject(new Error(json.error?.message || "Upload failed: " + data.slice(0, 200)));
        } catch {
          reject(new Error("Response parse failed"));
        }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// Search ExerciseDB for exercise GIF
async function findExerciseGif(name, bodyPart) {
  try {
    const encoded = encodeURIComponent(name.toLowerCase());
    const url = `https://exercisedb.p.rapidapi.com/exercises/name/${encoded}?limit=5&offset=0`;
    // Note: This requires RapidAPI key for ExerciseDB
    // Alternative: use free wger.de API
    const wgerUrl = `https://wger.de/api/v2/exercise/search/?term=${encoded}&language=english&format=json`;
    const data = await fetchJson(wgerUrl);
    if (data.suggestions && data.suggestions.length > 0) {
      return data.suggestions[0].data?.image || null;
    }
  } catch {
    return null;
  }
  return null;
}

// Map of exercise IDs to known working GIF URLs (from various free sources)
const KNOWN_GIF_URLS = {
  pushup:           "https://media.giphy.com/media/4cvr3fBHc5BNS/giphy.gif",
  squat_bw:         "https://media.giphy.com/media/RH1IFq2GT0Oau8NRWX/giphy.gif",
  mountain_climber: "https://media.giphy.com/media/7YCC7faEgHvioFCT3s/giphy.gif",
  burpee:           "https://media.giphy.com/media/l0ExheuSo5PEQHUFq/giphy.gif",
  jumping_jack:     "https://media.giphy.com/media/lpmS8C85FoJoM/giphy.gif",
  crunches:         "https://media.giphy.com/media/xTiTnHXbRoaZ1B1Mo8/giphy.gif",
  high_knees:       "https://media.giphy.com/media/3o7TKFBWTQAQbbFoSk/giphy.gif",
  // Add more as you find them
};

async function run() {
  console.log(`\n🏋️  FitAI Pro — GIF Upload to Cloudinary`);
  console.log(`   Cloud: ${CLOUD_NAME}\n`);

  const results = {};
  let ok = 0, fail = 0;

  for (const ex of EXERCISES) {
    process.stdout.write(`  Processing: ${ex.id} (${ex.name})... `);

    try {
      // Try known URL first
      const gifUrl = KNOWN_GIF_URLS[ex.id];
      if (!gifUrl) {
        console.log(`⏭  No source URL — add to KNOWN_GIF_URLS`);
        fail++;
        continue;
      }

      // Download
      const buffer = await downloadBuffer(gifUrl);
      if (buffer.length < 1000) throw new Error("Buffer too small — likely 404");

      // Upload to Cloudinary
      const cloudUrl = await uploadToCloudinary(buffer, ex.id);
      results[ex.id] = cloudUrl;
      ok++;
      console.log(`✅`);

    } catch (e) {
      console.log(`❌ ${e.message}`);
      fail++;
    }

    await new Promise((r) => setTimeout(r, 500));
  }

  // Save mapping to file
  const outputPath = path.join(__dirname, "../lib/gif-urls.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log(`\n✅ Done: ${ok} uploaded, ${fail} skipped`);
  console.log(`📄 URLs saved to: lib/gif-urls.json`);
  console.log(`\nNext: Update ExerciseGif.tsx to use these URLs\n`);
}

run().catch(console.error);