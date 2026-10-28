const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB strict limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF documents are permitted.'));
    }
  }
});

const {
  createTwin,
  getTwinBySlug,
  chatWithTwin,
  getTwinAnalytics,
} = require('../controllers/twinController');

// Multer error handling wrapper for clean JSON responses
const handleResumeUpload = (req, res, next) => {
  upload.single('resumePdf')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds 10MB limit. Please upload a smaller PDF.',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'Error processing uploaded file',
      });
    }
    next();
  });
};

router.post('/create', handleResumeUpload, createTwin);
router.get('/analytics/:resumeId', getTwinAnalytics);
router.get('/:slug', getTwinBySlug);
router.post('/:slug/chat', chatWithTwin);

module.exports = router;
