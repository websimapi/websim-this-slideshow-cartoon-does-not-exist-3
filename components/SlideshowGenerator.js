import React, { useState } from 'react';
import { useWebsim } from './WebsimContext.js';
import { generateStoryAndImages } from '../utils/generationUtils.js';

export const SlideshowGenerator = () => {
  const { room } = useWebsim();
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [slideCount, setSlideCount] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  const MIN_SLIDES = 2;
  const MAX_SLIDES = 6;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !prompt.trim()) {
      setError('Please fill in all fields');
      return;
    }
    
    if (slideCount < MIN_SLIDES || slideCount > MAX_SLIDES) {
      setError(`Please choose between ${MIN_SLIDES} and ${MAX_SLIDES} slides`);
      return;
    }
    
    setError(null);
    setIsGenerating(true);
    
    try {
      await generateStoryAndImages(room, {
        title: title.trim(),
        prompt: prompt.trim(),
        slideCount: parseInt(slideCount)
      });
      
      // Reset form
      setTitle('');
      setPrompt('');
      setSlideCount(3);
    } catch (err) {
      console.error('Generation failed:', err);
      setError('Failed to generate slideshow: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="slideshow-generator">
      <h2>Create New Slideshow</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Slideshow Title</label>
          <input
            type="text"
            id="title"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your slideshow"
            disabled={isGenerating}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="prompt">Theme/Concept</label>
          <textarea
            id="prompt"
            className="form-control"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the theme or concept (e.g., 'Funny animals having a picnic', 'Space adventure with aliens')"
            rows={4}
            disabled={isGenerating}
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="slideCount">Number of Slides ({slideCount})</label>
          <input
            type="range"
            id="slideCount"
            min={MIN_SLIDES}
            max={MAX_SLIDES}
            value={slideCount}
            onChange={(e) => setSlideCount(parseInt(e.target.value))}
            disabled={isGenerating}
          />
          <div className="range-labels">
            <span>{MIN_SLIDES}</span>
            <span>{MAX_SLIDES}</span>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button 
          type="submit" 
          className={`btn btn-primary btn-full ${isGenerating ? 'btn-disabled' : ''}`}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <span className="spinner"></span>
              Generating Slideshow...
            </>
          ) : (
            'Generate Slideshow'
          )}
        </button>
      </form>
      
      {isGenerating && (
        <div className="loading-indicator">
          This may take a minute or two as we generate multiple images...
        </div>
      )}
    </div>
  );
};

