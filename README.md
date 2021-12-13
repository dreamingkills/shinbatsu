# shinbatsu

scrobble your played osu! beatmaps to last.fm!

## Features

- updates your last.fm "now playing" when you play a beatmap or watch a replay
- scrobbles the song upon beatmap or replay completion
- automatically removes `(TV Size)`, etc. from song titles
- tries to retrieve album from last.fm data

## Installation

you will need [gosumemory](https://github.com/l3lackShark/gosumemory) to run this script.

1. download the [latest shinbatsu release](https://github.com/dreamingkills/shinbatsu/releases/latest)
2. move the executable to a folder only occupied by the executable file
3. launch osu! and `gosumemory`
4. run the executable and follow the instructions on screen

enjoy!

## Contact

you can find me on [twitter](https://twitter.com/aeoneko) or on discord at `ae#2222`.

## FAQ

Q: **can i use this in a gosumemory frontend?**<br>
A: not currently, but it's being worked on.

Q: **help! it's scrobbling with incorrect metadata!**<br>
A: shinbatsu does its best to determine metadata from both osu! and last.fm. you can correct your scrobbles with [last.fm pro](https://www.last.fm/pro) or open an issue if it's particularly bad.
