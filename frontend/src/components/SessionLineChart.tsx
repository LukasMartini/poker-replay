import { Bar, Line } from "react-chartjs-2"
import { ChartData, ChartOptions, LineProps } from 'chart.js/auto';
import { Hand } from "@/lib/utils";

interface BarChartProps {
  chartData: ChartData<'bar'>;
  hyperlinks: string[];
}

export const generateSessionLineData = (handData: Hand[]) => {
  let trend: number[] = [];
  let net = 0;

  handData.forEach((hand) => {
    net += Number(hand.amount);
    trend.push(net);
  });

  console.log(trend);

  return {
    labels: handData.map((data: any) => data.played_at),
    datasets: [
      {
        label: "Profit",
        data: trend,
        backgroundColor: "rgba(94, 227, 125, 0.5)",
        borderColor: "rgba(94, 227, 125, 1)",
        borderWidth: 1,
        fill: true
      },
    ],
  }
}

export const LineChart = ( { chartData, hyperlinks }: any ) => {
  
  const options: ChartOptions<'line'> = {
    plugins: {
      title: {
        display: true,
        text: "Profit-Loss Over Session",
      },
      legend: {
        display: false,
      },
    },
    onHover: (event, elements, chart) => {
      if (chart) {
        chart.canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const link = hyperlinks[index];
        window.open(link, "_blank");
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          color: "rgba(55, 55, 55, 1)"
        }
      },
      y: {
        stacked: true,
        grid: {
          color: "rgba(55, 55, 55, 1)"
        }
      },
    },
  };


  return (
    <div className="chart-container">
      <h2 className="text-center text-2xl">Session</h2>
      <Line data={chartData} options={options} />
    </div>
  );
};
