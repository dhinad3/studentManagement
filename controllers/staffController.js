const bcrypt = require("bcrypt");
const pool = require("../db/db");
const ExcelJS = require("exceljs");

async function signup(req, res) {
  try {
    const { username, password, name, designation, experience } = req.body;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const query = `INSERT INTO staffs (password,name,designation,experience,username) VALUES ('${hashedPassword}','${name}','${designation}',${experience},'${username}')`;
    await pool.query(query);

    res.status(201).send("Staff created successfully");
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).send("Error creating staff");
  }
}

async function login(req, res) {
  try {
    console.log("inside login ")
    const { username, password } = req.body;
    const query = "SELECT * FROM staffs WHERE username = $1";
    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const hashedPasswordFromDb = result.rows[0].password;
    const isPasswordMatch = await bcrypt.compare(password, hashedPasswordFromDb);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const queryForId = "SELECT id FROM staffs WHERE username = $1 and password = $2";
    const id = await pool.query(queryForId, [username, hashedPasswordFromDb]);
    
    res.status(200).json({ message: "Login successful", id: id.rows[0].id });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getFullDetails(req,res){
  try {
    const id = req.params.id;
    const client = await pool.connect();
    const result = await client.query(`SELECT * FROM staffs WHERE id = ${id}`);
    const studentResult = await pool.query(
      `SELECT name, stu_id ,section FROM students WHERE staff_idfk =${id}`
    );
    const numberOfClasses = await pool.query(
      `select count(distinct section) as numberOfClasses from students where staff_idfk=${id};`
    );
    const subjects = await pool.query(
      `select subjects from subjects where staff_id=${id}`
    );
    const numberOfStudents = await pool.query(
      `select count(stu_id) from students where staff_idfk=${id}`
    );
    const classNames = await pool.query(
      `select distinct section from students where staff_idfk=${id}`
    );
    // console.log(
    //   subjects.rows.map((item) => {
    //     return item.subjects;
    //   })
    // );
    console.log(result);
    console.log(studentResult);
    console.log(numberOfClasses);
    console.log(numberOfStudents);
    const staffResult = result.rows;
    // console.log("jhsbvh", staffResult);

    staffResult[0].classes = numberOfClasses.rows[0].numberofclasses;
    staffResult[0].numberOfStudents = numberOfStudents.rows[0].count;
    staffResult[0].classNames = classNames.rows.map((item) => {
      return item.section;
    });

    // console.log("after", staffResult);
    //staffResult[0].numberOfClasses = numberOfClasses.rows[0].numberOfClasses;
    res.json({
      staff: result.rows[0],
      subjects: subjects.rows.map((item) => {
        return item.subjects;
      }),
      students: studentResult.rows,
    });
    client.release();
  } catch (err) {
    console.log(err);
    res.status(500).send("Error Retrieving Users");
  }
}

async function addStudent(req,res){
  try {
    console.log("request",req.body);
    const id = req.params.id;
    const attendance_count = 0; // default start count 
    const { aadharno, rollno, name, section, dob, fathername, email, phno,address } =
      req.body;
    console.log(
      aadharno,
      name,
      section,
      dob,
      rollno,
      address,
      fathername,
      email,
      phno
    );
    
    const client = await pool.connect();
    const query = `INSERT INTO students(aadharno,name,address,section,dob,attendance_count,email,phno,staff_idfk,fathername,rollno) VALUES (${aadharno},'${name}','${address}','${section}','${dob}',${attendance_count},'${email}','${phno}',${id},'${fathername}','${rollno}')`;
    console.log(query);
    const result = await client.query(query);
    console.log(result);
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error Retrieving Users");
  }
}

async function getAttendenceExcel (req,res){
  try {
    // Connect to the database
    await pool.connect();

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance");

    // Query the attendance data
    const result = await pool.query(`SELECT  attendence.attendance_date,attendence.student_id_fk,attendence.status
    FROM attendence
    JOIN students ON attendence.student_id_fk = students.stu_id
    WHERE students.staff_idfk = '${req.params.id}';`);
    console.log(result);

    // Add headers
    worksheet.addRow(["StudentID", "Date", "Status"]);

    // Add data rows
    result.rows.forEach((row) => {
      console.log("entered")
      console.log(row);
      console.log("not")
      worksheet.addRow([
        row.student_id_fk,
        row.attendance_date.toLocaleDateString(),
        row.status,
      ]);
    });

    // Set content type and disposition for the response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=attendance_report.xlsx"
    );

    // Write workbook to response

    // End the response

    await workbook.xlsx.write(res);
    // res.end("binary");
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Internal Server Error");
  }
}

async function getAllStudentsExcel(req,res){
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Student Details");
    worksheet.addRow([
      "ID",
      "Aadhaar Number",
      "Name",
      "Age",
      "Section",
      "DoB",
      "Attendance Count",
      "Email",
      "Phone",
    ]);
    const result = await pool.query(`SELECT * FROM students where staff_idfk ='${req.params.id}'`);
    result.rows.forEach((row) => {
      console.log(row)
      worksheet.addRow([
        row.stu_id,
        row.aadharno,
        row.name,
        row.age,
        row.section,
        row.dob.toLocaleDateString(),
        row.attendance_count,
        row.email,
        row.phno,
      ]);
    });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=student_report.xlsx"
    );

    await workbook.xlsx.write(res);
  } catch (error) {
    console.error("Error", error.message);
    res.status(500).send("Internal Server Error");
  }
}

async function getAllStaffs(req,res){
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM staffs");
    console.log(result);
    res.json(result.rows);
    client.release();
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).send("Error retrieving users");
  }
}

module.exports = { signup, login, getFullDetails, addStudent, getAllStudentsExcel, getAttendenceExcel, getAllStaffs};
