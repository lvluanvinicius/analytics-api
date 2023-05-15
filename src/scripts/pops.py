from sessionZabbix import connect
from json import dumps


zapi = connect()

hosts = zapi.host.get({
        "output": ["name"],
        "groupids": ["351"],
        "filter": {
            "groupids": ["351"],
            'status' : 0
        },
        "selectItems": ["itemid", "lastvalue",],
        "selectInventory" : ["location"]
})


newHosts=[]
for host in hosts:
    try:
        newHosts.append({
            "host": host["name"],
            "location": host['inventory']['location'],
            "lastvalue": host["items"][0]['lastvalue']
        })
    except Exception as err:
        continue
        

print(dumps(newHosts))
