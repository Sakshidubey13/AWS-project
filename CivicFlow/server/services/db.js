const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/store.json');

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial seed data
const initialData = {
  users: [
    {
      id: 'u-admin-1',
      name: 'Sarah Jenkins (Admin)',
      email: 'admin@civicflow.org',
      passwordHash: '$2a$10$X.W8vK1mP5QJv5q3Y2Bv2e7x6Z9V5K3q2Z5V5K3q2Z5V5K3q2Z5V5K', // hashed 'password123' or checked in auth
      role: 'admin',
      department: 'City Operations',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
    },
    {
      id: 'u-citizen-1',
      name: 'Alex Rivera',
      email: 'alex@example.com',
      passwordHash: '$2a$10$X.W8vK1mP5QJv5q3Y2Bv2e7x6Z9V5K3q2Z5V5K3q2Z5V5K3q2Z5V5K',
      role: 'citizen',
      department: null,
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
    },
    {
      id: 'u-operator-1',
      name: 'Marcus Vance (Electrical)',
      email: 'electrical@civicflow.org',
      passwordHash: '$2a$10$X.W8vK1mP5QJv5q3Y2Bv2e7x6Z9V5K3q2Z5V5K3q2Z5V5K3q2Z5V5K',
      role: 'operator',
      department: 'Electrical',
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
    }
  ],
  departments: [
    { id: 'dept-1', name: 'Electrical', description: 'Street lights, traffic signals, power infrastructure', lead: 'Marcus Vance', email: 'electrical@civicflow.org' },
    { id: 'dept-2', name: 'Roads & Pavements', description: 'Potholes, road damage, paving, sidewalks', lead: 'Elena Rostova', email: 'roads@civicflow.org' },
    { id: 'dept-3', name: 'Sanitation', description: 'Garbage accumulation, illegal dumping, litter', lead: 'David Chen', email: 'sanitation@civicflow.org' },
    { id: 'dept-4', name: 'Water & Drainage', description: 'Water leakage, blocked drains, stormwater management', lead: 'Aisha Patel', email: 'water@civicflow.org' },
    { id: 'dept-5', name: 'Public Safety', description: 'Hazards, abandoned structures, unsafe parks', lead: 'Chief Robert Thorne', email: 'safety@civicflow.org' }
  ],
  issues: [
    {
      id: 'ISS-1042',
      title: 'Broken Street Light Near Lincoln Elementary',
      description: 'Street light near the school has been broken for three nights and children have to walk through a dark road.',
      category: 'Street Light',
      severity: 'High',
      status: 'Assigned',
      location: {
        address: '452 Lincoln Ave, Sector 4',
        lat: 37.7749,
        lng: -122.4194,
        neighborhood: 'Downtown Sector 4'
      },
      imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f1f82?auto=format&fit=crop&w=800&q=80',
      reporterId: 'u-citizen-1',
      reporterName: 'Alex Rivera',
      assignedDepartment: 'Electrical',
      aiAnalysis: {
        category: 'Street Light',
        severity: 'High',
        department: 'Electrical',
        reason: 'Public safety risk near educational zone',
        summary: 'Broken street light creating a nighttime safety concern near a school.'
      },
      duplicateOfId: null,
      upvotesCount: 14,
      upvotedBy: ['u-citizen-1', 'u-admin-1'],
      internalNotes: [
        { note: 'Crew dispatched for inspection.', author: 'Marcus Vance', createdAt: new Date(Date.now() - 3600000 * 5).toISOString() }
      ],
      verificationStatus: {
        resolvedVotes: 0,
        unresolvedVotes: 0,
        status: 'pending'
      },
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: 'ISS-1041',
      title: 'Dangerous Pothole on Oak Street Junction',
      description: 'Large pothole approx 2 feet wide causing vehicles to swerve dangerously into oncoming lane.',
      category: 'Pothole',
      severity: 'Critical',
      status: 'In Progress',
      location: {
        address: 'Oak St & 5th Ave Intersection',
        lat: 37.7833,
        lng: -122.4167,
        neighborhood: 'Mission Bay'
      },
      imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f8?auto=format&fit=crop&w=800&q=80',
      reporterId: 'u-citizen-1',
      reporterName: 'Alex Rivera',
      assignedDepartment: 'Roads & Pavements',
      aiAnalysis: {
        category: 'Pothole',
        severity: 'Critical',
        department: 'Roads & Pavements',
        reason: 'Severe vehicle damage hazard',
        summary: 'Large hazardous pothole on busy vehicle intersection.'
      },
      duplicateOfId: null,
      upvotesCount: 23,
      upvotedBy: ['u-citizen-1'],
      internalNotes: [
        { note: 'Scheduled for asphalt patching.', author: 'Elena Rostova', createdAt: new Date(Date.now() - 86400000).toISOString() }
      ],
      verificationStatus: {
        resolvedVotes: 0,
        unresolvedVotes: 0,
        status: 'pending'
      },
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'ISS-1040',
      title: 'Overflowing Garbage Bin at Central Park',
      description: 'Municipal trash bin has not been collected in 4 days. Waste spilling onto walkways.',
      category: 'Garbage',
      severity: 'Medium',
      status: 'Resolved',
      location: {
        address: 'Central Park North Entrance',
        lat: 37.7692,
        lng: -122.4467,
        neighborhood: 'Parkside'
      },
      imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c1c?auto=format&fit=crop&w=800&q=80',
      reporterId: 'u-citizen-1',
      reporterName: 'Alex Rivera',
      assignedDepartment: 'Sanitation',
      aiAnalysis: {
        category: 'Garbage',
        severity: 'Medium',
        department: 'Sanitation',
        reason: 'Hygiene and pest risk in public park',
        summary: 'Overflowing waste container requiring urgent municipal pickup.'
      },
      duplicateOfId: null,
      upvotesCount: 8,
      upvotedBy: [],
      internalNotes: [
        { note: 'Cleaned and sanitized.', author: 'David Chen', createdAt: new Date(Date.now() - 7200000).toISOString() }
      ],
      verificationStatus: {
        resolvedVotes: 2,
        unresolvedVotes: 0,
        status: 'verified'
      },
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'ISS-1039',
      title: 'Water Main Leakage on Pine Road',
      description: 'Clean water is continuously bubbling up through a crack in the pavement near house #120.',
      category: 'Water Leakage',
      severity: 'High',
      status: 'Under Review',
      location: {
        address: '120 Pine Road',
        lat: 37.7600,
        lng: -122.4100,
        neighborhood: 'Hillcrest'
      },
      imageUrl: 'https://images.unsplash.com/photo-1584467735811-62865af421a2?auto=format&fit=crop&w=800&q=80',
      reporterId: 'u-citizen-1',
      reporterName: 'Alex Rivera',
      assignedDepartment: 'Water & Drainage',
      aiAnalysis: {
        category: 'Water Leakage',
        severity: 'High',
        department: 'Water & Drainage',
        reason: 'Water wastage and foundation erosion risk',
        summary: 'Active underground water line leak.'
      },
      duplicateOfId: null,
      upvotesCount: 5,
      upvotedBy: [],
      internalNotes: [],
      verificationStatus: {
        resolvedVotes: 0,
        unresolvedVotes: 0,
        status: 'pending'
      },
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
    }
  ],
  verifications: [
    {
      id: 'ver-1',
      issueId: 'ISS-1040',
      userId: 'u-citizen-1',
      vote: 'resolved',
      comment: 'Bin area is spotless now. Great job!',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ],
  notifications: [
    {
      id: 'notif-1',
      userId: 'u-citizen-1',
      title: 'Issue Status Updated',
      message: 'Your reported issue "Overflowing Garbage Bin at Central Park" has been marked as Resolved. Please verify.',
      type: 'verification_requested',
      read: false,
      issueId: 'ISS-1040',
      createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'notif-2',
      userId: 'u-citizen-1',
      title: 'Issue Assigned',
      message: 'Your issue "Broken Street Light Near Lincoln Elementary" was assigned to Electrical Department.',
      type: 'assigned',
      read: true,
      issueId: 'ISS-1042',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ]
};

function readDb() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      writeDb(initialData);
      return initialData;
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading DB, resetting to default:', err);
    writeDb(initialData);
    return initialData;
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing DB:', err);
  }
}

module.exports = {
  getDb: () => readDb(),
  saveDb: (data) => writeDb(data)
};
