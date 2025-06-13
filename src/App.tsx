import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import NutritionDisplay from './components/NutritionDisplay';
import HaikuDisplay from './components/HaikuDisplay';
import { AnalysisResult, HaikuData } from './services/geminiService';
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
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalysisComplete = (data: AnalysisResult) => {
    setAnalysisResult(data);
    setLoading(false);
  };

  const handleAnalysisStart = () => {
    setLoading(true);
    setAnalysisResult(null);
  };

  const isHaikuData = (data: AnalysisResult): data is HaikuData => {
    return 'isFood' in data && data.isFood === false;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🍽️ 食品栄養分析アプリ</h1>
        <p>毎日の食卓に栄養価の分析を</p>
        <p className="sub-note">※料理以外の画像では風流に返します</p>
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
        
        {analysisResult && !loading && (
          isHaikuData(analysisResult) ? (
            <HaikuDisplay data={analysisResult} />
          ) : (
            <NutritionDisplay data={analysisResult as NutritionData} />
          )
        )}
      </main>
    </div>
  );
}

export default App;
