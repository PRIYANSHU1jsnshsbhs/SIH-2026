import requests
BASE_URL = 'http://localhost:8081/api/v1'
token = requests.post(f'{BASE_URL}/auth/login', json={'username': 'dev', 'password': 'thisisit'}).json().get('data', {}).get('access_token')
resp = requests.get(f'{BASE_URL}/cases?size=100', headers={'Authorization': f'Bearer {token}'})
data = resp.json().get('data', {})
cases = data.get('content', [])
print("Total elements:", data.get("totalElements"))
for c in cases:
    print(c.get('title'))
