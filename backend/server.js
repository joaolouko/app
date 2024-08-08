const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Conexão com MongoDB
const uri = "mongodb+srv://pires:13795272@perezdb.mfxofrn.mongodb.net/teste?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json()); // Certifique-se de que isso está configurado

const JWT_SECRET = 'your_jwt_secret'; // Substitua por uma chave secreta forte

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};


// GET para pegar as salas do banco de dados
app.get('/dados', authenticateToken, async (req, res) => {
    try {
        await client.connect();
        const database = client.db('teste');
        const collection = database.collection('salas');
        const dados = await collection.find({}).toArray();
        res.json(dados);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar dados' });
    } finally {
        await client.close();
    }
});



app.post('/login', async (req, res) => {
    try {
        const { nome, senha } = req.body; // Verifique se os nomes das propriedades estão corretos
        if (!nome || !senha) {
            return res.status(400).json({ message: 'Nome e senha são necessários' });
        }

        await client.connect();
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
    } finally {
        await client.close();
    }
});

app.put('/reservar-sala/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, nome } = req.user;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }

        await client.connect();
        const database = client.db('teste');
        const collection = database.collection('salas');

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { occuped: true, userId: new ObjectId(userId), reservadoPor: nome } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Sala não encontrada' });
        }

        res.json({ message: 'Sala reservada com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao reservar sala' });
    } finally {
        await client.close();
    }
});


app.get('/minhas-reservas', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;
        await client.connect();
        const database = client.db('teste');
        const collection = database.collection('salas');
        const reservas = await collection.find({ userId: new ObjectId(userId), occuped: true }).toArray();
        res.json(reservas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar reservas' });
    } finally {
        await client.close();
    }
});

app.put('/admin/editar-sala/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }

        await client.connect();
        const database = client.db('teste');
        const collection = database.collection('salas');

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { occuped: false, userId: null, reservadoPor: null } }  // Remove o status de ocupado
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Sala não encontrada' });
        }

        res.json({ message: 'Status da sala atualizado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar o status da sala' });
    } finally {
        await client.close();
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
