# shinbatsu

scrobble your osu! beatmaps to last.fm!

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

Q: **help! it's not scrobbling with an album name!**<br>
A: osu! does not provide album metadata. you can edit the scrobbles yourself and set it to edit automatically with last.fm pro.

Q: **what if the beatmap is TV Size?**<br>
A: shinbatsu will automatically parse out `(TV Size)`, `(Cut Ver.)`, and `(Sped Up Ver.)` and their variations from song titles. feel free to submit a PR to remove other tags.
