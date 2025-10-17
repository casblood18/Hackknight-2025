const express = require("express");
const cors = require("cors");
const usersRouter = require("./routes/users.routes");

const app = express();
app.use(cors());
app.use(express.json());

// Mount API (GET /api/users, POST /api/users)
app.use("/api/users", usersRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
