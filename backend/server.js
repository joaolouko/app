const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');

// Conexão com MongoDB
const uri = "mongodb+srv://pires:13795272@perezdb.mfxofrn.mongodb.net/teste?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Conectando ao MongoDB fora dos handlers para manter a conexão aberta
async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Conectado ao MongoDB com sucesso!');
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB:', error);
    }
}
connectToDatabase();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*'
    }
});
const port = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

const JWT_SECRET = 'your_jwt_secret'; // Substitua por uma chave secreta forte

const notifySalaChange = () => {
    io.emit('updateSalas');
};

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const authorizeAdmin = (req, res, next) => {
    if (!req.user || !req.user.admin) {
        return res.sendStatus(403); // Forbidden
    }
    next();
};

// GET para pegar as salas do banco de dados
app.get('/dados', authenticateToken, async (req, res) => {
    try {
        const database = client.db('teste');
        const collection = database.collection('salas');
        const dados = await collection.find({}).toArray();
        res.json(dados);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar dados' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { nome, senha } = req.body;
        if (!nome || !senha) {
            return res.status(400).json({ message: 'Nome e senha são necessários' });
        }

        const database = client.db('teste');
        const collection = database.collection('usuarios');

        const user = await collection.findOne({ nome });
        if (!user) {
            return res.status(400).json({ message: 'Credenciais inválidas' });
        }

        const isPasswordValid = await bcrypt.compare(senha, user.senha);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Credenciais inválidas' });
        }

        const token = jwt.sign({ userId: user._id, nome: user.nome }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao fazer login' });
    }
});

app.put('/reservar-sala/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, nome } = req.user;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }

        const database = client.db('teste');
        const collection = database.collection('salas');

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { occuped: true, userId: new ObjectId(userId), reservadoPor: nome } }
        );
        notifySalaChange();
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Sala não encontrada' });
        }

        res.json({ message: 'Sala reservada com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao reservar sala' });
    }
});

app.get('/minhas-reservas', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;
        const database = client.db('teste');
        const collection = database.collection('salas');
        const reservas = await collection.find({ userId: new ObjectId(userId), occuped: true }).toArray();
        res.json(reservas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar reservas' });
    }
});

app.put('/admin/editar-sala/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }

        const database = client.db('teste');
        const collection = database.collection('salas');

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { occuped: false, userId: null, reservadoPor: null } }
        );
        notifySalaChange();
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Sala não encontrada' });
        }

        res.json({ message: 'Status da sala atualizado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar o status da sala' });
    }
});

app.post('/admin/criar-sala', authenticateToken, async (req, res) => {
    try {
        const { nome } = req.body;

        const database = client.db('teste');
        const collection = database.collection('salas');

        const result = await collection.insertOne({ nome, occuped: false, userId: null, reservadoPor: null });
        notifySalaChange();
        res.status(201).json({ message: 'Sala criada com sucesso!', id: result.insertedId });
    } catch (error) {
        console.error('Erro ao criar sala:', error);
        res.status(500).json({ message: 'Erro ao criar sala', error: error.message });
    }
});

app.delete('/admin/excluir-sala/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }

        const database = client.db('teste');
        const collection = database.collection('salas');

        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        notifySalaChange();

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Sala não encontrada' });
        }

        res.json({ message: 'Sala excluída com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir sala:', error);
        res.status(500).json({ message: 'Erro ao excluir sala' });
    }
});

server.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
