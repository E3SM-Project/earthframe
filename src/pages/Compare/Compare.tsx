import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import './Compare.css';
import React, { useState, useRef } from 'react';

const metrics = {
  configuration: [
    {
      label: 'Simulation Date',
      values: ['2024-01-01', '2024-02-15', '2024-03-10', '2024-04-05', '2024-05-20'],
    },
    { label: 'Model Version', values: ['v2.0', 'v2.1', 'v2.2', 'v2.3', 'v2.4'] },
    { label: 'Compset', values: ['A', 'B', 'C', 'D', 'E'] },
  ],
  knownIssues: [{ label: 'Known Bug 1', values: ['✅', '❌', '✅', '❌', '✅'] }],
};

const simHeaders = ['Sim A', 'Sim B', 'Sim C', 'Sim D', 'Sim E'];

export default function CompareSimulations() {
  const [order, setOrder] = useState(simHeaders.map((_, i) => i));
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [headers, setHeaders] = useState(simHeaders);
  const [hidden, setHidden] = useState<number[]>([]);
  const dragCol = useRef<number | null>(null);

  const handleDragStart = (idx: number) => {
    dragCol.current = idx;
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragCol.current === null || dragCol.current === idx) return;
    setDragOverIdx(idx);
  };

  const handleDragLeave = (e: React.DragEvent, idx: number) => {
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
    const newHeaders = headers.filter((_, i) => i !== order[idx]);
    // Remove the idx from order and re-map order to new indices
    const removedIdx = order[idx];
    const newOrder = order.filter((i) => i !== removedIdx).map((i) => (i > removedIdx ? i - 1 : i));
    setHeaders(newHeaders);
    setOrder(newOrder);
    setHidden((prev) =>
      prev.filter((i) => i !== removedIdx).map((i) => (i > removedIdx ? i - 1 : i)),
    );
  };

  const handleHide = (idx: number) => {
    setHidden((prev) => [...prev, order[idx]]);
  };

  const handleShow = (idx: number) => {
    setHidden((prev) => prev.filter((i) => i !== idx));
  };

  return (
    <div className="max-w-screen-2xl mx-auto p-4 overflow-x-auto">
      <section
        aria-label="Show hidden simulations"
        className={`mb-2 flex gap-2 items-center min-h-[2.25rem]${hidden.length === 0 ? ' invisible' : ''}`}
        style={{ height: '2.25rem' }}
      >
        {hidden.length > 0 && (
          <>
            <span className="text-sm text-gray-600">Hidden:</span>
            {hidden.map((hiddenIdx) => {
              const headerName = headers[hiddenIdx];
              return (
                <button
                  key={hiddenIdx}
                  className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-blue-200 transition"
                  onClick={() => handleShow(hiddenIdx)}
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
            .filter((colIdx) => !hidden.includes(colIdx))
            .map((colIdx) => (
              <div
                key={colIdx}
                className="flex-1 min-w-[12rem] px-4 py-2 text-center cursor-move relative group"
                draggable
                onDragStart={() => handleDragStart(colIdx)}
                onDragOver={(e) => handleDragOver(e, colIdx)}
                onDragLeave={(e) => handleDragLeave(e, colIdx)}
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
      <Accordion type="multiple" className="w-full space-y-0" defaultValue={Object.keys(metrics)}>
        {Object.entries(metrics).map(([sectionKey, rows]) => (
          <div key={sectionKey}>
            <AccordionItem value={sectionKey}>
              <div
                className="flex w-full min-w-[calc(12rem*5+12rem)]"
                style={{ minWidth: '72rem' }}
              >
                {/* Only left column has the accordion trigger */}
                <AccordionTrigger className="sticky-col w-48 px-4 py-2 text-base font-semibold text-left border-r border-t bg-white z-10">
                  {sectionKey.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
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
                        .filter((colIdx) => !hidden.includes(colIdx))
                        .map((colIdx) => (
                          <div
                            key={colIdx}
                            className="flex-1 min-w-[12rem] px-4 py-2 border-t text-sm"
                          >
                            {row.values[colIdx]}
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
    </div>
  );
}
