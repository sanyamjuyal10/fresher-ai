import dotenv from "dotenv"
dotenv.config()
import { ChatGroq } from "@langchain/groq";

const models = (process.env.GROQ_MODELS || "llama-3.1-8b-instant,openai/gpt-oss-20b,qwen/qwen3-32b")
  .split(",")
  .map((model) => model.trim())
  .filter(Boolean);

const llms = models.map((model) => new ChatGroq({
  model,
  temperature: 0.2,
  maxRetries: 2,
}));

const isUnavailableModelError = (error) => {
  const message = `${error?.message || ""} ${error?.response?.error?.message || ""} ${error?.error?.message || ""}`.toLowerCase();
  return error?.status === 404 || error?.code === "model_not_found" || (
    message.includes("model") && (
      message.includes("not found") || message.includes("does not exist") || message.includes("do not have access")
    )
  );
};

const llm = {
  async invoke(input, options) {
    let lastError;

    for (const [index, model] of llms.entries()) {
      try {
        return await model.invoke(input, options);
      } catch (error) {
        lastError = error;
        if (!isUnavailableModelError(error)) {
          throw error;
        }
        console.warn(`Groq model ${models[index]} unavailable; trying the next model.`);
      }
    }

    throw lastError;
  },
};

export default llm