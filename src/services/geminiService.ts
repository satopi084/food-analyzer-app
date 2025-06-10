import { GoogleGenerativeAI } from '@google/generative-ai';
import { NutritionData } from '../App';

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

export const analyzeFood = async (imageFile: File): Promise<NutritionData> => {
  if (!API_KEY) {
    throw new Error('Gemini API key is not configured');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const base64Data = await convertFileToBase64(imageFile);
    
    const prompt = `この料理の画像を分析して、以下の情報をJSON形式で返してください：

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
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: imageFile.type,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    
    // JSONを抽出（コードブロックやマークダウンから）
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Valid JSON response not found');
    }

    const nutritionData = JSON.parse(jsonMatch[0]) as NutritionData;
    
    // データ検証
    if (!nutritionData.foodName || typeof nutritionData.calories !== 'number') {
      throw new Error('Invalid nutrition data structure');
    }

    return nutritionData;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('画像の分析に失敗しました。API設定を確認してください。');
  }
};