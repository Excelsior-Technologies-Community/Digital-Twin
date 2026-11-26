const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  createTwinLimiter,
  chatTwinLimiter,
  standardReadLimiter,
  updateTwinLimiter,
} = require('../middlewares/rateLimiters');
const { requireEditToken } = require('../middlewares/authEditToken');
const {
  validateCreateTwin,
  validateChatRequest,
  validateUpdateTwin,
  validateSlugParam,
} = require('../middlewares/validateRequest');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF documents are permitted.'));
    }
  },
});

const {
  createTwin,
  getTwinBySlug,
  updateTwinBySlug,
  chatWithTwin,
  getTwinAnalytics,
} = require('../controllers/twinController');

const handleResumeUpload = (req, res, next) => {
  upload.single('resumePdf')(req, res, (err) => {
    if (err) {
      const errorMessage =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'File size exceeds 10MB limit. Please upload a smaller PDF.'
          : err.message || 'Error processing uploaded file';
      return res.status(400).json({
        success: false,
        message: errorMessage,
        error: errorMessage,
      });
    }
    return next();
  });
};

router.post('/create', createTwinLimiter, handleResumeUpload, validateCreateTwin, createTwin);
router.get('/analytics/:resumeId', standardReadLimiter, validateSlugParam, getTwinAnalytics);
router.get('/:slug', standardReadLimiter, validateSlugParam, getTwinBySlug);
router.patch('/:slug', updateTwinLimiter, validateSlugParam, requireEditToken, validateUpdateTwin, updateTwinBySlug);
router.post('/:slug/chat', chatTwinLimiter, validateSlugParam, validateChatRequest, chatWithTwin);

module.exports = router;
