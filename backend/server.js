// Conexão com MongoDB
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

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



const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});



app.use(limiter);
app.use(helmet());

const JWT_SECRET = 'your_jwt_secret';

const notifySalaChange = () => {
    io.emit('updateSalas');
};

const authenticateToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        console.error('Token não fornecido');
        return res.status(401).json({ message: 'Token não fornecido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Erro na verificação do token:', err.message);
            return res.status(403).json({ message: 'Token inválido' });
        }

        req.user = user;
        console.log('Usuário autenticado:', user); // Log para verificar o conteúdo do usuário autenticado
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

        // Procura o usuário no banco de dados
        const user = await collection.findOne({ nome });
        if (!user) {
            return res.status(400).json({ message: 'Credenciais inválidas' });
        }

        // Verifica se o usuário está desativado
        if (user.isDeleted) {
            return res.status(400).json({ message: 'Sua conta foi desativada. Entre em contato com o administrador.' });
        }

        // Verifica a senha
        const isPasswordValid = await bcrypt.compare(senha, user.senha);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Credenciais inválidas' });
        }

        // Gera o token JWT
        const token = jwt.sign({ userId: user._id, nome: user.nome }, JWT_SECRET, { expiresIn: '1h' });

        // Retorna o token, userId e outras informações necessárias
        res.json({
            token,
            userId: user._id,  // Envia o userId explicitamente
            role: user.role || 'user'  // Retorna o role, se existir
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao fazer login' });
    }
});



// PUT para reservar uma aula específica em uma sala em uma data específica
app.put('/reservar-sala/:id', limiter ,authenticateToken, async (req, res) => {
    console.log('ID da sala:', req.params.id);  // Verifique o ID aqui
    try {
        const { id } = req.params;
        const { date, hora } = req.body;  // Recebe 'hora' da requisição
        const { userId, nome } = req.user; // ID do usuário e nome

        // Verificar se o ID da sala é válido
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }

        const database = client.db('teste');
        const collection = database.collection('salas');

        // Verifica a data na sala
        const query = {
            _id: new ObjectId(id),
            "dias.data": date
        };

        // Índice da hora
        const horaIndex = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'].indexOf(hora);

        if (horaIndex === -1) {
            return res.status(400).json({ message: 'Hora inválida' });
        }

        // Realiza a atualização se o dia já existir
        const update = {
            $set: {
                [`dias.$.aulas.${horaIndex}.occuped`]: true,
                [`dias.$.aulas.${horaIndex}.userId`]: new ObjectId(userId),
                [`dias.$.aulas.${horaIndex}.reservadoPor`]: nome,
                [`dias.$.aulas.${horaIndex}.horario`]: hora // Define o horário corretamente
            }
        };
        

        const result = await collection.updateOne(query, update);

        // Se o dia não existir, cria um novo dia
        if (result.matchedCount === 0) {
            const newDay = {
                data: date,
                aulas: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'].map((hora, index) => ({
                    horario: hora, // Preenche o horário corretamente
                    occuped: index === horaIndex,
                    userId: index === horaIndex ? new ObjectId(userId) : null,
                    reservadoPor: index === horaIndex ? nome : null
                }))
            };
            

            // Adiciona o novo dia
            const addDayQuery = { _id: new ObjectId(id) };
            const addDayUpdate = { $push: { dias: newDay } };

            const addDayResult = await collection.updateOne(addDayQuery, addDayUpdate);

            if (addDayResult.matchedCount === 0) {
                return res.status(404).json({ message: 'Sala não encontrada' });
            }
        }

        // Notifica mudanças, caso necessário
        notifySalaChange();

        // Retorna uma mensagem de sucesso
        res.json({ message: 'Aula reservada com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao reservar aula' });
    }
    
});



// GET para buscar as reservas de uma sala em uma data específica
app.get('/reservas/:id/:date', limiter, authenticateToken, async (req, res) => {
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

        // Verifique se o dia já existe
        let dia = sala.dias.find(d => d.data === date);

        if (!dia) {
            // Se o dia não existir, crie-o com os horários de 08:00 até 21:30
            const horarios = [];
            for (let hour = 8; hour <= 21; hour++) {
                for (let minute = 0; minute <= 30; minute += 30) {
                    const hourString = hour < 10 ? `0${hour}` : `${hour}`;
                    const minuteString = minute === 0 ? '00' : '30';
                    const horario = `${hourString}:${minuteString}`;
                    horarios.push({ horario, occuped: false, userId: null, reservadoPor: null });
                }
            }

            dia = {
                data: date,
                aulas: horarios
            };

            // Adiciona o novo dia com os horários
            sala.dias.push(dia);
            await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { dias: sala.dias } }
            );
        }

        // Filtra as aulas para mostrar apenas as não ocupadas
        const aulasDisponiveis = dia.aulas.filter(aula => !aula.occuped);

        res.json(aulasDisponiveis);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar reservas' });
    }
});




// GET para buscar as reservas de um usuário
app.get('/minhas-reservas', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user; // Obtendo o ID do usuário autenticado
        const database = client.db('teste');
        const collection = database.collection('salas');

        // Buscar todas as salas
        const salas = await collection.find({}).toArray();

        // Filtrar reservas de cada sala para o usuário autenticado
        const reservas = salas.map(sala => {
            const diasReservados = sala.dias.map(dia => {
                const aulasReservadas = dia.aulas.filter(aula =>
                    aula.occuped && aula.userId.toString() === userId // Filtra as aulas ocupadas pelo usuário
                );

                // Retornar apenas os dias que contêm aulas reservadas
                if (aulasReservadas.length > 0) {
                    return {
                        data: dia.data,
                        aulas: aulasReservadas.map(aula => ({
                            aula: aula.aula,
                            reservadoPor: aula.reservadoPor,
                            userId: aula.userId
                        }))
                    };
                }
                return null; // Retorna null se não houver aulas reservadas
            }).filter(dia => dia !== null); // Remove dias sem reservas

            // Retornar sala apenas se tiver dias reservados
            if (diasReservados.length > 0) {
                return {
                    _id: sala._id,
                    nome: sala.nome,
                    dias: diasReservados
                };
            }
            return null; // Retorna null se não houver dias reservados
        }).filter(sala => sala !== null); // Remove salas sem reservas

        res.json(reservas); // Retorna as reservas filtradas
    } catch (error) {
        console.error('Erro ao buscar reservas:', error);
        res.status(500).json({ message: 'Erro ao buscar reservas' });
    }
});


// Rota para cancelar uma reserva específica
// Rota para cancelar uma reserva específica
app.put('/usuario/cancelar-reserva/:salaId', async (req, res) => {
    const { salaId } = req.params;
    const { diaIndex, aulaIndex } = req.body;

    try {
        // Lógica para cancelar a reserva
        const database = client.db('teste');
        const collection = database.collection('salas');

        // Buscar a sala no banco de dados
        const sala = await collection.findOne({ _id: new ObjectId(salaId) });
        if (!sala) {
            return res.status(404).json({ message: 'Sala não encontrada' });
        }

        // Verificar se a reserva existe
        const dia = sala.dias[diaIndex];
        if (!dia) {
            return res.status(404).json({ message: 'Dia não encontrado' });
        }

        const aula = dia.aulas[aulaIndex];
        if (!aula || !aula.occuped) {
            return res.status(404).json({ message: 'Reserva não encontrada' });
        }

        // Cancelar a reserva
        aula.occuped = false;
        aula.userId = null; // Limpar o userId

        // Atualizar a sala no banco de dados
        await collection.updateOne(
            { _id: new ObjectId(salaId) },
            { $set: { [`dias.${diaIndex}.aulas.${aulaIndex}`]: aula } }
        );

        res.status(200).json({ message: 'Reserva cancelada com sucesso!' });
    } catch (error) {
        console.error('Erro ao cancelar reserva:', error);
        res.status(500).json({ message: 'Erro ao cancelar reserva' });
    }
});



// PUT para o administrador remover a ocupação de uma aula específica
app.put('/admin/remover-ocupacao/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { diaIndex, aulaIndex } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }

        const database = client.db('teste');
        const collection = database.collection('salas');

        const result = await collection.updateOne(
            { _id: new ObjectId(id), [`dias.${diaIndex}.aulas.${aulaIndex}.occuped`]: true },
            {
                $set: {
                    [`dias.${diaIndex}.aulas.${aulaIndex}.occuped`]: false,
                    [`dias.${diaIndex}.aulas.${aulaIndex}.userId`]: null,
                    [`dias.${diaIndex}.aulas.${aulaIndex}.reservadoPor`]: null
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Sala ou aula não encontrada' });
        }

        io.emit('updateSalas', { salaId: id })

        res.json({ message: 'Ocupação removida com sucesso!' });
    } catch (error) {
        console.error('Erro ao remover ocupação da aula:', error);
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
            dias: dias || [],  // Garantir que dias seja sempre um array
            isDeleted: false   // Define o campo isDeleted como false por padrão
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


app.get('/usuarios', authenticateToken, async (req, res) => {
    try {
        const database = client.db('teste');
        const collection = database.collection('usuarios');

        const usuarios = await collection.find({ isDeleted: { $ne: true } }).toArray();

        res.status(200).json(usuarios);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ message: 'Erro ao buscar usuários' });
    }
});


// Rota: Criar novo usuário
app.post('/usuarios', authenticateToken, async (req, res) => {
    const { nome, senha } = req.body;

    if (!nome || !senha || senha.trim() === '') {
        return res.status(400).json({ message: 'Nome e senha são obrigatórios' });
    }

    try {
        const hashedPassword = await bcrypt.hash(senha, 10);

        const database = client.db('teste');
        const collection = database.collection('usuarios');

        const newUser = { nome, senha: hashedPassword };

        await collection.insertOne(newUser);

        res.status(201).json({ message: 'Usuário criado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao criar usuário' });
    }
});

// Rota: Atualizar senha do usuário
app.put('/usuarios/:id/senha', authenticateToken, async (req, res) => {
    const userId = req.params.id;
    const { senha } = req.body;

    if (!senha || senha.trim() === '') {
        return res.status(400).json({ message: 'Senha não pode ser vazia' });
    }

    try {
        const hashedPassword = await bcrypt.hash(senha, 10);

        const database = client.db('teste');
        const collection = database.collection('usuarios');

        const result = await collection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { senha: hashedPassword } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        res.status(200).json({ message: 'Senha atualizada com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar a senha' });
    }
});

// Rota: Excluir usuário
app.put('/usuarios/:id', authenticateToken, async (req, res) => {
    const userId = req.params.id;

    try {
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'ID inválido' });
        }

        const database = client.db('teste');
        const usuariosCollection = database.collection('usuarios');
        const salasCollection = database.collection('salas');

        // Atualiza o usuário para isDeleted: true
        const userUpdateResult = await usuariosCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { isDeleted: true } }
        );

        if (userUpdateResult.modifiedCount === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Desocupa todas as reservas feitas pelo usuário
        await salasCollection.updateMany(
            { "dias.aulas.userId": new ObjectId(userId) },
            {
                $set: {
                    "dias.$[].aulas.$[aula].occuped": false,
                    "dias.$[].aulas.$[aula].userId": null,
                    "dias.$[].aulas.$[aula].reservadoPor": null
                }
            },
            { arrayFilters: [{ "aula.userId": new ObjectId(userId) }] }
        );

        res.status(200).json({ message: 'Usuário excluído e reservas desocupadas com sucesso.' });
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        res.status(500).json({ message: 'Erro ao excluir usuário.' });
    }
});



// DELETE para excluir uma sala
app.put('/admin/excluir-sala/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID inválido' });
        }

        const database = client.db('teste');
        const collection = database.collection('salas');

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { isDeleted: true } }
        );

        notifySalaChange();

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Sala não encontrada' });
        }

        res.json({ message: 'Sala marcada como excluída com sucesso' });
    } catch (error) {
        console.error('Erro ao marcar sala como excluída:', error);
        res.status(500).json({ message: 'Erro ao marcar sala como excluída' });
    }
});

app.get('/public/reservas', async (req, res) => {
    try {
        const db = client.db('teste');
        const salasCollection = db.collection('salas');
        const usersCollection = db.collection('usuarios');

        // Busca os usuários com isDeleted: true
        const deletedUsers = await usersCollection.find({ isDeleted: true }).toArray();
        const deletedUserIds = deletedUsers.map(user => user._id.toString());

        // Busca as salas e filtra as reservas
        const salas = await salasCollection.find({}).toArray();
        const filteredSalas = salas.map(sala => {
            const diasFiltrados = sala.dias.map(dia => ({
                ...dia,
                aulas: dia.aulas.filter(aula => aula.occuped && !deletedUserIds.includes(aula.userId?.toString()))
            }));

            // Retorna apenas os dias que possuem reservas válidas
            return {
                ...sala,
                dias: diasFiltrados.filter(dia => dia.aulas.length > 0)
            };
        });

        res.json(filteredSalas);
    } catch (error) {
        console.error('Erro ao buscar reservas públicas:', error);
        res.status(500).json({ message: 'Erro ao buscar reservas públicas' });
    }
});

server.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
