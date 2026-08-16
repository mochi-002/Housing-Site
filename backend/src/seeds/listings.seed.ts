import 'dotenv/config'
import mongoose from 'mongoose'
import { User } from '../models/User.model.js'
import { Listing } from '../models/Listing.model.js'

const listings = [
  {
    location: 'Nasr City',
    price: 4500,
    roomsAvailable: 2,
    description:
      'Spacious shared apartment close to university and public transportation.',
    status: 'available',
  },
  {
    location: 'Heliopolis',
    price: 5500,
    roomsAvailable: 1,
    description:
      'Furnished apartment in a quiet area with easy access to restaurants and shops.',
    status: 'available',
  },
  {
    location: 'New Cairo',
    price: 7000,
    roomsAvailable: 3,
    description:
      'Large apartment suitable for students. Fully furnished with Wi-Fi included.',
    status: 'available',
  },
  {
    location: 'Maadi',
    price: 6000,
    roomsAvailable: 1,
    description:
      'Clean furnished room in a shared apartment near the metro station.',
    status: 'available',
  },
  {
    location: 'Dokki',
    price: 4000,
    roomsAvailable: 2,
    description:
      'Affordable student apartment near universities and public transportation.',
    status: 'available',
  },
  {
    location: 'Mohandessin',
    price: 5000,
    roomsAvailable: 1,
    description:
      'Private room in a shared apartment with a fully equipped kitchen.',
    status: 'full',
  },
]

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI!)

    console.log('Connected to MongoDB')

    // Find an existing Lister
    let owner = await User.findOne({ role: 'Lister' })

    // Create one if none exists
    if (!owner) {
      owner = await User.create({
        fullName: 'Test Lister',
        email: 'lister@test.com',
        password: 'hashed-password',
        role: 'Lister',
      })

      console.log('Created test lister')
    }

    // Remove existing listings
    await Listing.deleteMany({})

    // Add owner to every listing
    const listingsWithOwner = listings.map((listing) => ({
      ...listing,
      owner: owner._id,
    }))

    await Listing.insertMany(listingsWithOwner)

    console.log(`Seeded ${listings.length} listings`)

    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  }
}

seed()
