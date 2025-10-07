#!/usr/bin/env node
// Import the readline module
const prompt = require('prompt-sync')({sigint: true});
const fs = require('fs');

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function processGuess(guess, target) {
    if (guess < target) {
        return -1;
    } else if (guess > target) {
        return 1;
    } else {
        return 0;
    }
}

function saveScore(timeTaken, attempts) {
    let data = fs.readFileSync('score.json', (err, data) => {
        if (err) {
            console.error("Error reading score file:", err);
            return;
        }
    });
    data = JSON.parse(data);
    if (data) {
        if (timeTaken < data.timeTaken || (timeTaken === data.timeTaken && attempts < data.attempts)) {
            console.log("New best score! Saving your score...");
        } else {
            console.log("You did not beat your best score. Not saving.");
            return;
        }
    }
    const dataToWrite = { timeTaken, attempts };
    fs.writeFileSync('score.json', JSON.stringify(dataToWrite, null, 2));
}

function loadScore() {
    if (fs.existsSync('score.json')) {
        const data = fs.readFileSync('score.json');
        return JSON.parse(data);
    }
    return null;
}

function getHint(target, guess) {
    const diff = Math.abs(target - guess);
    if (diff > 50) return "The distance between the target and your guess is more than 50!";
    if (diff > 20) return "The distance between the target and your guess is more than 20!";
    if (diff > 10) return "The distance between the target and your guess is more than 10!";
    return "The distance between the target and your guess is 10 or less!";
}

function playGame() {
    console.log("\nPlease select the difficulty level:");
    console.log("1. Easy (10 chances)");
    console.log("2. Medium (5 chances)");
    console.log("3. Hard (3 chances)");
    
    const bestScore = loadScore();
    if (bestScore) {
        console.log(`\nYour best score so far: ${bestScore.timeTaken} seconds with ${bestScore.attempts} attempts.`);
    }

    let userInput = prompt("Enter your choice (1, 2, or 3): ");
    while (!['1', '2', '3'].includes(userInput)) {
        console.log("Invalid input. Please enter 1, 2, or 3.");
        userInput = prompt("Enter your choice (1, 2, or 3): ");
    }

    const difficultyLevels = {
        1: 'Easy',
        2: 'Medium',
        3: 'Hard'
    };

    const chancesMapping = {
        1: 10,
        2: 5,
        3: 3
    };

    const difficulty = difficultyLevels[userInput];
    console.log(`\nGreat! You have selected ${difficulty} difficulty level.`);
    
    let chances = chancesMapping[userInput];
    console.log(`You have ${chances} chances to guess the number.\nGood luck!\n`);

    const targetNumber = getRandomNumber(1, 100);
    // Uncomment the line below for debugging purposes
    // console.log(`(Debug) The target number is: ${targetNumber}`);

    // Record the start time before the game begins
    const startTime = Date.now();
    
    let lastGuess = null;
    let hintUsed = false;
    while (true) {
        if (lastGuess !== null && !hintUsed) {
            let useHint = prompt("Do you want a hint? (yes/no): ").toLowerCase();
            while (!['yes', 'y', 'no', 'n'].includes(useHint)) {
                console.log("Invalid input. Please enter 'yes' or 'no'.");
                useHint = prompt("Do you want a hint? (yes/no): ").toLowerCase();
            }
            if (useHint === 'yes' || useHint === 'y') {
                console.log(getHint(targetNumber, lastGuess));
                hintUsed = true; // Only allow one hint per game
            }
        }

        let guess = prompt("Enter your guess: ")
        while (isNaN(guess) || guess < 1 || guess > 100) {
            console.log("Invalid input. Please enter a number between 1 and 100.");
            guess = prompt("Enter your guess: ");
        }

        const result = processGuess(Number(guess), targetNumber);
        if (result === 0) {
            // User guessed correctly → record the end time
            const endTime = Date.now();
            const timeTaken = ((endTime - startTime) / 1000).toFixed(2); // convert ms to seconds

            saveScore(timeTaken, chancesMapping[userInput] - chances + 1);
            console.log("Congratulations! You've guessed the correct number!");
            console.log(`You took ${timeTaken} seconds to guess the number.`);
            break;
        } else if (result === -1) {
            console.log("Too low! Try again.");
        } else {
            console.log("Too high! Try again.");
        }

        lastGuess = Number(guess);
        chances--;
        if (chances <= 0) {
            console.log("Sorry, you've run out of chances. Game over!");
            break;
        }
    }
}

function main() {
    console.log("Welcome to the Number Guessing Game!");
    console.log("I'm thinking of a number between 1 and 100.");
    console.log("You have a finite amount of chances to guess the correct number.");
    console.log("It is based on the difficulty you choose.");

    playGame();
    
    let playAgain = prompt("Do you want to play again? (yes/no): ").toLowerCase();
    while (!['yes', 'y', 'no', 'n'].includes(playAgain)) {
        console.log("Invalid input. Please enter 'yes' or 'no'.");
        playAgain = prompt("Do you want to play again? (yes/no): ").toLowerCase();
    }

    while (playAgain === 'yes' || playAgain === 'y') {
        playGame();
        playAgain = prompt("Do you want to play again? (yes/no): ").toLowerCase();
    }

    console.log("Thank you for playing! Goodbye!");
}

main();