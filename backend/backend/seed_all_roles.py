import requests
import time
import json
import sys
import uuid

def ingest_for_user(username, password):
    print(f"\n--- Ingesting for {username} ---")
    BASE_URL = 'http://localhost:8081/api/v1'
    
    # Login
    token = None
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", json={
            "username": username,
            "password": password
        })
        token = resp.json().get('data', {}).get('access_token')
    except Exception as e:
        print(f"Auth error: {e}")
        return

    if not token:
        print("Login failed")
        return

    headers = {'Authorization': f'Bearer {token}'}

    # Create Case
    resp = requests.post(f"{BASE_URL}/cases", json={
        "caseNumber": f"TEST-{username.upper()}-{uuid.uuid4().hex[:4]}",
        "title": f"Test Case for {username}",
        "description": f"Test Case created by {username}",
        "priority": "HIGH"
    }, headers=headers)
    if resp.status_code != 201 and resp.status_code != 200:
        print(f"Failed to create case: {resp.status_code} {resp.text}")
        return
    case_id = resp.json().get('data', {}).get('id')

    # Add starting wallet
    resp = requests.post(f"{BASE_URL}/cases/{case_id}/wallets", json={
        "chain": "mock",
        "address": "node-114",
        "label": "Starting Wallet",
        "source": "Mock"
    }, headers=headers)
    wallet_id = resp.json().get('data', {}).get('id')

    # Start Investigation
    resp = requests.post(f"{BASE_URL}/investigations", json={
        "caseId": case_id,
        "caseWalletId": wallet_id,
        "title": f"Investigation by {username}",
        "maxHops": 5
    }, headers=headers)
    inv_id = resp.json().get('data', {}).get('id')

    # Poll until COMPLETED
    status = 'RUNNING'
    while status in ['RUNNING', 'PENDING']:
        time.sleep(1)
        resp = requests.get(f"{BASE_URL}/investigations/{inv_id}", headers=headers)
        status = resp.json().get('data', {}).get('status')
        
    print(f"Investigation completed for {username}")

ingest_for_user('demo', 'thisisit')
ingest_for_user('dev', 'thisisit')
ingest_for_user('mock', 'thisisit')
