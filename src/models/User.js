import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },

  email: {
    type: String,
    required: true,
  },

  username: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true
  },

  devices: {
    type: [String],
    required: true
  },
  active: {
    type: Boolean,
    required: true,
    default: true
  }

}, {timestamps: true});

UserSchema.pre(
    'save',
    async function(next) {
      if (this.isModified('password')) {
        const hashPwd = await bcrypt.hash(this.password, 10);
        this.password = hashPwd;
      }
      next();
    }
  );

UserSchema.methods.isValidPassword = async function(password) {
    const user = this;
    const compare = await bcrypt.compare(password, user.password);

    return compare;
}

const UserModel = mongoose.model('user', UserSchema);
export default UserModel;