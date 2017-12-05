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
    "required" : ["username","password","email"]
}

module.exports = User;