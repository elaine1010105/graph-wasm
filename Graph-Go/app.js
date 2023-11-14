/*These functions don't need to do anything; they just need a declaration in the import object
From functions used imported by libraries but not called
*/
const importObject = {
    env: {
      exit: function() {
        // Implement the behavior of the 'exit' function here
      },
      __assert_fail: function() {
        // Implement the behavior of the '__assert_fail' function here
      },
      __syscall_openat: function() {
        // Implement the behavior of the '__syscall_openat' function here
      },
      __syscall_fcntl64: function() {
        // Implement the behavior of the '__syscall_fcntl64' function here
      },
      __syscall_ioctl: function() {
        // Implement the behavior of the '__syscall_ioctl' function here
      },
      emscripten_memcpy_big: function() {
        // Implement the behavior of the 'emscripten_memcpy_big' function here
      },
      emscripten_resize_heap: function() {
        // Implement the behavior of the 'emscripten_resize_heap' function here
      },
    },
    wasi_snapshot_preview1: {
      fd_write: function() {
        // Implement the behavior of the 'fd_write' function here
      },
      fd_read: function() {
        // Implement the behavior of the 'fd_read' function here
      },
      fd_close: function() {
        // Implement the behavior of the 'fd_close' function here
      },
      fd_seek: function() {
        // Implement the behavior of the 'fd_seek' function here
      },
    },
  };

const graphDiv = d3.select('#grid-graph');
// set the dimensions and margins of the graph
const margin = {top: 0, right: 0, bottom: 0, left: 0},
  width = graphDiv.node().clientWidth,
  height = graphDiv.node().clientHeight;

// append the svg object to the body of the page
const svg = d3.select("#grid-graph")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        `translate(${margin.left}, ${margin.top})`);

var color = d3.scaleOrdinal(d3.schemeSet1);

var simulation;

var graphLoaded = false;
var graphName = ""

const unmarkedColour = "#D3D3D3"
const markedColour = "#6F73D2"

var nodeChecklabel;

var listOfNodes = [];
var listOfLinks = [];

var src;
var target;
var srcIdx;
var targetIdx;

function setGraphName(name) {
    graphName = name;
}

function updateSrc() {
    src = document.getElementById("src_container").options[document.getElementById("src_container").selectedIndex].value;
    getSrcIdx();
}

function updateTarget() {
    target = document.getElementById("target_container").options[document.getElementById("target_container").selectedIndex].value;
    getTargetIdx();
}

function getSrcIdx() {
    var dataArr = listOfNodes.data();
    for(let i = 0; i < dataArr.length; i++) {
        if(dataArr[i].name == src) {
            srcIdx = i+1;
            return;
        } 
    }
}

function getTargetIdx() {
    var dataArr = listOfNodes.data();
    for(let i = 0; i < dataArr.length; i++) {
        if(dataArr[i].name == target) {
            targetIdx = i+1;
            return;
        } 
    }
}

function graphReady(inputFile) {
    displayGraph(inputFile);
}

function displayGraph(data) {
    graphLoaded = true;

    // Initialize the links
    const link = svg
        .selectAll("line")
        .data(data.links)
        .join("line")
        .style("stroke", "#aaa")

    // Initialize the nodes
    const node = svg
        .selectAll("circle")
        .data(data.nodes)
        .join("circle")
        .attr("r", 16)
        .style("fill", "#123456")


    const label = svg.selectAll("nodeLabel")
        .data(data.nodes)
        .enter()
        .append("text")
        .text(function (d) { return d.name; })
        .style("text-anchor", "middle")
        .style("fill", "#00000")
        .style("font-family", "Arial")
        .style("font-size", 16);

    nodeChecklabel = svg.selectAll("weightLabel")
        .data(data.links)
        .enter()
        .append("text")
        .text(function (d) { return d.source.id; })
        .style("text-anchor", "middle")
        .style("fill", "#00000")
        .style("font-family", "Arial")
        .style("font-size", 16);


    // Let's list the force we wanna apply on the network
    simulation = d3.forceSimulation(data.nodes)                 // Force algorithm is applied to data.nodes
        .force("link", d3.forceLink()                               // This force provides links between nodes
                .id(function(d) { return d.id; })                     // This provide  the id of a node
                .links(data.links)                                    // and this the list of links
        )
        .force("charge", d3.forceManyBody().strength(-300))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
        .force("center", d3.forceCenter(width / 2, height / 2))     // This force attracts nodes to the center of the svg area
        .on("end", ticked);

    // This function is run at each iteration of the force algorithm, updating the nodes position.
    function ticked() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node
            .attr("cx", function (d) { d.x = Math.max(16, Math.min(width-16, d.x)); return d.x; })
            .attr("cy", function(d) { d.y = Math.max(16, Math.min(height-16, d.y)); return d.y;  })


        label
            .attr("x", function(d){ return d.x; })
            .attr("y", function (d) {return d.y; })

            
        nodeChecklabel
            .attr("x", function(d){return ((d.source.x+d.target.x)/2); })
            .attr("y", function (d) {return ((d.source.y+d.target.y)/2); })
            //.text(function (d) { return d.source.id; });
            .text("1");
        }
    listOfLinks = simulation.force("link").links();
    listOfNodes = svg.selectAll("circle");

    getDropDownData();
    graphInformation();

}

function loadFile() {

}

function displayMarkedNodes() {
    listOfNodes
        .style("fill", function(d) {
            if(d.marked === 1) {
                return markedColour;
            }
            else {
                return unmarkedColour;
            }
        })
}

function dfs() {
    dfsJS();
    dfsWASM();
}

function dfsJS(display = true) {
    if(!graphLoaded) {
        return;
    }
    const startTime = performance.now();
    const visited = [];
    const queue = [];

    //Reset nodes
    listOfNodes
    .attr("marked", function(d) {
        d.marked = 0;
        if(d.name === src) {
            d.marked = 1;
        }
    })

    queue.push(src);


    while(queue.length != 0) {
        var current = queue.pop();
        visited.push(current);
        listOfLinks.forEach(function(link) {
            if(link.source.name === current) {
                if(link.target.marked === 0) {
                    queue.push(link.target.name);
                    link.target.marked = 1;
                }
            }
            if(link.target.name === current) {
                if(link.source.marked === 0) {
                    queue.push(link.source.name);
                    link.source.marked = 1;

                }
            }
        });
    }
    const endTime = performance.now();
    if(display) {
        displayMarkedNodes();                     
        displaySearchResults(visited);    
        document.getElementById("js-results").textContent = endTime-startTime;
    }
    return endTime-startTime;

}

function dfsWASM(display = true) {
    const startTime = performance.now();

    console.log(Module.ccall('runDFS', "string", ['string', 'number'], ["Graphs/"+graphName, srcIdx]));

    const endTime = performance.now();
    if(display) {
        document.getElementById("wasm-results").textContent = endTime-startTime;
    }
    return endTime-startTime;
}

function bfs(){
    bfsJS();
    bfsWASM();
}

function bfsJS(display = true) {
    if(!graphLoaded) {
        return;
    }
    const startTime = performance.now();
    
    const visited = [];
    const queue = [];

    //Reset nodes
    listOfNodes
     .attr("marked", function(d) {
        d.marked = 0;
        if(d.name === src) {
            d.marked = 1;
            visited.push(src);
        }
     })

    queue.push(src);

    while(queue.length != 0) {
        listOfLinks.forEach(function(link) {
            if(link.source.name === queue[0]) {
                if(link.target.marked === 0) {
                    queue.push(link.target.name);
                    link.target.marked = 1;
                    visited.push(link.target.name);
                }
            }
            if(link.target.name === queue[0]) {
                if(link.source.marked === 0) {
                    queue.push(link.source.name);
                    link.source.marked = 1;
                    visited.push(link.source.name);
                }
            }
        });
        queue.shift();
    }
    const endTime = performance.now();
    if(display) {
        displayMarkedNodes();                     
        displaySearchResults(visited);    
        document.getElementById("js-results").textContent = endTime-startTime;
    }
    return endTime-startTime;
}


function bfsWASM(display = true) {
    const startTime = performance.now();

    console.log(Module.ccall('runBFS', "string", ['string', 'number'], ["Graphs/"+graphName, srcIdx]));

    const endTime = performance.now();
    if(display) {
        document.getElementById("wasm-results").textContent = endTime-startTime;
    }

    return endTime-startTime;

}

function displaySearchResults(visited) {
    var table = document.getElementById("grid-result-id");
    table.innerHTML = "";
    const entry = document.createElement('div');
    entry.textContent = "Vertice ID";
    table.style.display = "grid";
    table.appendChild(entry);

    table.style.gridTemplateColumns = "repeat(${visited.length/5}, minmax(200px, 1fr))";
    for(i in visited) {
        const verticeIdEntry = document.createElement('div');
        verticeIdEntry.className = 'grid-result-entry';
        verticeIdEntry.textContent = visited[i];
        table.appendChild(verticeIdEntry);
    }
}

function dijkastra() {

    dijkastraJS();
    dijkastraWASM();
}

function dijkastraJS(display = true) {
    if(!graphLoaded) {
        return;
    }
    const startTime = performance.now();

    var table = document.getElementById("grid-result-id");
    table.style.display = "none";



    listOfLinks.forEach(function(d) {
        d.pathWeighted = Infinity;
    });

    const visited = [];
    const queue = [];

    listOfNodes.data().forEach(function(d) {
        d.distance = Infinity;
        d.marked = 0;
        if(d.name === src) {
            d.distance = 0;
            queue.push(d);
            d.marked = 1;
        }
    });


    while(queue.length != 0) {
        var current = queue.shift();
        visited.push(current);
        listOfLinks.forEach(function(link) {
            if(link.source.name === current.name) {
                //Update the distance
                // if(link.target.distance > link.source.distance + link.source.id) {
                //     link.target.distance = link.source.distance + link.source.id;
                // }
                if(link.target.distance > link.source.distance + 1) {
                    link.target.distance = link.source.distance + 1;
                }

                //Add the first occurence to the queue
                if(link.target.marked === 0) {
                    queue.push(link.target);
                    link.target.marked = 1;
                }
            }
            if(link.target.name === current.name) {
                //Update the distance
                if(link.source.distance > link.target.distance + link.source.id) {
                    link.source.distance = link.target.distance + link.source.id;
                }
                if(link.source.distance > link.target.distance + 1) {
                    link.source.distance = link.target.distance + 1;
                }
                //Add the first occurence to the queue
                if(link.source.marked === 0) {
                    queue.push(link.source);
                    link.source.marked = 1;
                }
            }
        })
        queue.sort(function(a,b) {
            return(a.distance - b.distance);
        })
    }


    ///WORK OUT SHORTEST PATH
    var targetNode;
   //Reset nodes
    listOfNodes.data().forEach(function(d) {
        d.marked = 0;
        if(d.name === target) {
            targetNode = d;
            targetNode.marked = 1;
        }
   })
    while(targetNode != visited[0]) {
        var closerNode = targetNode;
        listOfLinks.forEach(function (link) {
            //Get the closest node
            if(link.source === targetNode) {
                if(link.target.distance < closerNode.distance) {
                    closerNode = link.target;
                }
            }
            if(link.target === targetNode) {
                if(link.source.distance < closerNode.distance) {
                    closerNode = link.source;
                }
            }
        })
        targetNode = closerNode;
        targetNode.marked = 1;
    }
    const endTime = performance.now();

    if(display) {
        displayMarkedNodes();                     
        nodeChecklabel.text(function(d) {
            if(d.target.distance > d.source.distance) {
                return d.target.distance
            };
            return d.source.distance;
            })
        document.getElementById("js-results").textContent = endTime-startTime;
    }
    return endTime - startTime;    
}

function dijkastraWASM(display = true) {
    const startTime = performance.now();

    console.log(Module.ccall('runDijkastra', "string", ['string', 'number', 'number'], ["Graphs/"+graphName, srcIdx, targetIdx]));

    const endTime = performance.now();
    if(display) {
        document.getElementById("wasm-results").textContent = endTime-startTime;
    }
    return endTime-startTime;
}

function astar() {
    astarWASM();
    astarJS();
}

function astarJS(display = true) {
    if(!graphLoaded) {
        return;
    }
    const startTime = performance.now();

    var table = document.getElementById("grid-result-id");
    table.style.display = "none";

    listOfLinks.forEach(function(d) {
        d.pathWeighted = Infinity;
    });

    const visited = [];
    const queue = [];

    const fscore = new Map();

    var targetNode;

    listOfNodes.data().forEach(function(d) {
        d.marked = 0;
        d.distance = Infinity;
        fscore.set(d.name, Infinity);

        if(d.name === src) {
            d.distance = 0;
            fscore.set(d.name, 0);
            queue.push(d);
            //0 = not visited, 1 = open set, 2 = closed set
            d.marked = 1;

        }
        if(d.name === target) {
            targetNode = d;
        }
    });

    while(queue.length != 0) {
        var current = queue.shift();
        visited.push(current);
        listOfLinks.forEach(function(link){
            if(link.source.name === current.name) {
                //check if distance is greater than current distance
                if(link.target.distance > link.source.distance) {
                    link.target.distance = link.source.distance + 1;
                    //set f score, heuristic: closer alphanumeric character is closer node
                    fscore.set(link.source.name, link.target.distance+targetNode.id-current.id);
                }
                //Add the first occurence to the queue
                if(link.target.marked === 0) {
                    queue.push(link.target);
                    link.target.marked = 1;
                }
            }
            if(link.target.name === current.name) {
                //check if distance is greater than current distance
                if(link.source.distance > link.target.distance) {
                    link.source.distance = link.target.distance + 1;
                    //set f score
                    fscore.set(link.source.name, link.target.distance+targetNode.id-current.id);
                }
                //Add the first occurence to the queue
                if(link.source.marked === 0) {
                    queue.push(link.source);
                    link.source.marked = 1;
                }
            }
        })
        queue.sort(function(a,b) {
            return(fscore.get(a.name) - fscore.get(b.name));
        })
    }

    //Reset nodes
    listOfNodes.data().forEach(function(d) {
        d.marked = 0;
        if(d.name === target) {
            targetNode = d;
            targetNode.marked = 1;
        }
    })
    while(targetNode != visited[0]) {
        var closerNode = targetNode;
        listOfLinks.forEach(function (link) {
            //Get the closest node
            if(link.source === targetNode) {
                if(link.target.distance < closerNode.distance) {
                    closerNode = link.target;
                }
            }
            if(link.target === targetNode) {
                if(link.source.distance < closerNode.distance) {
                    closerNode = link.source;
                }
            }
        })
        targetNode = closerNode;
        targetNode.marked = 1;
    }

    const endTime = performance.now();
    if(display) {
        displayMarkedNodes();                     
        nodeChecklabel.text(function(d) {
            if(d.target.distance > d.source.distance) {
                return d.target.distance
            };
            return d.source.distance;
            })
        document.getElementById("js-results").textContent = endTime-startTime;
    }
    return endTime - startTime;   
}

function astarWASM(display = true) {
    const startTime = performance.now();
  
    console.log(Module.ccall('runAStar', "string", ['string', 'number', 'number'], ["Graphs/"+graphName, srcIdx, targetIdx]));

    const endTime = performance.now();
    if(display) {
        document.getElementById("wasm-results").textContent = endTime-startTime;
    }
    return endTime-startTime;
}

function getDropDownData() {

    const nodes = svg.selectAll("circle").data();
    const nodeNames = [];
    for(i in nodes) {
        nodeNames.push(nodes[i].name);
    }

   var dropDown = document.getElementById("src_container");
    nodeNames.forEach(nodeText => {
        const nodeOption = document.createElement("option");
        nodeOption.value = nodeText;
        nodeOption.text = nodeText;
        dropDown.appendChild(nodeOption);
    });


    dropDown = document.getElementById("target_container");
    nodeNames.forEach(nodeText => {
        const nodeOption = document.createElement("option");
        nodeOption.value = nodeText;
        nodeOption.text = nodeText;
        dropDown.appendChild(nodeOption);
    });
  }

function graphInformation(){
    const nV = document.getElementById("vertices-number");
    nV.textContent =  listOfNodes.size();
    console.log("A");
    const nE = document.getElementById("edges-number");
    nE.textContent =  Object.keys(listOfLinks).length;

}

const deformedGraph = d3.select("#deformed-graph")
.append("svg")
.attr("width", 700)
.attr("height", 600)

function kcore() {
    kcoreJS();
    kcoreWASM();
}

function kcoreJS(display = true) {
//Get this working later
/*    const deformedNodes = deformedGraph
        .selectAll("circle")
        .data(listOfNodes)
        .join("circle")
        .attr("r", 16)
        .style("fill", "#123456")

    // var dupNodes = deformedGraph.selectAll("#deformed-graph")
    //     .data(listOfNodes)
    //     .enter()
    //     .append(function(d) {return d.cloneNode(true)})
    console.log(deformedGraph.selectAll("circle"))
    */
    //Start the recursive function
    const startTime = performance.now();
    var nodesCopy = listOfNodes.data();
    var linksCopy = listOfLinks;
    doKcore(nodesCopy, linksCopy, 3);

    const endTime = performance.now();
    if(display) {
        document.getElementById("js-results").textContent = endTime-startTime;
    }
    return endTime-startTime;

}
//Recursive function
function doKcore(nodes, links, kVal) {
    var nodesToDelete = [];

    nodes.forEach(function(d,i) {
        var degree = links.filter(function(link) {
            return (link.source.id == d.id || link.target.id == d.id)
        })
        if(degree.length < kVal) {
            nodesToDelete.push(d)
        }
    })
    if(nodesToDelete.length == 0) {
        return;
    }
    else {
        nodes = nodes.filter(node => !nodesToDelete.includes(node));
        links = links.filter(link => (nodes.some(node => node.id === link.source.id) && nodes.some(node => node.id === link.target.id)));
        return doKcore(nodes, links, kVal);
    }

}

function kcoreWASM(display = true) {
    const startTime = performance.now();
  
    console.log(Module.ccall('runKCore', "string", ['string', 'number'], ["Graphs/"+graphName, srcIdx]));

    const endTime = performance.now();
    if(display) {
        document.getElementById("wasm-results").textContent = endTime-startTime;
    }
    return endTime-startTime;
}

function doExperiment() {
   bfsExperiment();
   dfsExperiment();
   dijkastraExperiment();
   astarExperiment();

    // experimentTimeJS = 0;
    // experimentTimeWasm = 0;
    // for(var i = 0; i < 1000; i++) {
    //     experimentTimeWasm += dijkastraWASM();
    //     experimentTimeJS += dijkastraJS();
    // }
    // document.getElementById("dijkastra-wasm").textContent=experimentTimeWasm/1000 +"s";
    // document.getElementById("dijkastra-js").textContent=experimentTimeJS/1000 +"s";

    // experimentTimeJS = 0;
    // experimentTimeWasm = 0;
    // for(var i = 0; i < 1000; i++) {
    //     experimentTimeWasm += astarWASM();
    //     experimentTimeJS += astarJS();
    // }
    // document.getElementById("astar-wasm").textContent=experimentTimeWasm/1000 +"s";
    // document.getElementById("astar-js").textContent=experimentTimeJS/1000 +"s";
}

function bfsExperiment() {
    var experimentTimeJS = 0;
    var experimentTimeWasm = 0;
    for(var i = 0; i < 300; i++) {
        experimentTimeWasm += bfsWASM();
        experimentTimeJS += bfsJS();
    }
    document.getElementById("bfs-wasm").textContent=experimentTimeWasm/1000 +"s";
    document.getElementById("bfs-js").textContent=experimentTimeJS/1000 +"s";
}

function dfsExperiment() {
     //dfs
    var experimentTimeJS = 0;
    var experimentTimeWasm = 0;
    for(var i = 0; i < 300; i++) {
        experimentTimeWasm += dfsWASM(false);
        experimentTimeJS += dfsJS(false);
    }
    document.getElementById("dfs-wasm").textContent=experimentTimeWasm/1000 +"s";
    document.getElementById("dfs-js").textContent=experimentTimeJS/1000 +"s";
}

function dijkastraExperiment() {
   var experimentTimeJS = 0;
   var experimentTimeWasm = 0;
   for(var i = 0; i < 300; i++) {
       experimentTimeWasm += dijkastraWASM(false);
       experimentTimeJS += dijkastraJS(false);
   }
   document.getElementById("dijkastra-wasm").textContent=experimentTimeWasm/1000 +"s";
   document.getElementById("dijkastra-js").textContent=experimentTimeJS/1000 +"s";
}

function astarExperiment() {
   var experimentTimeJS = 0;
   var experimentTimeWasm = 0;
   for(var i = 0; i < 300; i++) {
       experimentTimeWasm += astarWASM(false);
       experimentTimeJS += astarJS(false);
   }
   document.getElementById("astar-wasm").textContent=experimentTimeWasm/1000 +"s";
   document.getElementById("astar-js").textContent=experimentTimeJS/1000 +"s";
}