const express = require('express');
const dot = require('dotenv').config();
const app = express()
const connectdb = require('./config/DB')
const authRoutes = require('./src/routes/authRoutes')
const taskRoutes = require('./src/routes/taskRoutes')
/* -------------------------------------- */
app.use(express.json())
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

/* -------------------------------------- */
connectdb()
/* -------------------------------------- */

const port = process.env.PORT || 3400
app.listen(port,() => console.log(`Run on link https://localhost:${port}/`))