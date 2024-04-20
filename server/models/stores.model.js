// userModel.js
import { DataTypes } from 'sequelize'
import { sequelize }  from '../config/index.js'

const Store = sequelize.define('Store', {
  shopId :{ 
    type: DataTypes.STRING,
    allowNull:false,
    unique:true,
    primaryKey: true
  },
  shopName:{
    type: DataTypes.STRING,
    allowNull: false,
  },
  shopifyShopDomain:{
    type: DataTypes.STRING,
    allowNull: false
  },
  owner:{
    type: DataTypes.STRING,
    allowNull: false
  },
  email:{
    type: DataTypes.STRING,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull:false,
    defaultValue:false
  },
});

export default Store;

