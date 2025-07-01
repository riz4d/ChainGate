from pymongo import MongoClient
from ..mongodb.dbconf import con_string
from config.config import MONGODB

client = MongoClient(con_string)
db = client[MONGODB["database_name"]]
users_collection = db[MONGODB["collections"]["users"]]
cards_collection = db[MONGODB["collections"]["cards"]]
admins_collection = db[MONGODB["collections"]["admin"]]
accesslog_collection = db[MONGODB["collections"]["accesslog"]]
devices_collection = db[MONGODB["collections"]["devices"]]
settings_collection = db[MONGODB["collections"]["settings"]]