document.addEventListener('DOMContentLoaded', function () {
    // Click event for the "Search" button
    document.getElementById('searchbtn').addEventListener('click', performSearch);

    // Keydown event for "Enter" key in the search bar (changed from keypress)
    document.getElementById('search-bar').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    function performSearch() {
        // Collect selected ratings
        const selectedRatings = Array.from(document.querySelectorAll('.dropdown-content3 input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value);

        // Collect selected studios
        const selectedStudios = Array.from(document.querySelectorAll('.production-label input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value);

        // Collect selected genres, years, etc.
        const selectedGenres = Array.from(document.querySelectorAll('.dropdown-content input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value);
        const selectedYears = Array.from(document.querySelectorAll('.year:checked'))
            .map(checkbox => checkbox.value);

        // Log the selected filters for debugging
        console.log('Selected Ratings:', selectedRatings);
        console.log('Selected Studios:', selectedStudios);
        console.log('Selected Genres:', selectedGenres);
        console.log('Selected Years:', selectedYears);

        // If no filters selected, show an alert
        if (selectedRatings.length === 0 && selectedStudios.length === 0 && selectedGenres.length === 0 && selectedYears.length === 0) {
            alert('Please select at least one genre, year, age rating, or studio.');
            return;
        }

        // Fetch data and process
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
                        const ageRating = columns[15].trim(); // Age rating in column 16
                        const studio = columns[12].trim(); // Studio in column 13
                        const japaneseName = columns[1]; // Japanese Name
                        const englishName = columns[4]; // English Name

                        // Matching conditions
                        const isGenreMatch = selectedGenres.every(genre => genres.includes(genre));
                        const isYearMatch = selectedYears.length === 0 || selectedYears.includes(year);
                        const isAgeRatingMatch = selectedRatings.length === 0 || selectedRatings.includes(ageRating);
                        const isStudioMatch = selectedStudios.length === 0 || selectedStudios.some(studioOption => studio.includes(studioOption));

                        if (isGenreMatch && isYearMatch && isAgeRatingMatch && isStudioMatch) {
                            matchingShows.push({ japaneseName, englishName, rating: columns[2].trim(), year, season, genres, ageRating, studio });
                        }
                    }
                });

                // If no results, display message
                if (matchingShows.length === 0) {
                    document.body.innerHTML = 
                        `<h1>No Shows Match</h1>
                        <p>Sorry, no shows match your criteria.</p>
                        <button id="go-back-top" class="go-back-button">Go Back</button>`;
                    addGoBackListeners();
                    return;
                }

                // Sort the results by rating in descending order, ensuring the rating is parsed correctly
                matchingShows.sort((a, b) => {
                    const ratingA = parseFloat(a.rating) || 0;
                    const ratingB = parseFloat(b.rating) || 0;
                    return ratingB - ratingA; // Descending order
                });

                // Render the results
                renderResults(matchingShows);
            })
            .catch(error => {
                console.error('Error fetching or processing the file:', error);
            });
    }

    function renderResults(shows) {
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
                .search-bar {
                    display: block;
                    margin: 20px auto;
                    padding: 10px 20px;
                    font-size: 18px;
                    border-radius: 8px;
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
                    <th>Japanese Name</th>
                    <th>English Name</th>
                    <th>Year</th>
                    <th>Season</th>
                    <th>Genres</th>
                    <th>Rating</th>
                    <th>Age Rating</th>
                    <th>Studio</th>
                </tr>
                ${shows.map(show => 
                    `<tr class="show-row">
                        <td>${show.japaneseName}</td>
                        <td>${show.englishName}</td>
                        <td>${show.year}</td>
                        <td>${show.season}</td>
                        <td>${show.genres.join(', ')}</td>
                        <td><span class="rating-star">${show.rating}</span></td>
                        <td>${show.ageRating}</td>
                        <td>${show.studio}</td>
                    </tr>`
                ).join('')}
            </table>
            <button id="go-back-bottom" class="go-back-button">Go Back</button>`;

        addGoBackListeners();
    }

    function addGoBackListeners() {
        const goBackButtons = document.querySelectorAll('.go-back-button');
        goBackButtons.forEach(button => {
            button.addEventListener('click', function () {
                window.location.reload(); // Reload the page to return to the original state
            });
        });
    }
});