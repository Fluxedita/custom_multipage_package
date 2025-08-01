'use client'

import { Card } from '@/components/ui/card'
import { Line, Bar, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const lineChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Visitors',
      data: [65, 59, 80, 81, 56, 55],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    },
  ],
}

const barChartData = {
  labels: ['Direct', 'Social', 'Search', 'Referral'],
  datasets: [
    {
      label: 'Traffic Sources',
      data: [12, 19, 3, 5],
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
      ],
    },
  ],
}

const pieChartData = {
  labels: ['Photos', 'Videos', 'Articles', 'Other'],
  datasets: [
    {
      data: [300, 50, 100, 40],
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
      ],
    },
  ],
}

export function LineChart() {
  return (
    <div className="h-[300px]">
      <Line data={lineChartData} options={{ maintainAspectRatio: false }} />
    </div>
  )
}

export function BarChart() {
  return (
    <div className="h-[300px]">
      <Bar data={barChartData} options={{ maintainAspectRatio: false }} />
    </div>
  )
}

export function PieChart() {
  return (
    <div className="h-[300px]">
      <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
    </div>
  )
} 