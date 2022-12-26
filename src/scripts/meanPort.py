import pandas as pd
import argparse
from json import loads, dumps

# MongoDB
from lib.mongoConn import MongoConnection

argConf=argparse.ArgumentParser(description="")
argConf.add_argument('--equipament', nargs='?', metavar='equipamet', type=str)
argConf.add_argument('--port', nargs='?', metavar='port', type=str)
arguments_params = argConf.parse_args()


_db_conn = MongoConnection().client().potencia


pipeline = [
    {
        '$project': {
            "_id": 0,
            "NAME": 1,
            "RXDBM": 1,
            "TXDBM": 1,
            "PORT": 1,
            "DEVICE": 1,
            "COLLECTION_DATE": { '$dateToString': { 'format': "%Y-%m-%d %H:%M:%S", 'date': "$COLLECTION_DATE" } }
        }
    },
    {
        '$match': {
            "PORT": { '$eq': arguments_params.port },
            "DEVICE": { '$eq': arguments_params.equipament }
        }
    },
    {
        '$group': {
            "_id": "$_id",
            "DATES": { '$addToSet': "$COLLECTION_DATE" },
            "NAMES": { '$addToSet': "$NAME" },
            "CURRENT_DATES": {
                "$push": {
                    "NAME": "$NAME", "RXDBM": "$RXDBM", "TXDBM": "$TXDBM", "PORT": "$PORT", "DEVICE": "$DEVICE", "COLLECTION_DATE": "$COLLECTION_DATE"
                }
            }
        }
    },
]

# Recuperando dados do banco.
datasForMean=_db_conn.gpon_onus_dbm.aggregate(pipeline)

# Iniciando Dataframe.
df_current_dates = []

for data in datasForMean:
    # Carregando Dataframe com os dados 
    df_current_dates = pd.DataFrame.from_dict(data["CURRENT_DATES"])
    

df_current_dates["COLLECTION_DATE"] = pd.to_datetime(df_current_dates["COLLECTION_DATE"], format="%Y-%m-%d %H:%M:%S")
# ...
rx_mean = df_current_dates.groupby(by="COLLECTION_DATE")["RXDBM"].mean().to_dict()
tx_mean = df_current_dates.groupby(by="COLLECTION_DATE")["TXDBM"].mean().to_dict()

print(rx_mean)
exit()

data={"RXDBM_MEAN": rx_mean, "TXDBM_MEAN": tx_mean}

print(data)


# Código não continuado. 
# Será adicionado ao Agent de coleta a opção de coleta de média por pon. 