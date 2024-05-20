const pool = require("../db/db");


async function get(req, res) {
  try {
    const id = req.params.id;
    const result = await pool.query(`SELECT * FROM students WHERE stu_id = ${id}`);
    res.json(result.rows);
  } catch (error) {
    console.error("Error getting student:", error);
    res.status(500).send("Error getting student");
  }
}

async function getAll(req,res){
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT name from students");
    console.log(result);
    res.json(result.rows);
    client.release();
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).send("Error retrieving users");
  }
}

module.exports = { get, getAll };
