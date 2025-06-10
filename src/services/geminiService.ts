import { GoogleGenerativeAI } from '@google/generative-ai';
import { NutritionData } from '../App';

export interface HaikuData {
  haiku: string[];
  description: string;
  isFood: false;
}

export type AnalysisResult = NutritionData | HaikuData;

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('Gemini API key not found. Please set REACT_APP_GEMINI_API_KEY in your .env file.');
}

const genAI = new GoogleGenerativeAI(API_KEY || '');

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
    };
    reader.onerror = error => reject(error);
  });
};

export const analyzeImage = async (imageFile: File): Promise<AnalysisResult> => {
  if (!API_KEY) {
    throw new Error('Gemini API key is not configured');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const base64Data = await convertFileToBase64(imageFile);
    
    // First, check if the image contains food
    const classificationPrompt = `この画像を分析して、食べ物（料理、食材、飲み物など）が写っているかどうかを判定してください。

以下のJSON形式で回答してください：
{
  "isFood": true/false,
  "confidence": 0-100の数値
}

食べ物と判定する基準：
- 料理、食材、飲み物、お菓子、果物、野菜など食べられるもの
- レストランのメニュー、弁当、おつまみなど

食べ物でないと判定する基準：
- 人物、動物、風景、建物、物品など食べられないもの
- 食器だけで食べ物が写っていない場合`;

    const classificationResult = await model.generateContent([
      classificationPrompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: imageFile.type,
        },
      },
    ]);

    const classificationText = classificationResult.response.text();
    const classificationMatch = classificationText.match(/\{[\s\S]*\}/);
    
    if (!classificationMatch) {
      throw new Error('Classification failed');
    }

    const classification = JSON.parse(classificationMatch[0]);
    
    // If it's food with high confidence, analyze nutrition
    if (classification.isFood && classification.confidence > 60) {
      return await analyzeFoodNutrition(imageFile, base64Data, model);
    } else {
      // If it's not food, generate haiku
      return await generateHaiku(imageFile, base64Data, model);
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('画像の分析に失敗しました。API設定を確認してください。');
  }
};

const analyzeFoodNutrition = async (imageFile: File, base64Data: string, model: any): Promise<NutritionData> => {
  const nutritionPrompt = `この料理の画像を分析して、以下の情報をJSON形式で返してください：

1. 料理名（日本語）
2. 栄養価（100gあたりの推定値）：
   - カロリー (kcal)
   - タンパク質 (g)
   - 炭水化物 (g)
   - 脂質 (g)
   - 食物繊維 (g)
   - 糖質 (g)
   - ナトリウム (mg)
3. 健康的な食生活のためのアドバイス（日本語、200文字程度）

JSONの形式：
{
  "foodName": "料理名",
  "calories": 数値,
  "protein": 数値,
  "carbs": 数値,
  "fat": 数値,
  "fiber": 数値,
  "sugar": 数値,
  "sodium": 数値,
  "advice": "栄養アドバイス"
}

画像に複数の料理が写っている場合は、メインの料理について分析してください。`;

  const result = await model.generateContent([
    nutritionPrompt,
    {
      inlineData: {
        data: base64Data,
        mimeType: imageFile.type,
      },
    },
  ]);

  const response = await result.response;
  const text = response.text();
  
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Valid JSON response not found');
  }

  const nutritionData = JSON.parse(jsonMatch[0]) as NutritionData;
  
  if (!nutritionData.foodName || typeof nutritionData.calories !== 'number') {
    throw new Error('Invalid nutrition data structure');
  }

  return nutritionData;
};

const generateHaiku = async (imageFile: File, base64Data: string, model: any): Promise<HaikuData> => {
  const haikuPrompt = `この画像を見て、その内容にちなんだ俳句を作ってください。

以下のJSON形式で回答してください：
{
  "haiku": ["上の句（5音）", "中の句（7音）", "下の句（5音）"],
  "description": "画像の簡潔な説明（50文字程度）",
  "isFood": false
}

俳句の要件：
- 日本の伝統的な5-7-5音律を守る
- 画像の内容や雰囲気を表現する
- 季語があれば取り入れる
- 美しい日本語で詩的に表現する

例：
猫が写っている場合：
{
  "haiku": ["ひなたぼこ", "猫のまどろみ", "春近し"],
  "description": "陽だまりで眠る猫の穏やかな表情",
  "isFood": false
}`;

  const result = await model.generateContent([
    haikuPrompt,
    {
      inlineData: {
        data: base64Data,
        mimeType: imageFile.type,
      },
    },
  ]);

  const response = await result.response;
  const text = response.text();
  
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Valid JSON response not found');
  }

  const haikuData = JSON.parse(jsonMatch[0]) as HaikuData;
  
  if (!haikuData.haiku || !Array.isArray(haikuData.haiku) || haikuData.haiku.length !== 3) {
    throw new Error('Invalid haiku data structure');
  }

  return haikuData;
};

// Keep the old function name for backward compatibility
export const analyzeFood = analyzeImage;