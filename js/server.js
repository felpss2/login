const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')


const SECRET_KEY = 'faz_o_l'; // Troque para um segredo seguro


app.use(cors(/*{
    origin: 'http://127.0.0.1:5500'
}*/ ));


app.use(bodyParser.json());

// Conexão com o banco de dados
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'login'
});



app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Busca o usuário pelo email
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            // Compara a senha fornecida com o hash armazenado no banco
            const match = await bcrypt.compare(password, results[0].password);

            if (match) {
                res.sendStatus(200); // Login bem-sucedido
            } else {
                res.status(401).send('Credenciais inválidas');
            }
        } else {
            res.status(401).send('Credenciais inválidas');
        }

        const token = jwt.sign(
            { id: result[0].id, email: result[0].email },  // Dados que serão incluídos no token
            JWT_SECRET,  // Segredo usado para assinar o token
            { expiresIn: '1h' }  // Define que o token expira em 1 hora
          );
      
          // Retorna o token ao cliente
          res.json({ token });

     
    });
});






app.post('/register', async (req, res) => {
    const { email, password } = req.body;


    // Gera o hash da senha com um salt de 10 rounds
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query('SELECT email FROM users WHERE email = ?', [email], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            return res.status(400).send('Usuário já existe');
        }

        // Insere o email e a senha criptografada no banco de dados
        db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], (err, result) => {
            if (err) throw err;
            res.sendStatus(201); // Usuário registrado com sucesso
        });

    });

});

function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; // Extrai o token do cabeçalho 'Authorization'
  
    if (!token) return res.sendStatus(401); // Se não houver token, retorna 401 (não autorizado)
  
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403); // Se o token for inválido ou expirado, retorna 403 (proibido)
      req.user = user; // Se o token for válido, armazena os dados do usuário no 'req'
      next(); // Continua para a próxima função
    });
  }


  app.get('/user', authenticateToken, (req, res) => {
    const userId = req.user.id; // Obtém o ID do usuário do token
  
    db.query('SELECT email FROM users WHERE id = ?', [userId], (err, result) => {
      if (err) throw    err;
      if (result.length > 0) {
        res.json(result[0]); // Retorna os dados do usuário
      } else {
        res.status(404).send('Usuário não encontrado');
      }
    });
  }); 


  app.delete('/usuarios/:id', (req, res) => {
    // Extrai o ID do usuário dos parâmetros da URL
    const { id } = req.params;
    // Executa uma consulta SQL para deletar o usuário com o ID fornecido
    connection.query('DELETE FROM usuarios WHERE id = ?', [id], (error, results) => {
      if (error) {
        // Caso ocorra um erro ao deletar, envia uma resposta de erro com status 500
        res.status(500).send('Erro ao deletar usuário.');
        return;
      }
      // Envia uma mensagem de sucesso indicando que o usuário foi deletado
      res.send('Usuário deletado com sucesso.');
    });
  }); 





app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
