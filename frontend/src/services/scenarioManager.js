/**
 * Scenario Injection Service
 * Applies emergency scenarios to sensor data in real-time
 */

export class ScenarioManager {
  constructor() {
    this.activeScenarios = new Set();
    this.scenarioStartTime = null;
  }

  /**
   * Trigger a scenario
   */
  triggerScenario(scenario) {
    if (scenario.id === 'reset') {
      this.activeScenarios.clear();
      this.scenarioStartTime = null;
      return;
    }

    this.activeScenarios.add(scenario.id);
    this.scenarioStartTime = Date.now();

    console.log(`🚨 Scenario triggered: ${scenario.name}`);
  }

  /**
   * Get active scenarios
   */
  getActiveScenarios() {
    return Array.from(this.activeScenarios);
  }

  /**
   * Apply scenario effects to sensor data
   */
  applyScenarioEffects(sensorData, roomId) {
    if (this.activeScenarios.size === 0) {
      return sensorData;
    }

    // Check if scenario has expired (15 seconds)
    const elapsedTime = Date.now() - this.scenarioStartTime;
    if (elapsedTime > 15000) {
      this.activeScenarios.clear();
      this.scenarioStartTime = null;
      return sensorData;
    }

    const modifiedData = { ...sensorData };

    // Apply each active scenario's effects
    for (const scenarioId of this.activeScenarios) {
      modifiedData.sensors = this.applyScenarioToRoom(
        modifiedData.sensors,
        scenarioId,
        roomId
      );
    }

    return modifiedData;
  }

  /**
   * Apply specific scenario to room
   */
  applyScenarioToRoom(sensors, scenarioId, roomId) {
    const modified = { ...sensors };

    switch (scenarioId) {
      case 'fire':
        // Fire in random rooms (20% chance)
        if (Math.random() < 0.2) {
          modified.smoke = true;
          modified.temperature = Math.min(35, modified.temperature + 10);
          modified.aqi = Math.min(500, modified.aqi + 200);
          modified.co2 = Math.min(3000, modified.co2 + 500);
          modified.humidity = Math.min(95, modified.humidity + 10);
        }
        break;

      case 'power-surge':
        // Power surge in random rooms (15% chance)
        if (Math.random() < 0.15) {
          modified.voltage = 250; // Dangerous voltage
          modified.power = Math.min(5000, modified.power * 1.5);
          modified.temperature = Math.min(30, modified.temperature + 5);
          modified.deviceUptime = 0; // Devices might reset
        }
        break;

      case 'network-failure':
        // Network down affects all rooms
        modified.networkStatus = 'OFFLINE';
        modified.dataQuality = 0;
        break;

      case 'unauthorized-entry':
        // Unauthorized access in random rooms (30% chance)
        if (Math.random() < 0.3) {
          modified.motion = true;
          modified.unauthorizedAccess = true;
          modified.doorStatus = 'OPEN';
        }
        break;

      case 'overcrowding':
        // Crowd surge in random rooms (25% chance)
        if (Math.random() < 0.25) {
          modified.occupancy = Math.min(500, 250 + Math.random() * 100);
          modified.co2 = Math.min(3000, modified.co2 + 800);
          modified.aqi = Math.min(400, modified.aqi + 150);
          modified.temperature = Math.min(30, modified.temperature + 8);
          modified.noise = Math.min(95, modified.noise + 20);
          modified.humidity = Math.min(90, modified.humidity + 15);
        }
        break;

      case 'hvac-failure':
        // HVAC down in random rooms (20% chance)
        if (Math.random() < 0.2) {
          modified.hvacStatus = 'OFFLINE';
          // Temperature drifts without control
          modified.temperature = Math.min(35, modified.temperature + 3);
          modified.humidity = Math.min(95, modified.humidity + 10);
          modified.aqi = Math.min(300, modified.aqi + 80);
        }
        break;

      default:
        break;
    }

    return modified;
  }
}

// Global instance
export const scenarioManager = new ScenarioManager();
