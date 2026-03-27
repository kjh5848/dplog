"use client";

import { useEffect, useRef } from "react";

import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";

// Chart.js 컴포넌트 등록
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

export default function CardLineChart() {
  const chartRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // 그라데이션 설정
    const createGradient = (color1: string, color2: string) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 350);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);
      return gradient;
    };

    const myLine = new Chart(ctx, {
      type: "line",
      data: {
        labels: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
        ],
        datasets: [
          {
            label: new Date().getFullYear().toString(),
            backgroundColor: createGradient(
              'rgba(37, 228, 255, 0.2)',
              'rgba(37, 228, 255, 0.0)'
            ),
            borderColor: "#25E4FF",
            data: [65, 78, 66, 44, 56, 67, 75],
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointBackgroundColor: "#25E4FF",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: (new Date().getFullYear() - 1).toString(),
            backgroundColor: createGradient(
              'rgba(211, 255, 192, 0.2)',
              'rgba(211, 255, 192, 0.0)'
            ),
            borderColor: "#D3FFC0",
            data: [40, 68, 86, 74, 56, 60, 87],
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointBackgroundColor: "#D3FFC0",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "rgba(255,255,255,0.8)",
              font: {
                size: 12,
                family: "'Pretendard', sans-serif",
              },
              padding: 20,
            },
          },
          tooltip: {
            mode: "index",
            intersect: false,
            backgroundColor: "rgba(0,0,0,0.8)",
            titleColor: "rgba(255,255,255,0.9)",
            bodyColor: "rgba(255,255,255,0.9)",
            titleFont: {
              family: "'Pretendard', sans-serif",
            },
            bodyFont: {
              family: "'Pretendard', sans-serif",
            },
            borderColor: "rgba(255,255,255,0.1)",
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: "rgba(255,255,255,0.8)",
              font: {
                family: "'Pretendard', sans-serif",
              },
            },
          },
          y: {
            grid: {
              color: "rgba(255,255,255,0.1)",
            },
            ticks: {
              color: "rgba(255,255,255,0.8)",
              font: {
                family: "'Pretendard', sans-serif",
              },
            },
          },
        },
      },
    });

    return () => {
      myLine.destroy();
    };
  }, []);

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-[#282c34]">
      <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full max-w-full flex-grow flex-1">
            <h6 className="uppercase text-gray-400 mb-1 text-xs font-semibold">
              Overview
            </h6>
            <h2 className="text-white text-xl font-semibold">Sales value</h2>
          </div>
        </div>
      </div>
      <div className="p-4 flex-auto">
        <div className="relative h-[350px]">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    </div>
  );
}

