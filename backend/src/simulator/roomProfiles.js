const roomProfiles = {
  classrooms: [
    { name: 'Lab 1', type: 'lab', floor: 1, capacity: 30, normalTemp: 24, maxTemp: 35 },
    { name: 'Lab 2', type: 'lab', floor: 1, capacity: 30, normalTemp: 24, maxTemp: 35 },
    { name: 'Class A', type: 'classroom', floor: 2, capacity: 50, normalTemp: 24, maxTemp: 35 },
    { name: 'Class B', type: 'classroom', floor: 2, capacity: 50, normalTemp: 24, maxTemp: 35 },
  ],
  offices: [
    { name: 'Office 101', type: 'office', floor: 1, capacity: 2, normalTemp: 24, maxTemp: 30 },
    { name: 'Office 102', type: 'office', floor: 1, capacity: 3, normalTemp: 24, maxTemp: 30 },
  ],
  common: [
    { name: 'Library', type: 'library', floor: 3, capacity: 100, normalTemp: 23, maxTemp: 32 },
    { name: 'Cafeteria', type: 'cafeteria', floor: 1, capacity: 200, normalTemp: 22, maxTemp: 35 },
  ],
};

const getAllRooms = () => {
  return [
    ...roomProfiles.classrooms,
    ...roomProfiles.offices,
    ...roomProfiles.common,
  ];
};

const getRoomsByType = (type) => {
  if (type === 'classroom') return roomProfiles.classrooms;
  if (type === 'office') return roomProfiles.offices;
  return roomProfiles.common;
};

module.exports = { roomProfiles, getAllRooms, getRoomsByType };
