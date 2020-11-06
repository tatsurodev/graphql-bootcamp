import { v4 as uuidv4 } from 'uuid'

const Mutation = {
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
        db.comments = db.comments.filter((comment) => comment.post !== post.id)
      }
      return !match
    })
    // 削除されたuserの全comment削除
    db.comments = db.comments.filter((comment) => comment.author !== args.id)
    return deletedUsers[0]
  },
  updateUser(parent, args, { db }, info) {
    const { id, data } = args
    const user = db.users.find((user) => user.id === id)
    if (!user) {
      throw new Error('User not found')
    }
    // emailの重複check, なければ更新
    if (typeof data.email === 'string') {
      const emailTaken = db.users.some((user) => user.email === data.email)
      if (emailTaken) {
        throw new Error('Email taken')
      }
      user.email = data.email
    }
    if (typeof data.name === 'string') {
      user.name = data.name
    }
    if (typeof data.age !== 'undefined') {
      user.age = data.age
    }
    return user
  },
  createPost(parent, args, { db, pubsub }, info) {
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
    if (args.data.published) {
      pubsub.publish('post', {
        post: {
          mutation: 'CREATED',
          data: post,
        },
      })
    }
    return post
  },
  deletePost(parent, args, { db, pubsub }, info) {
    const postIndex = db.posts.findIndex((post) => post.id === args.id)
    if (postIndex === -1) {
      throw new Error('Post not found')
    }
    const [post] = db.posts.splice(postIndex, 1)
    db.comments = db.comments.filter((comment) => comment.post !== args.id)
    if (post.published) {
      pubsub.publish('post', {
        post: {
          mutation: 'DELETED',
          data: post,
        },
      })
    }
    return post
  },
  updatePost(parent, args, { db, pubsub }, info) {
    const { id, data } = args
    const post = db.posts.find((post) => post.id === id)
    const originalPost = { ...post }
    if (!post) {
      throw new Error('Post not found')
    }
    if (typeof data.title === 'string') {
      post.title = data.title
    }
    if (typeof data.body === 'string') {
      post.body = data.body
    }
    // 更新されるdataにpublishedが含まれる
    if (typeof data.published === 'boolean') {
      post.published = data.published
      // published true->false
      if (originalPost.published && !post.published) {
        // deleted
        pubsub.publish('post', {
          post: {
            mutation: 'DELETED',
            data: originalPost,
          },
        })
        // published false->true
      } else if (!originalPost.published && post.published) {
        // create
        pubsub.publish('post', {
          post: {
            mutation: 'CREATED',
            data: post,
          },
        })
      }
      // 更新されるdataにpublishedが含まれない && 対象postのpublishedがtrue
    } else if (post.published) {
      // update
      pubsub.publish('post', {
        post: {
          mutation: 'UPDATED',
          data: post,
        },
      })
    }
    return post
  },
  createComment(parent, args, { db, pubsub }, info) {
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
    // commentが作成される度にそのcommentを該当のchannelにpublish
    pubsub.publish(`comment ${args.data.post}`, {
      comment: {
        mutation: 'CREATED',
        data: comment,
      },
    })
    return comment
  },
  deleteComment(parent, args, { db, pubsub }, info) {
    const commentIndex = db.comments.findIndex(
      (comment) => comment.id === args.id
    )
    if (commentIndex === -1) {
      throw new Error('Comment not found')
    }
    const [deletedComment] = db.comments.splice(commentIndex, 1)
    pubsub.publish(`comment ${deletedComment.post}`, {
      comment: {
        mutation: 'DELETED',
        data: deletedComment,
      },
    })
    return deletedComment
  },
  updateComment(parent, args, { db, pubsub }, info) {
    const { id, data } = args
    const comment = db.comments.find((comment) => comment.id === id)
    if (!comment) {
      throw new Error('Comment not found')
    }
    if (typeof data.text === 'string') {
      comment.text = data.text
    }
    pubsub.publish(`comment ${comment.post}`, {
      comment: {
        mutation: 'UPDATED',
        data: comment,
      },
    })
    return comment
  },
}

export { Mutation as default }
