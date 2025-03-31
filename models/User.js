const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
      },
      email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please add a valid email'
        ]
      },
      password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
      },
      role: {
        type: String,
        enum: ['customer', 'seller', 'admin'],
        default: 'customer'
      },
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
      },
      phone: {
        type: String,
        minlength: [10, 'Phone number must be exactly 10 digits'],
        maxlength: [10, 'Phone number must be exactly 10 digits'],
        match: [/^\d{10}$/, 'Phone number must be 10 digits'] 
      },
      storeInfo: {
        storeName: String,
        description: String,
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    });

UserSchema.pre('save' , async function(next) {
    if(!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
} 

module.exports = mongoose.model('User',UserSchema);