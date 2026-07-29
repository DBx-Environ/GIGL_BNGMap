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
// 3. LIVE CSV DATA INJECTOR (Bulletproof Version)
// =========================================================

function setupLiveData() {
    if (typeof map === 'undefined') {
        setTimeout(setupLiveData, 100);
        return;
    }

    // Add a timestamp to the URL to force the browser to ALWAYS download the freshest CSVs
    var cacheBuster = '?t=' + new Date().getTime();

    Promise.all([
        fetch('BasicMapDataExport.csv' + cacheBuster).then(function(res) { return res.ok ? res.text() : ""; }),
        fetch('BroadHabitatbySZ.csv' + cacheBuster).then(function(res) { return res.ok ? res.text() : ""; })
    ])
    .then(function(files) {
        var basicData = parseCSV(files[0]);
        var habitatData = parseCSV(files[1]);
        
        window.liveZoneData = {};
        
        // Map Basic Map Data
        basicData.forEach(function(row) {
            var szCode = parseFloat(row['SZCode']);
            if (!isNaN(szCode)) {
                if (!window.liveZoneData[szCode]) window.liveZoneData[szCode] = {};
                window.liveZoneData[szCode]['BasicMapDataExport_Area'] = row['Area'];
                window.liveZoneData[szCode]['BasicMapDataExport_Hedgerow'] = row['Hedgerow'];
                window.liveZoneData[szCode]['BasicMapDataExport_Watercourse'] = row['Watercourse'];
                window.liveZoneData[szCode]['BasicMapDataExport_PopHeader'] = row['PopHeader'];
            }
        });

        // Map Broad Habitats Data
        habitatData.forEach(function(row) {
            var szCode = parseFloat(row['SZCode']);
            if (!isNaN(szCode)) {
                if (!window.liveZoneData[szCode]) window.liveZoneData[szCode] = {};
                for (var key in row) {
                    if (key !== 'SZCode' && key !== 'LPA' && key !== 'NCA') {
                        window.liveZoneData[szCode]['BroadHabitatbySZ_' + key] = row[key];
                    }
                }
            }
        });

        // Intercept popup rendering
        map.on('popupopen', function(e) {
            var feature = e.popup._source.feature;
            if (!feature || !feature.properties || feature.properties.SZCode == null) return;
            
            var szCode = parseFloat(feature.properties.SZCode);
            var liveRow = window.liveZoneData[szCode];
            if (!liveRow) return;

            // Wait 10 milliseconds to ensure Leaflet has fully injected the popup HTML into the screen
            setTimeout(function() {
                var popupNode = document.querySelector('.leaflet-popup-content');
                if (!popupNode) return;
                
                var rows = popupNode.querySelectorAll('tr');
                rows.forEach(function(row) {
                    // Grab ALL cells in the row, whether qgis2web made them <th> or <td>
                    var cells = row.querySelectorAll('th, td');
                    if (cells.length < 2) return; 
                    
                    var labelCell = cells[0];
                    var valueCell = cells[cells.length - 1]; // The last cell holds the number
                    
                    // Clean up the label (removes trailing colons or spaces)
                    var label = labelCell.innerText.trim().replace(/:$/, '').trim();
                    
                    for (var propKey in liveRow) {
                        // Match the exact QGIS property name
                        if (propKey.endsWith('_' + label) || label === propKey) {
                            // If the CSV has data for this, overwrite the static map data!
                            if (liveRow[propKey] !== undefined && liveRow[propKey] !== "") {
                                valueCell.innerHTML = liveRow[propKey];
                            }
                            break;
                        }
                    }
                });
            }, 10);
        });
    })
    .catch(function(err) {
        console.error("Custom.js: Live data error.", err);
    });
}

// Robust CSV Parser
function parseCSV(text) {
    text = text.replace(/^\uFEFF/, ''); // Strip invisible Excel characters
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

setupLiveData();