const express = require('express');
const cors = require('cors');
const llmRoutes = require('./routes/llmRoutes');

const app = express();
const PORT = 7001;

app.use(cors());
app.use(express.json());

app.use('/api/llm', llmRoutes);

app.get('/', (req, res) => {
  res.send('LLM Booking Service is running.');
});

// Only listen if run directly (allows importing in the unified Gateway)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`LLM service running at http://localhost:${PORT}`);
    });
}

module.exports = app;
