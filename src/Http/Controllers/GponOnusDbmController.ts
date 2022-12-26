import { PrismaClientInitializationError, PrismaClientKnownRequestError, PrismaClientRustPanicError, PrismaClientUnknownRequestError, PrismaClientValidationError } from '@prisma/client/runtime';
import { Request, Response } from 'express';
import files from 'fs';
import ErrorsHandle from '../../Helpers/errors.app';
import { prisma } from '../../Helpers/prisma.serve';


interface DataPerPortsProps {
    DATES: string[];
    NAMES: string[];
    CURRENT_DATES: Object;
}


/**
 * |-----------------------------------------------------------------|
 * |        Class GponOnusDbmController - Gpon Onus DBM
 * |-----------------------------------------------------------------|
 * |    A Class GponOnusDbmController seria a classe de manipulação
 * | da tabela de coletas, realizado pelo agente interno configurado
 * | no servidor principal.
 * |    Todas as suas funções, possui como base entregar os dados co-
 * | letados, dessa forma, possibilitando seu uso em uma aplicação de
 * | de Dashboad.
 * |-----------------------------------------------------------------|
 */
export default class GponOnusDbmController {

    /**
     * GetEquipaments - Função de busca por equipamentos.
     * Consulta realizada com base nas coletas existentes.
     * @param request 
     * @param response 
     * @returns 
     */
    async GetEquipaments(request: Request, response: Response) {
        try {

            // Buscando todos os equipamentos existentes.
            const data = await prisma.equipaments.findMany();

            return response.status(200).json(data);
        } catch (error) {

            const errorResponse = ErrorsHandle(error)

            // Buscando por erros.
            return response.status(Number(errorResponse?.code)).json({
                message: errorResponse?.message
            });

        }
    }

    /**
     * CreateEquipaments - Função de criação de portas e equipamentos.
     * Criação realizada com base nos dados de nome e numero de portas.
     *  - Com o número de portas informados, é realizada a criação de das portas em acordo com o informado. A criação é efetuada automaticamente.
     * @param request 
     * @param response 
     * @returns 
     */
    async CreateEquipaments(request: Request, response: Response) {

        const { name, ports_number } = request.query;


        /**
         * Verificando se o parâmetro 'name' foi informado corretamente.
         */
        if (!name) {
            return response.status(401).json({ message: "Parâmetro obrigatório 'name' não informado!" });
        }

        /**
         * Verificando se o parâmetro 'ports_number' foi informado corretamente.
         */
        if (!ports_number) {
            return response.status(401).json({ message: "Parâmetro obrigatório 'ports_number' não informado!" });
        }

        /**
         * Verificando se o parâmetro 'ports' é numérico.
         */
        if (!Number(ports_number)) {
            return response.status(401).json({ message: "Parâmetro 'ports_number' deve ser numérico!" });
        }

        try {
            /**
             * Salvando o equipamento.
             */
            const eqpt = await prisma.equipaments.create({
                data: {
                    NAME: String(name),
                    N_PORT: Number(ports_number)
                }
            });

            const ports_data = []; // Array de objetos. Realiza o auxilio na criação de portas com base na quantidade informada.
            /**
             * Realziando a criação das portas a serem salvas. 
             * Todas seguem o padrão DATACOM - 'gpon 1/1/*'
             */
            for (let p = 1; p <= Number(ports_number); p++) {
                ports_data.push({
                    PORT: `gpon 1/1/${String(p)}`,
                    EQUIPAMENT_ID: String(eqpt.id),
                });
            }

            /**
             * Realizando a criação das portas associada ao equipamento.
             */
            const ports_save = await prisma.ports.createMany({
                data: ports_data
            });

            return response.status(200).json({ message: "Equipamento salvo com sucesso!", eqpt, ports_save });

        } catch (error) {

            const errorResponse = ErrorsHandle(error)

            // Buscando por erros.
            return response.status(Number(errorResponse?.code)).json({
                message: errorResponse?.message
            });

        }
    }

    /**
     * GetPorts - Função de buscas pelas portas existentes. 
     * Consulta realizada com base nas coletas existentes e no parâmetro 'equipament'.
     * @param request 
     * @param response 
     * @returns 
     */
    async GetPorts(request: Request, response: Response) {

        /**
         * Params: 
         *      - equipament: recebe por parâmetro o equipamento escolhido no filtro.
         */

        const { equipament } = request.query;

        /**
         * Verificando se o parâmetro equipamento foi informado corretamente.
         */
        if (!equipament) {
            return response.status(401).json({ message: "Parâmetro obrigatório 'equipament' não informado!" });
        }

        try {
            /**
             * Buscando pelo equipamento fornecido no "equipament".
             */
            const eqpt = await prisma.equipaments.findFirst({
                where: {
                    NAME: {
                        equals: String(equipament),
                    },
                }
            });

            // Verificando se foi localizado algum equipamento.
            if (eqpt) {
                /**
                 * Buscando pelos dados solicitados de PORT.
                 */
                const data = await prisma.ports.findMany({
                    where: {
                        EQUIPAMENT_ID: eqpt.id,
                    },
                });

                return response.status(200).json(data);
            }
            /**
             * Retornando erro se equipamento não for encontrado.
             */
            return response.status(400).json({ message: `Equipamento ${equipament} não encontrado!` });

        } catch (error) {

            const errorResponse = ErrorsHandle(error)

            // Buscando por erros.
            return response.status(Number(errorResponse?.code)).json({
                message: errorResponse?.message
            });

        }
    }


    /**
     * GetOnusPerPorts - Função de busca pelas coletas por porta.
     * Consulta realizada com base nas coletas existentes e nos parâmetros 'equipament', 'dateFilter' e 'port'.
     * @param request 
     * @param response 
     * @returns 
     */
    async GetOnusPerPorts(request: Request, response: Response) {

        /**
         * Params:
         *      - equipament: recebe o equipamento escolhido no filtro.
         *      - dateFilter: recebe a data escolhida para o filtro. ('YYYY-MM-DD hh:ii:ss')
         *      - port: recebe a porta de saida do equipamento.
         *      - type: recebe o tipo da pesquisa, sendo seus valores:
         *          - nodate: realiza a pesquisa sem base em data;
         *          - date: realiza a pesquisa com base em data;
         * 
         */
        const { equipament, dateFilter, port, type } = request.query;


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
            /**
             * Verificando se o parâmetro 'type' foi informado.
             */
            if (!type) {
                return response.status(401).json({ message: "Parâmetro obrigatório 'type' não informado!" });
            } else {

                /**
                 * Verificando se o filtro será por data.
                 */
                if (type == "date") {
                    /**
                     * Verificando se o parâmetro 'dateFilter' foi informado.
                     */
                    if (!dateFilter) {
                        return response.status(401).json({ message: "Parâmetro obrigatório 'dateFilter' não informado!" });
                    }

                    // Buscando pelos dados de cada porta em acordo com a data, porta e equipamento informado  por parametro.                    
                    const data = await prisma.gpon_onus_dbm.aggregateRaw({
                        pipeline: [
                            {
                                $project: {
                                    _id: 0,
                                    NAME: 1,
                                    RXDBM: 1,
                                    TXDBM: 1,
                                    PORT: 1,
                                    DEVICE: 1,
                                    COLLECTION_DATE: { $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$COLLECTION_DATE" } }
                                }
                            },
                            {
                                $match: {
                                    PORT: { $eq: port },
                                    DEVICE: { $eq: equipament },
                                    COLLECTION_DATE: { $eq: dateFilter },
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

                    return response.status(200).json(data);
                }

                /**
                 * Verificando se o filtro será sem o data.
                 */
                else if (type == "nodate") {

                    // Buscando pelos dados de cada porta em acordo com a porta e equipamento informados por parametro.                    
                    const data = await prisma.gpon_onus_dbm.aggregateRaw({
                        pipeline: [
                            {
                                $project: {
                                    _id: 0,
                                    NAME: 1,
                                    RXDBM: 1,
                                    TXDBM: 1,
                                    PORT: 1,
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

                    return response.status(200).json({ data });
                }

                /**
                 * Verificando se o filtro será o countBox.
                 */
                else if (type == "countBox") {
                    return response.status(200).json("alterado local");
                }

                /**
                 * Retorna se o valor de 'type' não for igual a 'date' ou 'nodate'.
                 */
                else {
                    return response.status(401).json({ message: "Valor do parâmetro 'type' não informado corretamente. Tente passar os valores 'nodate', 'countBox' ou 'date'!" });
                }
            }

        }

        catch (error) {

            const errorResponse = ErrorsHandle(error)

            // Buscando por erros.
            return response.status(Number(errorResponse?.code)).json({
                message: errorResponse?.message
            });

        }
    }



    /**
     * GetOnusDbm - Função de busca por dados de coletas de ONUs.
     * Consulta realizada com base nas coletas existentes e nos parâmetros 'name', 'startDate' e 'endDate'.
     * @param request 
     * @param response 
     * @returns 
     */
    async GetOnusDbm(request: Request, response: Response) {

        /**
         * Params: 
         *      - name: recebe por parâmetro o nome da ONU como está salva. 
         *      - startDate: recebe a data de início. 
         *      - endDate: recebe a data final.
         *      - type: recebe o tipo da pesquisa, sendo seus valores:
         *          - nodate: realiza a pesquisa sem base em data;
         *          - date: realiza a pesquisa com base em data;
         * 
         */
        const { name, startDate, endDate, type } = request.query;

        // Verificar se 'name' existe no request. 
        // Necessário ser informado para filtrar os dados.
        if (!name) {
            return response.status(401).json({ message: "Parâmetro obrigatório 'name' não informado!" });
        }

        // Verificar se 'type' existe no request. 
        if (!type) {
            return response.status(401).json({ message: "Parâmetro obrigatório 'type' não informado!" });
        }

        try {
            /**
             * Verificando se o tipo de pesquisa por data, foi informado.
             */
            if (type === 'date') {
                /**
                 * Verificando se o parâmetro 'startDate' foi informado.
                 */
                if (!startDate) {
                    return response.status(401).json({ message: "Parâmetro obrigatório 'startDate' não informado!" });
                }

                /**
                 * Verificando se o parâmetro 'endDate' foi informado.
                 */
                if (!endDate) {
                    return response.status(401).json({ message: "Parâmetro obrigatório 'endDate' não informado!" });
                }

                // Realizando consulta com filtro por data.
                const data = await prisma.gpon_onus_dbm.aggregateRaw({
                    pipeline: [
                        {
                            $project: {
                                _id: 0,
                                NAME: 1,
                                RXDBM: 1,
                                TXDBM: 1,
                                COLLECTION_DATE: { $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$COLLECTION_DATE" } }
                            }
                        },
                        {
                            $match: {
                                NAME: { $eq: name },
                                COLLECTION_DATE: {
                                    $gte: startDate,
                                    $lte: endDate,
                                },
                            }
                        },
                    ]
                });

                return response.status(200).json(data);

            }

            /**
             * Realizando a busca com base apenas no nome atrelado a ONU informado por parâmetro.
             */
            else if (type === "nodate") {

                // Realizando consulta apenas por nome atrelado a ONU.

                const data = await prisma.gpon_onus_dbm.aggregateRaw({
                    pipeline: [
                        {
                            $project: {
                                _id: 0,
                                NAME: 1,
                                RXDBM: 1,
                                TXDBM: 1,
                                COLLECTION_DATE: { $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$COLLECTION_DATE" } }
                            }
                        },
                        {
                            $match: {
                                NAME: { $eq: name }
                            }
                        }
                    ]
                });

                return response.status(200).json(data);

            } else {
                /**
                 * Retorna em caso de não ser informado corretamente o valor do parâmetro 'type'.
                 */
                return response.status(401).json({
                    message: "Valor do parâmetro 'type' não informado corretamente. Tente passar os valores 'nodate' ou 'date'!",
                });
            }

        } catch (error) {

            const errorResponse = ErrorsHandle(error)

            // Buscando por erros.
            return response.status(Number(errorResponse?.code)).json({
                message: errorResponse?.message
            });

        }

    }

    /**
     * GetOnusNames - Função de busca por nome de ONUs.
     * As buscas são realizadas com base na porta e equipamento informado.
     * @param request 
     * @param response 
     * @returns 
     */
    async GetOnusNames(request: Request, response: Response) {
        /**
         * Params:
         *      - equipament: recebe o equipamento escolhido no filtro.
         *      - port: recebe a porta de saida do equipamento.
         */
        const { port, equipament } = request.query;

        // Verificar se 'port' existe no request. 
        if (!port) {
            return response.status(401).json({ message: "Parâmetro obrigatório 'port' não informado!" });
        }

        // Verificar se 'equipament' existe no request. 
        if (!equipament) {
            return response.status(401).json({ message: "Parâmetro obrigatório 'equipament' não informado!" });
        }

        try {
            // Buscando pelos dados de cada porta em acordo com a porta e equipamento informados por parametro.
            const data = await prisma.gpon_onus_dbm.aggregateRaw({
                pipeline: [
                    {
                        $project: {
                            _id: 0,
                            NAME: 1,
                            RXDBM: 1,
                            TXDBM: 1,
                            PORT: 1,
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
                        $unwind: "$NAME",
                    },

                    {
                        $group: {
                            _id: "$_id",
                            NAMES: { $addToSet: "$NAME" },
                        }
                    },
                ]
            });

            return response.status(200).json(data);
        } catch (error) {
            const errorResponse = ErrorsHandle(error)

            // Buscando por erros.
            return response.status(Number(errorResponse?.code)).json({
                message: errorResponse?.message
            });

        }
    }
    
}