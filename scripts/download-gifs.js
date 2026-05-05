// NEW download script using YOUR deployed ExerciseDB
const https = require("https");
const fs = require("fs");
const path = require("path");

// Replace with YOUR deployed ExerciseDB URL
const EXERCISEDB_BASE = process.env.EXERCISEDB_URL || "https://exercisedb-api-yours.vercel.app";
const MEDIA_BASE = `${EXERCISEDB_BASE}/media`;
const OUTPUT = path.join(__dirname, "../public/gifs");

if (!fs.existsSync(OUTPUT)) fs.mkdirSync(OUTPUT, { recursive: true });

// Exercise name → ExerciseDB filename mapping
const EXERCISES = [
  { id: "pushup",            file: "Push-Up_Chest.gif" },
  { id: "squat_bw",          file: "Bodyweight-Squat_Quads.gif" },
  { id: "plank",             file: "Plank_Abs.gif" },
  { id: "lunge_bw",          file: "Reverse-Lunge_Quads.gif" },
  { id: "mountain_climber",  file: "Mountain-Climber_Abs.gif" },
  { id: "burpee",            file: "Burpee_Cardio.gif" },
  { id: "glute_bridge",      file: "Glute-Bridge_Glutes.gif" },
  { id: "jumping_jack",      file: "Jumping-Jacks_Cardio.gif" },
  { id: "crunches",          file: "Crunch_Abs.gif" },
  { id: "high_knees",        file: "High-Knees_Cardio.gif" },
  { id: "tricep_dip",        file: "Triceps-Dip_Triceps.gif" },
  { id: "superman",          file: "Superman_Back.gif" },
  { id: "wall_sit",          file: "Wall-Sit_Quads.gif" },
  { id: "leg_raise",         file: "Leg-Raise_Abs.gif" },
  { id: "pike_pushup",       file: "Pike-Push-Up_Shoulders.gif" },
  { id: "db_bench_press",    file: "Dumbbell-Bench-Press_Chest.gif" },
  { id: "db_row",            file: "Bent-Over-Dumbbell-Row_Back.gif" },
  { id: "db_shoulder_press", file: "Dumbbell-Shoulder-Press_Shoulders.gif" },
  { id: "goblet_squat",      file: "Goblet-Squat_Quads.gif" },
  { id: "db_curl",           file: "Dumbbell-Bicep-Curl_Biceps.gif" },
  { id: "db_rdl",            file: "Romanian-Deadlift_Hamstrings.gif" },
  { id: "db_lateral_raise",  file: "Lateral-Raise_Shoulders.gif" },
  { id: "db_chest_fly",      file: "Dumbbell-Flyes_Chest.gif" },
  { id: "db_lunge",          file: "Dumbbell-Lunge_Quads.gif" },
  { id: "barbell_bench",     file: "Barbell-Bench-Press_Chest.gif" },
  { id: "deadlift",          file: "Barbell-Deadlift_Back.gif" },
  { id: "squat_barbell",     file: "Barbell-Back-Squat_Quads.gif" },
  { id: "overhead_press",    file: "Barbell-Overhead-Press_Shoulders.gif" },
  { id: "lat_pulldown",      file: "Lat-Pulldown_Back.gif" },
  { id: "leg_press",         file: "Leg-Press_Quads.gif" },
  { id: "tricep_pushdown",   file: "Triceps-Pushdown_Triceps.gif" },
  { id: "face_pull",         file: "Face-Pull_Shoulders.gif" },
  { id: "cable_row",         file: "Seated-Cable-Row_Back.gif" },
  { id: "incline_db_press",  file: "Incline-Dumbbell-Press_Chest.gif" },
  { id: "leg_curl",          file: "Lying-Leg-Curl_Hamstrings.gif" },
];

function download(url, dest) {
  return new Promise((resolve) => {
    if (fs.existsSync(dest)) {
      console.log(`⏭  Skip: ${path.basename(dest)}`);
      return resolve(true);
    }
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { "User-Agent": "FitAIPro/1.0" } }, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on("finish", () => { file.close(); console.log(`✅ ${path.basename(dest)}`); resolve(true); });
      } else {
        file.close();
        try { fs.unlinkSync(dest); } catch {}
        console.log(`❌ ${res.statusCode}: ${path.basename(dest)}`);
        resolve(false);
      }
    }).on("error", (e) => { console.log(`❌ Error: ${e.message}`); resolve(false); });
  });
}

async function run() {
  console.log(`\n🏋️  Downloading ${EXERCISES.length} exercise GIFs to /public/gifs/\n`);
  let ok = 0, fail = 0;
  for (const ex of EXERCISES) {
    const url = `${MEDIA_BASE}/${ex.file}`;
    const dest = path.join(OUTPUT, `${ex.id}.gif`);
    const success = await download(url, dest);
    if (success) ok++; else fail++;
    await new Promise(r => setTimeout(r, 200));
  }
  console.log(`\n✅ Done: ${ok} downloaded, ${fail} failed`);
  console.log(`📁 Location: /public/gifs/\n`);
}

<<<<<<< HEAD
run();
=======
run();

>>>>>>> b0685791ef1bcaa61c79626d6a0da9e16b21e2cb
