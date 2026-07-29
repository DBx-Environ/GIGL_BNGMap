// =========================================================
// 1. Popup CSS & Responsive Overlay Rules (Layout)
// =========================================================
var style = document.createElement('style');
style.innerHTML = `
  .leaflet-popup-content { font-size: 9px !important; max-height: 98px !important; overflow: auto !important; }

  /* Base Styles for Custom Logo */
  #custom-map-logo {
    background: #ffffff !important;
    padding: 4px !important;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3) !important;
    border-radius: 4px !important;
    z-index: 99999 !important;
    pointer-events: none !important;
  }

  /* Base Styles for Custom Home Button */
  #custom-home-btn {
    width: 36px !important;
    height: 36px !important;
    background: #ffffff !important;
    border: 2px solid rgba(0,0,0,0.2) !important;
    border-radius: 4px !important;
    box-shadow: 0 1px 5px rgba(0,0,0,0.4) !important;
    z-index: 99999 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    padding: 0 !important;
  }

  /* DESKTOP RULES (Above 768px) */
  @media screen and (min-width: 769px) {
    #custom-map-logo {
      position: absolute !important; 
      top: 10px !important;
      right: 10px !important; 
      height: 240px !important; 
      width: auto !important;
    }
    #custom-home-btn {
      position: absolute !important;
      top: 175px !important; 
      left: 13px !important; 
    }
  }

  /* MOBILE RULES (768px and under) */
  @media screen and (max-width: 768px) {
    #custom-map-logo {
      position: fixed !important; 
      top: 10px !important;
      right: 10px !important; 
      height: 180px !important; 
      width: auto !important;
    }
    #custom-home-btn {
      position: fixed !important; 
      top: 175px !important; 
      left: 13px !important; 
    }
  }
`;
document.head.appendChild(style);

// =========================================================
// 2. Attach Layout Overlays
// =========================================================
function attachOverlays() {
    var isMobile = window.innerWidth <= 768;
    var mapBox = document.getElementById('map');

    var logo = document.getElementById('custom-map-logo');
    if (!logo) {
        logo = document.createElement('img');
        logo.id = 'custom-map-logo';
        logo.src = 'Map.png'; 
    }

    var homeBtn = document.getElementById('custom-home-btn');
    if (!homeBtn) {
        homeBtn = document.createElement('button');
        homeBtn.id = 'custom-home-btn';
        homeBtn.title = 'Reset to County Extent';
        homeBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'; 
        
        homeBtn.onclick = function(e) {
            if (e) e.preventDefault(); 
            if (typeof map !== 'undefined') {
                map.setView([53.1, 0], 8.6); 
            }
        };
    }

    if (isMobile) {
        document.body.appendChild(logo); 
        document.body.appendChild(homeBtn); 
    } else {
        if (!mapBox) {
            setTimeout(attachOverlays, 50);
            return;
        }
        mapBox.style.position = 'relative';
        mapBox.appendChild(logo);
        mapBox.appendChild(homeBtn);
    }
}
attachOverlays();
window.addEventListener('resize', attachOverlays);


// =========================================================
// 3. LIVE CSV DATA INJECTOR (Bypasses qgis2web data limits)
// =========================================================

function setupLiveData() {
    // Wait for the map to finish loading
    if (typeof map === 'undefined') {
        setTimeout(setupLiveData, 100);
        return;
    }

    // Fetch the live CSV files directly from your folder
    Promise.all([
        fetch('BasicMapDataExport.csv').then(function(res) { return res.ok ? res.text() : ""; }),
        fetch('BroadHabitatbySZ.csv').then(function(res) { return res.ok ? res.text() : ""; })
    ])
    .then(function(files) {
        var basicData = parseCSV(files[0]);
        var habitatData = parseCSV(files[1]);
        
        window.liveZoneData = {};
        
        // This function merges the data and prevents columns with the same name from overwriting each other
        function mergeIntoLookup(dataArray, prefix) {
            dataArray.forEach(function(row) {
                // Find SZCode automatically, completely ignoring spaces, case, and invisible Excel characters
                var szKey = Object.keys(row).find(k => k.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === 'szcode');
                
                if (szKey && row[szKey]) {
                    var code = parseFloat(row[szKey]);
                    if (!window.liveZoneData[code]) window.liveZoneData[code] = {};
                    
                    // Copy columns into memory, attaching the file prefix so QGIS recognizes it perfectly
                    for (var k in row) {
                        var cleanColName = k.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                        if (cleanColName !== 'szcode') {
                            window.liveZoneData[code][prefix + cleanColName] = row[k];
                        }
                    }
                }
            });
        }

        // Merge both files, tagging them with the exact prefixes qgis2web uses
        mergeIntoLookup(basicData, "basicmapdataexport");
        mergeIntoLookup(habitatData, "broadhabitatbysz");

        // Intercept popups opening and inject live data
        map.on('popupopen', function(e) {
            var feature = e.popup._source.feature;
            if (!feature || !feature.properties || feature.properties.SZCode == null) return;
            
            var szCode = parseFloat(feature.properties.SZCode);
            var liveRow = window.liveZoneData[szCode];
            if (!liveRow) return;

            var popupNode = document.querySelector('.leaflet-popup-content');
            if (!popupNode) return;
            
            var rows = popupNode.querySelectorAll('tr');
            rows.forEach(function(row) {
                var th = row.querySelector('th');
                var td = row.querySelector('td');
                if (!th || !td) return;
                
                // Clean the popup label to match our sanitized CSV columns
                var cleanLabel = th.innerText.trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                
                // 1. Try to match the exact QGIS name (e.g. BasicMapDataExportArea)
                if (liveRow[cleanLabel] !== undefined) {
                    td.innerHTML = liveRow[cleanLabel];
                } 
                // 2. Fallback: If QGIS just output "Area", find the closest match
                else {
                    for (var liveKey in liveRow) {
                        if (liveKey.endsWith(cleanLabel) || cleanLabel.endsWith(liveKey)) {
                            td.innerHTML = liveRow[liveKey];
                            break; 
                        }
                    }
                }
            });
        });
    })
    .catch(function(err) {
        console.error("Custom.js: Could not load live CSV data.", err);
    });
}

// Robust CSV Parser (Safely handles spaces, quotes, commas, and invisible Excel formatting)
function parseCSV(text) {
    // CRITICAL: Strip the invisible BOM character Excel adds to the first column name
    text = text.replace(/^\uFEFF/, '');
    
    var lines = text.split(/\r?\n/).filter(function(l) { return l.trim() !== ''; });
    if (lines.length === 0) return [];
    
    var headers = parseCSVLine(lines[0]);
    var result = [];
    
    for (var i = 1; i < lines.length; i++) {
        var cols = parseCSVLine(lines[i]);
        var obj = {};
        for (var j = 0; j < headers.length; j++) {
            obj[headers[j]] = cols[j] || "";
        }
        result.push(obj);
    }
    return result;
}

function parseCSVLine(text) {
    var ret = [], inQuote = false, value = '';
    for (var i = 0; i < text.length; i++) {
        var c = text[i];
        if (inQuote) {
            if (c === '"') {
                if (i + 1 < text.length && text[i+1] === '"') { value += '"'; i++; }
                else { inQuote = false; }
            } else { value += c; }
        } else {
            if (c === '"') { inQuote = true; }
            else if (c === ',') { ret.push(value); value = ''; }
            else { value += c; }
        }
    }
    ret.push(value);
    return ret.map(function(v) { return v.trim(); });
}

// Initialize Live Data
setupLiveData();