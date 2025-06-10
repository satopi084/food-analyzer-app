import React from 'react';
import { NutritionData } from '../App';
import './NutritionDisplay.css';

interface NutritionDisplayProps {
  data: NutritionData;
}

const NutritionDisplay: React.FC<NutritionDisplayProps> = ({ data }) => {
  const nutritionItems = [
    { label: 'カロリー', value: data.calories, unit: 'kcal', color: '#ff6b6b' },
    { label: 'タンパク質', value: data.protein, unit: 'g', color: '#4ecdc4' },
    { label: '炭水化物', value: data.carbs, unit: 'g', color: '#45b7d1' },
    { label: '脂質', value: data.fat, unit: 'g', color: '#f7b731' },
    { label: '食物繊維', value: data.fiber, unit: 'g', color: '#5f27cd' },
    { label: '糖質', value: data.sugar, unit: 'g', color: '#ff9ff3' },
    { label: 'ナトリウム', value: data.sodium, unit: 'mg', color: '#ff6348' },
  ];

  return (
    <div className="nutrition-display">
      <div className="food-name">
        <h2>🍽️ {data.foodName}</h2>
        <p className="portion-note">※ 100gあたりの推定栄養価</p>
      </div>

      <div className="nutrition-grid">
        {nutritionItems.map((item, index) => (
          <div key={index} className="nutrition-item" style={{ borderLeftColor: item.color }}>
            <div className="nutrition-label">{item.label}</div>
            <div className="nutrition-value">
              <span className="value" style={{ color: item.color }}>
                {item.value}
              </span>
              <span className="unit">{item.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="advice-section">
        <h3>🥗 栄養アドバイス</h3>
        <div className="advice-content">
          <p>{data.advice}</p>
        </div>
      </div>

      <div className="disclaimer">
        <p>
          ⚠️ この分析結果は推定値です。正確な栄養価については、食品の成分表示や専門機関の情報をご確認ください。
        </p>
      </div>
    </div>
  );
};

export default NutritionDisplay;