import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const InsightsChart = ({ clickEvents }) => {
  // Aggregate clicks by date
  const aggregateByDate = (events) => {
    const map = {};
    events.forEach(event => {
      const date = new Date(event.clickedAt).toLocaleDateString();
      map[date] = (map[date] || 0) + 1;
    });
    return Object.entries(map).map(([date, count]) => ({ date, clicks: count }));
  };

  const data = aggregateByDate(clickEvents);

  // If no data, show placeholder
  if (data.length === 0) {
    return (
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 text-center text-gray-400">
        <p>No click data available for this link.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
      <h3 className="font-semibold text-lg text-gray-800 mb-2">Insights</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InsightsChart;