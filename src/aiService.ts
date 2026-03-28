import { GoogleGenAI } from "@google/genai";
import { Pet } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const generatePetDescription = async (pet: Partial<Pet>): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `請為這隻待領養的毛孩寫一段溫暖、感人且吸引人的簡介。
      名字：${pet.name}
      品種：${pet.breed}
      年齡：${pet.age}
      性別：${pet.gender === 'male' ? '男生' : '女生'}
      體型：${pet.size === 'small' ? '小型' : pet.size === 'medium' ? '中型' : '大型'}
      
      請用繁體中文撰寫，字數約 100-150 字。語氣要親切，強調牠的獨特性，並呼籲有緣人來帶牠回家。`,
    });

    return response.text || "無法生成簡介，請稍後再試。";
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "生成簡介時發生錯誤。";
  }
};

export const getPetMatchRecommendations = async (userPreferences: string, pets: Pet[]): Promise<string> => {
  try {
    const petList = pets.map(p => `${p.id}: ${p.name} (${p.breed}, ${p.age}, ${p.type})`).join('\n');
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `你是一個專業的寵物領養顧問。根據使用者的生活方式和偏好，從下方的毛孩名單中推薦 2-3 隻最適合的毛孩，並說明原因。
      
      使用者偏好：${userPreferences}
      
      毛孩名單：
      ${petList}
      
      請用繁體中文回答，語氣要專業且溫暖。`,
    });

    return response.text || "目前沒有合適的推薦。";
  } catch (error) {
    console.error("AI Matchmaking Error:", error);
    return "推薦過程中發生錯誤。";
  }
};
