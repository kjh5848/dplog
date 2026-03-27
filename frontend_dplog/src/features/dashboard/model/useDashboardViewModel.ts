'use client';

import { useState, useEffect } from 'react';
import { getDashboardData } from "../api/dashboardApi";

// Mock Data Types
export interface StatMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  iconName: 'Users' | 'Zap' | 'TrendingUp' | 'Sparkles';
}

export interface DashboardData {
  stats: StatMetric[];
  chartData: number[];
}

export const useDashboardViewModel = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDashboardData();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    stats: data?.stats || [],
    chartData: data?.chartData || [],
    isLoading,
  };
};
