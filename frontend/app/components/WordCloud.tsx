"use client"

import React, { useEffect } from "react";
import * as d3 from "d3";
import cloud from "d3-cloud";

const WordCloud = () => {
    // Данные для облака слов
    const words = [
        { text: "СВО", size: 200 },
        { text: "Политика", size: 30 },
        { text: "Экономика", size: 25 },
    ];

    useEffect(() => {
        const layout = cloud()
            .size([800, 400])
            .words(words)
            .padding(5)
            .rotate(() => Math.random() * 2 * 360)
            .fontSize(d => d.size)
            .on("end", draw);

        layout.start();

        // Функция для рисования облака
        function draw(words) {
            d3.select("#word-cloud")
                .attr("width", 800)
                .attr("height", 400)
                .attr("viewBox", "0 0 800 400")
                .attr("preserveAspectRatio", "xMidYMid meet")
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", d => d.size + "px")
                .style("fill", (d, i) => d3.schemeCategory10[i % 10])  // Цвета
                .attr("text-anchor", "middle")
                .attr("class", "word")
                .attr("transform", d => `translate(${d.x + 400},${d.y + 200}) rotate(${d.rotate})`)
                .text(d => d.text);
        }
    }, []); // Пустой массив зависимостей, чтобы запустить только один раз

    return (
        <svg id="word-cloud" width="800" height="400"></svg>
    );
};

export default WordCloud;
