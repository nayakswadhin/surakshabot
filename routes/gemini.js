const express = require("express");
const router = express.Router();
const geminiService = require("../services/geminiService");
const Cases = require("../models/Cases");

/**
 * POST /api/gemini/ask
 * General Q&A endpoint for Gemini AI
 */
router.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const response = await geminiService.generateContent(prompt);
    res.json({ response });
  } catch (error) {
    console.error("Gemini Ask Error:", error);
    res.status(500).json({ message: "Failed to generate response" });
  }
});

/**
 * POST /api/gemini/chat
 * Chat endpoint with conversation history
 */
router.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: "Messages array is required" });
    }

    const response = await geminiService.chat(messages);
    res.json({ response });
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ message: "Failed to process chat" });
  }
});

/**
 * GET /api/gemini/analyze-complaints
 * Generate AI insights from complaint data
 */
router.get("/analyze-complaints", async (req, res) => {
  try {
    // Fetch complaint statistics from MongoDB
    const totalComplaints = await Cases.countDocuments();
    const financialComplaints = await Cases.countDocuments({
      category: "Financial",
    });
    const socialComplaints = await Cases.countDocuments({
      category: "Social",
    });
    const pendingCases = await Cases.countDocuments({ status: "pending" });
    const solvedCases = await Cases.countDocuments({ status: "solved" });

    // Get top fraud types
    const topFraudTypes = await Cases.aggregate([
      { $group: { _id: "$fraudType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { type: "$_id", count: 1, _id: 0 } },
    ]);

    // Get top districts
    const topDistricts = await Cases.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      { $group: { _id: "$userInfo.district", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { name: "$_id", count: 1, _id: 0 } },
    ]);

    const complaintData = {
      totalComplaints,
      financialComplaints,
      socialComplaints,
      pendingCases,
      solvedCases,
      topFraudTypes,
      topDistricts,
    };

    // Generate AI insights
    const insights = await geminiService.analyzeComplaintData(complaintData);

    res.json({
      success: true,
      data: complaintData,
      insights,
    });
  } catch (error) {
    console.error("Analyze Complaints Error:", error);
    res.status(500).json({ message: "Failed to analyze complaints" });
  }
});

/**
 * POST /api/gemini/prevention-tips
 * Get prevention tips for a specific fraud type
 */
router.post("/prevention-tips", async (req, res) => {
  try {
    const { fraudType } = req.body;

    if (!fraudType) {
      return res.status(400).json({ message: "Fraud type is required" });
    }

    const tips = await geminiService.generatePreventionTips(fraudType);
    res.json({ fraudType, tips });
  } catch (error) {
    console.error("Prevention Tips Error:", error);
    res.status(500).json({ message: "Failed to generate prevention tips" });
  }
});

/**
 * POST /api/gemini/summarize-location
 * Summarize complaint patterns for a specific location
 */
router.post("/summarize-location", async (req, res) => {
  try {
    const { location } = req.body;

    if (!location) {
      return res.status(400).json({ message: "Location is required" });
    }

    // Fetch complaints for this location
    const complaints = await Cases.find()
      .populate("userId")
      .lean()
      .then((cases) =>
        cases.filter(
          (c) =>
            c.userId?.district === location || c.userId?.pincode === location
        )
      );

    if (complaints.length === 0) {
      return res.json({
        location,
        summary: `No complaints found for ${location}.`,
      });
    }

    const summary = await geminiService.summarizeLocationPattern(
      location,
      complaints
    );
    res.json({ location, summary, totalCases: complaints.length });
  } catch (error) {
    console.error("Summarize Location Error:", error);
    res.status(500).json({ message: "Failed to summarize location data" });
  }
});

/**
 * POST /api/gemini/answer-question
 * Answer cybercrime-related questions
 */
router.post("/answer-question", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    const answer = await geminiService.answerQuestion(question);
    res.json({ question, answer });
  } catch (error) {
    console.error("Answer Question Error:", error);
    res.status(500).json({ message: "Failed to answer question" });
  }
});

module.exports = router;
