import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Simulation } from '@/types/index';

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
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([
    {
      id: 'c1',
      author: 'Jane Doe',
      date: '2024-02-15',
      text: 'The sea-ice diagnostics will be added later.',
    },
  ] as { id: string; author: string; date: string; text: string }[]);

  const diagThumbs = useMemo(
    () => simulation.diagnosticThumbs || [],
    [simulation.diagnosticThumbs],
  );

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
            <Badge variant="secondary" className="capitalize">
              {simulation.simulationType ?? '—'}
            </Badge>
            <span>•</span>
            <span>Status:</span>
            <Badge className="capitalize">{simulation.status ?? '—'}</Badge>
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
            <Link to="/search" className="text-blue-600 hover:underline">
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
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="outputs">Outputs & Logs</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics & Results</TabsTrigger>
          <TabsTrigger value="notes">Notes & Issues</TabsTrigger>
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
                <FieldRow label="Model Version">
                  <ReadonlyInput value={simulation.versionTag} />
                </FieldRow>
                <FieldRow label="Start Date">
                  <ReadonlyInput value={simulation.modelStartDate} />
                </FieldRow>
              </CardContent>
            </Card>

            {/* Right side small fields */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Context</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <FieldRow label="Case Name">
                  <ReadonlyInput value={simulation.caseName} />
                </FieldRow>
                <FieldRow label="Resolution">
                  <ReadonlyInput value={simulation.resolution} />
                </FieldRow>
                <FieldRow label="Machine">
                  <ReadonlyInput value={simulation.machine} />
                </FieldRow>
              </CardContent>
            </Card>
          </div>

          {/* Diagnostics thumbnails + provenance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Diagnostics</CardTitle>
                  <Button asChild variant="ghost" size="sm">
                    <Link to="#diagnostics">View all diagnostics</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {diagThumbs.length ? (
                  <div className="grid grid-cols-3 gap-4">
                    {diagThumbs.slice(0, 6).map((src, i) => (
                      <div
                        key={src + i}
                        className="aspect-video rounded-md bg-muted overflow-hidden"
                      >
                        <img
                          src={src}
                          alt={`diagnostic ${i + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="aspect-video rounded-md bg-muted" />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Provenance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <p className="leading-relaxed">
                    {simulation.provenance ||
                      '* netCDF metadata, last updated 2024-03-20\n* Provenance information goes here'}
                  </p>
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
                  Admin privileges are required to update the simulation page.
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

        {/* CONFIGURATION TAB */}
        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldRow label="Case Name">
                <ReadonlyInput value={simulation.caseName} />
              </FieldRow>
              <FieldRow label="Compset">
                <ReadonlyInput value={simulation.compset} />
              </FieldRow>
              <FieldRow label="Grid">
                <ReadonlyInput value={simulation.gridName} />
              </FieldRow>
              <FieldRow label="Resolution">
                <ReadonlyInput value={simulation.resolution} />
              </FieldRow>
              <FieldRow label="Machine">
                <ReadonlyInput value={simulation.machine} />
              </FieldRow>
              <FieldRow label="Model Start">
                <ReadonlyInput value={simulation.modelStartDate} />
              </FieldRow>
              <FieldRow label="Model End">
                <ReadonlyInput value={simulation.modelEndDate} />
              </FieldRow>
              <FieldRow label="Calendar Start">
                <ReadonlyInput value={simulation.calendarStartDate} />
              </FieldRow>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OUTPUTS & LOGS TAB */}
        <TabsContent value="outputs" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Outputs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {simulation.outputs?.length ? (
                <ul className="list-disc pl-5">
                  {simulation.outputs.map((o) => (
                    <li key={o.url}>
                      <a
                        className="text-blue-600 hover:underline"
                        href={o.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {o.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No outputs linked.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Logs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {simulation.logs?.length ? (
                <ul className="list-disc pl-5">
                  {simulation.logs.map((o) => (
                    <li key={o.url}>
                      <a
                        className="text-blue-600 hover:underline"
                        href={o.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {o.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No logs linked.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DIAGNOSTICS TAB */}
        <TabsContent value="diagnostics" className="space-y-6" id="diagnostics">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Diagnostics & Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {simulation.diagnosticLinks?.length ? (
                <ul className="list-disc pl-5 text-sm">
                  {simulation.diagnosticLinks.map((d) => (
                    <li key={d.url}>
                      <a
                        className="text-blue-600 hover:underline"
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {d.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">No diagnostics linked.</p>
              )}
              {!!diagThumbs.length && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {diagThumbs.map((src, i) => (
                    <div key={src + i} className="aspect-video rounded-md bg-muted overflow-hidden">
                      <img
                        src={src}
                        alt={`diagnostic ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTES & ISSUES TAB */}
        <TabsContent value="notes" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Notes & Issues</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-1 block text-sm">Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[160px]"
                />
              </div>
              <div>
                <Label className="mb-1 block text-sm">Known Issues</Label>
                {simulation.issues?.length ? (
                  <ul className="list-disc pl-5 text-sm">
                    {simulation.issues.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">No issues documented.</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button disabled={!canEdit}>Save</Button>
                {!canEdit && (
                  <p className="text-xs text-muted-foreground self-center">
                    Admin privileges are required to update the simulation page.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
