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

                // Sort the shows by rating in descending order
                matchingShows.sort((a, b) => b.rating - a.rating);

                // Open a new page with the results
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
                                    margin: 0;
                                    padding: 0;
                                    background-color: #2f073b;
                                    color: #ff6624;
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
                                }
                                th {
                                    background-color: #2f073b;
                                    color: #2f073b;
                                }
                                /* Hover effect for the entire row */
                                tr:hover {
                                    background-color: #CC99FF;  /* Row background color */
                                    cursor: pointer;
                                }
                    
                                /* Hover effect for text inside the row */
                                tr:hover td {
                                    color: #ff0096;  /* Change text color on hover */
                                }
                    
                                /* Rating hover effect */
                                tr:hover .rating-star {
                                    color: #ff0096;  /* Change rating color on row hover */
                                }
                    
                                .rating-star {
                                    color: #ff6624;
                                    transition: color 0.3s ease;
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
                                        <td class="show-title">${show.showName}</td> <!-- Show Name with class -->
                                        <td class="year">${show.year}</td> <!-- Year with class -->
                                        <td class="season">${show.season}</td> <!-- Season with class -->
                                        <td class="genres">${show.genres.join(', ')}</td> <!-- Genres with class -->
                                        <td class="rating"><span class="rating-star">${show.rating}</span></td> <!-- Rating with class -->
                                    </tr>
                                `).join('')}
                            </table>
                        </body>
                        </html>
                    `);

                    // Add click event to each row to open Google search
                    matchingShows.forEach((show, index) => {
                        const row = newWindow.document.querySelectorAll('.show-row')[index];
                        row.addEventListener('click', function () {
                            window.open(`https://www.google.com/search?q=${encodeURIComponent(show.showName)}`, '_blank');
                        });
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