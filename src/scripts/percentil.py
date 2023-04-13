"""
    Author: João Guilmo Oliveira
    E-mail: joaovitorg04@hotmail.com
    Licence: MIT
    Version: 1.0
"""

from sessionZabbix import connect
from json import dumps
import math


zapi = connect()

items = zapi.history.get({
    "output": "extend",
    "history": 3,
    "itemids": [277971], #item de coleta valor médio no intervalo de 5 min
    "sortorder": "DESC",
    "sortfield": "clock",
#    "limit" : 100000000
})

itemAux=[]
for item in items:
    if int(item['value']) > 85899345920: # 1G - 8589934592 10G - 85899345920
        itemAux.append(item['value'])

itemAux.sort()

tamanho_original = len(itemAux)
num_elementos_remover = math.ceil(0.05 * tamanho_original)
itemAux = itemAux[num_elementos_remover:]


#Total de consumo
soma = sum([int(s) for s in itemAux])
# print(f'Consumo total (bit): {soma}')

#Total de consumo em mb
valor_megabytes = soma / (8 * 1000000)
# print(f'Valor em MB: {valor_megabytes}')

real = valor_megabytes*2.00
# print(f'R$: {real:.2f}')

print(dumps({
    "consumo": soma,
    "valor": valor_megabytes,
    "real": real,
}))