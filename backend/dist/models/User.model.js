import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['Lister', 'Seeker'],
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
});
UserSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({
        _id: this._id,
        email: this.email,
        fullName: this.fullName,
        role: this.role,
        isAdmin: this.isAdmin,
    }, process.env.JWT_SECRET, { expiresIn: '12h' });
    return `${token}`;
};
const User = mongoose.model('User', UserSchema);
export { User };
