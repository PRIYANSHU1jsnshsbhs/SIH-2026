import urllib.request
import json
import uuid

def check():
    try:
        # Get cases
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
            except Exception:
                pass
                
        completed = [i for i in all_invs if i.get('status', '').lower() == 'completed']
        print(f'Verifying {len(completed)} completed investigations...\n')
        
        for inv in completed:
            inv_id = inv.get('id')
            
            # Fetch graph
            graph_req = urllib.request.Request(f'http://localhost:8081/api/v1/investigations/{inv_id}/graph')
            graph_req.add_header('Authorization', 'Bearer dev')
            try:
                with urllib.request.urlopen(graph_req) as g_resp:
                    g_data = json.loads(g_resp.read().decode()).get('data', {})
                    raw_nodes = g_data.get('nodes', [])
                    raw_edges = g_data.get('edges', [])
                    
                    idByBackendId = {}
                    idByAddress = {}
                    for node in raw_nodes:
                        canonical = node.get('address') or node.get('id')
                        if node.get('id'): idByBackendId[node.get('id')] = canonical
                        if node.get('address'): idByAddress[node.get('address')] = canonical
                    
                    mapped_nodes = []
                    for n in raw_nodes:
                        mapped_nodes.append({
                            'id': n.get('address') or n.get('id')
                        })
                    
                    mapped_edges = []
                    for e in raw_edges:
                        mapped_source = idByBackendId.get(e.get('source')) or idByAddress.get(e.get('source')) or e.get('source')
                        mapped_target = idByBackendId.get(e.get('target')) or idByAddress.get(e.get('target')) or e.get('target')
                        mapped_edges.append({
                            'source': mapped_source,
                            'target': mapped_target
                        })
                        
                    valid_node_ids = set(n['id'] for n in mapped_nodes)
                    safe_edges = [e for e in mapped_edges if e['source'] in valid_node_ids and e['target'] in valid_node_ids]
                    
                    orphans = len(mapped_edges) - len(safe_edges)
                    status = "PASS" if orphans == 0 else "FAIL"
                    
                    print(f"Investigation: {inv_id}")
                    print(f"  nodes received : {len(raw_nodes)}")
                    print(f"  edges received : {len(raw_edges)}")
                    print(f"  mapped nodes   : {len(mapped_nodes)}")
                    print(f"  mapped edges   : {len(safe_edges)}")
                    print(f"  orphan edges   : {orphans}")
                    print(f"  render result  : {status}\n")
            except Exception as e:
                print(f"Investigation: {inv_id} -> HTTP Fetch Error {e}\n")
    except Exception as e:
        print('Error:', e)

check()
