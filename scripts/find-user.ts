import prisma from '../src/lib/prisma'

async function findUser() {
  try {
    // Search for users with 'testuser' in their name or email
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: 'testuser', mode: 'insensitive' } },
          { email: { contains: 'testuser', mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        clerkId: true,
        name: true,
        email: true,
        profileImageUrl: true,
      },
    })

    console.log('Found users:')
    console.log(JSON.stringify(users, null, 2))

    // Also get all users if no match found
    if (users.length === 0) {
      console.log('\nNo users found with "testuser". Here are all users:')
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          clerkId: true,
          name: true,
          email: true,
        },
      })
      console.log(JSON.stringify(allUsers, null, 2))
    }
  } catch (error) {
    console.error('Error querying database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

findUser()
