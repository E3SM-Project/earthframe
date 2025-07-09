import { useState } from 'react';
import { fetchAISimAnalysis } from '@/api/compareAPI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Simulation } from '@/App';

interface Props {
  selectedSimulations: Simulation[];
}

export function ComparisonAI({ selectedSimulations }: Props) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAICompare = async () => {
    setLoading(true);
    try {
      // Prepare simulation data for API (pass all attributes)
      const simulations = selectedSimulations.map((sim) => ({ ...sim }));

      // Get AI-generated summary (API returns string)
      const aiSummary = await fetchAISimAnalysis(simulations);
      setSummary(aiSummary || '');
    } catch (err) {
      setSummary('Error generating summary.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>AI Summary</CardTitle>
        <CardDescription>Summary generated from selected simulations</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleAICompare} disabled={loading}>
          {loading ? 'Analyzing...' : 'Generate AI Insight'}
        </Button>

        {summary && (
          <div className="mt-4 space-y-2">
            <h3 className="font-semibold text-sm">Summary:</h3>
            <p>{summary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
