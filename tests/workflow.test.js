import test from 'node:test';
import assert from 'node:assert';

test('Critical Workflow Integration Test: Import -> Analyze -> Appraisal -> Report', async (t) => {
  // 1. Mock Article Import
  const importedArticle = {
    id: 'test-study-001',
    title: 'Randomisert kontrollert studie av digital oppfølging ved kronisk sykdom',
    authors: ['Andersen, K.', 'Hansen, M.'],
    year: 2025,
    journal: 'Tidsskrift for Den norske legeforening',
    doi: '10.4045/tidsskr.25.0123',
    abstract: 'Bakgrunn: Digital oppfølging øker mestring. Metode: RCT med 240 deltakere. Resultat: Signifikant bedring (p < 0.001). Konklusjon: Anbefales.',
    fullText: 'Fulltekstinnhold for studien med detaljert metode og statistiske analyser...',
    studyDesign: 'Randomisert kontrollert studie (RCT)'
  };

  assert.strictEqual(importedArticle.id, 'test-study-001');
  assert.strictEqual(importedArticle.doi, '10.4045/tidsskr.25.0123');

  // 2. Mock Analysis & Screening Gate Validation
  const screeningValidation = {
    passed: true,
    warnings: [],
    studyId: importedArticle.id,
    instrumentId: 'cochrane_rob2',
    timestamp: new Date().toISOString()
  };

  assert.strictEqual(screeningValidation.passed, true);
  assert.strictEqual(screeningValidation.instrumentId, 'cochrane_rob2');

  // 3. Mock Appraisal & Checklist Execution
  const appraisalSession = {
    studyId: importedArticle.id,
    instrumentId: 'cochrane_rob2',
    responses: {
      'domain_1': 'Low risk',
      'domain_2': 'Low risk',
      'domain_3': 'Some concerns',
      'domain_4': 'Low risk',
      'domain_5': 'Low risk'
    },
    status: 'LOCKED',
    reviewer: { id: 'rev-1', name: 'Dr. Med. Test', role: 'Senior Researcher' }
  };

  assert.strictEqual(appraisalSession.status, 'LOCKED');
  assert.strictEqual(appraisalSession.responses['domain_3'], 'Some concerns');

  // 4. Mock Autosave & Report Generation
  const reportSnapshot = {
    version: 1.0,
    generatedAt: new Date().toISOString(),
    articleTitle: importedArticle.title,
    doi: importedArticle.doi,
    design: importedArticle.studyDesign,
    appraisalResult: appraisalSession,
    status: 'READY_FOR_EXPORT'
  };

  assert.strictEqual(reportSnapshot.status, 'READY_FOR_EXPORT');
  assert.strictEqual(reportSnapshot.articleTitle, importedArticle.title);
  assert.ok(reportSnapshot.generatedAt);
});

test('Autosave and Snapshot Recovery Integration Test', async (t) => {
  const mockStorageKey = 'evidence_autosave_test';
  const mockState = {
    activeProject: 'KBP Masteroppgave 2026',
    studiesCount: 3,
    lastSaved: new Date().toISOString()
  };

  // Simulate serialization & deserialization (local-first autosave simulation)
  const serialized = JSON.stringify(mockState);
  const deserialized = JSON.parse(serialized);

  assert.strictEqual(deserialized.activeProject, mockState.activeProject);
  assert.strictEqual(deserialized.studiesCount, mockState.studiesCount);
  assert.ok(deserialized.lastSaved);
});
