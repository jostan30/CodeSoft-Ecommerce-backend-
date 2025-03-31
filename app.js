require('events').EventEmitter.defaultMaxListeners = 15;
require('dotenv').config()
const express = require('express');
const cors = require('cors');
const connectDB =require('./utils/db');

const authrouter = require('./router/auth-router');

const port = process.env.PORT || 5050;
const app = express();

//Midlleware
app.use(express.json());
app.use(cors());


//Use defined router
app.use('/api/auth' ,authrouter);


connectDB().then(()=>{
    app.listen( port , ()=>{
        console.log(`Server is running on port ${port}`)
    });
})


