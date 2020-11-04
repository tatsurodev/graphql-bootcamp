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
}

export { Subscription as default }
