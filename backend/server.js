const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Petereval123@',
    database: 'dbtestes',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.get('/api/data/', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Erro ao conectar ao banco de dados:', err);
            res.status(500).json({ status: 'error', error: 'Erro interno do servidor' });
            return;
        }
        
        // Primeira consulta: Selecionando todos os registros da tabela tbcurso
        connection.query('SELECT * FROM clientes', (error1, results1) => {
            if (error1) {
                connection.release();
                console.error('Erro ao consultar dados:', error1);
                res.status(500).json({ status: 'error', error: 'Erro interno do servidor' });
                return;
            }

            res.json(results1)
            // Segunda consulta: Selecionando todos os registros da tabela tborientador
            connection.release()
        });
    });
});


app.listen(port, () => {
    console.log(`Servidor funcionando na porta ${port}`);
});