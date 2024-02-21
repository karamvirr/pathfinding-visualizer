"use strict";
(function() {
  // variable for the svg namespace
  const SVG_NS = "http://www.w3.org/2000/svg";
  // link to repo on github
  const GITHUB_PROJECT_LINK = "https://github.com/karamvirr/pathfinding-visualizer";
  // default tile size
  const SIZE = 25;
  // the default cost of moving from one tile to an adjacent one
  const DEFAULT_TRANSITION_COST = 1;
  // the cost of moving from one tile to an adjacent high cost one
  const HIGH_TRANSITION_COST = 25;
  // speed of pathfinding animation in milliseconds
  const ANIMATION_SPEED = 25;

  // structure used to store the collection of tiles that represent the board
  let grid;
  // the starting node
  let start;
  // the destination node
  let end;
  // structure used to manage click/drag events on the grid.
  let userInteractionHandler;
  // the selected path finding algorithm.
  let pathfindingAlgorithm;
  // note: heuristics are only applied if the selected algorithm is a* search.
  let heuristic;

  window.onload = function() {
    userInteractionHandler = {};
    userInteractionHandler.isInteracting = false;
    userInteractionHandler.isMovingNode = false;
    userInteractionHandler.isMovingStartingNode = false;
    userInteractionHandler.buildType = "Wall";
    userInteractionHandler.isErasingTiles = false;

    setBoard();
    setNode(grid.length / 2, 5, true);
    setNode(grid.length / 2, 26, false);

    $("title").onclick = function() {
      window.location.assign(GITHUB_PROJECT_LINK);

    }
    $("algorithms-menu").onclick = function(event) {
      let text = "Visualize ";
      let disableHeuristicsDropdown = true;
      switch (event.target.text) {
        case "A* Search":
          pathfindingAlgorithm = aStarSearch;
          disableHeuristicsDropdown = false;
          text += "A*";
          break;
        case "Dijkstra's Algorithm":
          pathfindingAlgorithm = dijkstrasAlgorithm;
          text += "Dijkstra's";
          break;
        case "Breadth First Search":
          pathfindingAlgorithm = breadthFirstSearch;
          text += "BFS";
          break;
        case "Depth First Search":
          pathfindingAlgorithm = depthFirstSearch;
          text += "DFS";
      }
      $("visualize").innerText = text;
      if (disableHeuristicsDropdown) {
        $("heuristics-dropdown").classList.add("disabled");
      } else {
        $("heuristics-dropdown").classList.remove("disabled");
      }
    };
    $("heuristics-menu").onclick = function(event) {
      switch (event.target.text) {
        case "Manhattan":
          heuristic = manhattanDistance;
          break;
        case "Euclidean":
          heuristic = euclideanDistance;
          break;
        case "Chebyshev":
          heuristic = chebyshevDistance;
          break;
        case "Octile":
          heuristic = octileDistance;
      }
      $("visualize").innerText = "Visualize A* - " + event.target.text;
    };
    $("clear-path").onclick = function() {
      if (!this.classList.contains("disabled")) {
        clearPath();
      }
    };
    $("clear-board").onclick = function() {
      if (!this.classList.contains("disabled")) {
        clearPath();
        for (let tile of grid.flat()) {
          tile.rect.classList.remove("wall");
          tile.rect.classList.remove("high-cost-tile");
          tile.cost = DEFAULT_TRANSITION_COST;
          tile.isWall = false;
        }
      }
    };
    $("visualize").onclick = async function() {
      if (!this.classList.contains("disabled")) {
        if (!pathfindingAlgorithm) {
          alert("Select an algorithm");
          return;
        }
        if (pathfindingAlgorithm == aStarSearch && !heuristic) {
          alert("Select a heuristic function for A* search");
          return;
        }
        toggleMenuItems();
        clearPath();
        await pathfindingAlgorithm();
        toggleMenuItems();
      }
    };
    $("drawing-options-menu").onclick = function(event) {
      userInteractionHandler.buildType = event.target.text;
    };
  }

  /**
   * Executes an A* search from the starting node.
   * If the provided parameter is true, then the search will be animated.
   * Otherwise, no animation occurs and the path connecting the starting and
   * destination node will be displayed instantly (if one exists) alongside
   * the colored visited tiles & tiles pending traversal.
   * To learn more about A* Search:
   * https://en.wikipedia.org/wiki/A*_search_algorithm
   *
   * @param animate boolean used to determine if search should be animated.
   */
  async function aStarSearch(animate = true) {
    let pathFound = false;
    let priorityQueue = [];

    start.distance = 0;
    priorityQueue.push(start);

    while(priorityQueue.length != 0 && !pathFound) {
      let tile = priorityQueue.shift();
      tile.isVisited = true;

      if (!isDestinationNode(tile)) {
        if (tile != start) {
          tile.rect.classList.remove("pending-traversal");
          tile.rect.classList.add("visited");
        }

        let moveSet = getAdjacentTiles(tile.row, tile.col);
        for (const move of moveSet) {
          if (priorityQueue.includes(move)) {
            if (move.cost + tile.distance < move.distance) {
              move.distance = move.cost + tile.distance;
              move.parent = tile;
            }
          } else {
            move.distance = move.cost + tile.distance;
            move.parent = tile;
            priorityQueue.push(move);
            if (!isDestinationNode(move)) {
              move.rect.classList.add("pending-traversal");
            }
          }
        }
        priorityQueue.sort((tileA, tileB) => {
          return (tileA.distance + heuristic(tileA)) -
                 (tileB.distance + heuristic(tileB));
        });
      } else {
        pathFound = true;
      }
      if (animate) {
        await sleep(ANIMATION_SPEED);
      }
    }

    if (pathFound) {
      drawPath(animate);
    }
  }

  /**
   * Executes a search from the starting node using Dijkstra's algorithm.
   * If the provided parameter is true, then the search will be animated.
   * Otherwise, no animation occurs and the path connecting the starting and
   * destination node will be displayed instantly (if one exists) alongside
   * the colored visited tiles & tiles pending traversal.
   * To learn more about Dijkstra's algorithm:
   * https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm
   *
   * @param animate boolean used to determine if search should be animated.
   */
  async function dijkstrasAlgorithm(animate = true) {
    let pathFound = false;
    let priorityQueue = [];

    start.distance = 0;
    priorityQueue.push(start);

    while(priorityQueue.length != 0 && !pathFound) {
      let tile = priorityQueue.shift();
      tile.isVisited = true;

      if (!isDestinationNode(tile)) {
        if (tile != start) {
          tile.rect.classList.remove("pending-traversal");
          tile.rect.classList.add("visited");
        }

        let moveSet = getAdjacentTiles(tile.row, tile.col);
        for (const move of moveSet) {
          if (priorityQueue.includes(move)) {
            if (move.cost + tile.distance < move.distance) {
              move.distance = move.cost + tile.distance;
              move.parent = tile;
            }
          } else {
            move.distance = move.cost + tile.distance;
            move.parent = tile;
            priorityQueue.push(move);
            if (!isDestinationNode(move)) {
              move.rect.classList.add("pending-traversal");
            }
          }
        }

        priorityQueue.sort((tileA, tileB) => {
          return tileA.distance - tileB.distance;
        });
      } else {
        pathFound = true;
      }
      if (animate) {
        await sleep(ANIMATION_SPEED);
      }
    }

    if (pathFound) {
      drawPath(animate);
    }
  }

  /**
   * Executes a Breadth First Search (BFS) from the starting node.
   * If the provided parameter is true, then the search will be animated.
   * Otherwise, no animation occurs and the path connecting the starting and
   * destination node will be displayed instantly (if one exists) alongside
   * the colored visited tiles & tiles pending traversal.
   * To learn more about BFS:
   * https://en.wikipedia.org/wiki/Breadth-first_search
   *
   * @param animate boolean used to determine if search should be animated.
   */
  async function breadthFirstSearch(animate = true) {
    let pathFound = false;
    let queue = [];
    queue.push(start);

    while(queue.length != 0 && !pathFound) {
      let tile = queue.shift();
      tile.isVisited = true;

      if (!isDestinationNode(tile)) {
        if (tile != start) {
          tile.rect.classList.remove("pending-traversal");
          tile.rect.classList.add("visited");
        }
        let moveSet = getAdjacentTiles(tile.row, tile.col);
        for (const move of moveSet) {
          if (!queue.includes(move)) {
            move.parent = tile;
            queue.push(move);
            if (!isDestinationNode(move)) {
              move.rect.classList.add("pending-traversal");
            }
          }
        }
      } else {
        pathFound = true;
      }
      if (animate) {
        await sleep(ANIMATION_SPEED);
      }
    }

    if (pathFound) {
      drawPath(animate);
    }
  }

  /**
   * Executes a Depth First Search (DFS) from the starting node.
   * If the provided parameter is true, then the search will be animated.
   * Otherwise, no animation occurs and the path connecting the starting and
   * destination node will be displayed instantly (if one exists) alongside
   * the colored visited tiles & tiles pending traversal.
   * To learn more about DFS:
   * https://en.wikipedia.org/wiki/Depth-first_search
   *
   * @param animate boolean used to determine if search should be animated.
   */
  async function depthFirstSearch(animate = true) {
    let pathFound = false;
    let stack = [];
    stack.push(start);

    while (stack.length != 0 && !pathFound) {
      let tile = stack.pop();
      tile.isVisited = true;

      if (!isDestinationNode(tile)) {
        if (tile != start) {
          tile.rect.classList.add("visited");
        }
        let moveSet = getAdjacentTiles(tile.row, tile.col).reverse();
        for (const move of moveSet) {
          move.parent = tile;
          stack.push(move);
        }
      } else {
        pathFound = true;
      }
      if (animate) {
        await sleep(ANIMATION_SPEED);
      }
    }

    if (pathFound) {
      drawPath(animate);
    }
  }

  /**
   * Calculates and returns the manhattan distance from the given tile
   * to the destination node.
   * It is computed by calculating the total number of spaces moved
   * vertically and horizontally from the given tile to reach the
   * destination node.
   *
   * @param tile used for heuristic calculation.
   * @returns    computed heuristic value from tile to the destination node.
   */
  function manhattanDistance(tile) {
    let x1 = tile.col;
    let y1 = tile.row;

    let x2 = end.col;
    let y2 = end.row;

    return Math.abs(x2 - x1) + Math.abs(y2 - y1);
  }

  /**
   * Calculates and returns the euclidean distance from the given tile
   * to the destination node.
   * It is computed by calculating the pythagorean distance from the
   * given tile to the destination node.
   *
   * @param tile used for heuristic calculation.
   * @returns    computed heuristic value from tile to the destination node.
   */
  function euclideanDistance(tile) {
    let x1 = tile.col;
    let y1 = tile.row;

    let x2 = end.col;
    let y2 = end.row;

    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  /**
   * Calculates and returns the chebyshev distance from the given tile
   * to the destination node.
   * It is computed by calculating the maximum of the vertical and horizontal
   * distances from the given tile to the destination node.
   *
   * @param tile used for heuristic calculation.
   * @returns    computed heuristic value from tile to the destination node.
   */
  function chebyshevDistance(tile) {
    let x1 = tile.col;
    let y1 = tile.row;

    let x2 = end.col;
    let y2 = end.row;

    return Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
  }

  /**
   * Calculates and returns the octile distance from the given tile
   * to the destination node.
   *
   * @param tile used for heuristic calculation.
   * @returns    computed heuristic value from tile to the destination node.
   */
  function octileDistance(tile) {
    let x1 = tile.col;
    let y1 = tile.row;

    let x2 = end.col;
    let y2 = end.row;

    return Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) +
           Math.sqrt(2) * Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1));
  }

  /**
   * Changes the state of all drop-down menus and buttons on the navbar from
   * enabled to disabled, or from disabled to enabled.
   * Note that if the heuristic drop-down is disabled, it will switch to enabled
   * iff the algorithm selected is A*.
   */
  function toggleMenuItems() {
    document.querySelectorAll(".nav-link, .btn").forEach(element => {
      element.classList.toggle("disabled");
    });
    if (document.querySelector(".nav-link").classList.contains("disabled")) {
      $("heuristics-dropdown").classList.add("disabled");
    } else {
      if (pathfindingAlgorithm == aStarSearch) {
        $("heuristics-dropdown").classList.remove("disabled");
      } else {
        $("heuristics-dropdown").classList.add("disabled");
      }
    }
  }

  /**
   * Removes path shown on the board. If there is no path present, no visual
   * changes occur.
   * A path consists of tiles colored during animation to mark visited tiles
   * and tiles pending traversal (frontier), and line segments that connect the
   * starting & destination nodes if a route exists.
   */
  function clearPath() {
    if ($("canvas").querySelector("#path")) {
      $("canvas").removeChild($("path"));
    }
    for (let tile of grid.flat()) {
      tile.rect.classList.remove("visited");
      tile.rect.classList.remove("pending-traversal");
      tile.isVisited = false;
      tile.distance = Infinity;
      tile.parent = null;
    }
  }

  /**
   * Given a tile, determine if it is an empty tile. If it is returns true,
   * false otherwise.
   * A tile is considered empty if it is neither a starting/destination node, nor
   * a wall or high-cost tile.
   *
   * @param tile to be determined as empty or non-empty.
   * @returns true if the given tiel is empty, false otherwise.
   */
   function isEmptyTile(tile) {
    let cl = tile.rect.classList;
    let offset = (cl.contains("visited") ? 1 : 0) +
                 (cl.contains("pending-traversal") ? 1 : 0)
    return (cl.length - offset) == 0;
  }

  /**
   * @returns true if animation is currently in progress, false otherwise.
   */
  function isAnimating() {
    return $("visualize").classList.contains("disabled");
  }

  /**
   * Initializes the board by inserting a grid of blank tiles.
   */
  function setBoard() {
    grid = [];
    let canvas = $("canvas");
    let height = canvas.clientHeight;
    let width = canvas.clientWidth;

    for (let row = 0; row < height / SIZE; row++) {
      grid[row] = [];
      for (let col = 0; col < width / SIZE; col++) {
        let tile = createTile(row, col);

        grid[row][col] = tile;
        canvas.appendChild(tile.rect);
      }
    }
  }

  /**
   * Assuming the row, col correspond to an existing tile on the grid, set the
   * tile to be either the starting node or the destination node based on the
   * boolean provided. Returns true once the tile has been correctly set,
   * otherwise if no changes were made returns false.
   * No changes will occur if the tile is non-empty.
   * If there is already a starting/ending node already on the grid, it is
   * removed and replaced at the new location.
   *
   * @param row index where the tile belongs to on grid.
   * @param col index where the tile belongs to on grid.
   * @param isStartingNode true if the tile should be set to the starting node,
   *        otherwise it should set the tile to be the destination node.
   * @returns true if the node was set, false otherwise.
   */
  function setNode(row, col, isStartingNode) {
    if (!isEmptyTile(grid[row][col])) {
      return false;
    }
    let stylingRule = isStartingNode ? "start" : "end";
    grid.flat().forEach(tile => tile.rect.classList.remove(stylingRule));

    if (isStartingNode) {
      start = grid[row][col];
      start.rect.classList.add(stylingRule);
    } else {
      end = grid[row][col];
      end.rect.classList.add(stylingRule);
    }
    return true;
  }

  /**
   * Builds and returns a structure that contains a reference to a blank
   * (white) svg rectangle along with other metadata such as the row/col
   * on the grid it belongs to, cost of tile, etc.
   * The row and col parameters determine the x, y location the tile belongs
   * to on the grid.
   *
   * @param row index where the tile belongs to on grid.
   * @param col index where the tile belongs to on grid.
   * @returns the tile structure created based on the parameters provided.
   */
  function createTile(row, col) {
    let tile = {};

    let svgRect = document.createElementNS(SVG_NS, "rect");
    svgRect.setAttribute("x", col * SIZE);
    svgRect.setAttribute("y", row * SIZE);
    svgRect.setAttribute("width", SIZE);
    svgRect.setAttribute("height", SIZE);
    svgRect.setAttribute("stroke-width", "1");
    svgRect.setAttribute("fill", "white");
    svgRect.setAttribute("stroke", "gray");  // TODO: Maybe change this.

    svgRect.onmousedown = function(event) {
      let selectedTile = getTileFromRect(event.target);
      if (selectedTile && !isAnimating()) {
        userInteractionHandler.isInteracting = true;
        if (selectedTile == start || selectedTile == end) {
          userInteractionHandler.isMovingNode = true;
          userInteractionHandler.isMovingStartingNode = (selectedTile == start);
        } else {
          if (isEmptyTile(selectedTile)) {
            if (userInteractionHandler.buildType == "Wall") {
              selectedTile.rect.classList.add("wall");
              selectedTile.isWall = true;
            } else { // High-Cost Tile
              selectedTile.rect.classList.add("high-cost-tile");
              selectedTile.cost = HIGH_TRANSITION_COST;
            }
          } else {
            userInteractionHandler.isErasingTiles = true;
            selectedTile.rect.classList.remove("wall");
            selectedTile.rect.classList.remove("high-cost-tile");
            selectedTile.isWall = false;
            selectedTile.cost = DEFAULT_TRANSITION_COST;
          }
        }
      }
    };
    svgRect.onmouseup = function() {
      userInteractionHandler.isInteracting = false;
      userInteractionHandler.isMovingNode = false;
      userInteractionHandler.isErasingTiles = false;
    };
    svgRect.onmousemove = function(event) {
      if (userInteractionHandler.isInteracting) {
        let selectedTile = getTileFromRect(event.target);
        if (userInteractionHandler.isMovingNode) {
          if (setNode(selectedTile.row, selectedTile.col,
                  userInteractionHandler.isMovingStartingNode)) {
            if (pathfindingAlgorithm && $("canvas").querySelector("#path")) {
              clearPath();
              pathfindingAlgorithm(false);
            }
          }
        } else {
          if (userInteractionHandler.isErasingTiles) {
            selectedTile.rect.classList.remove("wall");
            selectedTile.rect.classList.remove("high-cost-tile");
            selectedTile.isWall = false;
            selectedTile.cost = DEFAULT_TRANSITION_COST;
          } else if (isEmptyTile(selectedTile)) {
            if (userInteractionHandler.buildType == "Wall") {
              selectedTile.rect.classList.add("wall");
              selectedTile.isWall = true;
            } else { // High-Cost Tile
              selectedTile.rect.classList.add("high-cost-tile");
              selectedTile.cost = HIGH_TRANSITION_COST;
            }
          }
        }
      }
    };

    tile.row = row;
    tile.col = col;
    tile.rect = svgRect;
    tile.distance = Infinity;
    tile.cost = DEFAULT_TRANSITION_COST;
    tile.isWall = false;
    tile.isVisited = false;
    tile.parent = null;

    return tile;
  }

  /**
   * Determines if the given tile is the destination node, if so returns true,
   * otherwise returns false.
   *
   * @param tile structure to compare against end state.
   * @returns true if tile is end state, false otherwise.
   */
  function isDestinationNode(tile) {
    return end.row == tile.row && end.col == tile.col;
  }

  /**
   * Returns the tile structure containing a svg rectangle that matches
   * the rect provided in as a parameter. A tile structure includes
   * a reference to a svg rectangle along with metadata.
   * Returns null if no match is found within the grid.
   *
   * @param rect svg rect object.
   * @returns the corresponding tile structure for the rect if a match is
   *          found, null otherwise.
   */
  function getTileFromRect(rect) {
    for (let tile of grid.flat()) {
      if (tile.rect == rect) {
        return tile;
      }
    }
    return null;
  }

  /**
   * Assuming the row, col correspond to an existing tile on the grid, return
   * a list of tiles that are adjacent to it. The tile set will not contain
   * tiles that represent walls or tiles that have been marked as visited.
   *
   * @param row index where the tile belongs to on grid.
   * @param col index where the tile belongs to on grid.
   * @returns list of adjacent non-wall/non-visited tiles.
   */
  function getAdjacentTiles(row, col) {
    let moveSet = [];
    // UP
    if (row - 1 >= 0) {
      moveSet.push(grid[row - 1][col]);
    }
    // RIGHT
    if (col + 1 < grid[row].length) {
      moveSet.push(grid[row][col + 1]);
    }
    // DOWN
    if (row + 1 < grid.length) {
      moveSet.push(grid[row + 1][col]);
    }
    // LEFT
    if (col - 1 >= 0) {
      moveSet.push(grid[row][col - 1]);
    }

    return moveSet.filter(tile => !tile.isWall && !tile.isVisited);
  }

  /**
   * Draws a path from the starting node to the destination node, assuming
   * one exists. This path consists of connecting line segments.
   * The given parameter dictates whether or not the path should be animated.
   *
   * @param animate boolean used to determine if the path should be
   *                animated from start to destination.
   */
  async function drawPath(animate) {
    let steps = [end];
    let current = end;
    let lineCommand = "";

    while (current.parent) {
      current = current.parent;
      steps.unshift(current);
    }

    current = steps.shift(); // starting node
    lineCommand += `M${SIZE * current.col + 0.5 * SIZE},
                    ${SIZE * current.row + 0.5 * SIZE}`;
    for (const step of steps) {
      lineCommand += `L${SIZE * step.col + 0.5 * SIZE},
                      ${SIZE * step.row + 0.5 * SIZE}`;
    }

    let svgPath = document.createElementNS(SVG_NS, "path");
    svgPath.setAttribute("d", lineCommand);
    svgPath.id = "path";
    svgPath.style.animation = `dash ${animate ? 1 : 0}s linear forwards`;
    svgPath.setAttribute("stroke-width", "5");
    svgPath.setAttribute("fill", "none");
    svgPath.setAttribute("stroke", "#ffff00");
    svgPath.setAttribute("stroke-dasharray", svgPath.getTotalLength());
    svgPath.setAttribute("stroke-dashoffset", svgPath.getTotalLength());

    $("canvas").appendChild(svgPath);
  }

  /**
   * Pauses code execution for a fixed amount of time determined by the
   * provided parameter.
   *
   * @param ms sleep time in milliseconds.
   * @returns  new Promise object to aid in asynchronous sleep operation.
   */
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Helper function to get the element by id.
   *
   * @param  the string ID of the DOM element to retrieve.
   * @return the DOM element denoted by the ID given.
   */
  function $(id) {
    return document.getElementById(id);
  }
})();
