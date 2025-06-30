"""
Access record storage on blockchain for chaingate project.
"""
import json
import traceback
from .connection import blockchain_connection

def store_access_record(nfc_id, access_data):
    w3 = blockchain_connection.get_connection()
    contract = blockchain_connection.get_contract()
    
    if not blockchain_connection.is_connected() or not contract:
        print("Blockchain storage skipped: blockchain not enabled")
        return None
    
    try:
        data_string = json.dumps(access_data)
        tx_hash = contract.functions.set(int(nfc_id)).transact()
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        return tx_hash.hex()
    except Exception as e:
        print(f"Error storing data on blockchain: {e}")
        traceback.print_exc()
        return None

def get_stored_value():
    contract = blockchain_connection.get_contract()
    
    if not blockchain_connection.is_connected() or not contract:
        print("Blockchain retrieval skipped: blockchain not enabled")
        return None
    
    try:
        return contract.functions.get().call()
    except Exception as e:
        print(f"Error retrieving data from blockchain: {e}")
        traceback.print_exc()
        return None

def verify_transaction(tx_hash):
    w3 = blockchain_connection.get_connection()
    
    if not blockchain_connection.is_connected():
        print("Blockchain verification skipped: blockchain not enabled")
        return None
    
    try:
        if isinstance(tx_hash, str) and tx_hash.startswith('0x'):
            tx_hash_bytes = bytes.fromhex(tx_hash[2:])
        else:
            tx_hash_bytes = tx_hash

        receipt = w3.eth.get_transaction_receipt(tx_hash_bytes)
        return receipt
    except Exception as e:
        print(f"Error verifying transaction: {e}")
        traceback.print_exc()
        return None