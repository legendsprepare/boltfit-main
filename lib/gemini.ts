import { GoogleGenerativeAI } from '@google/generative-ai';

// Get API key from environment variables
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn(
    'EXPO_PUBLIC_GEMINI_API_KEY environment variable is missing. Gemini AI features will use mock data.'
  );
}

// Initialize Google AI only if API key is available
let genAI: GoogleGenerativeAI | null = null;
if (API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(API_KEY);
  } catch (error) {
    console.error('Failed to initialize Google Generative AI:', error);
  }
}

interface UserContext {
  // Basic info
  fitnessGoals: string[];
  experienceLevel: string;
  equipment: string[];
  targetMuscles: string[];
  workoutFrequency: string;

  // Enhanced onboarding data
  timeAvailability: string;
  limitations: string[];
  limitationsOther?: string;
  motivationStyle: string[];
  workoutStyle: string[];
}

interface GeneratedExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  equipment: string;
  muscleGroup: string;
  instructions: string;
  difficulty: string;
}

export interface GeneratedWorkout {
  id: string;
  name: string;
  exercises: GeneratedExercise[];
  estimatedDuration: number;
  difficulty: string;
  targetMuscles: string[];
  notes: string;
}

export class GeminiWorkoutGenerator {
  constructor() {
    // No need to initialize model here anymore
  }

  async generateWorkout(userContext: UserContext): Promise<GeneratedWorkout> {
    try {
      console.log('Generating workout with Gemini AI...');

      // Check if AI is available
      if (!genAI) {
        console.log('Gemini AI not available, using mock workout...');
        return this.generateMockWorkout(userContext);
      }

      const prompt = this.buildWorkoutPrompt(userContext);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const result = await model.generateContent(prompt);
      const response = result.response;
      const responseText = response.text();

      console.log('Gemini response received:', responseText);

      return this.parseWorkoutResponse(responseText, userContext);
    } catch (error) {
      console.error('Error generating workout with Gemini:', error);
      console.log('Falling back to mock workout...');
      return this.generateMockWorkout(userContext);
    }
  }

  private buildWorkoutPrompt(userContext: UserContext): string {
    const goalText = userContext.fitnessGoals.join(', ');
    const muscleText = userContext.targetMuscles.join(', ');
    const equipmentText = userContext.equipment.join(', ');
    const limitationsText =
      userContext.limitations.length > 0
        ? userContext.limitations.join(', ')
        : 'None specified';
    const motivationText =
      userContext.motivationStyle.length > 0
        ? userContext.motivationStyle.join(', ')
        : 'Not specified';
    const workoutStyleText =
      userContext.workoutStyle.length > 0
        ? userContext.workoutStyle.join(', ')
        : 'Not specified';

    return `
Create a highly personalized workout plan based on the comprehensive user profile:

**COMPLETE USER PROFILE:**
- Primary Fitness Goals: ${goalText}
- Experience Level: ${userContext.experienceLevel}
- Available Equipment: ${equipmentText}
- Target Muscle Groups for Today: ${muscleText}
- Workout Frequency: ${userContext.workoutFrequency} times per week
- Time Availability: ${userContext.timeAvailability}
- Physical Limitations: ${limitationsText}
${
  userContext.limitationsOther
    ? `- Additional Limitations: ${userContext.limitationsOther}`
    : ''
}
- Motivation Style: ${motivationText}
- Preferred Workout Style: ${workoutStyleText}

**CRITICAL EQUIPMENT REQUIREMENTS:**
${
  userContext.equipment.includes('none')
    ? '- User has NO EQUIPMENT - Use ONLY bodyweight exercises'
    : `- User has access to: ${equipmentText}
- ONLY use exercises that require the equipment listed above
- Do NOT suggest bodyweight alternatives unless equipment list includes "none"`
}

**PERSONALIZATION GUIDELINES:**

**Physical Limitations & Safety:**
${
  userContext.limitations.length > 0
    ? `- IMPORTANT: User has these limitations: ${limitationsText}
- Avoid exercises that could aggravate these conditions
- Suggest modifications or alternatives when needed
- Focus on safe, joint-friendly movements`
    : '- No specific physical limitations reported'
}
${
  userContext.limitationsOther
    ? `- Additional considerations: ${userContext.limitationsOther}`
    : ''
}

**Time Optimization:**
- Available time: ${userContext.timeAvailability}
- Adjust workout intensity and volume accordingly
- For limited time, focus on compound movements and supersets

**Motivation & Style Preferences:**
${
  userContext.motivationStyle.length > 0
    ? `- Motivation style: ${motivationText}
- Tailor exercise selection and progression to match motivational preferences`
    : ''
}
${
  userContext.workoutStyle.length > 0
    ? `- Workout style preference: ${workoutStyleText}
- Design the workout structure to align with preferred style`
    : ''
}

**Requirements:**
1. Generate 4-7 exercises targeting the specified muscle groups
2. STRICTLY use only the available equipment listed above
3. RESPECT all physical limitations and provide modifications if needed
4. Adjust intensity and duration based on experience level and time availability:
   - Beginner: Higher reps (8-15), lower weight, focus on form and safety
   - Intermediate: Moderate reps (6-12), moderate weight, balanced challenge
   - Advanced: Lower reps (3-8), higher weight, more complex movements
5. Include sets, reps, and suggested weight (set weight to 0 for bodyweight exercises)
6. Provide detailed form instructions and safety cues for each exercise
7. Consider user's workout frequency for appropriate volume
8. Align with user's motivational style and workout preferences

**Response Format (JSON):**
{
  "workoutName": "Personalized workout name reflecting goals and style",
  "estimatedDuration": 45,
  "difficulty": "${userContext.experienceLevel}",
  "notes": "Personalized tips considering limitations, goals, and preferences",
  "exercises": [
    {
      "name": "Exercise Name",
      "sets": 3,
      "reps": 10,
      "weight": 0,
      "equipment": "equipment type from user's available equipment",
      "muscleGroup": "primary muscle",
      "instructions": "Detailed form cues with safety considerations for user's limitations",
      "difficulty": "beginner/intermediate/advanced"
    }
  ]
}

Generate a safe, effective, and highly personalized workout that respects the user's complete profile, limitations, and preferences.
    `;
  }

  private parseWorkoutResponse(
    response: string,
    userContext: UserContext
  ): GeneratedWorkout {
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const workoutData = JSON.parse(jsonMatch[0]);

      return {
        id: 'gemini-' + Date.now(),
        name:
          workoutData.workoutName ||
          `${userContext.targetMuscles.join(' & ')} Workout`,
        exercises: workoutData.exercises.map((ex: any, index: number) => ({
          id: `exercise-${index}`,
          name: ex.name,
          sets: ex.sets || 3,
          reps: ex.reps || 10,
          weight: ex.weight || 0,
          equipment: ex.equipment || 'none',
          muscleGroup: ex.muscleGroup || userContext.targetMuscles[0],
          instructions: ex.instructions || 'Perform with proper form',
          difficulty: ex.difficulty || userContext.experienceLevel,
        })),
        estimatedDuration: workoutData.estimatedDuration || 45,
        difficulty: workoutData.difficulty || userContext.experienceLevel,
        targetMuscles: userContext.targetMuscles,
        notes:
          workoutData.notes || 'AI-generated workout based on your preferences',
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return this.generateMockWorkout(userContext);
    }
  }

  private generateMockWorkout(userContext: UserContext): GeneratedWorkout {
    const exercises: GeneratedExercise[] = [];

    // Exercise database for fallback
    const exerciseDatabase: { [key: string]: any[] } = {
      chest: [
        {
          name: 'Push-ups',
          sets: 3,
          reps: userContext.experienceLevel === 'beginner' ? 8 : 12,
          equipment: 'none',
          instructions: 'Keep body straight, lower chest to ground, push up',
        },
        {
          name: 'Barbell Bench Press',
          sets: 3,
          reps: userContext.experienceLevel === 'beginner' ? 8 : 5,
          weight: userContext.experienceLevel === 'beginner' ? 95 : 135,
          equipment: 'barbell',
          instructions: 'Lie on bench, grip barbell, lower to chest, press up',
        },
      ],
      back: [
        {
          name: 'Pull-ups',
          sets: 3,
          reps: userContext.experienceLevel === 'beginner' ? 5 : 8,
          equipment: 'pull-up-bar',
          instructions: 'Hang from bar, pull chin over bar, lower with control',
        },
        {
          name: 'Dumbbell Rows',
          sets: 3,
          reps: 10,
          weight: userContext.experienceLevel === 'beginner' ? 25 : 40,
          equipment: 'dumbbells',
          instructions:
            'Hinge at hips, pull dumbbells to ribs, squeeze shoulder blades',
        },
      ],
      legs: [
        {
          name: 'Bodyweight Squats',
          sets: 3,
          reps: userContext.experienceLevel === 'beginner' ? 12 : 15,
          equipment: 'none',
          instructions:
            'Stand tall, sit back and down, drive through heels to stand',
        },
        {
          name: 'Barbell Squats',
          sets: 3,
          reps: userContext.experienceLevel === 'beginner' ? 8 : 5,
          weight: userContext.experienceLevel === 'beginner' ? 95 : 155,
          equipment: 'barbell',
          instructions:
            'Bar on upper back, squat down keeping chest up, drive up',
        },
      ],
      shoulders: [
        {
          name: 'Shoulder Press',
          sets: 3,
          reps: 10,
          weight: userContext.experienceLevel === 'beginner' ? 20 : 35,
          equipment: 'dumbbells',
          instructions: 'Press dumbbells overhead, lower with control',
        },
      ],
      biceps: [
        {
          name: 'Bicep Curls',
          sets: 3,
          reps: 12,
          weight: userContext.experienceLevel === 'beginner' ? 15 : 25,
          equipment: 'dumbbells',
          instructions: 'Curl dumbbells up, squeeze biceps, lower slowly',
        },
      ],
      triceps: [
        {
          name: 'Tricep Dips',
          sets: 3,
          reps: userContext.experienceLevel === 'beginner' ? 8 : 12,
          equipment: 'none',
          instructions: 'Lower body by bending elbows, push back up',
        },
      ],
      core: [
        {
          name: 'Plank',
          sets: 3,
          reps: userContext.experienceLevel === 'beginner' ? 30 : 60,
          equipment: 'none',
          instructions: 'Hold body straight from head to heels',
        },
      ],
    };

    // Generate exercises based on target muscles, available equipment, and limitations
    userContext.targetMuscles.forEach((muscle) => {
      const availableExercises = exerciseDatabase[muscle] || [];
      let filteredExercises = availableExercises.filter(
        (ex) =>
          userContext.equipment.includes(ex.equipment) ||
          ex.equipment === 'none' ||
          userContext.equipment.includes('gym-access')
      );

      // Filter out exercises based on limitations
      if (userContext.limitations.includes('back-issues')) {
        filteredExercises = filteredExercises.filter(
          (ex) =>
            !ex.name.toLowerCase().includes('deadlift') &&
            !ex.name.toLowerCase().includes('bent-over')
        );
      }
      if (userContext.limitations.includes('knee-issues')) {
        filteredExercises = filteredExercises.filter(
          (ex) =>
            !ex.name.toLowerCase().includes('squat') &&
            !ex.name.toLowerCase().includes('lunge')
        );
      }
      if (userContext.limitations.includes('shoulder-issues')) {
        filteredExercises = filteredExercises.filter(
          (ex) =>
            !ex.name.toLowerCase().includes('overhead') &&
            !ex.name.toLowerCase().includes('shoulder press')
        );
      }

      if (filteredExercises.length > 0) {
        const exercise = filteredExercises[0];
        let modifiedInstructions = exercise.instructions;

        // Add safety modifications based on limitations
        if (userContext.limitations.length > 0) {
          modifiedInstructions +=
            '. Modified for safety - use controlled movements and stop if you feel discomfort.';
        }

        exercises.push({
          id: `mock-${muscle}`,
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight || 0,
          equipment: exercise.equipment,
          muscleGroup: muscle,
          instructions: modifiedInstructions,
          difficulty: userContext.experienceLevel,
        });
      }
    });

    // Adjust workout based on time availability
    const timeAdjustment =
      userContext.timeAvailability === 'limited' ? 0.75 : 1.0;
    const adjustedDuration = Math.round(
      (30 + exercises.length * 5) * timeAdjustment
    );

    // Create personalized workout name and notes
    let workoutName = `${userContext.targetMuscles.join(' & ')} Workout`;
    if (userContext.workoutStyle.includes('hiit')) {
      workoutName = `HIIT ${workoutName}`;
    } else if (userContext.workoutStyle.includes('strength')) {
      workoutName = `Strength ${workoutName}`;
    }

    let personalizedNotes = 'Generated workout based on your complete profile';
    if (userContext.limitations.length > 0) {
      personalizedNotes += ` - Modified for ${userContext.limitations.join(
        ', '
      )} considerations`;
    }
    if (userContext.timeAvailability === 'limited') {
      personalizedNotes += ' - Optimized for limited time availability';
    }
    if (userContext.motivationStyle.includes('variety')) {
      personalizedNotes += ' - Includes varied exercises to keep you engaged';
    }

    return {
      id: 'mock-' + Date.now(),
      name: workoutName,
      exercises,
      estimatedDuration: adjustedDuration,
      difficulty: userContext.experienceLevel,
      targetMuscles: userContext.targetMuscles,
      notes: personalizedNotes,
    };
  }
}

export const geminiWorkoutGenerator = new GeminiWorkoutGenerator();

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatContext {
  userProfile?: any;
  currentWorkout?: GeneratedWorkout;
  onboardingData?: any;
  workoutHistory?: any[];
}

export class BoltChatbot {
  constructor() {}

  async sendMessage(
    message: string,
    context: ChatContext,
    chatHistory: ChatMessage[] = []
  ): Promise<string> {
    try {
      console.log('Sending message to Bolt chatbot:', message);

      // Check if AI is available
      if (!genAI) {
        return "I'm sorry, but I'm currently unable to connect to my AI brain. Please check your internet connection or try again later! ⚡";
      }

      const prompt = this.buildChatPrompt(message, context, chatHistory);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const result = await model.generateContent(prompt);
      const response = result.response;
      const responseText = response.text();

      console.log('Bolt chatbot response:', responseText);

      // Clean up and format the response
      let formattedResponse = responseText.trim();

      // Remove any excessive line breaks
      formattedResponse = formattedResponse.replace(/\n\s*\n\s*\n/g, '\n\n');

      // Ensure the response ends properly
      if (!formattedResponse.match(/[.!?⚡💪🔥]$/)) {
        formattedResponse += ' ⚡';
      }

      return formattedResponse;
    } catch (error) {
      console.error('Error in Bolt chatbot:', error);
      return "Oops! ⚡ I'm experiencing some technical difficulties right now. Please try asking me again in a moment. I'm here to help with your fitness journey! 💪";
    }
  }

  private buildChatPrompt(
    userMessage: string,
    context: ChatContext,
    chatHistory: ChatMessage[]
  ): string {
    const { userProfile, currentWorkout, onboardingData } = context;

    let prompt = `You are Bolt ⚡, an enthusiastic and knowledgeable AI fitness coach for the BoltLab app. You're energetic, motivational, and always ready to help users achieve their fitness goals.

PERSONALITY & TONE:
- Be enthusiastic and motivational with fitness emojis (⚡💪🔥🎯✨)
- Keep responses conversational but informative
- Show expertise without being overwhelming
- Be encouraging and supportive
- Use "Lightning Warrior" as a fun nickname for the user occasionally

RESPONSE FORMAT:
- Keep responses concise but helpful (2-3 sentences for simple questions, more for complex ones)
- Use bullet points for lists or steps
- Add relevant emojis to make responses engaging
- End with motivation or next steps when appropriate

USER CONTEXT:`;

    if (userProfile) {
      prompt += `
- User: ${userProfile.username || 'Lightning Warrior'} (Level ${
        userProfile.level || 1
      })
- Current Streak: ${userProfile.current_streak || 0} days
- Total XP: ${userProfile.total_xp || 0}`;
    }

    if (onboardingData) {
      prompt += `
- Fitness Goals: ${
        onboardingData.fitness_goals?.join(', ') || 'General fitness'
      }
- Experience Level: ${onboardingData.experience_level || 'Intermediate'}
- Equipment Available: ${
        onboardingData.equipment?.join(', ') || 'Basic equipment'
      }
- Workout Frequency: ${
        onboardingData.workout_frequency || '3-4 times per week'
      }`;
    }

    if (currentWorkout) {
      prompt += `
- Current Workout: "${currentWorkout.name}" (${
        currentWorkout.exercises?.length || 0
      } exercises, ${currentWorkout.estimatedDuration || 30} min)
- Target Muscles: ${currentWorkout.targetMuscles?.join(', ') || 'Various'}
- Difficulty: ${currentWorkout.difficulty || 'Intermediate'}`;
    }

    if (chatHistory.length > 0) {
      prompt += `\n\nRECENT CONVERSATION:`;
      chatHistory.slice(-3).forEach((msg) => {
        const speaker = msg.isUser ? 'User' : 'Bolt';
        prompt += `\n${speaker}: ${msg.text}`;
      });
    }

    prompt += `\n\nCURRENT MESSAGE: "${userMessage}"

GUIDELINES:
- If asked about exercise form, provide clear, safety-focused guidance
- For workout modifications, suggest specific alternatives based on their equipment and goals
- For motivation, reference their progress, streak, or goals
- For nutrition questions, give practical, science-based advice
- If asked about BoltLab features, explain them enthusiastically
- Always encourage consistent training and proper form

Respond as Bolt with energy and expertise! ⚡`;

    return prompt;
  }

  // Helper method to suggest workout modifications
  async modifyWorkout(
    currentWorkout: GeneratedWorkout,
    userRequest: string,
    context: ChatContext
  ): Promise<GeneratedWorkout | null> {
    try {
      console.log('Modifying workout with user request:', userRequest);

      // Check if AI is available
      if (!genAI) {
        console.log('Gemini AI not available, cannot modify workout');
        return null;
      }

      const prompt = `
You are Bolt, an AI fitness coach. The user wants to modify their current workout. 

IMPORTANT: You MUST respond with ONLY a valid JSON object that represents the modified workout. Do not include any explanatory text before or after the JSON.

Current Workout:
${JSON.stringify(currentWorkout, null, 2)}

User Request: "${userRequest}"

User Context:
- Fitness Goals: ${
        context.onboardingData?.fitness_goals?.join(', ') || 'General fitness'
      }
- Experience Level: ${
        context.onboardingData?.experience_level || 'intermediate'
      }
- Available Equipment: ${
        context.onboardingData?.equipment?.join(', ') || 'Basic equipment'
      }
- Workout Frequency: ${
        context.onboardingData?.workout_frequency || '3-4 times per week'
      }

Modification Guidelines:
1. Keep the same overall structure but modify exercises, sets, reps, or weights as requested
2. If replacing exercises, choose alternatives that target similar muscles and match the user's equipment
3. Maintain appropriate difficulty for the user's experience level
4. If making exercises "easier" - reduce weight/reps or replace with bodyweight alternatives
5. If making exercises "harder" - increase weight/reps or add more challenging variations
6. Always ensure the workout remains balanced and safe

Return ONLY this exact JSON structure (no other text):
{
  "id": "${currentWorkout.id}",
  "name": "Modified Workout Name",
  "exercises": [
    {
      "id": "exercise-id",
      "name": "Exercise Name",
      "sets": 3,
      "reps": 12,
      "weight": 25,
      "equipment": "Equipment Type",
      "muscleGroup": "Muscle Group",
      "instructions": "Brief instruction",
      "difficulty": "beginner/intermediate/advanced"
    }
  ],
  "estimatedDuration": 45,
  "difficulty": "intermediate",
  "targetMuscles": ["list", "of", "muscles"],
  "notes": "Brief note about modifications made"
}`;

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const response = result.response;
      const responseText = response.text();

      console.log('Gemini modification response:', responseText);

      // Parse the JSON response
      try {
        // Clean the response to extract just the JSON
        let jsonText = responseText.trim();

        // Remove any markdown code blocks
        jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');

        // Find the first { and last } to extract just the JSON object
        const firstBrace = jsonText.indexOf('{');
        const lastBrace = jsonText.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1) {
          jsonText = jsonText.substring(firstBrace, lastBrace + 1);
        }

        const modifiedWorkout = JSON.parse(jsonText);

        // Validate the structure
        if (
          !modifiedWorkout.exercises ||
          !Array.isArray(modifiedWorkout.exercises)
        ) {
          throw new Error('Invalid workout structure');
        }

        // Ensure all required fields are present
        modifiedWorkout.id = modifiedWorkout.id || currentWorkout.id;
        modifiedWorkout.targetMuscles =
          modifiedWorkout.targetMuscles || currentWorkout.targetMuscles;
        modifiedWorkout.estimatedDuration =
          modifiedWorkout.estimatedDuration || currentWorkout.estimatedDuration;
        modifiedWorkout.difficulty =
          modifiedWorkout.difficulty || currentWorkout.difficulty;

        console.log('Successfully parsed modified workout:', modifiedWorkout);
        return modifiedWorkout;
      } catch (parseError) {
        console.error('Error parsing workout modification JSON:', parseError);
        console.log('Raw response was:', responseText);
        return null;
      }
    } catch (error) {
      console.error('Error modifying workout:', error);
      return null;
    }
  }
}

export const boltChatbot = new BoltChatbot();
