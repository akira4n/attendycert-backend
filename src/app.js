require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// check API status
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Service is healthy',
    server_time: new Date().toISOString(),
  });
});

// routes
const adminRoutes = require('./routes/admin.routes');
const eventRouter = require('./routes/event.routes');

app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRouter);

// global error handler
app.use((err, req, res, next) => {
  // zod error handler
  if (err.name === 'ZodError') {
    const message = (err.issues || []).map((issue) => issue.message).join(', ');
    return res.status(400).json({
      success: false,
      message: message || 'Validation error.',
    });
  }

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    message,
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Not found',
  });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
