"use strict";
define([], function () {
    function PmConfig() {
        var self = this;
        // console.log("PmConfig");
        //self.webServiceAdress = "http://localhost:3002"; // Development
        self.webServiceAdress = "https://pedalconnectorwsg.ppm.nu"; // Test (G)
        //self.webServiceAdress = "https://pedalconnectorws.ppm.nu"; // Production (P)
        self.defaultSsasServer = "gstasql1a-aag";

    }

    return PmConfig;
});