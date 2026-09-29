import json
import random
from collections import deque

def shrink():
    with open('crypto_mock_dataset.json.bak', 'r') as f:
        data = json.load(f)
        
    nodes = {f"node-{n['id']}": n for n in data['nodes']}
    # Edges mapped by source
    edges_by_source = {}
    edges_by_target = {}
    
    for e in data['edges']:
        src = f"node-{e['source']}"
        tgt = f"node-{e['target']}"
        e['source_str'] = src
        e['target_str'] = tgt
        
        edges_by_source.setdefault(src, []).append(e)
        edges_by_target.setdefault(tgt, []).append(e)
        
    kept_nodes = set()
    
    # 2. Add seeds
    if 'node-10' in nodes: kept_nodes.add('node-10')
    if 'node-114' in nodes: kept_nodes.add('node-114')
        
    # 3. BFS from kept_nodes to expand the graph until we hit ~1000 nodes
    queue = deque(list(kept_nodes))
    
    while queue and len(kept_nodes) < 1000:
        curr = queue.popleft()
        
        # Add a few outgoing neighbors
        out_edges = edges_by_source.get(curr, [])
        for e in out_edges:
            if len(kept_nodes) >= 1000: break
            tgt = e['target_str']
            if tgt not in kept_nodes:
                kept_nodes.add(tgt)
                queue.append(tgt)
                
        # Add a few incoming neighbors
        in_edges = edges_by_target.get(curr, [])
        for e in in_edges:
            if len(kept_nodes) >= 1000: break
            src = e['source_str']
            if src not in kept_nodes:
                kept_nodes.add(src)
                queue.append(src)

    # 4. Reconstruct JSON
    final_nodes = [nodes[nid] for nid in kept_nodes if nid in nodes]
    final_edges = []
    
    for e in data['edges']:
        if e['source_str'] in kept_nodes and e['target_str'] in kept_nodes:
            # Clean up the temp keys
            del e['source_str']
            del e['target_str']
            final_edges.append(e)
            
    print(f"Final Nodes: {len(final_nodes)}, Final Edges: {len(final_edges)}")
    
    data['nodes'] = final_nodes
    data['edges'] = final_edges
    
    with open('crypto_mock_dataset.json', 'w') as f:
        json.dump(data, f, separators=(',', ':'))

if __name__ == '__main__':
    shrink()
