import requests
import time
import uuid
import random
import json
from collections import deque
from pathlib import Path

BASE_URL = 'http://localhost:8081/api/v1'
USERS = [('admin', 'admin123'), ('demo', 'thisisit'), ('dev', 'thisisit'), ('mock', 'thisisit')]

TITLES = [
    "Suspected Phishing Ring", "Ransomware Trace", "Darknet Market Deposit",
    "Romance Scam Funds", "Exchange Hack Trail", "Lazarus Group Activity",
    "Pig Butchering Syndicate", "DeFi Exploit Flow", "Mixer Output Tracking"
]

PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

MIN_GRAPH_NODES = 10
MAX_GRAPH_NODES = 80

def load_connected_starts():
    """Find starts whose outgoing BFS is useful at each configured depth."""
    dataset_path = Path(__file__).resolve().parents[2] / "crypto_mock_dataset.json"
    with dataset_path.open("r", encoding="utf-8") as dataset_file:
        dataset = json.load(dataset_file)

    adjacency = {f"node-{node['id']}": [] for node in dataset.get("nodes", [])}
    for edge in dataset.get("edges", []):
        source = f"node-{edge['source']}"
        target = f"node-{edge['target']}"
        if source in adjacency and target in adjacency:
            adjacency[source].append(target)

    def reachable_count(start, max_hops):
        visited = {start}
        queue = deque([(start, 0)])
        while queue:
            current, hop = queue.popleft()
            if hop >= max_hops:
                continue
            for target in adjacency.get(current, []):
                if target not in visited:
                    visited.add(target)
                    queue.append((target, hop + 1))
        return len(visited)

    candidates = {}
    for max_hops in range(2, 6):
        candidates[max_hops] = [
            (address, node_count)
            for address in adjacency
            if MIN_GRAPH_NODES <= (node_count := reachable_count(address, max_hops)) <= MAX_GRAPH_NODES
        ]
        if not candidates[max_hops]:
            raise RuntimeError(f"No dataset starts produce at least {MIN_GRAPH_NODES} nodes at {max_hops} hops")

    return candidates

CONNECTED_STARTS = load_connected_starts()

def populate(username, password, count):
    print(f"\n--- Populating {count} cases for {username} ---")
    
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", json={"username": username, "password": password})
        token = resp.json().get('data', {}).get('access_token')
    except Exception as e:
        print(f"Auth error: {e}")
        return

    if not token:
        print("Login failed")
        return

    headers = {'Authorization': f'Bearer {token}'}

    for i in range(count):
        title = f"{random.choice(TITLES)} #{i}"
        priority = random.choice(PRIORITIES)
        
        print(f"Creating case: {title}")
        
        # Create Case
        resp = requests.post(f"{BASE_URL}/cases", json={
            "caseNumber": f"{username.upper()}-{uuid.uuid4().hex[:6]}",
            "title": title,
            "description": f"Automatically generated mock case for load testing.",
            "priority": priority
        }, headers=headers)
        
        if resp.status_code != 201 and resp.status_code != 200:
            print(f"Failed to create case: {resp.status_code} {resp.text}")
            continue
            
        case_id = resp.json().get('data', {}).get('id')

        # Choose a dataset-backed start that is guaranteed to produce a useful graph.
        if i == 0:
            # Every role gets one canonical attribution demo:
            # node-114 -> mocktx-19388 -> node-10 (Mock Dataset VASP).
            max_hops = 2
            start_address = "node-114"
            expected_nodes = next(count for address, count in CONNECTED_STARTS[max_hops] if address == start_address)
        else:
            max_hops = random.randint(2, 5)
            start_address, expected_nodes = random.choice(CONNECTED_STARTS[max_hops])

        # Add starting wallet
        resp = requests.post(f"{BASE_URL}/cases/{case_id}/wallets", json={
            "chain": "mock",
            "address": start_address,
            "label": f"Suspect Wallet ({expected_nodes}-node trace)",
            "source": "Mock"
        }, headers=headers)
        wallet_id = resp.json().get('data', {}).get('id')

        # Start Investigation
        resp = requests.post(f"{BASE_URL}/investigations", json={
            "caseId": case_id,
            "caseWalletId": wallet_id,
            "title": f"Tracing {title}",
            "maxHops": max_hops
        }, headers=headers)
        inv_id = resp.json().get('data', {}).get('id')

        # Wait for investigation
        status = 'RUNNING'
        while status in ['RUNNING', 'PENDING', 'INITIALIZING']:
            time.sleep(0.5)
            resp = requests.get(f"{BASE_URL}/investigations/{inv_id}", headers=headers)
            status = resp.json().get('data', {}).get('status', 'RUNNING')

        investigation = resp.json().get('data', {})
        actual_nodes = investigation.get('nodesFound', 0)
        if status != 'COMPLETED':
            print(f"  -> Investigation {status}: {investigation.get('error', 'No reason returned')}")
            continue
        if actual_nodes < MIN_GRAPH_NODES:
            print(f"  -> WARNING: expected at least {MIN_GRAPH_NODES} nodes, backend returned {actual_nodes}")
        else:
            print(f"  -> Graph completed with {actual_nodes} nodes")
            
        # Create Report
        resp = requests.post(f"{BASE_URL}/investigations/{inv_id}/reports", headers=headers)
        if resp.status_code == 200:
            print(f"  -> Report generated for case {case_id}")
            
    print(f"Finished {username}")

# 25 per user = 100 cases
for u, p in USERS:
    populate(u, p, 25)
