import hashlib

def hash_pn532(accestoken):
    return hashlib.sha256(accestoken.encode()).hexdigest()

def checkAccess(accestoken, hashed_accestoken):
    accestoken = hash_pn532(accestoken)
    return accestoken == hashed_accestoken

