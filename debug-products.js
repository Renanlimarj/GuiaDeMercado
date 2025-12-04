const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Connecting to database...');
    const count = await prisma.product.count();
    console.log(`Total products in DB: ${count}`);
    
    const products = await prisma.product.findMany({ take: 5 });
    console.log('Sample products:', JSON.stringify(products, null, 2));
  } catch (e) {
    console.error('Error querying database:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
