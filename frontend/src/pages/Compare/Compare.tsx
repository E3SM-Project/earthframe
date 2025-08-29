import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SelectedSimulationChipList from '@/components/layout/SelectedSimulationsChipList';
import { ComparisonAI } from '@/pages/Compare/ComparisonAI';
import type { Simulation } from '@/types/index';

interface CompareSimulationsProps {
  simulations: Simulation[];
  selectedSimulationIds: string[];
  setSelectedSimulationIds: (ids: string[]) => void;
  selectedSimulations: Simulation[];
}

const CompareSimulations = ({
  simulations,
  selectedSimulationIds,
  setSelectedSimulationIds,
  selectedSimulations,
}: CompareSimulationsProps) => {
  const HIDDEN_KEY = 'compare_hidden_cols';
  const navigate = useNavigate();
  const handleButtonClick = () => navigate('/Browse');

  const simHeaders = selectedSimulationIds.map((id) => {
    const sim = selectedSimulations.find((s) => s.id === id);

    return sim?.name || id;
  });

  const getSimProp = <K extends keyof Simulation>(
    id: string,
    prop: K,
    fallback: Simulation[K] | '',
  ): Simulation[K] => {
    const sim = selectedSimulations.find((s) => s.id === id);

    return (sim?.[prop] ?? fallback) as Simulation[K];
  };

  const metrics = {
    configuration: [
      {
        label: 'Simulation Name',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'name', '')),
      },
      {
        label: 'Model Start Date',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'modelStartDate', '')),
      },
      {
        label: 'Run Start Date',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'modelStartDate', '')),
      },
      {
        label: 'Repo',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'externalRepoUrl', '')),
      },
      {
        label: 'Branch',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'branch', '')),
      },
      {
        label: 'Tag',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'versionTag', '')),
      },
      {
        label: 'Campaign',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'campaignId', '')),
      },
      {
        label: 'Compset',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'compset', '')),
      },
      {
        label: 'Resolution',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'gridName', '')),
      },
      {
        label: 'Machine',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'machineId', '')),
      },
      {
        label: 'Compiler',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'compiler', '')),
      },
    ],
    keyFeatures: [
      {
        label: 'Key Features',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'keyFeatures', '')),
      },
    ],
    knownIssues: [
      {
        label: 'Known Issues',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'knownIssues', '')),
      },
    ],
    notes: [
      {
        label: 'Notes',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'notes', '')),
      },
    ],
    locations: [
      {
        label: 'Run Scripts',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'runScriptPath', [])),
      },
      {
        label: 'Output Location',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'outputPath', [])),
      },
      {
        label: 'Archive Location',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'archivePath', [])),
      },
      {
        label: 'Diagnostic Links',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'diagnosticLinks', [])),
      },
      {
        label: 'PACE Links',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'paceLinks', [])),
      },
    ],
  };

  const [order, setOrder] = useState(selectedSimulationIds.map((_, i) => i));
  const [headers, setHeaders] = useState(simHeaders);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
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

  const handleShow = (hiddenId: string) => {
    setHidden((prev) => prev.filter((id) => id !== hiddenId));
  };

  const handleHide = (colIdx: number) => {
    const simId = selectedSimulationIds[colIdx];
    if (!hidden.includes(simId)) {
      setHidden((prev) => [...prev, simId]);
    }
  };

  const handleRemove = (colIdx: number) => {
    const simId = selectedSimulationIds[colIdx];
    setSelectedSimulationIds(selectedSimulationIds.filter((id) => id !== simId));
  };

  const handleDragStart = (colIdx: number) => {
    dragCol.current = colIdx;
  };

  const handleDragOver = (e: React.DragEvent, colIdx: number) => {
    e.preventDefault();
    setDragOverIdx(colIdx);
  };

  const handleDragLeave = () => {
    setDragOverIdx(null);
  };

  const handleDrop = (colIdx: number) => {
    if (dragCol.current === null || dragCol.current === colIdx) {
      setDragOverIdx(null);
      dragCol.current = null;
      return;
    }
    const newOrder = [...order];
    const fromIdx = newOrder.indexOf(dragCol.current);
    const toIdx = newOrder.indexOf(colIdx);
    newOrder.splice(toIdx, 0, newOrder.splice(fromIdx, 1)[0]);
    setOrder(newOrder);
    setDragOverIdx(null);
    dragCol.current = null;
  };

  useEffect(() => {
    setHidden((prev) => prev.filter((id) => selectedSimulationIds.includes(id)));
  }, [selectedSimulationIds]);

  React.useEffect(() => {
    localStorage.setItem(HIDDEN_KEY, JSON.stringify(hidden));
  }, [hidden]);

  React.useEffect(() => {
    setHeaders(
      selectedSimulationIds.map((id) => selectedSimulations.find((s) => s.id === id)?.name || id),
    );
    setOrder(selectedSimulationIds.map((_, i) => i));
  }, [selectedSimulationIds, selectedSimulations]);

  if (selectedSimulationIds.length === 0) {
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
    <div className="w-full bg-white">
      <div className="mx-auto max-w-[1440px] px-6 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Compare Simulations</h1>
          <p className="text-gray-600">
            Compare multiple simulations side by side. Drag columns to reorder, hide or remove
            simulations, and expand sections for detailed metrics.
          </p>
        </header>

        <section
          aria-label="Show hidden simulations"
          className={`mb-2 flex gap-2 items-center min-h-[2.25rem]${hidden.length === 0 ? ' invisible' : ''}`}
          style={{ height: '2.25rem' }}
        >
          {hidden.length > 0 && (
            <>
              <span className="text-sm text-gray-600">Hidden:</span>
              {hidden.map((hiddenId) => {
                const idx = selectedSimulationIds.indexOf(hiddenId);
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

        {/* Single table container with horizontal scroll */}
        <div className="overflow-x-auto">
          <div className="min-w-[72rem]">
            {/* Table header */}
            <div className="flex border-b bg-gray-100 font-semibold text-sm">
              <div className="sticky-col shrink-0 w-48 px-4 py-2 border-r z-10 bg-white">
                Metric
              </div>
              {order
                .filter((colIdx) => !hidden.includes(selectedSimulationIds[colIdx]))
                .map((colIdx) => (
                  <div
                    key={colIdx}
                    className="flex-1 min-w-[12rem] px-4 py-2 text-center cursor-move relative group"
                    draggable
                    onDragStart={() => handleDragStart(colIdx)}
                    onDragOver={(e) => handleDragOver(e, colIdx)}
                    onDragLeave={() => handleDragLeave()}
                    onDrop={() => handleDrop(colIdx)}
                    style={{
                      opacity: dragCol.current === colIdx ? 0.5 : 1,
                      zIndex: dragOverIdx === colIdx ? 20 : undefined,
                    }}
                  >
                    <span className="text-lg font-semibold">{headers[colIdx]}</span>
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
            {/* Table body */}
            {(() => {
              // Flatten all metrics into a single array with sectionKey
              const allRows: { label: string; values: unknown[]; sectionKey: string }[] = [];
              Object.entries(metrics).forEach(([sectionKey, rows]) => {
                rows.forEach((row) => {
                  allRows.push({ ...row, sectionKey });
                });
              });

              let lastSection: string | null = null;
              return allRows.map((row, rowIdx) => {
                const showSection = row.sectionKey !== lastSection ? row.sectionKey : null;
                lastSection = row.sectionKey;

                return (
                  <React.Fragment key={rowIdx}>
                    {showSection && (
                      <div className="flex border-t bg-gray-50 items-center">
                        <div className="sticky-col w-48 px-4 py-2 font-semibold border-r text-base bg-white z-10">
                          {row.sectionKey
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, (str) => str.toUpperCase())}
                        </div>
                        <div className="flex-1"></div>
                      </div>
                    )}
                    <div className="flex border-t">
                      <div className="sticky-col w-48 px-4 py-2 font-medium text-sm border-r bg-white z-10">
                        {row.label}
                      </div>
                      {order
                        .filter((colIdx) => !hidden.includes(selectedSimulationIds[colIdx]))
                        .map((colIdx) => {
                          const value = row.values[colIdx];
                          // Render links for locations section
                          if (row.sectionKey === 'locations' && Array.isArray(value)) {
                            return (
                              <div key={colIdx} className="flex-1 min-w-[12rem] px-4 py-2 text-sm">
                                {value.length > 0 ? (
                                  value.map(
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
                                )}
                              </div>
                            );
                          }
                          return (
                            <div key={colIdx} className="flex-1 min-w-[12rem] px-4 py-2 text-sm">
                              {Array.isArray(value)
                                ? value.join(', ')
                                : value || <span className="text-gray-400">—</span>}
                            </div>
                          );
                        })}
                    </div>
                  </React.Fragment>
                );
              });
            })()}

            <ComparisonAI
              selectedSimulations={selectedSimulations.filter((sim) =>
                selectedSimulationIds.includes(sim.id),
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareSimulations;
