// Base User-Agent strings with placeholders for version variations
const base_firefox_win: string = "Mozilla/5.0 (Windows NT {windows_version}; Win64; x64; rv:{firefox_version}) Gecko/20100101 Firefox/{firefox_version}";
const base_chrome_win: string = "Mozilla/5.0 (Windows NT {windows_version}; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{chrome_version} Safari/537.36";
const base_opera_win: string = "Mozilla/5.0 (Windows NT {windows_version}; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{chrome_version} Safari/537.36 OPR/{opera_version}";

// Versions for variations
const firefox_versions: string[] = ["90.0", "91.0", "92.0", "93.0", "94.0"];
const chrome_versions: string[] = ["91.0.4472.124", "92.0.4512.107", "93.0.4577.63", "94.0.4606.54", "95.0.4638.50"];
const opera_versions: string[] = ["63.0.3368.71", "64.0.3417.83", "65.0.3467.62", "66.0.3515.72", "67.0.3575.80"];
const windows_versions: string[] = ["10.0", "10.1", "10.2", "11.0"];

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
    for (let chrome_version of chrome_versions.slice(0, 2)) {  // Limiting to 2 chrome versions for Opera to not exceed 50 headers in total
        for (let windows_version of windows_versions) {
            headers.push(base_opera_win.replace('{chrome_version}', chrome_version).replace('{opera_version}', opera_version).replace('{windows_version}', windows_version));
        }
    }
}

export default headers;