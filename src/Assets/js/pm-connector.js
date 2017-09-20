"use strict";
define(["jquery", "helper"], function (jq, helper) {
    function PmConnector(webServiceAdress) {
//         console.log("PmConnector");
        var self = this;
        self.jq = jq;
        self.helper = new helper();
        //self.webServiceAdress = webServiceAdress || "https://pedalconnectorws.ppm.nu";
        self.webServiceAdress = webServiceAdress || "https://pedalconnectorwsg.ppm.nu";
        //self.webServiceAdress = webServiceAdress || "http://localhost:3002";

        self.logServiceUsage = function (appId) {
//             console.log("logServiceUsage()");
            var defered = jq.Deferred();
            jQuery.support.cors = true;
            var jqxhr = jQuery.ajax({
                type: "GET",
                url: self.webServiceAdress + "/api/Sql/LogServiceUsage?appId=" + encodeURIComponent(appId),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                xhrFields: {
                    'withCredentials': true //Tell browser to provide credentials (from: http://giix.nl/2015/03/10/cross-origin-resource-sharing-cors-and-kerberos-webserver-auth/)
                },
            }).done(function (data, textStatus, jqXHR) {
                //console.log("getQueries() - success");
                defered.resolve(data);
            }).fail(function (jqXHR, textStatus, errorThrown) {
                alert("Error logServiceUsage: " + jqXHR.statusText + "\n" + jqXHR.responseText);
                console.error("Error logServiceUsage: " + jqXHR.statusText + "\n" + jqXHR.responseText);
                defered.fail(textStatus, jqXHR);
            });

            return defered.promise();
        };
        

        self.getQueries = function () {
            console.log("getQueries()");
            var defered = jq.Deferred();
            jQuery.support.cors = true;
            var jqxhr = jQuery.ajax({
                type: "GET",
                url: self.webServiceAdress + "/api/Sql/GetQueries",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                xhrFields: {
                    'withCredentials': true //Tell browser to provide credentials (from: http://giix.nl/2015/03/10/cross-origin-resource-sharing-cors-and-kerberos-webserver-auth/)
                },
            }).done(function (data, textStatus, jqXHR) {
                //console.log("getQueries() - success");
                defered.resolve(data);
            }).fail(function (jqXHR, textStatus, errorThrown) {
                alert("Error getQueries: " + jqXHR.statusText + "\n" + jqXHR.responseText);
                console.error("Error getQueries: " + jqXHR.statusText + "\n" + jqXHR.responseText);
                defered.fail(textStatus, jqXHR);
            });

            return defered.promise();
        };

        self.runQuery = function (queryId) {
            console.log("runQuery()");
            var defered = jq.Deferred();
            jQuery.support.cors = true;
            var jqxhr = jQuery.ajax({
                type: "GET",
                url: self.webServiceAdress + "/api/Sql/RunQuery?queryId=" + queryId,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                xhrFields: {
                    'withCredentials': true //Tell browser to provide credentials (from: http://giix.nl/2015/03/10/cross-origin-resource-sharing-cors-and-kerberos-webserver-auth/)
                },
            }).done(function (data, textStatus, jqXHR) {
                //console.log("runQuery() - success");
                defered.resolve(data);
            }).fail(function (jqXHR, textStatus, errorThrown) {
                alert("Error in getQueries: " + jqXHR.statusText + "\n" + jqXHR.responseText);
                console.error("Error in getQueries: " + jqXHR.statusText + "\n" + jqXHR.responseText);
                defered.fail(textStatus, jqXHR);
            });

            return defered.promise();
        };

        self.getTable = function (database, table) {
            //console.log("getTable()");
            var defered = jq.Deferred();
            jQuery.support.cors = true;
            var jqxhr = jQuery.ajax({
                type: "GET",
                url: self.webServiceAdress + "/api/Sql/GetTable?database=" + database + "&table=" + table,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                xhrFields: {
                    'withCredentials': true //Tell browser to provide credentials (from: http://giix.nl/2015/03/10/cross-origin-resource-sharing-cors-and-kerberos-webserver-auth/)
                },
            }).done(function (data, textStatus, jqXHR) {
                //console.log("getQueries() - success");
                defered.resolve(data);
            }).fail(function (jqXHR, textStatus, errorThrown) {
                alert("Error in getTable: " + jqXHR.statusText + "\n" + jqXHR.responseText);
                console.error("Error in getTable: " + jqXHR.statusText + "\n" + jqXHR.responseText);
                defered.fail(textStatus, jqXHR);
            });

            return defered.promise();
        };

        self.runMdxQuery = function (server, database, query) {
            //console.log("runMdxQuery() - getBrowserInfo() = " + JSON.stringify(self.helper.getBrowserInfo()) + ", query.length = " + query.length);
            var defered = jq.Deferred();

            // IE has a maximun query string lenght of ~1024, so check if we must put the query in the data section and make a post
            var browserInfo = self.helper.getBrowserInfo();
            var url = self.webServiceAdress + "/api/Ssas/RunMdxQuery2?server=" + server + "&database=" + database + "&query=" + encodeURIComponent(query)
            var doPostInsteadOfGet = (browserInfo.name === 'IE' || browserInfo.name === "MSIE") && url.length > 1024 ? true : false;
//             console.log("runMdxQuery() - getBrowserInfo() = " + JSON.stringify(self.helper.getBrowserInfo()) + ", url.length = " + url.length + ", doPostInsteadOfGet = " + doPostInsteadOfGet);


            if (!doPostInsteadOfGet) {
                // GET request
                jq.support.cors = true;
                var jqxhr = jq.ajax({
                    type: "GET",
                    url: self.webServiceAdress + "/api/Ssas/RunMdxQuery?server=" + server + "&database=" + database + "&query=" + encodeURIComponent(query),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    xhrFields: {
                        'withCredentials': true //Tell browser to provide credentials (from: http://giix.nl/2015/03/10/cross-origin-resource-sharing-cors-and-kerberos-webserver-auth/)
                    },
                }).done(function (data, textStatus, jqXHR) {
                    //console.log("runMdxQuery() - GET - success");
                    defered.resolve(data);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    alert("Error in runMdxQuery (GET): " + jqXHR.statusText + "\n" + jqXHR.responseText);
                    console.error("Error in runMdxQuery (GET): " + jqXHR.statusText + "\n" + jqXHR.responseText);
                    defered.fail(textStatus, jqXHR);
                });
            }
            else {
                // POST request
                jq.support.cors = true;
                var jqxhr = jq.ajax({
                    type: "POST",
                    url: self.webServiceAdress + "/api/Ssas/RunMdxQuery?server=" + server + "&database=" + database + "&query=" + "",
                    contentType: "application/json; charset=utf-8",
                    processData: false,
                    data: query,
                    dataType: "json",
                    xhrFields: {
                        'withCredentials': true //Tell browser to provide credentials (from: http://giix.nl/2015/03/10/cross-origin-resource-sharing-cors-and-kerberos-webserver-auth/)
                    },
                }).done(function (data, textStatus, jqXHR) {
                    //console.log("runMdxQuery() - POST - success");
                    defered.resolve(data);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    alert("Error in runMdxQuery (POST): " + jqXHR.statusText + "\n" + jqXHR.responseText);
                    console.error("Error in runMdxQuery (POST): " + jqXHR.statusText + "\n" + jqXHR.responseText);
                    defered.fail(textStatus, jqXHR);
                });
            }

            return defered.promise();
        };

        self.getFile = function (fileName) {
            //console.log("getFile()");
            var defered = jq.Deferred();
            jQuery.support.cors = true;
            var jqxhr = jQuery.ajax({
                type: "GET",
                url: self.webServiceAdress + "/api/File/GetFile?fileName=" + fileName,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                xhrFields: {
                    'withCredentials': true //Tell browser to provide credentials (from: http://giix.nl/2015/03/10/cross-origin-resource-sharing-cors-and-kerberos-webserver-auth/)
                },
            }).done(function (data, textStatus, jqXHR) {
                //console.log("getQueries() - success");
                defered.resolve(data);
            }).fail(function (jqXHR, textStatus, errorThrown) {
                alert("Error in getFile: " + jqXHR.statusText + "\n" + jqXHR.responseText);
                console.error("Error in getFile: " + jqXHR.statusText + "\n" + jqXHR.responseText);
                defered.fail(textStatus, jqXHR);
            });

            return defered.promise();
        };

    }

    return PmConnector;
});


