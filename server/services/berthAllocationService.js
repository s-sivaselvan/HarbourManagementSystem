const DockingRequest = require('../models/DockingRequest');
const Berth = require('../models/Berth');

/**
 * Smart Berth Allocation Algorithm
 * 1. Fetch all available (non-Maintenance) berths
 * 2. Filter berths with enough capacity for the ship
 * 3. Remove berths with date conflicts from existing approved docking requests
 * 4. Sort remaining berths by capacity margin (ascending) - best fit first
 * 5. Return first matching berth
 */
const allocateBerth = async (shipCapacity, requestedArrival, requestedDeparture, excludeRequestId = null) => {
  // Step 1: Get all berths not under maintenance
  const allBerths = await Berth.find({ status: { $ne: 'Maintenance' } });

  // Step 2: Filter by capacity
  const capableBerths = allBerths.filter(b => b.capacity >= shipCapacity);

  // Step 3: Find conflicting berths from existing APPROVED docking requests
  const conflictQuery = {
    status: 'Approved',
    assignedBerth: { $in: capableBerths.map(b => b._id) },
    $or: [
      // New request overlaps an existing one
      { requestedArrival: { $lt: requestedDeparture }, requestedDeparture: { $gt: requestedArrival } }
    ]
  };

  if (excludeRequestId) {
    conflictQuery._id = { $ne: excludeRequestId };
  }

  const conflictingRequests = await DockingRequest.find(conflictQuery).select('assignedBerth');
  const occupiedBerthIds = new Set(conflictingRequests.map(r => r.assignedBerth.toString()));

  // Step 4: Filter out occupied berths and sort by capacity margin (best fit)
  const availableBerths = capableBerths
    .filter(b => !occupiedBerthIds.has(b._id.toString()))
    .sort((a, b) => (a.capacity - shipCapacity) - (b.capacity - shipCapacity));

  // Step 5: Return the best matching berth
  if (availableBerths.length > 0) {
    return availableBerths[0];
  }

  return null; // No suitable berth found
};

module.exports = { allocateBerth };
