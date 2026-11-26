const { z } = require('zod');

const ALLOWED_TONES = [
  'Professional',
  'Direct & Technical',
  'Confident & Executive',
  'Friendly & Conversational',
];

const CANONICAL_TONE_MAP = new Map(
  ALLOWED_TONES.map((tone) => [tone.toLowerCase(), tone])
);

const PDF_SIGNATURE = Buffer.from('%PDF-');

const sendValidationError = (res, message) =>
  res.status(400).json({
    success: false,
    message,
    error: message,
  });

const getFirstIssueMessage = (error, fallback = 'Invalid request payload.') => {
  const firstIssue = error?.issues?.[0];
  return firstIssue?.message || fallback;
};

const isRecordObject = (value) =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const hasControlCharacters = (value) => {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code < 32 || code === 127) {
      return true;
    }
  }
  return false;
};

const hasValidPdfSignature = (buffer) =>
  Buffer.isBuffer(buffer) &&
  buffer.length >= 5 &&
  buffer.subarray(0, 1024).includes(PDF_SIGNATURE);

const optionalTrimmedString = (maxLength, label) =>
  z.preprocess(
    (val) => {
      if (val === undefined || val === null) return undefined;
      if (typeof val === 'string' && val.trim() === '') return undefined;
      return val;
    },
    z
      .string(`${label} must be a string.`)
      .trim()
      .max(maxLength, `${label} must be ${maxLength} characters or fewer.`)
      .optional()
  );

const createTwinSchema = z.object({
  name: z
    .string('Candidate name is required.')
    .trim()
    .min(1, 'Candidate name is required.')
    .max(120, 'Candidate name must be 120 characters or fewer.'),
  tone: z.preprocess(
    (val) => {
      if (val === undefined || val === null) return undefined;
      if (typeof val !== 'string') return val;
      const trimmed = val.trim();
      if (!trimmed) return undefined;
      return CANONICAL_TONE_MAP.get(trimmed.toLowerCase()) || trimmed;
    },
    z
      .enum(ALLOWED_TONES, {
        error: `Tone must be one of: ${ALLOWED_TONES.join(', ')}.`,
      })
      .optional()
      .default('Professional')
  ),
  resumeId: optionalTrimmedString(120, 'Resume ID'),
  bio: optionalTrimmedString(15000, 'Candidate bio'),
});

const historyItemSchema = z.object({
  role: z.enum(['user', 'model'], {
    error: 'Each history item role must be either "user" or "model".',
  }),
  text: z
    .string('Each history item text must be a string.')
    .trim()
    .max(4000, 'History message exceeds maximum allowed length.')
    .transform((text) => text.slice(0, 2000)),
});

const chatRequestSchema = z.object({
  message: z
    .string('Message is required.')
    .trim()
    .min(1, 'Message cannot be empty.')
    .max(1000, 'Message must be 1000 characters or fewer.'),
  visitorName: optionalTrimmedString(80, 'Visitor name'),
  history: z
    .array(historyItemSchema, 'Conversation history must be an array.')
    .max(50, 'Conversation history cannot exceed 50 messages.')
    .optional()
    .default([]),
});

const updateTwinSchema = z.object({
  bio: z
    .string('Executive summary must be a string.')
    .trim()
    .min(1, 'Executive summary cannot be empty.')
    .max(15000, 'Executive summary must be 15000 characters or fewer.')
    .optional(),
  title: z
    .string('Professional title must be a string.')
    .trim()
    .max(120, 'Professional title must be 120 characters or fewer.')
    .optional(),
  tone: z.preprocess(
    (val) => {
      if (val === undefined) return undefined;
      if (typeof val !== 'string') return val;
      const trimmed = val.trim();
      return CANONICAL_TONE_MAP.get(trimmed.toLowerCase()) || trimmed;
    },
    z
      .enum(ALLOWED_TONES, {
        error: `Tone must be one of: ${ALLOWED_TONES.join(', ')}.`,
      })
      .optional()
  ),
  skills: z
    .array(
      z
        .string('Each skill must be a string.')
        .trim()
        .min(1, 'Skill entries cannot be empty.')
        .max(80, 'Each skill must be 80 characters or fewer.'),
      'Skills must be an array of strings.'
    )
    .max(40, 'A maximum of 40 skills is allowed.')
    .transform((items) => {
      const seen = new Set();
      const deduped = [];
      for (const skill of items) {
        const lower = skill.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          deduped.push(skill);
        }
      }
      return deduped;
    })
    .optional(),
});

const validateCreateTwin = (req, res, next) => {
  const rawBody = req.body === undefined ? {} : req.body;
  if (!isRecordObject(rawBody)) {
    return sendValidationError(res, 'Request body must be a valid key-value object.');
  }

  const parsed = createTwinSchema.safeParse(rawBody);
  if (!parsed.success) {
    return sendValidationError(res, getFirstIssueMessage(parsed.error, 'Invalid twin payload.'));
  }

  if (req.file && !hasValidPdfSignature(req.file.buffer)) {
    return sendValidationError(res, 'Uploaded file is not a valid PDF document.');
  }

  if (!req.file && !parsed.data.bio) {
    return sendValidationError(
      res,
      'Please upload a PDF resume or provide candidate bio text.'
    );
  }

  req.body = {
    ...rawBody,
    name: parsed.data.name,
    tone: parsed.data.tone,
  };

  if (parsed.data.resumeId !== undefined) {
    req.body.resumeId = parsed.data.resumeId;
  } else {
    delete req.body.resumeId;
  }

  if (parsed.data.bio !== undefined) {
    req.body.bio = parsed.data.bio;
  } else {
    delete req.body.bio;
  }

  return next();
};

const validateChatRequest = (req, res, next) => {
  if (!isRecordObject(req.body)) {
    return sendValidationError(res, 'Request body must be a valid JSON object.');
  }

  const parsed = chatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendValidationError(res, getFirstIssueMessage(parsed.error, 'Invalid chat payload.'));
  }

  req.body = {
    message: parsed.data.message,
    history: parsed.data.history,
  };

  if (parsed.data.visitorName !== undefined) {
    req.body.visitorName = parsed.data.visitorName;
  }

  return next();
};

const validateUpdateTwin = (req, res, next) => {
  if (!isRecordObject(req.body)) {
    return sendValidationError(res, 'Request body must be a valid JSON object.');
  }

  const parsed = updateTwinSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendValidationError(res, getFirstIssueMessage(parsed.error, 'Invalid update payload.'));
  }

  const sanitizedUpdates = {};
  for (const field of ['bio', 'skills', 'title', 'tone']) {
    if (parsed.data[field] !== undefined) {
      sanitizedUpdates[field] = parsed.data[field];
    }
  }

  if (Object.keys(sanitizedUpdates).length === 0) {
    return sendValidationError(
      res,
      'Provide at least one field (bio, skills, title, or tone) to update.'
    );
  }

  req.body = sanitizedUpdates;
  return next();
};

const validateSlugParam = (req, res, next) => {
  const paramKeys = ['slug', 'resumeId'].filter((key) =>
    Object.prototype.hasOwnProperty.call(req.params, key)
  );

  for (const key of paramKeys) {
    const rawValue = req.params[key];
    if (typeof rawValue !== 'string') {
      return sendValidationError(res, `Invalid ${key} parameter.`);
    }
    const trimmed = rawValue.trim();
    if (!trimmed || trimmed.length > 160 || hasControlCharacters(trimmed)) {
      return sendValidationError(
        res,
        `Parameter "${key}" must be a non-empty string of 160 characters or fewer without control characters.`
      );
    }
    req.params[key] = trimmed;
  }

  return next();
};

module.exports = {
  hasValidPdfSignature,
  validateCreateTwin,
  validateChatRequest,
  validateUpdateTwin,
  validateSlugParam,
};
