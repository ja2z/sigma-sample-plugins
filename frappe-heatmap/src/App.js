import "./App.css";
import { Chart } from "frappe-charts";
import {
  client,
  useConfig,
  useElementColumns,
  useElementData,
} from "@sigmacomputing/plugin";
import * as React from "react";

client.config.configureEditorPanel([
  { name: "source", type: "element" },
  { name: "dimension", type: "column", source: "source", allowMultiple: false },
  { name: "measures", type: "column", source: "source", allowMultiple: false },
]);

function App() {
  const config = useConfig();
  const columns = useElementColumns(config.source);
  const sigmaData = useElementData(config.source);

  const ref = React.useRef(null);
  const chart = React.useRef(false);
  const data = React.useMemo(() => {
    const dimension = config.dimension;
    const measure = config.measures;
    console.log("got data", config, sigmaData, columns, dimension, measure);

    const data = {};
    let start = 0;
    let end = 0;
    if (sigmaData?.[dimension]) {
      for (let idx = 0; idx < sigmaData[dimension].length; ++idx) {
        const ts = sigmaData[dimension][idx];
        const val = sigmaData[measure][idx];
        data[ts / 1000] = val;
        start = start ? Math.min(start, ts) : ts;
        end = Math.max(end, ts);
      }
      // console.log('generated data', data);
    }

    return {
      dataPoints: data,
      start: new Date(start),
      end: new Date(end),
    };
  }, [columns, config, sigmaData]);

  // initial chart creation
  React.useEffect(() => {
    // only create new chart once
    if (!chart.current) {
      chart.current = new Chart(ref.current, {
        type: "heatmap",
        radius: 2,
        data,
      });
    }
  }, [data]);

  // update the chart (e.g. when values change)
  React.useEffect(() => {
    // only update chart if chart has been created
    if (chart.current) {
      chart.current.update(data);
    }
  }, [data]);

  return (
    <div className="App">
      <div ref={ref} />
    </div>
  );
}

export default App;
