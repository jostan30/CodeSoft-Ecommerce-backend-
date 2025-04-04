require('events').EventEmitter.defaultMaxListeners = 15;
require('dotenv').config()
const express = require('express');
const cors = require('cors');
const connectDB =require('./utils/db');

const authRoutes = require('./router/auth-router');
const productRoutes = require('./router/product-router');
const orderRoutes = require('./router/order-router');

const port = process.env.PORT || 5050;
const app = express();

//Midlleware
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Your Next.js app URL
    credentials: true,                // Allow cookies and authentication headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());


//Use defined router
app.use('/api/auth' ,authRoutes);
app.use('/api/products' ,productRoutes);
app.use('/api/orders' ,orderRoutes);
// app.use('/api/orders' ,orderRoutes);


connectDB().then(()=>{
    app.listen( port , ()=>{
        console.log(`Server is running on port ${port}`)
    });
})


