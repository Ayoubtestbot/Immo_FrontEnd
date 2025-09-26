import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import fetch from 'node-fetch';
import type { Prisma } from '@prisma/client'; // New import
import { isTrialActive } from '@/lib/subscription';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user.agencyId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    const trialActive = await isTrialActive(session.user.agencyId);
    if (!trialActive) {
      return res.status(403).json({ error: 'Your free trial has expired. Please upgrade your plan to add new properties.' });
    }

    const { address, city, zipCode, country, type, price, status, description, images } = req.body;

    if (!address || !city || !zipCode || !country || !type || price === undefined || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let latitude: number | undefined;
    let longitude: number | undefined;

    try {
      const geoQuery = `${address}, ${zipCode} ${city}, ${country}`;
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(geoQuery)}`);
      // @ts-ignore
      const geoData = await geoRes.json();
      if (geoData && geoData.length > 0) {
        latitude = parseFloat(geoData[0].lat);
        longitude = parseFloat(geoData[0].lon);
      }
    } catch (error) {
      console.error('Geocoding failed', error);
      // a geocoding error is not fatal, we can still create the property
    }

    try {
      // Generate propertyNumber
      const latestProperty = await prisma.property.findFirst({
        where: { agencyId: session.user.agencyId },
        orderBy: { propertyNumber: { sort: 'desc', nulls: 'last' } as Prisma.SortOrder }, // Updated orderBy
        select: { propertyNumber: true },
      });

      const nextPropertyNumber = latestProperty && latestProperty.propertyNumber !== null ? latestProperty.propertyNumber + 1 : 1;

      const property = await prisma.property.create({
        data: {
          propertyNumber: nextPropertyNumber, // New field
          address,
          city,
          zipCode,
          country,
          type,
          price: parseFloat(price),
          status,
          description,
          latitude,
          longitude,
          agency: {
            connect: {
              id: session.user.agencyId,
            },
          },
          images: {
            create: images.map((url: string) => ({ url })),
          },
        },
      });
      return res.status(201).json(property);
    } catch (error: any) {
      console.error('Failed to create property:', error);
      console.error('Error details:', error.message);
      return res.status(500).json({ error: 'Failed to create property', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
