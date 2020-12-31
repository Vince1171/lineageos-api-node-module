"use strict";

/*
 * Copyright (C) 2017-2020 UBports Foundation <info@ubports.com>
 * Copyright (C) 2017-2018 Marius Gripsgard <marius@ubports.com>
 * Copyright (C) 2017-2020 Jan Sprinz <neo@neothethird.de>
 * Copyright (C) 2020-2020 Vincent Franchomme <franchomme.vincent@gmail.com>

 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


const axios = require("axios");

const time = () => Math.floor(new Date() / 1000);

const DEFAULT_HOST = "https://download.lineageos.org/api/v1/";
const DEFAULT_DEVICE_LIST = "https://raw.githubusercontent.com/LineageOS/hudson/master/updater/devices.json";
const DEFAULT_CACHE_TIME = 180; // 3 minutes



class Client {

    /**
   * @constructs Client
   * @param {Object} options
   */
    constructor(options) {
        this.host = DEFAULT_HOST;
        this.devicesListURL = DEFAULT_DEVICE_LIST;
        this.devicesListCache = { expire: 0 };

        // accept options
        if (options) {
            if (options.host) {
                // validate URL
                if (
                    options.host.match(
                        /https?:\/\/(www\.)?[-a-z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-z0-9@:%_\+.~#?&//=]*)/i
                    )
                ) {
                    // ensure https
                    if (!options.allow_insecure && options.host.includes("http://")) {
                        throw new Error(
                            "Insecure URL! Call with allow_insecure to ignore."
                        );
                    }
                    // ensure trailing slash
                    this.host = options.host + (options.host.slice(-1) != "/" ? "/" : "");
                } else {
                    throw new Error("Host is not a valid URL!");
                }
            }
            if (options.devicesListURL) {
                this.devicesListURL = options.devicesListURL;
              }
        }
    }


    /**
   * Function to retrieve the data from cache, if index is expired information is retrieved from a HTTP call
   * @returns {Promise} - A promise that resolves with the current data
   */
    getDevicesList() {
        const _this = this;
        return new Promise(function (resolve, reject) {
            var now = time();
            if (_this.devicesListCache && _this.devicesListCache.expire > now) {
                resolve(_this.devicesListCache.data);
            } else {
                axios
                    .get(`${_this.devicesListURL}`)
                    .then(response => {
                        _this.devicesListCache.data = response.data;
                        _this.devicesListCache.expire = time() + _this.cache_time;
                        resolve(_this.devicesListCache.data);
                    })
                    .catch(reject);
            }
        });
    }

    /**
     * check if given device is officially supported by LineageOS
     * @param {String} deviceCodename 
     * @returns {Promise} - A promise that resolves with the info of the device like
     * { 
     *  model: 'guacamoleb',
     *  oem: 'OnePlus',
     *  name: '7',
     *  lineage_recovery: true //Optionnal
     * }
     */
    isDeviceSupported(deviceCodename){
        return this.getDevicesList().then(_devicesList => {
            var deviceInfo = _devicesList.find( device => device['model'] === deviceCodename );
            if (deviceInfo === undefined){
                throw new Error(
                    `Device ${deviceCodename} is not officially supported by LineageOS`
                  );
            }
            return deviceInfo;
        });
    }

}
module.exports = Client;
