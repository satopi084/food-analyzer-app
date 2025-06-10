import { GoogleGenerativeAI } from '@google/generative-ai';

export interface NutritionData {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  advice: string;
}

export interface HaikuData {
  haiku: string[];
  description: string;
  isFood: false;
}

export type AnalysisResult = NutritionData | HaikuData;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // CORS設定
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // OPTIONS preflight request
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const API_KEY = env.GEMINI_API_KEY;
    if (!API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    
    if (!imageFile) {
      return new Response(
        JSON.stringify({ error: 'No image file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Convert file to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

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
    
    let result: AnalysisResult;

    // If it's food with high confidence, analyze nutrition
    if (classification.isFood && classification.confidence > 60) {
      result = await analyzeFoodNutrition(imageFile, base64Data, model);
    } else {
      // If it's not food, generate haiku
      result = await generateHaiku(imageFile, base64Data, model);
    }

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Image analysis failed' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
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