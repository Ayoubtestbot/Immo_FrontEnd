import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import fetch from 'node-fetch';
import { isTrialActive } from '@/lib/subscription';
import { withApiAuth } from '@/lib/withApiAuth';
import { Session } from 'next-auth';
import { UserRole } from '@prisma/client';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
) {
  if (!session.user.agencyId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const properties = await prisma.property.findMany({
        where: { agencyId: session.user.agencyId },
        include: {
          images: true,
          leads: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return res.status(200).json(properties);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
      return res.status(500).json({ error: 'Failed to fetch properties' });
    }
  } else if (req.method === 'POST') {
    const agencyId = session.user.agencyId;

    const subscription = await prisma.subscription.findUnique({
        where: { agencyId: agencyId },
        include: { plan: true },
    });

    if (!subscription) {
        return res.status(403).json({ error: "No active subscription found." });
    }

    const { propertiesLimit } = subscription.plan;

    if (propertiesLimit !== -1) {
        const propertyCount = await prisma.property.count({
            where: { agencyId: agencyId },
        });

        if (propertyCount >= propertiesLimit) {
            return res.status(403).json({ error: `You have reached the limit of ${propertiesLimit} properties for your current plan.` });
        }
    }

    const { address, city, zipCode, country, type, price, status, description, images, projectId } = req.body;

    if (!address || !city || !zipCode || !country || !type || price === undefined || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let latitude: number | undefined;
    let longitude: number | undefined;

    try {
      const geoQuery = `${address}, ${zipCode} ${city}, ${country}`;
      console.log('Geocoding query:', geoQuery);
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(geoQuery)}`);
      // @ts-ignore
      const geoData = await geoRes.json();
      console.log('Geocoding response:', geoData);
      if (Array.isArray(geoData) && geoData.length > 0) {
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
        orderBy: { propertyNumber: { sort: 'desc', nulls: 'last' } }, // Updated orderBy
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
          ...(projectId && { project: { connect: { id: projectId } } }),
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

export default withApiAuth(handler, [UserRole.AGENCY_OWNER, UserRole.AGENCY_MEMBER]);
