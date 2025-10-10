const express = require('express');
const cors = require('cors');
const clientRoutes = require('./routes/clientRoutes');

const app = express();
const PORT = 6001;

app.use(cors());
app.use(express.json());

app.use('/api', clientRoutes);

app.listen(PORT, () => {
    console.log(`Client service running at http://localhost:${PORT}`);
});
