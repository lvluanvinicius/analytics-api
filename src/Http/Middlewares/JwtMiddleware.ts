import { Request, Response, NextFunction } from 'express';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import files from 'fs';
import { PrismaClientInitializationError, PrismaClientKnownRequestError, PrismaClientRustPanicError, PrismaClientUnknownRequestError, PrismaClientValidationError } from '@prisma/client/runtime';
import { prisma } from '../../Helpers/prisma.serve';
import ErrorsHandle from '../../Helpers/errors.app';

type jwdPayload = {
    id: number,
}

/**
 * Middleware jwtProtected - Utilizado para tratar cada requisição. 
 * Seu uso é adequado para bloquear requisiões sem autorização.
 * @param request
 * @param response 
 * @param next
 * @returns
 */
export default async function jwtProtected(request: Request, response: Response, next: NextFunction) {
    try {
        // Recuperando campo da chave de autorização.
        const { authorization } = request.headers;       

        // Verificando se campo authorization foi informado na requisição.
        if (!authorization) {
            return response.status(401).json({
                message: "Acesso não autorizado. Por favor, informe sua chave de acesso!"
            });
        }

        // Separando token da string "Bearer...".
        const token = authorization.split(" ")[1];

        // Verificando se token é válido e recuperando ID de usuário.
        const privateKey = files.readFileSync(`${__dirname}/../../../private.login`).toString();
        const { id } = jwt.verify(token, privateKey) as jwdPayload;

        // Buscando usuário por ID na base.
        const user = await prisma.users.findFirst({
            where: {
                id: String(id)
            }
        });

        // Verificando se usuário informado exise na base.
        if (!user) {
            return response.status(401).json({
                message: "Usuário não autorizado!",
            });
        }

        // Next envia a requisição ao próximo nível em caso de ser aprovado o token informado pelo usuário final
        next();

    } catch (error) {
        const errorResponse = ErrorsHandle(error)

        // Buscando por erros.
        return response.status(Number(errorResponse?.code)).json({
            message: errorResponse?.message
        });
    }
}