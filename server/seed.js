require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Ship = require('./models/Ship');
const Berth = require('./models/Berth');
const Cargo = require('./models/Cargo');
const DockingRequest = require('./models/DockingRequest');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('🌱 Connected to MongoDB — starting seed...');

  // Clear existing data
  await Promise.all([
    User.deleteMany(),
    Ship.deleteMany(),
    Berth.deleteMany(),
    Cargo.deleteMany(),
    DockingRequest.deleteMany()
  ]);
  console.log('🧹 Cleared existing data');

  const salt = await bcrypt.genSalt(10);

  // Create Users
  const users = await User.insertMany([
    { name: 'Admin User', email: 'admin@harbour.com', password: await bcrypt.hash('password123', salt), role: 'Admin' },
    { name: 'Officer James', email: 'officer@harbour.com', password: await bcrypt.hash('password123', salt), role: 'Port Officer' },
    { name: 'Captain Rivera', email: 'operator@harbour.com', password: await bcrypt.hash('password123', salt), role: 'Ship Operator' }
  ]);
  console.log(`✅ Created ${users.length} users`);

  const operator = users.find(u => u.role === 'Ship Operator');

  // Create Ships
  const ships = await Ship.insertMany([
    { shipName: 'Pacific Star', shipNumber: 'PS-001', captainName: 'John Rivera', shipType: 'Container', capacity: 5000, registrationCountry: 'Philippines', status: 'Docked', arrivalDate: new Date('2026-06-01'), departureDate: new Date('2026-06-15'), operatorId: operator._id },
    { shipName: 'Atlantic Queen', shipNumber: 'AQ-002', captainName: 'Maria Santos', shipType: 'Bulk Carrier', capacity: 8000, registrationCountry: 'Greece', status: 'Registered', arrivalDate: new Date('2026-06-20'), operatorId: operator._id },
    { shipName: 'Indian Spirit', shipNumber: 'IS-003', captainName: 'Raj Patel', shipType: 'Tanker', capacity: 6500, registrationCountry: 'India', status: 'Departed', arrivalDate: new Date('2026-05-10'), departureDate: new Date('2026-05-25'), operatorId: operator._id },
    { shipName: 'Nordic Voyager', shipNumber: 'NV-004', captainName: 'Erik Hansen', shipType: 'Container', capacity: 4500, registrationCountry: 'Norway', status: 'Maintenance', operatorId: operator._id },
    { shipName: 'Gulf Eagle', shipNumber: 'GE-005', captainName: 'Ahmed Al-Rashed', shipType: 'General Cargo', capacity: 3000, registrationCountry: 'UAE', status: 'Docked', arrivalDate: new Date('2026-06-05'), departureDate: new Date('2026-06-18'), operatorId: operator._id }
  ]);
  console.log(`✅ Created ${ships.length} ships`);

  // Create Berths
  const berths = await Berth.insertMany([
    { berthNumber: 'B-01', location: 'North Dock', capacity: 6000, status: 'Occupied', assignedShip: ships[0]._id },
    { berthNumber: 'B-02', location: 'North Dock', capacity: 9000, status: 'Available' },
    { berthNumber: 'B-03', location: 'South Dock', capacity: 5000, status: 'Occupied', assignedShip: ships[4]._id },
    { berthNumber: 'B-04', location: 'South Dock', capacity: 7000, status: 'Available' },
    { berthNumber: 'B-05', location: 'East Terminal', capacity: 4000, status: 'Maintenance' },
    { berthNumber: 'B-06', location: 'West Terminal', capacity: 8500, status: 'Available' }
  ]);
  console.log(`✅ Created ${berths.length} berths`);

  // Create Cargo
  const cargo = await Cargo.insertMany([
    { shipId: ships[0]._id, cargoType: 'Electronics', weight: 2500, destination: 'Singapore', status: 'Loaded' },
    { shipId: ships[0]._id, cargoType: 'Textiles', weight: 1800, destination: 'Dubai', status: 'Loaded' },
    { shipId: ships[1]._id, cargoType: 'Coal', weight: 7000, destination: 'Japan', status: 'Pending' },
    { shipId: ships[2]._id, cargoType: 'Crude Oil', weight: 5500, destination: 'South Korea', status: 'Dispatched' },
    { shipId: ships[4]._id, cargoType: 'Machinery', weight: 1200, destination: 'Australia', status: 'Unloaded' }
  ]);
  console.log(`✅ Created ${cargo.length} cargo records`);

  // Create Docking Requests
  await DockingRequest.insertMany([
    { shipId: ships[0]._id, requestedArrival: new Date('2026-06-01'), requestedDeparture: new Date('2026-06-15'), assignedBerth: berths[0]._id, status: 'Approved', remarks: 'Auto-allocated' },
    { shipId: ships[1]._id, requestedArrival: new Date('2026-06-20'), requestedDeparture: new Date('2026-07-01'), status: 'Pending', remarks: 'Awaiting approval' },
    { shipId: ships[4]._id, requestedArrival: new Date('2026-06-05'), requestedDeparture: new Date('2026-06-18'), assignedBerth: berths[2]._id, status: 'Approved', remarks: 'Priority cargo' }
  ]);
  console.log('✅ Created docking requests');

  console.log('\n🎉 Seed complete! Login credentials:');
  console.log('  Admin:        admin@harbour.com    / password123');
  console.log('  Port Officer: officer@harbour.com  / password123');
  console.log('  Operator:     operator@harbour.com / password123');

  mongoose.connection.close();
};

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
