from sessionZabbix import connect
from json import dumps


zapi = connect()

hosts = zapi.host.get({

    "output": ["host","name"],
    "groupids": ["34", "71"],
    "selectItems": ["lastvalue","name"],
    "selectInventory" : ["location_lat","location_lon","notes","location","contact"],
})

ptp = []

for host in hosts:
    ptp.append({
        "name": host['name'],
        "host": host['host'],
        "items": host["items"],
        "inventory": host["inventory"]
    })


print (dumps(ptp))
