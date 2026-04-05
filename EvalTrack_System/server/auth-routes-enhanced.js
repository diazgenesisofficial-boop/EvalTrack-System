/**
 * Backend Authentication Routes for Student Auth System
 * Add these routes to your Express server (index.js)
 * 
 * Required dependencies:
 * - bcrypt (for password hashing)
 * - jsonwebtoken (already used)
 * - crypto (built-in, for tokens)
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Password hashing config
const SALT_ROUNDS = 12;

// ─────────────────────────────────────────────────────────
// SQL MIGRATION (run this on your database)
// ─────────────────────────────────────────────────────────

/*
-- Add password and auth columns to users table
ALTER TABLE users 
ADD COLUMN password_hash VARCHAR(255) NULL AFTER email,
ADD COLUMN google_uid VARCHAR(255) NULL AFTER password_hash,
ADD COLUMN has_password BOOLEAN DEFAULT FALSE,
ADD COLUMN is_google_only BOOLEAN DEFAULT FALSE,
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN verification_token VARCHAR(255) NULL,
ADD COLUMN reset_token VARCHAR(255) NULL,
ADD COLUMN reset_token_expires DATETIME NULL,
ADD COLUMN linked_google BOOLEAN DEFAULT FALSE,
ADD INDEX idx_google_uid (google_uid),
ADD INDEX idx_verification_token (verification_token),
ADD INDEX idx_reset_token (reset_token);

-- Create password_resets table for tracking
CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_token (token)
);

-- Create account_links table for tracking Google links
CREATE TABLE IF NOT EXISTS account_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  google_uid VARCHAR(255) NOT NULL,
  linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_google_uid (google_uid)
);
*/

// ─────────────────────────────────────────────────────────
// ENHANCED LOGIN ROUTE (Replace existing /api/auth/login)
// ─────────────────────────────────────────────────────────

app.post('/api/auth/login', async (req, res) => {
  const { email, password, isGoogleLogin, googleUid, role } = req.body;
  
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  
  try {
    // Find user by email
    const [users] = await db.promise().query(
      'SELECT * FROM users WHERE email = ? AND role = ?',
      [email, role || 'student']
    );
    
    const user = users[0];
    
    // GOOGLE LOGIN FLOW
    if (isGoogleLogin) {
      if (!user) {
        // New user - needs registration
        return res.status(404).json({ 
          success: false, 
          message: 'User not found',
          needsRegistration: true 
        });
      }
      
      // Check if Google UID matches or if we need to link
      if (user.google_uid && user.google_uid === googleUid) {
        // Google UID matches - login successful
        const token = jwt.sign(
          { userId: user.id, email: user.email, role: user.role },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        return res.json({
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            program: user.program,
            year_level: user.year_level
          },
          token
        });
      }
      
      // User exists but no Google UID or different UID
      if (!user.google_uid) {
        // Offer to link accounts
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists. Would you like to link your Google account?',
          accountExists: true,
          googleUid: googleUid,
          email: email
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Google account does not match our records'
      });
    }
    
    // EMAIL/PASSWORD LOGIN FLOW
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check if user has password set
    if (!user.password_hash) {
      // User exists but only has Google auth
      if (user.google_uid) {
        return res.status(409).json({
          success: false,
          message: 'This account uses Google sign-in. Please use Google to login or set a password.',
          requiresGoogleLink: true,
          googleUid: user.google_uid
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check if email is verified (for students)
    if (user.role === 'student' && !user.email_verified && user.is_google_only === false) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
        requiresVerification: true,
        email: user.email
      });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        program: user.program,
        year_level: user.year_level
      },
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// ─────────────────────────────────────────────────────────
// ENHANCED REGISTRATION ROUTE
// ─────────────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  const { id, name, email, password, program, year_level, contact_number, role, googleUid, photoURL } = req.body;
  
  if (!id || !name || !email || !program || !year_level) {
    return res.status(400).json({
      success: false,
      message: 'Student ID, name, email, program, and year level are required'
    });
  }
  
  try {
    // Check if user already exists
    const [existingUsers] = await db.promise().query(
      'SELECT * FROM users WHERE email = ? OR id = ?',
      [email, id]
    );
    
    if (existingUsers.length > 0) {
      const existing = existingUsers[0];
      
      // If coming from Google and account exists
      if (googleUid && existing.email === email) {
        if (existing.google_uid === googleUid) {
          // Already linked - should have logged in instead
          return res.status(409).json({
            success: false,
            message: 'Account already exists and is linked to this Google account',
            accountExists: true,
            alreadyLinked: true
          });
        }
        
        // Account exists but not linked to this Google account
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists',
          accountExists: true,
          email: email,
          googleUid: googleUid
        });
      }
      
      return res.status(409).json({
        success: false,
        message: existing.id === id ? 
          'Student ID already registered' : 
          'Email address already registered'
      });
    }
    
    // Hash password if provided
    let passwordHash = null;
    let hasPassword = false;
    
    if (password && password.length >= 8) {
      passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      hasPassword = true;
    }
    
    // Determine auth type
    const isGoogleOnly = googleUid && !password;
    const emailVerified = !!googleUid; // Auto-verify if using Google
    
    // Generate verification token for email-only registrations
    let verificationToken = null;
    if (!googleUid && password) {
      verificationToken = crypto.randomBytes(32).toString('hex');
    }
    
    // Insert new user
    const [result] = await db.promise().query(
      `INSERT INTO users 
       (id, name, email, role, program, year_level, contact_number, 
        password_hash, google_uid, has_password, is_google_only, email_verified, verification_token, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        id, name, email, role || 'student', program, year_level, contact_number || null,
        passwordHash, googleUid || null, hasPassword, isGoogleOnly, emailVerified, verificationToken
      ]
    );
    
    // If Google UID provided, also add to account_links
    if (googleUid) {
      await db.promise().query(
        'INSERT INTO account_links (user_id, google_uid) VALUES (?, ?)',
        [result.insertId, googleUid]
      );
    }
    
    // If email verification required, send email
    if (verificationToken) {
      // TODO: Implement email sending
      // await sendVerificationEmail(email, verificationToken);
      
      return res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        requiresEmailVerification: true,
        email: email
      });
    }
    
    // Generate token for auto-login
    const token = jwt.sign(
      { userId: result.insertId, email, role: role || 'student' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: id,
        name: name,
        email: email,
        role: role || 'student',
        program: program,
        year_level: year_level
      },
      token
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// ─────────────────────────────────────────────────────────
// LINK GOOGLE ACCOUNT TO EXISTING ACCOUNT
// ─────────────────────────────────────────────────────────

app.post('/api/auth/link-account', async (req, res) => {
  const { email, googleUid, password } = req.body;
  
  if (!email || !googleUid) {
    return res.status(400).json({
      success: false,
      message: 'Email and Google UID are required'
    });
  }
  
  try {
    // Find existing user
    const [users] = await db.promise().query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }
    
    const user = users[0];
    
    // Verify ownership via password
    if (password) {
      if (!user.password_hash) {
        return res.status(400).json({
          success: false,
          message: 'This account does not have a password set. Use email verification instead.'
        });
      }
      
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      
      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password'
        });
      }
    }
    
    // Check if Google UID already linked to another account
    const [existingGoogle] = await db.promise().query(
      'SELECT * FROM users WHERE google_uid = ? AND id != ?',
      [googleUid, user.id]
    );
    
    if (existingGoogle.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'This Google account is already linked to another user'
      });
    }
    
    // Update user with Google UID
    await db.promise().query(
      `UPDATE users 
       SET google_uid = ?, linked_google = TRUE, is_google_only = FALSE 
       WHERE id = ?`,
      [googleUid, user.id]
    );
    
    // Add to account_links
    await db.promise().query(
      'INSERT INTO account_links (user_id, google_uid) VALUES (?, ?) ON DUPLICATE KEY UPDATE linked_at = NOW()',
      [user.id, googleUid]
    );
    
    // Generate token for auto-login
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: 'Accounts linked successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        program: user.program,
        year_level: user.year_level
      },
      token
    });
    
  } catch (error) {
    console.error('Link account error:', error);
    res.status(500).json({ success: false, message: 'Server error linking accounts' });
  }
});

// ─────────────────────────────────────────────────────────
// SET/UPDATE PASSWORD (for Google-only accounts)
// ─────────────────────────────────────────────────────────

app.post('/api/auth/set-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.userId;
  
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 8 characters long'
    });
  }
  
  try {
    // Get current user
    const [users] = await db.promise().query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const user = users[0];
    
    // If user has existing password, verify current password
    if (user.password_hash && currentPassword) {
      const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      }
    }
    
    // Hash and update password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    await db.promise().query(
      'UPDATE users SET password_hash = ?, has_password = TRUE, is_google_only = FALSE WHERE id = ?',
      [passwordHash, userId]
    );
    
    res.json({ success: true, message: 'Password updated successfully' });
    
  } catch (error) {
    console.error('Set password error:', error);
    res.status(500).json({ success: false, message: 'Server error updating password' });
  }
});

// ─────────────────────────────────────────────────────────
// FORGOT PASSWORD - REQUEST RESET
// ─────────────────────────────────────────────────────────

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email, role } = req.body;
  
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  
  try {
    // Find user
    const [users] = await db.promise().query(
      'SELECT * FROM users WHERE email = ? AND role = ?',
      [email, role || 'student']
    );
    
    // Always return success to prevent email enumeration
    if (users.length === 0) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link'
      });
    }
    
    const user = users[0];
    
    // Can't reset password for Google-only accounts without password
    if (!user.password_hash && user.google_uid) {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google sign-in. Please use Google to login or contact support.'
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    // Store in password_resets table
    await db.promise().query(
      'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)',
      [email, resetToken, expiresAt]
    );
    
    // Also update user record
    await db.promise().query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [resetToken, expiresAt, user.id]
    );
    
    // TODO: Send reset email
    // await sendPasswordResetEmail(email, resetToken);
    
    res.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link',
      // Only include token in development
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error processing request' });
  }
});

// ─────────────────────────────────────────────────────────
// RESET PASSWORD WITH TOKEN
// ─────────────────────────────────────────────────────────

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Reset token and new password are required'
    });
  }
  
  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters long'
    });
  }
  
  try {
    // Find valid reset token
    const [resets] = await db.promise().query(
      'SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()',
      [token]
    );
    
    if (resets.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }
    
    const reset = resets[0];
    
    // Find user
    const [users] = await db.promise().query(
      'SELECT * FROM users WHERE email = ?',
      [reset.email]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const user = users[0];
    
    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    // Update password
    await db.promise().query(
      'UPDATE users SET password_hash = ?, has_password = TRUE, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [passwordHash, user.id]
    );
    
    // Delete used reset token
    await db.promise().query(
      'DELETE FROM password_resets WHERE token = ?',
      [token]
    );
    
    res.json({ success: true, message: 'Password reset successful' });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error resetting password' });
  }
});

// ─────────────────────────────────────────────────────────
// VERIFY EMAIL
// ─────────────────────────────────────────────────────────

app.get('/api/auth/verify-email', async (req, res) => {
  const { token } = req.query;
  
  if (!token) {
    return res.status(400).json({ success: false, message: 'Verification token is required' });
  }
  
  try {
    // Find user with this verification token
    const [users] = await db.promise().query(
      'SELECT * FROM users WHERE verification_token = ?',
      [token]
    );
    
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }
    
    const user = users[0];
    
    // Mark email as verified
    await db.promise().query(
      'UPDATE users SET email_verified = TRUE, verification_token = NULL WHERE id = ?',
      [user.id]
    );
    
    // Redirect to login page with success message
    res.redirect('/LoginPage/login.html?verified=true');
    
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ success: false, message: 'Server error verifying email' });
  }
});

// ─────────────────────────────────────────────────────────
// RESEND VERIFICATION EMAIL
// ─────────────────────────────────────────────────────────

app.post('/api/auth/resend-verification', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  
  try {
    const [users] = await db.promise().query(
      'SELECT * FROM users WHERE email = ? AND email_verified = FALSE',
      [email]
    );
    
    if (users.length === 0) {
      return res.json({
        success: true,
        message: 'If an unverified account exists, a verification email will be sent'
      });
    }
    
    const user = users[0];
    
    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    await db.promise().query(
      'UPDATE users SET verification_token = ? WHERE id = ?',
      [verificationToken, user.id]
    );
    
    // TODO: Send verification email
    // await sendVerificationEmail(email, verificationToken);
    
    res.json({
      success: true,
      message: 'Verification email sent'
    });
    
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────
// SEND LINK VERIFICATION EMAIL (for account linking)
// ─────────────────────────────────────────────────────────

app.post('/api/auth/send-link-verification', async (req, res) => {
  const { email, googleUid } = req.body;
  
  if (!email || !googleUid) {
    return res.status(400).json({
      success: false,
      message: 'Email and Google UID are required'
    });
  }
  
  try {
    // Find existing user
    const [users] = await db.promise().query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }
    
    // Generate link verification token
    const linkToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Store pending link (you might want a separate table for this)
    await db.promise().query(
      `INSERT INTO pending_google_links (email, google_uid, token, expires_at) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE google_uid = ?, token = ?, expires_at = ?`,
      [email, googleUid, linkToken, expiresAt, googleUid, linkToken, expiresAt]
    );
    
    // TODO: Send link verification email
    // await sendLinkVerificationEmail(email, linkToken);
    
    res.json({
      success: true,
      message: 'Verification email sent. Please check your inbox.'
    });
    
  } catch (error) {
    console.error('Send link verification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
