# Health Platform Integration Guide

This document outlines the planned integrations for BEAT with native health platforms and external devices.

## Overview

BEAT supports importing health data from multiple sources:
- **Android**: Health Connect API
- **iOS**: Apple HealthKit
- **Devices**: BP monitors, glucometers, CGMs via manufacturer apps

## Data Mapping

| Platform Data Type | BEAT Type | Storage Table |
|-------------------|-----------|---------------|
| HeartRate | HEART_RATE | vitals_continuous |
| BloodPressure | BLOOD_PRESSURE | bp_logs |
| BloodGlucose | BLOOD_GLUCOSE | sugar_logs |
| Steps | STEPS | behavior_logs |
| Sleep | SLEEP | behavior_logs |
| HRV | HRV | vitals_continuous |

## Integration Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Health Connect │     │  Apple Health   │     │  Device Apps    │
│  (Android)      │     │  (iOS)          │     │  (Omron, etc.)  │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────┬───────┴───────────────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │  HealthConnector    │
              │  Service Interface  │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │  BEAT Database      │
              │  (readings, logs)   │
              └─────────────────────┘
```

## Implementation Status

### Current (v1.0)
- ✅ Manual entry for all vitals
- ✅ Camera-based PPG for heart rate (mock)
- ✅ Data sources management UI
- ✅ Import from CSV/JSON files

### Planned (v2.0)
- ⏳ Health Connect (Android) - real-time sync
- ⏳ Apple HealthKit (iOS) - real-time sync
- ⏳ Real PPG algorithm for camera measurements

### Future (v3.0)
- ⏳ Omron direct API integration
- ⏳ CGM continuous data streaming
- ⏳ Wearable background sync

## Interface Definition

See `HealthConnectorService.ts` for the interface that native implementations should follow.

## Security Considerations

1. **Data Privacy**: Health data is encrypted at rest and in transit
2. **User Consent**: All integrations require explicit user permission
3. **Minimal Access**: Only request access to data types we actually use
4. **Audit Logging**: All data imports are logged for transparency

## Testing

For development, mock implementations return simulated data. To enable mocks:

```typescript
const connector = new HealthConnectorService({ useMocks: true });
```

## Resources

- [Health Connect Developer Guide](https://developer.android.com/health-and-fitness/guides/health-connect)
- [Apple HealthKit Documentation](https://developer.apple.com/documentation/healthkit)
- [BEAT API Documentation](./API.md)
