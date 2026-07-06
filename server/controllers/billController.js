const Bill = require('../models/Bill');

function getBillStatus(bill) {
  const now = new Date();
  const today = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  if (bill.lastPaidMonth === month && bill.lastPaidYear === year) return 'Paid';
  if (today > bill.dueDate) return 'Overdue';
  if (today === bill.dueDate) return 'Due Today';
  return 'Upcoming';
}

exports.getBills = async (req, res) => {
  try {
    const bills = await Bill.find({ user: req.user._id }).sort({ dueDate: 1 });
    const withStatus = bills.map(b => {
      const obj = b.toObject();
      obj.status = getBillStatus(b);
      return obj;
    });
    res.json(withStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBill = async (req, res) => {
  try {
    const { name, amount, category, dueDate, isRecurring, notes } = req.body;
    if (!name || !amount || !dueDate) return res.status(400).json({ message: 'Name, amount and due date required' });
    const bill = await Bill.create({ user: req.user._id, name, amount, category, dueDate, isRecurring, notes });
    res.status(201).json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBill = async (req, res) => {
  try {
    const bill = await Bill.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body, { new: true, runValidators: true }
    );
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markPaid = async (req, res) => {
  try {
    const now = new Date();
    const bill = await Bill.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isPaid: true, paidDate: now, lastPaidMonth: now.getMonth() + 1, lastPaidYear: now.getFullYear(), status: 'Paid' },
      { new: true }
    );
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
