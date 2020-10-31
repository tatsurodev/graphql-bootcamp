import { GraphQLServer } from 'graphql-yoga'

// type definitions (schema)
const typeDefs = `
  type Query {
    hello: String!
    name: String!
    location: String!
    bio: String!
  }
`

// resolvers
const resolvers = {
  Query: {
    hello() {
      return 'This is my first query!'
    },
    name() {
      return 'Andrew Mead'
    },
    location() {
      return 'Japan'
    },
    bio() {
      return 'I like udemy!'
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
