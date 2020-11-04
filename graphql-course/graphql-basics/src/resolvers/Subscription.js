const Subscription = {
  count: {
    subscribe(parent, args, { pubsub }, info) {
      let count = 0
      setInterval(() => {
        count++
        // publish(channelName, { key: publishedData })
        pubsub.publish('count', {
          count,
        })
      }, 1000)
      // asyncIterator(channelName)
      return pubsub.asyncIterator('count')
    },
  },
  comment: {
    subscribe(parent, { postId }, { db, pubsub }, info) {
      const post = db.posts.find((post) => post.id === postId && post.published)
      if (!post) {
        throw new Error('Post not found')
      }
      return pubsub.asyncIterator(`comment ${postId}`)
    },
  },
}

export { Subscription as default }
