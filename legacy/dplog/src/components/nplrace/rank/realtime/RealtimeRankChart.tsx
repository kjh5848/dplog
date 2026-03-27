// components/nplace/rank/realtime/RankChart.tsx
"use client";
import { Line } from "react-chartjs-2";
import { ChartOptions } from "chart.js";

interface SearchRankChartProps {
  data: any;
}

const options: ChartOptions<"line"> = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "최근 7일 순위 변화",
    },
  },
  scales: {
    y: {
      reverse: true,
      min: 1,
      ticks: {
        stepSize: 1,
      },
    },
  },
};

export default function SearchRankChart({ data }: SearchRankChartProps) {
  return <Line options={options} data={data} />;
}
