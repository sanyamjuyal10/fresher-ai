import fs from "fs/promises";

import Resume from "../model/resume.model.js";
import extractPdfText from "../configs/pdf.js";
import resumeAgent from "../agents/resume.agent.js";

import redis from "../../../shared/redis/redis.js";

const arrayFields = [
  "education",
  "skills",
  "projects",
  "experience",
  "strengths",
  "weaknesses",
  "missingSkills",
  "recommendations",
];

const repairJsonLike = (value) => {
  let result = "";
  let index = 0;

  while (index < value.length) {
    if (value[index] !== "'") {
      result += value[index++];
      continue;
    }

    index += 1;
    let content = "";

    while (index < value.length) {
      const character = value[index];
      const nextCharacter = value[index + 1];

      if (character === "\\" && nextCharacter) {
        content += character + nextCharacter;
        index += 2;
        continue;
      }

      const remainder = value.slice(index + 1).trimStart();
      const closesString = character === "'" && /^[,}\]:]/.test(remainder);

      if (closesString) {
        index += 1;
        break;
      }

      content += character;
      index += 1;
    }

    result += JSON.stringify(content);
  }

  return result
    .replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":')
    .replace(/,\s*([}\]])/g, "$1");
};

const parseNestedValue = (value) => {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return value;

  try {
    return JSON.parse(trimmed);
  } catch {
    try {
      return JSON.parse(repairJsonLike(trimmed));
    } catch {
      return value;
    }
  }
};

const normalizeResumeData = (data) => {
  const normalized = { ...data };

  for (const field of arrayFields) {
    const value = parseNestedValue(normalized[field]);
    const values = Array.isArray(value) ? value : value == null ? [] : [value];

    normalized[field] = values.map((item) => {
      if (typeof item === "string") return item;
      return JSON.stringify(item);
    });
  }

  return normalized;
};


export const uploadResume = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume PDF is required",
      });
    }

    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User Id is required",
      });
    }

    // -----------------------
    // Extract Resume Text
    // -----------------------

    const resumeText = await extractPdfText(req.file.path);

    // -----------------------
    // AI Resume Analysis
    // -----------------------

    const aiResponse = await resumeAgent(resumeText);

    const resumeData = normalizeResumeData(JSON.parse(aiResponse));

    // -----------------------
    // MongoDB
    // -----------------------

    let resume = await Resume.findOne({ userId });

    if (resume) {

      Object.assign(resume, {
        ...resumeData,
        extractedText: resumeText,
      });

      await resume.save();

    } else {

      resume = await Resume.create({
        userId,
        extractedText: resumeText,
        ...resumeData,
      });

    }

    // -----------------------
    // Redis
    // -----------------------

    await redis.set(
      `resume:${userId}`,
      JSON.stringify(resume)
    );

    
    await fs.unlink(req.file.path);

    // -----------------------
    // Response
    // -----------------------

    return res.status(200).json({
      success: true,
      message: "Resume analyzed successfully",
      data: resume,
    });

  } catch (error) {

    console.log(error);

    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch {}
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

export const getResume = async (req, res) => {
  try {

    const userId = req.headers["x-user-id"];

  

    // -------------------------
    // Check Redis
    // -------------------------

    const cache = await redis.get(`resume:${userId}`);

    if (cache) {

      return res.status(200).json({
        success: true,
        source: "redis",
        data: JSON.parse(cache),
      });

    }

    // -------------------------
    // MongoDB
    // -------------------------

    const resume = await Resume.findOne({ userId });

    if (!resume) {

      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });

    }

    // -------------------------
    // Update Redis
    // -------------------------

    await redis.set(
      `resume:${userId}`,
      JSON.stringify(resume)
    );

    return res.status(200).json({
      success: true,
      source: "mongodb",
      data: resume,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};