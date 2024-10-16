import { createClient } from '@clickhouse/client-web';
import { subDays, format } from 'date-fns';

const client = createClient({
  host: process.env.NEXT_PUBLIC_CLICKHOUSE_HOST || 'http://localhost:8123',
  username: process.env.NEXT_PUBLIC_CLICKHOUSE_USERNAME || 'default',
  password: process.env.NEXT_PUBLIC_CLICKHOUSE_PASSWORD || '',
});

// Add this function to test the connection
export async function testConnection(): Promise<boolean> {
  try {
    await client.ping();
    console.log('Successfully connected to ClickHouse');
    return true;
  } catch (error) {
    console.error('Failed to connect to ClickHouse:', error);
    return false;
  }
}

export async function addData(userID: number, campaignID: number, date: Date): Promise<void> {
  try {
    const insertData = {
      userID,
      campaignID,
      messages_sent: 1,
      sent_date: date.toISOString(),
    };
    console.log('Inserting data:', insertData);
    const result = await client.insert({
      table: 'messages',
      values: [insertData],
      format: 'JSONEachRow',
    });
    console.log('Insert result:', result);
  } catch (error) {
    console.error('Error inserting data:', error);
    throw error;
  }
}

export async function getChartData(): Promise<any[]> {
  try {
    const endDate = new Date();
    const startDate = subDays(endDate, 14);

    const query = `
      SELECT
        toDate(sent_date) AS date,
        campaignID,
        SUM(messages_sent) AS total_messages
      FROM messages
      WHERE sent_date BETWEEN '${format(startDate, 'yyyy-MM-dd')}' AND '${format(endDate, 'yyyy-MM-dd')}'
      GROUP BY date, campaignID
      ORDER BY date, campaignID
    `;

    console.log('Executing query:', query);

    const result = await client.query({
      query,
      format: 'JSONEachRow',
    });

    const rows = await result.json();
    console.log('Query result:', rows);

    // Transform the data into the format expected by the chart
    const chartData = rows.reduce((acc: any[], row: any) => {
      const date = row.date;
      const campaignID = `Campaign ${row.campaignID}`;
      const existingDate = acc.find((item: any) => item.date === date);
      if (existingDate) {
        existingDate[campaignID] = row.total_messages;
      } else {
        acc.push({ date, [campaignID]: row.total_messages });
      }
      return acc;
    }, []);

    return chartData;
  } catch (error) {
    console.error('Error fetching chart data:', error);
    throw error;
  }
}
