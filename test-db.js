const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const tenantCount = await prisma.tenant.count();
    const agentCount = await prisma.agent.count();
    const contentCount = await prisma.contentItem.count();
    
    console.log(`✅ Database connection successful!`);
    console.log(`📊 Tenants: ${tenantCount}`);
    console.log(`🤖 Agents: ${agentCount}`);
    console.log(`📝 Content items: ${contentCount}`);
    
    if (tenantCount > 0) {
      const tenants = await prisma.tenant.findMany();
      console.log(`\n📋 Tenants:`, tenants.map(t => t.name));
    }
  } catch (e) {
    console.error('❌ Database error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
