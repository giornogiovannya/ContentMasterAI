"use client"
import React, { useEffect } from "react";

const words = [
	'Политика',
	'Экономика',
  'Спорт',
  'Здоровье',
	'Финансы',
  'Наука',
  'Технологии',
  'Образование',
  'Культура',
  'Путешествия',
];
const colors = ['red','blue','yellow','green'];

const WordsContainer = () => {
	useEffect(() => {
		for(let i = 0; i < 5800; i++) {
			createSpanElement(getRandomWord());
		}
	}, []);

	function getRandomWord() {
		return words[Math.floor(Math.random() * words.length)];
	}
	
	function createSpanElement(word) {
		const wordElement = document.createElement("div");
		wordElement.classList.add("word");
		wordElement.classList.add(getRandomColor());
		wordElement.appendChild(document.createTextNode(word));
		document.querySelector('#words-container').appendChild(wordElement);
	}

	function getRandomColor() {
		return colors[Math.floor(Math.random() * colors.length)];
	}

	return null;
};

export default WordsContainer;