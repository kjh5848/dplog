// components/nplace/rank/realtime/ReviewChart.tsx
"use client";
import { Bar } from "react-chartjs-2";
import { ChartOptions } from "chart.js";

interface ReviewChartProps {
  data: any;
}

const options: ChartOptions<"bar"> = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "리뷰 및 저장 추이",
    },
  },
};

export default function ReviewChart({ data }: ReviewChartProps) {
  return <Bar options={options} data={data} />;
}
