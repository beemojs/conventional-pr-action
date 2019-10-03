if [ "$1" == "" ]; then
    echo "Version branch required as first argument."
    exit
fi

if [ "$2" == "" ]; then
    echo "Next version required as second argument."
    exit
fi

# Checkout branch
git checkout "$1"

# Remove all deps
rm -rf ./node_modules

# Only install prod deps
yarn install --production

# Add modules to git
git add -f ./node_modules

# Tag new version
git tag -fa "v$2" -m "v$2"

# Push changes
git push origin "$1"
