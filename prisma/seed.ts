import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Alice Johnson',
        email: 'alice@example.com',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Bob Smith',
        email: 'bob@example.com',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Carol Davis',
        email: 'carol@example.com',
      },
    }),
    prisma.user.create({
      data: {
        name: 'David Wilson',
        email: 'david@example.com',
      },
    }),
  ])

  console.log('✅ Created users:', users.map(u => u.name))

  // Create a demo group
  const group = await prisma.group.create({
    data: {
      name: 'Weekend Trip to Mountains',
      description: 'Our annual hiking adventure',
      inviteCode: 'DEMO1234',
    },
  })

  console.log('✅ Created group:', group.name)

  // Add all users to the group
  const memberships = await Promise.all(
    users.map((user, index) =>
      prisma.membership.create({
        data: {
          userId: user.id,
          groupId: group.id,
          role: index === 0 ? 'admin' : 'member', // Alice is admin
        },
      })
    )
  )

  console.log('✅ Created memberships')

  // Create expenses with different split types
  const expenses = await Promise.all([
    // Equal split - Dinner
    prisma.expense.create({
      data: {
        title: 'Dinner at Restaurant',
        amount: 120.00,
        currency: 'USD',
        date: new Date('2024-01-15'),
        notes: 'Great Italian place',
        paidById: users[0].id, // Alice paid
        groupId: group.id,
        splitType: 'equal',
        expenseSplits: {
          create: users.map(user => ({
            userId: user.id,
            amount: 30.00, // 120 / 4
            percentage: 25.0,
          })),
        },
      },
    }),

    // Percentage split - Hotel (Alice 40%, others 20% each)
    prisma.expense.create({
      data: {
        title: 'Hotel Booking',
        amount: 400.00,
        currency: 'USD',
        date: new Date('2024-01-14'),
        notes: 'Luxury mountain lodge',
        paidById: users[1].id, // Bob paid
        groupId: group.id,
        splitType: 'percentage',
        expenseSplits: {
          create: [
            { userId: users[0].id, amount: 160.00, percentage: 40.0 },
            { userId: users[1].id, amount: 80.00, percentage: 20.0 },
            { userId: users[2].id, amount: 80.00, percentage: 20.0 },
            { userId: users[3].id, amount: 80.00, percentage: 20.0 },
          ],
        },
      },
    }),

    // Fixed amounts - Gas and snacks
    prisma.expense.create({
      data: {
        title: 'Gas and Snacks',
        amount: 85.00,
        currency: 'USD',
        date: new Date('2024-01-16'),
        notes: 'Road trip essentials',
        paidById: users[2].id, // Carol paid
        groupId: group.id,
        splitType: 'fixed',
        expenseSplits: {
          create: [
            { userId: users[0].id, amount: 25.00, percentage: null },
            { userId: users[1].id, amount: 20.00, percentage: null },
            { userId: users[2].id, amount: 25.00, percentage: null },
            { userId: users[3].id, amount: 15.00, percentage: null },
          ],
        },
      },
    }),

    // Another equal split - Equipment rental
    prisma.expense.create({
      data: {
        title: 'Hiking Equipment Rental',
        amount: 200.00,
        currency: 'USD',
        date: new Date('2024-01-17'),
        notes: 'Tents, backpacks, etc.',
        paidById: users[3].id, // David paid
        groupId: group.id,
        splitType: 'equal',
        expenseSplits: {
          create: users.map(user => ({
            userId: user.id,
            amount: 50.00, // 200 / 4
            percentage: 25.0,
          })),
        },
      },
    }),
  ])

  console.log('✅ Created expenses:', expenses.map(e => e.title))

  // Create settlements
  const settlements = await Promise.all([
    prisma.settlement.create({
      data: {
        fromUserId: users[1].id, // Bob pays Alice
        toUserId: users[0].id,
        groupId: group.id,
        amount: 50.00,
        currency: 'USD',
        date: new Date('2024-01-18'),
        notes: 'Partial settlement for hotel',
      },
    }),
    prisma.settlement.create({
      data: {
        fromUserId: users[3].id, // David pays Carol
        toUserId: users[2].id,
        groupId: group.id,
        amount: 30.00,
        currency: 'USD',
        date: new Date('2024-01-19'),
        notes: 'Settlement for gas and snacks',
      },
    }),
  ])

  console.log('✅ Created settlements')

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
