#!/usr/bin/env node

const vo = require('vo'),
	fs = require('fs'),
	download = require('image-downloader'),
	nightmare = require('nightmare')({ show: false, executionTimeout: 3000 }),
	path = process.cwd() + '/download',
	searchTerm = process.argv[2],
	nImg = process.argv[3],
	imageUrl = [];


fs.mkdir('download', err => err? console.log('download folder exists') : console.log('download folder created'));

function getImages() {
	const images = Array.from(document.querySelectorAll('.item a img'));
	const img = [];
	for (let i = 0; i < images.length; i++) {
		img.push(images[i].src);
	}
	return img;
}

vo(run)(function(err, result) {
	if (err) throw err;
});

function* run() {

	let MAX_IMG =nImg;
		currentPage = 0,
		nextExists = true;

	yield nightmare
		.goto(`https://pixabay.com/images/search/${searchTerm}/`)
		.scrollTo(20368, 0)
		.wait(1000);

	nextExists = yield nightmare.exists('#content > div > a');

	while (nextExists && imageUrl.length <= MAX_IMG) {
		console.log('Fetching Images');
		yield nightmare
			.scrollTo(20368, 0)
			.wait(1000)
			.evaluate(getImages)
			.then(a => {
				const aFiltered = a.filter(word => word.includes('.jpg'));
				for (let i = 0; i < aFiltered.length; i++) {
					imageUrl.push(aFiltered[i]);
				}
			});

		yield nightmare.click('#content > div > a').wait('body');

		currentPage++;
		nextExists = yield nightmare.exists('#content > div > a');
	}

	console.table(imageUrl);
	yield nightmare.end();

	const options = {
		url: imageUrl,
		dest: path
	};

	for (const i of imageUrl) {
		options.url = i;
		download
			.image(options)
			.then(({ filename, image }) => {
				console.log('Saved to', filename);
			})
			.catch(err => console.error(err));
	}
}
