import { Bar, Line } from "react-chartjs-2"
import { ChartData, ChartOptions, LineProps } from 'chart.js/auto';
import { Hand } from "@/lib/utils";
import { DateTime } from "luxon";

interface BarChartProps {
  chartData: ChartData<'bar'>;
  hyperlinks: string[];
}

export const generateSessionLineData = (handData: Hand[], startTrend: number[] = [0, -1]) => {
  // startTrend is of the form [offset, index], where the index in this data range has the given absolute offset
  // handData.sort((a: Hand, b: Hand) => {
  //   return DateTime.fromHTTP(a.played_at).toMillis() - DateTime.fromHTTP(b.played_at).toMillis()
  // })
  let trend: number[] = [];
  let net = 0;

  handData.forEach((hand) => {
    net += Number(hand.amount);
    trend.push(net);
  });

  // the amount every datapoint has to be offset by to satisfy startTrend
  // if there is no given index, offset everything by the start, otherwise set that index to the given value
  let diff = startTrend[0];
  if (startTrend[1] != -1) diff -= trend[startTrend[1]];

  for (let i = 0; i < trend.length; ++i) {
    trend[i] += diff;
  }

  let timeLabels: string[] = [];
  let day = -1;
  for (let i = 0; i < handData.length; ++i) {
    let date = DateTime.fromHTTP(handData[i].played_at);
    // only show the day if it has changed
    if (date.day != day) {
      timeLabels.push(
        date.toLocaleString(DateTime.DATETIME_MED)
      );
      day = date.day;
    } else {
      timeLabels.push(
        date.toLocaleString(DateTime.TIME_SIMPLE)
      );
    }
  }

  return {
    labels: timeLabels,
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
