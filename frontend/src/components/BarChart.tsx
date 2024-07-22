import { Bar } from "react-chartjs-2"
import { ChartData, ChartOptions } from 'chart.js/auto';
import { Hand } from "@/util/utils";

interface BarChartProps {
  chartData: ChartData<'bar'>;
  hyperlinks: string[];
  title: string;
  subtitle: string;
}

export const generateChartData = (handData: Hand[]) => {
  let maxAmount = Math.max(...handData.map((d) => d.amount));
  let minAmount = Math.min(...handData.map((d) => d.amount));

  // now run through and calculate colours and hyperlinks for every bar
  let colours = handData.map((data) => {
    const amount = data.amount;
    if (amount < 0) {
      const col = 255 - (amount / minAmount) * 128;
      return `rgba(255, ${col}, ${col}, 1)`;
    } else if (amount > 0) {
      const col = 255 - (amount / maxAmount) * 128;
      return `rgba(${col}, 255, ${col}, 1)`;
    } else {
      return "rgba(128, 128, 128, 0.7)";
    }
  });

  return {
    labels: handData.map((data) => data.played_at),
    datasets: [
      {
        label: "Profit",
        data: handData.map((data) => (data.amount == 0 ? 0.004 : data.amount)),
        backgroundColor: colours,
        borderWidth: 0,
      },
    ],
  }
}

export const BarChart: React.FC<BarChartProps> = ( { chartData, hyperlinks, title, subtitle }: any ) => {
  
  const options: ChartOptions<'bar'> = {
    plugins: {
      title: {
        display: true,
        text: subtitle,
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
      <h2 className="text-center text-2xl">{title}</h2>
      <Bar data={chartData} options={options} />
    </div>
  );
};
