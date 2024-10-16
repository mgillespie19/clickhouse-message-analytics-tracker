"use client"

import React, { useState, useEffect, FormEvent } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from "framer-motion"
import { addData, getChartData, testConnection } from '@/lib/api';
import { useToast } from "@/hooks/use-toast"

interface ChartDataItem {
  date: string;
  [key: string]: number | string;
}

const Dashboard: React.FC = () => {
  const [userID, setUserID] = useState<string>('');
  const [campaignID, setCampaignID] = useState<string>('');
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast()

  useEffect(() => {
    fetchChartData();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await addData(Number(userID), Number(campaignID), new Date(date));
      toast({
        title: "Success",
        description: "Data added successfully",
      })
      fetchChartData();
      setUserID('');
      setCampaignID('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
    } catch (error) {
      console.error('Error inserting data:', error);
      toast({
        title: "Error",
        description: "Failed to add data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChartData = async () => {
    setIsLoading(true);
    try {
      const data = await getChartData();
      setChartData(data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch chart data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      const result = await testConnection();
      console.log('Connection test result:', result);
      toast({
        title: "Connection Test",
        description: result ? "Successfully connected to ClickHouse" : "Failed to connect to ClickHouse",
      })
    } catch (error) {
      console.error('Error testing connection:', error);
      toast({
        title: "Error",
        description: "Failed to test connection",
        variant: "destructive",
      })
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl"
    >
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Log a message sent</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="number"
              placeholder="User ID"
              value={userID}
              onChange={(e) => setUserID(e.target.value)}
              required
            />
            <Input
              type="number"
              placeholder="Campaign ID"
              value={campaignID}
              onChange={(e) => setCampaignID(e.target.value)}
              required
            />
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit'}
            </Button>
            {/* <Button onClick={handleTestConnection} style={{ marginLeft: '10px' }}>
              {isLoading ? 'Testing...' : 'Test Connection'}
            </Button> */}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Messages Sent (Last 14 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-[400px]">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.keys(chartData[0] || {}).filter(key => key !== 'date').map((campaign, index) => (
                  <Line
                    key={campaign}
                    type="monotone"
                    dataKey={campaign}
                    stroke={`hsl(var(--chart-${index + 1}))`}
                    activeDot={{ r: 8 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Dashboard;
