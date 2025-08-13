import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

function App() {
  const [images, setImages] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleProcess = async () => {
    setLoading(true);
    let output = [];
    for (let img of images) {
      const { data: { text } } = await Tesseract.recognize(img, 'eng');
      output.push({ file: img.name, text });
    }
    setResults(output);
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>OCR Web App</h1>
      <input type="file" multiple onChange={handleFileChange} />
      <button onClick={handleProcess} disabled={loading}>
        {loading ? 'Processing...' : 'Run OCR'}
      </button>
      <div style={{ marginTop: '20px' }}>
        {results.map((res, i) => (
          <div key={i} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
            <strong>{res.file}</strong>
            <pre>{res.text}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
