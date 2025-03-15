import mongoose, { Document, Schema, Model } from "mongoose";

interface IUser extends Document {
  name: string;
  email: string;
  phoneNumber: number;
  password: string;
  profile_Picture: string;
  address: IAddress;
  role: "admin" | "customer" | "supplier";
  isVerified: boolean;
  isApproved: boolean;
}

interface IAddress extends Document {
  house: string;
  street: string;
  city: string;
  state: string;
  postCode: number;
  country: string;
}

const addressSchema = new Schema<IAddress>({
  house: {
    type: String,
    required: true,
  },

  street: {
    type: String,
    required: true,
  },

  city: {
    type: String,
    required: true,
  },

  state: {
    type: String,
    required: true,
  },

  postCode: {
    type: Number,
    required: true,
    match: /^[0-9]{5,10}$/,
  },

  country: {
    type: String,
    required: true,
  },
});

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: function () {
        return this.role === "admin";
      },
      unique: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
    },

    phoneNumber: {
      type: Number,
      required: true,
      match: /^[0-9]{10}$/,
    },

    password: {
      type: String,
      required: function () {
        return this.role === "admin";
      },
    },

    profile_Picture: {
      type: String,
      required: function () {
        return this.role === "admin";
      },
      default:
        "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg",
    },

    address: {
      type: addressSchema,
      required: function () {
        return this.role !== "admin";
      },
    },

    role: {
      type: String,
      required: true,
      enum: ["admin", "customer", "supplier"],
    },

    isVerified: {
      type: Boolean,
      required: function () {
        return this.role === "admin";
      },
      default: false,
    },

    isApproved: {
      type: Boolean,
      required: function () {
        return this.role === "admin";
      },
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.model("User", userSchema);

export default User;
