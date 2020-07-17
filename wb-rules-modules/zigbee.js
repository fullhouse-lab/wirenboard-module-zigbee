var MODULE_NAME 		= "zigbee";
var MODULE_VERSION  = "1.4.0";

// {"version":"1.14.0","commit":"9009de2","coordinator":{"type":"zStack12","meta":{"transportrev":2,"product":0,"majorrel":2,"minorrel":6,"maintrel":3,"revision":20190608}},"log_level":"info","permit_join":false}

// {
//   "task": "add",
//   "from": "bathhouse/bridge/config2",
//   "to":   "/devices/test22/controls/test1/on2",
//   "child": "permit_join"
// }

exports.start = function(config) {
	if (!validateConfig(config)) return;

	//  device  //
	createDevice(config);

	//  proxy  //
	setProxy(config.id, config.devices, config.base_topic);

	//  rules  //
	config.devices.forEach(function (item) {
		createRule_device_lastseen(item.name);
	});
	createRule_permit_join_state(config.id);
	createRule_permit_join(config.id, config.base_topic);

	//  intervals  //
	createInterval_checkLastSeen(config.id, config.devices)

  log(config.id + ": Started (" + MODULE_NAME + " ver. " + MODULE_VERSION + ")");
};

//  Validate config  //

var validateConfig = function(_config) {
  if (!_config) {
    log("Error: " + MODULE_NAME + ": No config");
    return false;
  }

  if (!_config.id || !_config.id.length) {
    log("Error: " + MODULE_NAME + ": Config: Bad id");
    return false;
  }

  if (!_config.title || !_config.title.length) {
    log("Error: " + MODULE_NAME + ": Config: Bad title");
    return false;
  }

	// TODO: Add linkquality if no in configuration

  return true;
}

//
//  Device  //
//

function createDevice(config) {
  config.devices.forEach(function (device) {
    var cells = {};

    if (device.ieeeAddr) {
      cells.ieeeAddr = { type: "text", 	value: device.ieeeAddr, forceDefault: true, readonly: false };
    }

		cells["lastseen"] = 	 { type: "text", 	value: "none", forceDefault: true, readonly: false };
		cells["lastseen_ts"] = { type: "text", 	value: "0", forceDefault: true, readonly: false };

    device.parameters.forEach(function (parameter) {
      cells[parameter] = { type: "text", 	value: "", forceDefault: true, readonly: false };
    });

    defineVirtualDevice(device.name, {
      title: device.name,
      cells: cells
    });
  });

  //  created virtual device called "zb"  //
  defineVirtualDevice(config.id, {
    title: config.title,
    cells: {
      proxy_connected: 	{ type: "value", 	value: 0, 				forceDefault: true, readonly: false },
      status: 					{ type: "text", 	value: "offline", forceDefault: true, readonly: false },

			permit_join_state:{ type: "text", 	value: "off", forceDefault: true, readonly: false },
      permit_join: 			{ type: "switch", value: false, readonly: false },
    }
  });
}

function createTask(task, from, to, child) {
	if (child) {
		return '{ "task": "' + task + '", "from": "' + from + '", "to": "' + to + '", "child": "' + child + '" }'
	} else {
		return '{ "task": "' + task + '", "from": "' + from + '", "to": "' + to + '" }'
	}
}

function setProxy(device_id, devices, base_topic) {
	setInterval(function(){

		//  check switches  //
		// if (dev[device_id]["permit_join_state"] == "false"
		// && dev[device_id]["permit_join"] != false) {
		// 	dev[device_id]["permit_join"] = false;
		// }
		// if (dev[device_id]["permit_join_state"] == "true"
		// && dev[device_id]["permit_join"] != true) {
		// 	dev[device_id]["permit_join"] = true;
		// }

		//  wait service started  //
		if (dev["mqtt-proxy"]["connected"] !== 1) return;

		//  set topics  //
		if (dev[device_id]["proxy_connected"] !== 1) {
			dev[device_id]["proxy_connected"] = 1;
			log(device_id + ": Connected to proxy");

			// zigbee2mqtt/bridge/state
			dev["mqtt-proxy"]["config"] = createTask(
				"add",
				base_topic + "/bridge/state",
				"/devices/" + device_id + "/controls/status/on"
			);

			// zigbee2mqtt/bridge/config: permit_join
			dev["mqtt-proxy"]["config"] = createTask(
				"add",
				base_topic + "/bridge/config",
				"/devices/" + device_id + "/controls/permit_join_state/on",
				"permit_join"
			);

      devices.forEach(function (device) {
        var addr = device.name;
        if (device.ieeeAddr) addr = device.ieeeAddr;

        device.parameters.forEach(function (parameter) {
					dev["mqtt-proxy"]["config"] = createTask(
						"add",
						base_topic + '/' + addr + '/' + parameter,
						'/devices/' + device.name + '/controls/' + parameter + '/on'
					);
        });
      });
		}
	}, 1000);
}

//
//  Rules  //
//

function createRule_device_lastseen(device_id) {
	defineRule({
    whenChanged: device_id + "/linkquality",
    then: function (newValue, devName, cellName) {
			dev[device_id]['lastseen_ts'] = Math.floor(Date.now() / 1000).toString()
		}
	});
}

function createRule_permit_join_state(device_id) {
	defineRule({
    whenChanged: device_id + "/permit_join_state",
    then: function (newValue, devName, cellName) {
			if (newValue == "true") {
				if (dev[device_id]["permit_join"] != true) dev[device_id]["permit_join"] = true;
			}
			if (newValue == "false") {
				if (dev[device_id]["permit_join"] != false) dev[device_id]["permit_join"] = false;
			}
		}
	});
}

function createRule_permit_join(device_id, base_topic) {
	defineRule({
    whenChanged: device_id + "/permit_join",
    then: function (newValue, devName, cellName) {
			if (newValue) {
				if (dev[device_id]["permit_join_state"] == "true") return
				log(device_id + ": permit_join: TRUE");
				publish(base_topic + '/bridge/config/permit_join/set', "true");
			} else {
				if (dev[device_id]["permit_join_state"] == "false") return
				log(device_id + ": permit_join: FALSE");
				publish(base_topic + '/bridge/config/permit_join/set', "false");
			}
		}
	});
}

//
//  Intervals  //
//

function createInterval_checkLastSeen(device_id, devices) {
	setInterval(function(){
		//  check connected  //
		if (dev[device_id]["proxy_connected"] !== 1) return;

		var currentTS = Math.floor(Date.now() / 1000).toString()

    devices.forEach(function (device) {
			if (dev[device.name]["lastseen_ts"] === '0') return;

			var delta_sec = currentTS - parseInt(dev[device.name]["lastseen_ts"])
			dev[device.name]["lastseen"] = formatTime(delta_sec)
    });
	}, 20000);
}

//
//  Helpers  //
//

var formatTime = function (delta) {
    //  seconds  //
    if (delta < 60) {
      return delta.toString() + ' s';
    }

    //  minutes  //
    else if (delta < 60 * 60) {
      return Math.floor(delta / 60).toString() + ' min'
    }

    //  hours  //
    else if (delta < 24 * 60 * 60) {
      return Math.floor(delta / (60 * 60)).toString() + ' hours'
    }

    //  days  //
    else {
      return Math.floor(delta / (24 * 60 * 60)).toString() + ' days'
    }
  }
