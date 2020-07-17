ZigBee manager

##  Preparation

- Connect your device to the internet
- Connect to device by any SSH client

Install [NodeJS](https://nodejs.org), if it is not yet
```
curl -sL https://deb.nodesource.com/setup_12.x | bash -
apt-get install -y nodejs git make g++ gcc build-essential
```

##  Prepare [mqtt proxy](https://www.npmjs.com/package/wirenboard-mqtt-proxy)

Install wirenboard-mqtt-proxy to global space
```
npm i -g wirenboard-mqtt-proxy
```

Start the proxy
```
wirenboard-mqtt-proxy start
```

To enable proxy autorun on boot use it
```
wirenboard-mqtt-proxy enable
```

##  Prepare [zigbee2mqtt](https://www.zigbee2mqtt.io/getting_started/running_zigbee2mqtt.html)

Install zigbee2mqtt
```
git clone https://github.com/Koenkk/zigbee2mqtt.git /opt/zigbee2mqtt
chown -R root:root /opt/zigbee2mqtt
cd /opt/zigbee2mqtt
npm ci
```

Create daemon for autostart on boot OS
```
nano /etc/systemd/system/zigbee2mqtt.service
```

And add following
```
[Unit]
Description=zigbee2mqtt
After=network.target

[Service]
ExecStart=/usr/bin/npm start
WorkingDirectory=/opt/zigbee2mqtt
StandardOutput=inherit
StandardError=inherit
Restart=always
User=root

[Install]
WantedBy=multi-user.target
```

Enable daemon
```
systemctl enable zigbee2mqtt
```

Start daemon
```
systemctl start zigbee2mqtt
```

Configure zigbee2mqtt
```
nano /opt/zigbee2mqtt/data/configuration.yaml
```

To get data by value set parameters
```
experimental:
  output: 'attribute_and_json'
```

##  Install module

To install this packet use [wirenboard-module](https://www.npmjs.com/package/wirenboard-module) command. Install it if necessary
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

##  Notice

- module tested on wirenboard firmware [0.46-20190613](https://github.com/wirenboard/wirenboard/releases/tag/0.46-20190613)

----

Best regards
- **FullHouse team**
- https://fullhouse-online.ru
- support@fullhouse-online.ru
