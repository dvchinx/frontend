const API_URL = '/api/images';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
  };
};

export const removeBackground = async (file) => {
  try {
    // Validaciones frontend
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/bmp'];

    if (!file) {
      throw new Error('No se proporcionó ningún archivo');
    }

    if (file.size === 0) {
      throw new Error('El archivo está vacío');
    }

    if (file.size > maxSize) {
      throw new Error('El archivo excede el tamaño máximo permitido (10MB)');
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de archivo no soportado. Solo PNG, JPG, JPEG, WEBP o BMP');
    }

    // Crear FormData
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/remove-background`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      switch (response.status) {
        case 400:
          throw new Error(errorData.message || 'Error en la solicitud');
        case 413:
          throw new Error('El archivo excede el tamaño máximo permitido (10MB)');
        case 503:
          throw new Error('El servicio de procesamiento no está disponible. Intenta más tarde');
        default:
          throw new Error('Error al procesar la imagen');
      }
    }

    // La respuesta es un blob (imagen procesada)
    const blob = await response.blob();
    
    return {
      success: true,
      data: blob,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const downloadImage = (blob, filename = 'image-no-bg.png') => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
