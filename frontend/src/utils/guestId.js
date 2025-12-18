// Utility to generate and manage guest ID for guest cart functionality

const GUEST_ID_KEY = 'guestId';

export const getGuestId = () => {
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  
  if (!guestId) {
    // Generate a unique guest ID
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  
  return guestId;
};

export const clearGuestId = () => {
  localStorage.removeItem(GUEST_ID_KEY);
};

