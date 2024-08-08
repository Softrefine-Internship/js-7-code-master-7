// compoment selection
const screen1 = document.querySelector('.screen1');
const screen2 = document.querySelector('.screen23');
const screen2Body = document.querySelector('.screen23__body');

const startBtn = document.querySelector('.btn__start');
const newTestBtn = document.querySelector('.btn__NewTest');

const inpNum = document.querySelector('.input--number');
const inpCat = document.querySelector('.input--category');
const inpDiff = document.querySelector('.input--dificulty');
const inpType = document.querySelector('.input--type');

const loading = document.querySelector('.loading');

const displayScore = document.querySelector('.score');

const quitBtn = document.querySelector('.quit_btn');

let correctAnswers = 0;
let numberOfQuestions = 0;

inpNum.addEventListener('keypress', (e) => {
  if (e.key == 'e') e.preventDefault();
  if (e.key == 'Enter') hitAPI();
});

// start test
startBtn.addEventListener('click', (e) => hitAPI());

function hitAPI() {
  if (inpNum.value.length == 0) {
    inpNum.style.border = '1px solid red';
    showNotification('Enter Number of questions', 3);
  } else {
    inpNum.style.border = '1px solid green';
    numberOfQuestions = inpNum.value;
    loading.classList.remove('hide');
    startBtn.disabled = true;
    startBtn.classList.add('disabled');
    try {
      callAPI(inpNum.value, inpCat.value, inpDiff.value, inpType.value);
    } catch (e) {
      console.log('Error in hit API', e);
    }
  }
}

// start New test
newTestBtn.addEventListener('click', () => {
  screen2.classList.add('hide');
  screen2.innerHTML = '';
  screen1.classList.remove('hide');
  location.reload();
});

// Function to call API

async function callAPI(num, cat, diff, typ) {
  let URL = `https://opentdb.com/api.php?amount=${num}`;

  if (cat != 'any') URL += `&category=${cat}`;
  if (diff != 'any') URL += `&difficulty=${diff}`;
  if (typ != 'any') URL += `&type=${typ}`;

  let res, data;
  try {
    res = await fetch(URL);
    data = await res.json();
    if (!res.ok) throw new Error('Failed to fetch data');

    switch (data.response_code) {
      case 0:
        if (data.results.length != inpNum.value)
          throw new Error(`Didn't recive that many questions `);
        screen1.classList.add('hide');
        screen2.classList.remove('hide');
        displayScore.innerHTML = `<span>Score: </span> ${correctAnswers}/${numberOfQuestions}`;

        LoadQuestions(data.results);

        break;
      case 1:
        throw new Error(`Don't have enough questions`);

      case 2:
        throw new Error(`Invalid Parameter`);

      case 3:
        throw new Error(`Token Not Found`);

      case 4:
        throw new Error(`Token Empty`);

      case 5:
        throw new Error(
          `Rate Limit: Wait for 5 seconds before requesting again`
        );
    }
    loading.classList.add('hide');
  } catch (e) {
    loading.classList.add('hide');
    startBtn.classList.remove('disabled');
    startBtn.disabled = false;
    showNotification(e.message, 5);
  }
}

// Generate array with all the options
function optionArrayGenerator(correct, incorect, qNum) {
  let options = [];

  if (incorect.length < 2) {
    options.push(
      `<div>
        <input
        type="radio"
        value="correct"
        class="option que${qNum}"
        name="q${qNum}"
        id="t${qNum}"
        />
        <label for="t${qNum}">${correct}</label>
      </div>`
    );

    options.push(
      `<div>
        <input
        type="radio"
        value="not_correct"
        class="option que${qNum}"
        name="q${qNum}"
        id="f${qNum}"
        />
        <label for="f${qNum}">${incorect}</label>
      </div>`
    );
  } else {
    options.push(
      ` <div>
              <input
                type="radio"
                value="correct"
                class="option que${qNum}"
                name="q${qNum}"
                id="${qNum}a001"
              />
              <label for="${qNum}a001">${correct}</label>
            </div>`
    );

    incorect.forEach((e, i) => {
      options.push(
        ` <div>
              <input
                type="radio"
                value="not_correct"
                class="option que${qNum}"
                name="q${qNum}"
                id="${qNum}a${i}"
              />
              <label for="${qNum}a${i}">${e}</label>
            </div>`
      );
    });
  }
  return options;
}

// generate random number function
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1 + min);

// adding option to single string
function addOptions(correct, incorect, qNumber) {
  let options = '';
  let optionArray = optionArrayGenerator(correct, incorect, qNumber);
  let addedString = [];
  while (addedString.length != 4) {
    let index;
    while (addedString.includes(index) || index == undefined)
      index = randomInt(-1, 3);
    addedString.push(index);
    if (optionArray[index] != undefined) options += optionArray[index];
  }
  return options;
}

// Insert question in screen
function LoadQuestions(data) {
  data.forEach((que, i) => {
    screen2Body.insertAdjacentHTML(
      'beforeend',
      ` <div class="card hide">
          <div class="question__card">
            <span>Q${++i}/${numberOfQuestions}:</span> ${que.question}
          </div>
          <div class="option__card qq${i}">
          ${addOptions(que.correct_answer, que.incorrect_answers, i)}
          </div >
                  <div class="action-button">
          <div class ="btn btn--previousQuestion">Previous</div>
          <div class ="btn btn--nextQuestion">Next Question</div>
        </div>
        </div>
    `
    );
  });

  startQuiz(0); // starting quiz show 1st question
}

// Load next question auto
let NextTimer;
let allowedAnswers = true;
const nextQuestionTimer = (i, questions) => {
  NextTimer = setTimeout(() => {
    questions.forEach((_, i) => questions[i].classList.add('hide'));
    startQuiz(++i);
  }, 3000);
};
// displaying specifick questions
function startQuiz(i) {
  const questions = document.querySelectorAll('.card');

  questions[i].classList.remove('hide');
  if (i == questions.length - 1) {
    questions[i].getElementsByClassName('action-button')[0].innerHTML = '';

    questions[i].getElementsByClassName(
      'action-button'
    )[0].innerHTML = `<div class ="btn btn--previousQuestion">Previous</div>
      </div>
                  <div>
          <div class ="btn btn--submitTest">Submit</div>`;
  }

  if (i == 0)
    questions[i]
      .getElementsByClassName('btn--previousQuestion')[0]
      .classList.add('hide');

  questions[i].addEventListener('click', (e) => {
    if (e.target.classList.contains('option') && i != questions.length - 1)
      nextQuestionTimer(i, questions);

    let showAction = true;
    let q = e.target.classList[1];
    const otherOptions = document.querySelectorAll(`.${q}`);
    otherOptions.forEach((e) => {
      if (
        e.parentNode.classList.contains('correct') ||
        e.parentNode.classList.contains('not_correct')
      )
        showAction = false;
    });

    if (showAction && allowedAnswers) {
      if (
        e.target.classList.contains('option') &&
        !e.target.parentNode.classList.contains('correct') &&
        !e.target.parentNode.classList.contains('not_correct')
      ) {
        if (e.target.value == 'correct') {
          e.target.parentNode.classList.add('correct');
          correctAnswers++;
          displayScore.innerHTML = `<span>Score: </span> ${correctAnswers}/${numberOfQuestions}`;
        } else {
          otherOptions.forEach((e) => {
            if (e.value == 'correct')
              if (e) e.parentNode.classList.add('correct');
          });
          e.target.parentNode.classList.add('not_correct');
        }
      }
    }
    // option select

    // next question
    if (e.target.classList.contains('btn--nextQuestion')) {
      clearTimeout(NextTimer);
      questions.forEach((_, i) => questions[i].classList.add('hide'));
      startQuiz(++i);

      // show result
    } else if (e.target.classList.contains('btn--submitTest')) {
      clearTimeout(NextTimer);
      allowedAnswers = false;
      showResult();
      quitBtn.classList.add('hide');
    } else if (e.target.classList.contains('btn--previousQuestion')) {
      clearTimeout(NextTimer);
      questions.forEach((_, i) => questions[i].classList.add('hide'));
      startQuiz(--i);
    }
  });
}

// last screen with result
function showResult() {
  clearTimeout(NextTimer);

  const radioButtons = document.querySelectorAll('.option');

  radioButtons.forEach((radioButton, i) => {
    if (radioButton.value == 'correct')
      radioButton.parentNode.classList.add(radioButton.value);
  });

  const questions = document.querySelectorAll('.card');

  questions.forEach((e) => {
    e.getElementsByClassName('action-button')[0].innerHTML = '';
    e.classList.remove('hide');
  });

  displayScore.innerHTML = `<span>Score: </span> ${correctAnswers}/${numberOfQuestions}`;

  const nextTest = document.querySelector('.btn__NewTest');
  nextTest.classList.remove('hide');
}

// Quit
quitBtn.addEventListener('click', () => {
  allowedAnswers = false;
  showResult();
  quitBtn.classList.add('hide');
});

// Notification
let timerInterval;
let startTime;
let remainingTime;
let duration;
let isPaused = false;

function showNotification(message, displayDuration) {
  var notification = document.getElementById('notification');
  var notificationMessage = document.getElementById('notificationMessage');
  var progressBar = document.getElementById('progressBar');

  notificationMessage.textContent = message;
  notification.classList.add('show');

  remainingTime = displayDuration * 1000; // Convert to milliseconds
  duration = displayDuration * 1000; // Convert to milliseconds
  progressBar.style.width = '100%';

  startTime = null;
  isPaused = false;

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    if (isPaused)
      startTime += timestamp - (startTime + (duration - remainingTime));

    let elapsed = timestamp - startTime;

    remainingTime = duration - elapsed;

    let progress = (remainingTime / duration) * 100;
    progressBar.style.width = progress + '%';

    if (remainingTime > 0) timerInterval = requestAnimationFrame(animate);
    else {
      notification.classList.remove('show');
      cancelAnimationFrame(timerInterval);
    }
  }

  timerInterval = requestAnimationFrame(animate);
}

function pauseTimer() {
  isPaused = true;
  cancelAnimationFrame(timerInterval);
}

function resumeTimer() {
  isPaused = false;
  timerInterval = requestAnimationFrame((timestamp) => {
    startTime = timestamp - (duration - remainingTime);
    animate(timestamp);
  });
}

function animate(timestamp) {
  if (!startTime) startTime = timestamp;
  if (isPaused)
    startTime += timestamp - (startTime + (duration - remainingTime));

  let elapsed = timestamp - startTime;
  remainingTime = duration - elapsed;

  let progress = (remainingTime / duration) * 100;
  document.getElementById('progressBar').style.width = progress + '%';

  if (remainingTime > 0) timerInterval = requestAnimationFrame(animate);
  else document.getElementById('notification').classList.remove('show');
  cancelAnimationFrame(timerInterval);
}
