SCRIPT_HOME=`pwd`
./node_modules/.bin/babel --stage 1 smoke-test/instance-support.tests.js --out-file smoke-test/isp.67.js
cd /c/Program\ files/eventstore
./EventStore.ClusterNode.exe --mem-db --run-projections=all &
sleep 15
cd $SCRIPT_HOME
source ./smoke-test.vars.sh
npm start &
./projections-enable.sh
sleep 10
npm run spike67