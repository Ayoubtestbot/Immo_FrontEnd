import { withApiAuth } from '@/lib/withApiAuth';
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

async function handler(req: NextApiRequest, res: NextApiResponse, session: any) {
  if (req.method === 'GET') {
    const { role, id: userId, agencyId } = session.user;

    if (role === 'AGENCY_MEMBER') {
      const userLeads = await prisma.lead.findMany({
        where: {
          assignedToId: userId,
          agencyId: agencyId,
        },
        include: {
          properties: true,
        },
      });

      const soldOrRentedProperties = userLeads.flatMap(lead => lead.properties).filter(property => property.status === 'VENDU' || property.status === 'LOUE');
      const numberOfPropertiesSoldOrRented = soldOrRentedProperties.length;
      const salesVolume = soldOrRentedProperties.reduce((acc, property) => acc + property.price, 0);

      const convertedLeads = userLeads.filter(lead => lead.status === 'CONVERTED').length;
      const totalLeads = userLeads.length;
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

      const contactedLeads = userLeads.filter(lead => lead.firstContactedAt);
      const responseTimes = contactedLeads.map(lead => lead.firstContactedAt!.getTime() - lead.createdAt.getTime());
      const averageResponseTime = responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;

      const numberOfShowings = await prisma.showing.count({
        where: {
          agentId: userId,
        },
      });

      const urgentTasks = userLeads.filter(lead => lead.isUrgent);

      res.status(200).json({
        totalLeads,
        convertedLeads,
        conversionRate,
        averageResponseTime,
        numberOfPropertiesSoldOrRented,
        salesVolume,
        numberOfShowings,
        urgentTasks,
      });
    } else if (role === 'AGENCY_OWNER' || role === 'AGENCY_SUPER_AGENT') {
      const allLeads = await prisma.lead.findMany({
        where: {
          agencyId: agencyId,
        },
      });

      const allProperties = await prisma.property.count({
        where: {
          agencyId: agencyId,
        },
      });

      const convertedLeads = allLeads.filter(lead => lead.status === 'CONVERTED').length;
      const totalLeads = allLeads.length;
      const overallConversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

      const agents = await prisma.user.findMany({
        where: {
          agencyId: agencyId,
          role: 'AGENCY_MEMBER',
        },
        include: {
          assignedLeads: {
            include: {
              properties: true,
            },
          },
          showings: true,
        },
      });

      const agentKpis = agents.map(agent => {
        const agentTotalLeads = agent.assignedLeads.length;
        const agentConvertedLeads = agent.assignedLeads.filter(lead => lead.status === 'CONVERTED').length;
        const agentConversionRate = agentTotalLeads > 0 ? (agentConvertedLeads / agentTotalLeads) * 100 : 0;
        const agentContactedLeads = agent.assignedLeads.filter(lead => lead.firstContactedAt);
        const agentResponseTimes = agentContactedLeads.map(lead => lead.firstContactedAt!.getTime() - lead.createdAt.getTime());
        const agentAverageResponseTime = agentResponseTimes.length > 0 ? agentResponseTimes.reduce((a, b) => a + b, 0) / agentResponseTimes.length : 0;
        const agentSoldOrRentedProperties = agent.assignedLeads.flatMap(lead => lead.properties).filter(property => property.status === 'VENDU' || property.status === 'LOUE');
        const agentNumberOfPropertiesSoldOrRented = agentSoldOrRentedProperties.length;
        const agentSalesVolume = agentSoldOrRentedProperties.reduce((acc, property) => acc + property.price, 0);
        const agentNumberOfShowings = agent.showings.length;

        return {
          agentName: agent.name,
          totalLeads: agentTotalLeads,
          convertedLeads: agentConvertedLeads,
          conversionRate: agentConversionRate,
          averageResponseTime: agentAverageResponseTime,
          numberOfPropertiesSoldOrRented: agentNumberOfPropertiesSoldOrRented,
          salesVolume: agentSalesVolume,
          numberOfShowings: agentNumberOfShowings,
        };
      });

      const allContactedLeads = allLeads.filter(lead => lead.firstContactedAt);
      const allResponseTimes = allContactedLeads.map(lead => lead.firstContactedAt!.getTime() - lead.createdAt.getTime());
      const overallAverageResponseTime = allResponseTimes.length > 0 ? allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length : 0;

      const allSoldOrRentedProperties = await prisma.property.findMany({
        where: {
          agencyId: agencyId,
          status: { in: ['VENDU', 'LOUE'] },
        },
      });
      const overallNumberOfPropertiesSoldOrRented = allSoldOrRentedProperties.length;
      const overallSalesVolume = allSoldOrRentedProperties.reduce((acc, property) => acc + property.price, 0);

      const overallNumberOfShowings = await prisma.showing.count({
        where: {
          agent: {
            agencyId: agencyId,
          },
        },
      });

      const funnelData = await prisma.lead.groupBy({
        by: ['status'],
        where: {
          agencyId: agencyId,
          status: {
            in: ['NEW', 'CONTACTED', 'QUALIFIED', 'APPOINTMENT_SCHEDULED', 'CONVERTED'],
          },
        },
        _count: {
          status: true,
        },
      });

      const urgentTasks = allLeads.filter(lead => lead.isUrgent);

      res.status(200).json({
        totalLeads,
        totalProperties: allProperties,
        overallConversionRate,
        overallAverageResponseTime,
        overallNumberOfPropertiesSoldOrRented,
        overallSalesVolume,
        overallNumberOfShowings,
        agentKpis,
        funnelData, // Add funnelData to the response
        urgentTasks,
      });
    } else {
      res.status(403).json({ error: 'You do not have permission to view this report.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withApiAuth(handler, ['AGENCY_OWNER', 'AGENCY_MEMBER', 'AGENCY_SUPER_AGENT']);
