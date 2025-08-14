import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import './Compare.css';
import React, { useEffect, useRef, useState } from 'react';
import { Simulation } from '@/App';
import { ComparisonAI } from './ComparisonAI';
import SelectedSimulationChipList from '@/components/layout/SelectedSimulationsChipList';
import { useNavigate } from 'react-router-dom';

interface CompareSimulationsProps {
  data: Simulation[];
  selectedDataIds: string[];
  setSelectedDataIds: (ids: string[]) => void;
  selectedData: Simulation[];
}

const CompareSimulations = ({
  data,
  selectedDataIds,
  setSelectedDataIds,
  selectedData,
}: CompareSimulationsProps) => {
  // Persist hidden state in localStorage by a key unique to this page/component
  const HIDDEN_KEY = 'compare_hidden_cols';

  const navigate = useNavigate();
  const handleButtonClick = () => {
    navigate('/browse');
  };

  // Dynamically generate headers from selectedDataIds and selectedData
  const simHeaders = selectedDataIds.map((id) => {
    const sim = selectedData.find((s) => s.id === id);
    return sim?.name || id;
  });

  // Build metrics from Simulation attributes
  const metrics = {
    configuration: [
      {
        label: 'Simulation Name',
        values: selectedDataIds.map((id) => selectedData.find((sim) => sim.id === id)?.name || ''),
      },
      {
        label: 'Model Start Date',
        values: selectedDataIds.map(
          (id) => selectedData.find((sim) => sim.id === id)?.modelStartDate || '',
        ),
      },
      {
        label: 'Run Start Date',
        values: selectedDataIds.map(
          (id) => selectedData.find((sim) => sim.id === id)?.runStartDate || '',
        ),
      },
      {
        label: 'Repo',
        values: selectedDataIds.map((id) => selectedData.find((sim) => sim.id === id)?.repo || ''),
      },
      {
        label: 'Branch',
        values: selectedDataIds.map(
          (id) => selectedData.find((sim) => sim.id === id)?.branch || '',
        ),
      },
      {
        label: 'Tag',
        values: selectedDataIds.map((id) => selectedData.find((sim) => sim.id === id)?.tag || ''),
      },
      {
        label: 'Campaign',
        values: selectedDataIds.map(
          (id) => selectedData.find((sim) => sim.id === id)?.campaign || '',
        ),
      },
      {
        label: 'Compset',
        values: selectedDataIds.map(
          (id) => selectedData.find((sim) => sim.id === id)?.compset || '',
        ),
      },
      {
        label: 'Resolution',
        values: selectedDataIds.map(
          (id) => selectedData.find((sim) => sim.id === id)?.gridName || '',
        ),
      },
      {
        label: 'Machine',
        values: selectedDataIds.map(
          (id) => selectedData.find((sim) => sim.id === id)?.machine || '',
        ),
      },
      {
        label: 'Compiler',
        values: selectedDataIds.map(
          (id) => selectedData.find((sim) => sim.id === id)?.compiler || '',
        ),
      },
    ],

    keyFeatures: [
      {
        label: 'Key Features',
        values: selectedDataIds.map(
          (id) => selectedData.find((sim) => sim.id === id)?.keyFeatures || '',
        ),
      },
    ],
    knownIssues: [
      {
        label: 'Known Issues',
        values: selectedDataIds.map(
          (id) => selectedData.find((sim) => sim.id === id)?.knownIssues || '',
        ),
      },
    ],
    notes: [
      {
        label: 'Notes',
        values: selectedDataIds.map((id) => selectedData.find((sim) => sim.id === id)?.notes || ''),
      },
    ],
    locations: [
      {
        label: 'Run Scripts',
        values: selectedDataIds.map(
          (id) => selectedData.find((sim) => sim.id === id)?.runScripts || [],
        ),
      },
      {
        label: 'Output Location',
        values: selectedDataIds.map(
          (id) => selectedData.find((sim) => sim.id === id)?.outputLocation || [],
        ),
      },
      {
        label: 'Archive Location',
        values: selectedDataIds.map(
          (id) => selectedData.find((sim) => sim.id === id)?.archiveLocation || [],
        ),
      },
      {
        label: 'Diagnostic Links',
        values: selectedDataIds.map(
          (id) => selectedData.find((sim) => sim.id === id)?.diagnosticLinks || [],
        ),
      },
      {
        label: 'PACE Links',
        values: selectedDataIds.map(
          (id) => selectedData.find((sim) => sim.id === id)?.paceLinks || [],
        ),
      },
    ],
  };

  const [order, setOrder] = useState(selectedDataIds.map((_, i) => i));
  const [headers, setHeaders] = useState(simHeaders);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Load hidden state from localStorage on mount
  const [hidden, setHidden] = useState<string[]>(() => {
    const stored = localStorage.getItem(HIDDEN_KEY);
    try {
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const dragCol = useRef<number | null>(null);

  useEffect(() => {
    setHidden((prev) => prev.filter((id) => selectedDataIds.includes(id)));
  }, [selectedDataIds]);

  // Save hidden state to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem(HIDDEN_KEY, JSON.stringify(hidden));
  }, [hidden]);

  // Keep headers in sync with selectedDataIds and selectedData
  React.useEffect(() => {
    setHeaders(
      selectedDataIds.map((id) => {
        const sim = selectedData.find((s) => s.id === id);
        return sim?.name || id;
      }),
    );
    setOrder(selectedDataIds.map((_, i) => i));
  }, [selectedDataIds, selectedData]);

  const handleDragStart = (idx: number) => {
    dragCol.current = idx;
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragCol.current === null || dragCol.current === idx) return;
    setDragOverIdx(idx);
  };

  const handleDragLeave = (idx: number) => {
    if (dragOverIdx === idx) setDragOverIdx(null);
  };

  const handleDrop = (idx: number) => {
    if (dragCol.current === null || dragCol.current === idx) return;
    const newOrder = [...order];
    const [removed] = newOrder.splice(dragCol.current, 1);
    newOrder.splice(idx, 0, removed);
    setOrder(newOrder);
    dragCol.current = null;
    setDragOverIdx(null);
  };

  const handleRemove = (idx: number) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${headers[order[idx]]}"? This action cannot be undone.`,
    );
    if (!confirmed) return;
    // Remove from headers and update order
    const removedIdx = order[idx];
    const removedId = selectedDataIds[removedIdx];
    const newHeaders = headers.filter((_, i) => i !== removedIdx);
    const newOrder = order.filter((i) => i !== removedIdx).map((i) => (i > removedIdx ? i - 1 : i));
    setHeaders(newHeaders);
    setOrder(newOrder);
    setHidden((prev) => prev.filter((id) => id !== removedId));
    // Update selectedDataIds to remove the corresponding id
    setSelectedDataIds(selectedDataIds.filter((_, i) => i !== removedIdx));
  };

  const handleHide = (idx: number) => {
    const simId = selectedDataIds[order[idx]];
    setHidden((prev) => [...prev, simId]);
  };

  const handleShow = (simId: string) => {
    setHidden((prev) => prev.filter((id) => id !== simId));
  };

  if (selectedDataIds.length === 0) {
    return (
      <div className="max-w-screen-2xl mx-auto p-8 text-center text-gray-600">
        <p className="text-lg mb-4">No simulations selected for comparison.</p>
        <a
          href="/browse"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Go to Browse Page
        </a>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full">
      <div className="flex flex-col md:flex-row w-full gap-8 md:max-w-[70%]">
        <div className="w-full">
          <header className="mb-3">
            <h1 className="text-3xl font-bold mb-2 mt-6">Compare Simulations</h1>
            <p className="text-gray-600 max-w-6xl">
              Compare multiple simulations side by side. Drag columns to reorder, hide or remove
              simulations, and expand sections for detailed metrics.
            </p>
          </header>

          <SelectedSimulationChipList
            data={data}
            buttonText="Change Selection"
            handleButtonClick={handleButtonClick}
            selectedDataIds={selectedDataIds}
            setSelectedDataIds={setSelectedDataIds}
          />

          <section
            aria-label="Show hidden simulations"
            className={`mb-2 flex gap-2 items-center min-h-[2.25rem]${hidden.length === 0 ? ' invisible' : ''}`}
            style={{ height: '2.25rem' }}
          >
            {hidden.length > 0 && (
              <>
                <span className="text-sm text-gray-600">Hidden:</span>
                {hidden.map((hiddenId) => {
                  const idx = selectedDataIds.indexOf(hiddenId);
                  const headerName = headers[idx] ?? hiddenId;
                  return (
                    <button
                      key={hiddenId}
                      className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-blue-200 transition"
                      onClick={() => handleShow(hiddenId)}
                      type="button"
                    >
                      {headerName} <span className="ml-1 text-blue-600 font-bold">+</span>
                    </button>
                  );
                })}
                <button
                  className="ml-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  onClick={() => setHidden([])}
                  type="button"
                >
                  Unhide All
                </button>
              </>
            )}
          </section>

          {/* Header row */}
          <div
            className="flex w-full min-w-[calc(12rem*5+12rem)] border-b bg-gray-100 font-semibold text-sm"
            style={{ minWidth: '72rem' }}
          >
            <div className="sticky-col shrink-0 w-48 px-4 py-2 border-r">Metric</div>
            <div className="flex flex-1" style={{ minWidth: '60rem' }}>
              {order
                .filter((colIdx) => !hidden.includes(selectedDataIds[colIdx]))
                .map((colIdx) => (
                  <div
                    key={colIdx}
                    className="flex-1 min-w-[12rem] px-4 py-2 text-center cursor-move relative group"
                    draggable
                    onDragStart={() => handleDragStart(colIdx)}
                    onDragOver={(e) => handleDragOver(e, colIdx)}
                    onDragLeave={() => handleDragLeave(colIdx)}
                    onDrop={() => handleDrop(colIdx)}
                    style={{
                      opacity: dragCol.current === colIdx ? 0.5 : 1,
                      zIndex: dragOverIdx === colIdx ? 20 : undefined,
                    }}
                  >
                    <span>{headers[colIdx]}</span>
                    <button
                      type="button"
                      aria-label={`Hide ${headers[colIdx]}`}
                      className="absolute top-1 right-8 text-gray-400 hover:text-yellow-600 bg-white rounded-full w-6 h-6 flex items-center justify-center border border-gray-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleHide(order.findIndex((v) => v === colIdx));
                      }}
                      tabIndex={0}
                      title="Hide"
                    >
                      &minus;
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${headers[colIdx]}`}
                      className="absolute top-1 right-2 text-gray-400 hover:text-red-600 bg-white rounded-full w-6 h-6 flex items-center justify-center border border-gray-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(order.findIndex((v) => v === colIdx));
                      }}
                      tabIndex={0}
                      title="Remove"
                    >
                      ×
                    </button>
                    {dragOverIdx === colIdx &&
                      dragCol.current !== null &&
                      dragCol.current !== colIdx && (
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            border: '2px dashed #2563eb',
                            borderRadius: 6,
                            boxSizing: 'border-box',
                          }}
                        />
                      )}
                  </div>
                ))}
            </div>
          </div>

          {/* Accordion rows */}
          <Accordion
            type="multiple"
            className="w-full space-y-0"
            defaultValue={Object.keys(metrics)}
          >
            {Object.entries(metrics).map(([sectionKey, rows]) => (
              <div key={sectionKey}>
                <AccordionItem value={sectionKey}>
                  <div
                    className="flex w-full min-w-[calc(12rem*5+12rem)]"
                    style={{ minWidth: '72rem' }}
                  >
                    {/* Only left column has the accordion trigger */}
                    <AccordionTrigger className="sticky-col w-48 px-4 py-2 text-base font-semibold text-left border-r border-t bg-white z-10">
                      {sectionKey
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, (str) => str.toUpperCase())}
                    </AccordionTrigger>
                  </div>

                  <AccordionContent>
                    {rows.map((row, i) => (
                      <div
                        key={i}
                        className="flex w-full min-w-[calc(12rem*5+12rem)]"
                        style={{ minWidth: '72rem' }}
                      >
                        <div className="sticky-col w-48 px-4 py-2 font-medium text-sm border-r border-t bg-white">
                          {row.label}
                        </div>
                        <div className="flex flex-1" style={{ minWidth: '60rem' }}>
                          {order
                            .filter((colIdx) => !hidden.includes(selectedDataIds[colIdx]))
                            .map((colIdx) => (
                              <div
                                key={colIdx}
                                className="flex-1 min-w-[12rem] px-4 py-2 border-t text-sm"
                              >
                                {/* Render links as clickable with label for locations section */}
                                {sectionKey === 'locations' && Array.isArray(row.values[colIdx]) ? (
                                  row.values[colIdx].length > 0 ? (
                                    row.values[colIdx].map(
                                      (linkObj: { url: string; label?: string }, idx: number) => (
                                        <a
                                          key={idx}
                                          href={linkObj.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 underline mr-2 break-all"
                                        >
                                          {linkObj.label || linkObj.url}
                                        </a>
                                      ),
                                    )
                                  ) : (
                                    <span className="text-gray-400">—</span>
                                  )
                                ) : Array.isArray(row.values[colIdx]) ? (
                                  row.values[colIdx].join(', ')
                                ) : (
                                  row.values[colIdx]
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </div>
            ))}
          </Accordion>

          {/* ComparisonAI section */}
          <ComparisonAI
            selectedSimulations={selectedData.filter((sim) => selectedDataIds.includes(sim.id))}
          />
        </div>
      </div>
    </div>
  );
};

export default CompareSimulations;
