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
		printf("%d ", item);	
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
void dfs(Graph g, Vertex v, int *visited);
void depthFirstSearch(Graph g, int src) {
	int num = GraphNumVertices(g);
	int *visited = calloc(num,sizeof(int));
	int i;
	for(i = 0; i < num ; i++){
		visited[i] = 0;
	}
	dfs(g,src,visited);
	free(visited);
}

void dfs(Graph g, Vertex v, int *visited){
	visited[v] = 1;
	printf("%d ", v);	
	int num = GraphNumVertices(g);
	for(int i = 0; i < num ; i++){
		if(GraphIsAdjacent(g,i,v) && visited[i]!=1){
			dfs(g,i,visited);
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
		if(item == target) {
			printf("found");
			return;
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
		printf("%d ", item);
		if(item == target) {
			printf("found");
			return;
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
			return;
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