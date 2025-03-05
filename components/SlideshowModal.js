import React, { useState } from 'react';

export const SlideshowModal = ({ slideshow, onClose }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
  const slides = slideshow.slides || [];
  const currentSlide = slides[currentSlideIndex];
  
  const goToNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };
  
  const goToPrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };
  
  if (!slideshow || slides.length === 0) {
    return null;
  }
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="slideshow-meta">
          <h2>{slideshow.title}</h2>
          <div className="creator">by {slideshow.username}</div>
        </div>
        
        <div className="slideshow-container">
          <div className="slide">
            <div className="slide-img">
              {currentSlide?.imageUrl && (
                <img 
                  src={currentSlide.imageUrl} 
                  alt={`Slide ${currentSlideIndex + 1}`} 
                />
              )}
            </div>
            <div className="slide-caption">
              {currentSlide?.text}
            </div>
          </div>
        </div>
        
        <div className="slide-controls">
          <button 
            className="slide-btn"
            onClick={goToPrevSlide}
            disabled={currentSlideIndex === 0}
          >
            Previous
          </button>
          <div className="slide-indicator">
            {currentSlideIndex + 1} / {slides.length}
          </div>
          <button 
            className="slide-btn"
            onClick={goToNextSlide}
            disabled={currentSlideIndex === slides.length - 1}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

