
#include <stdio.h>
#include <stdlib.h>

#include "Graph.h"
#include "Graphtraveral.h"

Graph graph;

int main(void) {
	Graph g;
	
	printf("Read from file? (y/n) \n");
	char readFile;
	scanf(" %c", &readFile);
	if(readFile == 'y') {
		g = GraphReadFromFile();
	}
	else {
		g = GraphRead();
	}

	GraphDump(g, stdout);

	printf("Enter src: \n");
	int src;
	scanf("%d", &src);
	
	printf("Choose operation \n"
	"1. Breadth First Search \n"
	"2. Depth First Search \n"
	"3. Dijkstra \n"
	"4. A* \n"
	"5. Greedy Shortest Path \n"
	);
	int target;
	int op;
	scanf("%d", &op);
	switch (op)
	{
	case 1: //BFS
		printf("Breadth first search starting at vertex %d: \n", src);
		breadthFirstSearch(g, src);
		printf("\n");
		break;
	case 2: //DFS
		printf("Depth first search starting at vertex %d: \n", src);
		depthFirstSearch(g, src);
		printf("\n");
		break;
	case 3: //Dijkstra
		printf("Enter target vertex: \n");
		scanf("%d", &target);

		printf("Dijkastra at vertex %d to vertex %d: \n", src, target);
		dijkstra(g, src, target);
		printf("\n");
		break;
	case 4: //A*
		printf("Enter target vertex: \n");
		scanf("%d", &target);

		printf("AStar at vertex %d to vertex %d: \n", src, target);
		AStar(g, src, target);
		printf("\n");
		break;
	case 5: //Greedy
		printf("Enter target vertex: \n");
		scanf("%d", &target);

		printf("Greedy Search at vertex %d to vertex %d: \n", src, target);
		GreedySearch(g, src, target);
		printf("\n");
		break;
	default:
		printf("error \n");
		break;
	};
	GraphFree(g);

	scanf("%d");
}

char* runBFS(char* graphToRead, int src) {
    if(graph == NULL) {
        graph = WASMLoadFile(graphToRead);        
        printf("created graph");
    }
    if(graph != NULL) {
        breadthFirstSearch(graph, src);
        return "completed";
    }
    return "file not found";
}

char* runDFS(char* graphToRead, int src) {
    if(graph == NULL) {
        graph = WASMLoadFile(graphToRead);        
        printf("created graph");
    }    if(graph != NULL) {
        depthFirstSearch(graph, src);
    }
    return "completed";
}
char* runDijkastra(char* graphToRead, int src, int target) {
    if(graph == NULL) {
        graph = WASMLoadFile(graphToRead);        
        printf("created graph");
    }
    if(graph != NULL) {
        dijkstra(graph, src, target);
    }  
    return "completed";
}

char* runAStar(char* graphToRead, int src, int target) {
    if(graph == NULL) {
        graph = WASMLoadFile(graphToRead);        
        printf("created graph");
    } 
    if(graph != NULL) {
        AStar(graph, src, target);
    }  
    return "completed";
}

char* runKCore(char* graphToRead, int src) {
    if(graph == NULL) {
        graph = WASMLoadFile(graphToRead);        
        printf("created graph");
    } 
    if(graph != NULL) {
        kcore(graph, 3, src);
    }  
    return "completed";
}