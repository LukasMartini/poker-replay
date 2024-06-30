import { Bar } from "react-chartjs-2"
import {   
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip 
} from "chart.js"

// export interface DataType 
//   { id: number, year: number, userGain: number, userLost: number }


export const BarChart = ( { chartData, hyperlinks }: any ) => {
  return (
    <div className="chart-container">
      <h2 style={{ textAlign: "center" }}>Bar Chart</h2>
      <Bar
        data={chartData}
        options={{
          plugins: {
            title: {
              display: true,
              text: "Profit-Loss Over Time"
            },
            legend: {
              display: false
            },
            // afterDatasetsDraw: (chart: any) => {
            //   console.log(chart)

            //   const ctx = chart.chart.ctx
            //   chart.chart.data.datasets.forEach((dataset: any, i: number) => {
            //     const meta = chart.chart.getDatasetMeta(i);
            //     meta.data.forEach((bar: any, index: number) => {
            //       const model = bar.tooltipPosition()
            //       ctx.fillStyle = 'white'
            //       ctx.beginPath()
            //       ctx.arc(model.x, model.y, 5, 0, 2*Math.PI)
            //       ctx.fill()
            //     })
            //   })
            // }
          },
          onClick: (event: any, elements: any) => {
            if (elements.length > 0) {
              const index = elements[0].index;
              const link = hyperlinks[index];
              window.open(link, '_blank');
            }
          },
        }}
      />
    </div>
  );
};
