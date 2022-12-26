import express, { NextFunction, Request, Response, Router } from 'express';
import cors from 'cors';
import https from 'https';
import files from 'fs';


// Cadeias de Rotas (Grupo de rotas).
import gponOnusDbmRoute from './routes/gponOnusDbm';
import usersRouter from './routes/login';
import jwtProtected from './Http/Middlewares/JwtMiddleware';
import gponAnalyticsRouter from './routes/gponAnalytics';
 
const server = express();
const route = Router();

/**
 * Necessário configurar JSON para o aceite de requisições do tipo application/json.
 */
server.use(express.json());

/**
 * Necessário para controle de requisões e fraudes de localidade.
 */
server.use(cors());

/**
 * Rota de apresentação lao usuário que bater na porta principal. 
 * Necessário haver um valor inicial para reconhecimento, especificamente requisitado pelo Grafana 
 * ao criar um datasource.
 */
route.all("/", (request: Request, response: Response) => {
    return response.json("Hello! Welcome to api Analytics Server!");
});

/**
 * Routes: 
 *  -> Destinadas a rotas padrões de apresentação.
 */
server.use(route)

/**
 * Routes:
 *  -> Destinados a usuários e suas configurações.
 */
server.use("/users", usersRouter);

/**
 * Routes: 
 *  -> Destinadas a função de recolhimento de dados voltados a ONUs. 
 */
server.use("/datacom", jwtProtected, [gponOnusDbmRoute,gponAnalyticsRouter]);


/**
 * Criando servidor e configurando certificados SSL. 
 */
const sslServer = https.createServer({
    cert: files.readFileSync(`${__dirname}/../certs/certificate.pem`), 
    key: files.readFileSync(`${__dirname}/../certs/key.pem`),
}, server);

/**
 * Iniciando escuta do servidor.
 */
sslServer.listen(8081, () => {
    console.log("Server listening....");
});
