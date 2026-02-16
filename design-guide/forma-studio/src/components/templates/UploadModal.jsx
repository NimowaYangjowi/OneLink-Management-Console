import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { FileDropzone } from '../input/FileDropzone';
import { TagInput } from '../input/TagInput';

/**
 * UploadModal 템플릿
 *
 * 레퍼런스 이미지를 업로드하고 메타데이터를 입력하는 전체 플로우 모달.
 * FileDropzone, TagInput 등 하위 컴포넌트를 조합한 템플릿.
 *
 * 동작 방식:
 * 1. Step 1: 파일 드래그 앤 드롭 또는 선택
 * 2. Step 2: 제목, 카테고리, 태그 입력
 * 3. Step 3: 업로드 진행 및 완료 확인
 * 4. 성공 시 Toast 피드백 표시
 *
 * Props:
 * @param {boolean} isOpen - 모달 열림 상태 [Required]
 * @param {function} onClose - 모달 닫기 핸들러 [Required]
 * @param {function} onUpload - 업로드 완료 핸들러 (data) => Promise [Required]
 * @param {Array} categories - 카테고리 옵션 목록 [{ id, label }] [Optional]
 * @param {string[]} suggestedTags - 태그 자동완성 제안 [Optional]
 *
 * Example usage:
 * <UploadModal
 *   isOpen={showUpload}
 *   onClose={() => setShowUpload(false)}
 *   onUpload={handleUpload}
 *   categories={categoryOptions}
 * />
 */
export function UploadModal({
  isOpen,
  onClose,
  onUpload,
  categories = [
    { id: 'photography', label: 'Photography' },
    { id: 'illustration', label: 'Illustration' },
    { id: 'ui-design', label: 'UI Design' },
    { id: 'branding', label: 'Branding' },
    { id: 'motion', label: 'Motion Graphics' },
    { id: 'other', label: 'Other' },
  ],
  suggestedTags = ['minimal', 'bold', 'colorful', 'dark', 'light', 'retro', 'modern', 'organic'],
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    tags: [],
    memo: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);

  const steps = ['Select File', 'Add Details', 'Upload'];

  /**
   * 파일 선택 핸들러
   */
  const handleFileSelect = useCallback((file) => {
    setSelectedFile(file);
    setError(null);

    // 미리보기 URL 생성
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }, []);

  /**
   * 파일 제거 핸들러
   */
  const handleFileRemove = useCallback(() => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  /**
   * 폼 데이터 변경 핸들러
   */
  const handleFormChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  /**
   * 다음 단계로 이동
   */
  const handleNext = useCallback(() => {
    if (activeStep === 0 && !selectedFile) {
      setError('Please select a file to upload');
      return;
    }
    if (activeStep === 1 && !formData.title.trim()) {
      setError('Please enter a title');
      return;
    }
    setError(null);
    setActiveStep((prev) => prev + 1);
  }, [activeStep, selectedFile, formData.title]);

  /**
   * 이전 단계로 이동
   */
  const handleBack = useCallback(() => {
    setError(null);
    setActiveStep((prev) => prev - 1);
  }, []);

  /**
   * 상태 리셋
   * @param {boolean} keepPreviewUrl - 업로드 성공 시 previewUrl 유지 (true면 revoke 안함)
   */
  const resetState = useCallback((keepPreviewUrl = false) => {
    setActiveStep(0);
    setSelectedFile(null);
    if (previewUrl && !keepPreviewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setFormData({ title: '', category: '', tags: [], memo: '' });
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
  }, [previewUrl]);

  /**
   * 모달 닫기
   */
  const handleClose = useCallback(() => {
    if (!isUploading) {
      resetState();
      onClose();
    }
  }, [isUploading, resetState, onClose]);

  /**
   * 업로드 실행
   */
  const handleUpload = useCallback(async () => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 업로드 진행률 시뮬레이션
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // 실제 업로드 호출 (previewUrl 포함)
      await onUpload({
        file: selectedFile,
        previewUrl,
        ...formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // 성공 처리 (previewUrl 유지하여 아카이브에서 표시 가능)
      setTimeout(() => {
        setShowSuccess(true);
        resetState(true);
        onClose();
      }, 500);
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
      setIsUploading(false);
    }
  }, [selectedFile, formData, previewUrl, onUpload, onClose, resetState]);

  /**
   * Step 컨텐츠 렌더링
   */
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ py: 2 }}>
            <FileDropzone
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              selectedFile={selectedFile}
              previewUrl={previewUrl}
              variant="default"
            />
            {selectedFile && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2, textAlign: 'center' }}
              >
                Click "Next" to add details about this reference
              </Typography>
            )}
          </Box>
        );

      case 1:
        return (
          <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* 미리보기 썸네일 */}
            {previewUrl && (
              <Box
                sx={{
                  width: '100%',
                  height: 120,
                  borderRadius: 1,
                  overflow: 'hidden',
                  bgcolor: 'grey.100',
                }}
              >
                <Box
                  component="img"
                  src={previewUrl}
                  alt="Preview"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            )}

            {/* 제목 입력 */}
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => handleFormChange('title', e.target.value)}
              placeholder="Enter a descriptive title"
              fullWidth
              required
            />

            {/* 카테고리 선택 */}
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => handleFormChange('category', e.target.value)}
                label="Category"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 태그 입력 */}
            <TagInput
              tags={formData.tags}
              onChange={(tags) => handleFormChange('tags', tags)}
              placeholder="Add style keywords..."
              suggestions={suggestedTags}
              maxTags={8}
              label="Tags"
            />

            {/* 메모 입력 */}
            <TextField
              label="Memo (Optional)"
              value={formData.memo}
              onChange={(e) => handleFormChange('memo', e.target.value)}
              placeholder="Add notes about this reference..."
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        );

      case 2:
        return (
          <Box
            sx={{
              py: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
            }}
          >
            {/* 업로드 진행 표시 */}
            <FileDropzone
              selectedFile={selectedFile}
              previewUrl={previewUrl}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              isComplete={uploadProgress === 100}
              variant="compact"
            />

            {!isUploading && (
              <>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Ready to Upload
                </Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>{formData.title}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formData.category && `${categories.find((c) => c.id === formData.category)?.label} • `}
                    {formData.tags.length} tags
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Modal
        open={isOpen}
        onClose={handleClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 540,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            outline: 'none',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* 헤더 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 3,
              pb: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CloudUploadIcon sx={{ color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Upload Reference
              </Typography>
            </Box>
            <IconButton onClick={handleClose} disabled={isUploading} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Stepper */}
          <Box sx={{ px: 3, pt: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* 컨텐츠 */}
          <Box sx={{ px: 3, flex: 1, overflow: 'auto' }}>
            {renderStepContent()}

            {/* 에러 메시지 */}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>

          {/* 푸터 */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              p: 3,
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Button
              onClick={activeStep === 0 ? handleClose : handleBack}
              disabled={isUploading}
              sx={{ textTransform: 'none' }}
            >
              {activeStep === 0 ? 'Cancel' : 'Back'}
            </Button>
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handleUpload : handleNext}
              disabled={isUploading}
              sx={{ textTransform: 'none', fontWeight: 600, minWidth: 100 }}
            >
              {activeStep === steps.length - 1
                ? isUploading
                  ? 'Uploading...'
                  : 'Upload'
                : 'Next'}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* 성공 Toast */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setShowSuccess(false)}>
          Reference uploaded successfully!
        </Alert>
      </Snackbar>
    </>
  );
}
