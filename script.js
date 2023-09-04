"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2020-05-27T17:01:17.194Z",
    "2020-07-11T23:36:17.929Z",
    "2020-07-12T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

let sorted = false;

function displayMovement(movements, sort = false) {
  // Empty the entire container
  // Clear the original data
  containerMovements.innerHTML = "";

  // Sort the list of account movements
  const activities = sort ? movements.slice().sort((a, b) => a - b) : movements;

  // Display each activity for the account
  activities.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__value">${mov.toFixed(2)}€</div>
    </div>`;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
}

// Create a short username for each account
const createUsernames = accounts => {
  accounts.forEach(account => {
    account.username = account.owner
      .toLowerCase()
      .split(" ")
      .map(word => word[0])
      .join("");
  });
};

// Display the current balance for the account
const calcDisplayBalance = account => {
  const balance = account.movements.reduce((acc, mov) => acc + mov, 0);
  account.balance = balance;

  labelBalance.textContent = `${balance.toFixed(2)}€`;
};

// Display the total income, payments and interest for the account
const calcDisplaySummary = account => {
  // Account income balance
  const incomes = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumIn.textContent = `${incomes.toFixed(2)}€`;

  // Account payment balance
  const payments = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumOut.textContent = `${payments.toFixed(2)}€`;

  // Account interest balance
  const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

const setDate = () => {
  const today = new Date().toLocaleDateString();

  labelDate.textContent = `${today}`
};

let currentAcc = null;
createUsernames(accounts);
setDate();

// Update the UI components
function updateUI(account) {
  displayMovement(account.movements);
  calcDisplayBalance(account);
  calcDisplaySummary(account);
}

// Login button handler
btnLogin.addEventListener("click", e => {
  e.preventDefault();

  // Get the current user
  currentAcc = accounts.find(acc => acc.username === inputLoginUsername.value);

  // Check if the user provided the correct pin
  if (currentAcc?.pin === Number(inputLoginPin.value)) {
    // Change the welcome message
    labelWelcome.textContent = `Welcome Back, ${
      currentAcc.owner.split(" ")[0]
    }!`;

    // Display the data on the screen
    containerApp.style.opacity = 100;

    // Clear the login input fields
    inputLoginUsername.value = "";
    inputLoginPin.value = "";

    // Unfocus the pin input
    inputLoginPin.blur();

    // Fetch the correct account data
    updateUI(currentAcc);
  }
});

// Transfer button handler
btnTransfer.addEventListener("click", e => {
  e.preventDefault();

  // Fetch the data the inputted data
  const amount = Number(inputTransferAmount.value);
  const receiver = accounts.find(acc => acc.username === inputTransferTo.value);

  // Check if the inputted parameters are valid
  if (
    amount > 0 &&
    receiver &&
    currentAcc.balance >= amount &&
    receiver?.username !== currentAcc.username
  ) {
    console.log("Valid Transfer");

    // Add the movements to the movement array
    currentAcc.movements.push(-amount);
    receiver.movements.push(amount);

    // Update the UI
    updateUI(currentAcc);

    // Clear the inputs
    inputTransferAmount.value = inputTransferTo = "";
  } else {
    console.log("Invalid Transfer");
  }
});

// Delete Account button handler
btnClose.addEventListener("click", e => {
  e.preventDefault();

  // Check if the input parameters are valid
  if (
    inputCloseUsername.value === currentAcc.username &&
    Number(inputClosePin.value) === currentAcc.pin
  ) {
    // Find the index of the account in the accounts array
    const index = accounts.findIndex(
      acc => acc.username === currentAcc.username
    );

    // Remove the account from the accounts array
    accounts.splice(index, 1);

    // Hide the UI
    containerApp.style.opacity = 0;

    // Clear the input fields
    inputCloseUsername.value = inputClosePin.value = "";
  } else {
    console.log("Invalid Username or PIN");
  }
});

// Loan button handler
btnLoan.addEventListener("click", e => {
  e.preventDefault();

  // Fetch the requested loan amount
  const loanAmt = Number(inputLoanAmount.value);

  // Check if the loan amount is valid
  if (loanAmt > 0 && currentAcc.movements.some(mov => mov >= loanAmt * 0.1)) {
    // Add the deposited loan to the user's movements array
    currentAcc.movements.push(loanAmt);

    // Update the UI
    updateUI(currentAcc);

    // Clear the loan input field
    inputLoanAmount.value = "";
  } else {
    console.log("Invalid Loan Amount");
  }
});

// Sort button handler
btnSort.addEventListener("click", e => {
  e.preventDefault();

  // Set the sorting state to the opposite boolean value
  sorted = !sorted;
  displayMovement(currentAcc.movements, sorted);
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ["USD", "United States dollar"],
  ["EUR", "Euro"],
  ["GBP", "Pound sterling"],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
/////////////////////////////////////////////////

// Filter Method
// const deposits = movements.filter(movement => {
//   return movement > 0;
// });

// const withdrawals = movements.filter(movement => {
//   return movement < 0;
// });

// console.log(deposits);
// console.log(withdrawals);

// Reduce Method
// const balance = movements.reduce((acc, cur) => {
//   return acc + cur;
// }, 0);

// console.log(balance);

// const maxDeposit = movements.reduce((acc, cur) => {
//   return cur > acc ? cur : acc;
// }, movements[0]);

// console.log(maxDeposit);

// Find Method
// const firstWithdrawal = movements.find(mov => mov < 0);
// console.log(firstWithdrawal);

// const account = accounts.find(acc => acc.owner === "Jessica Davis");
// console.log(account);

// Flat Method
// const arr = [[1, 2, 3], 4, 5, [6, 7, 8]];
// console.log(arr.flat());
// Output: [1, 2, 3, 4, 5, 6, 7, 8]

// const arrDeep = [[[1, 2], 3], 4, 5, [[6, 7], 8]];
// console.log(arrDeep.flat());
// Output: [[1, 2], 3, 4, 5, [6, 7], 8]

// The argument can determine how deep you want to flatten the array
// console.log(arrDeep.flat(2));
// Output: [1, 2, 3, 4, 5, 6, 7, 8]

// const accMovements = accounts.map(account => account.movements);
// console.log(accMovements);
/*
Output:
---------------------------------------------------
[
  [200, 450, -400, 3000, -650, -130, 70, 1300], 
  [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  [200, -200, 340, -300, -20, 50, 400, -460],
  [430, 1000, 700, 50, 90],
]
*/

// const allMovements = accMovements.flat();
// console.log(allMovements);
// Output: [200, 450, -400, 3000, -650, -130, 70, 1300, 5000, 3400, -150, -790, -3210, -1000, 8500, -30, 200, -200, 340, -300, -20, 50, 400, -460, 430, 1000, 700, 50, 90]

// const overallBalance = allMovements.reduce((acc, mov) => acc + mov, 0);
// console.log(overallBalance);
// Output: 17840

// FlatMap Method
// The flatMap method will not allow you to go deeper than 1 level
// const overallBalance2 = accounts
// .flatMap(acc => acc.movements)
// .reduce((acc, mov) => acc + mov, 0);
// console.log(overallBalance2);
// Output: 17840

