from django.contrib.auth import logout
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from datetime import datetime
import json
import traceback
from bson import ObjectId
from web3 import Web3

class ChainInfoView(APIView):

    def get(self, request, *args, **kwargs):
        try:
            # Connect to Ganache with timeout
            start_time = datetime.now()
            web3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545", request_kwargs={'timeout': 5}))
            
            # Check connection
            if not web3.is_connected():
                return Response({
                    "status": "error",
                    "message": "Failed to connect to the blockchain node"
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
            # Calculate latency
            latency = (datetime.now() - start_time).total_seconds() * 1000  # in milliseconds
            
            chain_id = web3.eth.chain_id
            today = datetime.now().date()
            latest_block = web3.eth.block_number

            today_block_count = 0

            for i in range(0, latest_block + 1):
                block = web3.eth.get_block(i)
                block_time = datetime.fromtimestamp(block.timestamp).date()
                if block_time == today:
                    today_block_count += 1

            print(f"Blocks mined today ({today}): {today_block_count}")
            
            return Response({
                "status": "healthy",
                "latency_ms": round(latency, 2),
                "chain_id": chain_id,
                "latest_block": latest_block,
                "blocks_mined_today": today_block_count
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Blockchain connection error: {str(e)}")
            return Response({
                "status": "error",
                "message": "Error connecting to blockchain",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class BlockchainTransactionsView(APIView):
    """
    API View for retrieving paginated blockchain transactions
    """
    #permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Get pagination parameters
            page = int(request.query_params.get('page', 1))
            per_page = 5  # Fixed at 5 transactions per page
            
            # Connect to Ganache
            web3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545", request_kwargs={'timeout': 5}))
            
            # Check connection
            if not web3.is_connected():
                return Response({
                    "status": "error",
                    "message": "Failed to connect to the blockchain node"
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
            latest_block = web3.eth.block_number
            
            # Calculate total transactions across all blocks
            total_transactions = 0
            all_transactions = []
            
            # Collect all transactions from latest blocks (going backwards)
            for i in range(latest_block, max(0, latest_block - 50), -1):  # Check last 50 blocks max
                try:
                    block = web3.eth.get_block(i, full_transactions=True)
                    for tx in block.transactions:
                        tx_data = {
                            "hash": tx.hash.hex(),
                            "from": tx["from"],
                            "to": tx.to,
                            "value": float(web3.from_wei(tx.value, 'ether')),
                            "block": tx.blockNumber,
                            "timestamp": datetime.fromtimestamp(block.timestamp).isoformat(),
                            "gas_used": tx.gas,
                            "gas_price": str(tx.gasPrice)
                        }
                        all_transactions.append(tx_data)
                        total_transactions += 1
                        
                        # Stop if we have enough for pagination calculation
                        if total_transactions >= 100:  # Reasonable limit
                            break
                    
                    if total_transactions >= 100:
                        break
                        
                except Exception as block_error:
                    print(f"Error reading block {i}: {block_error}")
                    continue
            
            # Calculate pagination
            total_pages = (total_transactions + per_page - 1) // per_page
            start_index = (page - 1) * per_page
            end_index = start_index + per_page
            
            # Get transactions for current page
            page_transactions = all_transactions[start_index:end_index]
            
            # Prepare pagination metadata
            pagination = {
                "total_transactions": total_transactions,
                "total_pages": total_pages,
                "current_page": page,
                "per_page": per_page,
                "has_next": page < total_pages,
                "has_prev": page > 1
            }
            
            return Response({
                "status": "success",
                "message": "Blockchain transactions retrieved successfully",
                "transactions": page_transactions,
                "pagination": pagination
            }, status=status.HTTP_200_OK)
            
        except ValueError as e:
            return Response({
                "status": "error",
                "message": "Invalid pagination parameters",
                "details": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            print(f"Blockchain transactions error: {str(e)}")
            traceback.print_exc()
            return Response({
                "status": "error",
                "message": "Error retrieving blockchain transactions",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)