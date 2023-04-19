from zabbix_api import ZabbixAPI
from sessionZabbix import connect
from json import dumps

import datetime
import math



zapi = connect()

hosts = zapi.host.get({
        "output": ["host"],
        "groupids": ["351"],
        "filter": {
            "groupids": ["351"],
            'status' : 0
        },
        "selectItems": ["itemid", "lastvalue",],
        "selectInventory" : ["location"],
})


print(dumps(hosts))
 