const User = {
    "username" : {
        "type" : "string"
    },
    "password" : {
        "type" : "string"
    },
    "email" : {
        "type" : "string"
    },
    "subscribes" : {
        "type" : ["string"],
        "default" : []
    },
    "required" : ["username","password","email"]
}

module.exports = User;