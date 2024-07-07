import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, ChartData, ChartOptions } from 'chart.js/auto';

interface BarChartProps {
  chartData: ChartData<'bar'>;
  hyperlinks: string[];
}

// export interface DataType 
//   { id: number, year: number, userGain: number, userLost: number }


export const BarChart: React.FC<BarChartProps> = ( { chartData, hyperlinks }: any ) => {
  
  const options: ChartOptions<'bar'> = {
    plugins: {
      title: {
        display: true,
        text: "Profit-Loss Over Time",
      },
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw === 0.004 ? 0 : context.raw;
            return `Amount: ${value}`;
          },
        },
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
      <h2 style={{ textAlign: "center" }}>Bar Chart</h2>
      <Bar data={chartData} options={options} />
    </div>
  );
};
