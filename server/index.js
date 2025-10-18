import express from 'express';
import cors from 'cors';
import speechRouter from './routes/speech.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

// Mount APIs
app.use("/api/speech", speechRouter);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
