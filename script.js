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

let correctAnswers = 0;
let numberOfQuestions = 0;

inpNum.addEventListener('keypress', (e) => {
  if (e.key == 'e') e.preventDefault();
});

// start test
startBtn.addEventListener('click', (e) => {
  if (inpNum.value.length == 0) inpNum.style.border = '1px solid red';
  else {
    inpNum.style.border = '1px solid green';
    try {
      numberOfQuestions = inpNum.value;
      // console.log('calling');
      loading.classList.remove('hide');
      startBtn.disabled = true;
      startBtn.classList.add('disabled');
      callAPI(inpNum.value, inpCat.value, inpDiff.value, inpType.value);
    } catch (e) {
      loading.classList.add('hide');
      startBtn.classList.remove('disabled');
      startBtn.disabled = false;
      alert(e.message);
    }
  }
});

// start New test
newTestBtn.addEventListener('click', () => {
  screen2.classList.add('hide');
  screen2.innerHTML = '';
  screen1.classList.remove('hide');
  location.reload();
});

// Function to call API

async function callAPI(num, cat, diff, typ) {
  // console.log('hitting');
  let URL = `https://opentdb.com/api.php?amount=${num}`;

  if (cat != 'any') URL += `&category=${cat}`;
  if (diff != 'any') URL += `&difficulty=${diff}`;
  if (typ != 'any') URL += `&type=${typ}`;

  // console.log(num, cat, diff, typ, URL);

  const res = await fetch(URL);
  const data = await res.json();
  // console.log(data);

  // console.log(URL);

  switch (data.response_code) {
    case 0:
      screen1.classList.add('hide');
      screen2.classList.remove('hide');
      loading.classList.add('hide');
      LoadQuestions(data.results);
      break;
    case 1:
      alert(`Don't have enough questions`);
      break;

    case 2:
      alert(`Invalid Parameter`);
      break;

    case 3:
      alert(`Token Not Found`);
      break;

    case 4:
      alert(`Token Empty`);
      break;

    case 5:
      alert(`Rate Limit: Wait for 5 seconds before requesting again`);
      break;
  }
  loading.classList.add('hide');
  startBtn.classList.remove('disabled');
  startBtn.disabled = false;
}

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

  // console.log(options);

  return options;
}

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1 + min);

function addOptions(correct, incorect, qNumber) {
  let options = '';

  // console.log(incorect);

  let optionArray = optionArrayGenerator(correct, incorect, qNumber);

  let addedString = [];

  while (addedString.length != 4) {
    // console.log(addedString);
    let index;
    while (addedString.includes(index) || index == undefined) {
      index = randomInt(-1, 3);
      // console.log('inArray', index);
    }
    // console.log(index);
    addedString.push(index);
    // console.log(optionArray[index], index);
    if (optionArray[index] != undefined) options += optionArray[index];
  }

  // console.log(options, optionArray);

  return options;
}

function LoadQuestions(data) {
  // console.log(data, data.length);

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
          <div class ="btn btn--nextQuestion">Next</div>
        </div>
        </div>
    `
    );
  });
  // console.log(data);
  startQuiz(0);
}

function startQuiz(i) {
  // console.log(i);
  const questions = document.querySelectorAll('.card');
  // console.log('list', questions);
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

  // console.log(questions);

  if (i == 0) {
    questions[i]
      .getElementsByClassName('btn--previousQuestion')[0]
      .classList.add('hide');
  }
  questions[i].addEventListener('click', (e) => {
    // console.log(e.target);
    if (e.target.classList.contains('btn--nextQuestion')) {
      // console.log(i);
      const t = i + 1;
      const qqq = document.querySelectorAll(`.que${t}`);
      // console.log(qqq);
      let input = false;
      qqq.forEach((radioButton, i) => {
        radioButton.checked ? (input = true) : '_';
      });

      // console.log('checked');
      if (input) {
        questions[i].classList.remove('error-shadow');
        questions.forEach((_, i) => questions[i].classList.add('hide'));
        startQuiz(++i);
      } else {
        questions[i].classList.add('error-shadow');
        // alert('Select one option');
      }
    } else if (e.target.classList.contains('btn--submitTest')) {
      // console.log(i, e);
      let t = i + 1;
      const qqq = document.querySelectorAll(`.que${t}`);
      // console.log(qqq);
      let input = false;
      qqq.forEach((radioButton, i) => {
        radioButton.checked ? (input = true) : '_';
      });

      // console.log('checked');
      if (input) {
        questions[i].classList.remove('error-shadow');
        showResult();
      } else {
        questions[i].classList.add('error-shadow');
        // alert('Select one option');
      }
    } else if (e.target.classList.contains('btn--previousQuestion')) {
      questions.forEach((_, i) => questions[i].classList.add('hide'));
      startQuiz(--i);
    }
  });
}

function showResult() {
  const radioButtons = document.querySelectorAll('.option');
  const questions = document.querySelectorAll('.card');
  // console.log(questions);
  radioButtons.forEach((radioButton, i) => {
    console.table(radioButton.checked, radioButton.value);
    if (radioButton.checked) {
      if (radioButton.value == 'correct') correctAnswers++;

      radioButton.parentNode.classList.add(radioButton.value);
      // console.log('que = ', questions[i], i);
    } else {
      if (radioButton.value == 'correct')
        radioButton.parentNode.classList.add(radioButton.value);
    }
  });

  // console.log(correctAnswers);

  questions.forEach((e) => {
    e.getElementsByClassName('action-button')[0].innerHTML = '';
    e.classList.remove('hide');
  });

  const displayScore = document.querySelector('.score');
  displayScore.innerHTML = `<span>Score: </span> ${correctAnswers}/${numberOfQuestions}`;
  displayScore.classList.remove('hide');

  const nextTest = document.querySelector('.btn__NewTest');
  nextTest.classList.remove('hide');
}
