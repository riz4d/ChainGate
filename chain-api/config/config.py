

import os
from dotenv import load_dotenv
load_dotenv()

MONGODB = {
    "user": os.getenv("MONGODB_USER", "riza"),
    "password": os.getenv("MONGODB_PASSWORD", "PUb2ZnDr3QHRgzuf"),
    "connection_string": os.getenv("MONGODB_CONNECTION_STRING"),
    "database_name": os.getenv("MONGODB_DATABASE_NAME", "chaingate"),
    "collections": {
        "users": os.getenv("MONGODB_COLLECTION_USERS", "users"),
        "cards": os.getenv("MONGODB_COLLECTION_CARDS", "cards"),
        "admin": os.getenv("MONGODB_COLLECTION_ADMIN", "admin"),
        "accesslog": os.getenv("MONGODB_COLLECTION_ACCESSLOG", "accesslog"),
        "access_levels": os.getenv("MONGODB_COLLECTION_ACCESS_LEVELS", "access_levels"),
        "alertconfig": os.getenv("MONGODB_COLLECTION_ALERTCONFIG", "alertconfig"),
        "devices": os.getenv("MONGODB_COLLECTION_DEVICES", "devices"),
        "settings": os.getenv("MONGODB_COLLECTION_SETTINGS", "settings")
    }
}

BLOCKCHAIN = {
    "provider": os.getenv("BLOCKCHAIN_PROVIDER", "http://127.0.0.1:8545"),
    "account_index": int(os.getenv("BLOCKCHAIN_ACCOUNT_INDEX", "0")),
    "contract_files": {
        "address": os.getenv("BLOCKCHAIN_CONTRACT_ADDRESS_FILE", "contracts/contract.txt"),
        "abi": os.getenv("BLOCKCHAIN_CONTRACT_ABI_FILE", "contracts/contract_abi.txt")
    },
    "network": os.getenv("BLOCKCHAIN_NETWORK", "testnet"),
}

DEBUG = os.getenv("DEBUG", "True").lower() == "true"