// Полный список стратегий с описаниями и классификацией
const strategies = [
    { 
        name: "Tit for Tat", 
        description: "Начинает с сотрудничества. На каждом следующем ходу повторяет предыдущий ход оппонента: если тот сотрудничал — отвечает сотрудничеством, если предал — предаёт.", 
        isGood: true,
        function: function(history) {
            if (history.length === 0) return "C";
            return history[history.length - 1][1];
        }
    },
    { 
        name: "Davis", 
        description: "Начинает с сотрудничества. Если оппонент предал хотя бы в одном из двух последних ходов — отвечает предательством.", 
        isGood: true,
        function: function(history) {
            if (history.length === 0) return "C";
            if (history[history.length - 1][1] === "D") return "D";
            if (history.length >= 2 && history[history.length - 2][1] === "D") return "D";
            return "C";
        }
    },
    { 
        name: "Tideman & Chieruzzi", 
        description: "Начинает с сотрудничества. Если два последних хода оппонента были предательствами подряд — отвечает предательством.", 
        isGood: true,
        function: function(history) {
            if (history.length < 2) return "C";
            if (history[history.length - 1][1] === "D" && history[history.length - 2][1] === "D") return "D";
            return "C";
        }
    },
    { 
        name: "Feld", 
        description: "Начинает с сотрудничества. Переходит к предательству только если оппонент предал три хода подряд.", 
        isGood: false,
        function: function(history) {
            if (history.length < 3) return "C";
            if (history[history.length - 1][1] === "D" && 
                history[history.length - 2][1] === "D" && 
                history[history.length - 3][1] === "D") return "D";
            return "C";
        }
    },
    { 
        name: "Downing", 
        description: "Начинает с сотрудничества. Анализирует всю историю: если количество сотрудничеств у оппонента больше или равно количеству предательств — сотрудничает; иначе — предаёт.", 
        isGood: false,
        function: function(history) {
            if (history.length === 0) return "C";
            const cooperations = history.filter(move => move[1] === "C").length;
            const defections = history.filter(move => move[1] === "D").length;
            return cooperations >= defections ? "C" : "D";
        }
    },
    { 
        name: "Graaskamp", 
        description: "Первые три хода — всегда сотрудничество. После этого анализирует последние три хода оппонента: если среди них два или более предательства, отвечает предательством.", 
        isGood: false,
        function: function(history) {
            if (history.length < 3) return "C";
            const last3 = history.slice(-3).map(move => move[1]);
            if (last3.filter(move => move === "D").length >= 2) return "D";
            return "C";
        }
    },
    { 
        name: "Friedman", 
        description: "Начинает с сотрудничества. Как только оппонент один раз предал — стратегия переходит к постоянному предательству.", 
        isGood: false,
        function: function(history) {
            if (history.length === 0) return "C";
            for (let move of history) {
                if (move[1] === "D") return "D";
            }
            return "C";
        }
    },
    { 
        name: "Tullock", 
        description: "Начинает с предательства. Далее инвертирует последний ход оппонента: если тот предал — сотрудничает, если сотрудничал — предаёт.", 
        isGood: false,
        function: function(history) {
            if (history.length === 0) return "D";
            return history[history.length - 1][1] === "D" ? "C" : "D";
        }
    },
    { 
        name: "Joss", 
        description: "Начинает с сотрудничества. Как Tit for Tat, но с 10% вероятностью предаёт после сотрудничества.", 
        isGood: false,
        function: function(history) {
            if (history.length === 0) return "C";
            if (history[history.length - 1][1] === "C") {
                return Math.random() < 0.1 ? "D" : "C";
            }
            return "D";
        }
    },
    { 
        name: "Shubik", 
        description: "Начинает с сотрудничества. Прощает одно предательство, после второго предательства переходит к постоянному предательству.", 
        isGood: true,
        function: function(history) {
            if (history.length === 0) return "C";
            const defections = history.filter(move => move[1] === "D").length;
            return defections <= 1 ? "C" : "D";
        }
    },
    { 
        name: "Nydegger", 
        description: "Начинает с сотрудничества. Во втором ходу — предаёт. Затем реагирует на два последовательных предательства.", 
        isGood: true,
        function: function(history) {
            if (history.length === 0) return "C";
            if (history.length === 1) return "D";
            if (history[history.length - 1][1] === "D" && history[history.length - 2][1] === "D") return "D";
            return "C";
        }
    },
    { 
        name: "Grofman", 
        description: "Начинает с сотрудничества. Если оппонент предал в последнем ходу — отвечает предательством. Иначе сотрудничает с вероятностью 2/3.", 
        isGood: false,
        function: function(history) {
            if (history.length === 0) return "C";
            if (history[history.length - 1][1] === "D") return "D";
            return Math.random() < 2/3 ? "C" : "D";
        }
    },
    { 
        name: "Random", 
        description: "Случайным образом выбирает между сотрудничеством и предательством с вероятностью 50% на каждом ходу. Не учитывает историю взаимодействий.", 
        isGood: false,
        function: function(history) {
            return Math.random() < 0.5 ? "C" : "D";
        }
    }
];

// Глобальные переменные для контроля выполнения
let isPlaying = false;
let currentMatchPromise = null;

// Заполняем список стратегий
function populateStrategyList() {
    const list = document.getElementById('strategies-list');
    list.innerHTML = '';
    
    strategies.forEach(strategy => {
        const item = document.createElement('div');
        item.className = 'strategy-item';
        item.dataset.strategyName = strategy.name;
        item.innerHTML = `
            <input type="checkbox" class="strategy-checkbox" id="strategy-${strategy.name.replace(/\s+/g, '-')}">
            <label for="strategy-${strategy.name.replace(/\s+/g, '-')}">${strategy.name}</label>
        `;
        list.appendChild(item);

        // Обработчик клика для отображения описания
        item.addEventListener('click', function(e) {
            if (e.target.tagName !== 'INPUT') {
                document.getElementById('strategy-description').querySelector('.description-title').textContent = strategy.name;
                document.getElementById('strategy-description').querySelector('.description-content').textContent = strategy.description;
                
                // Выделяем выбранную стратегию
                document.querySelectorAll('.strategy-item').forEach(i => i.classList.remove('selected'));
                this.classList.add('selected');
            }
        });
    });
}

// Фильтрация стратегий
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const filter = this.dataset.filter;
        const checkboxes = document.querySelectorAll('.strategy-checkbox');

        checkboxes.forEach(checkbox => {
            const strategyName = checkbox.id.replace('strategy-', '').replace(/-/g, ' ');
            const strategy = strategies.find(s => s.name === strategyName);
            
            switch(filter) {
                case 'all':
                    checkbox.checked = true;
                    break;
                case 'good':
                    checkbox.checked = strategy.isGood;
                    break;
                case 'evil':
                    checkbox.checked = !strategy.isGood;
                    break;
                case 'reset':
                    checkbox.checked = false;
                    break;
            }

            // Обновляем стиль элемента
            const item = checkbox.closest('.strategy-item');
            if (checkbox.checked) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    });
});

// Функция для проведения одного матча без анимации (для турнира)
function playMatchWithoutAnimation(strategy1, strategy2, rounds) {
    const history1 = [];
    const history2 = [];
    let score1 = 0;
    let score2 = 0;
    
    for (let i = 0; i < rounds; i++) {
        const move1 = strategy1.function(history1);
        const move2 = strategy2.function(history2);
        
        history1.push([move1, move2]);
        history2.push([move2, move1]);
        
        if (move1 === "C" && move2 === "C") {
            score1 += 3;
            score2 += 3;
        } else if (move1 === "C" && move2 === "D") {
            score2 += 5;
        } else if (move1 === "D" && move2 === "C") {
            score1 += 5;
        } else if (move1 === "D" && move2 === "D") {
            score1 += 1;
            score2 += 1;
        }
    }
    
    return { 
        scores: {
            [strategy1.name]: score1,
            [strategy2.name]: score2
        }
    };
}

// Функция для проведения одного матча с последовательным выводом ходов
async function playSingleMatch(strategy1, strategy2, rounds, matchNumber) {
    isPlaying = true;
    document.getElementById('stop-button').style.display = 'block';
    
    const history1 = [];
    const history2 = [];
    let score1 = 0;
    let score2 = 0;
    
    const matchContainer = document.createElement('div');
    matchContainer.className = 'match-container';
    
    const matchTitle = document.createElement('div');
    matchTitle.className = 'match-title';
    matchTitle.textContent = `Матч ${matchNumber}: ${strategy1.name} vs ${strategy2.name}`;
    matchContainer.appendChild(matchTitle);
    
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'match-results-container';
    
    const table = document.createElement('table');
    table.className = 'match-table';
    
    const headerRow = document.createElement('tr');
    const emptyHeader = document.createElement('th');
    emptyHeader.textContent = '';
    headerRow.appendChild(emptyHeader);
    
    for (let i = 1; i <= rounds; i++) {
        const roundHeader = document.createElement('th');
        roundHeader.textContent = i;
        headerRow.appendChild(roundHeader);
    }
    table.appendChild(headerRow);
    
    const strategyRow1 = document.createElement('tr');
    const strategyLabel1 = document.createElement('th');
    strategyLabel1.textContent = strategy1.name;
    strategyRow1.appendChild(strategyLabel1);
    
    const strategyRow2 = document.createElement('tr');
    const strategyLabel2 = document.createElement('th');
    strategyLabel2.textContent = strategy2.name;
    strategyRow2.appendChild(strategyLabel2);
    
    table.appendChild(strategyRow1);
    table.appendChild(strategyRow2);
    
    resultsContainer.appendChild(table);
    matchContainer.appendChild(resultsContainer);
    
    const summaryContainer = document.createElement('div');
    summaryContainer.className = 'match-summary';
    
    const summaryTitle = document.createElement('div');
    summaryTitle.className = 'scores-title';
    summaryTitle.textContent = 'Результаты матча:';
    summaryContainer.appendChild(summaryTitle);
    
    matchContainer.appendChild(summaryContainer);
    
    document.getElementById('all-matches-results').appendChild(matchContainer);
    
    try {
        for (let i = 0; i < rounds; i++) {
            if (!isPlaying) {
                throw new Error('Match stopped by user');
            }
            
            const move1 = strategy1.function(history1);
            const move2 = strategy2.function(history2);
            
            history1.push([move1, move2]);
            history2.push([move2, move1]);
            
            if (move1 === "C" && move2 === "C") {
                score1 += 3;
                score2 += 3;
            } else if (move1 === "C" && move2 === "D") {
                score2 += 5;
            } else if (move1 === "D" && move2 === "C") {
                score1 += 5;
            } else if (move1 === "D" && move2 === "D") {
                score1 += 1;
                score2 += 1;
            }
            
            const cell1 = document.createElement('td');
            cell1.textContent = move1;
            cell1.className = `${move1 === "C" ? 'cooperate' : 'defect'} move-animation`;
            strategyRow1.appendChild(cell1);
            
            const cell2 = document.createElement('td');
            cell2.textContent = move2;
            cell2.className = `${move2 === "C" ? 'cooperate' : 'defect'} move-animation`;
            strategyRow2.appendChild(cell2);
            
            await new Promise((resolve) => {
                const timer = setTimeout(resolve, i < 10 ? 300 : 50);
                currentMatchPromise = { 
                    resolve: () => {
                        clearTimeout(timer);
                        resolve();
                    }
                };
            });
        }
    } catch (e) {
        if (e.message === 'Match stopped by user') {
            const stopDiv = document.createElement('div');
            stopDiv.className = 'strategy-score';
            stopDiv.textContent = 'Матч остановлен пользователем';
            summaryContainer.appendChild(stopDiv);
        }
        return { scores: { [strategy1.name]: score1, [strategy2.name]: score2 } };
    } finally {
        isPlaying = false;
        document.getElementById('stop-button').style.display = 'none';
        currentMatchPromise = null;
    }
    
    const scoreDiv1 = document.createElement('div');
    scoreDiv1.className = `strategy-score ${score1 > score2 ? 'winner' : ''}`;
    scoreDiv1.innerHTML = `<span>${strategy1.name}:</span> <span>${score1} очков</span>`;
    summaryContainer.appendChild(scoreDiv1);
    
    const scoreDiv2 = document.createElement('div');
    scoreDiv2.className = `strategy-score ${score2 > score1 ? 'winner' : ''}`;
    scoreDiv2.innerHTML = `<span>${strategy2.name}:</span> <span>${score2} очков</span>`;
    summaryContainer.appendChild(scoreDiv2);
    
    if (score1 === score2) {
        const drawDiv = document.createElement('div');
        drawDiv.className = 'strategy-score';
        drawDiv.textContent = 'Ничья!';
        summaryContainer.appendChild(drawDiv);
    }
    
    return { 
        scores: {
            [strategy1.name]: score1,
            [strategy2.name]: score2
        }
    };
}

// Функция для проведения турнира
async function playTournament(selectedStrategies, rounds, matches) {
    isPlaying = true;
    document.getElementById('stop-button').style.display = 'block';
    
    const tournamentContainer = document.createElement('div');
    tournamentContainer.className = 'tournament-container';
    
    const tournamentTitle = document.createElement('div');
    tournamentTitle.className = 'results-title';
    tournamentContainer.appendChild(tournamentTitle);
    
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'match-results-container';
    
    const table = document.createElement('table');
    table.className = 'tournament-table';
    
    const headerRow = document.createElement('tr');
    const emptyHeader = document.createElement('th');
    emptyHeader.textContent = 'Стратегии \\ Оппоненты';
    headerRow.appendChild(emptyHeader);
    
    selectedStrategies.forEach(strategy => {
        const strategyHeader = document.createElement('th');
        strategyHeader.textContent = strategy.name;
        headerRow.appendChild(strategyHeader);
    });
    
    const avgHeader = document.createElement('th');
    avgHeader.textContent = 'Средний результат';
    headerRow.appendChild(avgHeader);
    
    table.appendChild(headerRow);
    
    const resultsMatrix = {};
    const totalScores = {};
    
    // Инициализация структур данных
    selectedStrategies.forEach(strategy => {
        resultsMatrix[strategy.name] = {};
        totalScores[strategy.name] = 0;
        selectedStrategies.forEach(opponent => {
            resultsMatrix[strategy.name][opponent.name] = 0;
        });
    });
    
    try {
        // Проведение всех матчей
        for (let i = 0; i < selectedStrategies.length; i++) {
            for (let j = 0; j < selectedStrategies.length; j++) {
                if (!isPlaying) {
                    throw new Error('Tournament stopped by user');
                }
                
                let totalScore1 = 0;
                let totalScore2 = 0;
                
                for (let match = 0; match < matches; match++) {
                    if (!isPlaying) {
                        throw new Error('Tournament stopped by user');
                    }
                    
                    const { scores } = playMatchWithoutAnimation(
                        selectedStrategies[i],
                        selectedStrategies[j],
                        rounds
                    );
                    
                    totalScore1 += scores[selectedStrategies[i].name];
                    totalScore2 += scores[selectedStrategies[j].name];
                }
                
                // Сохранение результатов
                const avgScore1 = totalScore1 / matches;
                const avgScore2 = totalScore2 / matches;
                
                resultsMatrix[selectedStrategies[i].name][selectedStrategies[j].name] = avgScore1;
                resultsMatrix[selectedStrategies[j].name][selectedStrategies[i].name] = avgScore2;
                
                totalScores[selectedStrategies[i].name] += avgScore1;
                totalScores[selectedStrategies[j].name] += avgScore2;
            }
        }
        
        // Заполнение таблицы
        selectedStrategies.forEach(strategy => {
            const row = document.createElement('tr');
            const strategyLabel = document.createElement('th');
            strategyLabel.textContent = strategy.name;
            row.appendChild(strategyLabel);
            
            let opponentsCount = 0;
            
            selectedStrategies.forEach(opponent => {
                const score = Math.round(resultsMatrix[strategy.name][opponent.name]);
                const cell = document.createElement('td');
                cell.textContent = score;
                
                const maxPossible = rounds * 3;
                if (score >= maxPossible * 0.7) cell.classList.add('cooperate');
                else if (score <= maxPossible * 0.4) cell.classList.add('defect');
                
                row.appendChild(cell);
                opponentsCount++;
            });
            
            // Средний результат
            const avgScore = Math.round(totalScores[strategy.name] / (selectedStrategies.length * 2 - 2));
            const avgCell = document.createElement('td');
            avgCell.textContent = avgScore;
            avgCell.style.fontWeight = 'bold';
            row.appendChild(avgCell);
            
            table.appendChild(row);
        });
        
        // Создание списка топ-3 стратегий
        const topStrategies = Object.entries(totalScores)
            .map(([name, score]) => ({ name, score: score / (selectedStrategies.length * 2 - 2) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
        
        const topStrategiesContainer = document.createElement('div');
        topStrategiesContainer.className = 'final-summary';
        topStrategiesContainer.style.marginTop = '20px';
        
        const topStrategiesTitle = document.createElement('div');
        topStrategiesTitle.className = 'scores-title';
        topStrategiesTitle.textContent = 'Топ-3 стратегии:';
        topStrategiesContainer.appendChild(topStrategiesTitle);
        
        topStrategies.forEach((strategy, index) => {
            const place = ['🥇', '🥈', '🥉'][index];
            const strategyDiv = document.createElement('div');
            strategyDiv.className = 'strategy-score';
            strategyDiv.innerHTML = `
                <span>${place} ${strategy.name}:</span>
                <span>${Math.round(strategy.score)} очков</span>
            `;
            topStrategiesContainer.appendChild(strategyDiv);
        });
        
        tournamentContainer.appendChild(topStrategiesContainer);
        
    } catch (e) {
        if (e.message === 'Tournament stopped by user') {
            const stopDiv = document.createElement('div');
            stopDiv.className = 'strategy-score';
            stopDiv.textContent = 'Турнир остановлен пользователем';
            tournamentContainer.appendChild(stopDiv);
        }
    } finally {
        isPlaying = false;
        document.getElementById('stop-button').style.display = 'none';
    }
    
    resultsContainer.appendChild(table);
    tournamentContainer.appendChild(resultsContainer);
    document.getElementById('all-matches-results').appendChild(tournamentContainer);
}

// Обработчики событий
document.getElementById('stop-button').addEventListener('click', function() {
    isPlaying = false;
    if (currentMatchPromise) {
        currentMatchPromise.resolve();
    }
    this.style.display = 'none';
});

document.getElementById('play-button').addEventListener('click', async function() {
    const selectedStrategies = [];
    document.querySelectorAll('.strategy-checkbox:checked').forEach(checkbox => {
        const strategyName = checkbox.id.replace('strategy-', '').replace(/-/g, ' ');
        const strategy = strategies.find(s => s.name === strategyName);
        if (strategy) {
            selectedStrategies.push(strategy);
        }
    });
    
    if (selectedStrategies.length < 2) {
        alert('Пожалуйста, выберите хотя бы 2 стратегии');
        return;
    }
    
    const rounds = parseInt(document.getElementById('rounds-count').value);
    let matches = parseInt(document.getElementById('matches-count').value);
    
    if (matches > 5) {
        alert('Максимальное количество матчей - 5');
        document.getElementById('matches-count').value = 5;
        matches = 5;
    }
    
    document.getElementById('results-section').style.display = 'block';
    document.getElementById('all-matches-results').innerHTML = '';
    document.getElementById('final-summary').innerHTML = '';
    
    try {
        if (selectedStrategies.length === 2) {
            const strategy1 = selectedStrategies[0];
            const strategy2 = selectedStrategies[1];
            
            const allScores = {
                [strategy1.name]: [],
                [strategy2.name]: []
            };
            
            for (let i = 1; i <= matches; i++) {
                const { scores } = await playSingleMatch(strategy1, strategy2, rounds, i);
                allScores[strategy1.name].push(scores[strategy1.name]);
                allScores[strategy2.name].push(scores[strategy2.name]);
            }
            
            if (matches > 1) {
                const finalTitle = document.createElement('div');
                finalTitle.className = 'scores-title';
                finalTitle.textContent = 'Финальные результаты:';
                document.getElementById('final-summary').appendChild(finalTitle);
                
                const avgScore1 = allScores[strategy1.name].reduce((a, b) => a + b, 0) / matches;
                const avgScore2 = allScores[strategy2.name].reduce((a, b) => a + b, 0) / matches;
                
                const finalScore1 = document.createElement('div');
                finalScore1.className = `strategy-score ${avgScore1 > avgScore2 ? 'winner' : ''}`;
                finalScore1.innerHTML = `<span>${strategy1.name} (среднее):</span> <span>${avgScore1.toFixed(2)} очков</span>`;
                document.getElementById('final-summary').appendChild(finalScore1);
                
                const finalScore2 = document.createElement('div');
                finalScore2.className = `strategy-score ${avgScore2 > avgScore1 ? 'winner' : ''}`;
                finalScore2.innerHTML = `<span>${strategy2.name} (среднее):</span> <span>${avgScore2.toFixed(2)} очков</span>`;
                document.getElementById('final-summary').appendChild(finalScore2);
                
                if (avgScore1 === avgScore2) {
                    const drawDiv = document.createElement('div');
                    drawDiv.className = 'strategy-score';
                    drawDiv.textContent = 'Ничья по итогам всех матчей!';
                    document.getElementById('final-summary').appendChild(drawDiv);
                }
            }
        } else {
            await playTournament(selectedStrategies, rounds, matches);
        }
    } catch (e) {
        console.error('Game error:', e);
    }
});

// Переключение между вкладками
document.getElementById('play-tab').addEventListener('click', function() {
    document.getElementById('play-content').style.display = 'block';
    document.getElementById('help-content').style.display = 'none';
    document.getElementById('play-tab').classList.add('active');
    document.getElementById('help-tab').classList.remove('active');
});

document.getElementById('help-tab').addEventListener('click', function() {
    document.getElementById('play-content').style.display = 'none';
    document.getElementById('help-content').style.display = 'block';
    document.getElementById('help-tab').classList.add('active');
    document.getElementById('play-tab').classList.remove('active');
});

// Инициализация
populateStrategyList();
