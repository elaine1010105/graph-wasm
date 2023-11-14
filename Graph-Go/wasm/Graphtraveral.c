#include <stdio.h>
#include <stdlib.h>

#include "Graph.h"
#include "Queue.h"



// BFS
void breadthFirstSearch(Graph g, int src) {
	int num = GraphNumVertices(g);
	int *visited = calloc(num,sizeof(int));
	int i;
	for(i = 0; i < num ; i++){
		visited[i] = 0;
	}
	Queue q = QueueNew();
	QueueEnqueue(q, src);
	visited[src] = 1;

	while(!QueueIsEmpty(q)){
		int item = QueueDequeue(q);
		for(i = 0; i < num ; i++){
			if(GraphIsAdjacent(g,item,i) && visited[i] != 1){
				QueueEnqueue(q, i);
				visited[i] = 1;
			}	
		}
	}
	free(visited);
	QueueFree(q);
}

// DFS
void dfs(Graph g, Vertex v, int num, int *visited);
void depthFirstSearch(Graph g, int src) {
	int num = GraphNumVertices(g);
	int *visited = calloc(num,sizeof(int));
	int i;
	for(i = 0; i < num ; i++){
		visited[i] = 0;
	}
	dfs(g,src, num, visited);
	free(visited);
}

void dfs(Graph g, Vertex v, int num, int *visited){
	visited[v] = 1;
	for(int i = 0; i < num ; i++){
		if(GraphIsAdjacent(g,i,v) && visited[i]!=1){
			dfs(g,i, num, visited);
		}
	}
}


void dijkstra(Graph g, Vertex src, Vertex target) {
    int num = GraphNumVertices(g);
	int *visited = calloc(num,sizeof(int));
	int *weighted = calloc(num,sizeof(int));
	int i;
	for(i = 0; i < num ; i++){
		visited[i] = 0;
        weighted[i] = -1;
	}
	Queue q = QueueNew();
	QueueEnqueue(q, src);
	visited[src] = 1;
    weighted[src] = 0;

	while(!QueueIsEmpty(q)) {
		int item = QueueDequeue(q);
        printf("%d \n", item);
		if(item == target) {
			printf("found");
			break;
		}
		for(i = 0; i < num ; i++){            
			if(GraphIsAdjacent(g,item,i) && visited[i] != 1){
				if(!QueueIsEmpty(q)) {
					if(GetEdgeWeight(g, i) < GetEdgeWeight(g, QueuePeek(q))) {
						QueueEnqueueFront(q, i);
					}
					else {
						QueueEnqueue(q, i);
					}
				}
				else {
					QueueEnqueue(q, i);
				}
				visited[i] = 1;
			}	
		}
	}
	free(visited);
    free(weighted);
	QueueFree(q);
}

void AStar(Graph g, Vertex src, Vertex target) {
    int num = GraphNumVertices(g);
	int *visited = calloc(num,sizeof(int));
	int i;
	for(i = 0; i < num ; i++){
		visited[i] = 0;
	}
	Queue q = QueueNew();
	QueueEnqueue(q, src);
	visited[src] = 1;

	while(!QueueIsEmpty(q)) {
		int item = QueueDequeue(q);
		printf("%d \n", item);
		if(item == target) {
			printf("found");
			break;
		}
		for(i = 0; i < num ; i++){
			if(GraphIsAdjacent(g,item,i) && visited[i] != 1){
				if(!QueueIsEmpty(q)) {
					//heuristic: assume vertice with highest id that is less than
					//target's id is the correct path
					//take difference in id's as heuristic value
					if(GetEdgeWeight(g, i) > GetEdgeWeight(g, QueuePeek(q)) && i < target) {
						QueueEnqueueFront(q, i);
					}
					else {
						QueueEnqueue(q, i);
					}
					visited[i] = 1;
				}
				else {
					QueueEnqueue(q,i);
				}
			}	
		}
	}
	free(visited);
	QueueFree(q);
}


void GreedySearch(Graph g, Vertex src, Vertex target) { 
	int num = GraphNumVertices(g);
	int *visited = calloc(num,sizeof(int));
	int i;
	for(i = 0; i < num ; i++){
		visited[i] = 0;
	}
	Queue q = QueueNew();
	QueueEnqueue(q, src);
	visited[src] = 1;

	while(!QueueIsEmpty(q)) {
		int item = QueueDequeue(q);
		printf("%d ", item);
		if(item == target) {
			printf("found");
			break;
		}
		for(i = 0; i < num ; i++){
			if(GraphIsAdjacent(g,item,i) && visited[i] != 1){
				if(!QueueIsEmpty(q)) {
					if(i > QueuePeek(q) && i < target) {
						QueueEnqueueFront(q, i);
					}
					else {
						QueueEnqueue(q, i);
					}
					visited[i] = 1;
				}
				else {
					QueueEnqueue(q,i);
				}
			}	
		}
	}
	free(visited);
	QueueFree(q);
}

void doKcore(Graph g, int num, int k, int level, int* nodes) {
	int nodesLost = 0;

	Queue q = QueueNew();
    for(int i = 0; i < num; i++) {
        if(nodes[i] == level) {
            QueueEnqueue(q, i);
        }
    }

	while(!QueueIsEmpty(q)){
		int item = QueueDequeue(q);
		int neighborsum = 0;
		for(int i = 0; i < num ; i++){
            //Check if node is adjacent and on the current or later level
			if(GraphIsAdjacent(g,item,i) && (nodes[i] == level || nodes[i] == level + 1)){
				neighborsum += 1;
			}
		}
        //If node had the needed number of neighbours; raise its level
		if(neighborsum >= k){
            nodes[item] = level + 1;
		}
        //Increment nodes so we know that kcore check needs to repeat
        else
        {
            nodesLost++;
        }
	}
    //Check if no nodes were lost during last kcore search
	if(nodesLost == 0){
		return;
	}
	QueueFree(q);
    printf("levels: %d \n", level);
    return doKcore(g, num, k, level + 1, nodes);
}

void kcore(Graph g, int k, Vertex src){
	int num = GraphNumVertices(g);

    /*Keep track of kcore by storing the iteration each node with had the needed
    k value up to. On later iterations, raise the k val level and only look at the
    nodes that have the needed level.
    */
    int level = 1;
	int *nodes = calloc(num,sizeof(int));

	for(int i = 0; i < num ; i++){
        nodes[i] = level;
	}
    doKcore(g, num, k, level, nodes);
    free(nodes);
}
