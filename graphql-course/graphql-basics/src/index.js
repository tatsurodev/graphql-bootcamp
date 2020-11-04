import { GraphQLServer } from 'graphql-yoga'
import { v4 as uuidv4 } from 'uuid'

// scalar types - String, Boolean, Int, Float, ID

// demo user data
let users = [
  {
    id: '1',
    name: 'Andrew',
    email: 'andrew@example.com',
    age: 27,
  },
  {
    id: '2',
    name: 'Sarah',
    email: 'sara@example.com',
  },
  {
    id: '3',
    name: 'Mike',
    email: 'mike@example.com',
  },
]

let posts = [
  {
    id: '10',
    title: 'GraphQl 101',
    body: 'this is how to use GraphQL...',
    published: true,
    author: '1',
  },
  {
    id: '11',
    title: 'GraphQL 201',
    body: 'This is an advanced GraphQl post...',
    published: false,
    author: '1',
  },
  {
    id: '12',
    title: 'Programming Music',
    body: '',
    published: true,
    author: '2',
  },
]

let comments = [
  {
    id: '102',
    text: 'This worked well for me. Thanks!',
    author: '3',
    post: '10',
  },
  {
    id: '103',
    text: 'Glad you enjoyed it.',
    author: '1',
    post: '10',
  },
  {
    id: '104',
    text: 'this did no work.',
    author: '2',
    post: '11',
  },
  {
    id: '105',
    text: 'Nervermind. I got it to work.',
    author: '1',
    post: '12',
  },
]

// type definitions (schema)
const typeDefs = `
  type Query {
    users(query: String): [User!]!
    posts(query: String): [Post!]!
    comments: [Comment!]!
    me: User!
    post: Post!
  }

  type Mutation {
    ${/* 引数にcustom typeは不可、input typeはおｋ */ ''}
    createUser(data: CreateUserInput!): User!
    deleteUser(id: ID!): User!
    createPost(data: CreatePostInput!): Post!
    createComment(data: CreateCommentInput!): Comment!
  }

  ${/*comment*/ ''}
  ${/* input typeの中身は全てscalar */ ''}
  input CreateUserInput {
    name: String!
    email: String!
    age: Int
  }
  input CreatePostInput {
    title: String!
    body: String!
    published: Boolean!
    author: ID!
  }
  input CreateCommentInput {
    text: String!
    author: ID!
    post: ID!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    posts: [Post!]!
    comments: [Comment!]!
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    published: Boolean!
    author: User!
    comments: [Comment]!
  }

  type Comment {
    id: ID!
    text: String!
    author: User!
    post: Post!
  }
`

// resolvers
const resolvers = {
  Query: {
    users(parent, args, ctx, info) {
      if (!args.query) {
        return users
      }
      return users.filter((user) => {
        return user.name.toLowerCase().includes(args.query.toLowerCase())
      })
    },
    posts(parent, args, ctx, info) {
      if (!args.query) {
        return posts
      }
      return posts.filter((post) => {
        const isTitleMatch = post.title
          .toLowerCase()
          .includes(args.query.toLowerCase())
        const isBodyMatch = post.body
          .toLowerCase()
          .includes(args.query.toLowerCase())
        return isBodyMatch || isBodyMatch
      })
    },
    comments(parent, args, ctx, info) {
      return comments
    },
    me() {
      return {
        id: '123098',
        name: 'Mike',
        email: 'mike@example.com',
      }
    },
    post() {
      return {
        id: '092',
        title: 'GrapQl 101',
        body: '',
        published: false,
      }
    },
  },
  Mutation: {
    createUser(parent, args, ctx, info) {
      const emailTaken = users.some((user) => user.email === args.data.email)
      if (emailTaken) {
        throw new Error('Email taken.')
      }
      /* spread operator
      // oneをtwoにmerge
      const one = {
        name: 'Pholadelphia',
        country: 'USA',
      }
      const two = {
        population: 1500000,
        ...one,
      }
      // args.dataをuserにmerge
      const args.data = {
        name: 'andrew',
        email: 'andrew@example.com',
      }
      const user = {
        id: uuidv4(),
        ...args.data
      }
      */
      const user = {
        id: uuidv4(),
        ...args.data,
      }
      users.push(user)
      return user
    },
    deleteUser(parent, args, ctx, info) {
      // findIndex(callback) callbackでtrueとなる初めてのindexをreturn, なければ-1
      const userIndex = users.findIndex((user) => user.id === args.id)
      if (userIndex === -1) {
        throw new Error('User not found')
      }
      // splice(index, number): 破壊的、取り除いた要素をreturn
      const deletedUsers = users.splice(userIndex, 1)
      // 削除されたuserの全postとそのpostの全commentを削除
      posts = posts.filter((post) => {
        // post.authorが削除されたuserのpostならtrue
        const match = post.author === args.id
        // 削除されたuserのpostの場合、そのpostの全comment削除
        if (match) {
          comments = comments.filter((comment) => comment.post !== post.id)
        }
        return !match
      })
      // 削除されたuserの全comment削除
      comments = comments.filter((comment) => comment.author !== args.id)
      return deletedUsers[0]
    },
    createPost(parent, args, ctx, info) {
      // 引数のuserが存在するかcheck
      const userExists = users.some((user) => user.id === args.data.author)
      if (!userExists) {
        throw new Error('User not found')
      }
      const post = {
        id: uuidv4(),
        ...args.data,
      }
      posts.push(post)
      return post
    },
    createComment(parent, args, ctx, info) {
      const userExists = users.some((user) => user.id === args.data.author)
      const postExists = posts.some(
        (post) => post.id === args.data.post && post.published
      )
      if (!userExists || !postExists) {
        throw new Error('Unable to find user and post')
      }
      const comment = {
        id: uuidv4(),
        ...args.data,
      }
      comments.push(comment)
      return comment
    },
  },
  User: {
    posts(parent, args, ctx, info) {
      return posts.filter((post) => post.author === parent.id)
    },
    comments(parent, args, ctx, info) {
      return comments.filter((comment) => {
        return comment.author === parent.id
      })
    },
  },
  Post: {
    // post infoがparentに格納されている
    author(parent, args, ctx, info) {
      return users.find((user) => {
        return user.id === parent.author
      })
    },
    comments(parent, args, ctx, info) {
      return comments.filter((comment) => comment.post === parent.id)
    },
  },
  Comment: {
    author(parent, args, ctx, info) {
      return users.find((user) => user.id === parent.author)
    },
    post(parent, args, ctx, info) {
      return posts.find((post) => post.id === parent.post)
    },
  },
}

const server = new GraphQLServer({
  typeDefs,
  resolvers,
})

server.start(() => {
  console.log('The server is up')
})
