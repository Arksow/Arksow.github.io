//target all elements to save to constants
const mainbtn = document.querySelector("#mainbtn");
const page1btn = document.querySelector("#page1btn");
const page2btn = document.querySelector("#page2btn");
const page3btn = document.querySelector("#page3btn");
const allpages = document.querySelectorAll(".page");

//select all subtopic pages
function hideall(){ //function to hide all pages
for(let onepage of allpages){ //go through all subtopic pages
onepage.style.display="none"; //hide it
}
}
function show(pgno){ //function to show selected page no
hideall();
//select the page based on the parameter passed in
let onepage=document.querySelector("#page"+pgno);
onepage.style.display="block"; //show the page
}
/*Listen for clicks on the buttons, assign anonymous
eventhandler functions to call show function*/
mainbtn.addEventListener("click", function () {
  show(0);
});
page1btn.addEventListener("click", function () {
  show(1);
});
page2btn.addEventListener("click", function () {
  show(2);
});
page3btn.addEventListener("click", function () {
  show(3);
});

hideall();
show(0);