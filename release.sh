# v0
if [ "$1" == "" ]; then
    echo "Version branch required as first argument."
    exit
fi

# 0.0.0
if [ "$2" == "" ]; then
    echo "Next version required as second argument."
    exit
fi

# Remove all deps to make rebasing easier
rm -rf ./node_modules

# Checkout branch
git checkout "$1"

# Rebase off master
git rebase -i master

# Install deps
yarn install

# Build files
yarn run build

# Only install prod deps
yarn workspaces focus --all --production

# Add files to git
git add -f ./lib ./node_modules

# Commit modules
git commit -m "Update $1 for v$2"

# Tag new version
git tag -fa "v$2" -m "v$2"

# Push changes
git push origin "$1" -f
