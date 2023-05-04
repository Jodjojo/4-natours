/* eslint-disable */
import 'regenerator-runtime/runtime';
import 'core-js';
import '@babel/polyfill';
import { displayMap } from './leaflet';
import { login } from './login';
import { signup } from './signup';

// DOM ELEMENTS
const mapBox = document.getElementById(`map`);
const loginForm = document.querySelector(`.form`);
const signupForm = document.querySelector('.form--signup');

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

// LOGGING IN USER
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById(`email`).value;
    const password = document.getElementById(`password`).value;
    login(email, password);
  });
}

// SIGNING UP USER
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;
    signup(name, email, password, confirmPassword);
  });
}
