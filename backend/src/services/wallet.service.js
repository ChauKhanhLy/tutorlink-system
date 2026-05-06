import Wallet from '../models/wallet.model.js';
import Transaction from '../models/transaction.model.js';
import Settlement from '../models/settlement.model.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';

export const getOrCreateWallet = async (userId) => {
    let wallet = await Wallet.findOne({ where: { user_id: userId } });
    
    if (!wallet) {
        wallet = await Wallet.create({
            user_id: userId,
            balance: 0,
            frozen_balance: 0,
            total_deposited: 0,
            total_spent: 0
        });
    }
    
    return wallet;
};

export const depositToWallet = async (userId, amount, description = 'Nạp tiền vào ví') => {
    const t = await sequelize.transaction();
    
    try {
        const wallet = await getOrCreateWallet(userId);
        
        // Cập nhật wallet
        await wallet.update({
            balance: parseFloat(wallet.balance) + parseFloat(amount),
            total_deposited: parseFloat(wallet.total_deposited) + parseFloat(amount),
            last_deposit_date: new Date()
        }, { transaction: t });
        
        // Tạo transaction record
        const transaction = await Transaction.create({
            user_id: userId,
            wallet_id: wallet.id,
            type: 'deposit',
            amount: parseFloat(amount),
            description,
            status: 'completed',
            processed_at: new Date()
        }, { transaction: t });
        
        await t.commit();
        return { wallet, transaction };
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

export const spendFromWallet = async (userId, amount, bookingId, description = 'Thanh toán buổi học') => {
    const t = await sequelize.transaction();
    
    try {
        const wallet = await getOrCreateWallet(userId);
        
        if (parseFloat(wallet.balance) < parseFloat(amount)) {
            throw new Error('Số dư không đủ để thanh toán');
        }
        
        // Cập nhật wallet
        await wallet.update({
            balance: parseFloat(wallet.balance) - parseFloat(amount),
            total_spent: parseFloat(wallet.total_spent) + parseFloat(amount)
        }, { transaction: t });
        
        // Tạo transaction record
        const transaction = await Transaction.create({
            user_id: userId,
            wallet_id: wallet.id,
            type: 'spend',
            amount: parseFloat(amount),
            description,
            reference_id: bookingId,
            reference_type: 'booking',
            status: 'completed',
            processed_at: new Date()
        }, { transaction: t });
        
        await t.commit();
        return { wallet, transaction };
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

export const getWalletTransactions = async (userId, limit = 50, offset = 0) => {
    return await Transaction.findAndCountAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        limit,
        offset
    });
};

export const getWeeklySettlements = async (userId) => {
    return await Settlement.findAll({
        where: { user_id: userId },
        order: [['week_start', 'DESC']]
    });
};

export const processWeeklySettlements = async () => {
    const t = await sequelize.transaction();
    
    try {
        // Lấy tất cả transactions chưa được settlement trong tuần trước
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const pendingTransactions = await Transaction.findAll({
            where: {
                type: 'spend',
                settlement_week: null,
                created_at: {
                    [Op.lt]: oneWeekAgo
                }
            }
        });
        
        // Group transactions by user
        const userTransactions = {};
        pendingTransactions.forEach(tx => {
            if (!userTransactions[tx.user_id]) {
                userTransactions[tx.user_id] = [];
            }
            userTransactions[tx.user_id].push(tx);
        });
        
        // Tạo settlements cho mỗi user
        for (const [userId, transactions] of Object.entries(userTransactions)) {
            const totalAmount = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
            
            if (totalAmount > 0) {
                // Tạo settlement record
                const settlement = await Settlement.create({
                    user_id: userId,
                    week_start: new Date(oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)),
                    week_end: oneWeekAgo,
                    total_amount: totalAmount,
                    settled_amount: totalAmount,
                    status: 'completed',
                    processed_date: new Date()
                }, { transaction: t });
                
                // Cập nhật transactions với settlement info
                const weekString = getWeekString(oneWeekAgo);
                await Transaction.update(
                    { 
                        settlement_week: weekString,
                        settlement_date: new Date()
                    },
                    { 
                        where: { 
                            id: transactions.map(tx => tx.id) 
                        },
                        transaction: t 
                    }
                );
            }
        }
        
        await t.commit();
        return { processed: Object.keys(userTransactions).length };
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

const getWeekString = (date) => {
    const year = date.getFullYear();
    const week = getWeekNumber(date);
    return `${year}-W${week.toString().padStart(2, '0')}`;
};

const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
};
