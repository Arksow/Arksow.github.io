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


// Quiz
// Storing All Data
const data = [
  { category: "Wildlife", answer: "DSLR", image: "Images/Wildlife.jpg" },
  { category: "Vlogging", answer: "Mirrorless", image: "Images/Vlogging.jpg" },
  { category: "Underwater", answer: "Action Camera", image: "Images/Underwater.jpg" },
  { category: "Family Portraits", answer: "DSLR", image: "Images/Portrait.jpeg" },
  { category: "Travel", answer: "Compact Camera", image: "Images/Travel.jpg" },
  { category: "Sports", answer: "DSLR", image: "Images/Sport.jpg" }
];

// Game state
let currentIndex = 0;
let score = 0;

// DOM elements
const categoryEl = document.getElementById("category");
const feedbackEl = document.getElementById("nextbtn");
const buttons = document.querySelectorAll(".option");
const nextBtn = document.getElementById("next");
const tryAgainBtn = document.getElementById("tryAgain");
const questionImg = document.getElementById("questionImage");

// Load a new question
function loadQuestion() 
{
  feedbackEl.textContent = "";
  const current = data[currentIndex];
  categoryEl.textContent = current.category;

  questionImg.src = current.image;
    questionImg.style.display = "block";

  buttons.forEach(button => {
    button.disabled = false;
    button.classList.remove("correct", "wrong");
  });
}

// End the game
function endGame() 
{
  categoryEl.textContent = "Game Over!";
  document.querySelector(".options").style.display = "none";
  nextBtn.style.display = "none";
  tryAgainBtn.style.display = "inline-block";
  feedbackEl.innerHTML = `Thanks for playing!<br>Your score: ${score} / ${data.length}`;
}

// Reset the game
function resetGame() 
{
  currentIndex = 0;
  score = 0;
  document.querySelector(".options").style.display = "block";
  nextBtn.style.display = "inline-block";
  tryAgainBtn.style.display = "none";
  loadQuestion();
}

// Answer button logic
buttons.forEach(button => {
  button.addEventListener("click", () => {
    const selected = button.textContent;
    const correct = data[currentIndex].answer;

    buttons.forEach(btn => btn.disabled = true);

    if (selected === correct) {
      feedbackEl.textContent = "Correct!";
      feedbackEl.style.color = "green";
      score++;
    }
    else {
      feedbackEl.textContent = `Wrong! The correct answer is ${correct}`;
      feedbackEl.style.color = "red";
    }
  });
});

// Next question
nextBtn.addEventListener("click", () => {
  currentIndex++;
  if (currentIndex >= data.length) {
    endGame();
  } else {
    loadQuestion();
  }
});

// Try again button
tryAgainBtn.addEventListener("click", resetGame);

// Start
tryAgainBtn.style.display = "none";
window.onload = () => {
  tryAgainBtn.style.display = "none";
  loadQuestion();
};

const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");

hamburger.addEventListener("click", () => {
  navMenu.classList.toggle("active");
  if (hamburger.innerHTML === "&#9776;") {
    hamburger.innerHTML = "&#10005;";
  } else {
    hamburger.innerHTML = "&#9776;";
  }
});

// Close menu when a nav item is clicked (mobile)
document.querySelectorAll(".nav-listitems").forEach(item => {
  item.addEventListener("click", () => {
    navMenu.classList.remove("active");
    hamburger.innerHTML = "&#9776;";
  });
});