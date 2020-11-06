// connect node.js to prisma GraphQL
import { Prisma } from 'prisma-binding'

const prisma = new Prisma({
  typeDefs: 'src/generated/prisma.graphql',
  endpoint: 'http://localhost:4466',
})

/* query
// prisma.query, prisma.mutation, prisma.subscription, prisma.exists
// mutation methodの第一引数はmutationの引数、第二引数はselection setでpromiseが返ってくる
prisma.query.users(null, '{ id name posts { id title } }').then((data) => {
  // consoleだとobjectの中身が省略されてしまう
  // console.log(data)
  // objectの中身をjson形式のstringにすると見やすい、第二引数はreplacerで使用しないのでundefined, 第三引数はindentのspace数
  console.log(JSON.stringify(data, undefined, 2))
})

prisma.query.comments(null, '{ id text author { id name } }').then((data) => {
  console.log(JSON.stringify(data, undefined, 2))
})
*/

/* mutation
// then catch version
prisma.mutation 
  .createPost(
    {
      data: {
        title: 'GraphQL 101',
        body: '',
        published: false,
        author: {
          connect: {
            id: 'ckh64rmdn004x0815qhoa3nd4',
          },
        },
      },
    },
    '{ id title body published }'
  )
  .then((data) => {
    console.log(data)
    return prisma.query.users(null, '{ id name posts { id title } }')
  })
  .then((data) => {
    console.log(JSON.stringify(data, undefined, 2))
  })
*/
// async await version
const createPostForUser = async (authorId, data) => {
  const userExists = await prisma.exists.User({ id: authorId })
  if (!userExists) {
    throw new Error('User not found')
  }
  const post = await prisma.mutation.createPost(
    {
      data: {
        ...data,
        author: {
          connect: {
            id: authorId,
          },
        },
      },
    },
    '{ author { id name email posts { id title published } } }'
  )
  return post.author
}
createPostForUser('ckh61gfgt000q0815djk0rpo2', {
  title: 'Great books to read',
  body: 'The war of Art',
  published: true,
})
  .then((user) => {
    console.log(JSON.stringify(user, undefined, 2))
  })
  .catch((error) => {
    console.log(error.message)
  })

/*
// then catch version
prisma.mutation
  .updatePost(
    {
      where: {
        id: 'ckh6eyckz03q50815cqg2sbqq',
      },
      data: {
        body: 'This is how to get started with Graphql...',
        published: true,
      },
    },
    '{ id }'
  )
  .then((data) => {
    return prisma.query.posts(null, '{ id title body published }')
  })
  .then((data) => {
    console.log(data)
  })
*/
// async await version
const updatePostForUser = async (postId, data) => {
  const postExists = await prisma.exists.Post({
    id: postId,
  })
  if (!postid) {
    throw new Error('Post not found')
  }
  const post = await prisma.mutation.updatePost(
    {
      where: {
        id: postId,
      },
      data,
    },
    '{ author { id name email posts { id title published } } }'
  )
  return post.author
}
updatePostForUser('ckh6imc1g057o0815topbdhtq', {
  published: false,
})
  .then((user) => console.log(JSON.stringify(user, undefined, 2)))
  .catch((error) => {
    console.log(error.message)
  })
