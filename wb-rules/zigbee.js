var zigbee_manager = require("zigbee");

zigbee_manager.start({
	id: "zigbee_home",
	title: "ZigBee (Home)",
  base_topic: "zigbee2mqtt",

	devices: [

    //  smoke  //
    {
      name: "home_smoke_1",
      parameters: [ "linkquality", "battery", "voltage", "smoke_density", "smoke", ]
    },

    //  motion  //
    {
      name: "home_motion_1",
      parameters: [ "linkquality", "battery", "voltage", "illuminance", "illuminance_lux", "occupancy", ]
    },

    //  reed  //
    {
      name: "home_door_reed_1",
      parameters: [ "linkquality", "battery", "voltage", "contact", ]
    },

    //  flood  //
    {
      name: "home_water_leak_1",
      parameters: [ "linkquality", "battery", "voltage", "water_leak", ]
    },

    //  temperature  //
    {
      name: "home_temp_humid_1",
      parameters: [ "linkquality", "battery", "voltage", "temperature", "humidity", "pressure", ]
    },
  ]
});
