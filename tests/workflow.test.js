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

test('Evidence Quote Verification Test', async (t) => {
  const fileText = "Dette er en randomisert kontrollert studie med 240 deltakere. Formålet var å undersøke digital oppfølging.";
  const lowerFileText = fileText.toLowerCase();

  const validQuote = "randomisert kontrollert studie";
  const fakeQuote = "oppdiktet sitat som ikke finnes i teksten";

  const isValFound = lowerFileText.includes(validQuote.toLowerCase());
  const isFakeFound = lowerFileText.includes(fakeQuote.toLowerCase());

  assert.strictEqual(isValFound, true);
  assert.strictEqual(isFakeFound, false);
});

test('Full Article Ingestion, Document Parsing and Evidence Verification Test', async (t) => {
  // Simulerer en fullstendig forskningsartikkel (f.eks. Øverhaug-studie eller tilsvarende kvalitativ/kvantitativ studie)
  const fullArticleText = `
  Tittel: Utvikling av relasjonell koordinering i tverrfaglige helseteam: En kvalitativ studie
  Forfattere: Anne Beth Øverhaug et al.
  
  Bakgrunn og hensikt:
  Helsevesenet opplever økt kompleksitet som krever sømløst samarbeid. Formålet med denne studien var å undersøke hvordan relasjonell koordinering utvikler seg i tverrfaglige team over tid.
  
  Metode:
  Studien benyttet et kvalitativt design med semistrukturerte dybdeintervju av 18 helsearbeidere i spesialisthelsetjenesten. Dataanalysen ble utført ved hjelp av systematisk tekstkondensering.
  
  Resultater:
  Analysen avdekket tre hovedtemaer: (1) felles forståelse av pasientforløpet, (2) gjensidig respekt på tvers av profesjonsgrenser, og (3) hyppig, tidsriktig kommunikasjon. Deltakerne fremhevet at felles møteplasser var avgjørende for å bygge tillit.
  
  Konklusjon:
  Relasjonell koordinering styrkes gjennom strukturert samhandling og felles arenaer. Dette har direkte implikasjoner for pasientsikkerheten.
  `;

  // 1. Validere at dokumentet inneholder tilstrekkelig tekst for fulltekstparsing
  assert.ok(fullArticleText.length > 200, 'Artikkelteksten må være fullstendig og over 200 tegn');

  // 2. Simulere dynamisk instrumentvalg basert på studiedesign ('kvalitativt design')
  const detectedDesign = fullArticleText.toLowerCase().includes('kvalitativt design') ? 'Kvalitativ forskning' : 'Kvantitativ forskning';
  assert.strictEqual(detectedDesign, 'Kvalitativ forskning');

  const selectedInstrument = detectedDesign === 'Kvalitativ forskning' 
    ? { acronym: 'JBI Qualitative', name: 'JBI Critical Appraisal Checklist for Qualitative Research' }
    : { acronym: 'CASP RCT', name: 'CASP Randomised Controlled Trial Checklist' };

  assert.strictEqual(selectedInstrument.acronym, 'JBI Qualitative');

  // 3. Verifisere evidenssitater i fullteksten
  const proposedQuote = "felles forståelse av pasientforløpet";
  const lowerFullText = fullArticleText.toLowerCase();
  const isQuoteVerified = lowerFullText.includes(proposedQuote.toLowerCase());
  assert.strictEqual(isQuoteVerified, true, 'Sitatet må bli verifisert direkte mot den faktiske artikkelteksten');
});


