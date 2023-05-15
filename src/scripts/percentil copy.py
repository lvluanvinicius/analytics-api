"""
    Author: João Guilmo Oliveira
    E-mail: joaovitorg04@hotmail.com
    Licence: MIT
    Version: 1.0
"""

from sessionZabbix import connect
from json import dumps
from sys import argv
import datetime
import math



timefrom=int(int(argv[1]) / 1000)
timetill=int(int(argv[2]) / 1000)


#print(type(timefrom))
#exit(0)

zapi = connect()

items = zapi.history.get({
    "output": "extend",
    "history": 3,
    "itemids": [282627], #item de coleta valor médio no intervalo de 5 min    
    "sortorder": "DESC",
    "time_from" : timefrom,
    "time_till" : timetill,
    "sortfield": "clock"
})


#Lista de itens completos
itemFull=[]
for item in items:
        clock_datetime_full = datetime.datetime.fromtimestamp(int(item['clock']))
        clock_formatted_full = clock_datetime_full.strftime('%Y/%m/%d %H:%M:%S')
        itemFull.append({ "value": item['value'], "clock": clock_formatted_full})


#Lista de items acima de 10gb
item10Max=[]
for item in items:
    if int(item['value']) > 1000000000: 
        clock_datetime_full = datetime.datetime.fromtimestamp(int(item['clock']))
        clock_formatted_full = clock_datetime_full.strftime('%Y/%m/%d %H:%M:%S')
        item10Max.append({ "value": item['value'], "clock": clock_formatted_full})


#Lista de items abaixo de 10gb
item10Min=[]
for item in items:
    if int(item['value']) <= 1000000000: 
        clock_datetime_full = datetime.datetime.fromtimestamp(int(item['clock']))
        clock_formatted_full = clock_datetime_full.strftime('%Y/%m/%d %H:%M:%S')
        item10Min.append({ "value": item['value'], "clock": clock_formatted_full})



#Organiza lista de maneira crescente 
# item10Max.sort()
itemOrder = item10Max

#Com número de itens da lista realiza a media, removendo os 5% maximos da lista. (é necessário sempre remover)
counter = len(itemOrder)
removelist = math.ceil(0.05 * counter)
itemAux = itemOrder[removelist:]

#exibe os items que foram removidos.
removedItems = itemOrder[:removelist]

# #busca na lista o datatime do valor (Lista Completa).
itemValueClock_full = []
def localeItemRemoved(itemFull):
    for it in items:
        if itemFull == it['value']:
            clock_datetime_full = datetime.datetime.fromtimestamp(int(it['clock']))
            clock_formatted_full = clock_datetime_full.strftime('%Y/%m/%d %H:%M:%S')
            itemValueClock_full.append({ "value": it['value'], "clock": clock_formatted_full})

for itC in itemFull:
     localeItemRemoved(itC)


# #busca na lista o datatime do valor (Lista 5% Max).
itemValueClock_5max = []
def localeItemRemoved(removedItems):
    for it in items:
        if removedItems == it['value']:
            clock_datetime_removed = datetime.datetime.fromtimestamp(int(it['clock']))
            clock_formatted_removed = clock_datetime_removed.strftime('%Y/%m/%d %H:%M:%S')
            itemValueClock_5max.append({ "value": it['value'], "clock": clock_formatted_removed})

for itB in removedItems:
     localeItemRemoved(itB)

#busca na lista o datatime do valor (Lista 95%).
itemValueClock_95 = []
def localeItem(item):
    for it in items:
        if item == it['value']:
            clock_datetime = datetime.datetime.fromtimestamp(int(it['clock']))
            clock_formatted = clock_datetime.strftime('%Y/%m/%d %H:%M:%S')
            itemValueClock_95.append({ "value": it['value'], "clock": clock_formatted})

for itA in itemAux:
    localeItem(itA)

#Total de consumo 
sum = sum([int(s) for s in itemAux])
#Consumo total em mb
megabytes = sum / (8 * 1000000)
#Consumo em R$ (R$ 2,00 por MB)
real = megabytes*2.00


print(dumps({
    "consumo": sum,
    "valorMB": megabytes,
    "real": real,
    "itemValueClock_95": itemValueClock_95,
    "itemValueClock_5max": itemValueClock_5max,
    "item10Max" : item10Max,
    "item10Min" : item10Min,
    "itemFull" : itemFull
}))