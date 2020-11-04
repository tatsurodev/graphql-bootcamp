// scalar types - String, Boolean, Int, Float, ID
// demo user data
const users = [
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

const posts = [
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

const comments = [
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

const db = { users, posts, comments }

export { db as default }
