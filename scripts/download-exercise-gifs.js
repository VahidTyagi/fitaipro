/**
 * Downloads real animated exercise GIFs from ExerciseDB (RapidAPI)
 * Run: node scripts/download-exercise-gifs.js YOUR_RAPIDAPI_KEY
 * Free tier: 50 requests/day — enough for all 37 GIFs
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

const API_KEY = process.argv[2];
if (!API_KEY) {
  console.error("Usage: node scripts/download-exercise-gifs.js f1414e538dmsh00fcf5abbe069efp1e1677jsn0af6c5d8aa41");
  process.exit(1);
}

const OUT = path.join(__dirname, "../public/gifs");
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// ExerciseDB exercise names mapped to our IDs
const EXERCISES = [
  { id: "pushup",            name: "push-up" },
  { id: "squat_bw",          name: "squat" },
  { id: "plank",             name: "plank" },
  { id: "lunge_bw",          name: "lunge" },
  { id: "mountain_climber",  name: "mountain climber" },
  { id: "burpee",            name: "burpee" },
  { id: "glute_bridge",      name: "glute bridge" },
  { id: "jumping_jack",      name: "jumping jack" },
  { id: "crunches",          name: "crunch" },
  { id: "high_knees",        name: "high knees" },
  { id: "tricep_dip",        name: "triceps dip" },
  { id: "superman",          name: "superman" },
  { id: "wall_sit",          name: "wall sit" },
  { id: "leg_raise",         name: "leg raise" },
  { id: "pike_pushup",       name: "pike push up" },
  { id: "db_bench_press",    name: "dumbbell bench press" },
  { id: "db_row",            name: "dumbbell bent over row" },
  { id: "db_shoulder_press", name: "dumbbell shoulder press" },
  { id: "goblet_squat",      name: "goblet squat" },
  { id: "db_curl",           name: "dumbbell bicep curl" },
  { id: "db_rdl",            name: "romanian deadlift" },
  { id: "db_lateral_raise",  name: "lateral raise" },
  { id: "db_chest_fly",      name: "dumbbell fly" },
  { id: "db_lunge",          name: "dumbbell lunge" },
  { id: "db_tricep_ext",     name: "triceps extension" },
  { id: "barbell_bench",     name: "barbell bench press" },
  { id: "deadlift",          name: "deadlift" },
  { id: "squat_barbell",     name: "barbell squat" },
  { id: "overhead_press",    name: "overhead press" },
  { id: "lat_pulldown",      name: "lat pulldown" },
  { id: "cable_fly",         name: "cable crossover" },
  { id: "leg_press",         name: "leg press" },
  { id: "tricep_pushdown",   name: "triceps pushdown" },
  { id: "face_pull",         name: "face pull" },
  { id: "cable_row",         name: "seated cable row" },
  { id: "incline_db_press",  name: "incline dumbbell press" },
  { id: "leg_curl",          name: "leg curl" },
];

function httpsGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return httpsGet(res.headers.location, headers).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve({ status: res.statusCode, data: Buffer.concat(chunks), headers: res.headers }));
    }).on("error", reject);
  });
}

async function searchExercise(name) {
  const encoded = encodeURIComponent(name);
  const res = await httpsGet(
    `https://exercisedb.p.rapidapi.com/exercises/name/${encoded}?limit=1&offset=0`,
    {
      "X-RapidAPI-Key": API_KEY,
      "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
    }
  );
  if (res.status !== 200) return null;
  const data = JSON.parse(res.data.toString());
  if (!data || data.length === 0) return null;
  return data[0].gifUrl; // Returns the animated GIF URL
}

async function downloadGif(gifUrl, dest) {
  const res = await httpsGet(gifUrl, {
    "User-Agent": "Mozilla/5.0",
  });
  if (res.status !== 200) return false;
  fs.writeFileSync(dest, res.data);
  return true;
}

async function run() {
  console.log(`\n🏋️  Downloading ${EXERCISES.length} exercise GIFs from ExerciseDB\n`);
  let ok = 0, fail = 0;

  for (const ex of EXERCISES) {
    const dest = path.join(OUT, `${ex.id}.gif`);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 10000) {
      console.log(`⏭  Skip: ${ex.id}`);
      ok++;
      continue;
    }

    try {
      process.stdout.write(`  Fetching: ${ex.name}... `);
      const gifUrl = await searchExercise(ex.name);
      if (!gifUrl) {
        console.log(`❌ Not found`);
        fail++;
        continue;
      }

      const success = await downloadGif(gifUrl, dest);
      if (success) {
        const size = fs.statSync(dest).size;
        console.log(`✅ (${(size / 1024).toFixed(0)}KB)`);
        ok++;
      } else {
        console.log(`❌ Download failed`);
        fail++;
      }
    } catch (e) {
      console.log(`❌ Error: ${e.message}`);
      fail++;
    }

    // 500ms delay between requests (stay within rate limits)
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n✅ Done: ${ok} downloaded, ${fail} failed`);

  if (ok > 0) {
    console.log(`\n📋 Now run:`);
    console.log(`   git add public/gifs/`);
    console.log(`   git commit -m "feat: real exercise GIFs from ExerciseDB"`);
    console.log(`   git push origin main\n`);
  }
}

run().catch(console.error);