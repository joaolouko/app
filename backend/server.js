const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
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

// GET para pegar as salas do banco de dados
app.get('/dados', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('teste');  // Nome do banco de dados
        const collection = database.collection('salas');  // Nome da coleção

        const nomeFiltro = req.query.nome || '';  // Obter o valor do parâmetro de consulta 'nome'
        const query = nomeFiltro ? { nome: new RegExp(nomeFiltro, 'i') } : {};  // Usar expressão regular para filtro case-insensitive

        const cursor = collection.find(query, { projection: { _id: 0, nome: 1, occuped: 1 } });

        const todosOsNomes = await cursor.toArray();

        res.json(todosOsNomes);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao buscar dados');
    }
});


const JWT_SECRET = 'your_jwt_secret'; // Substitua por uma chave secreta forte

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

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
