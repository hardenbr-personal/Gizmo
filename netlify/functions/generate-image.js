const fetch = require('node-fetch');

// HARDCODE YOUR API KEY HERE
const API_KEY = 'AIzaSyBOMOO4TtuQ7SmC72T82fd352RBk9DA7bQ';

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { prompt, aspectRatio = '1:1' } = JSON.parse(event.body);

    if (!prompt) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing prompt' })
      };
    }

    // Optimized prompt for digital coloring with paint bucket tool
    const enhancedPrompt = `Create a black and white line art coloring page of: ${prompt}

STYLE:
- Clean adult coloring book style with defined sections for coloring
- Try and have lines all connect so areas can be colored in with a flood tool
- Larger bolder subject compared to background
- NO mandala patterns, NO zentangle, NO geometric fill patterns inside objects
- Objects should look natural and realistic, not decorated with abstract patterns
- Think: traditional children's or beginner adult coloring book

COMPOSITION:
- Main subject with BOLD BLACK OUTLINE (3-4 pixels) 
- Background with basic designs and cells that can be colored in
- Medium-sized sections that are easy to fill - not too tiny, not too large
- No wide open spaces that the fill tool will just fill with one click
- Solid border around each image
- Aim for 300 distinct cells that can be colored

LINE REQUIREMENTS:
- Bold, clean outlines (2-3 pixels) 
- NO gradients, NO gray tones, NO shading - pure black lines on white
- All areas must be fully enclosed for paint bucket filling
- All lines must connect to create cells that can be filled in with a paint fill tool
- Simple, smooth lines - not overly detailed or busy

WHAT TO AVOID:
- No intricate patterns inside objects
- No mandala or zentangle style decorations  
- No tiny detailed sections
- No crosshatching or texture lines

TECHNICAL:
- 1024x1024 resolution
- Optimized for tap-to-fill digital coloring

Generate the actual image, not a description.`;

    console.log('Calling Gemini 2.5 Flash Image...');

    // Use Gemini 2.5 Flash Image model
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: enhancedPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.4,
            responseModalities: ["IMAGE"]
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error:', response.status, errorText);
      
      return {
        statusCode: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: `Gemini API Error: ${response.status}`,
          details: errorText,
          helpText: "Make sure your API key has access to Gemini 2.5 Flash Image model and billing is set up."
        })
      };
    }

    const data = await response.json();
    console.log('API response received');

    // Extract image from response
    if (data.candidates && data.candidates[0]?.content?.parts) {
      const parts = data.candidates[0].content.parts;
      
      // Look for inline image data
      const imagePart = parts.find(part => part.inlineData);
      
      if (imagePart && imagePart.inlineData) {
        // Transform to expected format
        const transformedData = {
          generated_images: [{
            image: {
              image_bytes: imagePart.inlineData.data
            }
          }]
        };
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify(transformedData)
        };
      }
    }

    // If no image found
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'No image generated',
        details: 'Gemini 2.5 Flash Image did not return an image.',
        suggestion: 'Try a different prompt or check that the model is available.',
        fullResponse: data
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};