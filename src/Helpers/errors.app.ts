import { JsonWebTokenError } from "jsonwebtoken";
import { PrismaClientInitializationError, PrismaClientKnownRequestError, PrismaClientRustPanicError, PrismaClientUnknownRequestError, PrismaClientValidationError } from '@prisma/client/runtime';
import files from 'fs';

export default function ErrorsHandle(error: any) {

    if (error instanceof PrismaClientKnownRequestError) {
        files.appendFileSync(`/var/log/analytics/operation.log`, `[${new Date()}]: ${error.message}.\n`);
        console.error(error.message);        
        return { code: 400, message: error.message };
    }

    if (error instanceof PrismaClientInitializationError) {
        files.appendFileSync(`/var/log/analytics/operation.log`, `[${new Date()}]: ${error.message}.\n`);
        console.error(error.message);  
        return { code: 400, message: error.message };
    }

    if (error instanceof PrismaClientUnknownRequestError) {
        files.appendFileSync(`/var/log/analytics/operation.log`, `[${new Date()}]: ${error.message}.\n`);
        console.error(error.message);  
        return { code: 400, message: error.message };
    }

    if (error instanceof PrismaClientValidationError) {
        files.appendFileSync(`/var/log/analytics/operation.log`, `[${new Date()}]: ${error.message}.\n`);
        console.error(error.message);  
        return { code: 400, message: error.message };
    }

    if (error instanceof PrismaClientRustPanicError) {
        files.appendFileSync(`/var/log/analytics/operation.log`, `[${new Date()}]: ${error.message}.\n`);
        console.error(error.message);  
        return { code: 400, message: error.message };
    }

    // Instâncias de erros.
    if (error instanceof JsonWebTokenError) {


        /**
         * Retorna um erro de Token informado já expirado.
         */
        if (error.message == "jwt expired") {
            files.appendFileSync(`/var/log/analytics/operation.log`, `[${new Date()}]: ${error.message}.\n`);
            console.error(error.message);  
            return {
                code: 400,
                message: "Token expirado!",
            }
        }

        /**
         * Retornar um erro de Token informado inválido.
         */
        else if (error.message == "invalid signature") {
            files.appendFileSync(`/var/log/analytics/operation.log`, `[${new Date()}]: ${error.message}.\n`);
            console.error(error.message);  
            return {
                code: 400,
                message: "Token inválido!",
            };
        }

        /**
         * Retorna qualquer outro erro do Json Web Token não tratado por mensagem.
         */
        else {
            files.appendFileSync(`/var/log/analytics/operation.log`, `[${new Date()}]: ${error.message}.\n`);
            console.error(error.message);  
            return {
                code: 400,
                message: error.message,
            };
        }

    }

    /**
     * Retorna qualquer erro não atrelado ao Json Web Token.
     */
     if (error instanceof Error) {
        console.error(error.message);
        return {
            code: 400,
            message: error.message,
        };
    }

}