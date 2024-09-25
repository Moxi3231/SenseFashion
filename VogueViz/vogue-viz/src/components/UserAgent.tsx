// Base User-Agent strings with placeholders for version variations

const base_opera_win: string = "Mozilla/5.0 (Windows NT {windows_version}; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{chrome_version} Safari/537.36 OPR/{opera_version}";

// Updated versions for variations
const chrome_versions = ["116.0.5845.111", "117.0.5938.89", "118.0.5993.54"]; // Latest Chrome versions
const opera_versions = ["102.0.4880.29", "103.0.4928.16", "104.0.4971.64"]; // Latest Opera versions
const windows_versions = ["10.0", "10.1", "11.0", "11.1", "11.2", "12.0"]; // Updated Windows versions

let headers: string[] = [];


// Generate Opera headers
for (let opera_version of opera_versions) {
    for (let chrome_version of chrome_versions.slice(0, 2)) {  // Using first 2 chrome versions for Opera
        for (let windows_version of windows_versions) {
            headers.push(base_opera_win.replace('{chrome_version}', chrome_version).replace('{opera_version}', opera_version).replace('{windows_version}', windows_version));
        }
    }
}

export default headers;
