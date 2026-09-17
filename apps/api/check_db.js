const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const custCount = await prisma.customer.count();
  const billCount = await prisma.billSubmission.count();
  const actCount = await prisma.activity.count();
  const monthCount = await prisma.month.count();

  console.log('--- DATABASE STATUS ---');
  console.log('Customers count:', custCount);
  console.log('Bills count:', billCount);
  console.log('Activities count:', actCount);
  console.log('Months in DB:', await prisma.month.findMany({ select: { id: true, name: true } }));
  console.log('Activities in DB:', await prisma.activity.findMany({ select: { id: true, name: true, monthId: true } }));

  if (billCount > 0) {
    const bills = await prisma.billSubmission.findMany({
      take: 5,
      orderBy: { submittedAt: 'desc' },
      include: { customer: true, activity: true, month: true }
    });
    console.log('--- RECENT BILLS IN MYSQL ---');
    console.log(JSON.stringify(bills, null, 2));
  } else {
    console.log('No bills found in MySQL database.');
  }

  if (custCount > 0) {
    const customers = await prisma.customer.findMany({ take: 5 });
    console.log('--- CUSTOMERS IN MYSQL ---');
    console.log(JSON.stringify(customers, null, 2));
  }
}

main()
  .catch((e) => console.error('Database Error:', e.message))
  .finally(() => prisma.$disconnect());

