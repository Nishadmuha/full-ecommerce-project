import api from './api';

// Upload single image
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  return api.post('/upload/single', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Upload multiple images
export const uploadImages = (files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });
  
  return api.post('/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};


