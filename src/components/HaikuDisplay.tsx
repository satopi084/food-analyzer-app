import React from 'react';
import { HaikuData } from '../services/geminiService';
import './HaikuDisplay.css';

interface HaikuDisplayProps {
  data: HaikuData;
}

const HaikuDisplay: React.FC<HaikuDisplayProps> = ({ data }) => {
  return (
    <div className="haiku-display">
      <div className="haiku-header">
        <h2>🌸 俳句</h2>
        <p className="haiku-description">{data.description}</p>
      </div>

      <div className="haiku-content">
        <div className="haiku-verses">
          {data.haiku.map((verse, index) => (
            <div key={index} className={`haiku-verse verse-${index + 1}`}>
              {verse}
            </div>
          ))}
        </div>
        
        <div className="haiku-pattern">
          <span className="pattern-note">五・七・五</span>
        </div>
      </div>

      <div className="haiku-footer">
        <p>
          🎋 この画像から生まれた一句です。日本の美しい俳句の伝統をお楽しみください。
        </p>
      </div>

      <div className="disclaimer">
        <p>
          ⚠️ この俳句はAIによって生成されたものです。創作の一例としてお楽しみください。
        </p>
      </div>
    </div>
  );
};

export default HaikuDisplay;