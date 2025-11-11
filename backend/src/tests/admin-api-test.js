/**
 * Admin API Test Script
 * 
 * This script tests the new admin APIs for the conflict management system.
 * It can be run with Node.js to verify the functionality of the APIs.
 * 
 * Usage: node admin-api-test.js
 */

const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:5000/api';
let authToken = '';
let testCaseId = '';

// Test admin user credentials
const adminCredentials = {
  email: 'admin@test.com',
  password: 'password123'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

// Helper function to log success
const logSuccess = (message) => {
  console.log(`${colors.green}✓ ${message}${colors.reset}`);
};

// Helper function to log error
const logError = (message, error) => {
  console.error(`${colors.red}✗ ${message}${colors.reset}`);
  if (error) {
    console.error(`  ${colors.red}Error: ${error.message || JSON.stringify(error)}${colors.reset}`);
  }
};

// Helper function to log info
const logInfo = (message) => {
  console.log(`${colors.blue}ℹ ${message}${colors.reset}`);
};

// Helper function to log section
const logSection = (message) => {
  console.log(`\n${colors.bright}${colors.yellow}=== ${message} ===${colors.reset}\n`);
};

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Set auth token for subsequent requests
const setAuthToken = (token) => {
  authToken = token;
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Test admin login
const testAdminLogin = async () => {
  try {
    logSection('Testing Admin Login');
    const response = await api.post('/admin/auth/login', adminCredentials);
    
    if (response.data.status === 'success' && response.data.data.token) {
      setAuthToken(response.data.data.token);
      logSuccess('Admin login successful');
      return true;
    } else {
      logError('Admin login failed', { message: 'No token received' });
      return false;
    }
  } catch (error) {
    logError('Admin login failed', error.response?.data || error);
    return false;
  }
};

// Test getting all cases with party details
const testGetAllCases = async () => {
  try {
    logSection('Testing Get All Cases with Party Details');
    const response = await api.get('/admin/cases');
    
    if (response.data.status === 'success' && response.data.data.cases) {
      logSuccess(`Retrieved ${response.data.data.cases.length} cases`);
      
      // If we have cases, save the first one's ID for later tests
      if (response.data.data.cases.length > 0) {
        testCaseId = response.data.data.cases[0]._id;
        logInfo(`Using case ID: ${testCaseId} for further tests`);
      }
      
      return true;
    } else {
      logError('Failed to retrieve cases', { message: 'Invalid response format' });
      return false;
    }
  } catch (error) {
    logError('Failed to retrieve cases', error.response?.data || error);
    return false;
  }
};

// Test getting detailed case information
const testGetCaseDetails = async () => {
  if (!testCaseId) {
    logError('Cannot test case details - no case ID available');
    return false;
  }
  
  try {
    logSection('Testing Get Case with Party Details');
    const response = await api.get(`/admin/cases/${testCaseId}/detailed`);
    
    if (response.data.status === 'success' && response.data.data.case) {
      logSuccess('Retrieved detailed case information');
      logInfo(`Case title: ${response.data.data.case.title}`);
      logInfo(`Party A data available: ${response.data.data.partyA ? 'Yes' : 'No'}`);
      logInfo(`Party B data available: ${response.data.data.partyB ? 'Yes' : 'No'}`);
      return true;
    } else {
      logError('Failed to retrieve case details', { message: 'Invalid response format' });
      return false;
    }
  } catch (error) {
    logError('Failed to retrieve case details', error.response?.data || error);
    return false;
  }
};

// Test adding a note to a case
const testAddCaseNote = async () => {
  if (!testCaseId) {
    logError('Cannot test adding note - no case ID available');
    return false;
  }
  
  try {
    logSection('Testing Add Case Note');
    const noteData = {
      content: 'This is a test note from the API test script',
      noteType: 'Test'
    };
    
    const response = await api.post(`/admin/cases/${testCaseId}/notes`, noteData);
    
    if (response.data.status === 'success' && response.data.data.addedNote) {
      logSuccess('Added note to case');
      logInfo(`Note content: ${response.data.data.addedNote.content}`);
      return true;
    } else {
      logError('Failed to add note to case', { message: 'Invalid response format' });
      return false;
    }
  } catch (error) {
    logError('Failed to add note to case', error.response?.data || error);
    return false;
  }
};

// Test updating case status
const testUpdateCaseStatus = async () => {
  if (!testCaseId) {
    logError('Cannot test updating status - no case ID available');
    return false;
  }
  
  try {
    logSection('Testing Update Case Status');
    const statusData = {
      status: 'in_progress',
      adminFeedback: 'Case is now being processed',
      nextSteps: 'Schedule a meeting with both parties'
    };
    
    const response = await api.patch(`/admin/cases/${testCaseId}/status`, statusData);
    
    if (response.data.status === 'success' && response.data.data.case) {
      logSuccess('Updated case status');
      logInfo(`New status: ${response.data.data.case.status}`);
      return true;
    } else {
      logError('Failed to update case status', { message: 'Invalid response format' });
      return false;
    }
  } catch (error) {
    logError('Failed to update case status', error.response?.data || error);
    return false;
  }
};

// Test scheduling a meeting
const testScheduleMeeting = async () => {
  if (!testCaseId) {
    logError('Cannot test scheduling meeting - no case ID available');
    return false;
  }
  
  try {
    logSection('Testing Schedule Meeting');
    const meetingData = {
      title: 'Test Meeting',
      description: 'This is a test meeting scheduled via the API test script',
      caseId: testCaseId,
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      duration: 60,
      meetingType: 'video',
      meetingLink: 'https://meet.google.com/test-meeting',
      includeParties: true,
      notes: 'This is a test meeting'
    };
    
    const response = await api.post('/admin/meetings', meetingData);
    
    if (response.data.status === 'success' && response.data.data.meeting) {
      logSuccess('Scheduled meeting');
      logInfo(`Meeting title: ${response.data.data.meeting.title}`);
      logInfo(`Scheduled date: ${new Date(response.data.data.meeting.scheduledDate).toLocaleString()}`);
      return true;
    } else {
      logError('Failed to schedule meeting', { message: 'Invalid response format' });
      return false;
    }
  } catch (error) {
    logError('Failed to schedule meeting', error.response?.data || error);
    return false;
  }
};

// Run all tests
const runTests = async () => {
  console.log(`${colors.bright}${colors.blue}ADMIN API TEST SCRIPT${colors.reset}`);
  console.log(`${colors.blue}Testing against: ${API_URL}${colors.reset}\n`);
  
  // Login first
  const loginSuccess = await testAdminLogin();
  if (!loginSuccess) {
    console.log(`\n${colors.red}${colors.bright}Cannot proceed with tests - login failed${colors.reset}`);
    return;
  }
  
  // Run the tests
  await testGetAllCases();
  await testGetCaseDetails();
  await testAddCaseNote();
  await testUpdateCaseStatus();
  await testScheduleMeeting();
  
  console.log(`\n${colors.bright}${colors.blue}TEST SCRIPT COMPLETED${colors.reset}`);
};

// Run the tests
runTests().catch(error => {
  console.error(`${colors.red}${colors.bright}Unhandled error in test script:${colors.reset}`, error);
});