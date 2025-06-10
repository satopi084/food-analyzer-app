import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import NutritionDisplay from './components/NutritionDisplay';
import './App.css';

export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  advice: string;
  foodName: string;
}

function App() {
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalysisComplete = (data: NutritionData) => {
    setNutritionData(data);
    setLoading(false);
  };

  const handleAnalysisStart = () => {
    setLoading(true);
    setNutritionData(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🍽️ 食品栄養分析アプリ</h1>
        <p>毎日の食卓に栄養価分析を！</p>
      </header>
      
      <main className="App-main">
        <ImageUpload 
          onAnalysisStart={handleAnalysisStart}
          onAnalysisComplete={handleAnalysisComplete}
        />
        
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>画像を分析中...</p>
          </div>
        )}
        
        {nutritionData && !loading && (
          <NutritionDisplay data={nutritionData} />
        )}
      </main>
    </div>
  );
}

export default App;
