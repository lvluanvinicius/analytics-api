import { exec, ExecException, ExecFileException } from 'child_process';
import { Request, Response } from 'express';
import files from 'fs';
import ErrorsHandle from '../../Helpers/errors.app';
import { prisma } from '../../Helpers/prisma.serve';


/**
 * |------------------------------------------------------------------|
 * |        Class GponAnalytics - Analytics GPON
 * |------------------------------------------------------------------|
 * |    A Class GponAnalytics seria uma classe de manipulação de dados
 * | e análise. 
 * |    Utiliza por baixo chamadas em python, executando scripts de 
 * | análises. 
 * | 
 * | 
 * |------------------------------------------------------------------|
 */
export default class GponAnalytics {

    /**
     * Função responsável por coletar e realizar a contagem de Onus por caixa, com base na nomenclatura inicial.
     * @param request 
     * @param response 
     * @returns 
     */
    async CountOnusPerBoxes(request: Request, response: Response) {
        /**
         * Params:
         *      - equipament: recebe o equipamento escolhido no filtro.
         *      - dateFilter: recebe a data escolhida para o filtro. ('YYYY-MM-DD hh:ii:ss')
         *      - port: recebe a porta de saida do equipamento.
         * 
         */
        const { equipament, dateFilter, port } = request.query;


        /**
         * Verificando se o parâmetro 'equipament' foi informado.
         */
        if (!equipament) {
            return response.status(401).json({ message: "Parâmetro obrigatório 'equipament' não informado!" });
        }

        /**
         * Verificando se o parâmetro 'port' foi informado.
         */
        if (!port) {
            return response.status(401).json({ message: "Parâmetro obrigatório 'port' não informado!" });
        }

        try {
            // Buscando pelos dados de cada porta em acordo com a data, porta e equipamento informado  por parametro.                    
            const data = await prisma.gpon_onus_dbm.aggregateRaw({
                pipeline: [
                    {
                        $project: {
                            _id: 0,
                            NAME: 1,
                            PORT: 1,
                            RXDBM: 1,
                            TXDBM: 1,
                            DEVICE: 1,
                            COLLECTION_DATE: { $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$COLLECTION_DATE" } }
                        }
                    },
                    {
                        $match: {
                            PORT: { $eq: port },
                            DEVICE: { $eq: equipament },
                        }
                    },
                    {
                        $unwind: "$COLLECTION_DATE",
                    },

                    {
                        $group: {
                            _id: "$_id",
                            DATES: { $addToSet: "$COLLECTION_DATE" },
                            NAMES: { $addToSet: "$NAME" },
                            CURRENT_DATES: {
                                $push: {
                                    NAME: "$NAME", RXDBM: "$RXDBM", TXDBM: "$TXDBM", PORT: "$PORT", DEVICE: "$DEVICE", COLLECTION_DATE: "$COLLECTION_DATE"
                                }
                            }
                        }
                    },
                ]
            });

            // .
            const dataFormat = JSON.parse(JSON.stringify(data));
            const dataNames: String[] = []; // Auxiliar para carregar names.

            // Iniciando Limpeza de dados.
            for (let idx in dataFormat) {
                // Carregando names de dataFormat.
                for (let name of dataFormat[idx]["NAMES"]) {
                    // Carregando dados de names.
                    dataNames.push(name);
                }
            }

            // Carregando dados em JSON.
            const dataNamesSend = JSON.stringify({
                NAMES: dataNames,
            });

            exec(`python3 ${__dirname}/../../scripts/countBox.py '${dataNamesSend}'`, (error, stdout, stderr) => {
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

    /**
     * Responsável pela coleta e análise da média de DBM por porta gpon.
     * @param request 
     * @param response 
     * @returns 
     */
    async GetMeanPortDBM(request: Request, response: Response) {
        /**
         * Params:
         *      - equipament: recebe o equipamento escolhido no filtro.
         *      - dateFilter: recebe a data escolhida para o filtro. ('YYYY-MM-DD hh:ii:ss')
         *      - port: recebe a porta de saida do equipamento.
         * 
         */
        const { equipament, dateFilter, port } = request.query;


        /**
         * Verificando se o parâmetro 'equipament' foi informado.
         */
        if (!equipament) {
            return response.status(401).json({ message: "Parâmetro obrigatório 'equipament' não informado!" });
        }

        /**
         * Verificando se o parâmetro 'port' foi informado.
         */
        if (!port) {
            return response.status(401).json({ message: "Parâmetro obrigatório 'port' não informado!" });
        }

        try {
            // Buscando pelos dados de cada porta em acordo com a data, porta e equipamento informado  por parametro.                    
            const data = await prisma.gpon_onus_dbm.aggregateRaw({
                pipeline: [
                    {
                        $project: {
                            _id: 0,
                            NAME: 1,
                            PORT: 1,
                            RXDBM: 1,
                            TXDBM: 1,
                            DEVICE: 1,
                            COLLECTION_DATE: { $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$COLLECTION_DATE" } }
                        }
                    },
                    {
                        $match: {
                            PORT: { $eq: port },
                            DEVICE: { $eq: equipament },
                        }
                    },
                    {
                        $unwind: "$COLLECTION_DATE",
                    },

                ]
            });

            // .
            const dataFormat = JSON.parse(JSON.stringify(data)); 

            
            exec(`python3 ${__dirname}/../../scripts/meanPort.py '${dataFormat}'`, (error, stdout, stderr) => {
                // Recuperando stderr do 'exec'.
                if (stderr) {
                    console.error(stderr);
                    
                        return response.status(400).json({ message: stderr });
                }

                // Recuperando error de 'exec'.
                if (error) {
                    console.error(error);
                    
                    if (error instanceof Error) return response.status(400).json({ message: error.message });
                    if (error) return response.status(400).json({ message: error });
                }
            
                // Recuperando retorno de saída padrão sem erro no 'exec'.
                if (stdout) {
                        // Verificando se há um erro não reconhecido como exception para o comando 'exec' do 'child_process'.
                        if (stdout.includes("errorLib")) {
                                console.error(stdout);
                                
                                // Convertento json de resposta e retornando ao usuário.
                                return response.status(400).json({ message: JSON.parse(stdout) });
                            }
                    
                            // Formatando resposta do script e convertendo em JSON para retorno.
                            const stdResult = JSON.parse(stdout.replace(/\s/g, ''));
                            // Retornando a resposta do script ao usuário.
                    
                            return response.status(200).json({ COUNTS: stdResult });
                }
            });

            
            return response.status(200).json({ dataFormat });
            
        } catch (error) {
            const errorResponse = ErrorsHandle(error)
            console.log('aqui');
            

            // Buscando por erros.
            return response.status(Number(errorResponse?.code)).json({
                message: errorResponse?.message
            });

        }
    }
}