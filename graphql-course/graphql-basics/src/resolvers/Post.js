const Post = {
  // post infoがparentに格納されている
  author(parent, args, { db }, info) {
    return db.users.find((user) => {
      return user.id === parent.author
    })
  },
  comments(parent, args, { db }, info) {
    return db.comments.filter((comment) => comment.post === parent.id)
  },
}

export { Post as default }
