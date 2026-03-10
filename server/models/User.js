const bcrypt = require('bcrypt');
let users = [];

function createUser({ login, password }) {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: Date.now().toString(),
    login,
    password: hashedPassword
  };
  users.push(newUser);
  return newUser;
}

function findUserByLogin(login) {
  return users.find(u => u.login === login);
}

module.exports = { createUser, findUserByLogin, users };