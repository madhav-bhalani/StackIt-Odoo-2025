const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: hashedPassword,
      role: 'USER'
    }
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      password: hashedPassword,
      role: 'USER'
    }
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@stackit.com' },
    update: {},
    create: {
      email: 'admin@stackit.com',
      firstName: 'Admin',
      lastName: 'User',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  // Create sample tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name: 'React' },
      update: {},
      create: { name: 'React' }
    }),
    prisma.tag.upsert({
      where: { name: 'JavaScript' },
      update: {},
      create: { name: 'JavaScript' }
    }),
    prisma.tag.upsert({
      where: { name: 'Node.js' },
      update: {},
      create: { name: 'Node.js' }
    }),
    prisma.tag.upsert({
      where: { name: 'PostgreSQL' },
      update: {},
      create: { name: 'PostgreSQL' }
    }),
    prisma.tag.upsert({
      where: { name: 'Prisma' },
      update: {},
      create: { name: 'Prisma' }
    })
  ]);

  // Create sample questions
  const question1 = await prisma.question.create({
    data: {
      title: 'How to set up Prisma with PostgreSQL?',
      description: 'I\'m new to Prisma and want to set up a PostgreSQL database. Can someone help me with the basic configuration?',
      userId: user1.id,
      tags: {
        create: [
          { tagId: tags.find(t => t.name === 'Prisma').id },
          { tagId: tags.find(t => t.name === 'PostgreSQL').id }
        ]
      }
    }
  });

  const question2 = await prisma.question.create({
    data: {
      title: 'Best practices for React state management',
      description: 'What are the current best practices for managing state in React applications? I\'m building a large app and need advice.',
      userId: user2.id,
      tags: {
        create: [
          { tagId: tags.find(t => t.name === 'React').id },
          { tagId: tags.find(t => t.name === 'JavaScript').id }
        ]
      }
    }
  });

  // Create sample answers
  const answer1 = await prisma.answer.create({
    data: {
      content: 'To set up Prisma with PostgreSQL, first install the required packages: `npm install prisma @prisma/client`. Then run `npx prisma init` to create your schema file. Update your DATABASE_URL in the .env file and run `npx prisma db push` to sync your schema.',
      userId: user2.id,
      questionId: question1.id
    }
  });

  const answer2 = await prisma.answer.create({
    data: {
      content: 'For React state management, I recommend using React Context for simple apps, Redux Toolkit for complex state, or Zustand for a lightweight alternative. Choose based on your app\'s complexity.',
      userId: user1.id,
      questionId: question2.id
    }
  });

  // Create sample votes
  await prisma.vote.createMany({
    data: [
      {
        userId: user1.id,
        questionId: question2.id,
        voteType: 'UP'
      },
      {
        userId: user2.id,
        answerId: answer1.id,
        voteType: 'UP'
      },
      {
        userId: user1.id,
        answerId: answer2.id,
        voteType: 'UP'
      }
    ]
  });

  // Create sample notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: user1.id,
        type: 'ANSWER_RECEIVED',
        content: 'Jane answered your question about Prisma setup'
      },
      {
        userId: user2.id,
        type: 'VOTE_RECEIVED',
        content: 'John upvoted your answer about React state management'
      }
    ]
  });

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Created ${await prisma.user.count()} users`);
  console.log(`📊 Created ${await prisma.question.count()} questions`);
  console.log(`📊 Created ${await prisma.answer.count()} answers`);
  console.log(`📊 Created ${await prisma.tag.count()} tags`);
  console.log(`📊 Created ${await prisma.vote.count()} votes`);
  console.log(`📊 Created ${await prisma.notification.count()} notifications`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 