# Install EventStore from custom Chocolatey package on MyGet
choco install eventstore -source https://www.myget.org/F/versionone/ -force

# Set up the default configuration to use
sc "C:\Program Files\eventstore\config.yml" "Db: C:\Program Files\eventstore\Data`nLog: C:\Program Files\eventstore\Log`nRunProjections: ALL"

# Turn EventStore into a Windows service with that obeys the above configuration settings
nssm install eventstore "C:\Program Files\eventstore\EventStore.ClusterNode.exe" --config C:\PROGRA~1\eventstore\config.yml
nssm start eventstore

# Start your engines
cd src/app
npm install
start npm start
