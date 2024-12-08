document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('searchbtn').addEventListener('click', function () {
        // Get selected genres and years from checkboxes
        const selectedGenres = Array.from(document.querySelectorAll('.dropdown-content input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value); // Get selected genres
        const selectedYears = Array.from(document.querySelectorAll('.year:checked'))
            .map(checkbox => checkbox.value); // Get selected years

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
                const rows = data.split('\n'); // Split into rows
                const matchingShows = [];

                // Loop through each row (show)
                rows.forEach(row => {
                    const columns = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Split considering quoted commas
                    
                    if (columns.length > 10) { // Ensure there are enough columns (check for column 10)
                        // Extract genres from column 4 (index 3)
                        const genres = columns[3].replace(/"/g, '').split(',').map(genre => genre.trim());

                        // Extract premiered year from column 10 (index 9) and trim whitespace
                        const premiered = columns[9].trim();
                        
                        // Use regular expression to extract the year part (e.g., "Spring 2020" -> "2020")
                        const yearMatch = premiered.match(/\d{4}/); // Match 4 digits (the year)
                        const year = yearMatch ? yearMatch[0] : ''; // If matched, use the year
                        
                        // Extract the season (e.g., "Spring" from "Spring 2020")
                        const season = premiered.split(' ')[0]; // Get the season part, e.g., "Spring"

                        // Check if the show contains all selected genres
                        const isGenreMatch = selectedGenres.every(genre => genres.includes(genre));
                        
                        // If no year is selected, pass isYearMatch as true for all shows
                        const isYearMatch = selectedYears.length === 0 || selectedYears.includes(year);

                        // If the show matches both genres and year, add it to the list
                        if (isGenreMatch && isYearMatch) {
                            const showName = columns[1]; // Show name is in column 2 (index 1)
                            const rating = parseFloat(columns[2]); // Rating is in column 3 (index 2)
                            matchingShows.push({ showName, rating, year, season, genres });
                        }
                    }
                });

                // Check if no shows match
                if (matchingShows.length === 0) {
                    document.body.innerHTML = `
                        <h1>No Shows Match</h1>
                        <p>Sorry, there are no shows that match your selected criteria.</p>
                    `;
                    return;
                }

                // Sort the shows by rating in descending order
                matchingShows.sort((a, b) => b.rating - a.rating);

                // Clear any existing content in the current page and inject the results
                document.body.innerHTML = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Search Results</title>
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
                                overflow-x: auto;
                            }
                            th, td {
                                padding: 12px;
                                text-align: left;
                                border-bottom: 1px solid #ddd;
                                color: #ff6624; /* Ensure the content and headings are the same color */
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
                            /* Responsive styles */
                            @media (max-width: 768px) {
                                table {
                                    width: 100%;
                                    font-size: 14px;
                                }
                                th, td {
                                    padding: 8px;
                                }
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
                                    <td class="year">${show.year}</td>
                                    <td class="season">${show.season}</td>
                                    <td class="genres">${show.genres.join(', ')}</td>
                                    <td class="rating"><span class="rating-star">${show.rating}</span></td>
                                </tr>
                            `).join('')}
                        </table>
                    </body>
                    </html>
                `;

                // Add click event to each row to open Google search in the same tab
                matchingShows.forEach((show, index) => {
                    const row = document.querySelectorAll('.show-row')[index];
                    if (row) {
                        row.addEventListener('click', function () {
                            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(show.showName)}`;
                            window.location.href = searchUrl; // This opens the search in the same tab
                        });
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching or processing the file:', error);
            });
    });
});