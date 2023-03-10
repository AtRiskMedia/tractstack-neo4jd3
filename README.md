# neo4jd3.js

[Neo4j](https://github.com/neo4j) graph visualization using [D3.js](https://github.com/d3/d3).

!Forked from [neo3jd3.js](https://eisman.github.io/neo4jd3/img/neo4jd3.jpg?v=0.0.5)

## Features

* Compaptible with the [Neo4j data format](#neo4j-data-format) and the [D3.js data format](#d3js-data-format).
* Force simulation.
* Compatible with D3.js v7.


## Documentation

```javascript
var neo4jd3 = new Neo4jd3('.selector', options);
```

### Options

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| **neo4jData** | *object* | Graph data in [Neo4j data format](#neo4j-data-format). |
| **neo4jDataUrl** | *string* | URL of the endpoint that serves the graph data in [Neo4j data format](#neo4j-data-format). |


### JavaScript API

| Function | Description |
| -------- | ----------- |
| **neo4jDataToD3Data**(*data*) | Converts data from [Neo4j data format](#neo4j-data-format) to [D3.js data format](#d3js-data-format). |
| **size**() | Returns the number of nodes and relationships.<br>Example:<br>`{`<br>&nbsp;&nbsp;&nbsp;&nbsp;`nodes: 25,`<br>&nbsp;&nbsp;&nbsp;&nbsp;`relationships: 50`<br>`}` |

| **version**() | Returns the version of neo4jd3.js.<br>Example: `'0.0.1'` |

### Documentation

#### D3.js data format

```
{
    "nodes": [
        {
            "id": "1",
            "labels": ["User"],
            "properties": {
                "userId": "eisman"
            }
        },
        {
            "id": "8",
            "labels": ["Project"],
            "properties": {
                "name": "neo4jd3",
                "title": "neo4jd3.js",
                "description": "Neo4j graph visualization using D3.js.",
                "url": "https://eisman.github.io/neo4jd3"
            }
        }
    ],
    "relationships": [
        {
            "id": "7",
            "type": "DEVELOPES",
            "startNode": "1",
            "endNode": "8",
            "properties": {
                "from": 1470002400000
            },
            "source": "1",
            "target": "8",
            "linknum": 1
        }
    ]
}
```

#### Neo4j data format

```
{
    "results": [
        {
            "columns": ["user", "entity"],
            "data": [
                {
                    "graph": {
                        "nodes": [
                            {
                                "id": "1",
                                "labels": ["User"],
                                "properties": {
                                    "userId": "eisman"
                                }
                            },
                            {
                                "id": "8",
                                "labels": ["Project"],
                                "properties": {
                                    "name": "neo4jd3",
                                    "title": "neo4jd3.js",
                                    "description": "Neo4j graph visualization using D3.js.",
                                    "url": "https://eisman.github.io/neo4jd3"
                                }
                            }
                        ],
                        "relationships": [
                            {
                                "id": "7",
                                "type": "DEVELOPES",
                                "startNode": "1",
                                "endNode": "8",
                                "properties": {
                                    "from": 1470002400000
                                }
                            }
                        ]
                    }
                }
            ]
        }
    ],
    "errors": []
}
```
