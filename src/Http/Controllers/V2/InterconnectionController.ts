import { Request, Response } from "express";
import { exec, ExecException, ExecFileException } from 'child_process';
import ErrorsHandle from "../../../Helpers/errors.app";



export default class InterconnectionController {

    async index(request: Request, response: Response) {
        try {

            exec(`python3 ${__dirname}/../../../scripts/interconnection.py`, (error, stdout, stderr) => {

                // Recuperando stderr do 'exec'.
                if (stderr) {
                    return response.status(400).json({ message: stderr });
                }

                // Recuperando error de 'exec'.
                if (error) {
                    if (error instanceof Error) return response.status(400).json({ message: error.message });
                    if (error) return response.status(400).json({ message: error });
                }

                // Recuperando retorno de saída padrão sem erro no 'exec'.
                if (stdout) {
                    // Verificando se há um erro não reconhecido como exception para o comando 'exec' do 'child_process'.
                    if (stdout.includes("errorLib")) {
                        // Convertento json de resposta e retornando ao usuário.
                        return response.status(400).json({ message: JSON.parse(stdout) });
                    }

                    // Formatando resposta do script e convertendo em JSON para retorno.
                    const stdResult = JSON.parse(stdout.replace('/\s/g', ''));
                    // Retornando a resposta do script ao usuário.

                    return response.status(200).json(stdResult);
                }
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