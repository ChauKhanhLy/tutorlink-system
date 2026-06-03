import Wallet from '../models/wallet.model.js';
import Transaction from '../models/transaction.model.js';
import Settlement from '../models/settlement.model.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';
import db from '../config/db.js';

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

export const depositToWallet = async (userId, amount, description = 'Nạp tiền vào ví', referenceId = null, referenceType = null, transactionType = 'deposit') => {
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
            type: transactionType,
            amount: parseFloat(amount),
            description,
            status: 'completed',
            reference_id: referenceId,
            reference_type: referenceType,
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

export const processTutorPayments = async () => {
    try {
        console.log('🔄 Bắt đầu xử lý thanh toán cho gia sư (sau 1 tuần không khiếu nại)...');
        
        // Tìm các lesson_sessions đã hoàn thành (learner_confirmed = true, tutor_confirmed = true)
        // Đã qua 7 ngày kể từ khi learner_confirm
        // Không có khiếu nại active (status != 'rejected')
        // Chưa được thanh toán (chưa có transaction type='deposit' cho booking đó)
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const query = `
            SELECT 
                ls.id as lesson_session_id,
                ls.booking_id,
                ls.duration_hours,
                ls.updated_at as learner_confirmed_at,
                b.tutor_id,
                b.learner_id,
                b.fee,
                b.lesson_price_per_hour,
                b.type
            FROM lesson_sessions ls
            JOIN bookings b ON ls.booking_id = b.id
            WHERE 
                ls.learner_confirmed = true
                AND ls.tutor_confirmed = true
                AND ls.updated_at <= $1
                AND NOT EXISTS (
                    SELECT 1 FROM transactions t 
                    WHERE t.user_id = b.tutor_id 
                    AND t.reference_id = b.id 
                    AND t.type = 'deposit'
                )
                AND NOT EXISTS (
                    SELECT 1 FROM complaints c 
                    WHERE c.booking_id = b.id 
                    AND c.status != 'rejected'
                )
        `;
        
        const result = await db.query(query, [sevenDaysAgo]);
        const pendingSessions = result.rows;
        
        console.log(`[processTutorPayments] Tìm thấy ${pendingSessions.length} buổi học cần thanh toán`);
        
        let processedCount = 0;
        let totalAmount = 0;
        
        for (const session of pendingSessions) {
            try {
                const durationHours = parseFloat(session.duration_hours || (session.type === 'trial' ? 1.0 : 2.0));
                const pricePerHour = parseFloat(session.lesson_price_per_hour || session.fee || 0);
                const earnedAmount = parseFloat((pricePerHour * durationHours).toFixed(0));
                
                if (earnedAmount > 0) {
                    await depositToWallet(
                        session.tutor_id,
                        earnedAmount,
                        `Thu nhập buổi dạy (Thanh toán sau 1 tuần) - ${durationHours}h × ${pricePerHour.toLocaleString('vi-VN')}₫/h`,
                        session.booking_id,
                        'booking'
                    );
                    
                    processedCount++;
                    totalAmount += earnedAmount;
                    console.log(`[processTutorPayments] Đã thanh toán ${earnedAmount}₫ cho gia sư ${session.tutor_id} (booking: ${session.booking_id})`);
                }
            } catch (error) {
                console.error(`[processTutorPayments] Lỗi thanh toán cho booking ${session.booking_id}:`, error.message);
            }
        }
        
        console.log(`[processTutorPayments] Hoàn thành: ${processedCount} gia sư, tổng ${totalAmount.toLocaleString('vi-VN')}₫`);
        return { processed: processedCount, totalAmount };
    } catch (error) {
        console.error('[processTutorPayments] Lỗi xử lý thanh toán:', error);
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
