# Pathfinding Algorithm Visualizer

<div align="center">
  <img src="https://github.com/user-attachments/assets/2bd4ecdd-356a-4747-a261-9847c73192eb" alt="Maze Generation">
  <p><em>Maze Generation</em></p>
</div>

<div align="center">
  <img src="https://github.com/user-attachments/assets/29b39566-d432-48e9-8924-fcf120f0fd94" alt="bfs">
  <p><em>Breadth First Search (BFS)</em></p>
</div>

<div align="center">
  <img src="https://github.com/user-attachments/assets/05f334c2-eb42-432b-9fc5-e5ab759572e6" alt="Path avoiding high-cost traversals">
  <p><em>Path avoiding high-cost traversals</em></p>
</div>

<div align="center">
  <img src="https://github.com/user-attachments/assets/271614e7-1338-4880-a0a3-e797c663b84a" alt="Path with high-cost traversals">
  <p><em>Path with high-cost traversals</em></p>
</div>

Pathfinding algorithms are fundamental to modern computing applications—from network routing and GPS navigation to AI, robotics, and game development. This interactive visualization tool demonstrates how different pathfinding algorithms operate and perform in various scenarios.

The visualizer provides an intuitive way to understand algorithm behavior through real-time animation. Users can interact with the grid to create obstacles, designate high-cost tiles, and position start/end points. The tool supports dynamic updates, allowing you to move endpoints after pathfinding completion to see immediate path recalculation.

This implementation features four core pathfinding algorithms: [Breadth-First Search (BFS)](https://en.wikipedia.org/wiki/Breadth-first_search) and [Depth-First Search (DFS)](https://en.wikipedia.org/wiki/Depth-first_search) for unweighted graphs, plus [A*](https://en.wikipedia.org/wiki/A*_search_algorithm) and [Dijkstra's algorithm](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm) for weighted pathfinding. The A* implementation includes four heuristic functions: Manhattan, Euclidean, Chebyshev, and Random distances (demonstrates poor heuristic impact). Standard tiles have a traversal cost of `1`, while high-cost tiles require `25` units.

**[Try the live demo](https://karamvirr.github.io/pathfinding-visualizer)**
