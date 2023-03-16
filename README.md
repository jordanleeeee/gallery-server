# Gallery Server

a simple nice look image viewer for local image

## build and run
```bash
git clone git@github.com:jordanleeeee/gallery-server.git
cd gallery-server
pnpm install
pnpm build

# add alias to .bashrc (or whatever config file)
alias gallery-server='alias gallery-server="$(pwd)/node_modules/.bin/next start $(pwd)"' # replace $(pwd) with your current location
source .bashrc
```

then you can run the gallery server anywhere using the command `gallery-server`
