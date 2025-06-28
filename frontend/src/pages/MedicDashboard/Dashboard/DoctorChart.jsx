// src/components/DoctorActivityChart.jsx
import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

const DoctorActivityChart = ({ appointments }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!appointments || appointments.length === 0) return;

    const today = new Date();
    const labels = [];
    const counts = [];

    // Construim ultimele 7 zile in ordine cronologica
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);

      const label = d.toLocaleDateString("ro-RO", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
      });

      const dateString = d.toISOString().split("T")[0];

      const count = appointments.filter((appt) => appt.date === dateString).length;

      labels.push(label); 
      counts.push(count);
    }

    const chart = echarts.init(chartRef.current);

    const option = {
      tooltip: {
        trigger: "axis",
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: labels,
        axisLabel: {
          rotate: 30,
        },
      },
      yAxis: {
        type: "value",
        name: "Consultații",
        minInterval: 1,
      },
      series: [
        {
          name: "Consultații",
          type: "bar",
          data: counts,
          itemStyle: {
            color: "#7C3AED", 
          },
        },
      ],
    };

    chart.setOption(option);
    window.addEventListener("resize", chart.resize);

    return () => {
      window.removeEventListener("resize", chart.resize);
      chart.dispose();
    };
  }, [appointments]);

  return <div ref={chartRef} style={{ height: "300px" }} />;
};

export default DoctorActivityChart;
