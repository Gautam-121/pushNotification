// userModel.js
import {  DataTypes } from  'sequelize'
import { sequelize } from '../config/index.js';

const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.STRING,
    allowNull:false,
    unique: true,
    primaryKey:true
  },
  token: { 
    type: DataTypes.TEXT, 
    allowNull:false
  },
  shopId:{ 
    type : DataTypes.STRING,
    allowNull:false
  },
  isOnline:{
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  serverKey:{ // Server Key of Store User
    type : DataTypes.TEXT,
    defaultValue:null
  }
});

export default Session