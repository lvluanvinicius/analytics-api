import { Request, Response } from "express";





export default class GponAnalyticsController {

    async test (request: Request, response: Response) {
        return response.status(200).json('teste');
    }
}