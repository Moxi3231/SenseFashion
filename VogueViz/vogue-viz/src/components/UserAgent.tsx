// Base User-Agent strings with placeholders for version variations
const base_firefox_win: string = "Mozilla/5.0 (Windows NT {windows_version}; Win64; x64; rv:{firefox_version}) Gecko/20100101 Firefox/{firefox_version}";
const base_chrome_win: string = "Mozilla/5.0 (Windows NT {windows_version}; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{chrome_version} Safari/537.36";
const base_opera_win: string = "Mozilla/5.0 (Windows NT {windows_version}; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{chrome_version} Safari/537.36 OPR/{opera_version}";
// Updated versions for variations
const firefox_versions = ["95.0", "96.0", "97.0"];
const chrome_versions = ["96.0.4664.45", "97.0.4692.71", "98.0.4758.102"];
const opera_versions = ["68.0.3618.125", "69.0.3686.77", "70.0.3728.95"];
const windows_versions = ["10.0", "10.1", "10.2", "11.0", "11.1", "11.2"];

let headers: string[] = [];

// Generate Firefox headers
for (let firefox_version of firefox_versions) {
    for (let windows_version of windows_versions) {
        headers.push(base_firefox_win.replace('{firefox_version}', firefox_version).replace('{windows_version}', windows_version));
    }
}

// Generate Chrome headers
for (let chrome_version of chrome_versions) {
    for (let windows_version of windows_versions) {
        headers.push(base_chrome_win.replace('{chrome_version}', chrome_version).replace('{windows_version}', windows_version));
    }
}

// Generate Opera headers
for (let opera_version of opera_versions) {
    for (let chrome_version of chrome_versions.slice(0, 2)) {  // Using first 2 chrome versions for Opera
        for (let windows_version of windows_versions) {
            headers.push(base_opera_win.replace('{chrome_version}', chrome_version).replace('{opera_version}', opera_version).replace('{windows_version}', windows_version));
        }
    }
}

export default headers;
