const { GoogleSpreadsheet } = require("google-spreadsheet");

var GoatTelemetry = {};

module.exports = GoatTelemetry;

(function () {
    var isInitialized = false;
    var telemetryServerId = undefined;
    var telemetryServerStartTime = undefined;
    var sheet = undefined;

    GoatTelemetry.Initialize = async function (telemetryInfo, serverDetails) {
        if (
            !telemetryInfo ||
            !telemetryInfo.telemetryEmail ||
            !telemetryInfo.telemetryPrivateKey ||
            !telemetryInfo.telemetrySheetName
        ) {
            console.log("Telemetry disabled. Environment variables not set");
            return;
        }

        telemetryServerId = serverDetails.serverId;
        telemetryServerStartTime = serverDetails.serverStartTime;

        try {
            doc = new GoogleSpreadsheet(telemetryInfo.telemetrySheetName);
            await doc.useServiceAccountAuth({
                client_email: telemetryInfo.telemetryEmail,
                private_key: telemetryInfo.telemetryPrivateKey,
            });

            await doc.loadInfo(); // loads document properties and worksheets
            console.log(`Writing telemetry data to: ${doc.title}`);

            sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id]
            isInitialized = true;

            GoatTelemetry.ReportEvent(
                "server-start",
                "utc-time",
                telemetryServerStartTime.toUTCString(),
                "server-region",
                serverDetails.serverRegion
            );
        } catch (error) {
            console.log(
                "Telemetry disabled. Error connecting to google sheets"
            );
        }
    };

    GoatTelemetry.ReportEvent = async function (
        eventName,
        paramName1,
        paramValue1,
        paramName2,
        paramValue2,
        paramName3,
        paramValue3
    ) {
        if (!isInitialized) {
            return;
        }

        const newRow = {
            server_id: telemetryServerId,
            game_time: new Date() - telemetryServerStartTime,
            event: eventName,
            param_name1: paramName1,
            param_value1: paramValue1,
            param_name2: paramName2,
            param_value2: paramValue2,
            param_name3: paramName3,
            param_value3: paramValue3,
        };

        await sheet.addRow(newRow);
    };
})();
