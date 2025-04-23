const express = require('express');
const app = express();
const mongoose = require('mongoose');
/* -------------------------------------- */
const connectdb = () => {
try {
    mongoose.connect(process.env.MONGO_URI);
console.log("Connected to db")
} catch (error) {
    console.log(error)
}

}

/* -------------------------------------- */

module.exports = connectdb