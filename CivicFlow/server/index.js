const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

dotenv.config();

const { getDb, saveDb } = require('./services/db');
const { analyzeIssueWithBedrock, uploadToS3, dispatchEvent } = require('./services/aws');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'civicflow-super-secret-jwt-key-2026';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Multer setup for memory storage of uploads
const upload = multer({ storage: multer.memoryStorage() });

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// ==================== AUTH ROUTES ====================
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    const db = getDb();

    const existing = db.users.find(u => u.email === email);
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password || 'password123', 10);
    const newUser = {
      id: `u-${Date.now()}`,
      name: name || 'Citizen User',
      email,
      passwordHash,
      role: role || 'citizen',
      department: department || null,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDb(db);

    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role, department: newUser.department, name: newUser.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, department: newUser.department } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDb();

    const user = db.users.find(u => u.email === email);
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    // For demo convenience, allow default password or check hash
    const valid = password === 'password123' || (await bcrypt.compare(password, user.passwordHash));
    if (!valid) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, department: user.department, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const db = getDb();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department } });
});

// ==================== DEPARTMENTS ROUTES ====================
app.get('/api/departments', (req, res) => {
  const db = getDb();
  res.json(db.departments);
});

// ==================== ISSUES ROUTES ====================

// Get all issues with filters & search
app.get('/api/issues', (req, res) => {
  const { category, status, severity, search, department, reporterId } = req.query;
  const db = getDb();
  let issues = [...db.issues];

  if (category && category !== 'All') {
    issues = issues.filter(i => i.category.toLowerCase() === category.toLowerCase());
  }
  if (status && status !== 'All') {
    issues = issues.filter(i => i.status.toLowerCase() === status.toLowerCase());
  }
  if (severity && severity !== 'All') {
    issues = issues.filter(i => i.severity.toLowerCase() === severity.toLowerCase());
  }
  if (department && department !== 'All') {
    issues = issues.filter(i => i.assignedDepartment && i.assignedDepartment.toLowerCase() === department.toLowerCase());
  }
  if (reporterId) {
    issues = issues.filter(i => i.reporterId === reporterId);
  }
  if (search) {
    const q = search.toLowerCase();
    issues = issues.filter(i => 
      i.id.toLowerCase().includes(q) ||
      i.title.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.location.address.toLowerCase().includes(q) ||
      (i.location.neighborhood && i.location.neighborhood.toLowerCase().includes(q))
    );
  }

  // Sort by newest first
  issues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(issues);
});

// AI Analyze endpoint (for step 5 of report flow)
app.post('/api/issues/ai-analyze', authenticateToken, async (req, res) => {
  try {
    const { title, description } = req.body;
    const analysis = await analyzeIssueWithBedrock(title, description);
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check duplicate before creating
app.post('/api/issues/check-duplicate', authenticateToken, async (req, res) => {
  try {
    const { category, location } = req.body;
    const db = getDb();
    
    // Find active issues in same category with matching neighborhood or close proximity
    const potentialDuplicates = db.issues.filter(i => 
      i.category.toLowerCase() === (category || '').toLowerCase() &&
      ['Reported', 'Under Review', 'Assigned', 'In Progress'].includes(i.status) &&
      (
        (location?.neighborhood && i.location?.neighborhood?.toLowerCase() === location.neighborhood.toLowerCase()) ||
        (location?.address && i.location?.address?.toLowerCase().includes(location.address.toLowerCase()))
      )
    );

    if (potentialDuplicates.length > 0) {
      res.json({
        hasDuplicate: true,
        duplicateCount: potentialDuplicates.length,
        existingIssue: potentialDuplicates[0]
      });
    } else {
      res.json({ hasDuplicate: false });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Issue
app.post('/api/issues', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, severity, address, neighborhood, lat, lng } = req.body;
    const db = getDb();

    let imageUrl = 'https://images.unsplash.com/photo-1541888946425-d0fbb18f1f82?auto=format&fit=crop&w=800&q=80';
    if (req.file) {
      imageUrl = await uploadToS3(req.file.buffer, req.file.originalname);
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }

    // Run AI analysis
    const aiAnalysis = await analyzeIssueWithBedrock(title, description, imageUrl);

    const newId = `ISS-${1043 + db.issues.length}`;
    const newIssue = {
      id: newId,
      title: title || aiAnalysis.summary,
      description: description || 'No description provided.',
      category: category || aiAnalysis.category,
      severity: severity || aiAnalysis.severity,
      status: 'Reported',
      location: {
        address: address || '100 Civic Center Blvd',
        neighborhood: neighborhood || 'Downtown',
        lat: lat ? parseFloat(lat) : 37.7749,
        lng: lng ? parseFloat(lng) : -122.4194
      },
      imageUrl,
      reporterId: req.user.id,
      reporterName: req.user.name,
      assignedDepartment: aiAnalysis.department,
      aiAnalysis,
      duplicateOfId: null,
      upvotesCount: 1,
      upvotedBy: [req.user.id],
      internalNotes: [],
      verificationStatus: {
        resolvedVotes: 0,
        unresolvedVotes: 0,
        status: 'pending'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.issues.unshift(newIssue);

    // Create notification for user
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: req.user.id,
      title: 'Issue Successfully Reported',
      message: `Your issue "${newIssue.title}" (${newIssue.id}) has been registered and routed to ${newIssue.assignedDepartment}.`,
      type: 'issue_submitted',
      read: false,
      issueId: newIssue.id,
      createdAt: new Date().toISOString()
    });

    saveDb(db);

    // Dispatch EventBridge event
    await dispatchEvent('IssueReported', { issueId: newIssue.id, category: newIssue.category, department: newIssue.assignedDepartment });

    res.status(201).json(newIssue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single issue detail
app.get('/api/issues/:id', (req, res) => {
  const db = getDb();
  const issue = db.issues.find(i => i.id === req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });
  res.json(issue);
});

// Update issue (Admin / Operator action: status, priority, assignedDepartment)
app.patch('/api/issues/:id', authenticateToken, (req, res) => {
  try {
    const { status, severity, assignedDepartment } = req.body;
    const db = getDb();
    const issue = db.issues.find(i => i.id === req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    if (status) issue.status = status;
    if (severity) issue.severity = severity;
    if (assignedDepartment) issue.assignedDepartment = assignedDepartment;
    issue.updatedAt = new Date().toISOString();

    // If marked resolved, trigger community verification request notification to reporter
    if (status === 'Resolved' && issue.status !== 'Resolved') {
      issue.verificationStatus.status = 'requested';
      db.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: issue.reporterId,
        title: 'Verification Requested',
        message: `Issue "${issue.title}" (${issue.id}) has been marked as Resolved. Please verify if it is actually fixed.`,
        type: 'verification_requested',
        read: false,
        issueId: issue.id,
        createdAt: new Date().toISOString()
      });
      dispatchEvent('IssueResolved', { issueId: issue.id });
    }

    saveDb(db);
    res.json(issue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upvote issue
app.post('/api/issues/:id/upvote', authenticateToken, (req, res) => {
  const db = getDb();
  const issue = db.issues.find(i => i.id === req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  if (!issue.upvotedBy.includes(req.user.id)) {
    issue.upvotedBy.push(req.user.id);
    issue.upvotesCount += 1;
    saveDb(db);
  }
  res.json(issue);
});

// Add internal note
app.post('/api/issues/:id/notes', authenticateToken, (req, res) => {
  const { note } = req.body;
  const db = getDb();
  const issue = db.issues.find(i => i.id === req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  issue.internalNotes.push({
    note,
    author: req.user.name,
    createdAt: new Date().toISOString()
  });
  saveDb(db);
  res.json(issue);
});

// Community verification endpoint
app.post('/api/issues/:id/verify', authenticateToken, (req, res) => {
  const { vote, comment } = req.body; // vote: 'resolved' | 'unresolved'
  const db = getDb();
  const issue = db.issues.find(i => i.id === req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  // Record verification
  const verification = {
    id: `ver-${Date.now()}`,
    issueId: issue.id,
    userId: req.user.id,
    vote,
    comment: comment || '',
    createdAt: new Date().toISOString()
  };
  db.verifications.push(verification);

  if (vote === 'resolved') {
    issue.verificationStatus.resolvedVotes += 1;
    if (issue.verificationStatus.resolvedVotes >= 2) {
      issue.status = 'Community Verified';
      issue.verificationStatus.status = 'verified';
    }
  } else {
    issue.verificationStatus.unresolvedVotes += 1;
    // If 2 or more citizens report it's not fixed, reopen the issue!
    if (issue.verificationStatus.unresolvedVotes >= 2) {
      issue.status = 'Reopened';
      issue.verificationStatus.status = 'reopened';
      
      // Notify department
      db.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: issue.reporterId,
        title: 'Issue Reopened by Community',
        message: `Issue "${issue.title}" (${issue.id}) was reported as still existing by community members and has been reopened.`,
        type: 'reopened',
        read: false,
        issueId: issue.id,
        createdAt: new Date().toISOString()
      });
      dispatchEvent('IssueReopened', { issueId: issue.id });
    }
  }

  saveDb(db);
  res.json({ issue, verification });
});

// ==================== ANALYTICS & STATS ROUTES ====================
app.get('/api/analytics', (req, res) => {
  const db = getDb();
  const issues = db.issues;

  const totalReports = issues.length;
  const pendingReview = issues.filter(i => i.status === 'Reported' || i.status === 'Under Review').length;
  const inProgress = issues.filter(i => i.status === 'Assigned' || i.status === 'In Progress').length;
  const resolved = issues.filter(i => i.status === 'Resolved' || i.status === 'Community Verified').length;
  const reopened = issues.filter(i => i.status === 'Reopened').length;
  const highPriority = issues.filter(i => i.severity === 'High' || i.severity === 'Critical').length;

  // By category breakdown
  const categoryCounts = {};
  issues.forEach(i => {
    categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
  });

  // By status breakdown
  const statusCounts = {};
  issues.forEach(i => {
    statusCounts[i.status] = (statusCounts[i.status] || 0) + 1;
  });

  // Priority distribution
  const priorityCounts = {
    Critical: issues.filter(i => i.severity === 'Critical').length,
    High: issues.filter(i => i.severity === 'High').length,
    Medium: issues.filter(i => i.severity === 'Medium').length,
    Low: issues.filter(i => i.severity === 'Low').length
  };

  res.json({
    metrics: {
      totalReports,
      pendingReview,
      inProgress,
      resolved,
      reopened,
      highPriority,
      resolutionRate: totalReports > 0 ? Math.round((resolved / totalReports) * 100) : 0
    },
    categoryCounts,
    statusCounts,
    priorityCounts,
    recentReports: issues.slice(0, 5)
  });
});

// ==================== NOTIFICATIONS ROUTES ====================
app.get('/api/notifications', authenticateToken, (req, res) => {
  const db = getDb();
  const userNotifs = db.notifications.filter(n => n.userId === req.user.id);
  res.json(userNotifs);
});

app.patch('/api/notifications/:id/read', authenticateToken, (req, res) => {
  const db = getDb();
  const notif = db.notifications.find(n => n.id === req.params.id);
  if (notif) {
    notif.read = true;
    saveDb(db);
  }
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`CivicFlow Server running on port ${PORT}`);
});
