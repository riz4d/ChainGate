import os
import ast
import traceback
from web3 import Web3
from config.config import BLOCKCHAIN

class BlockchainConnection:
    
    def __init__(self):
        self.blockchain_enabled = False
        self.w3 = None
        self.contract = None
        self.setup_connection()
    
    def setup_connection(self):
        try:
            self.w3 = Web3(Web3.HTTPProvider(BLOCKCHAIN["provider"]))
            self.w3.eth.default_account = self.w3.eth.accounts[BLOCKCHAIN["account_index"]]
            
            blockchain_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            contract_address_path = os.path.join(blockchain_dir, BLOCKCHAIN["contract_files"]["address"])
            contract_abi_path = os.path.join(blockchain_dir, BLOCKCHAIN["contract_files"]["abi"])
            
            if os.path.exists(contract_address_path) and os.path.exists(contract_abi_path):
                with open(contract_address_path, "r") as f:
                    contract_address = f.read().strip()
                
                with open(contract_abi_path, "r") as f:
                    contract_abi = ast.literal_eval(f.read())
                
                self.contract = self.w3.eth.contract(address=contract_address, abi=contract_abi)
                self.blockchain_enabled = self.w3.is_connected()
                print(f"Blockchain connection: {'Successful' if self.blockchain_enabled else 'Failed'}")
            else:
                print(f"Contract files not found. Looked in: {contract_address_path} and {contract_abi_path}")
                self.blockchain_enabled = False
        except Exception as e:
            print(f"Error setting up blockchain: {e}")
            traceback.print_exc()
            self.blockchain_enabled = False
    
    def is_connected(self):
        return self.blockchain_enabled
    
    def get_connection(self):
        return self.w3
    
    def get_contract(self):
        return self.contract

blockchain_connection = BlockchainConnection()