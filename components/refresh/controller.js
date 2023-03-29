const ProductSchema = require("../product/model");
const slug = require("slug");
const fs = require('fs');

const all = async (req, res, next) => {
    try {
        await StateSchema.deleteMany();
        await TownshipSchema.deleteMany();
        await PostalCodeSchema.deleteMany();
        //joining path of directory
        const directoryPath = './estados/';
        //passsing directoryPath and callback function
        fs.readdir(directoryPath, function (err, files) {
            //handling error
            if (err) {
                return console.log('Unable to scan directory: ' + err);
            }
            //listing all files using forEach
            let total_lines = 0;
            let current_state = "";
            let current_township = "";
            let state;
            let township;
            files.forEach(function (file) {
                // Do whatever you want to do with the file
                if (file != 'undefined.json') {
                    //console.log(file);
                    let routeFile = './estados/' + file;
                    // console.log("Exists (" + routeFile + "): " + fs.existsSync(routeFile));
                    if (fs.existsSync(routeFile)) {
                        fs.readFile(routeFile, 'utf8', function (err, data) {
                            if (err) throw err;
                            // console.log(`Process file: ${file}`);
                            let rowsData = JSON.parse(data);
                            let dataPostalCodes = [];
                            for (let j = 0; j < rowsData.length; j++) {
                                try {
                                    let rowData = rowsData[j];
                                    // console.log(`Process ${j + 1} from ${rowsData.length}`);
                                    dataPostalCodes[j] = {
                                        "name_state": (rowData.d_estado).trim(),
                                        "slug_state": (slug(rowData.d_estado)).trim(),

                                        "name_city": (rowData.d_ciudad) ? (rowData.d_ciudad).trim() : "",
                                        "slug_city": slug((rowData.d_ciudad) ? (rowData.d_ciudad).trim() : ""),

                                        "name_township": (rowData.D_mnpio).trim(),
                                        "slug_township": (slug(rowData.D_mnpio)).trim(),

                                        "name_town": (rowData.d_asenta).trim(),
                                        "slug_town": (slug(rowData.d_asenta)).trim(),

                                        "cp_office": (rowData.c_oficina).trim(),
                                        'cp': (rowData.d_codigo).trim(),
                                        'type': (rowData.d_tipo_asenta).trim(),
                                        'zone': (rowData.d_zona).trim()
                                    };
                                    dataPostalCodes[j]["address"] =  `${dataPostalCodes[j]["name_town"]}, ${dataPostalCodes[j]["name_township"]}, ${dataPostalCodes[j]["name_city"]}, ${dataPostalCodes[j]["name_state"]}`;
                                    if(current_state!=dataPostalCodes[j]['slug_state']){
                                        // insert new state
                                        current_state = dataPostalCodes[j]['slug_state'];
                                        state = StateSchema({
                                            "name":dataPostalCodes[j]['name_state'],
                                            "slug":dataPostalCodes[j]['slug_state']
                                        });
                                        state.save((err)=>{});
                                    }
                                    if(current_township!=dataPostalCodes[j]['slug_township']){
                                        // insert new township
                                        current_township = dataPostalCodes[j]['slug_township'];
                                        township = TownshipSchema({
                                            "name":dataPostalCodes[j]['name_township'],
                                            "slug":current_township,
                                            "state_slug":current_state
                                        });
                                        township.save((err)=>{});
                                    }
                                } catch (error) {
                                    console.log(error);
                                }
                            }
                            //let PostalCode = PostalCodeSchema(dataPostalCodes);
                            //PostalCode.save().then( (data) => console.log("success")).catch( (error) =>console.log("error") );
                            total_lines+=dataPostalCodes.length;
                            // console.log(`Insert ${dataPostalCodes.length} lines, from file: ${file}`);
                            /*PostalCodeSchema.collection.insert(dataPostalCodes, (err, data) => {
                                if (err) throw err;
                                else { console.log(`insert file: ${file}`); }
                            })*/
                            PostalCodeSchema.insertMany(dataPostalCodes).then( (data) => {console.log(`Full insert file: ${file}, lines ${data.length}`);}).catch((error) => {throw error;});
                        });
                    }
                }
            });
        });
        res.status(200).send({ success: true, message: "ok", data: {} });
    } catch (error) {
        console.log(error)
        res.status(500).send({ success: false, message: error, data: {} })
    }
};
module.exports = {
    all
}