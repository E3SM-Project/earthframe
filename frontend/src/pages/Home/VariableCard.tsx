import { Link } from 'react-router-dom';

interface VariableCardProps {
  variableKey: string;
  longName: string;
  description: string;
  simulationCount: number;
  icon: React.ReactNode;
}

const VariableCard = ({
  variableKey,
  longName,
  description,
  simulationCount,
  icon,
}: VariableCardProps) => (
  <Link
    to={`/Browse?variables=${variableKey}`}
    className="block bg-white border border-muted rounded-xl shadow p-6 hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
  >
    <div className="flex items-center gap-2 mb-2">
      {icon || <span className="text-2xl">🔬</span>}
      <span className="font-bold text-lg">{variableKey}</span>
    </div>
    <div className="font-medium mb-1">{longName}</div>
    <div className="text-muted-foreground text-sm mb-3">{description}</div>
    <div className="text-right font-semibold text-base text-muted-foreground">
      {simulationCount} simulation{simulationCount === 1 ? '' : 's'}
    </div>
  </Link>
);

export default VariableCard;
