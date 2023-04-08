
"""
    Author: João Guilmo Oliveira
    E-mail: joaovitorg04@hotmail.com
    Licence: MIT
    Version: 1.0
"""

from zabbix_api import ZabbixAPI
from lib.env import EnvConfig
from os import getenv
from sys import path

# Configure path.
path.insert(0, "../")

# Carregando variáveis de ambiente.
EnvConfig().load_env()


def connect():
    try:
        zapi = ZabbixAPI(server=getenv("ZABBIX_LOCATION"), timeout=180, validate_certs=False)
        zapi.login(getenv("ZABBIX_USERNAME"), getenv("ZABBIX_PASSWORD"))
        # print(f'Conectado com sucesso na API : {zapi.api_version()}')
        return zapi
    except Exception as err:
        return err
        # print(f'Falha ao se conectar na API do Zabbix {err}')


