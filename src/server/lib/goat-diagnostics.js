var GoatDiagnostics = {};

module.exports = GoatDiagnostics;

(function () {
    GoatDiagnostics.PerfCounter = function () {
        this._numberOfRecords = 0;
        this._totalTime = 0;

        this._isRunning = false;
        this._monitorStartTime;

        this._AddRecord = function (interval) {
            this._totalTime += interval;
            ++this._numberOfRecords;
        };

        this.Start = function () {
            this._monitorStartTime = new Date();
            this._isRunning = true;
        };

        this.Stop = function () {
            if (this._isRunning) {
                var endTime = new Date();
                this._AddRecord(endTime - this._monitorStartTime);
            }

            this._isRunning = false;
        };

        this.GetAverageTime = function () {
            return this._numberOfRecords > 0
                ? this._totalTime / this._numberOfRecords
                : NaN;
        };

        this.GetNumberOfRecords = function () {
            return this._numberOfRecords;
        };

        this.Clear = function () {
            this._numberOfRecords = 0;
            this._totalTime = 0;
        };
    };
})();
