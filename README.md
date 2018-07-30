* Not using Docker 

+ Install all packages in package.json

npm i

Run app

npm start

// Visit this URL to see app

http://localhost:8000

* Using Docker
// Build image reference to Dockerfile
docker build -t csv-transformer .

// Run image on port 8000
docker run -d --rm -p 8000:8000 csv-transformer

// If you want to stop image
docker stop csv-transformer
