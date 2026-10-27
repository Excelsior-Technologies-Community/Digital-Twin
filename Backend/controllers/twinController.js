const { Op } = require('sequelize');
const pdfParse = require('pdf-parse');
const Twin = require('../models/Twin');
const TwinConversation = require('../models/TwinConversation');
const { fastChatModel, generateWithFallback } = require('../config/gemini');

const createTwin = async (req, res) => {
  try {
    const { resumeId, name, tone, bio } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    let parsedBio = bio;

    if (req.file) {
      try {
        const pdfData = await pdfParse(req.file.buffer);
        parsedBio = pdfData.text ? pdfData.text.trim() : '';
      } catch (pdfErr) {
        console.error('Error parsing PDF buffer:', pdfErr);
        return res.status(400).json({
          success: false,
          message: 'Failed to parse PDF resume: ' + pdfErr.message,
        });
      }
    }

    if (!parsedBio || !parsedBio.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF resume',
      });
    }

    const activeResumeId = resumeId || Date.now().toString();

    const publicSlug =
      name.toLowerCase().replace(/[^a-z0-9]/g, '-') +
      '-' +
      Math.floor(1000 + Math.random() * 9000);

    let twin = await Twin.findOne({ where: { resumeId: activeResumeId } });

    if (twin) {
      twin.name = name;
      twin.bio = parsedBio;
      if (tone !== undefined) twin.tone = tone;
      if (!twin.publicSlug) {
        twin.publicSlug = publicSlug;
      }
      await twin.save();
    } else {
      twin = await Twin.create({
        resumeId: activeResumeId,
        name,
        bio: parsedBio,
        tone: tone || 'Professional',
        publicSlug,
      });
    }

    return res.status(200).json({
      success: true,
      twin,
    });
  } catch (error) {
    console.error('Error creating or updating twin:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create or update twin',
      error: error.message,
    });
  }
};

const getTwinBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const twin = await Twin.findOne({ where: { publicSlug: slug } });

    if (!twin) {
      return res.status(404).json({
        success: false,
        message: 'Digital Twin not found',
      });
    }

    return res.status(200).json({
      success: true,
      twin,
    });
  } catch (error) {
    console.error('Error fetching twin by slug:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch twin',
      error: error.message,
    });
  }
};

const chatWithTwin = async (req, res) => {
  try {
    const { slug } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const twin = await Twin.findOne({ where: { publicSlug: slug } });

    if (!twin) {
      return res.status(404).json({
        success: false,
        message: 'Digital Twin not found',
      });
    }

    const prompt = `You are the professional digital twin of ${twin.name}. Your bio is: ${twin.bio}. Answer the following recruiter question in the first person using the STAR method if applicable. Keep it concise, professional, and confident. Recruiter asks: "${message}"`;

    let aiReply;
    try {
      const result = await fastChatModel.generateContent(prompt);
      aiReply = result.response.text();
    } catch (modelErr) {
      console.warn('Primary model encountered issue, switching to fallback:', modelErr.message);
      aiReply = await generateWithFallback(prompt);
    }

    // Save conversation to database
    try {
      await TwinConversation.create({
        twinId: twin.id,
        visitorName: req.body.visitorName || 'Anonymous Recruiter',
        question: req.body.message || message,
        aiResponse: aiReply,
      });
    } catch (dbErr) {
      console.error('Error saving TwinConversation to DB:', dbErr);
    }

    return res.status(200).json({ reply: aiReply });
  } catch (error) {
    console.error('Error in chatWithTwin:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process AI chat with twin',
      error: error.message,
    });
  }
};

const getTwinAnalytics = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const twins = await Twin.findAll({
      where: {
        [Op.or]: [
          { resumeId },
          { publicSlug: resumeId },
        ],
      },
      order: [['id', 'DESC']],
    });

    if (!twins || twins.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Digital Twin not found for this identifier',
        analytics: [],
        conversations: [],
      });
    }

    const twinIds = twins.map((t) => t.id);

    const conversations = await TwinConversation.findAll({
      where: {
        twinId: { [Op.in]: twinIds },
      },
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      twinId: twins[0].id,
      resumeId: twins[0].resumeId,
      publicSlug: twins[0].publicSlug,
      totalQueries: conversations.length,
      analytics: conversations,
      conversations,
    });
  } catch (error) {
    console.error('Error in getTwinAnalytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve twin analytics',
      error: error.message,
    });
  }
};

module.exports = {
  createTwin,
  getTwinBySlug,
  chatWithTwin,
  getTwinAnalytics,
};
