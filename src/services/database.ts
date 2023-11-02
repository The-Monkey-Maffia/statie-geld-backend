import mysql from "mysql"

export class Database{
    host: string
    user: string
    password: string
    database: string

    constructor(host: string, user: string, password: string, database: string) {
        this.host = host;
        this.user = user;
        this.password = password
        this.database = database
    }
    
    connect() {
        const connection = mysql.createConnection({
            host: this.host,
            user: this.user,
            password: this.password,
            database: this.database
        })
        return connection
    }
}
