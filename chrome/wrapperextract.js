var data;

function createTable(dataRecords) {
    var nOfRows = dataRecords.length;
    var fields = Object.keys(dataRecords[0]);
    var nOfColumns = fields.length;
    var table = document.createElement("table");
    table.id = "dataRecordsTable";
    table.className = "table table-striped table-bordered table-hover table-condensed";
    var thead = table.createTHead();
    var th = document.createElement("th");
    th.appendChild(document.createTextNode("Row"));
    thead.insertRow(0);
    thead.rows[0].appendChild(th);

    for (var i=1; i <= nOfColumns; i++) {
        var th = document.createElement("th");
        th.appendChild(document.createTextNode(fields[i-1]));
        thead.rows[0].appendChild(th);
    }

    var tbody = document.createElement("tbody");
    table.appendChild(tbody);

    for (var i=0; i < nOfRows; i++) {
        tbody.insertRow(i);
        tbody.rows[i].insertCell(0);
        tbody.rows[i].cells[0].appendChild(document.createTextNode((i+1)+"."));
        tbody.rows[i].cells[0].className = "text-right";

        var columnNumber = 0;

        for (var j=0; j < nOfColumns; j++) {
            columnNumber++;
            tbody.rows[i].insertCell(columnNumber);
            var dataItem = dataRecords[i][fields[j]];
            var dataItemNode;

            if (dataItem.type === "hyperlink") {
                dataItemNode = document.createElement("a");
                dataItemNode.href = dataItem.value;
                dataItemNode.appendChild(document.createTextNode(dataItem.value));
            } else if (dataItem.type === "image") {
                dataItemNode = document.createElement("img");
                dataItemNode.src = dataItem.value;
            } else if (dataItem.type === "text") {
                dataItemNode = document.createTextNode(dataItem.value);
            }
            tbody.rows[i].cells[columnNumber].appendChild(dataItemNode);
        }
    }

    return table;
}

function displayDataRecords() {
    var hyperlinkNode = document.createElement("a");
    hyperlinkNode.href = data.pageUrl;
    hyperlinkNode.appendChild(document.createTextNode(data.pageUrl));
    hyperlinkNode.className = "alert-link";
    document.getElementById("pageUrl").appendChild(hyperlinkNode);

    var extractionTime = Math.floor(data.extractionTime);
    document.getElementById("extractionTime").innerText = addThreeDigitSeparator(extractionTime);

    var memoryUsage = data.memoryUsage;
    document.getElementById("memoryUsage").innerText = addThreeDigitSeparator(memoryUsage);

    document.getElementById("rowsNumber").innerText = data.dataRecords.length;
    document.getElementById("columnsNumber").innerText = Object.keys(data.dataRecords[0]).length;
    document.getElementById("tableContainer").appendChild(createTable(data.dataRecords));
}

function exportData(event) {
    var buttonId = event.target.id;
    var exportDataType = "json";

    if (buttonId === "exportAsCSVButton") {
        exportDataType = "csv";
    }

    chrome.runtime.sendMessage({
        info: "dataExported",
        data: {
            dataType: exportDataType,
            dataRecords: data.dataRecords
        }
    });
}

chrome.runtime.sendMessage({info: "wrapperExtractPageLoaded"}, function(response) {
    data = response.data;

    if (data.dataRecords.length > 0) {
        displayDataRecords();
    } else {
        var container = document.getElementById("container");
        container.parentNode.removeChild(container);
        document.body.appendChild(document.createTextNode("Can't extract any data."));
        alert("Can't extract any data.");
    }
});

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("exportAsCSVButton").addEventListener("click", exportData);
    document.getElementById("exportAsJSONButton").addEventListener("click", exportData);
});
