const request = require("sync-request");

/**
 * QaTouch basic API wrapper
 */
class QaTouch {

    /**
     * QaTouch constructor
     *
     * @param options
     */
    constructor(options) {
        this._validate(options, 'domain');
        this._validate(options, 'apiToken');
        this._validate(options, 'projectKey');
        this._validate(options, 'testRunId');

        // compute base url
        this.options = options;
        this.base = 'https://api.qatouch.com/api/v1/';
    }


    /**
     * Validate config values
     *
     * @param options
     * @param name
     * @private
     */
    _validate(options, name) {
        if (options == null) {
            throw new Error("Missing QA Touch options in wdio.conf");
        }
        if (options[name] == null) {
            throw new Error(`Missing ${name} value. Please update QA Touch option in wdio.conf`);
        }
    }

    /**
     * Form the url for api
     *
     * @param path
     * @returns {string}
     * @private
     */
    _url(path) {
        return `${this.base}${path}`;
    }

    /**
     * Post request formation
     *
     * @param api
     * @param body
     * @param error
     * @returns {*}
     * @private
     */
    _post(api, body, error = undefined) {
        return this._request("POST", api, body, error);
    }

    /**
     * get request formation
     *
     * @param api
     * @param error
     * @returns {*}
     * @private
     */
    _get(api, error = undefined) {
        return this._request("GET", api, null, error);
    }

    /**
     * Patch request formation
     *
     * @param api
     * @param error
     * @returns {*}
     * @private
     */
    _patch(api, error = undefined) {
        return this._request("PATCH", api, error);
    }

    /**
     * Api request sending to the corresponding url
     *
     * @param method
     * @param api
     * @param error
     * @returns {*}
     * @private
     */
    _request(method, api, error = undefined) {
        let option = {
            headers: {
                "api-token": this.options.apiToken,
                "domain": this.options.domain,
                "Content-Type": "application/json"
            },
        };
        let result = request(method, this._url(api), option);
        result = JSON.parse(result.getBody('utf8'));
        if (result.error) {
            if (error) {
                error(result.error);
            } else {
                throw new Error(result.error);
            }
        }
        return result;
    }

    /**
     * Publish results to qaTouch
     *
     * @param results
     * @param callback
     */
    publish(results, callback = undefined) {
        console.log(`Results published to QA Touch Test Run`);
        let body = this.addResultsForTestRun(results);
        // execute callback if specified
        if (callback) {
            callback(body);
        }
    }

    /**
     * Add results for the test run in qaTouch
     *
     * @param results
     */
    addResultsForTestRun(results) {
        let result = [];
        results.forEach(function (value, item) {
            result.push({
                'case': value.case_id,
                'status': value.status_id,
            });
        });
        this._patch(`testRunResults/status/multiple?project=${this.options.projectKey}&test_run=${this.options.testRunId}&result=${JSON.stringify(result)}&comments=Status changed by webdriver.io automation script.`);
    }

    /**
     * status config values
     *
     * @param status
     * @returns {number}
     */
    statusConfig(status) {
        let statusId= 2;

        switch (status) {
            case 'Passed':
                statusId= 1;
                break;
            case 'Untested':
                statusId= 2;
                break;
            case 'Blocked':
                statusId= 3;
                break;
            case 'Retest':
                statusId= 4;
                break;
            case 'Failed':
                statusId= 5;
                break;
            case 'Not Applicable':
                statusId= 6;
                break;
            case 'In Progress':
                statusId= 7;
                break;
            default:
                statusId= 2
        }

        return statusId
    }

    /**
     * Title to case ids for qaTouch
     *
     * @param title
     * @returns {[]}
     * @constructor
     */
    TitleToCaseIds(title)
    {
        let caseIds = [];
        let testCaseIdRegExp = /\bTR(\d+)\b/g;
        let m;
        while((m = testCaseIdRegExp.exec(title)) !== null) {
            let caseId = parseInt(m[1]);
            caseIds.push(caseId);
        }
        return caseIds;
    }
}

module.exports = QaTouch;
