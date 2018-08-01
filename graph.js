var svg = d3.select("svg"),
    width = svg.attr("width"),
    height = svg.attr("height");
    

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(100).strength(1))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));
    

d3.json("visual1.json", function(error, graph) {
  if (error) throw error;

  var link = svg.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
      .attr("stroke-width", function(d) { return Math.sqrt(d.value); });


var node = svg.selectAll(".node")
            .data(graph.nodes)
            .enter()
            .append("g")
            .attr("class", function (d) {
                if (d.group === "transaction") {
                   console.log("tx node");
                   return "transaction node";
                } else {
                   console.log("circle node");
                   return "circle node";
                }
            }).call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));
         


 
 var rect = svg.selectAll(".transaction").append("rect")
    .attr("width", 30)
    .attr("height", 30)
    .attr("fill", function(d) { return color(d.group); })
    .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

    /*
    .attr("class", function (d) {
    return "node type" + d.group
});*/



svg.selectAll(".circle").append("circle") 
    .attr("r", 20)
    .attr("fill", function(d) { return color(d.group); })
//.style("fill", function(d) { return fill(d.type); })
.call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

  node.append("title")
      .text(function(d) { return d.title; });  // mouse over text here

  simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(graph.links);
      

  // Squares start on a corner, Circles in the middle
  function centerOffsetSrc(d, p) {
     if (d.source.group === "transaction") {
        return p + 15;
     } else { 
       console.log(JSON.stringify(d.source.group));
       return p;
		 }    
  }
  
    function centerOffsetDst(d, p) {
     if (d.target.group === "transaction") {
        return p + 15;
     } else { 
       console.log(JSON.stringify(d.source.group));
       return p;
		 }    
  }


  function ticked() {
    link
        .attr("x1", function(d) { return centerOffsetSrc(d, d.source.x); })
        .attr("y1", function(d) { return centerOffsetSrc(d, d.source.y); })
        .attr("x2", function(d) { return centerOffsetDst(d, d.target.x); })
        .attr("y2", function(d) { return centerOffsetDst(d, d.target.y);});

    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("transform", function (d) {return "translate(" + d.x + ", " + d.y + ")";});
  }
});

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}
