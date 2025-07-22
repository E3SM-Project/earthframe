import { useState } from 'react';

interface ConfigData {
  simName: string;
  resolution: string;
  machine: string;
  startDate: string;
}

interface CodeData {
  repo: string;
  tag: string;
  hash: string;
  pullRequest: string;
}

interface ScriptsData {
  runScript: string;
  postProcessing: string;
  links: string;
  notes: string;
}

const sections = [
  { key: 'config', label: 'Configuration' },
  { key: 'code', label: 'Code' },
  { key: 'scripts', label: 'Scripts and Diagnostics' },
  { key: 'review', label: 'Review & Submit' },
] as const;

const cardBase = 'bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-6';

const cardHeader =
  'w-full text-left px-6 py-4 font-semibold bg-gray-50 border-b border-gray-200 cursor-pointer text-lg';

const cardBody = 'px-6 py-4';

const Submit = () => {
  const [openSection, setOpenSection] = useState<string | null>('config');

  const [config, setConfig] = useState<ConfigData>({
    simName: '',
    resolution: '',
    machine: '',
    startDate: '',
  });

  const [code, setCode] = useState<CodeData>({
    repo: '',
    tag: '',
    hash: '',
    pullRequest: '',
  });

  const [scripts, setScripts] = useState<ScriptsData>({
    runScript: '',
    postProcessing: '',
    links: '',
    notes: '',
  });

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode({ ...code, [e.target.name]: e.target.value });
  };

  const handleScriptsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setScripts({ ...scripts, [e.target.name]: e.target.value });
  };

  const toggleSection = (key: string) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-gray-50 px-2 py-8 md:px-8 lg:px-16 box-border">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Submit Simulation</h1>
        {/* Configuration Section */}
        <div className={cardBase}>
          <button type="button" className={cardHeader} onClick={() => toggleSection('config')}>
            {sections[0].label}
          </button>
          {openSection === 'config' && (
            <div className={cardBody}>
              <div className="mb-4">
                <label className="block font-medium mb-1">
                  Simulation Name
                  <input
                    type="text"
                    name="simName"
                    value={config.simName}
                    onChange={handleConfigChange}
                    className="w-full mt-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block font-medium mb-1">
                  Resolution
                  <input
                    type="text"
                    name="resolution"
                    value={config.resolution}
                    onChange={handleConfigChange}
                    className="w-full mt-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                    placeholder="e.g. 1.0 degree"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block font-medium mb-1">
                  Machine
                  <input
                    type="text"
                    name="machine"
                    value={config.machine}
                    onChange={handleConfigChange}
                    className="w-full mt-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  />
                </label>
              </div>
              <div className="mb-2">
                <label className="block font-medium mb-1">
                  Start Date
                  <input
                    type="date"
                    name="startDate"
                    value={config.startDate}
                    onChange={handleConfigChange}
                    className="w-full mt-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
        {/* Code Section */}
        <div className={cardBase}>
          <button type="button" className={cardHeader} onClick={() => toggleSection('code')}>
            {sections[1].label}
          </button>
          {openSection === 'code' && (
            <div className={cardBody}>
              <div className="mb-4">
                <label className="block font-medium mb-1">
                  Repository
                  <input
                    type="text"
                    name="repo"
                    value={code.repo}
                    onChange={handleCodeChange}
                    className="w-full mt-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                    placeholder="e.g. github.com/org/repo"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block font-medium mb-1">
                  Tag
                  <input
                    type="text"
                    name="tag"
                    value={code.tag}
                    onChange={handleCodeChange}
                    className="w-full mt-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block font-medium mb-1">
                  Hash
                  <input
                    type="text"
                    name="hash"
                    value={code.hash}
                    onChange={handleCodeChange}
                    className="w-full mt-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  />
                </label>
              </div>
              <div className="mb-2">
                <label className="block font-medium mb-1">
                  Pull Request
                  <input
                    type="text"
                    name="pullRequest"
                    value={code.pullRequest}
                    onChange={handleCodeChange}
                    className="w-full mt-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
        {/* Scripts Section */}
        <div className={cardBase}>
          <button type="button" className={cardHeader} onClick={() => toggleSection('scripts')}>
            {sections[2].label}
          </button>
          {openSection === 'scripts' && (
            <div className={cardBody}>
              <div className="mb-4">
                <label className="block font-medium mb-1">
                  Run Script
                  <input
                    type="text"
                    name="runScript"
                    value={scripts.runScript}
                    onChange={handleScriptsChange}
                    className="w-full mt-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block font-medium mb-1">
                  Post-processing
                  <input
                    type="text"
                    name="postProcessing"
                    value={scripts.postProcessing}
                    onChange={handleScriptsChange}
                    className="w-full mt-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block font-medium mb-1">
                  Links
                  <input
                    type="text"
                    name="links"
                    value={scripts.links}
                    onChange={handleScriptsChange}
                    className="w-full mt-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  />
                </label>
              </div>
              <div className="mb-2">
                <label className="block font-medium mb-1">
                  Notes
                  <textarea
                    name="notes"
                    value={scripts.notes}
                    onChange={handleScriptsChange}
                    className="w-full mt-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                    rows={3}
                  />
                </label>
              </div>
            </div>
          )}
        </div>
        {/* Review Section */}
        <div className={cardBase}>
          <button type="button" className={cardHeader} onClick={() => toggleSection('review')}>
            {sections[3].label}
          </button>
          {openSection === 'review' && (
            <div className={cardBody}>
              <div className="mb-4">
                <strong>Simulation Name:</strong> {config.simName} <br />
                <strong>Resolution:</strong> {config.resolution} <br />
                <strong>Machine:</strong> {config.machine} <br />
                <strong>Start Date:</strong> {config.startDate} <br />
              </div>
              <div className="mb-4">
                <strong>Repository:</strong> {code.repo} <br />
                <strong>Tag:</strong> {code.tag} <br />
                <strong>Hash:</strong> {code.hash} <br />
                <strong>Pull Request:</strong> {code.pullRequest} <br />
              </div>
              <div className="mb-4">
                <strong>Run Script:</strong> {scripts.runScript} <br />
                <strong>Post-processing:</strong> {scripts.postProcessing} <br />
                <strong>Links:</strong> {scripts.links} <br />
                <strong>Notes:</strong> {scripts.notes} <br />
              </div>
              <button
                type="button"
                className="bg-gray-900 text-white px-6 py-2 rounded font-semibold mr-2 hover:bg-gray-800"
                onClick={() => alert('Submitted!')}
              >
                Submit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Submit;
