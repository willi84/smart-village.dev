const fs = require('fs');
const path = require('path');

function parseMdToJson(content) {
    try {
        // Datei einlesen
        // const content = fs.readFileSync(filePath, 'utf8').trim();

        // Entferne mögliche "---" Trennzeichen am Anfang oder Ende
        const cleanedContent = content.replace(/^---\s*/, '').trim();

        // Jede Zeile einzeln verarbeiten
        const lines = cleanedContent.split('\n');
        const result = {};
        
        let currentKey = null;
        let isArray = false;
        let arrayBuffer = [];

        for (let line of lines) {
            line = line.trim();
            
            // Falls die Zeile ein neues Schlüssel-Wert-Paar ist
            let match = line.match(/^(\w+):\s*(.+)?$/);
            if (match) {
                // Falls vorher ein Array gesammelt wurde, speichere es
                if (isArray) {
                    result[currentKey] = arrayBuffer;
                    arrayBuffer = [];
                    isArray = false;
                }

                currentKey = match[1];
                let value = match[2];

                // Falls der Wert mit "[" beginnt, beginnt ein Array
                if (value && value.startsWith('[')) {
                    isArray = true;
                } else if (value) {
                    result[currentKey] = value;
                }
            } 
            else if (isArray) {
                // Falls die Zeile zu einem Array gehört, füge sie hinzu
                if (line.startsWith(']')) {
                    isArray = false;
                    result[currentKey] = arrayBuffer;
                    arrayBuffer = [];
                } else {
                    // remove " and ' from string 
                    line = line.replace(/^\s*"/, '').replace(/"\s*$/, '');
                    line = line.replace(/^\s*'/, '').replace(/'\s*$/, '');
                    // remove trailing comma
                    line = line.replace(/,\s*$/, '');
                    arrayBuffer.push(line);
                }
            }
        }

        // Falls das letzte Element ein Array war, speichere es
        if (isArray) {
            result[currentKey] = arrayBuffer;
        }

        return result;
    } catch (error) {
        console.error('Fehler beim Parsen der Datei:', error);
        return null;
    }
}

exports.parseMdToJson = parseMdToJson;
