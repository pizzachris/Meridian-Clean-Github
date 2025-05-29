import { verifyPoint } from '../pointVerification';
import { MeridianPoint3 } from '../../types/points';

describe('Point Verification', () => {
  it('correctly identifies complete points', () => {
    const completePoint: MeridianPoint3 = {
      id: 'TEST1',
      korean: '테스트',
      romanized: 'Test',
      english: 'Test Point',
      meridian: 'TEST',
      pointNumber: 'TEST1',
      location: '3 cun lateral to the midline on the anterior chest wall, between the 4th and 5th ribs',
      healing: 'Test healing properties',
      martial: 'Test martial applications',
      region: '',
      dualMeridian: false,
      symptoms: [],
      audio: '',
      notes: ''
    };

    const result = verifyPoint(completePoint);
    expect(result.status).toBe('complete');
    expect(result.hasMeasurements).toBe(true);
    expect(result.hasLandmarks).toBe(true);
    expect(result.hasView).toBe(true);
    expect(result.regions).toContain('trunk');
    expect(result.issues).toHaveLength(0);
  });

  it('correctly identifies incomplete points', () => {
    const incompletePoint: MeridianPoint3 = {
      id: 'TEST2',
      korean: '테스트',
      romanized: 'Test',
      english: 'Test Point',
      meridian: 'TEST',
      pointNumber: 'TEST2',
      location: 'Located on the chest',
      healing: 'Test healing properties',
      martial: 'Test martial applications',
      region: '',
      dualMeridian: false,
      symptoms: [],
      audio: '',
      notes: ''
    };

    const result = verifyPoint(incompletePoint);
    expect(result.status).toBe('incomplete');
    expect(result.hasMeasurements).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it('correctly identifies bilateral points', () => {
    const bilateralPoint: MeridianPoint3 = {
      id: 'TEST3',
      korean: '테스트',
      romanized: 'Test',
      english: 'Test Point',
      meridian: 'TEST',
      pointNumber: 'TEST3',
      location: '2 cun lateral to midline on both sides of the chest',
      healing: 'Test healing properties',
      martial: 'Test martial applications',
      region: '',
      dualMeridian: false,
      symptoms: [],
      audio: '',
      notes: ''
    };

    const result = verifyPoint(bilateralPoint);
    expect(result.isBilateral).toBe(true);
  });

  it('handles missing location gracefully', () => {
    const missingLocationPoint: MeridianPoint3 = {
      id: 'TEST4',
      korean: '테스트',
      romanized: 'Test',
      english: 'Test Point',
      meridian: 'TEST',
      pointNumber: 'TEST4',
      location: '',
      healing: 'Test healing properties',
      martial: 'Test martial applications',
      region: '',
      dualMeridian: false,
      symptoms: [],
      audio: '',
      notes: ''
    };

    const result = verifyPoint(missingLocationPoint);
    expect(result.status).toBe('incomplete');
    expect(result.issues).toContain('Missing location description');
  });
});
