const neo4j = require('neo4j');

const db = new neo4j.GraphDatabase('http://Niels:root@localhost:7474');

module.exports = db;