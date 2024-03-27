# Pathfinding Algorithm Visualizer

https://github.com/karamvirr/pathfinding-visualizer/assets/21179214/c18108b7-5555-4cc2-8332-0625af06bfdc

There are many applications of pathfinding algorithms in today's world. Whether it's for routing internet traffic, GPS navigation, artificial intelligence, robotics, or computer games. I built this tool because I wanted to see how these algorithms behave. Implementing them in code is one thing, but actually seeing these algorithms in action really helps to show the differences between them. You can access the live version of this project by clicking [here!](https://karamvirr.github.io/pathfinding-visualizer)

I wanted this project to be as interactive as possible. The user is able to click and drag their mouse over the board to draw walls, high-cost tiles, and to move the starting or destination locations. Also, moving the starting/destination locations after the algorithm has finished running will update the path in real time! 

The project supports four pathfinding algorithms, out of which two are weighted (A* search, Dijkstra's algorithm) and the other two are unweighted (BFS, DFS). For the weighted algorithms, note that the default cost to transition from one tile to an adjacent tile is `1`, and the cost to transition from one tile to an adjacent high-cost tile is `25`. 

I hope you enjoy playing around with this visualization tool! :) 
