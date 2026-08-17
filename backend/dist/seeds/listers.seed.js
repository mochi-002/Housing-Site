import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.model.js';
import { Listing } from '../models/Listing.model.js';
const listers = [
    {
        fullName: 'Mohamed Mahmoud',
        email: 'mohamed.002.mochi@gmail.com',
        password: 'Password123!',
        role: 'Lister',
        isAdmin: false,
    },
    {
        fullName: 'Omar Mohamed',
        email: 'omar.seeker@test.com',
        password: 'password123',
        role: 'Lister',
        isAdmin: false,
    },
    {
        fullName: 'Ahmed Ali',
        email: 'ahmed.lister@test.com',
        password: 'password123',
        role: 'Lister',
        isAdmin: false,
    },
];
const listings = [
    {
        location: 'Nasr City',
        price: 4500,
        roomsAvailable: 2,
        description: 'Spacious shared apartment close to university and public transportation.',
        status: 'available',
    },
    {
        location: 'Heliopolis',
        price: 5500,
        roomsAvailable: 1,
        description: 'Furnished apartment in a quiet area with easy access to restaurants and shops.',
        status: 'available',
    },
    {
        location: 'New Cairo',
        price: 7000,
        roomsAvailable: 3,
        description: 'Large apartment suitable for students. Fully furnished with Wi-Fi included.',
        status: 'available',
    },
    {
        location: 'Maadi',
        price: 6000,
        roomsAvailable: 1,
        description: 'Clean furnished room in a shared apartment near the metro station.',
        status: 'available',
    },
    {
        location: 'Dokki',
        price: 4000,
        roomsAvailable: 2,
        description: 'Affordable student apartment near universities and public transportation.',
        status: 'available',
    },
    {
        location: 'Mohandessin',
        price: 5000,
        roomsAvailable: 1,
        description: 'Private room in a shared apartment with a fully equipped kitchen.',
        status: 'full',
    },
];
async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        // Clear old test data
        await Listing.deleteMany({});
        await User.deleteMany({
            email: { $in: listers.map((lister) => lister.email) },
        });
        // Hash passwords
        const hashedListers = await Promise.all(listers.map(async (lister) => ({
            ...lister,
            password: await bcrypt.hash(lister.password, 10),
        })));
        // Create Listers
        const createdListers = await User.insertMany(hashedListers);
        if (!createdListers.length) {
            throw new Error('No listers were created');
        }
        console.log(`Created ${createdListers.length} listers`);
        // Assign listings to different listers
        const listingsWithOwners = listings.map((listing, index) => ({
            ...listing,
            owner: createdListers[index % createdListers.length]._id,
        }));
        await Listing.insertMany(listingsWithOwners);
        console.log(`Created ${listingsWithOwners.length} listings`);
        await mongoose.disconnect();
        console.log('Seed completed successfully');
    }
    catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
}
seed();
