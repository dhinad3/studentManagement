const pool = require("../db/db");

async function putAttendence(req,res){
    try {
        let msg_arr = [];
        const { selectedDate, id, isChecked } = req.body;
        //check to ensure that the id is already there in the table
        const existingData = await pool.query(
          "SELECT * FROM attendence WHERE attendance_date = $1 AND student_id_fk = $2",
          [selectedDate, id]
        );
    
        if (existingData.rows.length > 0) {
          //update the table
          const result = await pool.query(
            "UPDATE attendence SET status = $1 WHERE attendance_date = $2 AND student_id_fk = $3",
            [isChecked, selectedDate, id]
          );
          msg_arr.push("Attendance record updated successfully");
        } else {
          //insert new record
          const result = await pool.query(
            "INSERT INTO attendence (attendance_date, student_id_fk, status) VALUES ($1, $2, $3)",
            [selectedDate, id, isChecked]
          );
          msg_arr.push("New attendance record inserted successfully");
        }
        if (isChecked == "present") {
          const result = await pool.query(
            `UPDATE students SET attendance_count = attendance_count+1 WHERE stu_id=$1`,
            [id]
          );
          msg_arr.push("Attendance Count Incremented");
        } else {
          const result = await pool.query(
            `UPDATE students SET attendance_count = attendance_count-1 WHERE stu_id=$1`,
            [id]
          );
          msg_arr.push("Attendance Count Decremented");
        }
        res.json({ message: msg_arr });
      } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Internal server error" });
      }
}

async function weeklyData(req,res){
  try{
    console.log(req.params.section)
    const date = new Date();
    console.log(date)
    const weeklyData = await pool.query(`SELECT a.attendance_date, COUNT(s.stu_id) AS num_students_present
    FROM attendence a
    INNER JOIN students s ON a.student_id_fk = s.stu_id
    WHERE a.status = 'present' 
      AND s.section = '${req.params.section}'
      AND a.attendance_date >= date_trunc('week', CURRENT_DATE)
      AND a.attendance_date < date_trunc('week', CURRENT_DATE) + INTERVAL '1 week'
    GROUP BY a.attendance_date
    ORDER BY a.attendance_date DESC
    LIMIT 7;`)
    console.log(weeklyData)
    res.json(weeklyData.rows)
  }catch(error){
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function monthlyData(req,res){
  try{
    console.log(req.params.section)
    const date = new Date();
    console.log(date)
    const monthlyData = await pool.query(`SELECT a.attendance_date, COUNT(s.stu_id) AS num_students_present
    FROM attendence a
    INNER JOIN students s ON a.student_id_fk = s.stu_id
    WHERE a.status = 'present' 
      AND s.section = '${req.params.section}'
      AND EXTRACT(MONTH FROM a.attendance_date) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM a.attendance_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    GROUP BY a.attendance_date
    ORDER BY a.attendance_date DESC
    LIMIT 30;`)
    console.log(monthlyData)
    res.json(monthlyData.rows)
  }catch(error){
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function details(req,res){
  try{
    const details = await pool.query(`SELECT 
    (SELECT COUNT(*) FROM attendence a 
     INNER JOIN students s ON a.student_id_fk = s.stu_id 
     WHERE a.status = 'present' 
       AND s.section = '${req.params.section}' 
       AND a.attendance_date = CURRENT_DATE) AS num_students_present,
    (SELECT COUNT(*) FROM students WHERE section = '${req.params.section}') AS total_students;`)
    console.log(details)
    res.json(details.rows)
  }catch(error){

  }
}


module.exports = { putAttendence,weeklyData,monthlyData,details};