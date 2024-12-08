document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('searchbtn').addEventListener('click', function () {
        // Get selected genres and years from checkboxes
        const selectedGenres = Array.from(document.querySelectorAll('.dropdown-content input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value);
        const selectedYears = Array.from(document.querySelectorAll('.year:checked'))
            .map(checkbox => checkbox.value);

        if (selectedGenres.length === 0 && selectedYears.length === 0) {
            alert('Please select at least one genre or year.');
            return;
        }

        // Fetch the content of the text file
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

                // Process each row
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

                // Sort by rating
                matchingShows.sort((a, b) => b.rating - a.rating);

                // Open new window or tab
                const newWindow = window.open('', '_blank');
                if (newWindow) {
                    newWindow.document.write(`
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Search Results</title>
                            <style>
                                body {
                                    font-family: 'Arial', sans-serif;
                                    background-color: #2f073b;
                                    color: #ff6624;
                                }
                                table {
                                    width: 80%;
                                    margin: auto;
                                    border-collapse: collapse;
                                    background-color: #2f073b;
                                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                                }
                                th, td {
                                    padding: 12px;
                                    text-align: left;
                                    border-bottom: 1px solid #ddd;
                                }
                                tr:hover {
                                    background-color: #CC99FF;
                                    cursor: pointer;
                                }
                                tr:hover td {
                                    color: #ff0096;
                                }
                            </style>
                        </head>
                        <body>
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
                                        <td class="show-title">${show.showName}</td>
                                        <td>${show.year}</td>
                                        <td>${show.season}</td>
                                        <td>${show.genres.join(', ')}</td>
                                        <td>${show.rating}</td>
                                    </tr>
                                `).join('')}
                            </table>
                        </body>
                        </html>
                    `);

                    // Event delegation for dynamic rows
                    newWindow.document.addEventListener('click', function (event) {
                        const row = event.target.closest('.show-row');
                        if (row) {
                            const showName = row.querySelector('.show-title').textContent;
                            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(showName)}`;
                            const popup = window.open(searchUrl, '_blank', 'noopener,noreferrer');
                            if (!popup) {
                                alert('Popup blocked! Please enable popups for this site.');
                            }
                        }
                    });
                } else {
                    alert('Unable to open a new window. Please check your browser settings.');
                }
            })
            .catch(error => {
                console.error('Error fetching or processing the file:', error);
            });
    });
});