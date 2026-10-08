#2026 octo
from flask import Flask,render_template,request,jsonify
import sqlite3
app=Flask(__name__)

def db():
    return sqlite3.connect("students.db")

def create_db():
    con=db()
    con.execute("""CREATE TABLE IF NOT EXISTS students(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roll_no TEXT,
        name TEXT,
        note TEXT
    )""")
    try:
        con.execute("ALTER TABLE students ADD COLUMN note TEXT")
    except sqlite3.OperationalError:
        pass
    con.commit()
    con.close()

@app.route("/")
def home():
    return render_template("Index.html")

@app.route("/student",methods=["POST"])
def add_student():
    data=request.json
    con=db()
    con.execute(
        "INSERT INTO students(roll_no,name,note) VALUES(?,?,?)",
        (
            data.get("roll_no","").strip(),
            data.get("name","").strip(),
            data.get("note","").strip()
        )
    )
    con.commit()
    con.close()
    return jsonify({"message":"Student added successfully"})

@app.route("/students")
def get_students():
    con=db()
    students=con.execute("SELECT * FROM students").fetchall()
    con.close()
    return jsonify(students)

@app.route("/student/<int:id>",methods=["PUT"])
def update_student(id):
    data=request.json
    con=db()
    con.execute(
        "UPDATE students SET roll_no=?,name=?,note=? WHERE id=?",
        (
            data.get("roll_no","").strip(),
            data.get("name","").strip(),
            data.get("note","").strip(),
            id
        )
    )
    con.commit()
    con.close()
    return jsonify({"message":"Student updated successfully"})

@app.route("/student/<int:id>",methods=["DELETE"])
def delete_student(id):
    con=db()
    con.execute("DELETE FROM students WHERE id=?",(id,))
    con.commit()
    con.close()
    return jsonify({"message":"Student deleted successfully"})

@app.route("/students",methods=["DELETE"])
def delete_all():
    con=db()
    con.execute("DELETE FROM students")
    con.commit()
    con.close()
    return jsonify({"message":"All students deleted successfully"})

create_db()
