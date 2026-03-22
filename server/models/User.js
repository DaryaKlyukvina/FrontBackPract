const fs = require('fs');
const path = require('path');

// Путь к файлу базы данных (на один уровень выше текущей папки models)
const dbPath = path.join(__dirname, '../database.json');

// Вспомогательная функция для чтения данных из файла
function readDB() {
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        // Если файла нет или он пустой, возвращаем структуру по умолчанию
        return { users: [], products: [] };
    }
}

// Вспомогательная функция для записи данных в файл
function writeDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

async function createUser({ email, password, first_name, last_name, role }) {
    const db = readDB();
    
    const newUser = {
        id: Date.now().toString(),
        email: email,
        login: email, 
        password: password, // Здесь уже захешированный пароль из auth.js
        first_name: first_name || "",
        last_name: last_name || "",
        role: role || "USER"
    };

    db.users.push(newUser);
    writeDB(db);
    return newUser;
}

async function findUserByEmail(email) {
    const db = readDB();
    return db.users.find(u => u.email === email);
}

function getUserSafe(user) {
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
}

module.exports = { 
    createUser, 
    findUserByEmail, 
    getUserSafe 
};