export const validateFile = (file: File, user: any) => {
  // Check if user is authenticated
  if (!user) {
    return { isValid: false, error: 'You must be signed in to upload files.' };
  }

  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return { isValid: false, error: `File exceeds 5 MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)} MB.` };
  }

  // Check file type
  const allowedExtensions = ['.txt', '.pdf', '.epub'];
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  
  if (!allowedExtensions.includes(fileExtension)) {
    return { 
      isValid: false, 
      error: `Unsupported file type: ${fileExtension}. Please upload a .txt, .pdf, or .epub file.` 
    };
  }

  // Additional validation for empty files
  if (file.size === 0) {
    return { isValid: false, error: 'Cannot upload empty files.' };
  }

  return { isValid: true, error: null };
};
