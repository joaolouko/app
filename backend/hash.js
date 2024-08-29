const bcrypt = require('bcrypt');
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://pires:13795272@perezdb.mfxofrn.mongodb.net/teste?retryWrites=true&w=majority";

async function hashPassword() {
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    try {
        await client.connect();
        const database = client.db('teste');
        const collection = database.collection('usuarios');

        const user = await collection.findOne({ nome: 'armando' });
        if (user) {
            const hashedPassword = await bcrypt.hash('1234', 10); // Utilize a senha real aqui
            await collection.updateOne({ _id: user._id }, { $set: { senha: hashedPassword } });
            console.log('Senha atualizada com sucesso!');
        } else {
            console.log('Usuário não encontrado');
        }
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}

hashPassword();
