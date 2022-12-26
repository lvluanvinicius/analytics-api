from pymongo import MongoClient
from os import getenv
from .env import EnvConfig
from sys import path
import urllib

# Configure path.
path.insert(0, "../")

# Carregando variáveis de ambiente.
EnvConfig().load_env()


class MongoConnection (object):

    def __init__(self):
        self.USERNAME = getenv("MONGODB_USERNAME")
        self.PASSWORD = getenv("MONGODB_PASSWORD")
        self.PORT = getenv("MONGODB_PORT")
        self.HOST = getenv("MONGODB_HOST")
        self.DATABASE = getenv("MONGODB_DATABASE")

    def client(self):
        """
            ...
        """
        # Criando conexão direta com o mongo db. 
        client=MongoClient(port=int(self.PORT), host=self.HOST, password=self.PASSWORD, username=self.USERNAME, authSource='admin')
        
        return client


if __name__=="__main__":
    print("This is a direct connection to mongodb.")