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

const unmarkedColour = "#D3D3D3"
const markedColour = "#6F73D2"

var nodeChecklabel;

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
            .attr("cx", function (d) { d.x = Math.max(8, Math.min(width-8, d.x)); return d.x+6; })
            .attr("cy", function(d) { d.y = Math.max(8, Math.min(width-8, d.y)); return d.y-6;  })


        label
            .attr("x", function(d){ return d.x; })
            .attr("y", function (d) {return d.y; })

            
        nodeChecklabel
            .attr("x", function(d){return ((d.source.x+d.target.x)/2); })
            .attr("y", function (d) {return ((d.source.y+d.target.y)/2); })
            //.text(function (d) { return d.source.id; });
            .text("1");
        }


    getDropDownData();

}
function loadWasm() {
    WebAssembly.instantiateStreaming(fetch("wasm/GraphGo.wasm"), importObject).then(
    );
}

function displayMarkedNodes() {
    const nodeArray = svg.selectAll("circle")
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

function dfsJS() {
    if(!graphLoaded) {
        return;
    }
    const startTime = performance.now();
    const visited = [];
    const queue = [];
    const linkArray = simulation.force("link").links();

    const src = document.getElementById("src_container").options[document.getElementById("src_container").selectedIndex].value;

    //Reset nodes
    const nodeArray = svg.selectAll("circle")
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
        linkArray.forEach(function(link) {
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
    displayMarkedNodes();                     
    displaySearchResults(visited);
    const endTime = performance.now();
    document.getElementById("js-results").textContent = endTime-startTime;

}

function dfsWASM() {
    const startTime = performance.now();

    WebAssembly.instantiateStreaming(fetch("wasm/GraphGo.wasm"), importObject).then(
        result => {
            const instance = result.instance;
            const exports = instance.exports;
            console.log(Object.keys(exports));
        });

    const endTime = performance.now();
    document.getElementById("wasm-results").textContent = endTime-startTime;
}

function bfs(){
    bfsJS();
    bfsWASM();
}

function bfsJS() {
    if(!graphLoaded) {
        return;
    }
    const startTime = performance.now();
    
    const visited = [];
    const queue = [];
    const linkArray = simulation.force("link").links();

    const src = document.getElementById("src_container").options[document.getElementById("src_container").selectedIndex].value;

    //Reset nodes
    const nodeArray = svg.selectAll("circle")
     .attr("marked", function(d) {
        d.marked = 0;
        if(d.name === src) {
            d.marked = 1;
            visited.push(src);
        }
     })

    queue.push(src);

    while(queue.length != 0) {
        linkArray.forEach(function(link) {
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
                    console.log(link.source);
                }
            }
        });
        queue.shift();
    }
    displayMarkedNodes();                
    displaySearchResults(visited);

    const endTime = performance.now();
    document.getElementById("js-results").textContent = endTime-startTime;
    console.log(endTime-startTime);
}

function bfsWASM() {
    const startTime = performance.now();

    WebAssembly.instantiateStreaming(fetch("wasm/GraphGo.wasm"), importObject).then(
        result => {
            const instance = result.instance;
            const exports = instance.exports;
            console.log(Object.keys(exports));
        });

    const endTime = performance.now();
    document.getElementById("wasm-results").textContent = endTime-startTime;
}

function displaySearchResults(visited) {
    var table = document.getElementById("grid-result-id");
    table.innerHTML = "";
    const entry = document.createElement('div');
    entry.textContent = "Vertice ID";
    table.style.display = "grid";
    table.appendChild(entry);

    table.style.gridTemplateColumns = "repeat(${visited.length/5}, minmax(200px, 1fr))";
    console.log(visited.length);
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

function dijkastraJS() {
    if(!graphLoaded) {
        return;
    }
    const startTime = performance.now();

    var table = document.getElementById("grid-result-id");
    table.style.display = "none";


    const linkArray = simulation.force("link").links();


    const src = document.getElementById("src_container").options[document.getElementById("src_container").selectedIndex].value;
    const target = document.getElementById("target_container").options[document.getElementById("target_container").selectedIndex].value;;

    linkArray.forEach(function(d) {
        d.pathWeighted = Infinity;
    });

    const visited = [];
    const queue = [];

    const nodeArray = svg.selectAll("circle").data();
    nodeArray.forEach(function(d) {
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
        linkArray.forEach(function(link) {
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
   nodeArray.forEach(function(d) {
        d.marked = 0;
        if(d.name === target) {
            targetNode = d;
            targetNode.marked = 1;
        }
   })
    while(targetNode != visited[0]) {
        var closerNode = targetNode;
        linkArray.forEach(function (link) {
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
        console.log(targetNode);
    }

    displayMarkedNodes();


    nodeChecklabel.text(function(d) {
        if(d.target.distance > d.source.distance) {
            return d.target.distance
        };
        return d.source.distance;
        })

    const endTime = performance.now();
    document.getElementById("js-results").textContent = endTime-startTime;
    
}

function dijkastraWASM() {
    const startTime = performance.now();

    WebAssembly.instantiateStreaming(fetch("wasm/GraphGo.wasm"), importObject).then(
        result => {
            const instance = result.instance;
            const exports = instance.exports;
            console.log(Object.keys(exports));
        });

    const endTime = performance.now();
    document.getElementById("wasm-results").textContent = endTime-startTime;
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



function readBFS() {
    fetch('results.txt').then(response => response.text)
    .then((data) => {
        console.log(data);
    })
}


