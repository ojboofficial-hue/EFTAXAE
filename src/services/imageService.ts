// Use local placeholder images for tax Authority illustrations
export const generateTaxImage = async (prompt: string) => {
  try {
    // Use a consistent, high-quality placeholder image service
    // based on the prompt for visual consistency
    return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/1920/1080?blur=1`;
  } catch (error) {
    console.warn("Image generation fallback: Using placeholder image.");
    return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/1920/1080?blur=1`;
  }
};
