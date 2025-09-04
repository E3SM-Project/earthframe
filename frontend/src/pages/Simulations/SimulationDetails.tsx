import { format } from 'date-fns';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import SimulationPathCard from '@/pages/Simulations/SimulationPathCard';
import SimulationStatusBadge from '@/pages/Simulations/SimulationStatusBadge';
import SimulationTypeBadge from '@/pages/Simulations/SimulationTypeBadge';
import type { Simulation } from '@/types/index';
import { formatDate, getSimulationDuration } from '@/utils/utils';

// You likely already have this type elsewhere in your app
export interface ExternalUrl {
  label: string;
  url: string;
}

interface Props {
  simulation: Simulation;
  canEdit?: boolean; // admin privilege
}

const FieldRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-12 items-center gap-2">
    <Label className="col-span-3 md:col-span-2 text-xs text-muted-foreground">{label}</Label>
    <div className="col-span-9 md:col-span-10">{children}</div>
  </div>
);

const ReadonlyInput = ({ value, className }: { value?: string; className?: string }) => (
  <Input value={value || '—'} readOnly className={cn('h-8 text-sm', className)} />
);

export default function SimulationDetails({ simulation, canEdit = false }: Props) {
  const [activeTab, setActiveTab] = useState('summary');
  const [notes, setNotes] = useState(simulation.notesMarkdown || '');

  // TODO: Comments will be stored in the backend later
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([
    {
      id: 'c1',
      author: 'Jane Doe',
      date: '2024-02-15',
      text: 'The sea-ice diagnostics will be added later.',
    },
  ] as { id: string; author: string; date: string; text: string }[]);

  const addComment = () => {
    if (!newComment.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: `c${prev.length + 1}`,
        author: 'You',
        date: format(new Date(), 'yyyy-MM-dd'),
        text: newComment.trim(),
      },
    ]);
    setNewComment('');
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-8 space-y-6">
      {/* Title + Meta */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{simulation.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>Type:</span>
            <SimulationTypeBadge type={simulation.simulationType} />
            <span>•</span>
            <span>Status:</span>
            <SimulationStatusBadge status={simulation.status} />
            {simulation.versionTag && (
              <>
                <span>•</span>
                <span>Version/Tag:</span>
                <code className="rounded bg-muted px-2 py-0.5 text-xs">
                  {simulation.versionTag}
                </code>
              </>
            )}
            <span>•</span>
            <Link to="/browse" className="text-blue-600 hover:underline">
              Back to results
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/compare">Add to Compare</Link>
          </Button>
          <Button disabled={!canEdit}>Save</Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="outputs">Outputs & Logs</TabsTrigger>
          <TabsTrigger value="versionControl">Version Control</TabsTrigger>
        </TabsList>

        {/* SUMMARY TAB */}
        <TabsContent value="summary" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration (left) */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <FieldRow label="Simulation Name">
                  <ReadonlyInput value={simulation.name} />
                </FieldRow>
                <FieldRow label="Case Name">
                  <ReadonlyInput value={simulation.caseName} />
                </FieldRow>
                <FieldRow label="Model Version">
                  <ReadonlyInput value={simulation.versionTag ?? undefined} />
                </FieldRow>
                <FieldRow label="Compset">
                  <ReadonlyInput value={simulation.compset ?? undefined} />
                </FieldRow>
                <FieldRow label="Grid Name">
                  <ReadonlyInput value={simulation.gridName ?? undefined} />
                </FieldRow>
                <FieldRow label="Grid Resolution">
                  <ReadonlyInput value={simulation.gridResolution ?? undefined} />
                </FieldRow>
                <FieldRow label="Initialization Type">
                  <ReadonlyInput value={simulation.initializationType ?? undefined} />
                </FieldRow>
                <FieldRow label="Compiler">
                  <ReadonlyInput value={simulation.compiler ?? undefined} />
                </FieldRow>
                <FieldRow label="Parent Simulation ID">
                  <ReadonlyInput value={simulation.parentSimulationId ?? undefined} />
                </FieldRow>
              </CardContent>
            </Card>

            {/* Model Setup (Context) */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Model Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <FieldRow label="Simulation Type">
                  <ReadonlyInput value={simulation.simulationType} />
                </FieldRow>
                <FieldRow label="Status">
                  <ReadonlyInput value={simulation.status} />
                </FieldRow>
                <FieldRow label="Campaign ID">
                  <ReadonlyInput value={simulation.campaignId} />
                </FieldRow>
                <FieldRow label="Experiment Type ID">
                  <ReadonlyInput value={simulation.experimentTypeId} />
                </FieldRow>
                <FieldRow label="Machine ID">
                  <ReadonlyInput value={simulation.machine.name} />
                </FieldRow>
                <FieldRow label="Variables">
                  {simulation.variables && simulation.variables.length ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{simulation.variables.length}</span>
                      <span className="text-xs text-muted-foreground">→</span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="link"
                            className="p-0 h-auto text-xs text-blue-600 underline"
                          >
                            View list
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="max-w-xs">
                          <ul className="list-disc pl-5 text-sm max-h-48 overflow-auto">
                            {simulation.variables.map((v) => (
                              <li key={v}>{v}</li>
                            ))}
                          </ul>
                        </PopoverContent>
                      </Popover>
                    </div>
                  ) : (
                    <span className="text-sm">—</span>
                  )}
                </FieldRow>
                <FieldRow label="Branch">
                  <ReadonlyInput value={simulation.branch ?? undefined} />
                </FieldRow>

                <FieldRow label="Version Control">
                  <Link
                    to="#"
                    onClick={() => setActiveTab('versionControl')}
                    className="text-xs text-blue-600 hover:underline"
                    tabIndex={0}
                    aria-label="See version control details"
                  >
                    See version control details
                  </Link>
                </FieldRow>
              </CardContent>
            </Card>
          </div>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <FieldRow label="Model Start">
                <span className="text-sm">
                  {simulation.modelStartDate ? formatDate(simulation.modelStartDate) : '—'}
                </span>
              </FieldRow>
              <FieldRow label="Model End">
                <span className="text-sm">
                  {simulation.modelEndDate ? formatDate(simulation.modelEndDate) : '—'}
                </span>
              </FieldRow>
              <FieldRow label="Duration">
                <span className="text-sm">
                  {simulation.modelStartDate && simulation.modelEndDate
                    ? (() => {
                        return getSimulationDuration(
                          simulation.modelStartDate,
                          simulation.modelEndDate,
                        );
                      })()
                    : '—'}
                </span>
              </FieldRow>
              {simulation.calendarStartDate && (
                <FieldRow label="Calendar Start">
                  <span className="text-sm">{formatDate(simulation.calendarStartDate)}</span>
                </FieldRow>
              )}
            </CardContent>
          </Card>

          {/* Diagnostics & Performance (PACE) links */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Diagnostics & Performance Card */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Diagnostics & Performance</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {/* Diagnostics Links */}
                <div className="mb-4">
                  <Label className="mb-1 block text-sm">Diagnostics</Label>
                  {simulation.diagnosticLinks?.length ? (
                    <ul className="list-disc pl-5 text-sm">
                      {simulation.diagnosticLinks.map((d) => (
                        <li key={d.url} className="flex items-center gap-2">
                          <a
                            className="text-blue-600 hover:underline flex items-center gap-1"
                            href={d.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              className="inline-block"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 7h2a5 5 0 015 5v0a5 5 0 01-5 5h-2m-6 0H7a5 5 0 01-5-5v0a5 5 0 015-5h2m1 5h4"
                              />
                            </svg>
                            {d.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mb-2 text-sm text-muted-foreground">
                      Diagnostics will appear here once available.
                    </div>
                  )}
                </div>
                {/* Performance Links */}
                <div>
                  <Label className="mb-1 block text-sm">Performance</Label>
                  {simulation.paceLinks?.length ? (
                    <ul className="list-disc pl-5 text-sm">
                      {simulation.paceLinks.map((p) => (
                        <li key={p.url} className="flex items-center gap-2">
                          <a
                            className="text-blue-600 hover:underline flex items-center gap-1"
                            href={p.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              className="inline-block"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 7h2a5 5 0 015 5v0a5 5 0 01-5 5h-2m-6 0H7a5 5 0 01-5-5v0a5 5 0 015-5h2m1 5h4"
                              />
                            </svg>
                            {p.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mb-2 text-sm text-muted-foreground">
                      Performance metrics will appear here once available.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Provenance */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Provenance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Upload row */}
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground min-w-[100px]">Upload:</Label>
                  <span className="text-sm">
                    {simulation.uploadDate ? formatDate(simulation.uploadDate) : '—'}
                  </span>
                  {simulation.uploadedBy && (
                    <span className="text-sm">by {simulation.uploadedBy}</span>
                  )}
                </div>
                {/* Last edited row */}
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground min-w-[100px]">
                    Last edited:
                  </Label>
                  <span className="text-sm">
                    {simulation.lastEditedAt ? formatDate(simulation.lastEditedAt) : '—'}
                  </span>
                  {simulation.lastEditedBy && (
                    <span className="text-sm">by {simulation.lastEditedBy}</span>
                  )}
                </div>
                {/* Simulation ID row */}
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground min-w-[100px]">
                    Simulation ID:
                  </Label>
                  <ReadonlyInput
                    value={
                      simulation.id
                        ? `${simulation.id.slice(0, 8)}…${simulation.id.slice(-6)}`
                        : undefined
                    }
                  />
                  {simulation.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => navigator.clipboard.writeText(simulation.id)}
                      title="Copy full Simulation ID"
                    >
                      Copy
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Add notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[120px]"
              />
              {!canEdit && (
                <p className="text-xs text-muted-foreground">
                  A user account with write privilege is required to update this simulation page.
                </p>
              )}
              <div>
                <Button disabled={!canEdit}>Save</Button>
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          <div>
            <h3 className="mb-2 text-sm font-semibold tracking-tight">Comments</h3>
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {c.author
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{c.author}</span>
                      <span>•</span>
                      <span>{format(new Date(c.date), 'MM/dd/yyyy')}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))}
              <Separator />
              <div className="flex items-start gap-2">
                <Textarea
                  placeholder="Add a comment ..."
                  className="min-h-[80px]"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button onClick={addComment} className="shrink-0">
                  Post
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* OUTPUTS & LOGS TAB */}
        <TabsContent value="outputs" className="space-y-6">
          <SimulationPathCard
            title="Output Path"
            paths={simulation.outputPath ? [simulation.outputPath] : []}
            emptyText="No output path available."
          />
          <SimulationPathCard
            title="Archive Paths"
            paths={simulation.archivePaths || []}
            emptyText="No archive path available."
          />
          <SimulationPathCard
            title="Run Script Paths"
            paths={simulation.runScriptPaths || []}
            emptyText="No run script path available."
          />
          <SimulationPathCard
            title="Batch Logs"
            paths={simulation.batchLogPaths || []}
            emptyText="No batch logs available."
          />
        </TabsContent>

        {/* VERSION CONTROL TAB */}
        <TabsContent value="versionControl" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Version Control Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FieldRow label="Repository URL">
                <ReadonlyInput value={simulation.externalRepoUrl} />
              </FieldRow>
              <FieldRow label="Version/Tag">
                <ReadonlyInput value={simulation.versionTag} />
              </FieldRow>
              <FieldRow label="Commit Hash">
                <ReadonlyInput value={simulation.gitHash} />
              </FieldRow>
              <FieldRow label="Branch">
                <ReadonlyInput value={simulation.branch ?? undefined} />
              </FieldRow>
              <FieldRow label="Branch Time">
                <ReadonlyInput value={simulation.branchTime ?? undefined} />
              </FieldRow>

              {simulation.externalRepoUrl && (
                <Button asChild variant="outline" size="sm">
                  <a href={simulation.externalRepoUrl} target="_blank" rel="noopener noreferrer">
                    Open Repository
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
