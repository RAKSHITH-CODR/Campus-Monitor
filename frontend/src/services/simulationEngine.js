/**
 * Simulation Engine - Generates realistic sensor data
 * Based on time patterns, occupancy, room types, etc.
 */

export class SensorSimulator {
  constructor(roomId, roomType = 'classroom') {
    this.roomId = roomId;
    this.roomType = roomType;
    this.lastTimestamp = Date.now();
    this.patterns = this.initializePatterns();
  }

  initializePatterns() {
    const patterns = {
      classroom: {
        baseTemp: 22,
        baseHumidity: 50,
        baseAQI: 50,
        peakOccupancyHour: 14, // 2PM
        maxOccupancy: 60,
      },
      lab: {
        baseTemp: 20,
        baseHumidity: 40,
        baseAQI: 30,
        peakOccupancyHour: 15,
        maxOccupancy: 40,
      },
      office: {
        baseTemp: 23,
        baseHumidity: 45,
        baseAQI: 40,
        peakOccupancyHour: 10,
        maxOccupancy: 30,
      },
      library: {
        baseTemp: 22,
        baseHumidity: 50,
        baseAQI: 45,
        peakOccupancyHour: 18,
        maxOccupancy: 100,
      },
      cafeteria: {
        baseTemp: 24,
        baseHumidity: 60,
        baseAQI: 70,
        peakOccupancyHour: 12,
        maxOccupancy: 200,
      },
    };
    return patterns[this.roomType] || patterns.classroom;
  }

  /**
   * Get current hour with occupancy probability
   */
  getOccupancyProbability() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    // Weekend: lower occupancy
    if (day === 0 || day === 6) return 0.3;

    // Night hours: very low
    if (hour < 8 || hour > 18) return 0.1;

    // Peak hours: higher probability
    const peakHour = this.patterns.peakOccupancyHour;
    const distanceFromPeak = Math.abs(hour - peakHour);
    const probability = Math.max(0.1, 1 - distanceFromPeak / 10);

    return probability;
  }

  /**
   * Generate realistic occupancy based on time patterns
   */
  generateOccupancy() {
    const probability = this.getOccupancyProbability();
    const randomFactor = Math.random();
    const occupancy = Math.floor(
      this.patterns.maxOccupancy * probability * randomFactor * 1.2
    );
    return Math.min(occupancy, this.patterns.maxOccupancy);
  }

  /**
   * Temperature affected by occupancy and time of day
   */
  generateTemperature() {
    const occupancy = this.generateOccupancy();
    const now = new Date();
    const hour = now.getHours();

    // Time-based variation (warmer during day)
    const timeVariation = Math.sin((hour - 6) * (Math.PI / 12)) * 3;

    // Occupancy-based variation (more people = more heat)
    const occupancyVariation = (occupancy / this.patterns.maxOccupancy) * 4;

    const baseTemp = this.patterns.baseTemp;
    const randomNoise = (Math.random() - 0.5) * 0.5;

    return Math.round(
      (baseTemp + timeVariation + occupancyVariation + randomNoise) * 10
    ) / 10;
  }

  /**
   * Humidity affected by occupancy and temperature
   */
  generateHumidity() {
    const occupancy = this.generateOccupancy();
    const temp = this.generateTemperature();

    // Higher occupancy = more moisture
    const occupancyFactor = (occupancy / this.patterns.maxOccupancy) * 10;

    // Temperature affects humidity (inverse relationship)
    const tempFactor = (25 - temp) * 0.5;

    const baseHumidity = this.patterns.baseHumidity;
    const randomNoise = (Math.random() - 0.5) * 2;

    return Math.max(
      20,
      Math.min(
        90,
        baseHumidity + occupancyFactor + tempFactor + randomNoise
      )
    );
  }

  /**
   * Air Quality Index affected by occupancy
   */
  generateAQI() {
    const occupancy = this.generateOccupancy();
    const occupancyRatio = occupancy / this.patterns.maxOccupancy;

    // AQI increases with occupancy
    const occupancyFactor = occupancyRatio * 80;

    const baseAQI = this.patterns.baseAQI;
    const randomNoise = (Math.random() - 0.5) * 10;

    let aqi = baseAQI + occupancyFactor + randomNoise;

    // Add occasional spikes (pollution events)
    if (Math.random() < 0.05) {
      aqi += Math.random() * 50;
    }

    return Math.max(0, Math.min(500, Math.round(aqi)));
  }

  /**
   * CO2 levels affected by occupancy
   */
  generateCO2() {
    const occupancy = this.generateOccupancy();
    const co2Base = 400; // ambient CO2
    const co2PerPerson = 20; // ppm per person

    const roomCO2 = co2Base + occupancy * co2PerPerson;
    const randomNoise = (Math.random() - 0.5) * 30;

    return Math.round(roomCO2 + randomNoise);
  }

  /**
   * Smoke detection (rare event)
   */
  generateSmoke() {
    // 0.1% chance per reading
    return Math.random() < 0.001;
  }

  /**
   * Noise level affected by occupancy
   */
  generateNoise() {
    const occupancy = this.generateOccupancy();
    const occupancyRatio = occupancy / this.patterns.maxOccupancy;

    const baseNoise = 40; // dB
    const occupancyNoise = occupancyRatio * 30;
    const randomNoise = (Math.random() - 0.5) * 5;

    return Math.round(baseNoise + occupancyNoise + randomNoise);
  }

  /**
   * Light intensity based on time of day
   */
  generateLight() {
    const now = new Date();
    const hour = now.getHours();

    // Lights off at night
    if (hour < 6 || hour > 20) return 0;

    // Peak brightness during day
    const brightness =
      Math.sin((hour - 6) * (Math.PI / 14)) * 100 +
      (Math.random() - 0.5) * 10;

    return Math.max(0, Math.min(100, Math.round(brightness)));
  }

  /**
   * Motion detection
   */
  generateMotion() {
    const occupancy = this.generateOccupancy();
    return occupancy > 0 && Math.random() < 0.7;
  }

  /**
   * Power consumption affected by occupancy and equipment usage
   */
  generatePowerUsage() {
    const occupancy = this.generateOccupancy();
    const occupancyRatio = occupancy / this.patterns.maxOccupancy;
    const now = new Date();
    const hour = now.getHours();

    // Base power (HVAC, lighting, etc.)
    let power = 2000; // Watts

    // Occupancy-based power (lighting, equipment)
    power += occupancyRatio * 3000;

    // Time-based variation
    if (hour < 8 || hour > 18) {
      power *= 0.3; // Low usage outside hours
    }

    // Add randomness
    power += (Math.random() - 0.5) * 500;

    return Math.round(Math.max(500, power));
  }

  /**
   * Voltage (mostly stable with rare fluctuations)
   */
  generateVoltage() {
    const baseVoltage = 230; // Volts
    const randomNoise = (Math.random() - 0.5) * 2;

    // Rare voltage spikes
    if (Math.random() < 0.02) {
      return Math.round(baseVoltage + randomNoise + (Math.random() * 10 - 5));
    }

    return Math.round(baseVoltage + randomNoise * 10) / 10;
  }

  /**
   * Door status (mostly closed, occasionally open)
   */
  generateDoorStatus() {
    return Math.random() < 0.1 ? 'OPEN' : 'CLOSED';
  }

  /**
   * Unauthorized access detection (rare)
   */
  generateUnauthorizedAccess() {
    return Math.random() < 0.002;
  }

  /**
   * Generate all sensor data at once
   */
  generateSensorData() {
    const occupancy = this.generateOccupancy();

    return {
      timestamp: new Date().toISOString(),
      roomId: this.roomId,
      roomType: this.roomType,
      sensors: {
        temperature: this.generateTemperature(),
        humidity: this.generateHumidity(),
        aqi: this.generateAQI(),
        co2: this.generateCO2(),
        smoke: this.generateSmoke(),
        noise: this.generateNoise(),
        light: this.generateLight(),
        motion: this.generateMotion(),
        occupancy: occupancy,
        power: this.generatePowerUsage(),
        voltage: this.generateVoltage(),
        doorStatus: this.generateDoorStatus(),
        unauthorizedAccess: this.generateUnauthorizedAccess(),
      },
    };
  }
}

/**
 * Campus-wide simulator
 */
export class CampusSimulator {
  constructor(buildingConfig) {
    this.buildingConfig = buildingConfig;
    this.simulators = this.initializeSimulators();
  }

  initializeSimulators() {
    const simulators = {};

    for (const building of this.buildingConfig.buildings) {
      simulators[building.id] = {};

      for (const room of building.rooms) {
        simulators[building.id][room.id] = new SensorSimulator(
          room.id,
          room.type
        );
      }
    }

    return simulators;
  }

  /**
   * Get sensor data for a specific room
   */
  getRoomData(buildingId, roomId) {
    if (!this.simulators[buildingId]?.[roomId]) {
      throw new Error(`Room not found: ${buildingId}/${roomId}`);
    }
    return this.simulators[buildingId][roomId].generateSensorData();
  }

  /**
   * Get all room data for a building
   */
  getBuildingData(buildingId) {
    const data = {};
    for (const roomId in this.simulators[buildingId]) {
      data[roomId] = this.getRoomData(buildingId, roomId);
    }
    return data;
  }

  /**
   * Get all data across campus
   */
  getCampusData() {
    const data = {};
    for (const buildingId in this.simulators) {
      data[buildingId] = this.getBuildingData(buildingId);
    }
    return data;
  }
}

/**
 * Default building configuration
 */
export const DEFAULT_BUILDING_CONFIG = {
  buildings: [
    {
      id: 'block-a',
      name: 'Block A',
      floors: 4,
      rooms: [
        { id: 'a-101', name: 'Lab 1', type: 'lab', floor: 1 },
        { id: 'a-102', name: 'Lab 2', type: 'lab', floor: 1 },
        { id: 'a-201', name: 'Classroom 1', type: 'classroom', floor: 2 },
        { id: 'a-202', name: 'Classroom 2', type: 'classroom', floor: 2 },
        { id: 'a-301', name: 'Office', type: 'office', floor: 3 },
        { id: 'a-302', name: 'Meeting Room', type: 'office', floor: 3 },
      ],
    },
    {
      id: 'block-b',
      name: 'Block B',
      floors: 3,
      rooms: [
        { id: 'b-101', name: 'Library', type: 'library', floor: 1 },
        { id: 'b-102', name: 'Study Area', type: 'library', floor: 1 },
        { id: 'b-201', name: 'Cafeteria', type: 'cafeteria', floor: 2 },
        { id: 'b-202', name: 'Conference Room', type: 'office', floor: 2 },
      ],
    },
  ],
};
