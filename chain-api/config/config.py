

MONGODB = {
    "user": "riza",
    "password": "PUb2ZnDr3QHRgzuf",
    "connection_string": "mongodb+srv://riza:PUb2ZnDr3QHRgzuf@deffenderdb.egverpm.mongodb.net/?retryWrites=true&w=majority&appName=deffenderDb",
    "database_name": "chaingate",
    "collections": {
        "users": "users",
        "cards": "cards",
        "admins": "admins",
        "accesslog": "accesslog",
        "access_levels": "access_levels",
        "alertconfig": "alertconfig",
        "devices": "devices",
        "settings": "settings"
    }
}

BLOCKCHAIN = {
    "provider": "http://127.0.0.1:8545",
    "account_index": 0,
    "contract_files": {
        "address": "contracts/contract.txt",
        "abi": "contracts/contract_abi.txt"
    },
    "network": "testnet",
}

DEBUG = True