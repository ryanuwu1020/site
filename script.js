'use strict';
const messages = ['Always learning.', 'Question everything.', 'Understand before you build.', 'Hello, curious human.'];
let messageIndex = 0;
const terminalText = document.querySelector('#terminal-text');
document.querySelector('#terminal-button').addEventListener('click', () => {
  messageIndex = (messageIndex + 1) % messages.length;
  terminalText.textContent = messages[messageIndex];
});
document.querySelector('#year').textContent = new Date().getFullYear();
