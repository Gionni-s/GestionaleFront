import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import axios from '@/services/axios';
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  eachMonthOfInterval,
  startOfYear,
  endOfYear,
  subMonths,
  subYears,
  addMonths,
  addYears,
} from 'date-fns';
import { Select, SelectItem } from '@/components/ui/select';
import {
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@radix-ui/react-select';

const TIME_OPTIONS = ['day', 'month', 'year'];
const month = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const BudgetChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        let thisMonth = month[today.getMonth()];
        console.log(thisMonth);
        const response = await axios.get('/budgets/chart');

        let dateKeys: string[] = [];

        if (timeRange === 'day') {
          dateKeys = eachDayOfInterval({
            start: startOfMonth(currentDate),
            end: endOfMonth(currentDate),
          }).map((d) => format(d, 'yyyy-MM-dd'));
        } else if (timeRange === 'month') {
          dateKeys = eachMonthOfInterval({
            start: startOfYear(currentDate),
            end: endOfYear(currentDate),
          }).map((d) => format(d, 'yyyy-MM'));
        } else {
          dateKeys = Array.from(
            { length: 5 },
            (_, i) => String(currentDate.getFullYear() - 2 + i) // Centra l'anno attuale
          );
        }

        const groupedData: Record<string, any> = {};
        const groupNames = response.data.map((group: any) => group.name);

        dateKeys.forEach((dateKey) => {
          groupedData[dateKey] = { date: dateKey };
          groupNames.forEach((group: any) => (groupedData[dateKey][group] = 0));
        });

        response.data.forEach((group: any) => {
          group.budget.forEach((item: any) => {
            if (!item.dateTime) return;
            const dateKey =
              timeRange === 'year'
                ? format(parseISO(item.dateTime), 'yyyy')
                : timeRange === 'month'
                ? format(parseISO(item.dateTime), 'yyyy-MM')
                : format(parseISO(item.dateTime), 'yyyy-MM-dd');

            if (!groupedData[dateKey]) {
              groupedData[dateKey] = { date: dateKey };
              groupNames.forEach(
                (name: any) => (groupedData[dateKey][name] = 0)
              );
            }

            groupedData[dateKey][group.name] += item.amount || 0;
          });
        });

        const filteredData = Object.values(groupedData).filter((entry) => {
          const entryDate = parseISO(entry.date);

          if (timeRange === 'day') {
            return (
              entryDate >= startOfMonth(currentDate) &&
              entryDate <= endOfMonth(currentDate)
            );
          }
          if (timeRange === 'month') {
            return format(entryDate, 'yyyy') === format(currentDate, 'yyyy');
          }
          if (timeRange === 'year') {
            return entry.date >= String(currentDate.getFullYear() - 2);
          }
          return false;
        });

        setData(filteredData);
      } catch (err) {
        console.error('Errore nel recupero dati:', err);
        setError('Errore nel recupero dei dati.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, currentDate]);

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-4">
        <CardTitle>Budget Area Chart</CardTitle>
        <div className="w-full sm:w-40 flex">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 mx-2 bg-blue-500 text-white rounded-md"
          >
            Oggi
          </button>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2">
              <SelectValue placeholder="Seleziona intervallo" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-lg border border-gray-200 rounded-md">
              {TIME_OPTIONS.map((option) => (
                <SelectItem
                  key={option}
                  value={option}
                  className="hover:bg-gray-100 cursor-pointer"
                >
                  {option === 'day'
                    ? 'Giorni'
                    : option === 'month'
                    ? 'Mesi'
                    : 'Anni'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() =>
              setCurrentDate(
                (prev) =>
                  timeRange === 'year' || timeRange === 'month'
                    ? subYears(prev, 1) // Cambia l'anno se sei su 'mesi'
                    : subMonths(prev, 1) // Cambia il mese se sei su 'giorni'
              )
            }
            className="px-4 py-2 bg-gray-200 rounded-md"
          >
            ◀
          </button>

          <span className="font-semibold">
            {timeRange === 'year'
              ? `${currentDate.getFullYear() - 2}-${
                  currentDate.getFullYear() + 2
                }`
              : timeRange === 'month'
              ? currentDate.getFullYear()
              : format(currentDate, 'MMMM yyyy')}
          </span>

          <button
            onClick={() =>
              setCurrentDate(
                (prev) =>
                  timeRange === 'year' || timeRange === 'month'
                    ? addYears(prev, 1) // Cambia l'anno se sei su 'mesi'
                    : addMonths(prev, 1) // Cambia il mese se sei su 'giorni'
              )
            }
            className="px-4 py-2 bg-gray-200 rounded-md"
          >
            ▶
          </button>
        </div>

        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(data[0] || {})
                .filter((key) => key !== 'date')
                .map((group, index) => (
                  <Area
                    key={group}
                    type="monotone"
                    dataKey={group}
                    stroke={`hsl(${index * 60}, 70%, 50%)`}
                    fill={`hsl(${index * 60}, 70%, 70%)`}
                  />
                ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetChart;
