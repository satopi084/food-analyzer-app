import React, { useRef, useState } from 'react';
import { analyzeImage, AnalysisResult } from '../services/geminiService';
import './ImageUpload.css';

interface ImageUploadProps {
  onAnalysisStart: () => void;
  onAnalysisComplete: (data: AnalysisResult) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onAnalysisStart, onAnalysisComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleFiles = async (files: FileList) => {
    const file = files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);

    onAnalysisStart();

    try {
      const result = await analyzeImage(file);
      onAnalysisComplete(result);
    } catch (error) {
      console.error('分析エラー:', error);
      alert('画像の分析中にエラーが発生しました。もう一度お試しください。');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-upload-container">
      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {selectedImage ? (
          <div className="image-preview">
            <img src={selectedImage} alt="選択された画像" />
            <button onClick={onButtonClick} className="change-image-btn">
              別の画像を選択
            </button>
          </div>
        ) : (
          <div className="upload-prompt">
            <div className="upload-icon">📷</div>
            <h3>画像をアップロード</h3>
            <p>料理の写真なら栄養分析、その他の画像なら俳句を作成します</p>
            <button onClick={onButtonClick} className="upload-btn">
              ファイルを選択
            </button>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default ImageUpload;