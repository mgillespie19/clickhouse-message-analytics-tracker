import { NextApiRequest, NextApiResponse } from 'next';
import { client } from '@/lib/api';
import { subDays, format } from 'date-fns';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
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

      const result = await client.query({
        query,
        format: 'JSONEachRow',
      });

      const data = await result.json();

      const processedData = (data as any).reduce((acc: any[], item: any) => {
        const dateStr = item.date;
        const campaignKey = `Campaign ${item.campaignID}`;
        
        const existingDate = acc.find(d => d.date === dateStr);
        if (existingDate) {
          existingDate[campaignKey] = item.total_messages;
        } else {
          acc.push({
            date: dateStr,
            [campaignKey]: item.total_messages,
          });
        }
        return acc;
      }, []);

      res.status(200).json(processedData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      res.status(500).json({ error: 'Failed to fetch chart data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}