const fs = require('fs');

function readJsonData(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading JSON file:', error);   

    return null;
  }
}



function convertData(data) {
  const result = [];
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      result.push({ code: key, name: data[key] });
    }
  }
  return result;
}

function writeToFile(dataToWrite, filePath='output.json'){
  try {
    const jsonString = JSON.stringify(dataToWrite, null, 2); // Indent for readability

    fs.writeFileSync(filePath, jsonString);
    console.log('Data written to json file successfully.');
  } catch (err) {
    console.error('Error writing to json file:', err);
  }
}

function main(){
  var jsonData = readJsonData('languages.en.json'); // Replace 'data.json' with your file path
  jsonData = convertData(jsonData);
  writeToFile(jsonData)
}

main();

