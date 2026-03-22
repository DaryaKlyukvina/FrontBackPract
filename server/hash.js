const bcrypt = require('bcrypt');

const password = '1234'; // пароль, который нужно зашифровать
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    console.log(`Пароль: ${password}`);
    console.log(`Хеш для вставки в JSON: ${hash}`);
});