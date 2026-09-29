import requests
import time
import json
import sys
import uuid

try:
    with open('../../crypto_mock_dataset.json') as f:
        data = json.load(f)
except Exception as e:
    print(f"Failed to load dataset: {e}")
    sys.exit(1)

edges = {}
for e in data.get('edges', []):
    to_addr = "node-" + str(e.get('target'))
    from_addr = "node-" + str(e.get('source'))
    if to_addr not in edges: edges[to_addr] = set()
    edges[to_addr].add(from_addr)

q = ['node-10']
visited = set(['node-10'])
paths = {'node-10': ['node-10']}
while q:
    curr = q.pop(0)
    for prev in edges.get(curr, []):
        if prev not in visited:
            visited.add(prev)
            paths[prev] = [prev] + paths[curr]
            q.append(prev)

candidates = [(len(v)-1, k, v) for k, v in paths.items() if 2 <= len(v) <= 5]
candidates.sort()
if not candidates:
    print("No candidate found")
    exit(1)

start_node = candidates[0][1]

BASE_URL = 'http://localhost:8081/api/v1'

def wait_for_backend():
    for _ in range(30):
        try:
            requests.get(f"{BASE_URL}/auth/me")
            return True
        except:
            time.sleep(1)
    return False

print("Waiting for backend...")
wait_for_backend()

# Login
token = None
try:
    resp = requests.post(f"{BASE_URL}/auth/login", json={
        "username": "dev",
        "password": "thisisit"
    })
    token = resp.json().get('data', {}).get('access_token')
except Exception as e:
    print(f"Auth error: {e}")

headers = {'Authorization': f'Bearer {token}'} if token else {}

# Create Case
resp = requests.post(f"{BASE_URL}/cases", json={
    "caseNumber": f"TEST-{uuid.uuid4().hex[:6]}",
    "title": "Test Case",
    "description": "Test Case",
    "priority": "HIGH"
}, headers=headers)
if resp.status_code != 201 and resp.status_code != 200:
    print(f"Failed to create case: {resp.status_code} {resp.text}")
    sys.exit(1)
case_id = resp.json().get('data', {}).get('id')

# Add starting wallet
resp = requests.post(f"{BASE_URL}/cases/{case_id}/wallets", json={
    "chain": "mock",
    "address": start_node,
    "label": "Starting Wallet",
    "source": "Mock"
}, headers=headers)
if resp.status_code != 201 and resp.status_code != 200:
    print(f"Failed to add wallet: {resp.status_code} {resp.text}")
    sys.exit(1)
wallet_id = resp.json().get('data', {}).get('id')

# Start Investigation
resp = requests.post(f"{BASE_URL}/investigations", json={
    "caseId": case_id,
    "caseWalletId": wallet_id,
    "title": "Test Investigation",
    "maxHops": 5
}, headers=headers)
if resp.status_code != 201 and resp.status_code != 200:
    print(f"Failed to create investigation: {resp.status_code} {resp.text}")
    sys.exit(1)
inv_id = resp.json().get('data', {}).get('id')

# Poll until COMPLETED
status = 'RUNNING'
while status in ['RUNNING', 'PENDING']:
    time.sleep(1)
    resp = requests.get(f"{BASE_URL}/investigations/{inv_id}", headers=headers)
    status = resp.json().get('data', {}).get('status')

inv_data = resp.json().get('data', {})

# GET graph
resp = requests.get(f"{BASE_URL}/investigations/{inv_id}/graph", headers=headers)
graph = resp.json().get('data', {})
nodes = graph.get('nodes', [])
edges_list = graph.get('edges', [])

# GET attribution
resp = requests.get(f"{BASE_URL}/investigations/{inv_id}/attribution", headers=headers)
attribution = resp.json().get('data', [])

print("----------------------------------------")
print(f"START WALLET: {start_node}")
print(f"INVESTIGATION ID: {inv_id}")
print(f"STATUS: {status}")
print(f"GRAPH NODES: {len(nodes)}")
print(f"GRAPH EDGES: {len(edges_list)}")
print("")
print(f"ATTRIBUTION COUNT: {len(attribution)}")
print("")
if attribution:
    first = attribution[0]
    print("FIRST CANDIDATE:")
    print(f"entityId: {first.get('entityId')}")
    print(f"entityName: {first.get('entityName')}")
    print(f"entityType: {first.get('entityType')}")
    print(f"chain: {first.get('chain')}")
    print(f"address/depositAddress: {first.get('depositAddress', first.get('address'))}")
    print(f"hopCount: {first.get('hopCount')}")
    print(f"amount: {first.get('amount')}")
    print(f"asset: {first.get('asset')}")
    print(f"confidence: {first.get('confidence')}")
    print(f"path: {first.get('path')}")
    print(f"transactions: {first.get('transactions')}")
    print(f"evidence: {first.get('evidence')}")
else:
    print("FIRST CANDIDATE: None")
