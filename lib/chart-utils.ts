import { ChartConfig } from '@/components/ui/chart';

// Color palettes for charts
export const chartColors = {
  primary: {
    blue: '#3B82F6',
    green: '#10B981',
    yellow: '#F59E0B',
    purple: '#8B5CF6',
    red: '#EF4444',
    orange: '#F97316',
    indigo: '#6366F1',
    pink: '#EC4899',
    teal: '#14B8A6',
    gray: '#6B7280',
  },
  gradients: {
    blueGreen: ['#3B82F6', '#10B981'],
    purpleBlue: ['#8B5CF6', '#3B82F6'],
    orangeRed: ['#F97316', '#EF4444'],
    tealBlue: ['#14B8A6', '#3B82F6'],
    pinkPurple: ['#EC4899', '#8B5CF6'],
  },
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  }
};

// Default chart configurations
export const defaultChartConfig: ChartConfig = {
  goals: {
    label: 'Goals',
    color: chartColors.primary.blue,
  },
  habits: {
    label: 'Habits',
    color: chartColors.primary.green,
  },
  xp: {
    label: 'XP',
    color: chartColors.primary.yellow,
  },
  mood: {
    label: 'Mood',
    color: chartColors.primary.purple,
  },
  streaks: {
    label: 'Streaks',
    color: chartColors.primary.orange,
  },
};

// Chart theme configurations
export const chartThemes = {
  light: {
    backgroundColor: '#ffffff',
    gridColor: '#f3f4f6',
    textColor: '#374151',
    tooltipBg: '#ffffff',
    tooltipBorder: '#e5e7eb',
  },
  dark: {
    backgroundColor: '#1f2937',
    gridColor: '#374151',
    textColor: '#d1d5db',
    tooltipBg: '#374151',
    tooltipBorder: '#4b5563',
  },
};

// Utility functions for chart data formatting
export const formatChartData = {
  // Format numbers for display
  number: (value: number, decimals = 0): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  },

  // Format percentages
  percentage: (value: number, decimals = 1): string => {
    return `${(value * 100).toFixed(decimals)}%`;
  },

  // Format currency
  currency: (value: number, currency = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(value);
  },

  // Format dates for chart labels
  date: (date: Date | string, format: 'short' | 'long' | 'numeric' = 'short'): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    switch (format) {
      case 'short':
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'long':
        return d.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        });
      case 'numeric':
        return d.toLocaleDateString('en-US', { 
          month: '2-digit', 
          day: '2-digit' 
        });
      default:
        return d.toLocaleDateString();
    }
  },

  // Format time durations
  duration: (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  },
};

// Chart responsive breakpoints
export const chartBreakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};

// Common chart dimensions
export const chartDimensions = {
  small: { width: 300, height: 200 },
  medium: { width: 400, height: 250 },
  large: { width: 600, height: 350 },
  xlarge: { width: 800, height: 400 },
};

// Animation configurations
export const chartAnimations = {
  default: {
    duration: 750,
    easing: 'easeInOutCubic',
  },
  fast: {
    duration: 300,
    easing: 'easeInOutQuart',
  },
  slow: {
    duration: 1200,
    easing: 'easeInOutCubic',
  },
};

// Tooltip configurations
export const tooltipConfig = {
  default: {
    contentStyle: {
      backgroundColor: 'hsl(var(--card))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    labelStyle: {
      color: 'hsl(var(--foreground))',
    },
  },
  minimal: {
    contentStyle: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      border: 'none',
      borderRadius: '4px',
      color: 'white',
    },
  },
};

// Data processing utilities
export const processChartData = {
  // Fill missing data points
  fillMissingDates: (
    data: Array<{ date: string; [key: string]: any }>,
    startDate: Date,
    endDate: Date
  ) => {
    const filled = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const existing = data.find(item => item.date === dateStr);
      
      if (existing) {
        filled.push(existing);
      } else {
        filled.push({ date: dateStr, ...getDefaultValues(data[0]) });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return filled;
  },

  // Calculate moving averages
  movingAverage: (
    data: number[],
    windowSize: number
  ): number[] => {
    const result = [];
    
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = data.slice(start, i + 1);
      const average = window.reduce((sum, val) => sum + val, 0) / window.length;
      result.push(average);
    }
    
    return result;
  },

  // Normalize data to 0-100 scale
  normalize: (data: number[]): number[] => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    
    if (range === 0) return data.map(() => 0);
    
    return data.map(value => ((value - min) / range) * 100);
  },

  // Group data by time period
  groupByPeriod: (
    data: Array<{ date: string; [key: string]: any }>,
    period: 'day' | 'week' | 'month'
  ) => {
    const groups: { [key: string]: any[] } = {};
    
    data.forEach(item => {
      const date = new Date(item.date);
      let key: string;
      
      switch (period) {
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = item.date;
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    
    return groups;
  },
};

// Helper function to get default values for missing data points
function getDefaultValues(sample: any): any {
  const defaults: any = { date: '' };
  
  Object.keys(sample).forEach(key => {
    if (key !== 'date') {
      defaults[key] = typeof sample[key] === 'number' ? 0 : null;
    }
  });
  
  return defaults;
}

// Chart accessibility helpers
export const chartA11y = {
  // Generate accessible colors for colorblind users
  colorBlindSafe: {
    blue: '#1f77b4',
    orange: '#ff7f0e',
    green: '#2ca02c',
    red: '#d62728',
    purple: '#9467bd',
    brown: '#8c564b',
    pink: '#e377c2',
    gray: '#7f7f7f',
    olive: '#bcbd22',
    cyan: '#17becf',
  },
  
  // High contrast patterns for better accessibility
  patterns: {
    solid: 'none',
    diagonal: 'url(#diagonal-pattern)',
    dots: 'url(#dots-pattern)',
    horizontal: 'url(#horizontal-pattern)',
    vertical: 'url(#vertical-pattern)',
  },
};

// Export commonly used chart configurations
export const commonChartConfigs = {
  line: {
    strokeWidth: 2,
    dot: { r: 4 },
    activeDot: { r: 6 },
  },
  bar: {
    radius: [4, 4, 0, 0],
  },
  pie: {
    innerRadius: 0,
    outerRadius: 80,
    paddingAngle: 2,
  },
  area: {
    strokeWidth: 2,
    fillOpacity: 0.6,
  },
};

// Performance optimization utilities
export const chartPerformance = {
  // Debounce function for resize events
  debounce: (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Throttle function for scroll events
  throttle: (func: Function, limit: number) => {
    let inThrottle: boolean;
    return function executedFunction(...args: any[]) {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
};

export default {
  colors: chartColors,
  config: defaultChartConfig,
  themes: chartThemes,
  format: formatChartData,
  breakpoints: chartBreakpoints,
  dimensions: chartDimensions,
  animations: chartAnimations,
  tooltip: tooltipConfig,
  process: processChartData,
  a11y: chartA11y,
  common: commonChartConfigs,
  performance: chartPerformance,
};