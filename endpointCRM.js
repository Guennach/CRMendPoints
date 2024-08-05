require('dotenv').config();

const express = require('express');
const app = express();
const axios = require('axios');

const PORT = process.env.PORT || 3000;

app.get('/CRMendPoint', async (req, res) => {
    try{
        const response = await axios.get('http://127.0.0.1:3000/test');
        res.status(200).json(response.data);
        console.log(response);
    }catch(error)
    {
        res.status(500).json({ error: 'An error occurred while fetching data' });
    }
}); 

app.get('/test', (req, res) => {
    res.status(200).json({ message: 'Test endpoint is working!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});