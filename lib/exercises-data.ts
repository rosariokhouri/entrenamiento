export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroups: string[];
  equipment: string;
  instructions: string[];
  tips: string[];
}

export const exercises: Exercise[] = [
  // Chest Exercises
  {
    id: "bench-press",
    name: "Bench Press",
    category: "Chest",
    muscleGroups: ["Chest", "Triceps", "Shoulders"],
    equipment: "Barbell",
    instructions: [
      "Lie flat on the bench with your eyes under the bar",
      "Grip the bar with hands slightly wider than shoulder-width",
      "Unrack the bar and lower it to your chest",
      "Press the bar back up to the starting position"
    ],
    tips: [
      "Keep your feet flat on the floor",
      "Maintain a slight arch in your back",
      "Control the weight on the way down"
    ]
  },
  {
    id: "incline-bench-press",
    name: "Incline Bench Press",
    category: "Chest",
    muscleGroups: ["Chest", "Triceps", "Shoulders"],
    equipment: "Barbell",
    instructions: [
      "Set the bench to a 30-45 degree incline",
      "Lie back and grip the bar with hands slightly wider than shoulders",
      "Lower the bar to your upper chest",
      "Press the bar back up to the starting position"
    ],
    tips: [
      "Don't set the incline too steep",
      "Focus on squeezing your chest at the top",
      "Keep your core engaged"
    ]
  },
  {
    id: "dumbbell-flyes",
    name: "Dumbbell Flyes",
    category: "Chest",
    muscleGroups: ["Chest"],
    equipment: "Dumbbells",
    instructions: [
      "Lie flat on a bench holding dumbbells above your chest",
      "Lower the weights in a wide arc until you feel a stretch",
      "Bring the weights back together above your chest",
      "Squeeze your chest muscles at the top"
    ],
    tips: [
      "Keep a slight bend in your elbows",
      "Focus on the stretch at the bottom",
      "Don't go too heavy"
    ]
  },
  {
    id: "push-ups",
    name: "Push-ups",
    category: "Chest",
    muscleGroups: ["Chest", "Triceps", "Shoulders"],
    equipment: "Bodyweight",
    instructions: [
      "Start in a plank position with hands under shoulders",
      "Lower your body until your chest nearly touches the floor",
      "Push back up to the starting position",
      "Keep your body in a straight line"
    ],
    tips: [
      "Engage your core throughout",
      "Don't let your hips sag",
      "Control the movement"
    ]
  },

  // Back Exercises
  {
    id: "deadlift",
    name: "Deadlift",
    category: "Back",
    muscleGroups: ["Back", "Glutes", "Hamstrings"],
    equipment: "Barbell",
    instructions: [
      "Stand with feet hip-width apart, bar over mid-foot",
      "Bend at hips and knees to grip the bar",
      "Keep your back straight and chest up",
      "Drive through your heels to lift the bar"
    ],
    tips: [
      "Keep the bar close to your body",
      "Don't round your back",
      "Squeeze your glutes at the top"
    ]
  },
  {
    id: "pull-ups",
    name: "Pull-ups",
    category: "Back",
    muscleGroups: ["Back", "Biceps"],
    equipment: "Pull-up Bar",
    instructions: [
      "Hang from a pull-up bar with palms facing away",
      "Pull your body up until your chin clears the bar",
      "Lower yourself back down with control",
      "Repeat for desired reps"
    ],
    tips: [
      "Engage your lats",
      "Don't swing or use momentum",
      "Full range of motion"
    ]
  },
  {
    id: "bent-over-row",
    name: "Bent-over Row",
    category: "Back",
    muscleGroups: ["Back", "Biceps"],
    equipment: "Barbell",
    instructions: [
      "Stand with feet hip-width apart, holding a barbell",
      "Hinge at the hips and lean forward",
      "Pull the bar to your lower chest",
      "Lower the bar back down with control"
    ],
    tips: [
      "Keep your back straight",
      "Squeeze your shoulder blades together",
      "Don't use too much momentum"
    ]
  },
  {
    id: "lat-pulldown",
    name: "Lat Pulldown",
    category: "Back",
    muscleGroups: ["Back", "Biceps"],
    equipment: "Cable Machine",
    instructions: [
      "Sit at the lat pulldown machine",
      "Grip the bar wider than shoulder-width",
      "Pull the bar down to your upper chest",
      "Slowly return to the starting position"
    ],
    tips: [
      "Lean back slightly",
      "Focus on pulling with your lats",
      "Don't pull behind your neck"
    ]
  },

  // Leg Exercises
  {
    id: "squat",
    name: "Squat",
    category: "Legs",
    muscleGroups: ["Quadriceps", "Glutes", "Hamstrings"],
    equipment: "Barbell",
    instructions: [
      "Stand with feet shoulder-width apart",
      "Place the bar on your upper back",
      "Lower your body by bending at hips and knees",
      "Drive through your heels to return to standing"
    ],
    tips: [
      "Keep your chest up",
      "Don't let your knees cave in",
      "Go as deep as your mobility allows"
    ]
  },
  {
    id: "leg-press",
    name: "Leg Press",
    category: "Legs",
    muscleGroups: ["Quadriceps", "Glutes"],
    equipment: "Leg Press Machine",
    instructions: [
      "Sit in the leg press machine",
      "Place your feet on the platform shoulder-width apart",
      "Lower the weight until your knees reach 90 degrees",
      "Press the weight back up"
    ],
    tips: [
      "Don't lock your knees at the top",
      "Keep your core engaged",
      "Control the negative"
    ]
  },
  {
    id: "lunges",
    name: "Lunges",
    category: "Legs",
    muscleGroups: ["Quadriceps", "Glutes", "Hamstrings"],
    equipment: "Dumbbells",
    instructions: [
      "Stand with feet hip-width apart",
      "Step forward with one leg",
      "Lower your body until both knees are at 90 degrees",
      "Push back to the starting position"
    ],
    tips: [
      "Keep your torso upright",
      "Don't let your front knee go past your toes",
      "Alternate legs or do all reps on one side"
    ]
  },
  {
    id: "leg-curl",
    name: "Leg Curl",
    category: "Legs",
    muscleGroups: ["Hamstrings"],
    equipment: "Leg Curl Machine",
    instructions: [
      "Lie face down on the leg curl machine",
      "Position the pad just above your ankles",
      "Curl your heels toward your glutes",
      "Slowly lower back to the starting position"
    ],
    tips: [
      "Don't lift your hips off the pad",
      "Squeeze your hamstrings at the top",
      "Control the weight"
    ]
  },

  // Shoulder Exercises
  {
    id: "overhead-press",
    name: "Overhead Press",
    category: "Shoulders",
    muscleGroups: ["Shoulders", "Triceps"],
    equipment: "Barbell",
    instructions: [
      "Stand with feet hip-width apart",
      "Hold the bar at shoulder height",
      "Press the bar straight up overhead",
      "Lower back to the starting position"
    ],
    tips: [
      "Keep your core tight",
      "Don't arch your back excessively",
      "Press in a straight line"
    ]
  },
  {
    id: "lateral-raises",
    name: "Lateral Raises",
    category: "Shoulders",
    muscleGroups: ["Shoulders"],
    equipment: "Dumbbells",
    instructions: [
      "Stand with dumbbells at your sides",
      "Raise the weights out to the sides",
      "Lift until your arms are parallel to the floor",
      "Lower back down with control"
    ],
    tips: [
      "Keep a slight bend in your elbows",
      "Don't swing the weights",
      "Focus on your side delts"
    ]
  },
  {
    id: "rear-delt-flyes",
    name: "Rear Delt Flyes",
    category: "Shoulders",
    muscleGroups: ["Shoulders"],
    equipment: "Dumbbells",
    instructions: [
      "Bend forward at the hips holding dumbbells",
      "Raise the weights out to the sides",
      "Squeeze your shoulder blades together",
      "Lower back to the starting position"
    ],
    tips: [
      "Keep your back straight",
      "Focus on your rear delts",
      "Don't use momentum"
    ]
  },

  // Arm Exercises
  {
    id: "bicep-curls",
    name: "Bicep Curls",
    category: "Arms",
    muscleGroups: ["Biceps"],
    equipment: "Dumbbells",
    instructions: [
      "Stand with dumbbells at your sides",
      "Curl the weights up toward your shoulders",
      "Squeeze your biceps at the top",
      "Lower back down with control"
    ],
    tips: [
      "Don't swing the weights",
      "Keep your elbows at your sides",
      "Full range of motion"
    ]
  },
  {
    id: "tricep-dips",
    name: "Tricep Dips",
    category: "Arms",
    muscleGroups: ["Triceps"],
    equipment: "Bodyweight",
    instructions: [
      "Sit on the edge of a bench or chair",
      "Place your hands beside your hips",
      "Lower your body by bending your elbows",
      "Push back up to the starting position"
    ],
    tips: [
      "Keep your elbows close to your body",
      "Don't go too low",
      "Focus on your triceps"
    ]
  },
  {
    id: "hammer-curls",
    name: "Hammer Curls",
    category: "Arms",
    muscleGroups: ["Biceps", "Forearms"],
    equipment: "Dumbbells",
    instructions: [
      "Hold dumbbells with a neutral grip",
      "Curl the weights up keeping palms facing each other",
      "Squeeze at the top",
      "Lower back down with control"
    ],
    tips: [
      "Keep your wrists straight",
      "Don't swing the weights",
      "Focus on the biceps and forearms"
    ]
  },

  // Core Exercises
  {
    id: "plank",
    name: "Plank",
    category: "Core",
    muscleGroups: ["Core"],
    equipment: "Bodyweight",
    instructions: [
      "Start in a push-up position",
      "Lower to your forearms",
      "Keep your body in a straight line",
      "Hold for the desired time"
    ],
    tips: [
      "Don't let your hips sag",
      "Engage your core",
      "Breathe normally"
    ]
  },
  {
    id: "crunches",
    name: "Crunches",
    category: "Core",
    muscleGroups: ["Core"],
    equipment: "Bodyweight",
    instructions: [
      "Lie on your back with knees bent",
      "Place your hands behind your head",
      "Lift your shoulders off the ground",
      "Lower back down with control"
    ],
    tips: [
      "Don't pull on your neck",
      "Focus on your abs",
      "Small range of motion"
    ]
  },
  {
    id: "russian-twists",
    name: "Russian Twists",
    category: "Core",
    muscleGroups: ["Core"],
    equipment: "Bodyweight",
    instructions: [
      "Sit with your knees bent and feet off the ground",
      "Lean back slightly",
      "Rotate your torso from side to side",
      "Keep your core engaged"
    ],
    tips: [
      "Keep your chest up",
      "Don't rush the movement",
      "Focus on rotation"
    ]
  }
];

// Export for compatibility
export const exercisesData = exercises;

export default exercises;
