import {Sequelize} from "sequelize"

export const sequelize = new Sequelize(process.env.DATABASE_URI,{
  dialect: "postgres"
})

export const connectDB = async()=>{
  try {
    const connectionInstance = sequelize.sync()
    console.log("DATABASE CONNECTED ON HOST:", (await connectionInstance).config.host)
  } catch (error) {
    console.log("DATABASE CONNECTION FAILED", error)
  }
}



