ZigBee manager

##  Preparation

Please connect your device to the internet

Install NodeJS, if it is not yet
```
curl -sL https://deb.nodesource.com/setup_12.x | bash -
apt-get install -y nodejs git make g++ gcc build-essential
```

##  Install

To install this packet use `wirenboard-module` command. Install it if necessary
```
npm i -g wirenboard-module
```

Add zigbee module and rule
```
wirenboard-module zigbee
```

##  TODO

- add lastseen from zigbee2mqtt
- add controls: relays, outlets, ..

----

Best regards
- **FullHouse team**
- https://fullhouse-online.ru
- support@fullhouse-online.ru
