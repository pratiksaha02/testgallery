window.onload = function() {
    // Fetch photos from the server and display them in the gallery
    fetch("/photos")
        .then(response => response.json())
        .then(photos => {
            const gallery = document.getElementById("gallery");
            photos.forEach(photo => {
                const img = document.createElement("img");
                img.src = photo.imageUrl;
                img.alt = photo.title;
                img.className = "photo";
                gallery.appendChild(img);
            });
        })
        .catch(err => console.error("Error fetching photos:", err));
};
