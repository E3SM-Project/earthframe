import { ChevronDown, ChevronRight } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SelectedSimulationChipList from '@/components/layout/SelectedSimulationsChipList';
import { ComparisonAI } from '@/pages/Compare/ComparisonAI';
import type { Simulation } from '@/types/index';
import { formatDate, getSimulationDuration } from '@/utils/utils';

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
        label: 'Case Name',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'caseName', '')),
      },
      {
        label: 'Model Version',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'versionTag', '')),
      },
      {
        label: 'Compset',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'compset', '')),
      },
      {
        label: 'Grid Name',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'gridName', '')),
      },
      {
        label: 'Grid Resolution',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'gridResolution', '')),
      },
      {
        label: 'Initialization Type',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'initializationType', '')),
      },
      {
        label: 'Compiler',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'compiler', '')),
      },
      {
        label: 'Parent Simulation ID',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'parentSimulationId', '')),
      },
    ],
    modelSetup: [
      {
        label: 'Simulation Type',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'simulationType', '')),
      },
      {
        label: 'Status',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'status', '')),
      },
      {
        label: 'Campaign ID',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'campaignId', '')),
      },
      {
        label: 'Experiment Type ID',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'experimentTypeId', '')),
      },
      {
        label: 'Machine Name',
        values: selectedSimulationIds.map((id) => {
          const sim = selectedSimulations.find((s) => s.id === id);
          return sim?.machine?.name ?? '';
        }),
      },
      {
        label: 'Variables',
        values: selectedSimulationIds.map((id) => {
          const sim = selectedSimulations.find((s) => s.id === id);
          return Array.isArray(sim?.variables) && sim.variables.length ? sim.variables : [];
        }),
      },
      {
        label: 'Branch',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'branch', '')),
      },
    ],
    timeline: [
      {
        label: 'Model Start',
        values: selectedSimulationIds.map((id) => {
          const date = getSimProp(id, 'modelStartDate', '');
          return date ? formatDate(date as string) : '—';
        }),
      },
      {
        label: 'Model End',
        values: selectedSimulationIds.map((id) => {
          const date = getSimProp(id, 'modelEndDate', '');
          return date ? formatDate(date as string) : '—';
        }),
      },
      {
        label: 'Duration',
        values: selectedSimulationIds.map((id) => {
          const start = getSimProp(id, 'modelStartDate', '');
          const end = getSimProp(id, 'modelEndDate', '');
          if (start && end) {
            try {
              return getSimulationDuration(start as string, end as string);
            } catch {
              return '—';
            }
          }
          return '—';
        }),
      },
      {
        label: 'Calendar Start',
        values: selectedSimulationIds.map((id) => {
          const date = getSimProp(id, 'calendarStartDate', '');
          return date ? formatDate(date as string) : '—';
        }),
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
    locations: [
      {
        label: 'Output Path',
        values: selectedSimulationIds.map((id) => {
          const outputPath = getSimProp(id, 'outputPath', '');
          return outputPath ? [outputPath] : [];
        }),
      },
      {
        label: 'Archive Paths',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'archivePaths', [])),
      },
      {
        label: 'Run Script Paths',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'runScriptPaths', [])),
      },
      {
        label: 'Batch Logs',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'batchLogPaths', [])),
      },
    ],
    diagnostics: [
      {
        label: 'Diagnostic Links',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'diagnosticLinks', [])),
      },
    ],
    performance: [
      {
        label: 'PACE Links',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'paceLinks', [])),
      },
    ],
    notes: [
      {
        label: 'Notes',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'notes', '')),
      },
    ],
    versionControl: [
      {
        label: 'Repository URL',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'externalRepoUrl', '')),
      },
      {
        label: 'Version/Tag',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'versionTag', '')),
      },
      {
        label: 'Commit Hash',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'gitHash', '')),
      },
      {
        label: 'Branch',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'branch', '')),
      },
      {
        label: 'Branch Time',
        values: selectedSimulationIds.map((id) => getSimProp(id, 'branchTime', '')),
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

  // Collapsible section state
  const defaultExpanded = ['configuration', 'modelSetup', 'timeline'];
  const allSectionKeys = Object.keys(metrics);
  const initialExpandedSections: Record<string, boolean> = {};
  allSectionKeys.forEach((section) => {
    initialExpandedSections[section] = defaultExpanded.includes(section);
  });
  const [expandedSections, setExpandedSections] =
    useState<Record<string, boolean>>(initialExpandedSections);

  const toggleSection = (sectionKey: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

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
            <div className="flex border-b font-semibold text-sm bg-gray-200">
              {/* Empty first column header for formatting */}
              <div className="sticky-col shrink-0 w-64 px-4 py-2 border-r z-10 bg-white"></div>
              {order
                .filter((colIdx) => !hidden.includes(selectedSimulationIds[colIdx]))
                .map((colIdx) => (
                  <div
                    key={colIdx}
                    className="flex-1 min-w-[12rem] px-4 py-2 text-center cursor-default relative group bg-gray-200"
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
                    <div className="flex items-center justify-center gap-1">
                      {/* Drag handle */}
                      <span
                        className="cursor-grab text-gray-400 hover:text-blue-600"
                        title="Drag to reorder"
                        style={{ display: 'inline-flex', alignItems: 'center', marginRight: '2px' }}
                        tabIndex={-1}
                        aria-label="Drag handle"
                      >
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                          <circle cx="5" cy="6" r="1.5" fill="currentColor" />
                          <circle cx="5" cy="10" r="1.5" fill="currentColor" />
                          <circle cx="5" cy="14" r="1.5" fill="currentColor" />
                          <circle cx="10" cy="6" r="1.5" fill="currentColor" />
                          <circle cx="10" cy="10" r="1.5" fill="currentColor" />
                          <circle cx="10" cy="14" r="1.5" fill="currentColor" />
                        </svg>
                      </span>
                      {/* Sim name clickable */}
                      <a
                        href={`/simulations/${selectedSimulationIds[colIdx]}`}
                        className="text-lg font-semibold text-blue-700 hover:underline cursor-pointer transition flex items-center gap-1"
                        tabIndex={0}
                        title={`Go to details for ${headers[colIdx]}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/simulations/${selectedSimulationIds[colIdx]}`);
                        }}
                      >
                        {headers[colIdx]}
                        <span className="ml-1 text-blue-500" aria-hidden="true">
                          {/* External link icon (↗) */}
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path
                              d="M5.5 10.5L10.5 5.5M10.5 5.5H6.5M10.5 5.5V9.5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </a>
                    </div>
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

            {/* Table body with collapsible sections */}
            {Object.entries(metrics).map(([sectionKey, rows]) => (
              <React.Fragment key={sectionKey}>
                <div
                  className={`flex border-t items-center transition-all ${
                    expandedSections[sectionKey]
                      ? 'border-l-2 border-blue-500 bg-gray-100'
                      : 'bg-gray-50'
                  }`}
                  style={{
                    ...(expandedSections[sectionKey]
                      ? { borderLeftWidth: '3px', borderTopWidth: '2px' }
                      : {}),
                  }}
                >
                  <button
                    className={`sticky-col w-64 px-4 py-3 font-semibold border-r text-lg uppercase tracking-wide bg-white z-10 flex items-center focus:outline-none ${
                      expandedSections[sectionKey] ? 'text-gray-900' : 'text-gray-600'
                    }`}
                    onClick={() => toggleSection(sectionKey)}
                    aria-expanded={expandedSections[sectionKey]}
                    aria-controls={`section-${sectionKey}`}
                    type="button"
                  >
                    <span
                      className="mr-2 transition-transform duration-200"
                      style={{
                        display: 'inline-block',
                        transform: expandedSections[sectionKey] ? 'rotate(90deg)' : 'rotate(0deg)',
                      }}
                    >
                      <ChevronRight size={16} strokeWidth={2} color="#4B5563" />
                    </span>
                    {sectionKey
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase())}
                  </button>
                </div>

                {expandedSections[sectionKey] && (
                  <div id={`section-${sectionKey}`}>
                    {rows.map((row, rowIdx) => (
                      <div key={rowIdx} className="flex border-t">
                        <div className="sticky-col w-64 px-4 py-2 font-medium text-sm border-r bg-white z-10">
                          {row.label}
                        </div>
                        {order
                          .filter((colIdx) => !hidden.includes(selectedSimulationIds[colIdx]))
                          .map((colIdx) => {
                            const value = row.values[colIdx];
                            // Render links for locations section
                            if (sectionKey === 'locations' && Array.isArray(value)) {
                              return (
                                <div
                                  key={colIdx}
                                  className="flex-1 min-w-[12rem] px-4 py-2 text-sm"
                                >
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
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}

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
