# Pathfinding Algorithm Visualizer

https://github.com/karamvirr/pathfinding-visualizer/assets/21179214/c18108b7-5555-4cc2-8332-0625af06bfdc

Pathfinding algorithms are integral to various modern applications—from routing internet traffic and GPS navigation to advancing fields like artificial intelligence, robotics, and gaming. To explore and demonstrate how these algorithms operate in real-world scenarios, I developed this interactive visualization tool.

This tool allows you to visually grasp the nuances between different algorithms by watching them in action. You can interact with the visualization by using your mouse to draw obstacles, designate high-cost tiles, and position starting or destination points on the grid. Furthermore, you can dynamically adjust the start and end points even after the algorithms have run, and see the path update in real-time!

Currently, this tool supports four major pathfinding algorithms. For unweighted pathfinding options, it offers [Breadth-First Search (BFS)](https://en.wikipedia.org/wiki/Breadth-first_search) and [Depth-First Search (DFS)](https://en.wikipedia.org/wiki/Depth-first_search). For weighted pathfinding, where different paths incur different costs, it offers [A*](https://en.wikipedia.org/wiki/A*_search_algorithm) and [Dijkstra's algorithm](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm). By default, the cost to move to an adjacent tile is set at `1`, whereas moving to a high-cost tile costs `25`.

Experience the intricacies of pathfinding by trying out the live version of the project [here](https://karamvirr.github.io/pathfinding-visualizer)! I hope you find it as enlightening and enjoyable as I do! :)
