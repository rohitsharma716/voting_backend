const mongoose = require('mongoose');
require('dotenv').config();

// const DBONLINE = process.env.DB_ONLINE
const  DBLOCAL = process.env.DB_LOCAL 

mongoose.connect(DBLOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('connected', () => {
    console.log("Connection to DB is successful");
});
db.on("error", (err) => {
    console.log("Error in DB connection", err);
});
db.on("disconnected", () => {
    console.log('Disconnected from DB');
});


module.exports = db ;