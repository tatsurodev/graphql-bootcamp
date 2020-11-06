// connect node.js to prisma GraphQL
import { Prisma } from 'prisma-binding'

const prisma = new Prisma({
  typeDefs: 'src/generated/prisma.graphql',
  endpoint: 'http://localhost:4466',
})

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
