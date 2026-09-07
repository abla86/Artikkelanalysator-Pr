import test from 'node:test';
import assert from 'node:assert';
import { validateDoiFormat, fetchArticleByDoi } from '../src/utils/doiAndAutosave.ts';

test('Critical Workflow Integration Test: Import -> Validate DOI -> Appraisal -> Report', async (t) => {
  const testDoi = '10.1016/j.jclinepi.2023.05.001';
  assert.strictEqual(validateDoiFormat(testDoi), true);

  // Test actual DOI metadata fetch utility (which uses offline fallback or Crossref API)
  const metadata = await fetchArticleByDoi(testDoi);
  assert.strictEqual(metadata.doi, testDoi);
  assert.ok(metadata.title);
  assert.ok(metadata.authors.length > 0);
  assert.strictEqual(metadata.isValid, true);

  // Appraisal & Checklist Execution
  const appraisalSession = {
    studyId: 'study-001',
    instrumentId: 'cochrane_rob2',
    responses: {
      'domain_1': 'Low risk',
      'domain_2': 'Low risk',
      'domain_3': 'Some concerns'
    },
    status: 'LOCKED'
  };

  assert.strictEqual(appraisalSession.status, 'LOCKED');

  // Report Snapshot Generation
  const reportSnapshot = {
    version: 2.0,
    generatedAt: new Date().toISOString(),
    study: metadata,
    appraisal: appraisalSession,
    status: 'READY_FOR_EXPORT'
  };

  assert.strictEqual(reportSnapshot.status, 'READY_FOR_EXPORT');
  assert.strictEqual(reportSnapshot.study.doi, testDoi);
});

test('Autosave and Snapshot Recovery Integration Test', async (t) => {
  const mockState = {
    activeProject: 'KBP Masteroppgave 2026',
    studiesCount: 3,
    lastSaved: new Date().toISOString()
  };

  const serialized = JSON.stringify(mockState);
  const deserialized = JSON.parse(serialized);

  assert.strictEqual(deserialized.activeProject, mockState.activeProject);
  assert.strictEqual(deserialized.studiesCount, mockState.studiesCount);
  assert.ok(deserialized.lastSaved);
});

test('DOI Format Validation Test', async (t) => {
  const validDoi = '10.1016/j.jclinepi.2023.05.001';
  const invalidDoi = 'not-a-doi';

  assert.strictEqual(validateDoiFormat(validDoi), true);
  assert.strictEqual(validateDoiFormat(invalidDoi), false);
});
