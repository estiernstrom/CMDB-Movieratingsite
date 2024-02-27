async function fetchMovieDetails(imdbID, button) {
    var plotDiv = document.getElementById("plot-" + imdbID);
    if (plotDiv.textContent === "") {
        try {
            const response = await fetch("http://www.omdbapi.com/?apikey=cbe52d0b&i=" + imdbID);
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            const data = await response.json();
            plotDiv.textContent = data.Plot;
            button.textContent = "Dölj handling";
        } catch (error) {
            console.error("Det uppstod ett fel:", error);
        }
    } else {
        plotDiv.textContent = "";
        button.textContent = "Visa handling";
    }
}

window.onload = function () {
    // Funktion för att visa dagens datum och tid
    function updateDateTime() {
        var today = new Date();
        var formattedDate = today.getFullYear() + '-' +
            (today.getMonth() + 1).toString().padStart(2, '0') + '-' +
            today.getDate().toString().padStart(2, '0');
        var formattedTime = today.getHours().toString().padStart(2, '0') + ':' +
            today.getMinutes().toString().padStart(2, '0') + ':' +
            today.getSeconds().toString().padStart(2, '0');
        document.getElementById("currentDate").innerText = formattedDate + ' ' + formattedTime;
    }

    // Funktion för att räkna ner till 2025-05-31
    function updateCountdown() {
        var now = new Date();
        var targetDate = new Date("2025-05-31T00:00:00");
        var difference = targetDate - now;

        if (difference <= 0) {
            document.getElementById("countdown").innerText = "Time left: 0 days 0 hours 0 minutes 0 seconds";
            return;
        }

        var days = Math.floor(difference / (1000 * 60 * 60 * 24));
        difference %= (1000 * 60 * 60 * 24);


        var hours = Math.floor(difference / (1000 * 60 * 60));
        difference %= (1000 * 60 * 60);


        var minutes = Math.floor(difference / (1000 * 60));
        difference %= (1000 * 60);


        var seconds = Math.floor(difference / 1000);

        document.getElementById("countdown").innerText = "Time left: " + days + " days " + hours + " hours " + minutes + " minutes " + seconds + " seconds";
    }


    // Uppdatera både dagens datum och nedräkningen när sidan laddas
    updateDateTime();
    updateCountdown();

    // Sätt interval för att uppdatera varje sekund
    setInterval(updateDateTime, 1000);
    setInterval(updateCountdown, 1000);
}

async function fetchMovies(searchTerm) {
    var apiUrl = "https://www.omdbapi.com/?apikey=cbe52d0b&s=" + encodeURIComponent(searchTerm);
    try {
        const response = await fetch(apiUrl);
        if (response.ok) {
            const data = await response.json();
            if (data.Response === "True") {
                // Om vi får ett resultat, visa resultaten och göm "no-results" div
                displayMovies(data.Search);
                document.getElementById("no-results").style.display = "none";
                document.getElementById("movies").style.display = "block";
                document.getElementById("movie-plot-container").style.display = "block";
            } else {
                // Inget sökresultat hittades, visa "no-results" div och göm resultaten
                document.getElementById("no-results").style.display = "block";
                document.getElementById("movies").style.display = "none";
                document.getElementById("movie-plot-container").style.display = "none";
            }
        } else {
            console.error("Felaktigt svar från servern:", response.status, response.statusText);
        }
    } catch (error) {
        console.error("Det uppstod ett fel:", error);
    }
}

function displayMovies(movies) {
    var moviesDiv = document.getElementById("movies");
    moviesDiv.innerHTML = "";

    movies.forEach(movie => {
        var movieElem = document.createElement("div");
        movieElem.className = "movie-container";

        var movieImageDiv = document.createElement("div");
        movieImageDiv.className = "movie-image";
        movieImageDiv.innerHTML = `<img src="${movie.Poster}" alt="${movie.Title}" />`;

        var movieInfoDiv = document.createElement("div");
        movieInfoDiv.className = "movie-info";

        var titleElem = document.createElement("h1");
        titleElem.textContent = movie.Title;

        var yearElem = document.createElement("p");
        var yearHeader = document.createElement("h3");
        yearHeader.textContent = "Utgivningsår:";
        yearElem.appendChild(yearHeader);
        yearElem.appendChild(document.createTextNode(` ${movie.Year}`));

        var button = document.createElement('button');
        button.onclick = function () { fetchMovieDetails(movie.imdbID, this); };
        button.className = "knapp-lank";
        button.textContent = 'Visa handling';

        var detailsLink = document.createElement("a");
        detailsLink.href = "details.html?imdbID=" + movie.imdbID;
        detailsLink.className = "knapp-lank";
        detailsLink.id = "details-link";
        detailsLink.textContent = "Detaljer";

        var plotDiv = document.createElement("p");
        plotDiv.id = "plot-" + movie.imdbID;
        plotDiv.className = "movie-plot";

        movieInfoDiv.appendChild(titleElem);
        movieInfoDiv.appendChild(yearElem);
        movieInfoDiv.appendChild(button);
        movieInfoDiv.appendChild(detailsLink);
        movieInfoDiv.appendChild(plotDiv);

        movieElem.appendChild(movieImageDiv);
        movieElem.appendChild(movieInfoDiv);
        moviesDiv.appendChild(movieElem);
    });
}


function getSearchTermFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('search');
}

async function fetchMovieDetailsDisplay(imdbID) {
    const detailApiUrl = "https://www.omdbapi.com/?apikey=cbe52d0b&i=" + imdbID;
    const cmdbsUrl = 'https://grupp6.dsvkurs.miun.se/api/movies/' + imdbID;

    try {
        const cmdbsMovie = await fetch(cmdbsUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer Hejsan123`
            }
        }).then(cmdbsResponse => cmdbsResponse.json())
            .catch(error => {
                console.error("Det uppstod ett fel:", error);
            });
        const omdbResponse = await fetch(detailApiUrl);
        const omdbData = await omdbResponse.json();
        omdbData.CMDbScore = cmdbsMovie ? cmdbsMovie.cmdbScore : null;
        omdbData.voteCount = cmdbsMovie ? cmdbsMovie.count : null;
        omdbData.reviews = cmdbsMovie ? cmdbsMovie.reviews : [];
        omdbData.categorizedScores = cmdbsMovie ? cmdbsMovie.categorizedScores : [];


        displayMovieDetails(omdbData);
    } catch (error) { console.error("Det uppstod ett fel på 169 eller 170:", error); }




}


function displayMovieDetails(movie) {
    const movieDetailsDiv = document.getElementById('movie-details');
    const reviewsDiv = document.getElementById('reviews');
    const scoreDiv = document.getElementById('score');

    const reviewList = movie.reviews ? movie.reviews.map(review => `
    <li class="review-item">
        ${review.reviewer ? `<strong>Reviewer:</strong> ${review.reviewer}` : ''}
        <strong>Score:</strong> ${review.score}
        ${review.review ? `<br><strong>Review:</strong> ${review.review}` : ''}
        <strong>Date:</strong> ${review.date}
    </li>
`).join('') : '';

    const categorizedScoreList = movie.categorizedScores ? movie.categorizedScores.map(score => `
        <li>
            Score: ${score.score}
            Count: ${score.count}
        </li>
    `).join('') : '';

    const movieDetailsHTML = `
        <h1>${movie.Title}</h1>
        <p><h2>År:</h2> ${movie.Year}</p>
        <p><h2>Speltid:</h2> ${movie.Runtime}</p>
        <p><h2>Regissör:</h2> ${movie.Director}</p>
        <p><h2>Skådespelare:</h2> ${movie.Actors}</p>
        <p><h2>Sammanfattning:</h2> ${movie.Plot}</p>
        <img src="${movie.Poster}" alt="${movie.Title} Poster"/>
        
    `;

    const reviewsHTML = `
     <h1>Reviews:</h1>
        <ul>
            ${reviewList}
        </ul>
    `;
    let scoreHTML = "";
    console.log(movie);
    if (movie.CMDbScore && movie.voteCount) {
        scoreHTML = `
        <h1>CMDb Score: ${movie.CMDbScore}</h1>
        <p>Baserat på ${movie.voteCount} röster</p>
        <h1>Fördelning av rösterna:</h1>
        <ul>
            ${categorizedScoreList}
        </ul>
        `;
    }
    else {
        scoreHTML = `
        <h1>Det finns inga recensioner eller betyg för denna film</h1>
        `;
    }

    // const scoreHTML = `
    // ${movie.CMDbScore  && movie.voteCount ? `<h1>CMDb Score: ${movie.CMDbScore}</h1>
    // <p>Baserat på ${movie.voteCount} röster</p>` : ''}
    // <h1>Fördelning av rösterna:</h1>
    // <ul>
    //     ${categorizedScoreList}
    // </ul>
    // `;

    movieDetailsDiv.innerHTML = movieDetailsHTML;
    reviewsDiv.innerHTML = reviewsHTML;
    scoreDiv.innerHTML = scoreHTML;
}

function getImdbIDFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('imdbID');
}

function fetchCMDbScoreForMovie(imdbID) {
    return fetch('https://grupp6.dsvkurs.miun.se/api/toplists?sort=DESC', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer Hejsan123`
        }
    })
        .then(response => response.json())
        .then(data => {
            const movie = data.movies.find(m => m.imdbID === imdbID);
            if (movie) {
                return {
                    cmdbScore: movie.cmdbScore,
                    count: movie.count
                };
            } else {
                return {
                    cmdbScore: null,
                    count: null
                };
            }
        })
        .catch(error => {
            console.error("Det uppstod ett fel när CMDb score och antal röster hämtades:", error);
            return {
                cmdbScore: null,
                count: null
            };
        });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("submitReview").addEventListener('click', submitReview);

    const ratingButtons = document.querySelectorAll('.rank-btn');
    ratingButtons.forEach(button => {
        button.addEventListener('click', function () {
            ratingButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
});

function submitReview() {
    const imdbID = getImdbIDFromUrl();
    const reviewer = document.getElementById("reviewerName").value;
    const score = document.querySelector('.rank-btn.active') ? document.querySelector('.rank-btn.active').value : null;
    const review = document.getElementById("reviewText").value;
    const date = new Date().toISOString().split('T')[0];

    const submitBtn = document.getElementById("submitReview");

    if (score && reviewer && review) {
        postReview(imdbID, reviewer, score, review, date);
    } else {
        alert('Vänligen fyll i alla fält och välj ett betyg.');
        submitBtn.disabled = false; // Gör knappen klickbar igen om något av fälten är tomma
    }
}

async function postReview(imdbID, reviewer, score, review, date) {
    const apiUrl = "https://grupp6.dsvkurs.miun.se/api/movies/review";
    const submitBtn = document.getElementById("submitReview");

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imdbID: imdbID,
                reviewer: reviewer,
                score: parseInt(score),
                review: review,
                date: date
            })
        });

        const data = await response.json();
        console.log("API Response:", data);

        if (data.imdbID) {
            alert("Din recension har sparats!");
            submitBtn.disabled = true; // Gör knappen oklickbar när recensionen skickas framgångsrikt
        } else {
            alert("Ett fel inträffade. Kontrollera din inmatning.");
            submitBtn.disabled = false; // Om svaret från API:et inte är vad vi förväntar oss, gör knappen klickbar igen
        }

    } catch (error) {
        console.error("Det uppstod ett fel:", error);
        alert("Ett fel inträffade. Försök igen senare.");
        submitBtn.disabled = false; // Om ett nätverksfel eller något annat fel inträffar, gör knappen klickbar igen
    }
}


document.addEventListener("DOMContentLoaded", function () {
    const apiKey = "Hejsan123";
    const movieList = document.getElementById("movie-list");




    async function fetchMovieDetailsWithImdbID(imdbID) {
        return fetch("http://www.omdbapi.com/?apikey=cbe52d0b&i=" + imdbID)
            .then(response => response.json())
            .catch(error => console.error("Det uppstod ett fel:", error));
    }




    async function fetchTopList() {
        try {
            const response = await fetch('https://grupp6.dsvkurs.miun.se/api/toplists?sort=DESC', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });
            const data = await response.json();

            const movies = data.movies.slice(0, 10);
            movies.sort((a, b) => b.cmdbScore - a.cmdbScore);
            console.log(movies);

            for (let movie of movies) {
                const omdbDetails = await fetchMovieDetailsWithImdbID(movie.imdbID);
                const movieItem = document.createElement('div');
                movieItem.className = 'flex-item vertical';

                movieItem.innerHTML = `
            <h2>${omdbDetails.Title}</h2>
            <img src="${omdbDetails.Poster}" alt="${omdbDetails.Title}" />
            <p><h3>Utgivningsår:</h3> ${omdbDetails.Year}</p>
            <p><h3>Speltid:</h3> ${omdbDetails.Runtime}</p>
            <p><h3>Sammanfattning:</h3> ${omdbDetails.Plot}</p>
            <p><h3>CMDB Score:</h3> ${movie.cmdbScore}</p>
            <p><h3>Review Count:</h3> ${movie.count}</p>
            <a href="details.html?imdbID=${movie.imdbID}" class="knapp-lank" id="details-link">Detaljer</a>
        `;



                movieList.appendChild(movieItem);
            }
        } catch (error) {
            console.error('Något gick fel:', error);
        }
    }





    fetchTopList();
});

let selectedScore = null;

document.addEventListener('DOMContentLoaded', function () {
    // Lägg till event listeners på betygsättningsknapparna
    document.querySelectorAll('.rank-btn-alone').forEach(button => {
        button.addEventListener('click', () => {
            selectedScore = button.value;
        });
    });

    // Lägg till event listener på "Skicka" knappen
    document.getElementById('submitReviewAlone').addEventListener('click', () => {
        const imdbID = getImdbIDFromUrl();
        if (imdbID && selectedScore) {
            rateMovie(imdbID, selectedScore);
        } else {
            alert('Ett fel inträffade. Kontrollera att en film är vald och att ett betyg är satt.');
        }
    });
});

document.querySelectorAll('.rank-btn-alone').forEach(button => {
    button.addEventListener('click', () => {
        // Ta bort 'active' klassen från alla knappar
        document.querySelectorAll('.rank-btn-alone').forEach(b => b.classList.remove('active'));

        // Lägg till 'active' klassen på den klickade knappen
        button.classList.add('active');

        // Sätt betyget
        selectedScore = button.value;
    });
});


function getImdbIDFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('imdbID');
}

async function rateMovie(imdbID, score) {
    const apiUrl = "https://grupp6.dsvkurs.miun.se/api/movies/rate/" + imdbID + "/" + score;
    try {
        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'text/plain',
                // Lägg till andra headers om nödvändigt
            }
        });
        const data = await response.json();
        console.log("API Response:", data);
        if (data.imdbID) {
            alert("Ditt betyg har sparats!");
            document.getElementById('submitReviewAlone').disabled = true;
        } else {
            alert("Ett fel inträffade. Försök igen senare.");
        }
    } catch (error) {
        console.error("Det uppstod ett fel:", error);
        alert("Ett fel inträffade. Försök igen senare.");
    }
}


// När sidan laddas, hämta IMDB ID och visa detaljer
window.addEventListener('DOMContentLoaded', () => {
    const imdbID = getImdbIDFromUrl();
    if (imdbID) {
        fetchMovieDetailsDisplay(imdbID);
    }
});


// Denna del kan läggas till i slutet av din JavaScript-kod för att automatiskt hämta sökresultat när `sökresultat.html` laddas
var searchTerm = getSearchTermFromUrl();
if (searchTerm) {
    fetchMovies(searchTerm);
}