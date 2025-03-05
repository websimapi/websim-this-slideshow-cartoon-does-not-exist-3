import React, { useState, useMemo } from 'react';
import { useWebsim } from './WebsimContext.js';

export const Gallery = ({ onViewSlideshow }) => {
  const { room } = useWebsim();
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'mine'
  
  // Use React's useSyncExternalStore hook to get live updates
  const slideshows = React.useSyncExternalStore(
    room?.collection('slideshow').subscribe || (() => {}),
    () => room?.collection('slideshow').getList() || []
  );
  
  // Sort slideshows by creation time (newest first)
  const sortedSlideshows = useMemo(() => {
    return [...(slideshows || [])].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
  }, [slideshows]);
  
  // Filter based on active tab
  const filteredSlideshows = useMemo(() => {
    if (activeTab === 'all') return sortedSlideshows;
    return sortedSlideshows.filter(slideshow => 
      slideshow.username === room?.party.client.username
    );
  }, [sortedSlideshows, activeTab, room?.party.client.username]);
  
  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h2>Slideshow Gallery</h2>
        <div className="tabs">
          <div 
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Slideshows
          </div>
          <div 
            className={`tab ${activeTab === 'mine' ? 'active' : ''}`}
            onClick={() => setActiveTab('mine')}
          >
            My Slideshows
          </div>
        </div>
      </div>
      
      {filteredSlideshows.length === 0 ? (
        <div className="empty-state">
          {activeTab === 'all' 
            ? 'No slideshows have been created yet. Be the first to create one!' 
            : 'You haven\'t created any slideshows yet.'}
        </div>
      ) : (
        <div className="gallery">
          {filteredSlideshows.map(slideshow => (
            <SlideshowPreview 
              key={slideshow.id} 
              slideshow={slideshow} 
              onView={onViewSlideshow}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SlideshowPreview = ({ slideshow, onView }) => {
  // Get first slide for preview thumbnail
  const thumbnailSlide = slideshow.slides && slideshow.slides.length > 0 
    ? slideshow.slides[0] 
    : null;
  
  return (
    <div className="slideshow-item">
      <div className="slideshow-preview">
        {thumbnailSlide?.imageUrl && (
          <img 
            src={thumbnailSlide.imageUrl} 
            alt={slideshow.title} 
          />
        )}
        
        <div className="slideshow-preview-details">
          <div className="slideshow-title">{slideshow.title}</div>
          <div className="slideshow-description">
            {slideshow.slides?.length || 0} slides • Created {new Date(slideshow.created_at).toLocaleDateString()}
          </div>
          <div className="slideshow-creator">
            by {slideshow.username}
          </div>
          
          <button 
            className="view-slideshow-btn"
            onClick={() => onView(slideshow)}
          >
            View Slideshow
          </button>
        </div>
      </div>
    </div>
  );
};

