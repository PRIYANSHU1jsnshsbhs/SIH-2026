import requests
BASE_URL = 'http://localhost:8081/api/v1'
token = requests.post(f'{BASE_URL}/auth/login', json={'username': 'dev', 'password': 'thisisit'}).json().get('data', {}).get('access_token')
resp = requests.get(f'{BASE_URL}/cases?size=50', headers={'Authorization': f'Bearer {token}'})
cases = resp.json().get('data', {}).get('content', [])
print("Checking investigations...")
for c in cases:
    invs = requests.get(f'{BASE_URL}/cases/{c["id"]}/investigations', headers={'Authorization': f'Bearer {token}'}).json().get('data', [])
    for inv in invs:
        print(inv)
