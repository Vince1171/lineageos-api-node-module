# LineageOS download API node module

## Client
Access download server like

Example:

```javascript


const LineageOSDownloadAPIClient = require("./src/module.js").Client;

const client = new LineageOSDownloadAPIClient();

client.getDevicesList().then(_devices => {
    console.log(_devices);
});
client.isDeviceSupported("guacamoleb").then(dev => console.log(dev));
```

The constructor takes an object with optional properties as an argument. The default properties are listed below.

```javascript
{
  host: "https://download.lineageos.org/api/v1/", // URL of the download api server
  devicesListURL : "https://raw.githubusercontent.com/LineageOS/hudson/master/updater/devices.json" // URL to a JSON with the list of the supported devices
}
```

## Server
Maintain a system-image server backend (not implemented)
