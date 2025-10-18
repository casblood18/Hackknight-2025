const express = require("express");
const cors = require("cors");
const usersRouter = require("./routes/users.routes");
const speechRouter = require("./routes/speech.routes");

const app = express();
app.use(cors());
app.use(express.json());

// Mount APIs
app.use("/api/users", usersRouter);
app.use("/api/speech", speechRouter);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
