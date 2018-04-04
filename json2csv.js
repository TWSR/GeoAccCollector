var fs = require("fs");

if (process.argv.length < 3) {
  console.log("args with input_file output_file");
  return;
}

var input = process.argv[2];
var output = input + ".csv";

var data = fs.readFileSync(input);
var arr = JSON.parse("[" + data + "]");

var string = "";
arr.forEach(function(item) {
  string += Object.values(item).join(",") + "\n";
});

fs.appendFileSync(output, string);

