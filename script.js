/******w**************
    
    Assignment 4 Javascript
    Name: Jiale Cao
    Date: Jun 26
    Description: API

*********************/

document.addEventListener("DOMContentLoaded", (event) => {
    console.log("DOM fully loaded and parsed");

    var map = L.map('map').setView([49.885490, -97.144508], 12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);


    function handleResultClick(event) {
        const resultDiv = event.target.closest('.result');
        console.log('resu', resultDiv);
        if (resultDiv) {
            const name = resultDiv.querySelector('p:nth-child(1)').textContent.split(':')[1].trim();
            const location = resultDiv.querySelector('p:nth-child(2)').textContent.split(':')[1].trim();
            const position = resultDiv.querySelector('p:nth-child(6)').textContent.split(':')[1].trim().split(',');
            const polygon = resultDiv.querySelector('p:nth-child(7)').textContent.split('Polygon:')[1].trim();

            //clear all markers
            map.eachLayer(function (layer) {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            })

            //clear all polygons
            map.eachLayer(function (layer) {
                if (layer instanceof L.Polygon) {
                    map.removeLayer(layer);
                }
            })

            // Create a new marker and add it to the map
            L.marker(position).addTo(map)
                .bindPopup(`<b>${name}</b><br>${location}`)
                .openPopup();

            console.log('polygon', polygon, typeof polygon);

            // Add polygon to map
            const poly = JSON.parse(polygon);
            const bounds = poly.coordinates[0][0].map(coord => [coord[1], coord[0]]);
            console.log('bx', bounds);
            L.polygon(bounds, { color: 'red' }).addTo(map);

            map.fitBounds(bounds);

        }
    }

    document.getElementsByClassName('results')[0].addEventListener('click', handleResultClick);



    document.getElementById('search-form').addEventListener('submit', function (event) {
        event.preventDefault();

        const placeName = document.getElementById('place-name').value.trim();
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = ''; // Clear previous results

        if (!placeName) {
            resultsDiv.innerHTML = '<p>Please enter a place name.</p>';
            return;
        }

        const apiUrl = `https://data.winnipeg.ca/resource/tx3d-pfxq.json?$where=lower(park_name) LIKE lower('%${placeName}%')&$order=park_name&$limit=100`;
        const encodedURL = encodeURI(apiUrl);

        fetch(encodedURL)
            .then(response => response.json())
            .then(data => {
                if (data.length === 0) {
                    resultsDiv.innerHTML = '<p>No results</p>';
                    return;
                }

                data.forEach((place, index) => {
                    const div = document.createElement('div');
                    div.classList.add('result');
                    div.innerHTML = `
                        <p><strong>Name:</strong> ${place.park_name}</p>
                        <p><strong>Location:</strong> ${place.location_description}</p>
                        <p><strong>Category:</strong> ${place.park_category}</p>
                        <p><strong>Neighbourhood:</strong> ${place.neighbourhood}</p>
                        <p><strong>District:</strong> ${place.district}</p>
                        <p><strong>Position:</strong> ${place.location.latitude}, ${place.location.longitude}</p>
                        <p style='display:none'><strong>Polygon:</strong> ${JSON.stringify(place.polygon)}</p>
                    `;
                    resultsDiv.appendChild(div);


                    div.addEventListener('click', function() {
                        document.querySelectorAll('.result').forEach(result => result.classList.remove('active'));
                        div.classList.add('active');
                      });

                      if(index == 0){
                        div.click();
                      }
                });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                resultsDiv.innerHTML = '<p>An error occurred while fetching data. Please try again later.</p>';
            });
    });
});


