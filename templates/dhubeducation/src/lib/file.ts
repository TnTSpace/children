export interface UploadResult {
  id: string;
  url: string;
  directUrl: string;
  filename: string;
  size: number;
}

export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/files', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload file');
  }

  const result = await response.json();
  // directUrl is the publicly servable object URL; url points at the MinIO console API
  return result.directUrl || result.url;
};
