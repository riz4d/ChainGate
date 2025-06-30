# File: compile_deploy.py
from solcx import compile_source, install_solc
from web3 import Web3

install_solc('0.8.0')

with open('sol/store.sol', 'r') as file:
    contract_source_code = file.read()
compiled_sol = compile_source(contract_source_code, solc_version='0.8.0')
contract_interface = compiled_sol['<stdin>:store']

w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))
w3.eth.default_account = w3.eth.accounts[0]
print("Connected:", w3.is_connected())
SimpleStorage = w3.eth.contract(abi=contract_interface['abi'], bytecode=contract_interface['bin'])

tx_hash = SimpleStorage.constructor().transact()
tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

print("Contract deployed at:", tx_receipt.contractAddress)

with open("contract.txt", "w") as f:
    f.write(tx_receipt.contractAddress)

with open("contract_abi.txt", "w") as f:
    f.write(str(contract_interface['abi']))
