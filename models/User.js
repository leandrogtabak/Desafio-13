import mongoose from 'mongoose';

export const User = mongoose.model('Users', {
  username: String,
  password: String,
});
