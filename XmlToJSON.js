const https = require('https');
var parser = require('xml2json');

https.get('https://www.senate.gov/general/contact_information/senators_cfm.xml', (resp) => {

  var data = '';
  var obj = {"members": []};
  var senateDataObj

  //Make sure xml2json returns an object, rather than string
  var options = {
    object: true,
    reversible: false,
    coerce: false,
    sanitize: true,
    trim: false,
    arrayNotation: false,
    alternateTextNode: false
  };

  //Keep adding data until EOF
  resp.on('data', (chunk) => {
    data += chunk;
  });

  //Once finished: parse XML, build new object (XML -> Object -> NewObject) to spec, and print
  resp.on('end', () => {
    senateDataObj = parser.toJson(data, options)

    //Loop over object, extract needed data, push to new object
    for(member in senateDataObj.contact_information.member){
      var strSplit = senateDataObj.contact_information.member[member].address.split(" ")
        obj.members.push({
          "firstName" : senateDataObj.contact_information.member[member].first_name,
          "lastName" : senateDataObj.contact_information.member[member].last_name,
          "fullName" : senateDataObj.contact_information.member[member].first_name + " " + senateDataObj.contact_information.member[member].last_name,
          "chartId" : senateDataObj.contact_information.member[member].bioguide_id,
          "mobile" : senateDataObj.contact_information.member[member].phone,
          "address" : [{"street": strSplit[0] + " " + strSplit[1] + " " + strSplit[2] + " " + strSplit[3] + " " + strSplit[4],
                        "city": strSplit[5],
                        "state": strSplit[6],
                        "postal": strSplit[7]},],
        });
    }

    console.log(JSON.stringify(obj, null, 1));
  });

//Something went wrong!
}).on("error", (err) => {
  console.log(err.message);
});
