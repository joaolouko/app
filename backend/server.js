// Conexão com MongoDB
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');

// URI do MongoDB
const uri = "mongodb+srv://pires:13795272@perezdb.mfxofrn.mongodb.net/teste?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

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

const JWT_SECRET = 'your_jwt_secret';

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
        return res.sendStatus(403);
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

// Rota de login
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

// PUT para reservar uma aula específica em uma sala em uma data específica
app.put('/reservar-sala/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { date, aulaIndex } = req.body;
        const { userId, nome } = req.user;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }

        const database = client.db('teste');
        const collection = database.collection('salas');

        // Primeiro, tentamos atualizar uma aula existente na data
        const query = {
            _id: new ObjectId(id),
            "dias.data": date,
            [`dias.$.aulas.${aulaIndex}.occuped`]: false
        };
        const update = {
            $set: {
                [`dias.$.aulas.${aulaIndex}.occuped`]: true,
                [`dias.$.aulas.${aulaIndex}.userId`]: new ObjectId(userId),
                [`dias.$.aulas.${aulaIndex}.reservadoPor`]: nome
            }
        };

        const result = await collection.updateOne(query, update);

        // Se a data não existir, criamos um novo dia com a reserva
        if (result.matchedCount === 0) {
            const newDay = {
                data: date,
                aulas: Array(10).fill().map((_, index) => ({
                    aula: `Aula ${index + 1}`,
                    occuped: index === aulaIndex,
                    userId: index === aulaIndex ? new ObjectId(userId) : null,
                    reservadoPor: index === aulaIndex ? nome : null
                }))
            };

            const addDayQuery = { _id: new ObjectId(id) };
            const addDayUpdate = { $push: { dias: newDay } };

            const addDayResult = await collection.updateOne(addDayQuery, addDayUpdate);

            if (addDayResult.matchedCount === 0) {
                return res.status(404).json({ message: 'Sala não encontrada' });
            }
        }

        notifySalaChange();
        res.json({ message: 'Aula reservada com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao reservar aula' });
    }
});

// GET para buscar as reservas de uma sala em uma data específica
app.get('/reservas/:id/:date', authenticateToken, async (req, res) => {
    try {
        const { id, date } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }

        const database = client.db('teste');
        const collection = database.collection('salas');

        const sala = await collection.findOne({ _id: new ObjectId(id) });

        if (!sala) {
            return res.status(404).json({ message: 'Sala não encontrada' });
        }

        const dia = sala.dias.find(d => d.data === date);

        if (!dia) {
            return res.status(404).json({ message: 'Nenhuma reserva encontrada para a data especificada' });
        }

        res.json(dia.aulas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar reservas' });
    }
});

// GET para buscar as reservas de um usuário
app.get('/minhas-reservas', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;
        const database = client.db('teste');
        const collection = database.collection('salas');
        const reservas = await collection.find({ 'reservas.userId': new ObjectId(userId), 'reservas.occuped': true }).toArray();
        res.json(reservas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar reservas' });
    }
});

// PUT para editar o status de ocupação de uma aula específica
// PUT para o administrador remover a ocupação de uma aula específica
app.put('/admin/remover-ocupacao/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { date, aulaIndex } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }

        const database = client.db('teste');
        const collection = database.collection('salas');

        const query = {
            _id: new ObjectId(id),
            "dias.data": date,
            [`dias.$.aulas.${aulaIndex}.occuped`]: true
        };
        const update = {
            $set: {
                [`dias.$.aulas.${aulaIndex}.occuped`]: false,
                [`dias.$.aulas.${aulaIndex}.userId`]: null,
                [`dias.$.aulas.${aulaIndex}.reservadoPor`]: null
            }
        };

        const result = await collection.updateOne(query, update);

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Aula ou sala não encontrada ou já está desocupada' });
        }

        notifySalaChange();
        res.json({ message: 'Ocupação removida com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao remover ocupação' });
    }
});

// POST para criar uma nova sala com aulas definidas para vários dias
app.post('/admin/criar-sala', authenticateToken, async (req, res) => {
    const { nome, dias } = req.body;

    try {
        const database = client.db('teste');
        const collection = database.collection('salas');

        const novaSala = {
            nome,
            dias: dias || []  // Garantir que dias seja sempre um array
        };

        const result = await collection.insertOne(novaSala);

        if (result.acknowledged) {
            // Buscar o documento inserido
            const createdSala = await collection.findOne({ _id: result.insertedId });
            res.status(201).json(createdSala); // Retorna a nova sala criada
        } else {
            res.status(500).json({ error: 'Erro ao criar sala' });
        }
    } catch (error) {
        console.error('Erro ao criar sala:', error);
        res.status(500).json({ error: 'Erro ao criar sala' });
    }
});




// DELETE para excluir uma sala
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
