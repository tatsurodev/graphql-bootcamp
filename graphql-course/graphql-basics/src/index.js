import { GraphQLServer } from 'graphql-yoga'
import { v4 as uuidv4 } from 'uuid'
import db from './db'

// resolvers
const resolvers = {
  Query: {
    users(parent, args, { db }, info) {
      if (!args.query) {
        return db.users
      }
      return db.users.filter((user) => {
        return user.name.toLowerCase().includes(args.query.toLowerCase())
      })
    },
    posts(parent, args, { db }, info) {
      if (!args.query) {
        return db.posts
      }
      return db.posts.filter((post) => {
        const isTitleMatch = post.title
          .toLowerCase()
          .includes(args.query.toLowerCase())
        const isBodyMatch = post.body
          .toLowerCase()
          .includes(args.query.toLowerCase())
        return isBodyMatch || isBodyMatch
      })
    },
    comments(parent, args, { db }, info) {
      return db.comments
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
    createUser(parent, args, { db }, info) {
      const emailTaken = db.users.some((user) => user.email === args.data.email)
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
      db.users.push(user)
      return user
    },
    deleteUser(parent, args, { db }, info) {
      // findIndex(callback) callbackでtrueとなる初めてのindexをreturn, なければ-1
      const userIndex = db.users.findIndex((user) => user.id === args.id)
      if (userIndex === -1) {
        throw new Error('User not found')
      }
      // splice(index, number): 破壊的、取り除いた要素をreturn
      const deletedUsers = db.users.splice(userIndex, 1)
      // 削除されたuserの全postとそのpostの全commentを削除
      db.posts = db.posts.filter((post) => {
        // post.authorが削除されたuserのpostならtrue
        const match = post.author === args.id
        // 削除されたuserのpostの場合、そのpostの全comment削除
        if (match) {
          db.comments = db.comments.filter(
            (comment) => comment.post !== post.id
          )
        }
        return !match
      })
      // 削除されたuserの全comment削除
      db.comments = db.comments.filter((comment) => comment.author !== args.id)
      return deletedUsers[0]
    },
    createPost(parent, args, { db }, info) {
      // 引数のuserが存在するかcheck
      const userExists = db.users.some((user) => user.id === args.data.author)
      if (!userExists) {
        throw new Error('User not found')
      }
      const post = {
        id: uuidv4(),
        ...args.data,
      }
      db.posts.push(post)
      return post
    },
    deletePost(parent, args, { db }, info) {
      const postIndex = db.posts.findIndex((post) => post.id === args.id)
      if (postIndex === -1) {
        throw new Error('Post not found')
      }
      const deletedPosts = db.posts.splice(postIndex, 1)
      db.comments = db.comments.filter((comment) => comment.post !== args.id)
      return deletedPosts[0]
    },
    createComment(parent, args, { db }, info) {
      const userExists = db.users.some((user) => user.id === args.data.author)
      const postExists = db.posts.some(
        (post) => post.id === args.data.post && post.published
      )
      if (!userExists || !postExists) {
        throw new Error('Unable to find user and post')
      }
      const comment = {
        id: uuidv4(),
        ...args.data,
      }
      db.comments.push(comment)
      return comment
    },
    deleteComment(parent, args, { db }, info) {
      const commentIndex = db.comments.findIndex(
        (comment) => comment.id === args.id
      )
      if (commentIndex === -1) {
        throw new Error('Comment not found')
      }
      const deletedComments = db.comments.splice(commentIndex, 1)
      return deletedComments[0]
    },
  },
  User: {
    posts(parent, args, { db }, info) {
      return db.posts.filter((post) => post.author === parent.id)
    },
    comments(parent, args, { db }, info) {
      return db.comments.filter((comment) => {
        return comment.author === parent.id
      })
    },
  },
  Post: {
    // post infoがparentに格納されている
    author(parent, args, { db }, info) {
      return db.users.find((user) => {
        return user.id === parent.author
      })
    },
    comments(parent, args, { db }, info) {
      return db.comments.filter((comment) => comment.post === parent.id)
    },
  },
  Comment: {
    author(parent, args, { db }, info) {
      return db.users.find((user) => user.id === parent.author)
    },
    post(parent, args, { db }, info) {
      return db.posts.find((post) => post.id === parent.post)
    },
  },
}

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: {
    db,
  },
})

server.start(() => {
  console.log('The server is up')
})
