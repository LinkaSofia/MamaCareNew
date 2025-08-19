import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WeightRecord {
  id: string;
  weight: string;
  date: string;
  notes?: string;
}

interface WeightChartProps {
  records: WeightRecord[];
}

export default function WeightChart({ records }: WeightChartProps) {
  const chartData = records
    .slice()
    .reverse()
    .map((record) => ({
      date: new Date(record.date).toLocaleDateString('pt-BR', { 
        month: 'short', 
        day: 'numeric' 
      }),
      weight: parseFloat(record.weight),
      fullDate: record.date,
    }));

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            fontSize={12}
            stroke="#666"
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            fontSize={12}
            stroke="#666"
            domain={['dataMin - 2', 'dataMax + 2']}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: number) => [`${value} kg`, 'Peso']}
            labelFormatter={(label) => `Data: ${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="weight" 
            stroke="url(#weightGradient)" 
            strokeWidth={3}
            dot={{ r: 4, fill: '#E91E63' }}
            activeDot={{ r: 6, fill: '#E91E63' }}
          />
          <defs>
            <linearGradient id="weightGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--baby-pink-dark)" />
              <stop offset="100%" stopColor="var(--baby-blue-dark)" />
            </linearGradient>
          </defs>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
