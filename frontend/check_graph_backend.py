import urllib.request, json

try:
    # 1. Fetch investigations
    req = urllib.request.Request('http://localhost:8081/api/v1/investigations')
    req.add_header('Authorization', 'Bearer dev')
    
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        
        # Flatten investigation list from cases
        invs = []
        for case in data.get('data', {}).get('content', []):
            invs.extend(case.get('investigations', []))
        
        # Fetch directly since the above might not give exactly what we want.
        # Let's hit the actual endpoints if needed.
except Exception as e:
    pass

def fetch_graph():
    try:
        # Instead of guessing, let's just get the first case, and then its investigations.
        req_cases = urllib.request.Request('http://localhost:8081/api/v1/cases?page=0&size=50')
        req_cases.add_header('Authorization', 'Bearer dev')
        
        with urllib.request.urlopen(req_cases) as response:
            cases_data = json.loads(response.read().decode())
            cases = cases_data.get('data', {}).get('content', [])
            
        all_invs = []
        for c in cases:
            case_id = c.get('id')
            req_invs = urllib.request.Request(f'http://localhost:8081/api/v1/cases/{case_id}/investigations')
            req_invs.add_header('Authorization', 'Bearer dev')
            try:
                with urllib.request.urlopen(req_invs) as r2:
                    inv_data = json.loads(r2.read().decode())
                    all_invs.extend(inv_data.get('data', {}).get('content', []))
            except Exception as e:
                pass
                
        completed = [i for i in all_invs if i.get('status', '').lower() == 'completed']
        print(f'Found {len(completed)} completed investigations')
        if completed:
            inv_id = completed[-1].get('id')
            print('Testing on inv_id:', inv_id)
            
            graph_req = urllib.request.Request(f'http://localhost:8081/api/v1/investigations/{inv_id}/graph')
            graph_req.add_header('Authorization', 'Bearer dev')
            with urllib.request.urlopen(graph_req) as g_resp:
                g_data = json.loads(g_resp.read().decode()).get('data', {})
                nodes = g_data.get('nodes', [])
                edges = g_data.get('edges', [])
                
                print('\n--- FIRST 10 NODES ---')
                for n in nodes[:10]:
                    print(f"id: {n.get('id')}, address: {n.get('address')}, chain: {n.get('chain')}")
                
                print('\n--- FIRST 10 EDGES ---')
                for e in edges[:10]:
                    print(f"id: {e.get('id')}, source: {e.get('source')}, target: {e.get('target')}")
                
                print(f'\nTotal Nodes: {len(nodes)}, Total Edges: {len(edges)}')
    except Exception as e:
        print('Error:', e)

fetch_graph()
