# deploy the Gene Trends app

cd ui/app
npm run build
cd ../../
rm -rf docs
mv ./ui/app/build ./docs
cd docs
cp index.html 404.html
