const rollNo=document.querySelector("#rollNo");
const nameInput=document.querySelector("#name");
const noteInput=document.querySelector("#note");
const addButton=document.querySelector("#addButton");
const result=document.querySelector("#result");
const studentList=document.querySelector("#studentList");
const studentCount=document.querySelector("#studentCount");
const searchInput=document.querySelector("#searchInput");

const clearAllButton=document.querySelector("#clearAllButton");
const clearAllModal=document.querySelector("#clearAllModal");
const confirmClearAll=document.querySelector("#confirmClearAll");
const cancelClearAll=document.querySelector("#cancelClearAll");

const deleteModal=document.querySelector("#deleteModal");
const confirmDelete=document.querySelector("#confirmDelete");
const cancelDelete=document.querySelector("#cancelDelete");

const updateModal=document.querySelector("#updateModal");
const inputModal=document.querySelector("#inputModal");
const updateRollButton=document.querySelector("#updateRollButton");
const updateNameButton=document.querySelector("#updateNameButton");
const updateNoteButton=document.querySelector("#updateNoteButton");
const clearNoteButton=document.querySelector("#clearNoteButton");
const closeUpdateModal=document.querySelector("#closeUpdateModal");
const closeInputModal=document.querySelector("#closeInputModal");
const inputModalTitle=document.querySelector("#inputModalTitle");
const updateInput=document.querySelector("#updateInput");
const updateNoteInput=document.querySelector("#updateNoteInput");
const confirmUpdate=document.querySelector("#confirmUpdate");

let students=[];
let selectedStudent=null;
let updateType=null;
let studentToDelete=null;

function showMessage(message){
result.textContent=message;
setTimeout(()=>result.textContent="",3000);
}

// Add-note box expands when focused.
noteInput.addEventListener("focus",()=>{
noteInput.classList.add("note-expanded");
});

noteInput.addEventListener("blur",()=>{
setTimeout(()=>{
if(document.activeElement!==noteInput)
noteInput.classList.remove("note-expanded");
},100);
});

// Keep students ordered by roll number.
function sortStudents(list){
return [...list].sort((a,b)=>{
const x=(a[1]||"").trim();
const y=(b[1]||"").trim();

if(!x&&!y)return 0;
if(!x)return 1;
if(!y)return -1;

const aNum=Number(x);
const bNum=Number(y);

if(!isNaN(aNum)&&!isNaN(bNum))
return aNum-bNum;

return x.localeCompare(y,undefined,{
numeric:true,
sensitivity:"base"
});
});
}

async function loadStudents(){
const response=await fetch("/students");
students=await response.json();
studentCount.textContent="Total Students: "+students.length;
displayStudents(students);
}

function displayStudents(list){
studentList.textContent="";

sortStudents(list).forEach(student=>{
const [id,roll,name,note]=student;

const item=document.createElement("li");
const info=document.createElement("div");

if(roll&&name)
info.textContent=`Roll No: ${roll} - ${name}`;
else if(roll)
info.textContent=`Roll No: ${roll}`;
else
info.textContent=name;

item.appendChild(info);

if(note){
const noteBox=document.createElement("div");

noteBox.textContent=note;
noteBox.className="student-note";

noteBox.onclick=()=>{
noteBox.classList.toggle("note-expanded");
};

item.appendChild(noteBox);
}

const updateButton=document.createElement("button");
updateButton.textContent="Update";

updateButton.onclick=()=>{
selectedStudent=student;
updateModal.style.display="flex";
};

const deleteButton=document.createElement("button");
deleteButton.textContent="Delete";

deleteButton.onclick=()=>{
studentToDelete=student;
deleteModal.style.display="flex";
};

item.appendChild(updateButton);
item.appendChild(deleteButton);
studentList.appendChild(item);
});
}

addButton.onclick=async()=>{
const roll=rollNo.value.trim();
const name=nameInput.value.trim();
const note=noteInput.value.trim();

if(!roll&&!name)return;

const response=await fetch("/student",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
roll_no:roll,
name:name,
note:note
})
});

const data=await response.json();
showMessage(data.message);

rollNo.value="";
nameInput.value="";
noteInput.value="";
noteInput.classList.remove("note-expanded");

loadStudents();
};

[nameInput,rollNo].forEach(input=>{
input.addEventListener("keydown",event=>{
if(event.key==="Enter"){
event.preventDefault();
addButton.click();
}
});
});

searchInput.oninput=()=>{
const text=searchInput.value.toLowerCase().trim();

const filtered=students.filter(student=>{
const roll=(student[1]||"").toLowerCase();
const name=(student[2]||"").toLowerCase();
const note=(student[3]||"").toLowerCase();

return roll.includes(text)||
name.includes(text)||
note.includes(text);
});

displayStudents(filtered);
};

function openUpdate(type,title,value=""){
updateType=type;
updateModal.style.display="none";
inputModalTitle.textContent=title;

if(type==="note"){
updateInput.style.display="none";
updateNoteInput.style.display="block";
updateNoteInput.value=value;
updateNoteInput.focus();
}else{
updateNoteInput.style.display="none";
updateInput.style.display="block";
updateInput.value=value;
updateInput.focus();
}

inputModal.style.display="flex";
}

updateRollButton.onclick=()=>{
openUpdate("roll","Update Roll No");
};

updateNameButton.onclick=()=>{
openUpdate("name","Update Name");
};

updateNoteButton.onclick=()=>{
openUpdate("note","Update Note",selectedStudent[3]||"");
};

clearNoteButton.onclick=async()=>{
if(!selectedStudent)return;

const [id,roll,name]=selectedStudent;

await fetch(`/student/${id}`,{
method:"PUT",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
roll_no:roll||"",
name:name||"",
note:""
})
});

updateModal.style.display="none";
showMessage("Note cleared successfully");
loadStudents();
};

confirmUpdate.onclick=async()=>{
let value;

if(updateType==="note")
value=updateNoteInput.value.trim();
else
value=updateInput.value.trim();

if(!value)return;

const [id,roll,name,note]=selectedStudent;

const updated={
roll_no:roll||"",
name:name||"",
note:note||""
};

if(updateType==="roll")
updated.roll_no=value;
else if(updateType==="name")
updated.name=value;
else
updated.note=value;

const response=await fetch(`/student/${id}`,{
method:"PUT",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(updated)
});

const data=await response.json();

inputModal.style.display="none";
showMessage(data.message);
loadStudents();
};

closeUpdateModal.onclick=()=>{
updateModal.style.display="none";
};

closeInputModal.onclick=()=>{
inputModal.style.display="none";
};

confirmDelete.onclick=async()=>{
if(!studentToDelete)return;

const [id]=studentToDelete;

const response=await fetch(`/student/${id}`,{
method:"DELETE"
});

const data=await response.json();

deleteModal.style.display="none";
studentToDelete=null;

showMessage(data.message);
loadStudents();
};

cancelDelete.onclick=()=>{
deleteModal.style.display="none";
studentToDelete=null;
};

clearAllButton.onclick=()=>{
if(students.length===0){
showMessage("There are no students to delete.");
return;
}

clearAllModal.style.display="flex";
};

cancelClearAll.onclick=()=>{
clearAllModal.style.display="none";
};

confirmClearAll.onclick=async()=>{
const response=await fetch("/students",{
method:"DELETE"
});

const data=await response.json();

clearAllModal.style.display="none";
searchInput.value="";

showMessage(data.message);
loadStudents();
};

loadStudents();