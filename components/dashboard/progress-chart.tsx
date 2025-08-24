'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ProgressData {
  daily: Array<{
    date: string;
    goals: number;
    habits: number;
    xp: number;
    mood: number;
  }>;
  weekly: Array<{
    week: string;
    completed: number;
    total: number;
    completion: number;
  }>;
  monthly: Array<{
    month: string;
    goals: number;
    habits: number;
    streaks: number;
  }>;
  categories: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  streaks: Array<{
    habit: string;
    current: number;
    best: number;
    completion: number;
  }>;
}

interface ProgressChartProps {
  data: ProgressData;
}

type ChartType = 'daily' | 'weekly' | 'monthly' | 'categories' | 'streaks';
type ViewMode = '7d' | '30d' | '3m' | '1y';

const chartTypeConfig = {
  daily: { icon: Activity, title: 'Daily Progress', color: 'text-blue-500' },
  weekly: { icon: Calendar, title: 'Weekly Overview', color: 'text-green-500' },
  monthly: { icon: TrendingUp, title: 'Monthly Trends', color: 'text-purple-500' },
  categories: { icon: PieChartIcon, title: 'Goal Categories', color: 'text-orange-500' },
  streaks: { icon: Target, title: 'Habit Streaks', color: 'text-red-500' },
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function ProgressChart({ data }: ProgressChartProps) {
  const t = useTranslations('dashboard.charts');
  const [activeChart, setActiveChart] = useState<ChartType>('daily');
  const [viewMode, setViewMode] = useState<ViewMode>('30d');

  const currentConfig = chartTypeConfig[activeChart];
  const Icon = currentConfig.icon;

  // Calculate trends
  const calculateTrend = (dataArray: any[], field: string) => {
    if (dataArray.length < 2) return 0;
    const recent = dataArray.slice(-7).reduce((sum, item) => sum + (item[field] || 0), 0);
    const previous = dataArray.slice(-14, -7).reduce((sum, item) => sum + (item[field] || 0), 0);
    return previous === 0 ? 0 : ((recent - previous) / previous) * 100;
  };

  const goalsTrend = calculateTrend(data.daily, 'goals');
  const habitsTrend = calculateTrend(data.daily, 'habits');
  const xpTrend = calculateTrend(data.daily, 'xp');

  const renderChart = () => {
    switch (activeChart) {
      case 'daily':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.daily.slice(-30)}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="goals" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name={t('goals')}
              />
              <Line 
                type="monotone" 
                dataKey="habits" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name={t('habits')}
              />
              <Line 
                type="monotone" 
                dataKey="xp" 
                stroke="#F59E0B" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name={t('xp')}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'weekly':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.weekly}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="week" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="completed" fill="#10B981" name={t('completed')} />
              <Bar dataKey="total" fill="#E5E7EB" name={t('total')} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'monthly':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthly}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="goals" fill="#3B82F6" name={t('goals')} />
              <Bar dataKey="habits" fill="#10B981" name={t('habits')} />
              <Bar dataKey="streaks" fill="#F59E0B" name={t('streaks')} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'categories':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.categories}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'streaks':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={data.streaks}>
              <RadialBar 
                minAngle={15} 
                label={{ position: 'insideStart', fill: '#fff' }} 
                background 
                clockWise 
                dataKey="completion" 
              />
              <Legend 
                iconSize={18} 
                layout="vertical" 
                verticalAlign="bottom" 
                align="center"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value, name) => [`${value}%`, name]}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <Icon className={cn('h-5 w-5', currentConfig.color)} />
            {t(currentConfig.title.toLowerCase().replace(' ', ''))}
          </CardTitle>
          
          {/* Time Range Selector */}
          <div className="flex gap-2">
            {(['7d', '30d', '3m', '1y'] as ViewMode[]).map(mode => (
              <Button
                key={mode}
                size="sm"
                variant={viewMode === mode ? "default" : "outline"}
                onClick={() => setViewMode(mode)}
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Chart Type Selector */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(chartTypeConfig) as ChartType[]).map(type => {
            const config = chartTypeConfig[type];
            const TypeIcon = config.icon;
            return (
              <Button
                key={type}
                size="sm"
                variant={activeChart === type ? "default" : "outline"}
                onClick={() => setActiveChart(type)}
                className="flex items-center gap-2"
              >
                <TypeIcon className="h-4 w-4" />
                {t(type)}
              </Button>
            );
          })}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Trend Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">{t('goalsTrend')}</p>
              <p className="text-2xl font-bold text-blue-600">
                {goalsTrend > 0 ? '+' : ''}{goalsTrend.toFixed(1)}%
              </p>
            </div>
            {goalsTrend > 0 ? (
              <ArrowUp className="h-5 w-5 text-green-500" />
            ) : (
              <ArrowDown className="h-5 w-5 text-red-500" />
            )}
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">{t('habitsTrend')}</p>
              <p className="text-2xl font-bold text-green-600">
                {habitsTrend > 0 ? '+' : ''}{habitsTrend.toFixed(1)}%
              </p>
            </div>
            {habitsTrend > 0 ? (
              <ArrowUp className="h-5 w-5 text-green-500" />
            ) : (
              <ArrowDown className="h-5 w-5 text-red-500" />
            )}
          </div>
          
          <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">{t('xpTrend')}</p>
              <p className="text-2xl font-bold text-yellow-600">
                {xpTrend > 0 ? '+' : ''}{xpTrend.toFixed(1)}%
              </p>
            </div>
            {xpTrend > 0 ? (
              <ArrowUp className="h-5 w-5 text-green-500" />
            ) : (
              <ArrowDown className="h-5 w-5 text-red-500" />
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="w-full h-[300px]">
          {renderChart()}
        </div>
        
        {/* Chart Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <h4 className="font-medium mb-2">{t('insights')}</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {t('insight1')}</li>
              <li>• {t('insight2')}</li>
              <li>• {t('insight3')}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">{t('recommendations')}</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{t('recommendation1')}</Badge>
              <Badge variant="secondary">{t('recommendation2')}</Badge>
              <Badge variant="secondary">{t('recommendation3')}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}