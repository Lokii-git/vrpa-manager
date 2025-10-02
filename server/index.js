require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ensure data directory exists
async function ensureDataDirectory() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Helper function to read JSON file
async function readJSONFile(filename) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array or default value
    if (error.code === 'ENOENT') {
      return filename === 'email-template.json' ? '' : [];
    }
    throw error;
  }
}

// Helper function to write JSON file
async function writeJSONFile(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// ==================== AUTHENTICATION ENDPOINTS ====================

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Read users file
    const users = await readJSONFile('users.json');
    const user = users.find(u => u.username === username);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token endpoint
app.get('/api/auth/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Change password endpoint
app.post('/api/auth/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const users = await readJSONFile('users.json');
    const user = users.find(u => u.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    user.password = hashedPassword;
    user.updatedAt = new Date().toISOString();
    
    await writeJSONFile('users.json', users);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// ==================== DEVICES ENDPOINTS ====================

// Get all devices (protected)
app.get('/api/devices', authMiddleware, async (req, res) => {
  try {
    const devices = await readJSONFile('devices.json');
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read devices' });
  }
});

// Add device
app.post('/api/devices', authMiddleware, async (req, res) => {
  try {
    const devices = await readJSONFile('devices.json');
    const newDevice = {
      ...req.body,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    devices.push(newDevice);
    await writeJSONFile('devices.json', devices);
    res.status(201).json(newDevice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create device' });
  }
});

// Update device
app.put('/api/devices/:id', authMiddleware, async (req, res) => {
  try {
    const devices = await readJSONFile('devices.json');
    const index = devices.findIndex(d => d.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    devices[index] = {
      ...devices[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await writeJSONFile('devices.json', devices);
    res.json(devices[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update device' });
  }
});

// Delete device
app.delete('/api/devices/:id', authMiddleware, async (req, res) => {
  try {
    const devices = await readJSONFile('devices.json');
    const filtered = devices.filter(d => d.id !== req.params.id);
    
    if (devices.length === filtered.length) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    await writeJSONFile('devices.json', filtered);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete device' });
  }
});

// ==================== TEAM MEMBERS ENDPOINTS ====================

// Get all team members
app.get('/api/team-members', authMiddleware, async (req, res) => {
  try {
    const members = await readJSONFile('team-members.json');
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read team members' });
  }
});

// Add team member
app.post('/api/team-members', authMiddleware, async (req, res) => {
  try {
    const members = await readJSONFile('team-members.json');
    const newMember = {
      ...req.body,
      id: uuidv4()
    };
    members.push(newMember);
    await writeJSONFile('team-members.json', members);
    res.status(201).json(newMember);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create team member' });
  }
});

// Update team member
app.put('/api/team-members/:id', authMiddleware, async (req, res) => {
  try {
    const members = await readJSONFile('team-members.json');
    const index = members.findIndex(m => m.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    
    members[index] = {
      ...members[index],
      ...req.body
    };
    
    await writeJSONFile('team-members.json', members);
    res.json(members[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update team member' });
  }
});

// Delete team member
app.delete('/api/team-members/:id', authMiddleware, async (req, res) => {
  try {
    const members = await readJSONFile('team-members.json');
    const filtered = members.filter(m => m.id !== req.params.id);
    
    if (members.length === filtered.length) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    
    await writeJSONFile('team-members.json', filtered);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete team member' });
  }
});

// ==================== PING HISTORY ENDPOINTS ====================

// Get ping history (optional: filter by deviceId)
app.get('/api/ping-history', authMiddleware, async (req, res) => {
  try {
    let history = await readJSONFile('ping-history.json');
    
    if (req.query.deviceId) {
      history = history.filter(p => p.deviceId === req.query.deviceId);
    }
    
    if (req.query.days) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(req.query.days));
      history = history.filter(p => new Date(p.timestamp) >= daysAgo);
    }
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read ping history' });
  }
});

// Add ping record
app.post('/api/ping-history', authMiddleware, async (req, res) => {
  try {
    const history = await readJSONFile('ping-history.json');
    const newRecord = {
      ...req.body,
      timestamp: new Date().toISOString()
    };
    history.push(newRecord);
    
    // Keep only last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const filtered = history.filter(p => new Date(p.timestamp) >= thirtyDaysAgo);
    
    await writeJSONFile('ping-history.json', filtered);
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ping record' });
  }
});

// ==================== EMAIL TEMPLATE ENDPOINTS ====================

// Get email template
app.get('/api/email-template', authMiddleware, async (req, res) => {
  try {
    const template = await readJSONFile('email-template.json');
    res.json({ template });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read email template' });
  }
});

// Update email template
app.put('/api/email-template', authMiddleware, async (req, res) => {
  try {
    await writeJSONFile('email-template.json', req.body.template);
    res.json({ template: req.body.template });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update email template' });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== START SERVER ====================

async function startServer() {
  await ensureDataDirectory();
  
  // Initialize default data files if they don't exist
  try {
    await readJSONFile('devices.json');
  } catch {
    await writeJSONFile('devices.json', []);
  }
  
  try {
    await readJSONFile('team-members.json');
  } catch {
    await writeJSONFile('team-members.json', [
      { id: uuidv4(), name: 'John Smith', email: 'john.smith@company.com' },
      { id: uuidv4(), name: 'Sarah Johnson', email: 'sarah.johnson@company.com' },
      { id: uuidv4(), name: 'Mike Chen', email: 'mike.chen@company.com' },
      { id: uuidv4(), name: 'Emily Davis', email: 'emily.davis@company.com' }
    ]);
  }
  
  try {
    await readJSONFile('ping-history.json');
  } catch {
    await writeJSONFile('ping-history.json', []);
  }
  
  try {
    await readJSONFile('email-template.json');
  } catch {
    // Read from vRPAemail.md as default
    const defaultTemplate = await fs.readFile(path.join(__dirname, '..', 'vRPAemail.md'), 'utf8');
    await writeJSONFile('email-template.json', defaultTemplate);
  }
  
  // Initialize users.json with default admin user if it doesn't exist
  try {
    await readJSONFile('users.json');
  } catch {
    const defaultPassword = 'admin';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const adminUser = {
      id: uuidv4(),
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date().toISOString()
    };
    await writeJSONFile('users.json', [adminUser]);
    console.log('='.repeat(60));
    console.log('⚠️  INITIAL ADMIN USER CREATED');
    console.log('='.repeat(60));
    console.log('Username: admin');
    console.log('Password: admin');
    console.log('⚠️  IMPORTANT: Change this password immediately after first login!');
    console.log('='.repeat(60));
  }
  
  app.listen(PORT, () => {
    console.log(`✅ vRPA Manager Server running on port ${PORT}`);
    console.log(`📁 Data directory: ${DATA_DIR}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
  });
}

startServer().catch(console.error);
