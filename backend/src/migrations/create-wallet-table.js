import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const up = async () => {
  await sequelize.getQueryInterface().createTable('wallets', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      allowNull: false
    },
    frozen_balance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      allowNull: false
    },
    total_deposited: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      allowNull: false
    },
    total_spent: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      allowNull: false
    },
    last_deposit_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    settlement_cycle_start: {
      type: DataTypes.DATE,
      allowNull: true
    },
    settlement_cycle_end: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  // Add index for user_id
  await sequelize.getQueryInterface().addIndex('wallets', ['user_id'], {
    unique: true
  });
};

export const down = async () => {
  await sequelize.getQueryInterface().dropTable('wallets');
};
