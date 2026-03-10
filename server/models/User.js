const bcrypt = require('bcrypt');
let users = [];

function createUser({ login, password, email, first_name, last_name }) {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: Date.now().toString(),
    login,
    email: email || "",
    first_name: first_name || "",
    last_name: last_name || "",
    password: hashedPassword
  };
  users.push(newUser);
  return newUser;
}

function findUserByLogin(login) {
  return users.find(u => u.login === login);
}

function getUserSafe(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

module.exports = { createUser, findUserByLogin, getUserSafe, users };