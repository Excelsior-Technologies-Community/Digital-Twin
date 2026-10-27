const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const {
  createTwin,
  getTwinBySlug,
  chatWithTwin,
  getTwinAnalytics,
} = require('../controllers/twinController');

router.post('/create', upload.single('resumePdf'), createTwin);
router.get('/analytics/:resumeId', getTwinAnalytics);
router.get('/:slug', getTwinBySlug);
router.post('/:slug/chat', chatWithTwin);

module.exports = router;
