import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const alice = await prisma.user.upsert({
    where: { email: 'alice@prisma.io' },
    update: {},
    create: {
      email: 'alice@prisma.io',
      name: 'Alice',
      posts: {
        create: {
          title: 'Check out Prisma with Next.js',
          content: 'https://www.prisma.io/nextjs',
          published: true,
        },
      },
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@prisma.io' },
    update: {},
    create: {
      email: 'bob@prisma.io',
      name: 'Bob',
      posts: {
        create: {
          title: 'Follow Prisma on Twitter',
          content: 'https://twitter.com/prisma',
          published: true,
        },
      },
    },
  });

  let postToComment = await prisma.post.findFirst({
    where: {
      authorId: alice.id,
      }
  });

  if(postToComment) {
    let comment = await prisma.comment.create({
      data: {
        content: 'Great post!',
        post: {
          connect: { id: postToComment.id },
        },
        author: {
          connect: { id: bob.id },
        },
      }
    });

    await prisma.comment.create({
      data: {
        content: 'Thank you!',
        post: {
          connect: { id: postToComment.id },
        },
        author: {
          connect: { id: alice.id },
        },
        parent: {
          connect: { id: comment.id },
        },
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })