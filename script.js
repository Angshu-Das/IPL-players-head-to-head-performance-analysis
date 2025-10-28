// Global variables
let csvData = '';
let batsmen = [];
let bowlers = [];

// Wait for page to load
document.addEventListener('DOMContentLoaded', function() {
    // File upload handler
    document.getElementById('csvFile').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            csvData = e.target.result;
            processCSVData(csvData);
            
            // Show file info
            document.getElementById('fileInfo').style.display = 'block';
            document.getElementById('fileInfo').textContent = 
                `✅ File loaded: ${file.name} (${batsmen.length} batsmen, ${bowlers.length} bowlers)`;
        };
        reader.readAsText(file);
    });

    // Show stats button handler
    document.getElementById('showStats').addEventListener('click', showStatistics);
});

function processCSVData(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    
    // Find column indices
    const batterIndex = headers.indexOf('batter');
    const bowlerIndex = headers.indexOf('bowler');
    
    // Reset arrays
    batsmen = [];
    bowlers = [];
    
    // Get unique batsmen and bowlers
    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',');
        if (row.length > Math.max(batterIndex, bowlerIndex)) {
            if (row[batterIndex] && row[batterIndex] !== 'NA' && !batsmen.includes(row[batterIndex])) {
                batsmen.push(row[batterIndex]);
            }
            if (row[bowlerIndex] && row[bowlerIndex] !== 'NA' && !bowlers.includes(row[bowlerIndex])) {
                bowlers.push(row[bowlerIndex]);
            }
        }
    }
    
    // Sort alphabetically
    batsmen.sort();
    bowlers.sort();
    
    // Enable controls
    document.getElementById('batsman').disabled = false;
    document.getElementById('bowler').disabled = false;
    document.getElementById('showStats').disabled = false;
    
    // Populate dropdowns
    populateDropdown('batsman', batsmen);
    populateDropdown('bowler', bowlers);
}

function populateDropdown(elementId, options) {
    const select = document.getElementById(elementId);
    select.innerHTML = '<option value="">Select ' + elementId + '...</option>';
    
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        select.appendChild(opt);
    });
}

function showStatistics() {
    const batsman = document.getElementById('batsman').value;
    const bowler = document.getElementById('bowler').value;
    
    if (!batsman || !bowler) {
        alert('Please select both a batsman and a bowler');
        return;
    }
    
    const stats = calculateStats(batsman, bowler);
    displayResults(batsman, bowler, stats);
    displayPlayerImages(batsman, bowler);
    createCharts(stats);
}

function calculateStats(batsman, bowler) {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    
    const batterIndex = headers.indexOf('batter');
    const bowlerIndex = headers.indexOf('bowler');
    const batsmanRunsIndex = headers.indexOf('batsman_runs');
    const extraRunsIndex = headers.indexOf('extra_runs');
    const isWicketIndex = headers.indexOf('is_wicket');
    const playerDismissedIndex = headers.indexOf('player_dismissed');
    
    let ballsFaced = 0;
    let runsScored = 0;
    let wickets = 0;
    let fours = 0;
    let sixes = 0;
    let dotBalls = 0;
    let singles = 0;
    let doubles = 0;
    let triples = 0;
    
    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',');
        if (row.length > Math.max(batterIndex, bowlerIndex)) {
            if (row[batterIndex] === batsman && row[bowlerIndex] === bowler) {
                ballsFaced++;
                
                const batsmanRun = parseInt(row[batsmanRunsIndex]) || 0;
                runsScored += batsmanRun;
                
                // Count runs distribution
                if (batsmanRun === 1) singles++;
                else if (batsmanRun === 2) doubles++;
                else if (batsmanRun === 3) triples++;
                else if (batsmanRun === 4) fours++;
                else if (batsmanRun === 6) sixes++;
                else if (batsmanRun === 0) dotBalls++;
                
                // Check for wickets
                const isWicket = row[isWicketIndex] === '1';
                const playerDismissed = row[playerDismissedIndex];
                if (isWicket && playerDismissed === batsman) {
                    wickets++;
                }
            }
        }
    }
    
    // Calculate statistics
    const strikeRate = ballsFaced > 0 ? ((runsScored / ballsFaced) * 100).toFixed(2) : '0.00';
    const average = wickets > 0 ? (runsScored / wickets).toFixed(2) : (runsScored > 0 ? '-' : '0.00');
    const dotBallPercentage = ballsFaced > 0 ? ((dotBalls / ballsFaced) * 100).toFixed(1) : '0.0';
    const boundaryPercentage = ballsFaced > 0 ? (((fours + sixes) / ballsFaced) * 100).toFixed(1) : '0.0';
    
    return {
        ballsFaced,
        runsScored,
        wickets,
        fours,
        sixes,
        dotBalls,
        singles,
        doubles,
        triples,
        strikeRate,
        average,
        dotBallPercentage,
        boundaryPercentage
    };
}

function displayResults(batsman, bowler, stats) {
    const resultsSection = document.getElementById('results');
    const matchTitle = document.getElementById('matchTitle');
    const statsTable = document.getElementById('statsTable');
    
    matchTitle.textContent = `${batsman} 🆚 ${bowler}`;
    
    if (stats.ballsFaced === 0) {
        statsTable.innerHTML = '<div class="no-data">No matches found between these players</div>';
    } else {
        statsTable.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${stats.runsScored}</div>
                    <div class="stat-label">Runs Scored</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.ballsFaced}</div>
                    <div class="stat-label">Balls Faced</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.strikeRate}</div>
                    <div class="stat-label">Strike Rate</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.average}</div>
                    <div class="stat-label">Average</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.wickets}</div>
                    <div class="stat-label">Wickets</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.fours}</div>
                    <div class="stat-label">Fours</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.sixes}</div>
                    <div class="stat-label">Sixes</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.dotBalls}</div>
                    <div class="stat-label">Dot Balls</div>
                </div>
            </div>
        `;
    }
    
    resultsSection.style.display = 'block';
}

function displayPlayerImages(batsman, bowler) {
    // Show batsman image
    document.getElementById('batsmanImage').innerHTML = `
        <div class="player-display">
            <div class="icon">🏏</div>
            <div class="name">${batsman}</div>
            <div class="role">Batsman</div>
        </div>
    `;
    
    // Show bowler image
    document.getElementById('bowlerImage').innerHTML = `
        <div class="player-display">
            <div class="icon">🎯</div>
            <div class="name">${bowler}</div>
            <div class="role">Bowler</div>
        </div>
    `;
}

function createCharts(stats) {
    // Runs Distribution Chart
    const runsCtx = document.getElementById('runsChart').getContext('2d');
    new Chart(runsCtx, {
        type: 'doughnut',
        data: {
            labels: ['Dot Balls', 'Singles', 'Doubles', 'Triples', 'Fours', 'Sixes'],
            datasets: [{
                data: [stats.dotBalls, stats.singles, stats.doubles, stats.triples, stats.fours, stats.sixes],
                backgroundColor: [
                    '#6c757d', '#28a745', '#17a2b8', '#ffc107', '#fd7e14', '#dc3545'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Runs Distribution'
                }
            }
        }
    });

    // Ball Analysis Chart
    const ballsCtx = document.getElementById('ballsChart').getContext('2d');
    new Chart(ballsCtx, {
        type: 'pie',
        data: {
            labels: ['Dot Balls', 'Runs Scored', 'Boundaries'],
            datasets: [{
                data: [
                    stats.dotBalls,
                    stats.singles + stats.doubles + stats.triples,
                    stats.fours + stats.sixes
                ],
                backgroundColor: ['#6c757d', '#28a745', '#dc3545']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Ball Analysis'
                }
            }
        }
    });
}