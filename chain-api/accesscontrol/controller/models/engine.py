import json
import requests


user_data = {
    "name": "Mohamed Rizad",
    "email": "chaingate@mohamedrizad.me",
    "nfc_id": "0088973186",
    "access_level": "IT Staff",
    "created_at": "2025-05-18T21:57:41.979000",
    "active": True,
    "access_history": [
        {
            "timestamp": "2025-05-18T19:34:53.040000",
            "access_time": {
                "date": "2025-05-18",
                "time": "19:34:53",
                "unix_time": 1747596893
            },
            "nfc_id": "1674191876",
            "access_status": "granted",
            "access_method": "nfc_card",
            "success": True
        }
    ],
    "position": "developer",
    "updated_at": "2025-06-29T10:56:05.763000",
    "last_access": "2025-06-29 11:08:08",
    "last_gate_id": "08805C43CA48",
    "last_gate_name": "Server Room"
}

# # Ask any question here
# question = "When was the last access?"
def summarize(question, user_data):
    prompt = f"""You are an access control assistant. Answer ONLY the question asked. Do not provide code, examples, or solutions.

FORBIDDEN: Do not write any code, python, solutions, or examples.
REQUIRED: Answer with a single sentence only.

User Data:
{json.dumps(user_data, indent=2)}

Question: {question}

Provide only a direct factual answer:"""
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "phi",
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.1,
                "top_p": 0.1,
                "stop": ["\n", "```", "python", "Solution:", "#", "def ", "import "]
            }
        }
    )

    return response.json()["response"].strip()
