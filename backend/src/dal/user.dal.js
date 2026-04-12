const users = []

exports.findByEmail = (email) => {
  return users.find(u => u.email === email)
}

exports.createUser = (user) => {
  users.push(user)
  return user
}
