require('dotenv').config();
const express = require('express');
const cors = require('cors')
const mongoose = require('mongoose');

const app = express();

app.use(cors());

app.use(express.json()); // to parse JSON body
app.use(express.urlencoded({ extended: true })); // to parse URL-encoded body

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
})
.catch(err => console.error('Failed to connect MongoDB:', err));
