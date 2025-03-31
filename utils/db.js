const mongoose =require('mongoose');

const URI = process.env.MONGODB_URI ;

const connectDB = async () =>{
    try{
        await mongoose.connect(URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.log('Monogdb Connection Failed >> '+error);
    }
}

module.exports = connectDB;