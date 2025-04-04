'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

// Type definitions
type TimeRange = 'month' | 'year';
type BudgetItem = {
  dateTime: string;
  amount: number;
};
type BudgetGroup = {
  name: string;
  budget: BudgetItem[];
};
type ChartDataPoint = {
  date: string;
  [groupName: string]: string | number;
};

const TIME_OPTIONS: TimeRange[] = ['month', 'year'];
const MONTHS = [
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
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [budgetGroups, setBudgetGroups] = useState<BudgetGroup[]>([]);

  // Fetch data only once and process locally when timeRange or currentDate changes
  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/budget-groups/chart');
        setBudgetGroups(response.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetData();
  }, []);

  // Process data when budgetGroups, timeRange, or currentDate changes
  useEffect(() => {
    if (!budgetGroups.length) return;

    try {
      setLoading(true);

      const processedData = processChartData(
        budgetGroups,
        timeRange,
        currentDate
      );
      setData(processedData);
      setError(null);
    } catch (err) {
      console.error('Error processing data:', err);
      setError('Error processing data');
    } finally {
      setLoading(false);
    }
  }, [budgetGroups, timeRange, currentDate]);

  // Extract this complex logic to a separate function for better readability
  const processChartData = (
    groups: BudgetGroup[],
    range: TimeRange,
    date: Date
  ): ChartDataPoint[] => {
    let dateKeys: string[] = [];

    // Generate date keys based on time range
    if (range === 'month') {
      dateKeys = eachDayOfInterval({
        start: startOfMonth(date),
        end: endOfMonth(date),
      }).map((d) => format(d, 'yyyy-MM-dd'));
    } else {
      dateKeys = eachMonthOfInterval({
        start: startOfYear(date),
        end: endOfYear(date),
      }).map((d) => format(d, 'yyyy-MM'));
    }

    // Initialize grouped data with zero values
    const groupedData: Record<string, any> = {};
    const groupNames = groups.map((group) => group.name);

    dateKeys.forEach((dateKey) => {
      groupedData[dateKey] = { date: dateKey };
      groupNames.forEach((groupName) => (groupedData[dateKey][groupName] = 0));
    });

    // Sum up budget amounts by date and group
    groups.forEach((group) => {
      group.budget.forEach((item) => {
        if (!item.dateTime) return;

        const dateKey =
          range === 'year'
            ? format(parseISO(item.dateTime), 'yyyy-MM')
            : format(parseISO(item.dateTime), 'yyyy-MM-dd');

        if (!groupedData[dateKey]) {
          groupedData[dateKey] = { date: dateKey };
          groupNames.forEach((name) => (groupedData[dateKey][name] = 0));
        }

        groupedData[dateKey][group.name] += item.amount || 0;
      });
    });

    // Filter data based on current date range
    return Object.values(groupedData).filter((entry) => {
      const entryDate = parseISO(entry.date);

      if (range === 'month') {
        return entryDate >= startOfMonth(date) && entryDate <= endOfMonth(date);
      }

      return format(entryDate, 'yyyy') === format(date, 'yyyy');
    });
  };

  // Memoize the color generation to avoid recalculations
  const getColorForIndex = useCallback((index: number) => {
    return {
      stroke: `hsl(${index * 60}, 70%, 50%)`,
      fill: `hsl(${index * 60}, 70%, 70%)`,
    };
  }, []);

  // Handle navigation
  const goToToday = () => setCurrentDate(new Date());
  const goToPrevious = () => {
    setCurrentDate((prev) =>
      timeRange === 'year' ? subYears(prev, 1) : subMonths(prev, 1)
    );
  };
  const goToNext = () => {
    setCurrentDate((prev) =>
      timeRange === 'year' ? addYears(prev, 1) : addMonths(prev, 1)
    );
  };

  // Format the current date display
  const dateDisplay =
    timeRange === 'year'
      ? currentDate.getFullYear().toString()
      : format(currentDate, 'MMMM yyyy');

  // Memoize the group names to avoid recalculation on every render
  const groupNames = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0] || {}).filter((key) => key !== 'date');
  }, [data]);

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-4">
        <CardTitle>Budget Area Chart</CardTitle>
        <div className="w-full sm:w-40 flex">
          <Button
            onClick={goToToday}
            className="px-4 py-2 mx-2 bg-blue-500 text-white rounded-md"
            variant="default"
          >
            Oggi
          </Button>
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as TimeRange)}
          >
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
                  {option === 'month' ? 'Mese' : 'Anno'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={goToPrevious}
            className="px-4 py-2 bg-gray-200 rounded-md"
            variant="outline"
          >
            ◀
          </Button>

          <span className="font-semibold">{dateDisplay}</span>

          <Button
            onClick={goToNext}
            className="px-4 py-2 bg-gray-200 rounded-md"
            variant="outline"
          >
            ▶
          </Button>
        </div>

        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  if (timeRange === 'year') {
                    const monthNum = parseInt(value.split('-')[1]) - 1;
                    return MONTHS[monthNum].substring(0, 3);
                  }
                  return format(parseISO(value), 'dd');
                }}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(label) => {
                  if (timeRange === 'year') {
                    const monthNum = parseInt(label.split('-')[1]) - 1;
                    return `${MONTHS[monthNum]} ${label.split('-')[0]}`;
                  }
                  return format(parseISO(label), 'dd MMM yyyy');
                }}
              />
              <Legend />
              {groupNames.map((group, index) => {
                const colors = getColorForIndex(index);
                return (
                  <Area
                    key={group}
                    type="monotone"
                    dataKey={group}
                    stroke={colors.stroke}
                    fill={colors.fill}
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetChart;
