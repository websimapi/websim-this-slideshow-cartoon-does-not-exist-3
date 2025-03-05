/**
 * Generate a story and corresponding images based on the prompt
 * @param {Object} room - WebsimSocket room instance
 * @param {Object} options - Generation options
 * @param {string} options.title - Slideshow title
 * @param {string} options.prompt - Main theme/concept for the slideshow
 * @param {number} options.slideCount - Number of slides to generate
 */
export const generateStoryAndImages = async (room, { title, prompt, slideCount }) => {
  if (!room) {
    throw new Error('WebsimSocket room not initialized');
  }
  
  try {
    // Step 1: Generate storyline with LLM
    const storyline = await generateStoryline(prompt, slideCount);
    
    // Step 2: Generate images for each slide
    const slides = await Promise.all(
      storyline.map(async (slide) => {
        const imagePrompt = slide.imagePrompt;
        const imageUrl = await generateImage(imagePrompt);
        
        return {
          text: slide.text,
          imagePrompt,
          imageUrl
        };
      })
    );
    
    // Step 3: Save the complete slideshow to database
    const slideshow = await room.collection('slideshow').create({
      title,
      prompt,
      slides,
    });
    
    return slideshow;
  } catch (error) {
    console.error('Error generating slideshow:', error);
    throw error;
  }
};

/**
 * Generate a storyline based on prompt
 * @param {string} prompt - The main theme/concept
 * @param {number} slideCount - Number of slides to generate
 * @returns {Array} Array of slide objects with text and imagePrompt
 */
const generateStoryline = async (prompt, slideCount) => {
  try {
    const completion = await websim.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a creative children's cartoon storyboard writer. 
          Create a fun, child-friendly cartoon storyline based on the user's prompt.
          The story should be told in exactly ${slideCount} scenes.
          For each scene, provide:
          1. A descriptive sentence or two about what's happening in the scene
          2. A detailed image prompt that would work well for AI image generation to create that scene`
        },
        {
          role: "user",
          content: `Create a cartoon slideshow with ${slideCount} slides about: "${prompt}"`
        }
      ],
      json: true
    });
    
    // Parse the JSON response
    const storyData = JSON.parse(completion.content);
    
    // Normalize the response into the expected format
    let slides = [];
    
    // Handle if the AI returned an array of slides directly
    if (Array.isArray(storyData)) {
      slides = storyData.map(slide => ({
        text: slide.text || slide.description || slide.caption || "",
        imagePrompt: slide.imagePrompt || slide.prompt || ""
      }));
    } 
    // Handle if the AI returned an object with a slides array
    else if (storyData.slides && Array.isArray(storyData.slides)) {
      slides = storyData.slides.map(slide => ({
        text: slide.text || slide.description || slide.caption || "",
        imagePrompt: slide.imagePrompt || slide.prompt || ""
      }));
    }
    // Handle if the AI returned scene1, scene2, etc. format
    else {
      for (let i = 1; i <= slideCount; i++) {
        const sceneKey = `scene${i}`;
        const slide = storyData[sceneKey] || storyData[`slide${i}`];
        if (slide) {
          slides.push({
            text: slide.text || slide.description || slide.caption || "",
            imagePrompt: slide.imagePrompt || slide.prompt || ""
          });
        }
      }
    }
    
    // Ensure we have the right number of slides
    if (slides.length !== slideCount) {
      console.warn(`Expected ${slideCount} slides but got ${slides.length}`);
      // Pad or trim as needed
      while (slides.length < slideCount) {
        slides.push({
          text: "Scene description unavailable",
          imagePrompt: `Cartoon scene related to ${prompt}`
        });
      }
      if (slides.length > slideCount) {
        slides = slides.slice(0, slideCount);
      }
    }
    
    return slides;
  } catch (error) {
    console.error('Error generating storyline:', error);
    throw new Error('Failed to generate storyline: ' + error.message);
  }
};

/**
 * Generate an image based on a prompt
 * @param {string} prompt - The image generation prompt
 * @returns {string} URL of the generated image
 */
const generateImage = async (prompt) => {
  try {
    // Enhance the prompt to ensure it generates a cartoon-style image
    const enhancedPrompt = `A children's cartoon illustration: ${prompt}. Colorful, fun, child-friendly style with simple backgrounds.`;
    
    // Generate the image
    const result = await websim.imageGen({
      prompt: enhancedPrompt,
      aspect_ratio: "16:9"
    });
    
    return result.url;
  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error('Failed to generate image: ' + error.message);
  }
};

