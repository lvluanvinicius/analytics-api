"""
    Author: João Guilmo Oliveira
    E-mail: joaovitorg04@hotmail.com
    Licence: MIT
    Version: 1.0
"""


from zabbix_api import ZabbixAPI
from sessionZabbix import connect
from json import dumps

import datetime
import math

zapi = connect()

time_from = 1680787047
time_till = 1680789087

items = zapi.history.get({
    "output": "extend",
    "history": 3,
    "itemids": [282627], #item de coleta valor médio no intervalo de 5 min    
    "sortorder": "DESC",
    # "limit": 10,
    "time_from": time_from,  
    "time_till": time_till,  
    "sortfield": "clock"
})

itemAux=[]
for item in items:
    if int(item['value']) > 800000000: # 1G - 8589934592 10G - 85899345920 
        itemAux.append(item['value'])


itemAux.sort() 

tamanho_original = len(itemAux)
num_elementos_remover = math.ceil(0.05 * tamanho_original)
itemAux = itemAux[num_elementos_remover:]

itemsSeparados = []

def localeItem(item):
    for it in items:
        if item == it['value']:
            clock_datetime = datetime.datetime.fromtimestamp(int(it['clock']))
            clock_formatted = clock_datetime.strftime('%Y/%m/%d %H:%M:%S')
            itemsSeparados.append({ "value": it['value'], "clock": clock_formatted})

for itA in itemAux:
    localeItem(itA)


#Total de consumo 
soma = sum([int(s) for s in itemAux])

#Total de consumo em mb
valor_megabytes = soma / (8 * 1000000)

#Calculo em real
real = valor_megabytes*2.00


print(dumps(dumps({
    "consumption": soma,
    "value": valor_megabytes,
    "real": real,
    "separateItems": itemsSeparados
})).strip())