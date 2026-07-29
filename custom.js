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

  /* Base Styles for the Summary Box */
  #custom-summary-box {
    background: rgba(255, 255, 255, 0.95) !important;
    padding: 8px 12px !important;
    border: 2px solid rgba(0,0,0,0.2) !important;
    border-radius: 4px !important;
    box-shadow: 0 1px 5px rgba(0,0,0,0.4) !important;
    z-index: 99999 !important;
    font-family: Arial, sans-serif !important;
    font-size: 13px !important;
    font-weight: bold !important;
    color: #333 !important;
    pointer-events: auto !important;
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
    #custom-summary-box {
      position: absolute !important;
      bottom: 30px !important; /* Safely above the Leaflet attribution text */
      left: 10px !important;
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
    #custom-summary-box {
      position: fixed !important;
      bottom: 30px !important;
      left: 10px !important;
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

    // Create Logo
    var logo = document.getElementById('custom-map-logo');
    if (!logo) {
        logo = document.createElement('img');
        logo.id = 'custom-map-logo';
        logo.src = 'Map.png'; 
    }

    // Create Home Button
    var homeBtn = document.getElementById('custom-home-btn');
    if (!homeBtn) {
        homeBtn = document.createElement('button');
        homeBtn.id = 'custom-home-btn';
        homeBtn.title = 'Reset to County Extent';
        homeBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'; 
        homeBtn.onclick = function(e) {
            if (e) e.preventDefault(); 
            if (typeof map !== 'undefined') { map.setView([53.1, 0], 8.6); }
        };
    }

    // Create Summary Box (Text is injected later by the CSV reader)
    var summaryBox = document.getElementById('custom-summary-box');
    if (!summaryBox) {
        summaryBox = document.createElement('div');
        summaryBox.id = 'custom-summary-box';
        summaryBox.innerHTML = 'Loading Data...'; // Placeholder
    }

    // Attach to DOM safely
    if (isMobile) {
        document.body.appendChild(logo); 
        document.body.appendChild(homeBtn); 
        document.body.appendChild(summaryBox);
    } else {
        if (!mapBox) {
            setTimeout(attachOverlays, 50);
            return;
        }
        mapBox.style.position = 'relative';
        mapBox.appendChild(logo);
        mapBox.appendChild(homeBtn);
        mapBox.appendChild(summaryBox);
    }
}
attachOverlays();
window.addEventListener('resize', attachOverlays);


// =========================================================
// 3. LIVE CSV DATA INJECTOR (Explicit Alias Mapping + Math)
// =========================================================
function setupLiveData() {
    if (typeof map === 'undefined') {
        setTimeout(setupLiveData, 100);
        return;
    }

    // Cache buster guarantees the map downloads the freshest CSV file
    var cacheBuster = '?t=' + new Date().getTime();

    // Fetch all THREE live CSV files
    Promise.all([
        fetch('BasicMapDataExport.csv' + cacheBuster).then(function(res) { return res.ok ? res.text() : ""; }),
        fetch('BroadHabitatbySZ.csv' + cacheBuster).then(function(res) { return res.ok ? res.text() : ""; }),
        fetch('SupplyMaster.csv' + cacheBuster).then(function(res) { return res.ok ? res.text() : ""; })
    ])
    .then(function(files) {
        var basicData = parseCSV(files[0]);
        var habitatData = parseCSV(files[1]);
        var supplyMasterData = parseCSV(files[2]);
        
        window.liveZoneData = {};
        
        // --- CALCULATION FOR SUMMARY BOX ---
        var totalUnits = 0;
        supplyMasterData.forEach(function(row) {
            var units = parseFloat(row['UnitsinNCA']);
            if (!isNaN(units)) {
                totalUnits += units;
            }
        });
        
        // Inject the math result directly into the Abstract Box
        var summaryBox = document.getElementById('custom-summary-box');
        if (summaryBox) {
            summaryBox.innerHTML = 'Total GIGL BNG Units Available = ' + totalUnits.toLocaleString();
        }

        // Helper to safely find the SZCode column
        function getSZCode(row) {
            var keys = Object.keys(row);
            for(var i=0; i<keys.length; i++) {
                if (keys[i].replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === 'szcode') {
                    return parseFloat(row[keys[i]]);
                }
            }
            return NaN;
        }

        // 1. Process BasicMapDataExport
        basicData.forEach(function(row) {
            var szCode = getSZCode(row);
            if (!isNaN(szCode)) {
                if (!window.liveZoneData[szCode]) window.liveZoneData[szCode] = {};
                window.liveZoneData[szCode]['BasicMapDataExport_Area'] = row['Area'] || "";
                window.liveZoneData[szCode]['BasicMapDataExport_Hedgerow'] = row['Hedgerow'] || "";
                window.liveZoneData[szCode]['BasicMapDataExport_Watercourse'] = row['Watercourse'] || "";
                window.liveZoneData[szCode]['BasicMapDataExport_PopHeader'] = row['PopHeader'] || "";
            }
        });

        // 2. Process BroadHabitats
        habitatData.forEach(function(row) {
            var szCode = getSZCode(row);
            if (!isNaN(szCode)) {
                if (!window.liveZoneData[szCode]) window.liveZoneData[szCode] = {};
                for (var key in row) {
                    var cleanKey = key.trim();
                    window.liveZoneData[szCode]['BroadHabitatbySZ_' + cleanKey] = row[key];
                }
            }
        });

        // 3. Intercept Popups and Translate QGIS Aliases
        map.on('popupopen', function(e) {
            var feature = e.popup._source.feature;
            if (!feature || !feature.properties || feature.properties.SZCode == null) return;
            
            var szCode = parseFloat(feature.properties.SZCode);
            var liveRow = window.liveZoneData[szCode];
            if (!liveRow) return;

            setTimeout(function() {
                var popupNode = document.querySelector('.leaflet-popup-content');
                if (!popupNode) return;
                
                var rows = popupNode.querySelectorAll('tr');
                rows.forEach(function(row) {
                    var cells = row.querySelectorAll('th, td');
                    if (cells.length < 2) return; 
                    
                    var labelCell = cells[0];
                    var valueCell = cells[cells.length - 1]; 
                    
                    // The label exactly as qgis2web printed it in the popup
                    var label = labelCell.innerText.trim().replace(/:$/, '').trim();
                    var dataKey = null;
                    
                    // The Alias Translation Dictionary
                    if (label === 'Area Units') { 
                        dataKey = 'BasicMapDataExport_Area'; 
                    }
                    else if (label === 'Hedge Units') { 
                        dataKey = 'BasicMapDataExport_Hedgerow'; 
                    }
                    else if (label === 'Water Units') { 
                        dataKey = 'BasicMapDataExport_Watercourse'; 
                    }
                    else if (label === 'PopHeader') { 
                        dataKey = 'BasicMapDataExport_PopHeader'; 
                    }
                    else {
                        dataKey = 'BroadHabitatbySZ_' + label;
                    }

                    if (dataKey && liveRow[dataKey] !== undefined && liveRow[dataKey] !== "") {
                        valueCell.innerHTML = liveRow[dataKey];
                    }
                });
            }, 10);
        });
    })
    .catch(function(err) {
        console.error("Custom.js: Live data error.", err);
    });
}

function parseCSV(text) {
    text = text.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    var lines = text.split(/\r?\n/).filter(function(l) { return l.trim() !== ''; });
    if (lines.length === 0) return [];
    
    var headers = parseCSVLine(lines[0]);
    var result = [];
    
    for (var i = 1; i < lines.length; i++) {
        var cols = parseCSVLine(lines[i]);
        var obj = {};
        for (var j = 0; j < headers.length; j++) {
            var cleanHeader = (headers[j] || "").replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
            obj[cleanHeader] = cols[j] || "";
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

setupLiveData();