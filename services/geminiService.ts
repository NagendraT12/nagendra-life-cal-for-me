import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult, UserStatus, LifeOracleResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// USER CONTEXT - INJECTED FROM RESUME
const USER_CONTEXT = `
  PROFILE: Nagendra T
  LOCATION: Bengaluru, Karnataka, India
  EDUCATION: BE in Electronics & Communication (Visvesvaraya Technological University), Full Stack Development (Internshala).
  SKILLS: Java (DSA), React, Node.js, Python, Cyber Security, Google Cloud.
  KEY PROJECTS: 
  1. "Iron Mind Exoskeleton" (Designed an exoskeleton to enhance human strength, inspired by Iron Man).
  2. Assistive Technology for the Blind.
  3. Home Automation System.
  4. Gesture Recognition for the Deaf (Python).
  EXPERIENCE: Full Stack Web Developer at Unified Mentor Private Limited.
`;

export const analyzeHabitImpact = async (
  activity: string,
  hoursPerDay: number,
  yearsRemaining: number,
  userStatus: UserStatus,
  userName?: string
): Promise<AIAnalysisResult> => {
  
  const modelId = "gemini-2.5-flash";
  
  const statusDescription = 
    userStatus === UserStatus.CAREER ? "working in my career" :
    userStatus === UserStatus.STUDYING ? "currently a student" :
    "currently figuring things out/searching";

  const prompt = `
    User Context: ${USER_CONTEXT}
    Current Status: I have ${yearsRemaining} years left to live. I am ${statusDescription}.
    Activity: I spend ${hoursPerDay} hours per day doing: "${activity}".
    
    1. Calculate the total weeks consumed of my remaining awake life.
    2. Analyze if this is productive or wasted considering my background (Engineer, Full Stack Dev, Iron Mind Project).
    3. Tone: "warning" if passive/wasted, "positive" if productive, "neutral" otherwise.
    4. Provide "advice": A short, actionable tip. Address me as Nagendra. Use perfect English grammar.
    5. Provide "pastImpact": Estimation of past time spent.
    6. Estimate "stressLevel" (low, medium, high).
    7. Provide "burnoutRisk": A sentence describing the emotional toll.
    
    Output JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weeksConsumed: { type: Type.NUMBER, description: "Total weeks this habit will take up in future" },
            percentageOfRemaining: { type: Type.NUMBER, description: "Percentage of remaining life (0-100)" },
            impactDescription: { type: Type.STRING, description: "A short, impactful sentence about future impact." },
            tone: { type: Type.STRING, enum: ["neutral", "warning", "positive"] },
            advice: { type: Type.STRING, description: "Actionable solution or improvement tip." },
            pastImpact: { type: Type.STRING, description: "Perspective on past time spent on this." },
            stressLevel: { type: Type.STRING, enum: ["low", "medium", "high"], description: "Estimated stress level." },
            burnoutRisk: { type: Type.STRING, description: "Assessment of emotional toll/burnout." }
          },
          required: ["weeksConsumed", "percentageOfRemaining", "impactDescription", "tone", "advice", "pastImpact", "stressLevel", "burnoutRisk"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AIAnalysisResult;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    const estimatedWeeks = Math.round((hoursPerDay / 24) * 52 * yearsRemaining);
    return {
      weeksConsumed: estimatedWeeks,
      percentageOfRemaining: 0,
      impactDescription: "Calculation unavailable.",
      tone: "neutral",
      advice: "Balance is key.",
      pastImpact: "Unknown.",
      stressLevel: "low",
      burnoutRisk: "Unable to assess emotional toll at this time."
    };
  }
};

export const askLifeOracle = async (
  query: string,
  context: string,
  userName?: string
): Promise<LifeOracleResponse> => {
  const modelId = "gemini-2.5-flash";

  const prompt = `
    User Context: ${USER_CONTEXT}
    The user asks: "${query}"
    You are a wise Life Oracle.
    1. Provide a direct, philosophical answer to Nagendra. Reference his potential (Exoskeleton project, Engineering) if relevant.
    2. Provide a philosophical quote.
    Output JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: { type: Type.STRING },
            philosophicalQuote: { type: Type.STRING }
          },
          required: ["answer", "philosophicalQuote"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as LifeOracleResponse;
  } catch (error) {
    return {
      answer: "The mists of time obscure the answer right now.",
      philosophicalQuote: "The only time you have is now."
    };
  }
};

// NEW: Chat with Future Self
export const chatWithFutureSelf = async (
  history: { role: 'user' | 'model', text: string }[],
  message: string,
  targetAge: number,
  userName: string,
  yearsRemaining: number,
  status: string
): Promise<string> => {
    const modelId = "gemini-2.5-flash";
    const currentAge = 90 - yearsRemaining;

    const systemInstruction = `
        You are Nagendra T at age ${targetAge}. The user is you at age ${currentAge.toFixed(1)}.
        
        YOUR BACKSTORY (The Past):
        ${USER_CONTEXT}
        
        Roleplay Guidelines:
        - You remember building the Iron Mind Exoskeleton in college.
        - You remember your time at Unified Mentor.
        - If targetAge > currentAge: You have lived the future. Did you stick with Web Dev? Did you build a startup? Or did you waste your potential? Be wise and urgent.
        - Speak in perfect, standard English. No glitch text.
        - Keep responses concise and powerful.
    `;

    const chat = ai.chats.create({
        model: modelId,
        config: { systemInstruction }
    });

    // Replay history
    for (const turn of history) {
        if (turn.role === 'user') {
            await chat.sendMessage({ message: turn.text });
        }
    }

    const result = await chat.sendMessage({ message });
    return result.text || "...connection lost...";
};

export interface SimulationResult {
  timelineDescription: string;
  netWorthDelta: string;
  happinessScore: number;
  location: string;
}

// NEW: Simulation
export const runSimulation = async (
  scenario: string,
  yearsRemaining: number,
  status: string
): Promise<SimulationResult> => {
    const modelId = "gemini-3-pro-preview";
    const currentAge = 90 - yearsRemaining;
    
    const prompt = `
        User: Nagendra T (Engineer, Full Stack Dev).
        Context: ${USER_CONTEXT}
        Current Age: ${currentAge.toFixed(1)}.
        Scenario: "What if I had ${scenario}?"
        
        Generate a "Simulated Reality" based on this choice.
        1. Describe the alternative timeline vividly. Use perfect English grammar.
        2. Estimate the Net Worth difference.
        3. Happiness Score (0-100).
        4. Current Location in that timeline.
        
        Output JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        timelineDescription: { type: Type.STRING },
                        netWorthDelta: { type: Type.STRING },
                        happinessScore: { type: Type.NUMBER },
                        location: { type: Type.STRING }
                    },
                    required: ["timelineDescription", "netWorthDelta", "happinessScore", "location"]
                }
            }
        });
        const text = response.text;
        if (!text) throw new Error("No response");
        return JSON.parse(text);
    } catch (err) {
        return {
            timelineDescription: "The simulation failed to converge. The variables were too complex.",
            netWorthDelta: "$0",
            happinessScore: 50,
            location: "Unknown"
        };
    }
};

export interface AuditResult {
  criticalTask: string;
  discardTask: string;
  reasoning: string;
}

export const auditTasks = async (
  tasks: string,
  yearsRemaining: number
): Promise<AuditResult> => {
  const modelId = "gemini-3-pro-preview";
  const prompt = `
    User: Nagendra T (Full Stack Developer).
    I have ${yearsRemaining.toFixed(1)} years left.
    Here is my To-Do list: "${tasks}"
    Identify the critical task (aligned with Engineering/Dev goals) and the waste of time task.
    Output JSON.
  `;

  try {
    const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    criticalTask: { type: Type.STRING },
                    discardTask: { type: Type.STRING },
                    reasoning: { type: Type.STRING }
                },
                required: ["criticalTask", "discardTask", "reasoning"]
            }
        }
    });
    
    const text = response.text;
    if(!text) throw new Error("No response");
    return JSON.parse(text);
  } catch (err) {
      return {
          criticalTask: "Focus.",
          discardTask: "Distraction.",
          reasoning: "Time is running out."
      };
  }
};

export interface RivalsResult {
  person1: { name: string, achievement: string };
  person2: { name: string, achievement: string };
  person3: { name: string, achievement: string };
  summary: string;
}

export const findRivals = async (
  currentAge: number
): Promise<RivalsResult> => {
  const modelId = "gemini-3-pro-preview";
  const prompt = `
    I am Nagendra T, an Engineer/Developer.
    I am ${currentAge.toFixed(1)} years old.
    Find 3 historical, business, or scientific figures (Tech/Engineering preferred) who achieved a MASSIVE, specific milestone at EXACTLY this age.
    Make it hurt my ego.
    Output JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            person1: { type: Type.OBJECT, properties: { name: {type: Type.STRING}, achievement: {type: Type.STRING} } },
            person2: { type: Type.OBJECT, properties: { name: {type: Type.STRING}, achievement: {type: Type.STRING} } },
            person3: { type: Type.OBJECT, properties: { name: {type: Type.STRING}, achievement: {type: Type.STRING} } },
            summary: { type: Type.STRING }
          },
          required: ["person1", "person2", "person3", "summary"]
        }
      }
    });
    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text);
  } catch (err) {
    return {
      person1: { name: "Mark Zuckerberg", achievement: "Launched Facebook." },
      person2: { name: "Elon Musk", achievement: "Sold Zip2." },
      person3: { name: "Bill Gates", achievement: "Founded Microsoft." },
      summary: "You are statistically behind schedule."
    };
  }
};

export interface ObituaryResult {
  currentObituary: string;
  potentialObituary: string;
  gapAnalysis: string;
}

export const generateObituary = async (
  userName: string,
  status: string,
  yearsRemaining: number
): Promise<ObituaryResult> => {
  const modelId = "gemini-3-pro-preview";
  const prompt = `
    Subject: Nagendra T
    Context: ${USER_CONTEXT}
    Status: ${status}
    Years Left: ${yearsRemaining}
    
    1. Write a BRUTALLY honest obituary assuming Nagendra died today. Mention his Iron Mind project and potential, but emphasize it was cut short. (Current Obituary).
    2. Write a GLORIOUS obituary assuming he lived the rest of his life maximizing his skills in AI, Exoskeletons, and Tech. (Potential Obituary).
    3. One sentence gap analysis.
    
    Use perfect English.
    Output JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            currentObituary: { type: Type.STRING },
            potentialObituary: { type: Type.STRING },
            gapAnalysis: { type: Type.STRING }
          },
          required: ["currentObituary", "potentialObituary", "gapAnalysis"]
        }
      }
    });
    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text);
  } catch (err) {
    return {
      currentObituary: "Here lies Nagendra, a developer with potential left on the table.",
      potentialObituary: "Here lies Nagendra, the architect of the future.",
      gapAnalysis: "The difference is execution."
    };
  }
};
