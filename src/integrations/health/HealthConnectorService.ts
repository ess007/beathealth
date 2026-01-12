/**
 * HealthConnectorService Interface
 * 
 * This file defines the interface for health platform integrations.
 * Native Android/iOS implementations should implement this interface
 * to provide real health data from Health Connect / Apple HealthKit.
 * 
 * Current implementation uses stub/mock data.
 * Replace individual methods with real implementations when native bridges are ready.
 */

export interface HeartReading {
  timestamp: Date;
  bpm: number;
  source: string;
  metadata?: Record<string, unknown>;
}

export interface BPReading {
  timestamp: Date;
  systolic: number;
  diastolic: number;
  heartRate?: number;
  source: string;
  metadata?: Record<string, unknown>;
}

export interface GlucoseReading {
  timestamp: Date;
  glucoseMgDl: number;
  measurementType: 'fasting' | 'post_meal' | 'random';
  source: string;
  metadata?: Record<string, unknown>;
}

export interface SleepReading {
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  quality?: 'excellent' | 'good' | 'fair' | 'poor';
  source: string;
  metadata?: Record<string, unknown>;
}

export interface StepsReading {
  date: Date;
  count: number;
  source: string;
  metadata?: Record<string, unknown>;
}

export interface HealthConnectorConfig {
  useMocks?: boolean;
  platform?: 'android' | 'ios' | 'web';
}

export interface IHealthConnectorService {
  // Check if platform is available
  isAvailable(): Promise<boolean>;
  
  // Request permissions
  requestPermissions(): Promise<boolean>;
  
  // Heart rate data
  fetchLatestHeartReadings(
    userId: string,
    sinceTimestamp: Date
  ): Promise<HeartReading[]>;
  
  // Blood pressure data
  fetchLatestBPReadings(
    userId: string,
    sinceTimestamp: Date
  ): Promise<BPReading[]>;
  
  // Glucose data
  fetchLatestGlucoseReadings(
    userId: string,
    sinceTimestamp: Date
  ): Promise<GlucoseReading[]>;
  
  // Sleep data
  fetchLatestSleepReadings(
    userId: string,
    sinceTimestamp: Date
  ): Promise<SleepReading[]>;
  
  // Steps data
  fetchLatestStepsReadings(
    userId: string,
    sinceTimestamp: Date
  ): Promise<StepsReading[]>;
}

/**
 * Stub implementation of HealthConnectorService
 * 
 * This implementation returns mock data for development/testing.
 * Replace with real implementations for:
 * - HealthConnectService (Android)
 * - HealthKitService (iOS)
 */
export class HealthConnectorService implements IHealthConnectorService {
  private config: HealthConnectorConfig;

  constructor(config: HealthConnectorConfig = {}) {
    this.config = {
      useMocks: true,
      platform: 'web',
      ...config,
    };
  }

  async isAvailable(): Promise<boolean> {
    // In production:
    // - Android: Check if Health Connect is installed
    // - iOS: Check HealthKit authorization status
    
    if (this.config.useMocks) {
      return true;
    }
    
    // Web platform doesn't have native health integrations
    return false;
  }

  async requestPermissions(): Promise<boolean> {
    // In production:
    // - Android: Request Health Connect permissions
    // - iOS: Request HealthKit authorization
    
    if (this.config.useMocks) {
      console.log('[HealthConnector] Mock: Permissions granted');
      return true;
    }
    
    return false;
  }

  async fetchLatestHeartReadings(
    userId: string,
    sinceTimestamp: Date
  ): Promise<HeartReading[]> {
    // In production: Query Health Connect / HealthKit for heart rate data
    
    if (this.config.useMocks) {
      console.log(`[HealthConnector] Mock: Fetching heart readings for ${userId} since ${sinceTimestamp.toISOString()}`);
      
      // Return mock data
      return [
        {
          timestamp: new Date(),
          bpm: 72,
          source: 'mock_wearable',
          metadata: { deviceName: 'Mock Watch' },
        },
      ];
    }
    
    return [];
  }

  async fetchLatestBPReadings(
    userId: string,
    sinceTimestamp: Date
  ): Promise<BPReading[]> {
    // In production: Query Health Connect / HealthKit for BP data
    
    if (this.config.useMocks) {
      console.log(`[HealthConnector] Mock: Fetching BP readings for ${userId} since ${sinceTimestamp.toISOString()}`);
      
      return [
        {
          timestamp: new Date(),
          systolic: 120,
          diastolic: 78,
          heartRate: 72,
          source: 'mock_bp_monitor',
          metadata: { deviceName: 'Mock BP Monitor' },
        },
      ];
    }
    
    return [];
  }

  async fetchLatestGlucoseReadings(
    userId: string,
    sinceTimestamp: Date
  ): Promise<GlucoseReading[]> {
    // In production: Query Health Connect / HealthKit for glucose data
    
    if (this.config.useMocks) {
      console.log(`[HealthConnector] Mock: Fetching glucose readings for ${userId} since ${sinceTimestamp.toISOString()}`);
      
      return [
        {
          timestamp: new Date(),
          glucoseMgDl: 98,
          measurementType: 'fasting',
          source: 'mock_glucometer',
          metadata: { deviceName: 'Mock Glucometer' },
        },
      ];
    }
    
    return [];
  }

  async fetchLatestSleepReadings(
    userId: string,
    sinceTimestamp: Date
  ): Promise<SleepReading[]> {
    // In production: Query Health Connect / HealthKit for sleep data
    
    if (this.config.useMocks) {
      console.log(`[HealthConnector] Mock: Fetching sleep readings for ${userId} since ${sinceTimestamp.toISOString()}`);
      
      const endTime = new Date();
      endTime.setHours(7, 0, 0, 0);
      const startTime = new Date(endTime);
      startTime.setHours(startTime.getHours() - 7);
      
      return [
        {
          startTime,
          endTime,
          durationMinutes: 420,
          quality: 'good',
          source: 'mock_wearable',
          metadata: { deviceName: 'Mock Watch' },
        },
      ];
    }
    
    return [];
  }

  async fetchLatestStepsReadings(
    userId: string,
    sinceTimestamp: Date
  ): Promise<StepsReading[]> {
    // In production: Query Health Connect / HealthKit for steps data
    
    if (this.config.useMocks) {
      console.log(`[HealthConnector] Mock: Fetching steps readings for ${userId} since ${sinceTimestamp.toISOString()}`);
      
      return [
        {
          date: new Date(),
          count: 6842,
          source: 'mock_wearable',
          metadata: { deviceName: 'Mock Watch' },
        },
      ];
    }
    
    return [];
  }
}

// Singleton instance for app-wide use
let connectorInstance: HealthConnectorService | null = null;

export const getHealthConnector = (config?: HealthConnectorConfig): HealthConnectorService => {
  if (!connectorInstance) {
    connectorInstance = new HealthConnectorService(config);
  }
  return connectorInstance;
};

// Type guard for platform detection
export const detectPlatform = (): 'android' | 'ios' | 'web' => {
  if (typeof navigator === 'undefined') return 'web';
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/android/i.test(userAgent)) return 'android';
  if (/iphone|ipad|ipod/i.test(userAgent)) return 'ios';
  
  return 'web';
};
