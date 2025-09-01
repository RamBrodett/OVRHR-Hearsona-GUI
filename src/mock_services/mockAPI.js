export const mockAPI = {
  chatQuery: async (userInput, settings) => {
    
    // Generate response based on input keywords
    let responseMessage = "I've generated audio based on your description.";
    let hasAudio = true;
    
    if (userInput.toLowerCase().includes('wave')) {
      responseMessage = "I've created calming ocean wave sounds for you.";
    } else if (userInput.toLowerCase().includes('bird')) {
      responseMessage = "Here's a lovely bird chirping sound.";
    } else if (userInput.toLowerCase().includes('gong')) {
      responseMessage = "I've generated a deep, resonant gong sound.";
    } else if (userInput.toLowerCase().includes('error')) {
      // Simulate API error for testing
      throw new Error('Mock API error for testing');
    }
    
    // Add settings feedback
    if (settings.pitch) responseMessage += ` The pitch has been adjusted to ${settings.pitch}.`;
    if (settings.loudness) responseMessage += ` Volume set to ${settings.loudness}.`;
    if (settings.duration) responseMessage += ` Duration set to ${settings.duration} seconds.`;
    
    return {
      status: "success",
      message: responseMessage,
      audio_base64: hasAudio ? "UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmccETiB1O/Eeiwx" : null
    };
  },
  
  sessionRestart: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { status: "success", message: "Session restarted successfully" };
  },
  
  sessionNew: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { status: "success", message: "New user session created" };
  },
  
  sessionExport: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { status: "success", message: `Chat exported with ID: ${id}` };
  }
};
