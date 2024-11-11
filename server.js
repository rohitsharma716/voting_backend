const express = require('express')
const app = express();
require('dotenv').config();
const { jwtAuthMiddleware} =  require('./jwt')
const bodyParser  = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRouted')
const db = require('./db');


//middleware 
app.use(bodyParser.json());
app.use('/user', userRoutes)
app.use('/candidate'  , candidateRoutes)

app.get('/' ,  (req,res) => {
     res.send("server is working fine")
})

const PORT =  process.env.PORT || 5000
app.listen(PORT , (req,res) => {
     console.log("server is running on port No : " , PORT);
})