# MusicBox Documentation

## Table of Contents

* [Overview](#overview)
* [Features](#features)
* [Installation](#installation)
* [Usage](#usage)
* [API Documentation](#api-documentation)
* [Contributing](#contributing)
* [License](#license)

## Overview

MusicBox is a Spotify clone for local media. It allows users to manage their local music library, create playlists, and play their favorite songs.

## Features

### Media Library Management

MusicBox allows users to organize and manage their local music library with ease. Users can add, remove, and edit music files, as well as view album artwork and lyrics.

### Playlist Creation

Users can create and manage playlists for their favorite songs. Playlists can be created, edited, and deleted, and songs can be added or removed from playlists.

### Music Player

MusicBox includes a music player that allows users to play their local music files. The player includes controls for play, pause, and stop, as well as volume control.

### Search and Filter

Users can quickly search and filter their music library by artist, album, genre, and more.

### Album Artwork Display

MusicBox displays album artwork for music files.

### Lyrics Display

MusicBox displays lyrics for favorite songs.

## Installation

### Prerequisites

* Python 3.8+
* Flask 2.0+
* SQLite 3.32+

### Installation Steps

1. Clone the repository: `git clone https://github.com/your-username/MusicBox.git`
2. Install dependencies: `pip install -r requirements.txt`
3. Run the application: `flask run`

## Usage

### Example Use Cases

* Play a song: `flask play <song_id>`
* Create a playlist: `flask create_playlist <playlist_name>`
* Add a song to a playlist: `flask add_song_to_playlist <playlist_id> <song_id>`

### API Documentation

* [API Endpoints](https://github.com/your-username/MusicBox/blob/main/docs/api.md)

## Contributing

* Fork the repository and submit a pull request with your changes
* Report any issues or bugs on the [issue tracker](https://github.com/your-username/MusicBox/issues)

## License

* MIT License