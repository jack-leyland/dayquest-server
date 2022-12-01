import mongoose from 'mongoose';

const LoginSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    device: {
        type: String,
        required: true 
    },
    deviceRecognized: {
        type: Boolean,
        required: true
    },
    successful: {
        type: Boolean,
        required: true
    }
}, {timestamps: true})

const LoginModel = mongoose.model('login', LoginSchema);
export default LoginModel;