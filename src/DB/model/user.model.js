import mongoose from "mongoose";
import { GenderEnum } from "../../common/enums/gender.enum.js";
import { RoleEnum } from "../../common/enums/role.enum.js";
import { ProviderEnum } from "../../common/enums/provider.enum.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 50,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxLength: 50,
    },

    password: {
      type: String,
      minLength: 6,
      select: false,
      required: function () {
        return this.provider === ProviderEnum.system;
      },
    },

    phone: {
      type: String,
      trim: true,
    },

    age: {
      type: Number,
      min: [18, "Age must be at least 18"],
      max: [60, "Age must be at most 60"],
    },

    gender: {
      type: Number,
      enum: Object.values(GenderEnum),
      default: GenderEnum.male,
    },

    role: {
      type: Number,
      enum: Object.values(RoleEnum),
      default: RoleEnum.user,
    },

    provider: {
      type: Number,
      enum: Object.values(ProviderEnum),
      default: ProviderEnum.system,
    },

    image: String,

    confirmEmail: {
      type: Date,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    autoIndex: true,
  }
);


userSchema
  .virtual("userName")
  .set(function (value) {
    const [firstName, ...lastName] = value.trim().split(/\s+/);

    this.firstName = firstName;
    this.lastName = lastName.join(" ");
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });


export const UserModel = mongoose.model("User", userSchema);