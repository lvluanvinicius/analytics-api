import { strings as appStrings } from "../../Helpers/strings.app";
import { Request, Response } from "express";
import { hashSync, genSaltSync, compareSync } from 'bcrypt';
import jwt from 'jsonwebtoken';
import files from 'fs';
import { PrismaClientInitializationError, PrismaClientKnownRequestError, PrismaClientRustPanicError, PrismaClientUnknownRequestError, PrismaClientValidationError } from "@prisma/client/runtime";
import { prisma } from "../../Helpers/prisma.serve";
import ErrorsHandle from "../../Helpers/errors.app";

/**
 * |-----------------------------------------------------------------|
 * |        Class UsersController - Controle de Usuários
 * |-----------------------------------------------------------------|
 * |    A Class UsersControllers é uma classe de manipulação de usu-
 * | ários. 
 * |    Utilizada para manipulação do Login de usuáriso. 
 * |-----------------------------------------------------------------|
 */
export default class UsersController {


    /**
     * getUsers - Função responsável por retornar um ou mais usuários com base nos parâmtros:
     *  - type: string - 
     *      Valores stático: 
     *          all: retorna todos os usuários da base;
     *          one: retorna apenas um usuário com base no username informado.
     *  - userParam: string
     * @param request 
     * @param response 
     * @returns 
     */
    async getUsers(request: Request, response: Response) {
        const { type, username } = request.params

        try {
            if (type == "all") {
                // Buscando todos os usuários.
                const users = await prisma.users.findMany();

                // Verificando se algum usuário foi localizado.
                if (!users) {
                    return response.status(200).json({
                        message: "Nenhum usuário encontrado!",
                    });
                }

                // retornando os usuários.
                return response.status(200).json(users);
            }

            if (type == "one") {
                // Buscando todos os usuários.
                const user = await prisma.users.findFirst({
                    where: {
                        username: {
                            equals: String(username),
                        }
                    }
                });

                // Verificando se algum usuário foi localizado.
                if (!user) {
                    return response.status(200).json({
                        message: `Usuário ${username} não localizado!`,
                    });
                }

                // retornando os usuários.
                return response.status(200).json(user);
            }

            return response.status(200).json({
                message: "Parâmetros incorretos. Tente utilizar 'all' ou 'one'!",
            });

        } catch (error) {

            const errorResponse = ErrorsHandle(error)

            // Buscando por erros.
            return response.status(Number(errorResponse?.code)).json({
                message: errorResponse?.message
            });

        }
    }

    /**
     * create - Função responsável pela criação de um novo usuário.
     * Params: 
     *  - username: string
     *  - password: string
     *  - name: string
     *  - email: string
     * 
     * @param request 
     * @param response 
     * @returns 
     */
    async create(request: Request, response: Response) {

        // Recuperando campos da requisição.
        const { username, password, name, email } = request.body;


        // Verificando se o campo username foi informado na requisição.
        if (!username) {
            return response.status(401).json({
                message: "Campo 'username' é obrigatório!",
            });
        }

        // Verificando se o campo password foi informado na requisição.
        if (!password) {
            return response.status(401).json({
                message: "Campo 'password' é obrigatório!",
            });
        }

        // Verificando se o campo name foi informado na requisição.
        if (!name) {
            return response.status(401).json({
                message: "Campo 'name' é obrigatório!",
            });
        }

        // Verificando se o campo email foi informado na requisição.
        if (!email) {
            return response.status(401).json({
                message: "Campo 'email' é obrigatório!",
            });
        }

        /**
         * Verificando se a senha fornecida possui mais que 10 caracteres.
         */
        if (password.length <= 10) {
            return response.status(401).json({
                message: "A senha deve possuir mais que 10 caracteres.",
            });
        }

        try {


            // Verificando se o e-mail informado já existe.
            const userExistsEmail = await prisma.users.findFirst({
                select: {
                    email: true,
                },
                where: {
                    email: {
                        equals: String(email)
                    },
                },
            });


            // Verificando se há um retorno na procura do e-mail existente.
            if (userExistsEmail) {
                return response.status(401).json({
                    message: `O e-mail '${email}' já existe!`,
                });
            }

            // Verificando se o usuário informado já existe.
            const userExistsUsername = await prisma.users.findFirst({
                select: {
                    username: true,
                },
                where: {
                    username: {
                        equals: String(username)
                    },
                },
            });

            // Verificando se há um retorno na procura do usuário existente.
            if (userExistsUsername) {
                return response.status(401).json({
                    message: `O usuário '${username}' já existe!`,
                });
            }

            // Criando hash antes para salvar a senha.
            const saltPassword = genSaltSync(14); // Salto da hash.
            const hash = hashSync(password, saltPassword); // Recuperando hash

            // Criando novo usuário na base.
            const user = await prisma.users.create({
                data: { username, password: hash, email, name }
            });

            // Resposta de sucesso.
            return response.status(200).json(user);

        } catch (error) {

            const errorResponse = ErrorsHandle(error)

            // Buscando por erros.
            return response.status(Number(errorResponse?.code)).json({
                message: errorResponse?.message
            });

        }
    }

    /**
     * resetPassword - Função responsável por resetar a senha com base no username informado.
     * Params:
     *  - username: string
     * @param request 
     * @param response 
     * @returns 
     */
    async resetPassword(request: Request, response: Response) {

        // Recuperando campos da requisição.
        const { username } = request.body;

        // Verificando se o campo username foi informado na requisição.
        if (!username) {
            return response.status(401).json({
                message: `Campo 'username' é obrigatório!`,
            });
        }

        try {

            // Buscando pelo usuário.
            const user = await prisma.users.findFirst({
                select: {
                    username: true,
                },
                where: {
                    username: {
                        equals: String(username),
                    }
                }
            });

            // Verificando se usuário informado existe.
            if (!user) {
                return response.status(401).json({
                    message: `O usuário informado, não existe!`,
                });
            }

            // Cadeia de caractere.
            const characters = appStrings.passwordValidate

            // Gerando nova senha.
            const auxPass = [];
            for (let ind = 0; ind < 16; ind++) {
                // Criando um array com os caracteres sortidos.
                auxPass.push(characters[Math.floor(Math.random() * characters.length)]);
            }

            // Ajustando a nova senha em um texto.
            const newPass = auxPass.join("");

            // Criando hash antes para salvar a senha.
            const saltPassword = genSaltSync(14); // Salto da hash.
            const passHash = hashSync(newPass, saltPassword); // Recuperando hash

            // Realizando a atualização de senha.
            const userReseted = await prisma.users.update({
                data: {
                    password: String(passHash)
                },
                where: {
                    username: username
                }
            });

            // Checando se foi afetado o usuário selecionado.
            if (!userReseted) {
                return response.status(401).json({
                    message: `A senha não pode ser alterada!`,
                });
            }

            // resposta de sucesso.
            return response.status(200).json({
                message: "Nova senha gerada com sucesso!",
                password: newPass,
            });

        } catch (error) {

            const errorResponse = ErrorsHandle(error)

            // Buscando por erros.
            return response.status(Number(errorResponse?.code)).json({
                message: errorResponse?.message
            });

        }
    }

    /**
     * delete - Função responsável pela exclusão do usuário.
     * Params: 
     *  - username: string
     *  - email: string
     * @param request 
     * @param response 
     */
    async delete(request: Request, response: Response) {
        // Recuperando campos da requisição.
        const { username, email } = request.body;

        // Verificando se o campo username foi informado na requisição.
        if (!username) {
            return response.status(401).json({
                message: "Campo 'username' é obrigatório!",
            });
        }

        // Verificando se o campo email foi informado na requisição.
        if (!email) {
            return response.status(401).json({
                message: "Campo 'email' é obrigatório!",
            });
        }

        try {

            // Buscando usuário a ser excluido na base.
            const user = await prisma.users.findFirst({
                where: {
                    username: {
                        equals: String(username)
                    },
                    email: {
                        equals: String(email)
                    }
                }
            });

            // Verificando se usuário existe.
            if (!user) {
                return response.status(401).json({
                    message: `E-mail e usuário não encontrado para exclusão ou não existem!`,
                });
            }

            // Realizando a exclusão do usuário.
            const userDelete = await prisma.users.delete({
                where: {
                    username: user.username,
                }
            });

            // Verificando se algum dado foi afetado na exclusão.
            if (userDelete) {
                return response.status(200).json({
                    message: `Usuário excluído com sucesso!`,
                });
            }

            // Resposta de exclusão mal sucedida.
            return response.status(401).json({
                message: `Usuário não excluído ou ele não existe!`,
            });

        } catch (error) {

            const errorResponse = ErrorsHandle(error)

            // Buscando por erros.
            return response.status(Number(errorResponse?.code)).json({
                message: errorResponse?.message
            });

        }
    }

    /**
     * login - Função responsável pelo login na API.
     * Params: 
     *  - username: string
     *  - password: string
     * @param request 
     * @param response 
     * @returns 
     */
    async login(request: Request, response: Response) {

        // Recuperando campos da requisição.
        const { username, password } = request.body;

        // Verificando se o campo username foi informado na requisição.
        if (!username) {
            return response.status(401).json({
                message: `Campo 'username' é obrigatório!`,
            });
        }

        // Verificando se o campo password foi informado na requisição.
        if (!password) {
            return response.status(401).json({
                message: `Campo 'password' é obrigatório!`,
            });
        }


        try {
            // Buscando usuário no banco de dados.
            const userPassword = await prisma.users.findFirst({
                where: {
                    username: {
                        equals: String(username),
                    },
                }
            });



            // Verificando se foi encontrado algum usuário a ser tratado no login.
            if (userPassword != null) {

                if (compareSync(password, userPassword.password)) {
                    // Lendo chave privada de usuário.             
                    const privateKey = files.readFileSync(`${__dirname}/../../../private.login`).toString();

                    // Criando token.
                    // Setada expiração de 99 anos.
                    const token = jwt.sign({ id: userPassword.id }, privateKey, { expiresIn: '99years' });


                    /**
                     * Retornando feedback ao usuário final e novo token.
                     * Resposta de sucesso.
                     */
                    files.appendFileSync(`/var/log/analytics/operation.log`, `[${new Date()}]:[${request.socket.remoteAddress}]: Novo login.\n`);
                    console.log(`[${new Date()}]:[${request.socket.remoteAddress}]: Novo login.`);
                    return response.status(401).json({
                        message: "Login realizado com sucesso!",
                        token,
                    });

                }

                /**
                 * Condição a qual, usuário e senha informado, estão incorretos.
                 */
                files.appendFileSync(`/var/log/analytics/operation.log`, `[${new Date()}]:[${request.socket.remoteAddress}]: Tentativa de login incorreta.\n`);
                return response.status(401).json({
                    message: "Usuário ou senha estão incorretos!"
                });
            }

            /**
             * Condição a qual, qualquer uma das condições acima não estão corretas. 
             * Retorna erro de usuário e senha incorretos, pois ao usuário final, seria o melhor feedback.
             */
            files.appendFileSync(`/var/log/analytics/operation.log`, `[${new Date()}]:[${request.socket.remoteAddress}]: Tentativa de login incorreta.\n`);
            return response.status(401).json({
                message: "Usuário ou senha estão incorretos."
            });

        } catch (error) {

            const errorResponse = ErrorsHandle(error)

            // Buscando por erros.
            return response.status(Number(errorResponse?.code)).json({
                message: errorResponse?.message
            });

        }
    }
}