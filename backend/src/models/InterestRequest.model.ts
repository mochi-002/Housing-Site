import Joi from 'joi'
import mongoose from 'mongoose'

const InterestRequestSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
  },
  seeker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
    required: true,
  },
})

const InterestRequest = mongoose.model('InterestRequest', InterestRequestSchema)

export { InterestRequest }
