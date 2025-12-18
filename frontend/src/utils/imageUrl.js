// Utility to get the correct backend base URL for images
// This handles both development and production environments

export const getBackendBaseURL = () => {
  // Get API URL from environment variable
  const apiUrl = import.meta.env.VITE_API_URL;
  
  if (apiUrl) {
    // Remove /api suffix if present to get base URL
    return apiUrl.replace('/api', '');
  }
  
  // Fallback: determine based on current hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Production backend URL (adjust based on your deployment)
    if (hostname.includes('vercel.app') || hostname.includes('netlify.app')) {
      // Use your production backend URL here
      return 'https://full-ecommerce-project-u69s.onrender.com';
    }
  }
  
  // Default to localhost for local development
  return 'http://localhost:5000';
};

// Helper to construct full image URL from relative path
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // If already a full URL (http/https), check if it's localhost in production
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    // If it's a localhost URL in production, replace it
    if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
      if (imagePath.includes('localhost:5000')) {
        const backendURL = getBackendBaseURL();
        const relativePath = imagePath.split('localhost:5000')[1];
        return `${backendURL}${relativePath}`;
      }
    }
    return imagePath;
  }
  
  // If it's a relative path, prepend backend base URL
  const baseURL = getBackendBaseURL();
  return `${baseURL}${imagePath}`;
};

