import { NextApiRequest, NextApiResponse } from 'next';
import { client } from '@/lib/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userID, campaignID, date } = req.body;

    try {
      await client.insert({
        table: 'messages',
        values: [
          {
            userID: Number(userID),
            campaignID: Number(campaignID),
            messages_sent: 1,
            sent_date: new Date(date).toISOString(),
          },
        ],
        format: 'JSONEachRow',
      });

      res.status(200).json({ message: 'Data added successfully' });
    } catch (error) {
      console.error('Error inserting data:', error);
      res.status(500).json({ error: 'Failed to add data' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}