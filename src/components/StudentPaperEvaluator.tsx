import React, { useState } from 'react';
import { FileText, CheckCircle2, AlertTriangle, ShieldCheck, Sparkles, Award, BookOpen, Upload, RefreshCw } from 'lucide-react';

export const StudentPaperEvaluator: React.FC = () => {
  const [paperTitle, setPaperTitle] = useState<string>('Min eksamensoppgave i KBP (Kritisk vurdering og vitenskapsteori)');
  const [paperText, setPaperText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<any | null>(null);

  const samplePaper = `Tittel: Kritisk vurdering av Øverhaug et al. (2024) og metodiske utfordringer i tverrsektorielt samarbeid.
  
Innledning:
Helsestenester av høy kvalitet skal basere seg på kunnskapsbasert praksis (KBP), som integrerer forskningsbasert kunnskap, klinisk ekspertise og pasientens verdier. Denne oppgaven gir en kritisk vurdering av to vitenskapelige studier med utgangspunkt i KBP-rammeverket og vitenskapsteoretiske posisjoner.

Metode og Vitenskapsteori:
Studien av Øverhaug et al. (2024) anvender en kvalitativ grounded theory-tilnærming (Corbin & Strauss, 2015). Vitenskapsteoretisk forankrer studien seg i sosialkonstruktivisme og hermeneutikk, der hensikten er å fortolke fastlegers subjektive erfaringer. Utvalget besto av 10 fastleger. Dette gir god informasjonskraft for denne gruppen, men mangler barnevernets perspektiv.

Forskningsetikk:
Etiske hensyn som informert samtykke, konfidensialitet og REK-godkjenning er ivaretatt. Likevel kan det stilles spørsmål ved konfidensialitet i små kommuner der få fastleger deltar.

Referanser:
Corbin, J., & Strauss, A. (2015). Basics of qualitative research. Sage.
Øverhaug, O. M. S., et al. (2024). BMC Primary Care.`;

  const handleEvaluate = async () => {
    if (!paperText.trim()) {
      alert('Vennligst lim inn oppgaveteksten først.');
      return;
    }

    setLoading(true);
    setEvaluation(null);

    try {
      const res = await fetch('/api/evaluate-student-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: paperTitle,
          text: paperText
        })
      });
      const data = await res.json();
      if (res.ok) {
        setEvaluation(data);
      } else {
        alert(data.error || 'Kunne ikke evaluere oppgaven.');
      }
    } catch (err: any) {
      console.error(err);
      alert('Nettverkfeil under evaluering.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 mb-2">
            Høgskulen på Vestlandet • Master i kunnskapsbasert praksis (Sensor- og veiledningsmodul)
          </span>
          <h2 className="text-xl font-bold text-slate-900">Kritisk Vurdering & Sensur av Egen Eksamensoppgave</h2>
          <p className="text-sm text-slate-600 mt-1">
            Lim inn din oppgave for å få en komplett sensorvurdering basert på HVLs læringsutbytte, APA 7-referansekontroll, vitenskapsteori, forskningsetikk og AI/plagiat-sjekk.
          </p>
        </div>

        <button
          onClick={() => {
            setPaperText(samplePaper);
          }}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
        >
          Last inn eksempeloppgave
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Oppgavedata & Innlevering</h3>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Oppgavetittel</label>
            <input
              type="text"
              value={paperTitle}
              onChange={(e) => setPaperTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Oppgavetekst (eller utkast)</label>
              <span className="text-xs text-slate-500">{paperText.split(/\s+/).filter(Boolean).length} ord (Mål: ca. 2500 ord)</span>
            </div>
            <textarea
              rows={14}
              value={paperText}
              onChange={(e) => setPaperText(e.target.value)}
              placeholder="Lim inn teksten fra din eksamensoppgave her..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden leading-relaxed"
            />
          </div>

          <button
            onClick={handleEvaluate}
            disabled={loading || !paperText.trim()}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Kjører sensor- og referansekontroll...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Utfør komplett sensorvurdering & KBP-kontroll</span>
              </>
            )}
          </button>
        </div>

        {/* Evaluation Results */}
        <div className="space-y-6">
          {!evaluation && !loading && (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-xs text-center space-y-3 h-full flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Klar til sensur</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Lim inn teksten og trykk på knappen for å motta en grundig faglig tilbakemelding på masternivå.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-xs text-center space-y-4 h-full flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <h4 className="text-base font-bold text-slate-900">Analyserer vitenskapsteori, etikk og referanser...</h4>
              <p className="text-xs text-slate-500">Dette tar et øyeblikk.</p>
            </div>
          )}

          {evaluation && (
            <div className="space-y-6">
              {/* Grade card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Foreløpig sensur / Vurdering</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-0.5">{evaluation.estimatedGrade}</h3>
                  <p className="text-xs text-slate-500 mt-1">{evaluation.gradeRationale}</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xl border border-emerald-200">
                  {evaluation.score}/100
                </div>
              </div>

              {/* KBP & Vitenskapsteori */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>KBP & Vitenskapsteoretisk vurdering</span>
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {evaluation.kbpAndEpistemology}
                </p>
              </div>

              {/* Referansekontroll APA 7 */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Referansekontroll (APA 7 & Harvard)</span>
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {evaluation.referenceCheck}
                </p>
              </div>

              {/* AI & Plagiat-sjekk */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>AI- og Plagiatkontroll</span>
                </h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span>Sannsynlighet for AI-generert tekst:</span>
                    <span className={evaluation.aiProbability > 40 ? 'text-amber-600' : 'text-emerald-600'}>
                      {evaluation.aiProbability}% ({evaluation.aiAssessment})
                    </span>
                  </div>
                  <p className="text-slate-600">{evaluation.plagiarismAssessment}</p>
                </div>
              </div>

              {/* Konkrete forbedringspunkter */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-indigo-700">
                  Konkrete forbedringspunkter for karakterløft
                </h4>
                <ul className="space-y-2">
                  {evaluation.improvements?.map((imp: string, i: number) => (
                    <li key={i} className="text-xs text-slate-700 flex items-start space-x-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
