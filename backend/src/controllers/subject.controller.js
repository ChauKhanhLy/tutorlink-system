import db from '../config/db.js';

export const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM subjects WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy môn học" });
    }
    
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error fetching subject:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllSubjects = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM subjects ORDER BY name ASC');
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
