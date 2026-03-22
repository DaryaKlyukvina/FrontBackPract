const fs = require('fs');
const path = require('path');

// Путь к файлу базы данных
const dbPath = path.join(__dirname, '../database.json');

// Вспомогательная функция для чтения данных
function readDB() {
    try {
        if (!fs.existsSync(dbPath)) {
            return { users: [], products: [] };
        }
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return { users: [], products: [] };
    }
}

// Вспомогательная функция для записи данных
function writeDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

// --- ОСНОВНЫЕ ФУНКЦИИ ---

// Получить всех пользователей (для админки)
async function getAllUsers() {
    const db = readDB();
    return db.users;
}

// Найти одного по ID
async function findUserById(id) {
    const db = readDB();
    return db.users.find(u => u.id.toString() === id.toString());
}

async function findUserByEmail(email) {
    const db = readDB();
    return db.users.find(u => u.email === email);
}

async function createUser({ email, password, first_name, last_name, role }) {
    const db = readDB();
    
    const newUser = {
        id: Date.now().toString(),
        email: email,
        login: email, 
        password: password, 
        first_name: first_name || "",
        last_name: last_name || "",
        role: role || "USER",
        isBlocked: false // По умолчанию пользователь активен
    };

    db.users.push(newUser);
    writeDB(db);
    return newUser;
}

// УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ОБНОВЛЕНИЯ (для смены роли и блокировки)
async function updateUser(id, updateData) {
    const db = readDB();
    const index = db.users.findIndex(u => u.id.toString() === id.toString());
    
    if (index === -1) return null;

    // Обновляем только те поля, которые прислали (role, isBlocked, first_name и т.д.)
    db.users[index] = { ...db.users[index], ...updateData };
    
    writeDB(db);
    return db.users[index];
}

function getUserSafe(user) {
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
}

module.exports = { 
    createUser, 
    findUserByEmail, 
    findUserById,
    getAllUsers,
    updateUser,
    getUserSafe 
};