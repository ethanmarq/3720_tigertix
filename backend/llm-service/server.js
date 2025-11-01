
import express from 'express';
import cors from 'cors';
import llmRoutes from './routes/llmRoutes.js';

const app = express();
const PORT = 7001;

app.use(cors());
app.use(express.json());

app.use('/api/llm', llmRoutes);

app.get('/', (req, res) => {
  res.send('LLM Booking Service is running.');
});

app.listen(PORT, () => {
    console.log(`LLM service running at http://localhost:${PORT}`);
});
