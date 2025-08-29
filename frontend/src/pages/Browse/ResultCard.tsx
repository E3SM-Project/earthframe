import {
  BadgeCheck,
  ChevronDown,
  CircleDashed,
  Clock,
  FlaskConical,
  GitBranch,
  Lightbulb,
  MoreHorizontal,
  Rocket,
  Server,
  Sigma,
  Tag,
  X,
} from 'lucide-react';
import { useState } from 'react';

import type { Simulation } from '@/App.tsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface ResultCardProps {
  simulation: Simulation;
  selected: boolean;
  selectedSimulationIds: Simulation[];
  onSelect: (sim: Simulation) => void;
  onViewDetails: (id: string) => void;
}

const ResultCard = ({ simulation, selected, onSelect, onViewDetails }: ResultCardProps) => {
  const [showAllVariables, setShowAllVariables] = useState(false);

  const startStr = simulation.modelStartDate
    ? new Date(simulation.modelStartDate).toISOString().slice(0, 10)
    : 'N/A';
  const endStr = simulation.modelEndDate
    ? new Date(simulation.modelEndDate).toISOString().slice(0, 10)
    : 'N/A';

  return (
    <Card className="w-full h-full p-0 flex flex-col shadow-md rounded-lg border">
      <div className="flex flex-col sm:flex-row items-start gap-4 p-4">
        <Checkbox
          checked={selected}
          onCheckedChange={() => onSelect(simulation)}
          aria-label="Select for comparison"
          className="mt-1"
          style={{ width: 24, height: 24 }}
        />
        <div className="flex-1 w-full min-w-0 max-w-2xl">
          <CardHeader className="p-0 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="font-semibold text-lg break-words">{simulation.name}</span>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1
                  ${
                    simulation.status === 'complete'
                      ? 'bg-green-50 text-green-900 border border-green-300'
                      : simulation.status === 'running'
                        ? 'bg-yellow-50 text-yellow-900 border border-yellow-300'
                        : simulation.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-200 text-gray-600'
                  }
                `}
              >
                {simulation.status === 'complete' && <BadgeCheck className="w-4 h-4" />}
                {simulation.status === 'running' && <Rocket className="w-4 h-4" />}
                {simulation.status === 'failed' && <X className="w-4 h-4" />}
                {simulation.status === 'not-started' && <CircleDashed className="w-4 h-4" />}
                {simulation.status === 'not-started'
                  ? 'Not Started'
                  : simulation.status.charAt(0).toUpperCase() + simulation.status.slice(1)}
              </span>
            </div>
          </CardHeader>

          <CardContent
            className="p-0"
            style={{
              minHeight: '340px', // adjust as needed for consistent bottom alignment
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* One metadata item per line with bold labels */}
            <dl className="space-y-1 text-sm mb-2">
              <div className="flex items-start gap-2">
                <dt className="flex items-center gap-2 whitespace-nowrap font-semibold text-gray-800">
                  <Rocket className="w-4 h-4" /> Campaign:
                </dt>
                <dd className="break-words font-normal text-gray-600">{simulation.campaignId}</dd>
              </div>

              <div className="flex items-start gap-2">
                <dt className="flex items-center gap-2 whitespace-nowrap font-semibold text-gray-800">
                  <Lightbulb className="w-4 h-4" /> Experiment:
                </dt>
                <dd className="break-words font-normal text-gray-600">
                  {simulation.experimentTypeId}
                </dd>
              </div>

              <div className="flex items-start gap-2">
                <dt className="flex items-center gap-2 whitespace-nowrap font-semibold text-gray-800">
                  <Clock className="w-4 h-4" /> Model Run Dates:
                </dt>
                <dd className="break-words font-normal text-gray-600">
                  {startStr} {'\u2192'} {endStr}
                </dd>
              </div>
            </dl>

            {/* Variables row - remove mt-1 for vertical alignment */}
            <div className="flex flex-wrap gap-2 items-center mb-4">
              <span className="text-sm font-medium flex items-center gap-1">
                <Sigma className="w-4 h-4" />
                Variables ({simulation.variables.length}):
              </span>
              {simulation.variables.length <= 3 || showAllVariables ? (
                simulation.variables.map((v) => (
                  <Badge key={v} variant="outline" className="text-xs px-2 py-1">
                    {v}
                  </Badge>
                ))
              ) : (
                <>
                  {simulation.variables.slice(0, 3).map((v) => (
                    <Badge key={v} variant="outline" className="text-xs px-2 py-1">
                      {v}
                    </Badge>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs px-2 py-1 border border-dashed border-gray-300 bg-gray-50 hover:border-gray-600 hover:bg-gray-100 flex items-center"
                    style={{
                      minWidth: 'auto',
                      height: 'auto',
                      padding: '0.25rem 0.5rem',
                    }}
                    onClick={() => setShowAllVariables(true)}
                  >
                    <MoreHorizontal className="w-4 h-4 text-gray-500 mr-1" />
                    <span className="text-gray-600">{simulation.variables.length - 3}</span>
                  </Button>
                </>
              )}
              {simulation.variables.length > 3 && showAllVariables && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs px-2 py-1 border border-dashed border-gray-300 bg-gray-50 hover:border-gray-600 hover:bg-gray-100"
                  style={{ minWidth: 'auto', height: 'auto', padding: '0.25rem 0.5rem' }}
                  onClick={() => setShowAllVariables(false)}
                >
                  <span className="underline text-blue-700">Show Less</span>
                </Button>
              )}
            </div>

            <div className="w-full my-2 border-t border-gray-200" />

            {/* Grid & Machine grouping with divider and lighter value color */}
            <div className="flex flex-wrap gap-4 items-center mb-4 mt-2 text-xs text-gray-700">
              <div className="flex items-center gap-1">
                <FlaskConical className="w-3 h-3 text-gray-800" />
                <span className="font-semibold">Grid:</span>
                <span className="font-normal ml-1 text-gray-500">{simulation.gridName}</span>
              </div>
              <span className="h-4 w-px bg-gray-300 mx-2" />
              <div className="flex items-center gap-1">
                <Server className="w-3 h-3 text-gray-800" />
                <span className="font-semibold">Machine:</span>
                <span className="font-normal ml-1 text-gray-500">{simulation.machine.name}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center mb-4 mt-2">
              <Badge
                variant="secondary"
                className="flex items-center gap-1 text-sm px-2 py-1 border border-gray-300"
              >
                <Tag className="w-4 h-4" />
                Tag:
                <span className="text-xs px-1 py-1 ml-1">{simulation.versionTag}</span>
              </Badge>
              <Badge
                className={`text-xs px-2 py-1 ${
                  simulation.simulationType === 'production'
                    ? 'bg-green-600 text-white'
                    : simulation.simulationType === 'master'
                      ? 'bg-blue-600 text-white'
                      : 'bg-yellow-400 text-black'
                }`}
                style={{
                  backgroundColor:
                    simulation.simulationType === 'production'
                      ? '#16a34a'
                      : simulation.simulationType === 'master'
                        ? '#2563eb'
                        : '#facc15',
                  color:
                    simulation.simulationType === 'production' ||
                    simulation.simulationType === 'master'
                      ? '#fff'
                      : '#000',
                }}
              >
                {simulation.simulationType === 'production' ? (
                  <>
                    <BadgeCheck className="w-4 h-4 mr-1" /> Production Run
                  </>
                ) : simulation.simulationType === 'master' ? (
                  <>
                    <GitBranch className="w-4 h-4 mr-1" /> Master Run
                  </>
                ) : (
                  <>
                    <FlaskConical className="w-4 h-4 mr-1" /> Experimental Run
                  </>
                )}
              </Badge>
            </div>

            <div style={{ height: '6px' }} />

            <div className="mb-4 border rounded-lg bg-muted/40">
              <details className="w-full group">
                <summary className="flex justify-between items-center cursor-pointer px-2 py-2 rounded hover:bg-muted transition group-open:border-b group-open:border-muted-foreground">
                  More Details
                  <ChevronDown className="w-4 h-4 ml-2" />
                </summary>
                <div className="mt-2 px-2 py-2 text-sm text-muted-foreground">
                  <span className="font-medium">Description:</span>{' '}
                  {simulation.description || 'No description.'}
                </div>
              </details>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 justify-end">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-40"
                onClick={() => onViewDetails(simulation.id)}
              >
                View All Details
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
};

export default ResultCard;
