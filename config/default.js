module.exports = {
    server: {
        port:8080,
        domine:"test",
    },

    /**DB */
    mongodb: {
        port:27017,
        host: "localhost",
        user: "app_user",
        password: "app_password",
        uri: "mongodb://app_user:app_password@localhost:27017/apo-rollercoin?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false"
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