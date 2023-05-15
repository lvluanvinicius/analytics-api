import { Request, Response } from "express";
// import axios from "axios";
// import https from 'http2';
const axios = require('axios');
const https = require('https');

var proxmox = axios.create({
    baseURL: "https://191.37.38.83:8006/api2/json",
    timeout: 15000,
    headers: {
        "Content-Type": "application/json"
    },
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
});

export default class GponAnalyticsController {

    async index(request: Request, response: Response) {

        const data = {
            username: 'API@pve',
            password: '@DitCD34a9'
        }

        //      let ticketOut = "";
        const resp = await proxmox.post("/access/ticket", {
            username: data.username,
            password: data.password
        }) .then(function (ticket: string) {            
            // Criar request:
            proxmox.get('/cluster', {
                headers: {
                    'Cookie': "PVEAuthCookie=" + ticket,
                    'Authorization': 'PVEAPIToken=API@pve!jmw4up7u2z3YHnKXqUHmBJqv=4f2b84a9-7fa3-4a61-9e33-58cb3e9ff115'
                },
            }).then(function (responseProx: any) {
                console.log(responseProx);
                
            });

        }).catch((error: any) => {
            console.log('-----------------------------');            
            console.error(error);
            console.log('-----------------------------');            
        });
    }
}