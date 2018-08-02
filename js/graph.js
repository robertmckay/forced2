var Graph = function(targetElement, graph) {

    var self = this;
    graph.id = false;

    var svg = d3.select("svg"),
        width = svg.attr("width"),
        height = svg.attr("height"),


        scaledata = ['transaction', 'de.dltlab.triangle.cordapp.contract.ConfirmationContract', 'de.dltlab.triangle.cordapp.contract.ForwardContract'];
    color = d3.scaleOrdinal(d3.schemeCategory20).domain(scaledata);

    simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(100).strength(1))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2)),

        linkGroup = svg.append("g")
        .attr("class", "links"),

        nodeGroup = svg.append("g")
        .attr("class", "nodes"),

        update = function() {

            // Redefine and restart simulation
            simulation
                .nodes(graph.nodes)
                .on("tick", ticked);

            simulation.force("link")
                .links(graph.links);

            // Update links
            link = linkGroup.selectAll("line")
                .data(graph.links),

                // Enter links
                linkEnter = link.enter().append("line")
                .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

            link = linkEnter.merge(link);

            // Update the nodes
            var node = nodeGroup.selectAll(".node")
                .data(graph.nodes);

            var nodeEnter = node.enter()
                .append("g")
                .attr("id", function(d) {
                    return "id" + d.id.replace(":0", "0");
                })
                .attr("class", function(d) {
                    if (d.group === "transaction") {
                        // console.log("tx node");
                        return "transaction node";
                    } else {
                        d3.select("#ID"); // console.log("circle node");
                        return "circle node";
                    }
                }).call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

            node = nodeEnter.merge(node);

            // Exit any old nodes
            node.exit().remove();


            graph.nodes.forEach(function(n, i) {
                var elem = svg.select("#" + "id" + n.id.replace(":0", "0"));
                if (n.group !== 'transaction') {
                    updateCircle(elem, n);
                } else {
                    addRectangle(elem, n);
                }
                elem.selectAll("title").remove();
                elem.append("title")
                    .text(function(d) { return d.title; });
            });

            function updateCircle(elem, d) {
                if (elem.select("circle").empty()) {
                    elem.append("circle")
                        .attr("r", 20)
                        .attr("fill", function(d) { return color(d.group); })
                        .call(d3.drag()
                            .on("start", dragstarted)
                            .on("drag", dragged)
                            .on("end", dragended));
                };
            };

            function addRectangle(elem, n) {
                // elem.selectAll("rect").remove();
                if (elem.select("rect").empty() || graph.id != false) {
                    elem.select("rect").remove();
                    var stroke = 0;
                    console.log(graph.id);
                    var id = graph.id;
                    if (id) {
                        stroke = (id == n.id) || (id + ':0' == n.id) ? '4' : '0';
                    }
                    console.log(stroke)
                    elem.append("rect")
                        .attr("width", 30)
                        .attr("height", 30)
                        .attr("fill", function(d) { return color(d.group); })
                        .attr('stroke-width', stroke)
                        .attr('stroke', 'red')
                        .attr('stroke-dasharray', '10,0')
                        .attr('stroke-linecap', 'butt')
                        .call(d3.drag()
                            .on("start", dragstarted)
                            .on("drag", dragged)
                            .on("end", dragended));
                }
            };

            // Squares start on a corner, Circles in the middle
            function centerOffsetSrc(d, p) {
                if (d.source.group === "transaction") {
                    return p + 10;
                } else {
                    // console.log(JSON.stringify(d.source.group));
                    return p;
                }
            };

            function centerOffsetDst(d, p) {
                if (d.target.group === "transaction") {
                    return p + 10;
                } else {
                    // console.log(JSON.stringify(d.source.group));
                    return p;
                }
            };


            function ticked() {
                link
                    .attr("x1", function(d) { return centerOffsetSrc(d, d.source.x); })
                    .attr("y1", function(d) { return centerOffsetSrc(d, d.source.y); })
                    .attr("x2", function(d) { return centerOffsetDst(d, d.target.x); })
                    .attr("y2", function(d) { return centerOffsetDst(d, d.target.y); });

                node
                    .attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; })
                    .attr("transform", function(d) { return "translate(" + d.x + ", " + d.y + ")"; });
            };


        };

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    };

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    };

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    };


    updateGraph = function(links, nodes) {

        for (var i = 0; i < nodes.length; i++) {
            // console.log('adding node', nodes[i]);
            graph.nodes.push(nodes[i]);
        }

        for (var i = 0; i < links.length; i++) {
            // console.log('adding link', links[i]);
            graph.links.push(links[i]);
        }

        update();

    };

    underline = function(target_id) {
        graph.id = target_id == '' ? false : target_id;
        update();
    }

    // Public functions
    this.updateGraph = updateGraph;
    this.underline = underline;

    update();

};


//graph container
var targetElement = document.querySelector('svg');
var gobj;
var gdata;

// d3.json("visual1.json", function(error, data) {
//     gobj  = new Graph(targetElement, data);
//     gdata = data;
// });

var request = new XMLHttpRequest();
request.open('GET', '/visual.1', true);
request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
        // Success!
        var data = JSON.parse(request.responseText);
        console.log('load data');
        gdata = clone(data);
        console.log(gdata);
        gobj = new Graph(targetElement, data);

    } else {}
};

request.onerror = function() {
    console.log('transaction error');
};
request.send();


setTimeout(function() {
    request.open('GET', '/visual.2', true);
    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            // Success!
            var data2 = JSON.parse(request.responseText);

            loadData(data2);
        } else {}
    };

    request.onerror = function() {
        // There was a connection error of some sort
    };
    request.send();
}, 1500);

setTimeout(function() {
    request.open('GET', '/visual.3', true);
    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            // Success!
            var data3 = JSON.parse(request.responseText);

            loadData(data3);
        } else {}
    };

    request.onerror = function() {
        // There was a connection error of some sort
    };
    request.send();
}, 3000);

function loadData(data) {
    var newdata = data;
    var links = [];
    var nodes = [];
    console.log('load data');
    links = data.links.filter(function(elem, n) {
        var t = false;
        gdata.links.forEach(function(glink, i) {
            // console.log(elem.source );
            // console.log(glink.source);
            if (elem.source === glink.source) {
                t = true;
                console.log(elem.source + ' ' + glink.source + ' ' + t);

            };

        });
        if (t == true) {
            // data.links.splice(n);
        };

        return t == false;
    });
    var nodes = data.nodes.filter(function(elem, n) {
        var t = false;
        gdata.nodes.forEach(function(gnode, i) {
            // console.log(elem.source );
            // console.log(glink.source);
            if (elem.id === gnode.id) {
                t = true;
                console.log(elem.id + ' ' + gnode.id + ' ' + t);

            };

        });
        if (t == true) {
            // data.links.splice(n);
        };

        return t == false;
    });

    gdata = clone(data);
    gobj.updateGraph(links, nodes);
}

var form = document.getElementById("form1"),
    text = document.getElementById("filter");
form.addEventListener('submit', function(e) {
    e.preventDefault();
    gobj.underline(text.value)

});


function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}




// // https://stackoverflow.com/questions/40018270/d3js-v4-add-nodes-to-force-directed-graph
