import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: false, minlength: 6 })
  password?: string;

  @Prop({ required: false, trim: true })
  phone?: string;

  @Prop({ required: false, trim: true })
  address?: string;

  @Prop({ 
    type: String, 
    enum: ['user', 'admin', 'donor', 'organization'], 
    default: 'user' 
  })
  role: string;

  @Prop({ 
    type: String, 
    enum: ['active', 'inactive', 'suspended'], 
    default: 'active' 
  })
  status: string;

  @Prop({ required: false })
  avatar?: string;

  @Prop({ required: false })
  dateOfBirth?: Date;

  @Prop({ required: false, trim: true })
  bio?: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ required: false })
  lastLoginAt?: Date;

  @Prop({ required: false })
  refreshToken?: string;

  @Prop({ required: false })
  refreshTokenExpiresAt?: Date;

  @Prop({ type: Number, default: 50, min: 0, max: 100 })
  reputation: number;

  @Prop({ type: Number, default: 0 })
  totalDonated: number;

  @Prop({ type: Number, default: 0 })
  totalCampaignsCreated: number;

  @Prop({ type: Number, default: 0 })
  successfulCampaigns: number;

  @Prop({ required: false, trim: true })
  walletAddress?: string;

  // OAuth providers
  @Prop({ type: Object, required: false })
  googleProvider?: {
    googleSub: string;
    email: string;
    name: string;
    picture?: string;
  };

  @Prop({ type: Object, required: false })
  facebookProvider?: {
    facebookId: string;
    email: string;
    name: string;
    picture?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add virtual id property
UserSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
}); 