import { prisma } from '../config/prisma';

async function main() {
  const fakeUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: { endsWith: '@example.com' } },
        { email: { endsWith: '@planora.edu.vn' } },
        { email: { startsWith: 'test_' } },
        { email: { startsWith: 'user1_' } },
        { email: { startsWith: 'user2_' } },
        { email: { startsWith: 'usera_' } },
        { email: { startsWith: 'userb_' } },
        { email: { startsWith: 'user_b4_' } },
        { email: { startsWith: 'viet_test_' } },
      ],
    },
    select: {
      id: true,
      email: true,
      _count: {
        select: {
          tasks: true,
          events: true,
          timetables: true,
          habits: true,
          notifications: true,
        },
      },
    },
  });

  const totals = fakeUsers.reduce(
    (acc, user) => ({
      users: acc.users + 1,
      tasks: acc.tasks + user._count.tasks,
      events: acc.events + user._count.events,
      timetables: acc.timetables + user._count.timetables,
      habits: acc.habits + user._count.habits,
      notifications: acc.notifications + user._count.notifications,
    }),
    { users: 0, tasks: 0, events: 0, timetables: 0, habits: 0, notifications: 0 },
  );

  if (fakeUsers.length === 0) {
    console.log('No fake test users found.');
    return;
  }

  await prisma.user.deleteMany({
    where: { id: { in: fakeUsers.map((user) => user.id) } },
  });

  console.log('Removed fake system data:', totals);
  console.log('Removed accounts:', fakeUsers.map((user) => user.email));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
