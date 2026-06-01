require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// check API status
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Service is healthy",
    server_time: new Date().toISOString(),
  });
});

// global error handler
app.use((err, req, res, next) => {
  console.error(`[ERROR]: ${err.message}`);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Not found",
  });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
