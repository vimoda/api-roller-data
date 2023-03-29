const StateSchema = require("../states/model");
const CitySchema = require("../cities/model");
const slug = require("slug");


const all = async (req, res, next) => {
    try {
        var fs = require('fs');
        var states;
        StateSchema
        .find()
        .exec(function(err, states){
            states.map((state) => {
                let slug_city = slug(state.name);
                dataCity = {
                    "name":state.name,
                    "slug":slug_city,
                    "state_id":state._id
                };
                const city = CitySchema(dataCity);
                city.save((err)=>{});
                return false;
                console.log("despues");
                
                city.save().then( (data) => res.json({success:true,message:"ok",data:data})).catch( (error) => res.json({success:false, message: error, data:{}}) );
                let routeFile = './estados/' + state.slug+".json";
                console.log("Exists (" + routeFile +"): " + fs.existsSync(routeFile));
                if(fs.existsSync(routeFile)){
                    fs.readFile(routeFile, 'utf8', function(err, data) {
                        if (err) throw err;
                        console.log('OK: ' + routeFile);
                        let rowsData = JSON.parse(data);
                        for(let j = 0; j < rowsData.length; j++){
                            console.log(rowsData[j]);break;
                        }
                        
                    });
                }
            });
        });
    } catch (error) {
        console.log(error);
    }
    
    //.then( (data) => { states = data; console.log(data);})
    //.catch( (error) => { return [success=>false,message=>error,data=>[]];} );
};
module.exports = {
    all
}