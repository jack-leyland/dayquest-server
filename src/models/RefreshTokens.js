import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const RefreshTokenSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    deviceId: {
        type: String, 
        required: true, 
    },
    token: {
        type: String, 
        required: true,
        unique: true
    }
}, {timestamps: true})

RefreshTokenSchema.methods.isMatch = async function(token) {
    return token === this.token;
  }
  

const RefreshTokenModel = mongoose.model('refresh_token', RefreshTokenSchema);
export default RefreshTokenModel;