import { useState, useEffect, useRef } from 'react';
import './ImageGalleryEditor.css';
import { getAllImages, uploadImage, deleteImage } from '../../../services/galleryService';
import { removeBackground } from '../../../services/imageService';
import { useLanguage } from '../../../i18n/LanguageContext';
import ConfirmModal from '../../common/ConfirmModal/ConfirmModal';
import DownloadIcon from '../../../assets/Download.svg';
import TrashIcon from '../../../assets/Trash.svg';
import {
  loadImageFromUrl,
  createCanvas,
  cropImage,
  rotateImage,
  flipImage,
  resizeImage,
  applyAdjustments,
  calculateCropRatio,
  canvasToBlob,
} from '../../../utils/imageProcessing';

function ImageGalleryEditor() {
  const { t } = useLanguage();
  
  // Gallery states
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const fileInputRef = useRef(null);
  
  // Editor states
  const [currentCanvas, setCurrentCanvas] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [cropMode, setCropMode] = useState(false);
  const [cropSelection, setCropSelection] = useState(null);
  const [cropRatio, setCropRatio] = useState('free');
  const [adjustments, setAdjustments] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    shadows: 100,
    sharpness: 100,
  });
  const [resizeWidth, setResizeWidth] = useState('');
  const [resizeHeight, setResizeHeight] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    loadImages();
  }, []);

  useEffect(() => {
    if (selectedImage && showEditor) {
      loadImageForEditing();
    }
  }, [selectedImage, showEditor]);

  useEffect(() => {
    if (currentCanvas && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = currentCanvas.width;
      canvasRef.current.height = currentCanvas.height;
      ctx.drawImage(currentCanvas, 0, 0);
    }
  }, [currentCanvas]);

  // Gallery functions
  const loadImages = async () => {
    setLoading(true);
    const result = await getAllImages();
    
    if (result.success) {
      setImages(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= 5) {
      setError(t('maxImagesReached'));
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setError(t('invalidFileType'));
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(t('fileTooLarge'));
      return;
    }

    setUploading(true);
    setError(null);

    const result = await uploadImage(file);

    if (result.success) {
      await loadImages();
      setError(null);
    } else {
      setError(result.error);
    }

    setUploading(false);
    e.target.value = '';
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowEditor(true);
  };

  const handleDeleteClick = (image) => {
    setImageToDelete(image);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!imageToDelete) return;

    const result = await deleteImage(imageToDelete.id);

    if (result.success) {
      await loadImages();
      setError(null);
    } else {
      setError(result.error);
    }

    setShowConfirmDelete(false);
    setImageToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
    setImageToDelete(null);
  };

  // Editor functions
  const loadImageForEditing = async () => {
    const fullUrl = selectedImage.url.startsWith('http') 
      ? selectedImage.url 
      : selectedImage.url;
    
    try {
      const img = await loadImageFromUrl(fullUrl);
      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      setCurrentCanvas(canvas);
      setOriginalImage(img);
      setResizeWidth(img.width);
      setResizeHeight(img.height);
      setHasChanges(false);
      setActiveTool(null);
    } catch (error) {
      console.error('Error loading image:', error);
    }
  };

  const handleRotate = (degrees) => {
    if (!currentCanvas) return;
    const rotated = rotateImage(currentCanvas, degrees);
    setCurrentCanvas(rotated);
    setResizeWidth(rotated.width);
    setResizeHeight(rotated.height);
    setHasChanges(true);
  };

  const handleFlip = (direction) => {
    if (!currentCanvas) return;
    const flipped = flipImage(currentCanvas, direction);
    setCurrentCanvas(flipped);
    setHasChanges(true);
  };

  const handleRemoveBackground = async () => {
    if (!currentCanvas) return;
    
    setProcessing(true);
    
    try {
      const blob = await canvasToBlob(currentCanvas);
      const file = new File([blob], 'temp.png', { type: 'image/png' });
      
      const result = await removeBackground(file);
      
      if (result.success && result.data) {
        const blobUrl = URL.createObjectURL(result.data);
        const img = await loadImageFromUrl(blobUrl);
        const canvas = createCanvas(img.width, img.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        setCurrentCanvas(canvas);
        setHasChanges(true);
        
        URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      console.error('Error removing background:', error);
    }
    
    setProcessing(false);
    setActiveTool(null);
  };

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    
    canvasRef.current.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edited_${selectedImage.filename}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const handleSaveImage = async () => {
    if (!canvasRef.current || !hasChanges) return;
    
    setProcessing(true);
    
    try {
      const blob = await canvasToBlob(canvasRef.current);
      const file = new File([blob], selectedImage.filename, { type: 'image/png' });
      
      const uploadResult = await uploadImage(file);
      
      if (uploadResult.success) {
        await deleteImage(selectedImage.id);
        await loadImages();
        handleCloseEditor();
      }
    } catch (error) {
      console.error('Error saving image:', error);
    }
    
    setProcessing(false);
  };

  const handleCloseEditor = () => {
    if (hasChanges) {
      if (window.confirm(t('discardChanges'))) {
        setShowEditor(false);
        setSelectedImage(null);
        setCurrentCanvas(null);
        setHasChanges(false);
        setActiveTool(null);
      }
    } else {
      setShowEditor(false);
      setSelectedImage(null);
      setCurrentCanvas(null);
      setActiveTool(null);
    }
  };

  const handleAdjustmentChange = (key, value) => {
    setAdjustments(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyAdjustments = () => {
    if (!currentCanvas) return;
    
    const adjusted = applyAdjustments(currentCanvas, adjustments);
    setCurrentCanvas(adjusted);
    setActiveTool(null);
    setHasChanges(true);
  };

  const handleResetAdjustments = () => {
    setAdjustments({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      shadows: 100,
      sharpness: 100,
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Render editor view
  if (showEditor && selectedImage) {
    return (
      <div className="image-editor-overlay">
        <div className="image-editor-header">
          <h2 className="image-editor-title">{selectedImage.filename}</h2>
          <div className="image-editor-header-actions">
            <button className="btn-secondary" onClick={handleDownload}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" strokeLinecap="round"/>
                <polyline points="7 10 12 15 17 10" strokeWidth="2" strokeLinecap="round"/>
                <line x1="12" y1="15" x2="12" y2="3" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {t('download')}
            </button>
            <button 
              className="btn-primary" 
              onClick={handleSaveImage}
              disabled={!hasChanges || processing}
            >
              {processing ? t('saving') : t('saveChanges')}
            </button>
            <button className="btn-secondary" onClick={handleCloseEditor}>
              {t('cancel')}
            </button>
          </div>
        </div>

        <div className="image-editor-content">
          <div className="image-editor-toolbar">
            {/* Rotate */}
            <div className="toolbar-section">
              <div className="toolbar-section-title">{t('rotate')}</div>
              <div className="toolbar-rotate-buttons">
                <button className="toolbar-rotate-btn" onClick={() => handleRotate(90)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  90°
                </button>
                <button className="toolbar-rotate-btn" onClick={() => handleRotate(180)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  180°
                </button>
                <button className="toolbar-rotate-btn" onClick={() => handleRotate(270)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M2.5 2v6h6M21.5 22v-6h-6M22 11.5a10 10 0 0 0-18.8-4.3M2 12.5a10 10 0 0 0 18.8 4.2" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  270°
                </button>
              </div>
            </div>

            {/* Flip */}
            <div className="toolbar-section">
              <div className="toolbar-section-title">{t('flip')}</div>
              <div className="toolbar-flip-buttons">
                <button className="toolbar-button" onClick={() => handleFlip('horizontal')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 2v20M16 8h6M16 16h6M6 8H2M6 16H2" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  {t('horizontal')}
                </button>
                <button className="toolbar-button" onClick={() => handleFlip('vertical')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M2 12h20M8 18v4M16 18v4M8 6V2M16 6V2" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  {t('vertical')}
                </button>
              </div>
            </div>

            {/* Remove Background */}
            <div className="toolbar-section">
              <div className="toolbar-section-title">{t('IA')}</div>
              <button 
                className="toolbar-button"
                onClick={handleRemoveBackground}
                disabled={processing}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M3 9h18M9 21V9" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {processing ? t('processing') : t('removeBackground')}
              </button>
            </div>

            {/* Adjustments */}
            <div className="toolbar-section">
              <div className="toolbar-section-title">{t('adjustments')}</div>
              
              <div className="adjustment-control">
                <div className="adjustment-label">
                  <span>{t('brightness')}</span>
                  <span className="adjustment-value">{adjustments.brightness}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={adjustments.brightness}
                  onChange={(e) => handleAdjustmentChange('brightness', parseInt(e.target.value))}
                  className="adjustment-slider"
                />
              </div>

              <div className="adjustment-control">
                <div className="adjustment-label">
                  <span>{t('contrast')}</span>
                  <span className="adjustment-value">{adjustments.contrast}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={adjustments.contrast}
                  onChange={(e) => handleAdjustmentChange('contrast', parseInt(e.target.value))}
                  className="adjustment-slider"
                />
              </div>

              <div className="adjustment-control">
                <div className="adjustment-label">
                  <span>{t('saturation')}</span>
                  <span className="adjustment-value">{adjustments.saturation}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={adjustments.saturation}
                  onChange={(e) => handleAdjustmentChange('saturation', parseInt(e.target.value))}
                  className="adjustment-slider"
                />
              </div>

              <div className="adjustment-actions">
                <button className="btn-secondary" onClick={handleResetAdjustments}>
                  {t('reset')}
                </button>
                <button className="btn-primary" onClick={handleApplyAdjustments}>
                  {t('apply')}
                </button>
              </div>
            </div>
          </div>

          <div className="image-editor-canvas-area">
            <canvas ref={canvasRef} className="image-editor-canvas" />
          </div>
        </div>
      </div>
    );
  }

  // Render gallery view
  return (
    <div className="image-gallery-editor">
      <div className="gallery-container">
        <div className="gallery-header">
          <h1>{t('Galería de Imágenes')}</h1>
          <button 
            className="btn-primary" 
            onClick={handleUploadClick}
            disabled={uploading || images.length >= 5}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" strokeLinecap="round"/>
              <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {uploading ? t('uploading') : t('uploadImage')}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner">
              <svg width="60" height="60" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="31.4 31.4" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="gallery-grid">
            {images.map((image) => (
              <div key={image.id} className="gallery-item">
                <img
                  src={image.url.startsWith('http') ? image.url : image.url}
                  alt={image.filename}
                  onClick={() => handleImageClick(image)}
                />
                <div className="image-info">
                  <span className="image-name">{image.filename}</span>
                  <span className="image-size">{formatFileSize(image.fileSize)}</span>
                </div>
                <div className="image-actions">
                  <button
                    className="action-button delete"
                    onClick={() => handleDeleteClick(image)}
                    title={t('delete')}
                  >
                    <img src={TrashIcon} alt="Delete" width="16" height="16" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && images.length === 0 && (
          <div className="empty-state">
            <p>{t('noImages')}</p>
          </div>
        )}
      </div>

      {showConfirmDelete && (
        <ConfirmModal
          title={t('deleteImage')}
          message={t('deleteImageConfirm')}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}

export default ImageGalleryEditor;
