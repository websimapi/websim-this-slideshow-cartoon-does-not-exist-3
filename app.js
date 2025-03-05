import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { SlideshowGenerator } from './components/SlideshowGenerator.js';
import { Gallery } from './components/Gallery.js';
import { SlideshowModal } from './components/SlideshowModal.js';
import { WebsimProvider, useWebsim } from './components/WebsimContext.js';

const App = () => {
  const { room, creatorUsername } = useWebsim();
  const [activeSlideshow, setActiveSlideshow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleViewSlideshow = (slideshow) => {
    setActiveSlideshow(slideshow);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveSlideshow(null);
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>This Slideshow Cartoon Does Not Exist</h1>
        <p>Generate unique cartoon slideshows with AI!</p>
      </header>
      
      <main className="main-content">
        <SlideshowGenerator />
        <Gallery onViewSlideshow={handleViewSlideshow} />
      </main>
      
      {isModalOpen && activeSlideshow && (
        <SlideshowModal 
          slideshow={activeSlideshow} 
          onClose={closeModal} 
        />
      )}
    </div>
  );
};

const AppWithContext = () => (
  <WebsimProvider>
    <App />
  </WebsimProvider>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AppWithContext />);

