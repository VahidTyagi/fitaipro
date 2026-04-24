// Mifflin-St Jeor BMR + TDEE + goal-based calorie targets
// Science source: NASM, Built With Science, US Dietary Guidelines

export interface UserProfile {
    gender: string;       // male | female
    age: number;
    currentWeight: number; // kg
    targetWeight: number;  // kg
    height: number;        // cm
    goal: string;          // lose_weight | build_muscle | stay_fit | improve_endurance
    fitnessLevel: string;  // beginner | intermediate | advanced
    workoutDaysPerWeek: number;
    dailySteps: number;
  }
  
  export interface FitnessCalculation {
    bmr: number;
    tdee: number;
    targetCalories: number;
    protein: number; // grams/day
    carbs: number;
    fat: number;
    weeklyWeightChange: number; // kg per week (negative = loss)
    weeksToGoal: number;
    monthsToGoal: number;
    bmi: number;
    bmiCategory: string;
    isHealthyWeight: boolean;
    calorieDeficitOrSurplus: number;
    progressMilestones: { week: number; weight: number; label: string }[];
    ageGroup: "teen" | "adult" | "middle" | "senior";
    specialNotes: string[];
  }
  
  // Activity multipliers based on exercise frequency + steps
  function getActivityMultiplier(workoutDays: number, dailySteps: number): number {
    const stepBonus = dailySteps > 10000 ? 0.1 : dailySteps > 7000 ? 0.05 : 0;
    if (workoutDays >= 6) return 1.725 + stepBonus;
    if (workoutDays >= 4) return 1.55 + stepBonus;
    if (workoutDays >= 2) return 1.375 + stepBonus;
    return 1.2 + stepBonus;
  }
  
  function getAgeGroup(age: number): "teen" | "adult" | "middle" | "senior" {
    if (age < 20) return "teen";
    if (age < 40) return "adult";
    if (age < 60) return "middle";
    return "senior";
  }
  
  export function calculateFitness(p: UserProfile): FitnessCalculation {
    const ageGroup = getAgeGroup(p.age);
  
    // Mifflin-St Jeor BMR
    let bmr: number;
    if (p.gender === "female") {
      bmr = 10 * p.currentWeight + 6.25 * p.height - 5 * p.age - 161;
    } else {
      bmr = 10 * p.currentWeight + 6.25 * p.height - 5 * p.age + 5;
    }
  
    // Age-based metabolic reduction (after 40: ~1% per decade, after 60: more)
    if (ageGroup === "middle") bmr *= 0.97;
    if (ageGroup === "senior") bmr *= 0.93;
  
    const activityMultiplier = getActivityMultiplier(p.workoutDaysPerWeek, p.dailySteps);
    const tdee = Math.round(bmr * activityMultiplier);
  
    // Goal-based calorie targets
    let calorieAdjustment = 0;
    let weeklyWeightChange = 0;
  
    if (p.goal === "lose_weight") {
      // Safe deficit: 300-500 cal (seniors: 300 max)
      calorieAdjustment = ageGroup === "senior" ? -300 : -500;
      weeklyWeightChange = -(Math.abs(calorieAdjustment) * 7) / 7700; // 7700 cal = 1kg
    } else if (p.goal === "build_muscle") {
      // Lean bulk: 200-300 surplus (less for seniors/women)
      calorieAdjustment = p.gender === "female" ? 200 : (ageGroup === "senior" ? 150 : 300);
      weeklyWeightChange = (calorieAdjustment * 7) / 7700;
    } else {
      calorieAdjustment = 0;
      weeklyWeightChange = 0;
    }
  
    const targetCalories = Math.max(1200, Math.round(tdee + calorieAdjustment));
  
    // Protein targets (higher for muscle gain, weight loss preservation)
    // Senior: 1.2-1.6g/kg (higher to prevent muscle loss)
    let proteinPerKg: number;
    if (ageGroup === "senior") {
      proteinPerKg = 1.4;
    } else if (p.goal === "build_muscle") {
      proteinPerKg = p.gender === "female" ? 1.6 : 2.0;
    } else if (p.goal === "lose_weight") {
      proteinPerKg = 1.6; // preserve muscle during deficit
    } else {
      proteinPerKg = 1.2;
    }
  
    const protein = Math.round(p.currentWeight * proteinPerKg);
    const fat = Math.round((targetCalories * 0.28) / 9); // 28% from fat
    const carbCals = targetCalories - protein * 4 - fat * 9;
    const carbs = Math.round(Math.max(100, carbCals / 4));
  
    // BMI
    const heightM = p.height / 100;
    const bmi = Math.round((p.currentWeight / (heightM * heightM)) * 10) / 10;
    const bmiCategory =
      bmi < 18.5 ? "Underweight" :
      bmi < 25 ? "Normal Weight" :
      bmi < 30 ? "Overweight" : "Obese";
    const isHealthyWeight = bmi >= 18.5 && bmi < 25;
  
    // Goal timeline
    const weightDiff = Math.abs(p.targetWeight - p.currentWeight);
    let weeksToGoal = 0;
    if (weeklyWeightChange !== 0) {
      weeksToGoal = Math.ceil(weightDiff / Math.abs(weeklyWeightChange));
    }
    const monthsToGoal = Math.ceil(weeksToGoal / 4.3);
  
    // Progress milestones
    const progressMilestones: { week: number; weight: number; label: string }[] = [];
    if (weeklyWeightChange !== 0) {
      const direction = p.goal === "lose_weight" ? -1 : 1;
      [4, 8, 12, 16, 20, 24].forEach(week => {
        const weightAtWeek = Math.round((p.currentWeight + direction * Math.abs(weeklyWeightChange) * week) * 10) / 10;
        const closer = direction === -1
          ? weightAtWeek >= p.targetWeight
          : weightAtWeek <= p.targetWeight;
        const w = closer ? p.targetWeight : weightAtWeek;
        let label = `Week ${week}`;
        if (week === 4) label = "1 Month";
        if (week === 8) label = "2 Months";
        if (week === 12) label = "3 Months 🎯";
        progressMilestones.push({ week, weight: w, label });
      });
    }
  
    // Special notes based on profile
    const specialNotes: string[] = [];
    if (ageGroup === "senior") {
      specialNotes.push("Focus on low-impact exercises to protect joints");
      specialNotes.push("Prioritize balance and flexibility training");
      specialNotes.push("Minimum 1.4g protein/kg to prevent muscle loss");
    }
    if (bmi > 30) specialNotes.push("High-impact exercises may strain joints — start with walking and swimming");
    if (p.gender === "female" && p.goal === "build_muscle") {
      specialNotes.push("Women build muscle slower than men — focus on progressive overload");
    }
    if (p.dailySteps < 5000) specialNotes.push("Increasing daily steps is the easiest calorie burn improvement");
  
    return {
      bmr: Math.round(bmr), tdee, targetCalories, protein, carbs, fat,
      weeklyWeightChange: Math.round(weeklyWeightChange * 100) / 100,
      weeksToGoal, monthsToGoal, bmi, bmiCategory, isHealthyWeight,
      calorieDeficitOrSurplus: calorieAdjustment,
      progressMilestones, ageGroup, specialNotes,
    };
  }
  
  // Gender + age specific workout recommendations
  export function getWorkoutRecommendations(p: UserProfile): {
    intensity: string;
    sessionsPerWeek: number;
    sessionDuration: number;
    restDays: number;
    focusAreas: string[];
    avoidExercises: string[];
    notes: string;
  } {
    const ageGroup = getAgeGroup(p.age);
  
    if (ageGroup === "senior") {
      return {
        intensity: "Low to Moderate",
        sessionsPerWeek: 4,
        sessionDuration: 30,
        restDays: 3,
        focusAreas: ["Walking", "Chair exercises", "Light weights", "Yoga", "Swimming"],
        avoidExercises: ["Heavy deadlifts", "High-impact jumping", "Heavy overhead press"],
        notes: "Joint health is priority. Warm up for 10+ minutes. Stop if any pain.",
      };
    }
  
    if (p.gender === "female" && p.goal === "lose_weight") {
      return {
        intensity: "Moderate",
        sessionsPerWeek: 4,
        sessionDuration: 40,
        restDays: 3,
        focusAreas: ["HIIT", "Full body strength", "Cardio", "Core"],
        avoidExercises: [],
        notes: "Women respond well to full-body training with moderate weights and higher reps.",
      };
    }
  
    if (p.goal === "build_muscle" && p.gender === "male") {
      return {
        intensity: "High",
        sessionsPerWeek: 5,
        sessionDuration: 60,
        restDays: 2,
        focusAreas: ["Push", "Pull", "Legs", "Compound lifts"],
        avoidExercises: [],
        notes: "Progressive overload is key. Increase weight every 1-2 weeks.",
      };
    }
  
    const baseRecs = {
      sessionsPerWeek: p.fitnessLevel === "advanced" ? 5 : p.fitnessLevel === "intermediate" ? 4 : 3,
      sessionDuration: p.fitnessLevel === "advanced" ? 60 : 45,
      restDays: p.fitnessLevel === "advanced" ? 2 : 3,
      intensity: p.fitnessLevel === "advanced" ? "High" : "Moderate",
      focusAreas: ["Full body", "Cardio", "Core"],
      avoidExercises: [] as string[],
      notes: "Build consistency before intensity.",
    };
  
    if (ageGroup === "middle") {
      baseRecs.notes = "After 40, recovery is slower. Prioritize sleep and protein for muscle preservation.";
    }
  
    return baseRecs;
  }