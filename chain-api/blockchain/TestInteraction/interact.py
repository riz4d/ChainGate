from web3 import Web3
import ast

w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))
w3.eth.default_account = w3.eth.accounts[0]

print("Connected to blockchain:", w3.is_connected())
print("Current block number:", w3.eth.block_number)

try:
    with open("contract_address.txt", "r") as f:
        contract_address = f.read().strip()
        print(f"Saved contract address: {contract_address}")

    with open("contract_abi.txt", "r") as f:
        contract_abi = ast.literal_eval(f.read())

    contract = w3.eth.contract(address=contract_address, abi=contract_abi)
    try:
        current_value = contract.functions.get().call()
        print(f"Current stored value in contract: {current_value}")
        print("\nSetting a new value to the contract...")
        tx_hash = contract.functions.set(42).transact()
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        print(f"Transaction successful! Hash: {tx_hash.hex()}")
        new_value = contract.functions.get().call()
        print(f"New stored value: {new_value}")
        
        print("\nYou can now fetch this transaction with the hash above")
        
    except Exception as e:
        print(f"Error interacting with contract: {e}")
        print("\nThe contract may need to be redeployed. Run compile.py to redeploy it.")
        
except Exception as e:
    print(f"Error loading contract: {e}")
    print("\nThe contract may need to be redeployed. Run compile.py to redeploy it.")

