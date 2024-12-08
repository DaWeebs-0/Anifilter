document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('searchbtn').addEventListener('click', function () {
        const selectedGenres = Array.from(document.querySelectorAll('.dropdown-content input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value);
        const selectedYears = Array.from(document.querySelectorAll('.year:checked'))
            .map(checkbox => checkbox.value);

        if (selectedGenres.length === 0 && selectedYears.length === 0) {
            alert('Please select at least one genre or year.');
            return;
        }

        fetch('anime.txt')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.text();
            })
            .then(data => {
                const rows = data.split('\n');
                const matchingShows = [];

                rows.forEach(row => {
                    const columns = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                    if (columns.length > 10) {
                        const genres = columns[3].replace(/"/g, '').split(',').map(genre => genre.trim());
                        const premiered = columns[9].trim();
                        const yearMatch = premiered.match(/\d{4}/);
                        const year = yearMatch ? yearMatch[0] : '';
                        const season = premiered.split(' ')[0];
                        const isGenreMatch = selectedGenres.every(genre => genres.includes(genre));
                        const isYearMatch = selectedYears.length === 0 || selectedYears.includes(year);

                        if (isGenreMatch && isYearMatch) {
                            const showName = columns[1];
                            const rating = parseFloat(columns[2]);
                            matchingShows.push({ showName, rating, year, season, genres });
                        }
                    }
                });

                if (matchingShows.length === 0) {
                    document.body.innerHTML = `
                        <h1>No Shows Match</h1>
                        <p>Sorry, there are no shows that match your selected criteria.</p>
                        <button id="go-back-top" class="go-back-button">Go Back</button>
                    `;
                    addGoBackListeners();
                    return;
                }

                matchingShows.sort((a, b) => b.rating - a.rating);

                document.body.innerHTML = `
                    <style>
                        body {
                            font-family: 'Arial', sans-serif;
                            margin: 0;
                            padding: 0;
                            background-color: #2f073b;
                            color: #ff6624;
                            overflow-x: auto;
                        }
                        h1 {
                            text-align: center;
                            color: #ff6624;
                            margin-top: 20px;
                        }
                        table {
                            width: 80%;
                            margin: 20px auto;
                            border-collapse: collapse;
                            background-color: #2f073b;
                            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                        }
                        th, td {
                            padding: 12px;
                            text-align: left;
                            border-bottom: 1px solid #ddd;
                            color: #ff6624;
                        }
                        th {
                            background-color: #2f073b;
                        }
                        tr:hover {
                            background-color: #CC99FF;
                            cursor: pointer;
                        }
                        tr:hover td {
                            color: #ff0096;
                        }
                        .rating-star {
                            color: #ff6624;
                            transition: color 0.3s ease;
                        }
                        .rating-star::before {
                            content: "⭐";
                            padding-right: 5px;
                        }
                        .go-back-button {
                            display: block;
                            margin: 20px auto;
                            padding: 10px 20px;
                            background-color: #ff6624;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-size: 18px;
                            cursor: pointer;
                            transition: background-color 0.3s ease;
                        }
                        .go-back-button:hover {
                            background-color: #CC99FF;
                            color: #2f073b;
                        }
                    </style>
                    <button id="go-back-top" class="go-back-button">Go Back</button>
                    <h1>Search Results</h1>
                    <table>
                        <tr>
                            <th>Show Name</th>
                            <th>Year</th>
                            <th>Season</th>
                            <th>Genres</th>
                            <th>Rating</th>
                        </tr>
                        ${matchingShows.map(show => `
                            <tr class="show-row">
                                <td>${show.showName}</td>
                                <td>${show.year}</td>
                                <td>${show.season}</td>
                                <td>${show.genres.join(', ')}</td>
                                <td><span class="rating-star">${show.rating}</span></td>
                            </tr>
                        `).join('')}
                    </table>
                    <button id="go-back-bottom" class="go-back-button">Go Back</button>
                `;
                addGoBackListeners();

                matchingShows.forEach((show, index) => {
                    const row = document.querySelectorAll('.show-row')[index];
                    if (row) {
                        row.addEventListener('click', function () {
                            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(show.showName)}`;
                            window.location.href = searchUrl;
                        });
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching or processing the file:', error);
            });
    });
});

function addGoBackListeners() {
    const goBackButtons = document.querySelectorAll('.go-back-button');
    goBackButtons.forEach(button => {
        button.addEventListener('click', function () {
            window.location.reload(); // Reload the page to return to the original state
        });
    });
}