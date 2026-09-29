import requests
import json
BASE_URL = 'http://localhost:8081/api/v1'
token = requests.post(f'{BASE_URL}/auth/login', json={'username': 'dev', 'password': 'thisisit'}).json().get('data', {}).get('access_token')

resp = requests.get(f'{BASE_URL}/cases?size=50', headers={'Authorization': f'Bearer {token}'})
cases = resp.json().get('data', {}).get('content', [])

found_graph = False
for c in cases:
    if found_graph: break
    invs = requests.get(f'{BASE_URL}/cases/{c["id"]}/investigations', headers={'Authorization': f'Bearer {token}'}).json().get('data', {}).get('content', [])
    for inv in invs:
        if inv.get('status') == 'COMPLETED':
            graph = requests.get(f'{BASE_URL}/investigations/{inv["id"]}/graph', headers={'Authorization': f'Bearer {token}'}).json().get('data', {})
            print(json.dumps(graph, indent=2))
            found_graph = True
            break
