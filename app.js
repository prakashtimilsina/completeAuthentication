const dotenv = require('dotenv');
// import dotenv from 'dotenv'
dotenv.config()

const express = require('express');
const cors = require('cors');
const connectDb = require('./config/connectdb');
const userRoutes = require('./routes/userRoutes');

const app = express();
const DATABASE_URL = process.env.DATABASE_URL;
const port = process.env.PORT || 3000;

//CORS Policy Middleware
app.use(cors())

//Database Connection
connectDb(DATABASE_URL);

//JSON
app.use(express.json())

//Load Routes
app.use("/api/user", userRoutes);

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
})