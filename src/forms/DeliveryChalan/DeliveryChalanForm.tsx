interface ApiError {
  response?: {
    data: any;
    status: number;
  };
}

try {
  // ... existing code ...
} catch (error) {
  const apiError = error as ApiError;
  if (apiError.response) {
    console.error('Response data:', apiError.response.data);
    console.error('Response status:', apiError.response.status);
  }
  // ... existing code ...
} 