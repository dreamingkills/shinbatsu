# shinbatsu

scrobble your osu! beatmaps to last.fm!

## Installation

you will need [gosumemory](https://github.com/l3lackShark/gosumemory), [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git), [nodejs](https://nodejs.org/en/download/) and [yarn](https://classic.yarnpkg.com/en/docs/getting-started) to run this script.

1. launch osu! and `gosumemory`
2. clone the repository into a folder of your choice
3. run `yarn` to install dependencies
4. run `yarn tsc` to compile the project
5. run `yarn start` and follow the instructions displayed

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
