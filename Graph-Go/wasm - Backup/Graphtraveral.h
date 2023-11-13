#include <stdio.h>
#include <stdlib.h>

#include "Graph.h"
#include "Queue.h"

void breadthFirstSearch(Graph g, int src);

void depthFirstSearch(Graph g, int src);

void dijkstra(Graph g, int src, int target);

void AStar(Graph g, int src, int target);

void GreedySearch(Graph g, int src, int target);