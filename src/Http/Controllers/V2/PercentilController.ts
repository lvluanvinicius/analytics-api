import { Request, Response } from "express";
import { exec, ExecException, ExecFileException } from 'child_process';
import ErrorsHandle from "../../../Helpers/errors.app";
import { log } from "console";

export default class PercentilController {      

    async index(request: Request, response: Response) {
        
        // if (!request.query.time) {
        //     return response.status(400).json({ message: "Por favor, informe o parametro 'time' corretamente." });
        // } 

        // let time = request.query.time as string;

        // const ago = new Date();        
        // const valueAfter = parseInt(time.slice(0, -1));
        // const unidade = time.slice(-1);
      
        // switch (unidade) {
        //   case 'm':
        //     ago.setMinutes(ago.getMinutes() - valueAfter);
        //     break;
        //   case 'h':
        //     ago.setHours(ago.getHours() - valueAfter);
        //     break;
        //   case 'd':
        //     ago.setDate(ago.getDate() - valueAfter);
        //     break;
        //   default:
        //     console.error('Unidade de tempo não suportada');
        // }
              
    

        // // Convertendo data em timestamp.
        // let time_from = Date.parse(`${new Date()}`);
        // let time_to =  Date.parse(`${ago}`); 
        
        try {
            
            exec(`python3 ${__dirname}/../../../scripts/percentil.py`, (error, stdout, stderr) => {
                
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
                    const stdResult = JSON.parse(stdout.replace(/\s/g, ''));
                    // Retornando a resposta do script ao usuário.
    
                    return response.status(200).json({ COUNTS: stdResult });
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
