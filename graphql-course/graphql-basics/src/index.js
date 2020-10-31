import { GraphQLServer } from 'graphql-yoga'

// scalar types - String, Boolean, Int, Float, ID

// type definitions (schema)
const typeDefs = `
  type Query {
    title: String!
    price: Float!
    releaseYear: Int
    rating: Float
    inStock: Boolean!
  }
`

// resolvers
const resolvers = {
  Query: {
    title() {
      return 'The War of Art'
    },
    price() {
      return 12.99
    },
    releaseYear() {
      return 2008
    },
    rating() {
      return 5
    },
    inStock() {
      return true
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
