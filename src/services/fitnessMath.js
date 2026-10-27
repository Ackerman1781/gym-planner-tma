// Fitness calculation formulas

// 1 Rep Max estimation
export const calculate1RM = (weight, reps) => {
  const w = parseFloat(weight);
  const r = parseInt(reps, 10);

  if (!w || !r || w <= 0 || r <= 0) return 0;
  if (r === 1) return Math.round(w);

  // Epley formula: w * (1 + r / 30)
  // Brzycki formula: w / (1.0278 - 0.0278 * r)
  const epley = w * (1 + r / 30);
  const brzycki = r < 37 ? w / (1.0278 - 0.0278 * r) : epley;
  
  // Average for accuracy
  const avg = (epley + brzycki) / 2;
  return Math.round(avg * 10) / 10;
};

// Percentages of 1RM (for training cycles: 95%, 90%, 85%, etc.)
export const get1RMPercentages = (oneRM) => {
  const percentages = [95, 90, 85, 80, 75, 70, 65, 60, 50];
  return percentages.map((p) => ({
    percent: p,
    weight: Math.round((oneRM * (p / 100)) * 2) / 2 // round to nearest 0.5kg
  }));
};

// Calculate total tonnage: sum of (weight * reps) for completed sets
export const calculateWorkoutStats = (exercises = []) => {
  let totalSets = 0;
  let totalReps = 0;
  let totalTonnage = 0;

  exercises.forEach((ex) => {
    ex.sets?.forEach((s) => {
      if (s.completed) {
        totalSets += 1;
        const reps = parseInt(s.reps, 10) || 0;
        const weight = parseFloat(s.weight) || 0;
        totalReps += reps;
        totalTonnage += weight * reps;
      }
    });
  });

  return {
    totalSets,
    totalReps,
    totalTonnage: Math.round(totalTonnage)
  };
};

export const formatDuration = (totalSeconds) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins < 60) {
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours}г ${remMins}хв`;
};
