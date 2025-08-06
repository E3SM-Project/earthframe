import { Simulation } from '@/App';
import { Button } from '@/components/ui/button';
import { Earth } from 'lucide-react'; // Or use your own SVG if you have one
import { Link } from 'react-router-dom';
import NewSimsTable from '@/pages/Home/NewSimsTable';

interface HomeProps {
  data: Simulation[];
}

const Home = ({ data }: HomeProps) => {
  const latestSimulations = [...data]
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
    .slice(0, 6);

  return (
    <main className="flex flex-col items-center justify-center min-h-[70vh] bg-white px-4 py-12">
      <section className="flex flex-col md:flex-row items-center gap-10 w-full max-w-7xl mx-auto bg</main>-white/90 shadow-2xl rounded-3xl border border-muted p-10 md:p-20">
        {/* Left: Text */}
        <div className="flex-[1.3]">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Explore E3SM Simulations with Confidence
          </h1>
          <p className="italic text-lg mb-4 text-muted-foreground">
            EarthFrame provides access to curated Earth system simulations from the Department of
            Energy's Energy Exascale Earth System Model (E3SM).
          </p>
          <ul className="list-disc list-inside mb-4 text-base text-muted-foreground">
            <li>Browse validated production runs and recent latest master</li>
            <li>Compare output across simulation campaigns, versions, and configurations</li>
            <li>
              Explore high-impact variables like temperature, precipitation, and pressure trends
            </li>
          </ul>
          <p className="font-semibold mb-6">
            Designed for scientists, collaborators, and model developers working with E3SM datasets.
          </p>
          <div className="flex gap-4">
            <Button asChild variant="default">
              <Link to="/search">Search Simulations</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/upload">Upload Simulation</Link>
            </Button>
          </div>
        </div>
        {/* Right: Earth Icon */}
        <div className="flex-[0.7] flex justify-center">
          <div className="rounded-full border-4 border-muted p-8 bg-muted/30 shadow-lg">
            <Earth className="w-40 h-40 text-muted-foreground" />
          </div>
        </div>
      </section>

      <section className="w-full max-w-7xl mx-auto mt-12">
        <h2 className="text-2xl font-bold mb-2">Quick Start</h2>
        <p className="text-muted-foreground mb-1">
          Get started with EarthFrame by following these key steps.
        </p>
        <p className="text-muted-foreground mb-6">
          Browse curated simulations, compare outputs, or upload your own results.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white border border-muted rounded-xl shadow p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🧪</span>
              <span className="font-semibold text-lg">Step 1: Explore Curated Simulations</span>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Browse production and latest master runs with key variables summarized.
            </p>
            <Button asChild variant="default" className="self-start">
              <Link to="/search">Search Simulations</Link>
            </Button>
          </div>
          {/* Step 2 */}
          <div className="bg-white border border-muted rounded-xl shadow p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🔍</span>
              <span className="font-semibold text-lg">Step 2: Compare Simulations</span>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Select simulations to analyze differences across versions, configurations, or
              campaigns.
            </p>
            <Button asChild variant="secondary" className="self-start">
              <Link to="/compare">Go to Comparison</Link>
            </Button>
          </div>
          {/* Step 3 */}
          <div className="bg-white border border-muted rounded-xl shadow p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📝</span>
              <span className="font-semibold text-lg">Step 3: Upload a Simulation</span>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Add a new simulation to share with collaborators or archive for reproducibility.
            </p>
            <Button asChild variant="default" className="self-start">
              <Link to="/upload">Upload Simulation</Link>
            </Button>
          </div>
        </div>
        {/* Recently Added Simulations */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-2">Recently Added Simulations</h2>
          <p className="text-muted-foreground mb-4">
            Newly submitted simulations appear here for quick access.
          </p>
          <div className="bg-white border border-muted rounded-xl shadow p-6">
            <NewSimsTable data={latestSimulations} />
            <div className="flex justify-center mt-4">
              <Button asChild variant="default">
                <Link to="/search">View All Simulations</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
