
export const validateFile = (file: File, user: any) => {
  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    return { isValid: false, error: 'File exceeds 10 MB limit.' };
  }

  // Check if user is authenticated
  if (!user) {
    return { isValid: false, error: 'You must be signed in to upload files.' };
  }

  // Check file type
  const allowedExtensions = ['.txt', '.pdf', '.epub'];
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  
  if (!allowedExtensions.includes(fileExtension)) {
    return { isValid: false, error: 'Please upload a .txt, .pdf, or .epub file.' };
  }

  return { isValid: true, error: null };
};
