// server.js
require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
res.json({ message: 'API en ligne' });

});

const PORT = 3000;

app.listen(PORT, () => {

console.log(`API écoute sur http://localhost:${PORT}`);

});