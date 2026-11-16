import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, required: true },
    age: {
      type: Number,
      min: [18, 'Age must be at least 18'],
      max: [60, 'Age must be at most 60'],
    },
    gender: { type: String, enum: ['male', 'female'] },
    image: String,
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    autoIndex: true,
  }
);

userSchema
  .virtual('userName')
  .set(function (value) {
    const [firstName, ...rest] = value.trim().split(' ');
    this.firstName = firstName;
    this.lastName = rest.join(' ');
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });

export const UserModel = mongoose.model('User', userSchema);