const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');

// Substitua '<password>' pela senha real do usuário 'pires'
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
app.use(bodyParser.json());

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


app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
