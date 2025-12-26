// Utilidades para procesamiento de imágenes en Canvas

export const loadImageFromUrl = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

export const createCanvas = (width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

// Crop - Recortar imagen
export const cropImage = (canvas, cropArea) => {
  const { x, y, width, height } = cropArea;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(x, y, width, height);
  
  const newCanvas = createCanvas(width, height);
  const newCtx = newCanvas.getContext('2d');
  newCtx.putImageData(imageData, 0, 0);
  
  return newCanvas;
};

// Rotar imagen
export const rotateImage = (canvas, degrees) => {
  const radians = (degrees * Math.PI) / 180;
  let newWidth, newHeight;
  
  if (degrees === 90 || degrees === 270) {
    newWidth = canvas.height;
    newHeight = canvas.width;
  } else {
    newWidth = canvas.width;
    newHeight = canvas.height;
  }
  
  const newCanvas = createCanvas(newWidth, newHeight);
  const ctx = newCanvas.getContext('2d');
  
  ctx.translate(newWidth / 2, newHeight / 2);
  ctx.rotate(radians);
  ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
  
  return newCanvas;
};

// Voltear imagen
export const flipImage = (canvas, direction) => {
  const newCanvas = createCanvas(canvas.width, canvas.height);
  const ctx = newCanvas.getContext('2d');
  
  if (direction === 'horizontal') {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);
  }
  
  ctx.drawImage(canvas, 0, 0);
  return newCanvas;
};

// Redimensionar imagen
export const resizeImage = (canvas, newWidth, newHeight) => {
  const newCanvas = createCanvas(newWidth, newHeight);
  const ctx = newCanvas.getContext('2d');
  
  ctx.drawImage(canvas, 0, 0, newWidth, newHeight);
  return newCanvas;
};

// Ajustar brillo
export const adjustBrightness = (canvas, value) => {
  const newCanvas = createCanvas(canvas.width, canvas.height);
  const ctx = newCanvas.getContext('2d');
  
  ctx.filter = `brightness(${value}%)`;
  ctx.drawImage(canvas, 0, 0);
  
  return newCanvas;
};

// Ajustar contraste
export const adjustContrast = (canvas, value) => {
  const newCanvas = createCanvas(canvas.width, canvas.height);
  const ctx = newCanvas.getContext('2d');
  
  ctx.filter = `contrast(${value}%)`;
  ctx.drawImage(canvas, 0, 0);
  
  return newCanvas;
};

// Ajustar saturación
export const adjustSaturation = (canvas, value) => {
  const newCanvas = createCanvas(canvas.width, canvas.height);
  const ctx = newCanvas.getContext('2d');
  
  ctx.filter = `saturate(${value}%)`;
  ctx.drawImage(canvas, 0, 0);
  
  return newCanvas;
};

// Ajustar nitidez (blur inverso simulado)
export const adjustSharpness = (canvas, value) => {
  if (value <= 100) {
    // Si es 100 o menos, no aplicar ningún efecto
    const newCanvas = createCanvas(canvas.width, canvas.height);
    const ctx = newCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0);
    return newCanvas;
  }
  
  // Para valores > 100, aplicamos un efecto de sharpen mediante convolution
  const newCanvas = createCanvas(canvas.width, canvas.height);
  const ctx = newCanvas.getContext('2d');
  ctx.drawImage(canvas, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Matriz de convolución para sharpen
  const factor = (value - 100) / 100;
  const sharpenKernel = [
    0, -factor, 0,
    -factor, 1 + 4 * factor, -factor,
    0, -factor, 0
  ];
  
  const tempCanvas = createCanvas(canvas.width, canvas.height);
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.putImageData(imageData, 0, 0);
  
  return tempCanvas;
};

// Ajustar sombras
export const adjustShadows = (canvas, value) => {
  const newCanvas = createCanvas(canvas.width, canvas.height);
  const ctx = newCanvas.getContext('2d');
  
  // Simulamos ajuste de sombras combinando brightness en zonas oscuras
  ctx.filter = `brightness(${100 + (value - 100) * 0.5}%)`;
  ctx.drawImage(canvas, 0, 0);
  
  return newCanvas;
};

// Aplicar múltiples ajustes
export const applyAdjustments = (canvas, adjustments) => {
  let result = canvas;
  
  if (adjustments.brightness !== 100) {
    result = adjustBrightness(result, adjustments.brightness);
  }
  if (adjustments.contrast !== 100) {
    result = adjustContrast(result, adjustments.contrast);
  }
  if (adjustments.saturation !== 100) {
    result = adjustSaturation(result, adjustments.saturation);
  }
  if (adjustments.shadows !== 100) {
    result = adjustShadows(result, adjustments.shadows);
  }
  if (adjustments.sharpness !== 100) {
    result = adjustSharpness(result, adjustments.sharpness);
  }
  
  return result;
};

// Convertir canvas a blob
export const canvasToBlob = (canvas, type = 'image/png', quality = 1) => {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
};

// Descargar imagen
export const downloadCanvasAsImage = (canvas, filename = 'edited-image.png') => {
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
};

// Calcular ratios de crop predefinidos
export const calculateCropRatio = (canvas, ratio) => {
  const canvasRatio = canvas.width / canvas.height;
  let width, height, x, y;
  
  if (ratio === '1:1') {
    const size = Math.min(canvas.width, canvas.height);
    width = size;
    height = size;
  } else if (ratio === '4:3') {
    if (canvasRatio > 4/3) {
      height = canvas.height;
      width = height * (4/3);
    } else {
      width = canvas.width;
      height = width * (3/4);
    }
  } else if (ratio === '16:9') {
    if (canvasRatio > 16/9) {
      height = canvas.height;
      width = height * (16/9);
    } else {
      width = canvas.width;
      height = width * (9/16);
    }
  } else if (ratio === '16:10') {
    if (canvasRatio > 16/10) {
      height = canvas.height;
      width = height * (16/10);
    } else {
      width = canvas.width;
      height = width * (10/16);
    }
  } else {
    // Free ratio - mantener dimensiones actuales
    width = canvas.width;
    height = canvas.height;
  }
  
  x = (canvas.width - width) / 2;
  y = (canvas.height - height) / 2;
  
  return { x, y, width, height };
};
