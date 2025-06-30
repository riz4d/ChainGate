from web3 import Web3

# Connect to Ganache
web3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))

latest_block = web3.eth.block_number
transactions = []

# Loop backwards through blocks to collect transactions
for block_num in range(latest_block, -1, -1):
    block = web3.eth.get_block(block_num, full_transactions=True)
    if block.transactions:
        transactions.extend(block.transactions)
    if len(transactions) >= 5:
        break

# Get the last 5 transactions (most recent first)
last_five = transactions[-5:]

print("Last 5 Transactions:")
for tx in reversed(last_five):  # reverse to show newest first
    print(f"- Tx Hash: {tx.hash.hex()}")
    print(f"  From: {tx['from']}")
    print(f"  To: {tx['to']}")
    print(f"  Value: {web3.from_wei(tx['value'], 'ether')} ETH\n")
