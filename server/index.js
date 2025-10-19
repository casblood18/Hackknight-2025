import express from "express";
import cors from "cors";
import speechRouter from "./routes/speech.routes.js";
import feedbackRouter from "./routes/feedback.routes.js";
import summaryRouter from "./routes/summary.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Mount APIs
app.use("/api/speech", speechRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/summary", summaryRouter);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
