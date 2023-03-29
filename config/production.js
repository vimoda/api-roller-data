module.exports = {
    server: {
        port:80,
        domine:"api-rollercoin.com",
    },

    /**DB */
    mongodb: {
        uri: "mongodb://mongo_user:mongo_password@localhost:27017/api-rollercoin?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false"
    },

    redis: {
        //redis
    },

    //emails
    email: {
        provider: "sengrind",
        user: "",
        password: ""
    },

    logger: "dev"
}