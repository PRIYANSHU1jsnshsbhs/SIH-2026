
#include <iostream>
#include <vector>
using namespace std;

class Graph {
    int V;
    vector<vector<int>> adj;

public:
    Graph(int V) : V(V), adj(V) {}

    void addEdge(int u, int v) {
        adj[u].push_back(v);

        adj[v].push_back(u);
    }

    // DFS
    void dfs(int node, vector<bool>& visited) {
        visited[node] = true;

        for (int neighbor : adj[node]) {
            if (!visited[neighbor]) {
                dfs(neighbor, visited);
            }
        }
    }

    int countN() {
        vector<bool> visited(V, false);
        int N = 0;

        for (int v = 0; v < V; v++) {
            if (!visited[v]) {
                N++;

                vector<bool> beforeDFS = visited;
                dfs(v, visited);

                cout << "DFS " << N << ": ";
                for (int i = 0; i < V; i++) {
                    if (visited[i] && !beforeDFS[i]) cout << i << " ";
                }
                cout << "\n";
            }
        }
        return N;
    }
};

int main() {
    
    int V = 10;
    Graph g(V);

    g.addEdge(0, 1);
    g.addEdge(1, 2);

    g.addEdge(3, 4);

    g.addEdge(5, 6);
    g.addEdge(6, 7);
    g.addEdge(7, 8);

    cout << V << " vertices\n\n";
    int numComponents = g.countN();

    cout << "\nTotal number of connected components: " << numComponents << endl;

    return 0;
}