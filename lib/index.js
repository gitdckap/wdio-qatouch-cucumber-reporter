let WDIOReporter = require('@wdio/reporter').default;
let QaTouch = require('./qatouch');

class QaTouchReporter extends WDIOReporter {
    /**
     * QaTouchReporter Constructor
     *
     * @param config
     */
    constructor(config) {
        config = Object.assign(config, { stdout: true })
        super(config)
        const options = config.qaTouchOptions;

        this._results = [];
        this._passes = 0;
        this._fails = 0;
        this._untested = 0;
        this._out = [];
        this.qaTouch = new QaTouch(options);
    }

    /**
     * Event handler for test pass
     *
     * @param test
     */
    onTestPass(test) {
        this._passes++;
        this._out.push(test.fullTitle + ': pass');
        let status_id = this.qaTouch.statusConfig('Passed');
        let caseIds = this.qaTouch.TitleToCaseIds(test.fullTitle);
        if (caseIds.length > 0) {
            let results = caseIds.map(caseId => {
                return {
                    case_id: caseId,
                    status_id: status_id,
                };
            });
            this._results.push(...results);
        }
    }

    /**
     * Event handler for test skip
     *
     * @param test
     */
    onTestSkip(test) {
        this._untested++;
        this._out.push(test.fullTitle + ': untested');
        let status_id = this.qaTouch.statusConfig('Untested');
        let caseIds = this.qaTouch.TitleToCaseIds(test.fullTitle);
        if (caseIds.length > 0) {
            let results = caseIds.map(caseId => {
                return {
                    case_id: caseId,
                    status_id: status_id,
                };
            });
            this._results.push(...results);
        }
    }

    /**
     * Event handler for test fail
     *
     * @param test
     */
    onTestFail(test) {
        this._fails++;
        this._out.push(test.fullTitle + ': failed');
        let status_id = this.qaTouch.statusConfig('Failed');
        let caseIds = this.qaTouch.TitleToCaseIds(test.fullTitle);
        if (caseIds.length > 0) {
            let results = caseIds.map(caseId => {
                return {
                    case_id: caseId,
                    status_id: status_id,
                };
            });
            this._results.push(...results);
        }
    }

    /**
     * Event handler for test end
     *
     * @param test
     */
    onTestEnd(test) {
        if (this._results.length === 0) {
            console.warn("No test cases were matched. Ensure that your tests are declared correctly and matches TRxxx");
            return;
        }
        this.qaTouch.publish(this._results);
    }

    onRunnerEnd() {
        if (this._results.length === 0) {
            console.warn("No test cases were matched. Ensure that your tests are declared correctly and matches TRxxx");
            return;
        }
        this.qaTouch.publish(this._results);
    }


}

// webdriver requires class to have reporterName option
QaTouchReporter.reporterName = 'WebDriver.io Qa Touch reporter';

module.exports = QaTouchReporter;
