import React, { useEffect, useState } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Typography, Paper } from '@mui/material';

const TrafficChart = () => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/traffics?sort=createdAt:desc&pagination[limit]=1000')
      .then((res) => res.json())
      .then((json: any) => {
        if (!json.data) return;

        const counts = json.data.reduce((acc: any, item: any) => {
          const date = new Date(item.attributes.createdAt).toLocaleDateString(
            'vi-VN',
            {
              day: '2-digit',
              month: '2-digit',
            }
          );

          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});

        const formatted = Object.keys(counts)
          .map((day) => ({
            day,
            count: counts[day],
          }))
          .reverse()
          .slice(-10);

        setChartData(formatted);
      });
  }, []);

  return (
    <Paper
      sx={{
        p: 3,
        gridColumn: 'span 2',
        borderRadius: '8px',
        boxShadow: '0px 1px 4px rgba(33, 33, 52, 0.1)',
      }}
    >
      <Typography
        variant="h6"
        sx={{ mb: 3, fontWeight: '600', color: '#32324d' }}
      >
        Tổng lượt truy cập hệ thống theo ngày
      </Typography>

      <Box sx={{ width: '100%', height: 400 }}>
        <BarChart
          dataset={chartData}
          xAxis={[{ scaleType: 'band', dataKey: 'day' }]}
          series={[
            {
              dataKey: 'count',
              label: 'Số người truy cập',
              color: '#4945ff',
            },
          ]}
          height={350}
        />
      </Box>
    </Paper>
  );
};

export default TrafficChart;