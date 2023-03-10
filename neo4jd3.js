/* global d3, document */
/* jshint latedef:nofunc */
"use strict";

import * as d3 from "d3";

export default function Neo4jD3(selector, _options) {
  var info,
    classes2colors = {},
    numClasses = 0,
    nodes,
    relationships,
    selector,
    options = {
      colors: colors(),
      neo4jData: undefined,
      neo4jDataUrl: undefined,
      distance: 100,
      strength: -300,
      labelFontSize: "9px",
      infoPanel: false,
    },
    VERSION = "0.1.0";

  init(selector, _options);

  function version() {
    return VERSION;
  }

  function colors() {
    // oneDark inspired by distrotube (dt)
    return [
      "#5b6268", // brighter black
      "#da8548", // brighter red
      "#4db5bd", // brighter green
      "#ecbe7b", // brighter yellow
      "#3071db", // brighter blue
      "#a9a1e1", // brighter magenta
      "#46d9ff", // brighter cyan
      "#dfdfdf", // brighter white
      "#ff6c6b", // red
      "#98be65", // green
      "#da8548", // yellow
      "#51afef", // blue
      "#c678dd", // magenta
      "#5699af", // cyan
      "#a7b1b7", // white
      "#1c1f24", // black
    ];
  }

  //  function color() {
  //    return options.colors[(options.colors.length * Math.random()) << 0];
  //  }
  function defaultColor() {
    return options.colors[4];
  }
  function defaultDarkenColor() {
    return d3.rgb(options.colors[options.colors.length - 1]).darker(1);
  }
  //  function defaultEdgeColor() {
  //    return options.colors[0];
  //  }

  function merge(target, source) {
    Object.keys(source).forEach(function (property) {
      target[property] = source[property];
    });
  }

  function toString(d) {
    var s = d.labels ? d.labels[0] : d.type;

    s += " (<id>: " + d.id;

    Object.keys(d.properties).forEach(function (property) {
      s += ", " + property + ": " + JSON.stringify(d.properties[property]);
    });

    s += ")";

    return s;
  }

  function contains(array, id) {
    var filter = array.filter(function (elem) {
      return elem.id === id;
    });
    return filter.length > 0;
  }

  function linkArc(d) {
    const r =
      (Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y) /
        d.linknum) *
      2.5;
    return `
    M${d.source.x},${d.source.y}
    A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
  `;
  }

  function drag(simulation) {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  function appendInfoPanel(container) {
    return container.append("div").attr("class", "neo4jd3-info");
  }

  function appendInfoElement(cls, property, value) {
    var elem = info.append("div");
    elem
      .attr("class", cls)
      .html("<strong>" + property + "</strong>" + (value ? ": " + value : ""));
    if (!value) {
      elem
        .style("color", function () {
          return property ? class2color(property) : defaultColor();
        })
        .style("border-color", function () {
          return property ? class2darkenColor(property) : defaultDarkenColor();
        });
    }
  }

  function appendInfoElementClass(cls, node) {
    appendInfoElement(cls, true, node);
  }

  function appendInfoElementProperty(cls, property, value) {
    appendInfoElement(cls, false, property, value);
  }

  function appendInfoElementRelationship(cls, relationship) {
    appendInfoElement(cls, false, relationship);
  }

  function class2color(cls) {
    var color = classes2colors[cls];
    if (!color) {
      //            color = options.colors[Math.min(numClasses, options.colors.length - 1)];
      color = options.colors[numClasses % options.colors.length];
      classes2colors[cls] = color;
      numClasses++;
    }
    return color;
  }

  function class2darkenColor(cls) {
    return d3.rgb(class2color(cls)).darker(1);
  }

  function clearInfo() {
    info.html("");
  }

  function updateInfo(d) {
    clearInfo();

    if (d.labels) {
      appendInfoElementClass("class", d.labels[0]);
    } else {
      appendInfoElementRelationship("class", d.type);
    }

    appendInfoElementProperty("property", "id", d.id);

    Object.keys(d.properties).forEach(function (property) {
      appendInfoElementProperty(
        "property",
        property,
        JSON.stringify(d.properties[property])
      );
    });
  }

  function _types(relationships) {
    return Array.from(new Set(relationships.map((d) => d.type)));
  }

  function _relationships(relationships) {
    for (var i = 0; i < relationships.length; i++) {
      if (
        i != 0 &&
        relationships[i].source == relationships[i - 1].source &&
        relationships[i].target == relationships[i - 1].target
      ) {
        relationships[i].linknum = relationships[i - 1].linknum + 1;
      } else {
        relationships[i].linknum = 1;
      }
    }
    return relationships;
  }

  function size() {
    return {
      nodes: nodes.length,
      relationships: relationships.length,
    };
  }

  function neo4jDataToD3Data(data) {
    var graph = {
      nodes: [],
      relationships: [],
    };
    data?.results?.forEach(function (result) {
      result.data.forEach(function (data) {
        data.graph.nodes.forEach(function (node) {
          if (!contains(graph.nodes, node.id)) {
            graph.nodes.push(node);
          }
        });
        data.graph.relationships.forEach(function (relationship) {
          relationship.source =
            relationship.startNode | relationship.startNodeId;
          relationship.target = relationship.endNode | relationship.endNodeId;
          graph.relationships.push(relationship);
        });
        data.graph.relationships.sort(function (a, b) {
          if (a.source > b.source) {
            return 1;
          } else if (a.source < b.source) {
            return -1;
          } else {
            if (a.target > b.target) {
              return 1;
            }
            if (a.target < b.target) {
              return -1;
            } else {
              return 0;
            }
          }
        });
        for (var i = 0; i < data.graph.relationships.length; i++) {
          if (
            i !== 0 &&
            data.graph.relationships[i].source ===
              data.graph.relationships[i - 1].source &&
            data.graph.relationships[i].target ===
              data.graph.relationships[i - 1].target
          ) {
            data.graph.relationships[i].linknum =
              data.graph.relationships[i - 1].linknum + 1;
          } else {
            data.graph.relationships[i].linknum = 1;
          }
        }
      });
    });
    return graph;
  }

  function init(selector, _options) {
    merge(options, _options);
    if (options.hasOwnProperty("neo4jData")) {
      const data = neo4jDataToD3Data(options.neo4jData);
      const container = d3.select(selector);
      container.attr("class", "neo4jd3").html("");
      //if (options?.infoPanel) {
      //  info = appendInfoPanel(container);
      //}
      const relationships = _relationships(data.relationships);
      const nodes = data.nodes;
      const svg = container
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("class", "neo4jd3-graph");
      const simulation = d3
        .forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(options.strength))
        .force(
          "link",
          d3
            .forceLink(relationships)
            .id(function (d) {
              return d?.id;
            })
            .distance(function () {
              return (
                (options?.distance | 100) +
                (options?.distance | 100) * 0.25 * Math.random()
              );
            })
        )
        .force(
          "center",
          d3.forceCenter(
            svg.node().parentElement.parentElement.clientWidth / 2,
            svg.node().parentElement.parentElement.clientHeight / 2
          )
        );
      svg
        .append("g")
        .attr("class", "relationships")
        .attr("fill", "none")
        .attr("stroke-width", 4)
        .selectAll("g")
        .data(relationships, function (d) {
          return d.id;
        })
        .join("g")
        .attr("class", "relationship");
      const relationshipArc = svg
        .selectAll(".relationship")
        .append("path")
        .attr("id", function (d, i) {
          return "edgepath" + i;
        })
        .join("path")
        .attr("stroke", (d) => class2color(d.type));
      svg
        .selectAll(".relationship")
        .append("text")
        .attr("class", "text")
        .attr("fill", "#000")
        .attr("font-size", options.labelFontSize)
        .attr("class", "text")
        .append("textPath")
        .attr("text-anchor", "middle")
        .attr("startOffset", "50%")
        .attr("xlink:xlink:href", function (d, i) {
          return "#edgepath" + i;
        })
        .text(function (d) {
          return d.type;
        });
      const allNodes = svg
        .append("g")
        .attr("class", "nodes")
        .attr("fill", "currentColor")
        .attr("class", "node")
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .attr("cursor", "pointer")
        .selectAll("g")
        .data(nodes, function (d) {
          return d.id;
        })
        .join("g")
        .attr("class", "node")
        .selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(function (d) {
          return typeof d?.properties?.object_name === "string"
            ? d.properties.object_name
            : d?.labels.hasOwnProperty(0) && typeof d?.labels[0] === "string"
            ? d.labels[0]
            : "*";
        })

        //.on("mouseover", function (e, d) {
        //  if (info) updateInfo(d);
        //})
        //.on("mouseleave", function (e, d) {
        //  if (info) clearInfo(d);
        //})
        .call(drag(simulation));
      allNodes
        .append("circle")
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .attr("fill", (d) => class2color(d.labels[0]))
        .attr("r", 7)
        .append("title")
        .text(function (d) {
          return toString(d);
        });
      simulation.on("tick", function () {
        relationshipArc.attr("d", linkArc);
        allNodes.attr("transform", (d) => `translate(${d.x},${d.y})`);
      });
    }
  }

  return {
    neo4jDataToD3Data: neo4jDataToD3Data,
    size: size,
    version: version,
  };
}
