import express, { NextFunction, Request, Response, Router } from 'express';
import cors from 'cors';
import https from 'https';
import files from 'fs';


// Cadeias de Rotas (Grupo de rotas).
import gponOnusDbmRoute from './routes/gponOnusDbm';
import usersRouter from './routes/login';
import jwtProtected from './Http/Middlewares/JwtMiddleware';
import gponAnalyticsRouter from './routes/gponAnalytics';
import gponOnusDbmRouteV2 from './routes/gponOnusDbmV2';
import percentilRouter from './routes/percentil';
import popsRouter from './routes/pops';
 
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
    console.log('aqui')
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
server.use("/get-onus-dbm", jwtProtected, [gponOnusDbmRoute,gponAnalyticsRouter]);


/**
 * .
 */
server.use("/datacom", [gponOnusDbmRouteV2]);


server.use('/percentil', jwtProtected, [percentilRouter]);


server.use('/pops', jwtProtected, [popsRouter]);


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
sslServer.listen(8081, '0.0.0.0', () => {
    console.log("Server listening....");
});
