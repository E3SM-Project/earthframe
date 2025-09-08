import { Link2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SimulationPathCard {
  title: string;
  paths?: string[] | { url: string; label: string }[];
  emptyText: string;
}
const SimulationPathCard = ({ title, paths, emptyText }: SimulationPathCard) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {paths?.length ? (
          <ul className="list-disc pl-5">
            {paths.map((path) => {
              const url = typeof path === 'string' ? path : path.url;
              const label = typeof path === 'string' ? path : path.label;
              return (
                <li key={url} className="flex items-center gap-2">
                  <a
                    className="text-blue-600 hover:underline flex items-center gap-1"
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Link2 size={16} className="inline-block" />
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted-foreground">{emptyText}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default SimulationPathCard;
