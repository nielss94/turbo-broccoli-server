const neo4j = require('neo4j');

const db = new neo4j.GraphDatabase('http://Niels:b.V59qvPCc1Lqq.pWgBksSC2TUAkkxt@hobby-dmgobjifjhecgbkeiiligjal.dbs.graphenedb.com:24789');

module.exports = db;