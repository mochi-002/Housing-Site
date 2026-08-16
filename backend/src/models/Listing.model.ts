import mongoose from 'mongoose'

const ListingSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  roomsAvailable: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    trim: true,
    enum: ['available', 'full'],
    default: 'available',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
})

const Listing = mongoose.model('Listing', ListingSchema)

export { Listing }
